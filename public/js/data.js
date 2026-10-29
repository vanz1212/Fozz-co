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
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[1]));
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
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // --- Products Table ---
  getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
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
