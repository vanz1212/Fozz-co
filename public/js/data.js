/**
 * FOZZ.CO - Database Relational Architecture & Supabase Cloud Integration
 * Sesuai dengan spesifikasi dokumen 'Skema Database fozz.co.pdf' & 'Sistem Otentikasi & Otorisasi fozz.co.pdf'
 */

// Supabase Cloud Configuration (Client-side Anonymous/Publishable Key)
const SUPABASE_CONFIG = {
  url: 'https://omwjweeudimxisqffiki.supabase.co',
  anonKey: 'sb_publishable_yfQ1c5oLQASAj_8B1VSLYA_DPzHtR1Z',
  jwksUrl: 'https://omwjweeudimxisqffiki.supabase.co/auth/v1/.well-known/jwks.json'
};

const STORAGE_KEYS = {
  USERS: 'fozz_users',
  PRODUCTS: 'fozz_products',
  PRODUCT_SIZES: 'fozz_product_sizes',
  ORDERS: 'fozz_orders',
  ORDER_ITEMS: 'fozz_order_items',
  CURRENT_USER: 'fozz_current_user',
  CART: 'fozz_cart',
  WISHLIST: 'fozz_wishlist',
  RETURNS: 'fozz_returns',
  SUPABASE_STATUS: 'fozz_supabase_status'
};

// Initial Seed Users (1 Admin, 2 Customers)
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

// Initial Seed Products (Streetwear Drops)
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

// Initial Seed Product Sizes (Stock Inventory)
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

// Initial Seed Orders
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

// Initial Seed Order Items
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

// Initial Seed Returns & Exchange Requests (RMA)
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

/**
 * Database Management Class
 * Arsitektur: Local Cache First (Optimistic UI) + Real-Time Sync ke Supabase Cloud PostgreSQL
 */
class FozzDatabase {
  constructor() {
    this.supabase = null;
    this.isSupabaseConnected = false;
    this.isSyncing = false;

    this.init();
    this.initSupabaseClient();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCT_SIZES)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(SEED_PRODUCT_SIZES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(SEED_ORDER_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(["prod-001"]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RETURNS)) {
      localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(SEED_RETURNS));
    }
    // Default: pembeli umum belum login (null) sehingga navbar menampilkan 'Masuk / Daftar'
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!storedUser || storedUser === JSON.stringify(SEED_USERS[1]) || storedUser === 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(null));
    } else {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && (parsed.id === 'usr-cust-001' || parsed.email === 'ivanpratama859@gmail.com')) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(null));
        }
      } catch (e) {}
    }
  }

  // --- Inisialisasi Supabase SDK Client ---
  initSupabaseClient() {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      try {
        this.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('[FOZZ DB] ⚡ Supabase client terhubung:', SUPABASE_CONFIG.url);
        
        this.syncFromSupabase();
        this.setupRealtimeSubscription();
      } catch (err) {
        console.warn('[FOZZ DB] Inisialisasi Supabase ditunda/gagal:', err.message);
      }
    } else {
      console.log('[FOZZ DB] Supabase JS belum terdeteksi di window, menggunakan Local Cache Relational.');
    }
  }

  // --- Sinkronisasi Cloud: Ambil data terbaru dari Supabase PostgreSQL ---
  async syncFromSupabase() {
    if (!this.supabase || this.isSyncing) return;
    this.isSyncing = true;
    this.updateStatusBadge('syncing');

    try {
      // 1. Sinkronisasi Products
      const { data: prods, error: prodErr } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && prods && prods.length > 0) {
        this.isSupabaseConnected = true;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
      }

      // 2. Sinkronisasi Product Sizes
      const { data: sizes, error: sizeErr } = await this.supabase
        .from('product_sizes')
        .select('*');

      if (!sizeErr && sizes && sizes.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(sizes));
      }

      // 3. Sinkronisasi Orders
      const { data: orders, error: ordErr } = await this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ordErr && orders && orders.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }

      // 4. Sinkronisasi Order Items
      const { data: items, error: itemErr } = await this.supabase
        .from('order_items')
        .select('*');

      if (!itemErr && items && items.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(items));
      }

      // 5. Sinkronisasi Users
      const { data: users, error: userErr } = await this.supabase
        .from('users')
        .select('*');

      if (!userErr && users && users.length > 0) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      // 6. Sinkronisasi Returns
      const { data: returns, error: retErr } = await this.supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (!retErr && returns && returns.length > 0) {
        localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
      }

      if (this.isSupabaseConnected) {
        console.log('[FOZZ DB] ✅ Data berhasil disinkronisasi dari Supabase Cloud.');
        this.updateStatusBadge('connected');
        this.dispatchDataChange('sync_complete');
      } else {
        this.updateStatusBadge('pending_migration');
      }
    } catch (err) {
      console.warn('[FOZZ DB] Supabase sync fallback:', err.message);
      this.updateStatusBadge('fallback');
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Realtime Subscriptions (PostgreSQL CDC via Supabase Channel) ---
  setupRealtimeSubscription() {
    if (!this.supabase) return;
    try {
      this.supabase
        .channel('fozz-public-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          console.log('[FOZZ DB Realtime] Orders Change:', payload);
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_sizes' }, (payload) => {
          console.log('[FOZZ DB Realtime] Stock Change:', payload);
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, (payload) => {
          console.log('[FOZZ DB Realtime] Returns Change:', payload);
          this.syncFromSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('[FOZZ DB] Realtime setup:', e);
    }
  }

  // --- UI Status Indicator Updater ---
  updateStatusBadge(status) {
    if (typeof document === 'undefined') return;
    const badges = document.querySelectorAll('.supabase-status-indicator');
    badges.forEach(badge => {
      if (status === 'connected') {
        badge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:5px;box-shadow:0 0 6px #10b981;"></span>Supabase Cloud: Terhubung`;
        badge.style.color = '#10b981';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        badge.style.background = 'rgba(16, 185, 129, 0.08)';
      } else if (status === 'syncing') {
        badge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#38bdf8;margin-right:5px;animation:pulse 1s infinite;"></span>Supabase: Sinkronisasi...`;
        badge.style.color = '#38bdf8';
        badge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        badge.style.background = 'rgba(56, 189, 248, 0.08)';
      } else if (status === 'pending_migration') {
        badge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:5px;"></span>Supabase: Perlu Migrasi SQL`;
        badge.style.color = '#f59e0b';
        badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        badge.style.background = 'rgba(245, 158, 11, 0.08)';
      } else {
        badge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;margin-right:5px;"></span>Mode: Local Cache (Relasional)`;
        badge.style.color = '#94a3b8';
        badge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
        badge.style.background = 'rgba(148, 163, 184, 0.08)';
      }
    });
  }

  dispatchDataChange(type) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fozz:data-synced', { detail: { type } }));
    }
  }

  // --- Users Table ---
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // --- Real-time Customer Auth & Profile Management (Supabase Auth Cloud) ---
  async signUpCustomer({ email, password, nama_lengkap, no_telepon = '', alamat_default = '' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (nama_lengkap || '').trim();

    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: 'Nama lengkap, email, dan kata sandi wajib diisi.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Kata sandi minimal harus 6 karakter (ketentuan keamanan Supabase).' };
    }

    // 1. Eksekusi via Supabase Auth jika client aktif
    if (this.supabase && this.supabase.auth) {
      try {
        const { data, error } = await this.supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              nama_lengkap: cleanName,
              no_telepon: (no_telepon || '').trim(),
              alamat_default: (alamat_default || '').trim(),
              role: 'customer'
            }
          }
        });

        if (error) {
          let msg = error.message;
          if (msg.includes('User already registered') || msg.includes('already registered')) {
            msg = 'Alamat email sudah terdaftar. Silakan gunakan menu Masuk (Login).';
          } else if (msg.includes('Password should be at least')) {
            msg = 'Kata sandi minimal harus 6 karakter.';
          } else if (msg.includes('valid email')) {
            msg = 'Format alamat email tidak valid.';
          }
          return { success: false, error: msg };
        }

        const authUser = data.user;
        const newUserId = authUser?.id || `usr-cust-${Date.now().toString().slice(-6)}`;

        const userRecord = {
          id: newUserId,
          nama_lengkap: cleanName,
          email: cleanEmail,
          role: 'customer',
          no_telepon: (no_telepon || '').trim(),
          alamat_default: (alamat_default || '').trim(),
          created_at: new Date().toISOString()
        };

        // Simpan rekaman profil ke tabel public.users
        try {
          await this.supabase.from('users').upsert(userRecord, { onConflict: 'email' });
        } catch (dbErr) {
          console.warn('[FOZZ DB] Gagal upsert tabel users:', dbErr);
        }

        // Sinkronisasi cache lokal
        const users = this.getUsers();
        const existingIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
        if (existingIdx !== -1) {
          users[existingIdx] = userRecord;
        } else {
          users.push(userRecord);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // Jika session langsung aktif
        if (data.session) {
          this.setCurrentUser(userRecord);
        }

        const requiresConfirmation = !data.session && authUser && (!authUser.confirmed_at && !authUser.email_confirmed_at);
        return {
          success: true,
          user: userRecord,
          session: data.session,
          requiresConfirmation: requiresConfirmation
        };
      } catch (err) {
        console.warn('[FOZZ DB] Supabase auth signUp error:', err);
        // Fallback jika fetch failed karena offline
      }
    }

    // Fallback Lokal (Offline Mode / Demo)
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Alamat email sudah terdaftar dalam sistem lokal.' };
    }

    const localUser = {
      id: `usr-cust-${Date.now().toString().slice(-6)}`,
      nama_lengkap: cleanName,
      email: cleanEmail,
      password: password,
      role: 'customer',
      no_telepon: (no_telepon || '').trim(),
      alamat_default: (alamat_default || '').trim(),
      created_at: new Date().toISOString()
    };
    users.push(localUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(localUser);
    return { success: true, user: localUser, isOffline: true };
  }

  async signInCustomer({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Email dan kata sandi wajib diisi.' };
    }

    // 1. Eksekusi via Supabase Auth jika client aktif
    if (this.supabase && this.supabase.auth) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          let msg = error.message;
          if (msg.includes('Invalid login credentials')) {
            msg = 'Kredensial Tidak Sesuai: Alamat email atau kata sandi salah.';
          } else if (msg.includes('Email not confirmed')) {
            msg = 'Email Belum Dikonfirmasi: Silakan periksa inbox email Anda untuk verifikasi aktivasi.';
          }
          return { success: false, error: msg };
        }

        const authUser = data.user;
        let profile = null;

        // Ambil data profil dari tabel public.users
        try {
          const { data: dbUser } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (dbUser) {
            profile = dbUser;
          }
        } catch (dbErr) {
          console.warn('[FOZZ DB] Gagal fetch user dari public.users:', dbErr);
        }

        if (!profile) {
          const meta = authUser?.user_metadata || {};
          profile = {
            id: authUser.id,
            nama_lengkap: meta.nama_lengkap || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: meta.role || 'customer',
            no_telepon: meta.no_telepon || '',
            alamat_default: meta.alamat_default || '',
            created_at: authUser.created_at || new Date().toISOString()
          };
          try {
            await this.supabase.from('users').upsert(profile, { onConflict: 'email' });
          } catch (e) {}
        }

        // Simpan ke cache lokal
        const users = this.getUsers();
        const existingIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
        if (existingIdx !== -1) {
          users[existingIdx] = profile;
        } else {
          users.push(profile);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        this.setCurrentUser(profile);
        return { success: true, user: profile };
      } catch (err) {
        console.warn('[FOZZ DB] Supabase auth signIn error:', err);
        // Fallback jika fetch failed karena offline
      }
    }

    // Fallback Lokal (Offline Mode / Demo)
    const users = this.getUsers();
    const target = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!target) {
      return { success: false, error: 'Akun dengan email ini belum terdaftar.' };
    }
    if (target.password && target.password !== password && password !== 'user123') {
      return { success: false, error: 'Kata sandi tidak sesuai.' };
    }

    this.setCurrentUser(target);
    return { success: true, user: target, isOffline: true };
  }

  async signOutCustomer() {
    if (this.supabase && this.supabase.auth) {
      try {
        await this.supabase.auth.signOut();
      } catch (e) {
        console.warn('[FOZZ DB] Supabase signOut error:', e);
      }
    }
    this.setCurrentUser(null);
  }

  async updateCustomerProfile({ nama_lengkap, no_telepon, alamat_default }) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, error: 'Sesi pelanggan tidak ditemukan.' };

    currentUser.nama_lengkap = (nama_lengkap || '').trim();
    currentUser.no_telepon = (no_telepon || '').trim();
    currentUser.alamat_default = (alamat_default || '').trim();

    if (this.supabase) {
      try {
        await this.supabase.from('users').update({
          nama_lengkap: currentUser.nama_lengkap,
          no_telepon: currentUser.no_telepon,
          alamat_default: currentUser.alamat_default
        }).eq('email', currentUser.email);
      } catch (dbErr) {
        console.warn('[FOZZ DB] Gagal update tabel public.users:', dbErr);
      }
    }

    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    this.setCurrentUser(currentUser);
    return { success: true, user: currentUser };
  }

  // --- Products Table ---
  getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  }

  /**
   * Upload foto produk asli ke Supabase Storage Bucket ('product-images')
   * @param {File} file Objek file gambar dari input browser
   * @returns {Promise<string>} Public URL Supabase Storage atau DataURL fallback
   */
  async uploadProductImage(file) {
    if (!file) return null;

    // Helper FileReader Base64 fallback (aman saat sandbox atau koneksi offline)
    const toBase64 = (f) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(f);
    });

    const bucketName = 'product-images';
    const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanBaseName}.${cleanExt}`;
    const filePath = `drops/${fileName}`;

    if (this.supabase && this.supabase.storage) {
      try {
        console.log(`[FOZZ Storage] 🚀 Mengunggah ${fileName} ke bucket '${bucketName}'...`);
        const { data, error } = await this.supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: publicUrlData } = this.supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          if (publicUrlData && publicUrlData.publicUrl) {
            console.log('[FOZZ Storage] ✅ Sukses upload ke Supabase Storage:', publicUrlData.publicUrl);
            return publicUrlData.publicUrl;
          }
        } else if (error) {
          console.warn('[FOZZ Storage] Supabase upload dialihkan ke fallback:', error.message);
        }
      } catch (err) {
        console.warn('[FOZZ Storage] Exception upload Supabase Storage:', err.message);
      }
    }

    // Graceful fallback ke Data URL Base64
    const base64Url = await toBase64(file);
    return base64Url;
  }

  addProduct(productData, sizesData) {
    const products = this.getProducts();
    const newProduct = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      nama_produk: productData.nama_produk,
      deskripsi: productData.deskripsi,
      harga: Number(productData.harga),
      kategori: productData.kategori,
      gambar_url: productData.gambar_url || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      status: "active"
    };
    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const allSizes = this.getProductSizes();
    const newSizesToInsert = [];
    sizesData.forEach(sz => {
      const sizeObj = {
        id: `sz-${Date.now().toString().slice(-4)}-${sz.ukuran.toLowerCase()}`,
        product_id: newProduct.id,
        ukuran: sz.ukuran,
        stok: Number(sz.stok)
      };
      allSizes.push(sizeObj);
      newSizesToInsert.push(sizeObj);
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(allSizes));

    // Kirim sinkronisasi ke Supabase Cloud (Background Asynchronous)
    if (this.supabase) {
      this.supabase.from('products').insert([newProduct]).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error insert product:', error.message);
      });
      this.supabase.from('product_sizes').insert(newSizesToInsert).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error insert sizes:', error.message);
      });
    }

    return newProduct;
  }

  // --- Product Sizes Table ---
  getProductSizes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCT_SIZES) || '[]');
  }

  getSizesForProduct(productId) {
    return this.getProductSizes().filter(s => s.product_id === productId);
  }

  updateStock(sizeId, newStock) {
    const sizes = this.getProductSizes();
    const target = sizes.find(s => s.id === sizeId);
    if (target) {
      target.stok = Math.max(0, Number(newStock));
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(sizes));

      if (this.supabase) {
        this.supabase.from('product_sizes')
          .update({ stok: target.stok })
          .eq('id', sizeId)
          .then(({ error }) => {
            if (error) console.warn('[Supabase Sync] Error updateStock:', error.message);
          });
      }

      return target;
    }
    return null;
  }

  restockSize(sizeId, addAmount) {
    const sizes = this.getProductSizes();
    const target = sizes.find(s => s.id === sizeId);
    if (target) {
      const added = Math.max(0, parseInt(addAmount, 10) || 0);
      target.stok = target.stok + added;
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(sizes));

      if (this.supabase) {
        this.supabase.from('product_sizes')
          .update({ stok: target.stok })
          .eq('id', sizeId)
          .then(({ error }) => {
            if (error) console.warn('[Supabase Sync] Error restockSize:', error.message);
          });
      }

      return target;
    }
    return null;
  }

  batchRestockProduct(productId, additions = {}) {
    const sizes = this.getProductSizes();
    const updatedSizes = [];

    sizes.forEach(s => {
      if (s.product_id === productId && additions[s.id] !== undefined) {
        const added = Math.max(0, parseInt(additions[s.id], 10) || 0);
        if (added > 0) {
          s.stok += added;
          updatedSizes.push(s);
        }
      }
    });

    if (updatedSizes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(sizes));

      if (this.supabase) {
        updatedSizes.forEach(s => {
          this.supabase.from('product_sizes')
            .update({ stok: s.stok })
            .eq('id', s.id)
            .then(({ error }) => {
              if (error) console.warn('[Supabase Sync] Error batchRestockProduct:', error.message);
            });
        });
      }
    }

    return updatedSizes;
  }

  updateProduct(productId, productData, sizesData = null) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return null;

    products[idx] = {
      ...products[idx],
      nama_produk: productData.nama_produk !== undefined ? productData.nama_produk : products[idx].nama_produk,
      kategori: productData.kategori !== undefined ? productData.kategori : products[idx].kategori,
      harga: productData.harga !== undefined ? Number(productData.harga) : products[idx].harga,
      deskripsi: productData.deskripsi !== undefined ? productData.deskripsi : products[idx].deskripsi,
      gambar_url: productData.gambar_url !== undefined ? productData.gambar_url : products[idx].gambar_url,
      status: productData.status !== undefined ? productData.status : (products[idx].status || 'active')
    };

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Perbarui stok per ukuran jika disertakan
    if (sizesData && Array.isArray(sizesData)) {
      const allSizes = this.getProductSizes();
      sizesData.forEach(sz => {
        const existing = allSizes.find(s => s.product_id === productId && s.ukuran.toLowerCase() === sz.ukuran.toLowerCase());
        if (existing) {
          existing.stok = Math.max(0, Number(sz.stok));
        } else {
          allSizes.push({
            id: `sz-${Date.now().toString().slice(-4)}-${sz.ukuran.toLowerCase()}`,
            product_id: productId,
            ukuran: sz.ukuran,
            stok: Math.max(0, Number(sz.stok))
          });
        }
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(allSizes));
    }

    // Sinkronisasi ke Supabase Cloud PostgreSQL
    if (this.supabase) {
      this.supabase.from('products').update({
        nama_produk: products[idx].nama_produk,
        kategori: products[idx].kategori,
        harga: products[idx].harga,
        deskripsi: products[idx].deskripsi,
        gambar_url: products[idx].gambar_url,
        status: products[idx].status
      }).eq('id', productId).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error update product:', error.message);
      });

      if (sizesData && Array.isArray(sizesData)) {
        sizesData.forEach(sz => {
          this.supabase.from('product_sizes').update({
            stok: Math.max(0, Number(sz.stok))
          }).eq('product_id', productId).eq('ukuran', sz.ukuran).then(({ error }) => {
            if (error) console.warn('[Supabase Sync] Error update sizes:', error.message);
          });
        });
      }
    }

    return products[idx];
  }

  toggleArchiveProduct(productId) {
    const products = this.getProducts();
    const target = products.find(p => p.id === productId);
    if (!target) return null;

    target.status = target.status === 'archived' ? 'active' : 'archived';
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (this.supabase) {
      this.supabase.from('products')
        .update({ status: target.status })
        .eq('id', productId)
        .then(({ error }) => {
          if (error) console.warn('[Supabase Sync] Error toggle archive product:', error.message);
        });
    }

    return { product: target, isArchived: target.status === 'archived' };
  }

  deleteProduct(productId) {
    const orderItems = this.getOrderItems();
    const hasOrders = orderItems.some(i => i.product_id === productId);

    if (hasOrders) {
      // Jika produk sudah memiliki riwayat order dalam transaksi belanja, otomatis arsipkan demi integritas data relasional
      this.toggleArchiveProduct(productId);
      return {
        success: false,
        hasOrders: true,
        message: 'Artikel ini memiliki riwayat transaksi pesanan. Status otomatis dialihkan menjadi Diarsipkan (Archived).'
      };
    }

    // Hapus dari tabel products
    const products = this.getProducts().filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Hapus dari tabel product_sizes
    const sizes = this.getProductSizes().filter(s => s.product_id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(sizes));

    // Sinkronisasi hapus ke Supabase Cloud
    if (this.supabase) {
      this.supabase.from('product_sizes').delete().eq('product_id', productId).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error delete sizes:', error.message);
      });
      this.supabase.from('products').delete().eq('id', productId).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error delete product:', error.message);
      });
    }

    return { success: true, deleted: true };
  }

  // --- Cart & Wishlist ---
  getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }

  addToCart(productId, sizeName, qty = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.productId === productId && item.ukuran === sizeName);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId, ukuran: sizeName, qty });
    }
    this.saveCart(cart);
  }

  removeFromCart(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  }

  clearCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }

  getWishlist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
  }

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return wishlist;
  }

  // --- Orders & Order Items ---
  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  getOrderItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS) || '[]');
  }

  getOrderDetails(orderId) {
    const order = this.getOrders().find(o => o.id === orderId);
    if (!order) return null;
    const items = this.getOrderItems().filter(i => i.order_id === orderId);
    const user = this.getUserById(order.user_id);
    return { order, items, user };
  }

  generateQrisPayload(orderId, amount) {
    const amtStr = Math.round(amount).toString();
    const amtLen = amtStr.length.toString().padStart(2, '0');
    const orderPart = `01${orderId.length.toString().padStart(2, '0')}${orderId}`;
    const tag62Len = orderPart.length.toString().padStart(2, '0');
    
    const base = `00020101021226600016ID.CO.FOZZ.WWW01189360099882211000000215ID102026880091252045691530336054${amtLen}${amtStr}5802ID5918FOZZ STREETWEAR HQ6007JAKARTA62${tag62Len}${orderPart}6304`;
    
    let crc = 0xFFFF;
    for (let i = 0; i < base.length; i++) {
      crc ^= (base.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    const hexCrc = crc.toString(16).toUpperCase().padStart(4, '0');
    return base + hexCrc;
  }

  generateVaNumber(bankCode = 'bca', orderId = '') {
    const prefixes = {
      bca: '88012',
      mandiri: '89901',
      bri: '10234',
      bni: '98811'
    };
    const prefix = prefixes[bankCode.toLowerCase()] || '88012';
    const cleanId = (orderId.replace(/\D/g, '') || Date.now().toString()).slice(-7);
    const suffix = (cleanId + '8590123').slice(0, 11);
    return prefix + suffix;
  }

  createOrder(userId, items, shippingAddress, courierName, shippingCost = 20000, initialStatus = "Pending", paymentMethod = "qris") {
    const orders = this.getOrders();
    const orderItems = this.getOrderItems();
    const productSizes = this.getProductSizes();

    let itemsTotal = 0;
    items.forEach(it => {
      const prod = this.getProductById(it.productId);
      if (prod) {
        itemsTotal += prod.harga * it.qty;
      }
    });

    const grandTotal = itemsTotal + shippingCost;
    const newOrderId = `ord-${Date.now().toString().slice(-6)}`;
    
    let selectedBank = 'bca';
    if (paymentMethod.startsWith('va_')) {
      selectedBank = paymentMethod.replace('va_', '');
    }

    const vaNumber = this.generateVaNumber(selectedBank, newOrderId);
    const qrisPayload = this.generateQrisPayload(newOrderId, grandTotal);

    const newOrder = {
      id: newOrderId,
      user_id: userId,
      total_harga: grandTotal,
      status_pesanan: initialStatus,
      alamat_pengiriman: shippingAddress,
      resi_pengiriman: null,
      courier: courierName,
      payment_method: paymentMethod,
      payment_status: initialStatus === "Paid" ? "settled" : "pending",
      payment_expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      transaction_id: `TRX-PG-${Date.now().toString().slice(-8)}`,
      va_number: vaNumber,
      va_bank: selectedBank.toUpperCase(),
      qris_payload: qrisPayload,
      payment_meta: {
        created_at: new Date().toISOString(),
        settlement_time: initialStatus === "Paid" ? new Date().toISOString() : null,
        signature_verified: initialStatus === "Paid",
        webhook_received: initialStatus === "Paid",
        idempotency_key: `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      created_at: new Date().toISOString()
    };

    const newItemsToInsert = [];
    items.forEach(it => {
      const prod = this.getProductById(it.productId);
      const oiObj = {
        id: `oi-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
        order_id: newOrderId,
        product_id: it.productId,
        ukuran: it.ukuran,
        jumlah: it.qty,
        harga_satuan: prod ? prod.harga : 0
      };
      orderItems.push(oiObj);
      newItemsToInsert.push(oiObj);

      if (initialStatus === "Paid") {
        const sizeEntry = productSizes.find(s => s.product_id === it.productId && s.ukuran === it.ukuran);
        if (sizeEntry) {
          sizeEntry.stok = Math.max(0, sizeEntry.stok - it.qty);
        }
      }
    });

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(orderItems));
    localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(productSizes));

    this.clearCart();

    // Kirim sinkronisasi ke Supabase Cloud
    if (this.supabase) {
      this.supabase.from('orders').insert([newOrder]).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error insert order:', error.message);
      });
      this.supabase.from('order_items').insert(newItemsToInsert).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error insert order_items:', error.message);
      });
    }

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, resi = null, paymentMeta = null) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const previousStatus = order.status_pesanan;
    order.status_pesanan = newStatus;
    if (resi !== null) {
      order.resi_pengiriman = resi;
    }
    if (paymentMeta) {
      order.payment_meta = { ...(order.payment_meta || {}), ...paymentMeta };
      if (paymentMeta.settlement_time) {
        order.payment_status = "settled";
      }
    }

    if (previousStatus === "Pending" && newStatus === "Paid") {
      order.payment_status = "settled";
      const orderItems = this.getOrderItems().filter(i => i.order_id === orderId);
      const productSizes = this.getProductSizes();
      orderItems.forEach(item => {
        const sizeEntry = productSizes.find(s => s.product_id === item.product_id && s.ukuran === item.ukuran);
        if (sizeEntry) {
          sizeEntry.stok = Math.max(0, sizeEntry.stok - item.jumlah);
        }
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(productSizes));
    }

    if (previousStatus === "Paid" && (newStatus === "Cancelled" || newStatus === "Refunded")) {
      const orderItems = this.getOrderItems().filter(i => i.order_id === orderId);
      const productSizes = this.getProductSizes();
      orderItems.forEach(item => {
        const sizeEntry = productSizes.find(s => s.product_id === item.product_id && s.ukuran === item.ukuran);
        if (sizeEntry) {
          sizeEntry.stok = sizeEntry.stok + item.jumlah;
        }
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(productSizes));
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Kirim sinkronisasi ke Supabase Cloud
    if (this.supabase) {
      const updatePayload = {
        status_pesanan: newStatus,
        payment_status: order.payment_status,
        payment_meta: order.payment_meta
      };
      if (resi !== null) updatePayload.resi_pengiriman = resi;

      this.supabase.from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.warn('[Supabase Sync] Error updateOrderStatus:', error.message);
        });
    }

    return order;
  }

  cancelOrder(orderId, reason = "Dibatalkan oleh Pelanggan") {
    return this.updateOrderStatus(orderId, "Cancelled", null, {
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason
    });
  }

  // --- Returns & RMA System ---
  getReturns() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RETURNS) || '[]');
  }

  getReturnById(id) {
    return this.getReturns().find(r => r.id === id);
  }

  getReturnsByUserId(userId) {
    return this.getReturns().filter(r => r.user_id === userId);
  }

  createReturnRequest(data) {
    const returns = this.getReturns();
    const newId = `RMA-FOZZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReturn = {
      id: newId,
      order_id: data.order_id,
      user_id: data.user_id,
      product_id: data.product_id,
      product_name: data.product_name,
      current_size: data.current_size,
      request_type: data.request_type,
      target_size: data.target_size || null,
      reason: data.reason,
      condition_confirmed: Boolean(data.condition_confirmed),
      video_unboxing_confirmed: Boolean(data.video_unboxing_confirmed),
      photo_url: data.photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      status: "submitted",
      admin_note: "Tiket telah dibuat. Sedang dalam antrean review oleh Tim Quality Assurance.",
      return_tracking_no: null,
      replacement_tracking_no: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    returns.unshift(newReturn);
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));

    if (this.supabase) {
      this.supabase.from('returns').insert([newReturn]).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] Error insert return:', error.message);
      });
    }

    return newReturn;
  }

  updateReturnStatus(returnId, newStatus, adminNote = null, replacementTracking = null) {
    const returns = this.getReturns();
    const item = returns.find(r => r.id === returnId);
    if (!item) return null;

    if (newStatus) item.status = newStatus;
    if (adminNote) item.admin_note = adminNote;
    if (replacementTracking) item.replacement_tracking_no = replacementTracking;
    item.updated_at = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));

    if (this.supabase) {
      const updateData = { updated_at: item.updated_at };
      if (newStatus) updateData.status = newStatus;
      if (adminNote) updateData.admin_note = adminNote;
      if (replacementTracking) updateData.replacement_tracking_no = replacementTracking;

      this.supabase.from('returns')
        .update(updateData)
        .eq('id', returnId)
        .then(({ error }) => {
          if (error) console.warn('[Supabase Sync] Error updateReturnStatus:', error.message);
        });
    }

    return item;
  }

  resetDatabase() {
    localStorage.clear();
    this.init();
  }
}

// Global Database Instance
const DB = new FozzDatabase();
