import { supabase } from './supabaseClient'
import { notifyTelegram } from './notifyTelegram'

console.log('📡 Listening for new bookings...')

const channel = supabase
  .channel('booking-listener')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'bookings',
    },
    async (payload) => {
      console.log('🔔 New booking received:', payload.new)
      await notifyTelegram(payload.new)
    }
  )
  .subscribe()

process.on('SIGINT', async () => {
  console.log('👋 Shutting down...')
  await supabase.removeChannel(channel)
  process.exit()
})
