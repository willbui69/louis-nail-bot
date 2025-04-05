"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendBookingToGoogleSheet = appendBookingToGoogleSheet;
const googleapis_1 = require("googleapis");
// ✅ These should be set in Render's Environment Variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Bookings';
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
// ✅ Parse the service account credentials from env
const serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
async function appendBookingToGoogleSheet(booking) {
    const client = await auth.getClient();
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth: client });
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
        ]];
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values },
        });
        console.log(`📄 Booking appended to Google Sheet: ${booking.id}`);
    }
    catch (error) {
        console.error('❌ Failed to append to Google Sheet:', error);
    }
}
