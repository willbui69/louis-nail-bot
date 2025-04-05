"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheets = void 0;
const googleapis_1 = require("googleapis");
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const client = new googleapis_1.google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
exports.sheets = googleapis_1.google.sheets({ version: 'v4', auth: client });
