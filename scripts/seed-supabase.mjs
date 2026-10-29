/**
 * FOZZ.CO - Supabase Seeding Script
 * Run with: npm run seed:supabase
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
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_SECRET_KEY) {
  console.error('❌ SUPABASE_SECRET_KEY atau SUPABASE_PUBLISHABLE_KEY tidak ditemukan di .env!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const SEED_USERS = [
  {
    id: "usr-admin-001",
    nama_lengkap: "Fozz System Master",
    email: "admin@fozz.co",
    password: "admin123",
    password_hash: "$2b$12$e9g0W.w6R3J6G2Z/JFOZZHQSecretMasterHashArgon2",
    role: "admin",
    no_telepon: "+62 811-9988-7711",
    alamat_default: "HQ Operations Jakarta",
    created_at: "2026-01-10T08:00:00Z"
  },
  {
    id: "usr-cust-001",
    nama_lengkap: "Ivan Pratama",
    email: "ivanpratama859@gmail.com",
    password: "user123",
    password_hash: "$2b$12$K89sP3jL9xX.uGfozzCustomerIvanSecureBcryptHash",
    role: "customer",
    no_telepon: "+62 812-3456-7890",
    alamat_default: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190",
    created_at: "2026-02-14T11:20:00Z"
  },
  {
    id: "usr-cust-002",
    nama_lengkap: "Maya Aurelia",
    email: "maya.aurelia@example.com",
    password: "user123",
    password_hash: "$2b$12$Y18qM8kJ2vP.aZfozzCustomerMayaSecureBcryptHash",
    role: "customer",
    no_telepon: "+62 857-1122-3344",
    alamat_default: "Jl. Dago Asri Blok B7, Coblong, Bandung 40135",
    created_at: "2026-03-01T15:45:00Z"
  }
];

const SEED_PRODUCTS = [
  {
    id: "prod-001",
    nama_produk: "Dark Washed Denim Jacket",
    deskripsi: "Premium 14.5oz Japanese Selvedge Denim dengan treatment vintage hand-distressed wash. Boxy oversized silhouette, custom engraved hardware matte gunmetal, dan lining katun herringbone halus. Stok terjamin real-time dengan Garansi Pas 7 Hari.",
    harga: 899000,
    kategori: "Outerwear",
    gambar_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-002",
    nama_produk: "Heavyweight Boxy Hoodie - Slate Black",
    deskripsi: "Bahan Katun Kelas Tertinggi 480 GSM French Terry Cotton organik dengan double-layered structured hood. Sangat lembut dan sejuk di kulit, dropped shoulders, kangaroo pocket tersembunyi, dan rib knit tebal tahan melar. Dilengkapi Garansi Pas 7 Hari.",
    harga: 649000,
    kategori: "Hoodie",
    gambar_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-003",
    nama_produk: "Tactical Cargo Pants - Olive Drab",
    deskripsi: "Ripstop Military Grade Cordura blend tahan sobek dengan water-repellent coating. 6 saku ergonomis, adjustable ankle bungee drawstring, dan artikulasi lutut untuk kenyamanan mobilitas urban harian. Dilengkapi Garansi Pas 7 Hari.",
    harga: 589000,
    kategori: "Pants",
    gambar_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-004",
    nama_produk: "Cyber Graphic Heavy Tee - Bone White",
    deskripsi: "Bahan Katun Kelas Tertinggi 235 GSM Combed Compact Cotton. Nyaman dan sejuk sepanjang hari dengan rib collar 3cm anti-melar. High-density screenprint grafis eksklusif di dada dan punggung. Stok terjamin real-time & Garansi Pas 7 Hari.",
    harga: 329000,
    kategori: "T-Shirt",
    gambar_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-005",
    nama_produk: "Technical Nylon Shell Windbreaker",
    deskripsi: "Ultra-lightweight 3-layer laminated nylon dengan waterproof zipper YKK Aquaguard. Ventilasi laser-cut di ketiak dan reflective subtle branding di tengkuk. Tahan angin dan hujan ringan, stok terjamin real-time.",
    harga: 749000,
    kategori: "Outerwear",
    gambar_url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-006",
    nama_produk: "Fozz Modular Crossbody Sling Bag",
    deskripsi: "Ballistic Nylon 1000D dengan buckle Fidlock magnetik buatan Jerman. Kompartemen internal terproteksi busa empuk untuk perlindungan aksesoris digital dan strap bahu modular ergonomis. Garansi Pas 7 Hari.",
    harga: 429000,
    kategori: "Accessories",
    gambar_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    status: "active"
  }
];

const SEED_PRODUCT_SIZES = [
  { id: "sz-001-s", product_id: "prod-001", ukuran: "S", stok: 4 },
  { id: "sz-001-m", product_id: "prod-001", ukuran: "M", stok: 8 },
  { id: "sz-001-l", product_id: "prod-001", ukuran: "L", stok: 6 },
  { id: "sz-001-xl", product_id: "prod-001", ukuran: "XL", stok: 2 },

  { id: "sz-002-s", product_id: "prod-002", ukuran: "S", stok: 5 },
  { id: "sz-002-m", product_id: "prod-002", ukuran: "M", stok: 12 },
  { id: "sz-002-l", product_id: "prod-002", ukuran: "L", stok: 9 },
  { id: "sz-002-xl", product_id: "prod-002", ukuran: "XL", stok: 3 },

  { id: "sz-003-28", product_id: "prod-003", ukuran: "28", stok: 3 },
  { id: "sz-003-30", product_id: "prod-003", ukuran: "30", stok: 7 },
  { id: "sz-003-32", product_id: "prod-003", ukuran: "32", stok: 6 },
  { id: "sz-003-34", product_id: "prod-003", ukuran: "34", stok: 1 },

  { id: "sz-004-s", product_id: "prod-004", ukuran: "S", stok: 10 },
  { id: "sz-004-m", product_id: "prod-004", ukuran: "M", stok: 18 },
  { id: "sz-004-l", product_id: "prod-004", ukuran: "L", stok: 14 },
  { id: "sz-004-xl", product_id: "prod-004", ukuran: "XL", stok: 5 },

  { id: "sz-005-m", product_id: "prod-005", ukuran: "M", stok: 4 },
  { id: "sz-005-l", product_id: "prod-005", ukuran: "L", stok: 5 },
  { id: "sz-005-xl", product_id: "prod-005", ukuran: "XL", stok: 2 },

  { id: "sz-006-all", product_id: "prod-006", ukuran: "ALL-SIZE", stok: 15 }
];

const SEED_ORDERS = [
  {
    id: "ord-882109",
    user_id: "usr-cust-001",
    total_harga: 919000,
    status_pesanan: "Shipped",
    alamat_pengiriman: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190",
    resi_pengiriman: "JP-88992144701",
    courier: "J&T Express Super",
    created_at: "2026-10-14T09:30:00Z"
  },
  {
    id: "ord-774012",
    user_id: "usr-cust-002",
    total_harga: 998000,
    status_pesanan: "Paid",
    alamat_pengiriman: "Jl. Dago Asri Blok B7, Coblong, Bandung 40135",
    resi_pengiriman: null,
    courier: "SiCepat BEST",
    created_at: "2026-10-15T14:10:00Z"
  }
];

const SEED_ORDER_ITEMS = [
  {
    id: "oi-001",
    order_id: "ord-882109",
    product_id: "prod-001",
    ukuran: "L",
    jumlah: 1,
    harga_satuan: 899000
  },
  {
    id: "oi-002",
    order_id: "ord-774012",
    product_id: "prod-002",
    ukuran: "M",
    jumlah: 1,
    harga_satuan: 649000
  },
  {
    id: "oi-003",
    order_id: "ord-774012",
    product_id: "prod-004",
    ukuran: "L",
    jumlah: 1,
    harga_satuan: 329000
  }
];

const SEED_RETURNS = [
  {
    id: "RMA-FOZZ-882109",
    order_id: "ord-882109",
    user_id: "usr-cust-001",
    product_id: "prod-001",
    product_name: "Dark Washed Denim Jacket",
    current_size: "L",
    request_type: "exchange_size",
    target_size: "M",
    reason: "Siluet bahu Size L terlalu drop. Minta tukar ke Size M.",
    condition_confirmed: true,
    video_unboxing_confirmed: true,
    photo_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    status: "approved",
    admin_note: "Lolos audit QA. Slot Size M sudah di-lock di warehouse. Kirim unit lama ke Hub Logistik FOZZ.",
    return_tracking_no: "RET-JNT-4401928",
    replacement_tracking_no: "JP-9944112200",
    created_at: "2026-10-18T10:15:00Z"
  }
];

async function seed() {
  console.log('⚡ Menyemai (Seed) Data ke Supabase Cloud...');

  // 1. Users
  console.log('-> Seeding users...');
  const { error: userErr } = await supabase.from('users').upsert(SEED_USERS, { onConflict: 'id' });
  if (userErr) console.error('   ❌ Gagal seed users:', userErr.message);
  else console.log('   ✅ Users berhasil di-seed.');

  // 2. Products
  console.log('-> Seeding products...');
  const { error: prodErr } = await supabase.from('products').upsert(SEED_PRODUCTS, { onConflict: 'id' });
  if (prodErr) console.error('   ❌ Gagal seed products:', prodErr.message);
  else console.log('   ✅ Products berhasil di-seed.');

  // 3. Product sizes
  console.log('-> Seeding product_sizes...');
  const { error: szErr } = await supabase.from('product_sizes').upsert(SEED_PRODUCT_SIZES, { onConflict: 'id' });
  if (szErr) console.error('   ❌ Gagal seed product_sizes:', szErr.message);
  else console.log('   ✅ Product sizes berhasil di-seed.');

  // 4. Orders
  console.log('-> Seeding orders...');
  const { error: ordErr } = await supabase.from('orders').upsert(SEED_ORDERS, { onConflict: 'id' });
  if (ordErr) console.error('   ❌ Gagal seed orders:', ordErr.message);
  else console.log('   ✅ Orders berhasil di-seed.');

  // 5. Order Items
  console.log('-> Seeding order_items...');
  const { error: itemErr } = await supabase.from('order_items').upsert(SEED_ORDER_ITEMS, { onConflict: 'id' });
  if (itemErr) console.error('   ❌ Gagal seed order_items:', itemErr.message);
  else console.log('   ✅ Order items berhasil di-seed.');

  // 6. Returns
  console.log('-> Seeding returns...');
  const { error: retErr } = await supabase.from('returns').upsert(SEED_RETURNS, { onConflict: 'id' });
  if (retErr) console.error('   ❌ Gagal seed returns:', retErr.message);
  else console.log('   ✅ Returns berhasil di-seed.');

  console.log('\n🎉 Proses seeding data selesai!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
});
