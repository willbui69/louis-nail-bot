import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { supabase } from './supabaseClient'

dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string
const CHAT_ID = process.env.TELEGRAM_CHAT_ID as string

// 🇩🇪 Dienstleistungsnamen auf Deutsch
const serviceNameMap: Record<string, string> = {
  'glitter-new': 'Mit Glitzer/Farbe/Gel',
  'glitter-refill': 'Mit Glitzer/Farbe/Gel (Auffüllen)',
  'manicure': 'Maniküre',
  'natural-tip-new': 'Natürliche Spitzen',
  'natural-tip-refill': 'Natürliche Spitzen (Auffüllen)',
  'ombre-new': 'Ombre (Babyboomer)',
  'ombre-refill': 'Ombre (Auffüllen)',
  'pedicure': 'Pediküre',
  'pedicure-shellac': 'Pediküre mit Shellac',
  'pink-white-new': 'Pink & Weiß',
  'pink-white-refill': 'Pink & Weiß (Auffüllen)',
  'shellac-manicure': 'Shellac mit Maniküre',
  'shellac-removal': 'Shellac Entfernung',
}

type TelegramAPIResponse = {
  ok: boolean
  result?: any
  description?: string
  error_code?: number
}

export async function notifyTelegram(booking: any) {
  const bookingId = booking.id

  // ⬇️ Hole die zugehörigen Dienstleistungen
  const { data: bookingServices, error } = await supabase
    .from('booking_services')
    .select('service_id')
    .eq('booking_id', bookingId)

  if (error || !bookingServices) {
    console.error('❌ Fehler beim Abrufen der Dienstleistungen:', error)
    return
  }

  // ✍️ Formatierte Namen
  const serviceNames = bookingServices.map(bs =>
    serviceNameMap[bs.service_id] || bs.service_id
  )

  const formattedServices = serviceNames.length
    ? serviceNames.map(name => `• ${name}`).join('\n')
    : 'Nicht angegeben'

  // 📅 Format: YYYY-MM-DD
  const bookedDate = booking.created_at
    ? new Date(booking.created_at).toISOString().split('T')[0]
    : 'Nicht verfügbar'

  // 📩 Nachricht auf Deutsch
  const message = `
🔔 *Neue Buchung!*

🛎 *Dienstleistungen:*
${formattedServices}

👩‍💼 *Mitarbeiter:* ${booking.staff_id}
📅 *Datum:* ${booking.booking_date}
⏰ *Uhrzeit:* ${booking.booking_time}

👤 *Kunde:* ${booking.customer_name}
📧 *E-Mail:* ${booking.customer_email || 'Nicht angegeben'}
📞 *Telefon:* ${booking.customer_phone}

💬 *Besondere Wünsche:* ${booking.special_requests || 'Keine'}
💰 *Preis:* €${booking.total_price}

🕒 *Gebucht am:* ${bookedDate}
`.trim()

  console.log('📨 Sende Nachricht an Telegram...')
  console.log('➡️ Nachricht:\n', message)

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  })

  const data = (await response.json()) as TelegramAPIResponse

  if (data.ok) {
    console.log('✅ Telegram-Nachricht gesendet!')
  } else {
    console.error('❌ Fehler beim Senden an Telegram:', data.description)
  }
}
