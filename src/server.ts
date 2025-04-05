import express from 'express'
import { supabase } from './supabaseClient'
import { notifyTelegram } from './notifyTelegram'
import { appendBookingToGoogleSheet } from './appendBookingToGoogleSheet'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('👋 Louis Telegram Bot is running!')
})

console.log('📡 Listening for new booking services...')

// Track pending booking notifications to avoid duplicates
const pendingNotifications = new Set<string>()

// Supabase realtime listener
supabase
  .channel('booking-services-listener')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'booking_services',
    },
    async (payload: RealtimePostgresInsertPayload<any>) => {
      const bookingId = payload.new.booking_id

      // Skip if this booking is already pending
      if (pendingNotifications.has(bookingId)) return

      pendingNotifications.add(bookingId)
      console.log('🧩 Service added for booking:', bookingId)

      // Wait 1 minute to allow all services to be inserted
      setTimeout(async () => {
        console.log(`🔎 Fetching booking details for ID: ${bookingId}`)

        const { data: booking, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (error || !booking) {
          console.error('❌ Failed to fetch booking:', error)
          pendingNotifications.delete(bookingId)
          return
        }

        if (booking.notified) {
          console.log('⚠️ Booking already notified. Skipping.')
          pendingNotifications.delete(bookingId)
          return
        }

        await notifyTelegram(booking)

        await appendBookingToGoogleSheet(booking)

        const { error: updateError } = await supabase
          .from('bookings')
          .update({ notified: true })
          .eq('id', bookingId)

        if (updateError) {
          console.error('❌ Failed to mark booking as notified:', updateError)
        } else {
          console.log('✅ Booking marked as notified.')
        }

        pendingNotifications.delete(bookingId)
      }, 10000) // 1 minute
    }
  )
  .subscribe()

app.listen(port, () => {
  console.log(`🚀 Bot Web Server is running at http://localhost:${port}`)
})
