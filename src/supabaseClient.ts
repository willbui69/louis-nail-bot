import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
