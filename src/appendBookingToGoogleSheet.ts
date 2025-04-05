import { google } from 'googleapis'
import path from 'path'
import { JWT } from 'google-auth-library'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID as string
const SHEET_NAME = 'Bookings' // your tab name
const SERVICE_ACCOUNT_KEY_PATH = path.join(__dirname, '../google-service-account.json')

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

export async function appendBookingToGoogleSheet(booking: any) {
  const client = await auth.getClient() as JWT
  const sheets = google.sheets({ version: 'v4', auth: client })

  const values = [[
    booking.id,
    booking.customer_name || 'N/A',
    booking.customer_phone || 'N/A',
    booking.customer_email || 'N/A',
    booking.staff_id || 'N/A',
    booking.booking_date || 'N/A',
    booking.booking_time || 'N/A',
    booking.total_price || 'N/A',
    booking.created_at ? new Date(booking.created_at).toISOString().split('T')[0] : 'N/A',
  ]]

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME, // ✅ Just sheet name
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', // ✅ Ensure rows are added properly
      requestBody: { values },
    })

    console.log(`📄 Booking appended to Google Sheet: ${booking.id}`)
  } catch (error) {
    console.error('❌ Failed to append to Google Sheet:', error)
  }
}
