import express from 'express'
import { supabase } from './supabaseClient'
import { notifyTelegram } from './notifyTelegram'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('👋 Louis Telegram Bot is running!')
})

// Keep listening to Supabase even in web mode
supabase
  .channel('booking-listener')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'bookings' },
    async (payload) => {
      console.log('🔔 New booking received:', payload.new)
      await notifyTelegram(payload.new)
    }
  )
  .subscribe()

app.listen(port, () => {
  console.log(`🚀 Bot Web Server is running at http://localhost:${port}`)
})
