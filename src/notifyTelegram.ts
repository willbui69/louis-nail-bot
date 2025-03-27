import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string
const CHAT_ID = process.env.TELEGRAM_CHAT_ID as string

// Mapping from service_id to human-readable service name
const serviceNameMap: Record<string, string> = {
  'glitter-new': 'With Glitter/Color/Gel',
  'glitter-refill': 'With Glitter/Color/Gel (Refill)',
  'manicure': 'Manicure',
  'natural-tip-new': 'Natural Tip',
  'natural-tip-refill': 'Natural Tip (Refill)',
  'ombre-new': 'Ombre (Baby Boomer)',
  'ombre-refill': 'Ombre (Baby Boomer) (Refill)',
  'pedicure': 'Pedicure',
  'pedicure-shellac': 'Pedicure with Shellac',
  'pink-white-new': 'Pink & White',
  'pink-white-refill': 'Pink & White (Refill)',
  'shellac-manicure': 'Shellac with Manicure',
  'shellac-removal': 'Shellac Removal',
}

// Define Telegram API response shape for type safety
type TelegramAPIResponse = {
  ok: boolean
  result?: any
  description?: string
  error_code?: number
}

export async function notifyTelegram(client: any) {
  const readableServiceName = serviceNameMap[client.service_id] || client.service_id

  const message = `
🔔 *New Booking Alert!*

🛎 *Service:* ${readableServiceName}
👩‍💼 *Staff:* ${client.staff_id}
📅 *Date:* ${client.booking_date}
⏰ *Time:* ${client.booking_time}

👤 *Customer:* ${client.customer_name}
📧 *Email:* ${client.customer_email || 'N/A'}
📞 *Phone:* ${client.customer_phone}

💬 *Special Requests:* ${client.special_requests || 'None'}
💰 *Price:* $${client.total_price}

🕒 *Booked at:* ${new Date(client.created_at).toLocaleString()}
`.trim()

  console.log('📨 Sending to Telegram...')
  console.log('➡️ Message:\n', message)

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

  console.log('✅ Telegram API Response:', data)

  if (!data.ok) {
    console.error('❌ Telegram send failed:', data.description)
  }
}
