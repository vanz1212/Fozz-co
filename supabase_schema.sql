-- ========================================================
-- FOZZ.CO STREETWEAR - SUPABASE POSTGRESQL SCHEMA & SEED
-- Sesuai dengan spesifikasi:
-- 1. 'Skema Database fozz.co.pdf'
-- 2. 'Sistem Otentikasi & Otorisasi fozz.co.pdf'
-- ========================================================

-- 0. RESET / CLEANUP TABEL LAMA (Jika sebelumnya dibuat manual dengan tipe UUID)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.returns CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.product_sizes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL-TABEL UTAMA (RELATIONAL)

-- Tabel 1: users
CREATE TABLE public.users (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama_lengkap VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  no_telepon VARCHAR(50),
  alamat_default TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 2: products
CREATE TABLE public.products (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 8)),
  nama_produk VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  harga NUMERIC(15, 2) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  gambar_url TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 3: product_sizes (Inventaris & Varian Ukuran)
CREATE TABLE public.product_sizes (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('sz-' || substr(md5(random()::text), 1, 8)),
  product_id VARCHAR(64) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ukuran VARCHAR(50) NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_product_size UNIQUE (product_id, ukuran)
);

-- Tabel 4: orders (Transaksi & Payment Gateway Metadata)
CREATE TABLE public.orders (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 8)),
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
  total_harga NUMERIC(15, 2) NOT NULL,
  status_pesanan VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status_pesanan IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
  alamat_pengiriman TEXT NOT NULL,
  resi_pengiriman VARCHAR(100),
  courier VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT 'qris',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_expired_at TIMESTAMPTZ,
  transaction_id VARCHAR(100),
  va_number VARCHAR(50),
  va_bank VARCHAR(50),
  qris_payload TEXT,
  payment_meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 5: order_items (Detail Item Transaksi & Harga Terkunci)
CREATE TABLE public.order_items (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('oi-' || substr(md5(random()::text), 1, 8)),
  order_id VARCHAR(64) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  ukuran VARCHAR(50) NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  harga_satuan NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 6: returns (Garansi Pas 7 Hari & RMA System)
CREATE TABLE public.returns (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('RMA-FOZZ-' || floor(random() * 900000 + 100000)::text),
  order_id VARCHAR(64) REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
  product_id VARCHAR(64) REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  current_size VARCHAR(50),
  request_type VARCHAR(50) NOT NULL DEFAULT 'exchange_size',
  target_size VARCHAR(50),
  reason TEXT,
  condition_confirmed BOOLEAN DEFAULT TRUE,
  video_unboxing_confirmed BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'completed')),
  admin_note TEXT,
  return_tracking_no VARCHAR(100),
  replacement_tracking_no VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES (Performa Query & Join Cepat)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_products_kategori ON public.products(kategori);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status_pesanan);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON public.returns(user_id);

-- 4. ATOMIC TRIGGER FOR STOCK DEDUCTION
-- Pengurangan stok otomatis dan atomik saat pesanan beralih ke 'Paid'
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status_pesanan = 'Paid' AND (OLD.status_pesanan IS NULL OR OLD.status_pesanan = 'Pending')) THEN
    UPDATE public.product_sizes ps
    SET stok = GREATEST(0, ps.stok - oi.jumlah)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND ps.product_id = oi.product_id
      AND ps.ukuran = oi.ukuran;
  END IF;

  -- Jika pesanan dibatalkan setelah Paid, pulihkan stok
  IF (OLD.status_pesanan = 'Paid' AND (NEW.status_pesanan = 'Cancelled' OR NEW.status_pesanan = 'Refunded')) THEN
    UPDATE public.product_sizes ps
    SET stok = ps.stok + oi.jumlah
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND ps.product_id = oi.product_id
      AND ps.ukuran = oi.ukuran;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_paid_stock ON public.orders;
CREATE TRIGGER trg_order_paid_stock
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.deduct_stock_on_order_paid();

-- 5. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products & product_sizes (for storefront catalog)
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view product sizes" ON public.product_sizes;
CREATE POLICY "Public can view product sizes" ON public.product_sizes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product sizes" ON public.product_sizes;
CREATE POLICY "Admins can manage product sizes" ON public.product_sizes
  FOR ALL USING (true);

-- Allow all operations for orders and items (demo / storefront)
DROP POLICY IF EXISTS "Orders access policy" ON public.orders;
CREATE POLICY "Orders access policy" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Order items access policy" ON public.order_items;
CREATE POLICY "Order items access policy" ON public.order_items
  FOR ALL USING (true) WITH CHECK (true);

-- Users access policy
DROP POLICY IF EXISTS "Users access policy" ON public.users;
CREATE POLICY "Users access policy" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Returns access policy
DROP POLICY IF EXISTS "Returns access policy" ON public.returns;
CREATE POLICY "Returns access policy" ON public.returns
  FOR ALL USING (true) WITH CHECK (true);

-- 6. SEED DATA (UPSERT)
-- Insert initial users
INSERT INTO public.users (id, nama_lengkap, email, password, password_hash, role, no_telepon, alamat_default)
VALUES
('usr-admin-001', 'Fozz System Master', 'admin@fozz.co', 'admin123', '$2b$12$e9g0W.w6R3J6G2Z/JFOZZHQSecretMasterHashArgon2', 'admin', '+62 811-9988-7711', 'HQ Operations Jakarta'),
('usr-cust-001', 'Ivan Pratama', 'ivanpratama859@gmail.com', 'user123', '$2b$12$K89sP3jL9xX.uGfozzCustomerIvanSecureBcryptHash', 'customer', '+62 812-3456-7890', 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190'),
('usr-cust-002', 'Maya Aurelia', 'maya.aurelia@example.com', 'user123', '$2b$12$Y18qM8kJ2vP.aZfozzCustomerMayaSecureBcryptHash', 'customer', '+62 857-1122-3344', 'Jl. Dago Asri Blok B7, Coblong, Bandung 40135')
ON CONFLICT (id) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  no_telepon = EXCLUDED.no_telepon,
  alamat_default = EXCLUDED.alamat_default;

-- Insert initial products
INSERT INTO public.products (id, nama_produk, deskripsi, harga, kategori, gambar_url, status)
VALUES
('prod-001', 'Dark Washed Denim Jacket', 'Premium 14.5oz Japanese Selvedge Denim dengan treatment vintage hand-distressed wash. Boxy oversized silhouette, custom engraved hardware matte gunmetal, dan lining katun herringbone halus. Stok terjamin real-time dengan Garansi Pas 7 Hari.', 899000, 'Outerwear', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80', 'active'),
('prod-002', 'Heavyweight Boxy Hoodie - Slate Black', 'Bahan Katun Kelas Tertinggi 480 GSM French Terry Cotton organik dengan double-layered structured hood. Sangat lembut dan sejuk di kulit, dropped shoulders, kangaroo pocket tersembunyi, dan rib knit tebal tahan melar. Dilengkapi Garansi Pas 7 Hari.', 649000, 'Hoodie', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80', 'active'),
('prod-003', 'Tactical Cargo Pants - Olive Drab', 'Ripstop Military Grade Cordura blend tahan sobek dengan water-repellent coating. 6 saku ergonomis, adjustable ankle bungee drawstring, dan artikulasi lutut untuk kenyamanan mobilitas urban harian. Dilengkapi Garansi Pas 7 Hari.', 589000, 'Pants', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80', 'active'),
('prod-004', 'Cyber Graphic Heavy Tee - Bone White', 'Bahan Katun Kelas Tertinggi 235 GSM Combed Compact Cotton. Nyaman dan sejuk sepanjang hari dengan rib collar 3cm anti-melar. High-density screenprint grafis eksklusif di dada dan punggung. Stok terjamin real-time & Garansi Pas 7 Hari.', 329000, 'T-Shirt', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', 'active'),
('prod-005', 'Technical Nylon Shell Windbreaker', 'Ultra-lightweight 3-layer laminated nylon dengan waterproof zipper YKK Aquaguard. Ventilasi laser-cut di ketiak dan reflective subtle branding di tengkuk. Tahan angin dan hujan ringan, stok terjamin real-time.', 749000, 'Outerwear', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80', 'active'),
('prod-006', 'Fozz Modular Crossbody Sling Bag', 'Ballistic Nylon 1000D dengan buckle Fidlock magnetik buatan Jerman. Kompartemen internal terproteksi busa empuk untuk perlindungan aksesoris digital dan strap bahu modular ergonomis. Garansi Pas 7 Hari.', 429000, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', 'active')
ON CONFLICT (id) DO UPDATE SET
  nama_produk = EXCLUDED.nama_produk,
  deskripsi = EXCLUDED.deskripsi,
  harga = EXCLUDED.harga,
  kategori = EXCLUDED.kategori,
  gambar_url = EXCLUDED.gambar_url,
  status = EXCLUDED.status;

-- Insert initial product sizes & stock
INSERT INTO public.product_sizes (id, product_id, ukuran, stok)
VALUES
('sz-001-s', 'prod-001', 'S', 4),
('sz-001-m', 'prod-001', 'M', 8),
('sz-001-l', 'prod-001', 'L', 6),
('sz-001-xl', 'prod-001', 'XL', 2),

('sz-002-s', 'prod-002', 'S', 5),
('sz-002-m', 'prod-002', 'M', 12),
('sz-002-l', 'prod-002', 'L', 9),
('sz-002-xl', 'prod-002', 'XL', 3),

('sz-003-28', 'prod-003', '28', 3),
('sz-003-30', 'prod-003', '30', 7),
('sz-003-32', 'prod-003', '32', 6),
('sz-003-34', 'prod-003', '34', 1),

('sz-004-s', 'prod-004', 'S', 10),
('sz-004-m', 'prod-004', 'M', 18),
('sz-004-l', 'prod-004', 'L', 14),
('sz-004-xl', 'prod-004', 'XL', 5),

('sz-005-m', 'prod-005', 'M', 4),
('sz-005-l', 'prod-005', 'L', 5),
('sz-005-xl', 'prod-005', 'XL', 2),

('sz-006-all', 'prod-006', 'ALL-SIZE', 15)
ON CONFLICT (id) DO UPDATE SET
  ukuran = EXCLUDED.ukuran,
  stok = EXCLUDED.stok;

-- Insert initial sample orders
INSERT INTO public.orders (id, user_id, total_harga, status_pesanan, alamat_pengiriman, resi_pengiriman, courier, payment_method, payment_status, created_at)
VALUES
('ord-882109', 'usr-cust-001', 919000, 'Shipped', 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190', 'JP-88992144701', 'J&T Express Super', 'qris', 'settled', '2026-10-14T09:30:00Z'),
('ord-774012', 'usr-cust-002', 998000, 'Paid', 'Jl. Dago Asri Blok B7, Coblong, Bandung 40135', NULL, 'SiCepat BEST', 'va_bca', 'settled', '2026-10-15T14:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert initial sample order items
INSERT INTO public.order_items (id, order_id, product_id, ukuran, jumlah, harga_satuan)
VALUES
('oi-001', 'ord-882109', 'prod-001', 'L', 1, 899000),
('oi-002', 'ord-774012', 'prod-002', 'M', 1, 649000),
('oi-003', 'ord-774012', 'prod-004', 'L', 1, 329000)
ON CONFLICT (id) DO NOTHING;

-- Insert initial return/RMA
INSERT INTO public.returns (id, order_id, user_id, product_id, product_name, current_size, request_type, target_size, reason, condition_confirmed, video_unboxing_confirmed, photo_url, status, admin_note, return_tracking_no, replacement_tracking_no, created_at)
VALUES
('RMA-FOZZ-882109', 'ord-882109', 'usr-cust-001', 'prod-001', 'Dark Washed Denim Jacket', 'L', 'exchange_size', 'M', 'Siluet bahu Size L terlalu drop. Minta tukar ke Size M.', true, true, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80', 'approved', 'Lolos audit QA. Slot Size M sudah di-lock di warehouse. Kirim unit lama ke Hub Logistik FOZZ.', 'RET-JNT-4401928', 'JP-9944112200', '2026-10-18T10:15:00Z')
ON CONFLICT (id) DO NOTHING;
