import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON as string)

const client = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

export const sheets = google.sheets({ version: 'v4', auth: client })
