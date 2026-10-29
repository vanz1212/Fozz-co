/**
 * FOZZ.CO - Supabase Connection & Health Check Script
 * Run with: npm run test:supabase
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Auto-load .env file if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://omwjweeudimxisqffiki.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

console.log('--------------------------------------------------');
console.log('⚡ FOZZ.CO - Supabase Health & Connection Diagnostic');
console.log('--------------------------------------------------');
console.log(`Endpoint URL : ${SUPABASE_URL}`);

// Prioritize secret key for testing, fallback to publishable key
const clientKey = SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY;
if (!clientKey) {
  console.error('❌ Tidak ada API Key ditemukan di .env!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, clientKey);
const TABLES = ['users', 'products', 'product_sizes', 'orders', 'order_items', 'returns'];

async function checkDatabase() {
  console.log('\n[1] Memeriksa keberadaan tabel di Supabase...');
  let missingTables = [];
  let existingTables = [];

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);

      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          missingTables.push(table);
          console.log(`  ❌ Tabel '${table}' belum dibuat.`);
        } else {
          console.log(`  ⚠️  Tabel '${table}': ${error.message}`);
        }
      } else {
        existingTables.push(table);
        console.log(`  ✅ Tabel '${table}' AKTIF! (${data.length} baris terdeteksi)`);
      }
    } catch (err) {
      console.log(`  ❌ Gagal query tabel '${table}': ${err.message}`);
    }
  }

  console.log('\n--------------------------------------------------');
  if (missingTables.length > 0) {
    console.log('⚠️  STATUS: Tabel belum lengkap di Supabase Database.');
    console.log('Jalankan file supabase_schema.sql di Supabase SQL Editor.');
  } else {
    console.log('🎉 SEMUA TABEL AKTIF DAN TERHUBUNG DENGAN SUKSES!');
    console.log('Supabase cloud database siap digunakan untuk FOZZ.CO.');
  }
  console.log('--------------------------------------------------\n');
}

checkDatabase().catch(err => {
  console.error('Fatal error saat memeriksa Supabase:', err);
});
