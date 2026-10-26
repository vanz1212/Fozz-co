/**
 * FOZZ.CO - Database Relational Architecture & Initial Seed Data
 * Sesuai dengan spesifikasi dokumen 'Skema Database fozz.co.pdf'
 */

const STORAGE_KEYS = {
  USERS: 'fozz_users',
  PRODUCTS: 'fozz_products',
  PRODUCT_SIZES: 'fozz_product_sizes',
  ORDERS: 'fozz_orders',
  ORDER_ITEMS: 'fozz_order_items',
  CURRENT_USER: 'fozz_current_user',
  CART: 'fozz_cart',
  WISHLIST: 'fozz_wishlist',
  RETURNS: 'fozz_returns'
};

// Initial Seed Users (1 Admin, 2 Customers)
const SEED_USERS = [
  {
    id: "usr-admin-001",
    nama_lengkap: "Fozz System Master",
    email: "admin@fozz.co",
    password_hash: "$2b$12$e9g0W.w6R3J6G2Z/JFOZZHQSecretMasterHashArgon2",
    role: "admin",
    no_telepon: "+62 811-9988-7711",
    created_at: "2026-01-10T08:00:00Z"
  },
  {
    id: "usr-cust-001",
    nama_lengkap: "Ivan Pratama",
    email: "ivanpratama859@gmail.com",
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
    deskripsi: "Premium 14.5oz Japanese Selvedge Denim dengan treatment vintage hand-distressed wash. Boxy oversized silhouette, custom engraved hardware matte gunmetal, dan lining katun herringbone halus.",
    harga: 899000,
    kategori: "Outerwear",
    gambar_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-002",
    nama_produk: "Heavyweight Boxy Hoodie - Slate Black",
    deskripsi: "480 GSM French Terry Cotton organik dengan double-layered structured hood. Dropped shoulders, kangaroo pocket tersembunyi, rib knit tebal di pinggang dan manset tahan melar.",
    harga: 649000,
    kategori: "Hoodie",
    gambar_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-003",
    nama_produk: "Tactical Cargo Pants - Olive Drab",
    deskripsi: "Ripstop Military Grade Cordura blend tahan sobek dengan water-repellent coating. 6 saku ergonomis, adjustable ankle bungee drawstring, dan artikulasi lutut untuk mobilitas urban.",
    harga: 589000,
    kategori: "Pants",
    gambar_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-004",
    nama_produk: "Cyber Graphic Heavy Tee - Bone White",
    deskripsi: "235 GSM combed compact cotton. High-density screenprint grafis distopia bertema 'Zero-Trust Protocol' di dada dan punggung. Rib collar 3cm anti-bacon.",
    harga: 329000,
    kategori: "T-Shirt",
    gambar_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-005",
    nama_produk: "Technical Nylon Shell Windbreaker",
    deskripsi: "Ultra-lightweight 3-layer laminated nylon dengan waterproof zipper YKK Aquaguard. Ventilasi laser-cut di ketiak dan reflective subtle branding di tengkuk.",
    harga: 749000,
    kategori: "Outerwear",
    gambar_url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
    status: "active"
  },
  {
    id: "prod-006",
    nama_produk: "Fozz Modular Crossbody Sling Bag",
    deskripsi: "Ballistic Nylon 1000D dengan buckle Fidlock magnetik buatan Jerman. Kompartemen internal terproteksi busa untuk aksesoris digital dan strap bahu modular.",
    harga: 429000,
    kategori: "Accessories",
    gambar_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    status: "active"
  }
];

// Initial Seed Product Sizes (Stock Inventory)
const SEED_PRODUCT_SIZES = [
  // prod-001 Dark Washed Denim Jacket
  { id: "sz-001-s", product_id: "prod-001", ukuran: "S", stok: 4 },
  { id: "sz-001-m", product_id: "prod-001", ukuran: "M", stok: 8 },
  { id: "sz-001-l", product_id: "prod-001", ukuran: "L", stok: 6 },
  { id: "sz-001-xl", product_id: "prod-001", ukuran: "XL", stok: 2 },

  // prod-002 Heavyweight Boxy Hoodie
  { id: "sz-002-s", product_id: "prod-002", ukuran: "S", stok: 5 },
  { id: "sz-002-m", product_id: "prod-002", ukuran: "M", stok: 12 },
  { id: "sz-002-l", product_id: "prod-002", ukuran: "L", stok: 9 },
  { id: "sz-002-xl", product_id: "prod-002", ukuran: "XL", stok: 3 },

  // prod-003 Tactical Cargo Pants
  { id: "sz-003-28", product_id: "prod-003", ukuran: "28", stok: 3 },
  { id: "sz-003-30", product_id: "prod-003", ukuran: "30", stok: 7 },
  { id: "sz-003-32", product_id: "prod-003", ukuran: "32", stok: 6 },
  { id: "sz-003-34", product_id: "prod-003", ukuran: "34", stok: 1 },

  // prod-004 Cyber Graphic Heavy Tee
  { id: "sz-004-s", product_id: "prod-004", ukuran: "S", stok: 10 },
  { id: "sz-004-m", product_id: "prod-004", ukuran: "M", stok: 18 },
  { id: "sz-004-l", product_id: "prod-004", ukuran: "L", stok: 14 },
  { id: "sz-004-xl", product_id: "prod-004", ukuran: "XL", stok: 5 },

  // prod-005 Technical Nylon Shell Windbreaker
  { id: "sz-005-m", product_id: "prod-005", ukuran: "M", stok: 4 },
  { id: "sz-005-l", product_id: "prod-005", ukuran: "L", stok: 5 },
  { id: "sz-005-xl", product_id: "prod-005", ukuran: "XL", stok: 2 },

  // prod-006 Modular Crossbody Sling Bag
  { id: "sz-006-all", product_id: "prod-006", ukuran: "ALL-SIZE", stok: 15 }
];

// Initial Seed Orders
const SEED_ORDERS = [
  {
    id: "ord-882109",
    user_id: "usr-cust-001",
    total_harga: 919000, // 899,000 + 20,000 ongkir
    status_pesanan: "Shipped",
    alamat_pengiriman: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190",
    resi_pengiriman: "JP-88992144701",
    courier: "J&T Express Super",
    created_at: "2026-10-14T09:30:00Z"
  },
  {
    id: "ord-774012",
    user_id: "usr-cust-002",
    total_harga: 998000, // 649,000 + 329,000 + 20,000 ongkir
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
    request_type: "exchange_size", // 'exchange_size' | 'defect_refund' | 'wrong_item'
    target_size: "M",
    reason: "Siluet bahu Size L terlalu drop. Minta tukar ke Size M.",
    condition_confirmed: true,
    video_unboxing_confirmed: true,
    photo_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80",
    status: "approved", // 'submitted' | 'approved' | 'rejected' | 'completed'
    admin_note: "Lolos audit QA. Slot Size M sudah di-lock di warehouse. Kirim unit lama ke Hub Logistik FOZZ.",
    return_tracking_no: "RET-JNT-4401928",
    replacement_tracking_no: "JP-9944112200",
    created_at: "2026-10-18T10:15:00Z"
  }
];

// Database Management Class (Emulates PostgreSQL Relational DB with LocalStorage)
class FozzDatabase {
  constructor() {
    this.init();
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
      // Default logged in as Customer (Ivan Pratama) for smooth exploration
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[1]));
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

    // Tambahkan size & stock terkait ke product_sizes (FK: product_id)
    const allSizes = this.getProductSizes();
    sizesData.forEach(sz => {
      allSizes.push({
        id: `sz-${Date.now().toString().slice(-4)}-${sz.ukuran.toLowerCase()}`,
        product_id: newProduct.id,
        ukuran: sz.ukuran,
        stok: Number(sz.stok)
      });
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCT_SIZES, JSON.stringify(allSizes));

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

  // --- Orders & Order Items (Alur Relasional & Trigger Pengurangan Stok Atomik) ---
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

  /**
   * Checkout Process:
   * 1. Membuat record di orders
   * 2. Membuat record terpisah di order_items (Foreign Key ke orders.id dan products.id, mengunci harga_satuan)
   * 3. Prosedur Trigger Atomik: Ketika status menjadi 'Paid', stok pada product_sizes dikurangi secara atomik
   */
  createOrder(userId, items, shippingAddress, courierName, shippingCost = 20000, initialStatus = "Paid") {
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

    const newOrderId = `ord-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: newOrderId,
      user_id: userId,
      total_harga: itemsTotal + shippingCost,
      status_pesanan: initialStatus,
      alamat_pengiriman: shippingAddress,
      resi_pengiriman: null,
      courier: courierName,
      created_at: new Date().toISOString()
    };

    // Tambahkan record ke order_items dengan harga terkunci (harga_satuan)
    items.forEach(it => {
      const prod = this.getProductById(it.productId);
      orderItems.push({
        id: `oi-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
        order_id: newOrderId,
        product_id: it.productId,
        ukuran: it.ukuran,
        jumlah: it.qty,
        harga_satuan: prod ? prod.harga : 0
      });

      // TRIGGER ATOMIK: Pengurangan stok pada product_sizes saat berstatus 'Paid'
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
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, resi = null) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const previousStatus = order.status_pesanan;
    order.status_pesanan = newStatus;
    if (resi !== null) {
      order.resi_pengiriman = resi;
    }

    // Jika sebelumnya Pending lalu sekarang Paid, jalankan trigger pengurangan stok
    if (previousStatus === "Pending" && newStatus === "Paid") {
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

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return order;
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
      request_type: data.request_type, // 'exchange_size' | 'defect_refund' | 'wrong_item'
      target_size: data.target_size || null,
      reason: data.reason,
      condition_confirmed: Boolean(data.condition_confirmed),
      video_unboxing_confirmed: Boolean(data.video_unboxing_confirmed),
      photo_url: data.photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
      status: "submitted", // 'submitted' | 'approved' | 'rejected' | 'completed'
      admin_note: "Tiket telah dibuat. Sedang dalam antrean review oleh Tim Quality Assurance.",
      return_tracking_no: null,
      replacement_tracking_no: null,
      created_at: new Date().toISOString()
    };
    returns.unshift(newReturn);
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
    return newReturn;
  }

  updateReturnStatus(returnId, newStatus, adminNote = null, replacementTracking = null) {
    const returns = this.getReturns();
    const item = returns.find(r => r.id === returnId);
    if (!item) return null;

    item.status = newStatus;
    if (adminNote) item.admin_note = adminNote;
    if (replacementTracking) item.replacement_tracking_no = replacementTracking;
    item.updated_at = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
    return item;
  }

  // Reset database back to default seed
  resetDatabase() {
    localStorage.clear();
    this.init();
  }
}

// Global Database Instance
const DB = new FozzDatabase();
