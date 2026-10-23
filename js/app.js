/**
 * FOZZ.CO - Application Core Logic
 * Mengelola Otentikasi Role-based, Rendering Katalog, Drawer Cart, Checkout Relasional,
 * dan Admin HQ Portal (CMS) sesuai dengan spesifikasi kedua dokumen PDF.
 */

class FozzApp {
  constructor() {
    this.currentRole = 'customer'; // 'customer' or 'admin'
    this.selectedCategory = 'ALL';
    this.searchQuery = '';
    this.selectedSizeFilter = '';
    this.activeModalProduct = null;
    this.selectedProductSize = null;

    this.init();
  }

  init() {
    this.initTheme();
    this.updateUserUI();
    this.renderCatalog();
    this.updateCartBadges();
    this.updateWishlistBadges();
    this.initAdminViews();
  }

  // Theme Management (Default: Ramah & Hangat / Friendly Warm Light)
  initTheme() {
    const savedTheme = localStorage.getItem('fozz_theme') || 'light';
    const label = document.getElementById('theme-toggle-text');
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      if (label) label.textContent = 'Tema: Brutal Dark';
    } else {
      document.body.removeAttribute('data-theme');
      if (label) label.textContent = 'Tema: Brutal Light';
    }
  }

  toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const label = document.getElementById('theme-toggle-text');
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('fozz_theme', 'light');
      if (label) label.textContent = 'Tema: Brutal Light';
      this.showToast('Beralih ke Tema Brutal Light (High Contrast)', 'success');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('fozz_theme', 'dark');
      if (label) label.textContent = 'Tema: Brutal Dark';
      this.showToast('Beralih ke Tema Brutal Dark (High Contrast)', 'info');
    }
  }

  // Helper Formatter Rupiah
  formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Toast Notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? '#10b981' : '#ff334b'}" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'transform 0.08s cubic-bezier(0, 0, 0.2, 1)';
      setTimeout(() => toast.remove(), 80);
    }, 2800);
  }

  // Switch between Customer Storefront and HQ Portal Admin (CMS)
  switchRole(role) {
    this.currentRole = role;
    const custView = document.getElementById('customer-view');
    const adminView = document.getElementById('admin-view');
    const btnCust = document.getElementById('btn-switch-customer');
    const btnAdmin = document.getElementById('btn-switch-admin');
    const roleLabel = document.getElementById('role-label');

    if (role === 'admin') {
      const adminUser = DB.getUsers().find(u => u.role === 'admin') || DB.getUsers()[0];
      DB.setCurrentUser(adminUser);

      custView.style.display = 'none';
      adminView.style.display = 'block';
      btnCust.classList.remove('active');
      btnAdmin.classList.add('active');
      roleLabel.textContent = `ADMIN HQ: ${adminUser.nama_lengkap}`;
      this.refreshAdminData();
      this.showToast('Beralih ke HQ Portal (Admin CMS - fozz.co/hq-portal)', 'success');
    } else {
      const custUser = DB.getUsers().find(u => u.role === 'customer') || DB.getUsers()[1];
      DB.setCurrentUser(custUser);

      custView.style.display = 'block';
      adminView.style.display = 'none';
      btnCust.classList.add('active');
      btnAdmin.classList.remove('active');
      roleLabel.textContent = `CUSTOMER: ${custUser.nama_lengkap}`;
      this.renderCatalog();
      this.showToast('Beralih ke Portal Publik Pelanggan (fozz.co)', 'info');
    }

    this.updateUserUI();
  }

  updateUserUI() {
    const currentUser = DB.getCurrentUser();
    const navName = document.getElementById('nav-user-name');
    if (navName && currentUser) {
      navName.textContent = currentUser.nama_lengkap;
    }
  }

  // --- CATALOG & EXPLORATION ---
  renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    let products = DB.getProducts();
    const wishlist = DB.getWishlist();

    // Category Filter
    if (this.selectedCategory !== 'ALL') {
      products = products.filter(p => p.kategori.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    // Search Query Filter
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => 
        p.nama_produk.toLowerCase().includes(q) ||
        p.deskripsi.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q)
      );
    }

    // Size Filter
    if (this.selectedSizeFilter !== '') {
      const allSizes = DB.getProductSizes();
      const productIdsWithSize = allSizes
        .filter(s => s.ukuran === this.selectedSizeFilter && s.stok > 0)
        .map(s => s.product_id);
      products = products.filter(p => productIdsWithSize.includes(p.id));
    }

    const countLabel = document.getElementById('product-count-label');
    if (countLabel) {
      countLabel.textContent = `Menampilkan ${products.length} artikel rilis`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>Tidak ada artikel yang cocok dengan filter</h3>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Coba reset kata kunci pencarian atau pilih kategori lain.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(prod => {
      const isFav = wishlist.includes(prod.id);
      const sizes = DB.getSizesForProduct(prod.id);
      const totalStock = sizes.reduce((acc, s) => acc + s.stok, 0);

      const sizesChips = sizes.map(s => `
        <span class="size-chip ${s.stok === 0 ? 'out-of-stock' : ''}">
          ${s.ukuran} (${s.stok})
        </span>
      `).join('');

      return `
        <article class="product-card" id="card-${prod.id}">
          <div class="product-img-wrapper" onclick="app.openProductModal('${prod.id}')" style="cursor: pointer;">
            <img src="${prod.gambar_url}" alt="${prod.nama_produk}" class="product-img" loading="lazy">
            <span class="product-badge">${totalStock > 0 ? 'AVAILABLE DROP' : 'SOLD OUT'}</span>
            <button class="product-wishlist-btn ${isFav ? 'active' : ''}" 
                    title="Simpan ke Wishlist" 
                    onclick="event.stopPropagation(); app.toggleWishlist('${prod.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? '#fff' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>

          <div class="product-details">
            <div class="product-category">${prod.kategori}</div>
            <h3 class="product-title" onclick="app.openProductModal('${prod.id}')" style="cursor: pointer;">${prod.nama_produk}</h3>
            <p class="product-desc">${prod.deskripsi}</p>
            
            <div class="product-sizes-row">
              ${sizesChips}
            </div>

            <div class="product-card-footer">
              <div class="product-price">${this.formatRupiah(prod.harga)}</div>
              <button class="btn-view-product" onclick="app.openProductModal('${prod.id}')">
                Detail & Beli
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  filterByCategory(category) {
    this.selectedCategory = category;
    const buttons = document.querySelectorAll('#category-pills .cat-btn');
    buttons.forEach(btn => {
      if (btn.textContent.trim().toLowerCase().includes(category.toLowerCase()) || 
         (category === 'ALL' && btn.textContent.includes('Semua'))) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderCatalog();
  }

  handleSearch(val) {
    this.searchQuery = val;
    this.renderCatalog();
  }

  handleSizeFilter(size) {
    this.selectedSizeFilter = size;
    this.renderCatalog();
  }

  // --- PRODUCT DETAIL MODAL ---
  openProductModal(productId) {
    const product = DB.getProductById(productId);
    if (!product) return;

    this.activeModalProduct = product;
    const sizes = DB.getSizesForProduct(productId);

    document.getElementById('modal-product-img').src = product.gambar_url;
    document.getElementById('modal-product-category').textContent = product.kategori;
    document.getElementById('modal-product-title').textContent = product.nama_produk;
    document.getElementById('modal-product-price').textContent = this.formatRupiah(product.harga);
    document.getElementById('modal-product-desc').textContent = product.deskripsi;

    // Wishlist Button State
    const wishlist = DB.getWishlist();
    const btnWishlist = document.getElementById('btn-modal-wishlist');
    if (wishlist.includes(product.id)) {
      btnWishlist.style.background = 'var(--accent-red)';
      btnWishlist.style.color = '#fff';
    } else {
      btnWishlist.style.background = '';
      btnWishlist.style.color = '';
    }

    // Render Sizes
    const sizesGroup = document.getElementById('modal-sizes-group');
    const firstAvailable = sizes.find(s => s.stok > 0);
    this.selectedProductSize = firstAvailable ? firstAvailable.ukuran : null;

    sizesGroup.innerHTML = sizes.map(s => {
      const isSelected = s.ukuran === this.selectedProductSize;
      const isOut = s.stok <= 0;
      return `
        <button class="size-select-btn ${isSelected ? 'active' : ''}" 
                ${isOut ? 'disabled' : ''} 
                onclick="app.selectProductSize('${s.ukuran}')">
          <span>${s.ukuran}</span>
          <small>${isOut ? 'Sold Out' : `${s.stok} stok`}</small>
        </button>
      `;
    }).join('');

    this.updateModalStockLabel();
    this.openModal('product-detail-modal');
  }

  selectProductSize(size) {
    this.selectedProductSize = size;
    const buttons = document.querySelectorAll('#modal-sizes-group .size-select-btn');
    buttons.forEach(btn => {
      const sizeText = btn.querySelector('span').textContent.trim();
      if (sizeText === size) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.updateModalStockLabel();
  }

  updateModalStockLabel() {
    const label = document.getElementById('selected-size-stock-label');
    const addBtn = document.getElementById('btn-modal-add-to-cart');
    if (!this.activeModalProduct || !this.selectedProductSize) {
      if (label) label.textContent = 'Silakan pilih ukuran yang tersedia';
      if (addBtn) addBtn.disabled = true;
      return;
    }

    const sizes = DB.getSizesForProduct(this.activeModalProduct.id);
    const targetSize = sizes.find(s => s.ukuran === this.selectedProductSize);

    if (targetSize && targetSize.stok > 0) {
      if (label) {
        label.textContent = `Tersedia ${targetSize.stok} pcs tersisa`;
        label.style.color = 'var(--accent-green)';
      }
      if (addBtn) addBtn.disabled = false;
    } else {
      if (label) {
        label.textContent = 'Ukuran ini habis (Sold Out)';
        label.style.color = 'var(--accent-red)';
      }
      if (addBtn) addBtn.disabled = true;
    }
  }

  addModalProductToCart() {
    if (!this.activeModalProduct || !this.selectedProductSize) return;

    DB.addToCart(this.activeModalProduct.id, this.selectedProductSize, 1);
    this.updateCartBadges();
    this.closeModal('product-detail-modal');
    this.toggleCartDrawer(true);
    this.showToast(`Slot ${this.activeModalProduct.nama_produk} (${this.selectedProductSize}) berhasil diamankan!`, 'success');
  }

  toggleWishlistFromModal() {
    if (!this.activeModalProduct) return;
    this.toggleWishlist(this.activeModalProduct.id);
    this.openProductModal(this.activeModalProduct.id); // re-render state
  }

  // --- CART & DRAWER ---
  toggleCartDrawer(isOpen) {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
      if (isOpen) {
        overlay.classList.add('open');
        this.renderCartItems();
      } else {
        overlay.classList.remove('open');
      }
    }
  }

  renderCartItems() {
    const body = document.getElementById('cart-drawer-body');
    const footer = document.getElementById('cart-drawer-footer');
    const badge = document.getElementById('cart-items-count-badge');
    const cart = DB.getCart();

    badge.textContent = `${cart.length} Item`;

    if (cart.length === 0) {
      body.innerHTML = `
        <div style="text-align: center; margin: auto; padding: 2rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <h4>Keranjang Anda Kosong</h4>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Eksplorasi koleksi rilis eksklusif FOZZ.CO sekarang.</p>
        </div>
      `;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    let subtotal = 0;

    body.innerHTML = cart.map((item, index) => {
      const prod = DB.getProductById(item.productId);
      if (!prod) return '';

      const lineTotal = prod.harga * item.qty;
      subtotal += lineTotal;

      return `
        <div class="cart-item">
          <img src="${prod.gambar_url}" alt="${prod.nama_produk}" class="cart-item-img">
          <div class="cart-item-info">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h4 class="cart-item-title">${prod.nama_produk}</h4>
              <button onclick="app.removeCartItem(${index})" style="background:none; border:none; color: var(--text-muted); cursor:pointer;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div class="cart-item-meta">Size: <strong style="color: var(--text-primary);">${item.ukuran}</strong> &bull; ${this.formatRupiah(prod.harga)}</div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="app.changeCartQty(${index}, -1)">-</button>
                <span style="font-weight: 700; font-size: 0.85rem; min-width: 18px; text-align: center;">${item.qty}</span>
                <button class="qty-btn" onclick="app.changeCartQty(${index}, 1)">+</button>
              </div>
              <span class="mono-text" style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${this.formatRupiah(lineTotal)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const shipping = 20000;
    document.getElementById('cart-subtotal').textContent = this.formatRupiah(subtotal);
    document.getElementById('cart-total').textContent = this.formatRupiah(subtotal + shipping);
  }

  changeCartQty(index, delta) {
    const cart = DB.getCart();
    if (cart[index]) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      DB.saveCart(cart);
      this.updateCartBadges();
      this.renderCartItems();
    }
  }

  removeCartItem(index) {
    DB.removeFromCart(index);
    this.updateCartBadges();
    this.renderCartItems();
    this.showToast('Item dihapus dari keranjang', 'info');
  }

  updateCartBadges() {
    const cart = DB.getCart();
    const count = cart.reduce((acc, it) => acc + it.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = count;
  }

  // --- WISHLIST ---
  toggleWishlist(productId) {
    const list = DB.toggleWishlist(productId);
    this.updateWishlistBadges();
    this.renderCatalog();
    const isSaved = list.includes(productId);
    this.showToast(isSaved ? 'Item disimpan ke Wishlist' : 'Item dihapus dari Wishlist', 'info');
  }

  updateWishlistBadges() {
    const wishlist = DB.getWishlist();
    const badge = document.getElementById('wishlist-badge');
    if (badge) badge.textContent = wishlist.length;
  }

  openWishlistModal() {
    const wishlist = DB.getWishlist();
    if (wishlist.length === 0) {
      this.showToast('Wishlist Anda masih kosong. Tandai item favorit Anda di katalog.', 'info');
      return;
    }
    // Filter by wishlist items
    this.selectedCategory = 'ALL';
    this.searchQuery = '';
    const grid = document.getElementById('products-grid');
    const allProducts = DB.getProducts();
    const favProducts = allProducts.filter(p => wishlist.includes(p.id));

    this.showToast(`Menampilkan ${favProducts.length} produk di Wishlist pribadi`, 'info');
    grid.innerHTML = favProducts.map(prod => `
      <article class="product-card">
        <div class="product-img-wrapper" onclick="app.openProductModal('${prod.id}')" style="cursor: pointer;">
          <img src="${prod.gambar_url}" alt="${prod.nama_produk}" class="product-img">
          <button class="product-wishlist-btn active" onclick="event.stopPropagation(); app.toggleWishlist('${prod.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
        <div class="product-details">
          <div class="product-category">${prod.kategori}</div>
          <h3 class="product-title">${prod.nama_produk}</h3>
          <div class="product-card-footer">
            <div class="product-price">${this.formatRupiah(prod.harga)}</div>
            <button class="btn-view-product" onclick="app.openProductModal('${prod.id}')">Lihat Detail</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // --- CHECKOUT & TRANSACTION INTEGRITY ---
  openCheckoutModal() {
    const cart = DB.getCart();
    if (cart.length === 0) {
      this.showToast('Keranjang masih kosong', 'info');
      return;
    }

    const currentUser = DB.getCurrentUser();
    const addressInput = document.getElementById('checkout-address');
    if (addressInput && currentUser && currentUser.alamat_default) {
      addressInput.value = currentUser.alamat_default;
    }

    let subtotal = 0;
    cart.forEach(it => {
      const prod = DB.getProductById(it.productId);
      if (prod) subtotal += prod.harga * it.qty;
    });

    const shipping = 20000;
    document.getElementById('checkout-grand-total').textContent = this.formatRupiah(subtotal + shipping);

    this.toggleCartDrawer(false);
    this.openModal('checkout-modal');
  }

  processCheckout(event) {
    event.preventDefault();
    const cart = DB.getCart();
    if (cart.length === 0) return;

    const currentUser = DB.getCurrentUser();
    const address = document.getElementById('checkout-address').value;
    const courier = document.getElementById('checkout-courier').value;

    // Relational Checkout Creation + Atomic Trigger:
    // 1. Record created in `orders`
    // 2. Line items created in `order_items` (locked price)
    // 3. Status set to 'Paid' -> atomik stock deduction trigger executed!
    const newOrder = DB.createOrder(currentUser.id, cart, address, courier, 20000, "Paid");

    this.closeModal('checkout-modal');
    this.updateCartBadges();
    this.renderCatalog(); // Refresh catalog to show updated stock
    this.showToast(`Drop #${newOrder.id} Berhasil Disikat! Slot terverifikasi.`, 'success');

    // Open order history to view the freshly created order
    setTimeout(() => {
      this.openOrderHistory();
    }, 400);
  }

  // --- ORDER HISTORY & REAL-TIME LOGISTICS TRACKING ---
  openOrderHistory() {
    const currentUser = DB.getCurrentUser();
    const container = document.getElementById('order-history-container');
    const allOrders = DB.getOrders();
    const myOrders = allOrders.filter(o => o.user_id === currentUser.id);

    if (myOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          <h3>Belum ada paket aktif untuk dilacak</h3>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Sikat artikel favorit Anda di katalog drop, lalu pantau resinya di sini.</p>
        </div>
      `;
    } else {
      container.innerHTML = myOrders.map(ord => {
        const items = DB.getOrderItems().filter(i => i.order_id === ord.id);
        const dateStr = new Date(ord.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        const statusClass = `status-${ord.status_pesanan.toLowerCase()}`;

        // Logistics Timeline Steps
        const isPaid = ord.status_pesanan === 'Paid' || ord.status_pesanan === 'Shipped' || ord.status_pesanan === 'Delivered';
        const isShipped = ord.status_pesanan === 'Shipped' || ord.status_pesanan === 'Delivered';
        const isDelivered = ord.status_pesanan === 'Delivered';

        const itemsSummary = items.map(it => {
          const prod = DB.getProductById(it.product_id);
          return `
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.25rem 0; color: var(--text-secondary);">
              <span>${prod ? prod.nama_produk : 'Artikel'} (${it.ukuran}) &times; ${it.jumlah}</span>
              <span class="mono-text" style="color: var(--text-primary);">${this.formatRupiah(it.harga_satuan * it.jumlah)}</span>
            </div>
          `;
        }).join('');

        return `
          <div class="stat-card" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div>
                <span class="mono-text" style="font-size: 0.75rem; color: var(--accent-red); font-weight: 700;">#${ord.id}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">&bull; ${dateStr}</span>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">Kurir: <strong style="color: var(--text-primary);">${ord.courier || 'Ekspedisi Reguler'}</strong></div>
              </div>
              <span class="status-pill ${statusClass}">${ord.status_pesanan}</span>
            </div>

            <!-- Items details -->
            <div style="background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1rem;">
              ${itemsSummary}
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; border-top: 1px dashed var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem;">
                <span>Total Pembayaran (Termasuk Ongkir):</span>
                <span class="mono-text" style="color: var(--accent-red);">${this.formatRupiah(ord.total_harga)}</span>
              </div>
            </div>

            <!-- Tracking & Airway Bill -->
            <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Nomor Resi (Airway Bill):</span>
                <span class="mono-text" style="font-weight: 700; color: ${ord.resi_pengiriman ? 'var(--accent-silver)' : 'var(--accent-gold)'};">
                  ${ord.resi_pengiriman ? ord.resi_pengiriman : 'Menunggu Input Resi oleh Admin'}
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Tujuan: ${ord.alamat_pengiriman}</div>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              ${ord.status_pesanan === 'Shipped' ? `
                <button class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem;" onclick="app.confirmDelivery('${ord.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Terima Paket & Selesaikan Pesanan
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    this.openModal('order-history-modal');
  }

  confirmDelivery(orderId) {
    DB.updateOrderStatus(orderId, 'Delivered');
    this.openOrderHistory();
    this.showToast(`Pesanan #${orderId} telah berhasil diselesaikan. Terima kasih!`, 'success');
  }

  // --- USER PROFILE ---
  openProfileModal() {
    const user = DB.getCurrentUser();
    if (!user) return;

    document.getElementById('profile-name').value = user.nama_lengkap;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.no_telepon || '';
    document.getElementById('profile-address').value = user.alamat_default || '';

    this.openModal('user-profile-modal');
  }

  saveProfile(event) {
    event.preventDefault();
    const user = DB.getCurrentUser();
    if (!user) return;

    user.nama_lengkap = document.getElementById('profile-name').value;
    user.no_telepon = document.getElementById('profile-phone').value;
    user.alamat_default = document.getElementById('profile-address').value;

    // Update in users table
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    DB.setCurrentUser(user);

    this.updateUserUI();
    this.closeModal('user-profile-modal');
    this.showToast('Profil dan alamat utama berhasil diperbarui', 'success');
  }

  // --- ADMIN HQ PORTAL (CMS) ---
  initAdminViews() {
    this.renderAdminDashboard();
    this.renderAdminInventory();
    this.renderAdminOrders();
    this.renderAdminCustomers();
  }

  refreshAdminData() {
    this.renderAdminDashboard();
    this.renderAdminInventory();
    this.renderAdminOrders();
    this.renderAdminCustomers();
  }

  switchAdminTab(tabName) {
    const tabs = ['dashboard', 'inventory', 'orders', 'customers'];
    tabs.forEach(t => {
      const view = document.getElementById(`admin-subview-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (view) view.style.display = t === tabName ? 'block' : 'none';
      if (btn) {
        if (t === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    if (tabName === 'dashboard') this.renderAdminDashboard();
    if (tabName === 'inventory') this.renderAdminInventory();
    if (tabName === 'orders') this.renderAdminOrders();
    if (tabName === 'customers') this.renderAdminCustomers();
  }

  renderAdminDashboard() {
    const orders = DB.getOrders();
    const orderItems = DB.getOrderItems();
    const products = DB.getProducts();

    // Calculate gross revenue (Paid + Shipped + Delivered)
    const paidOrders = orders.filter(o => ['Paid', 'Shipped', 'Delivered'].includes(o.status_pesanan));
    const grossRevenue = paidOrders.reduce((sum, o) => sum + o.total_harga, 0);
    const netRevenue = grossRevenue * 0.88; // Emulated net after cogs/processing

    const statsContainer = document.getElementById('analytics-stats-cards');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-card-title">Total Pendapatan Kotor</div>
          <div class="stat-card-val" style="color: var(--accent-red);">${this.formatRupiah(grossRevenue)}</div>
          <div class="stat-card-sub">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            +18.4% dari bulan lalu
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-title">Total Pendapatan Bersih (Net)</div>
          <div class="stat-card-val">${this.formatRupiah(netRevenue)}</div>
          <div class="stat-card-sub" style="color: var(--accent-green);">Margin Bersih Sehat</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-title">Total Pesanan Selesai / Terbayar</div>
          <div class="stat-card-val">${paidOrders.length} Pesanan</div>
          <div class="stat-card-sub" style="color: var(--accent-blue);">Konversi Checkout 94%</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-title">Artikel Aktif di Katalog</div>
          <div class="stat-card-val">${products.length} Artikel</div>
          <div class="stat-card-sub" style="color: var(--accent-silver);">Sinkronisasi Relasional Aktif</div>
        </div>
      `;
    }

    // Dashboard Recent Orders Table
    const recentTable = document.getElementById('dashboard-recent-orders-table');
    if (recentTable) {
      recentTable.innerHTML = `
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Total Tagihan</th>
            <th>Status</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          ${orders.slice(0, 5).map(o => `
            <tr>
              <td><span class="mono-text" style="color: var(--accent-red); font-weight:700;">#${o.id}</span></td>
              <td class="mono-text font-weight-bold">${this.formatRupiah(o.total_harga)}</td>
              <td><span class="status-pill status-${o.status_pesanan.toLowerCase()}">${o.status_pesanan}</span></td>
              <td style="color: var(--text-muted); font-size: 0.75rem;">${new Date(o.created_at).toLocaleDateString('id-ID')}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }

    // Best Sellers Calculation
    const productSales = {};
    orderItems.forEach(item => {
      productSales[item.product_id] = (productSales[item.product_id] || 0) + item.jumlah;
    });

    const bestSellersList = document.getElementById('best-sellers-list');
    if (bestSellersList) {
      const sortedProds = Object.keys(productSales)
        .map(pid => ({ product: DB.getProductById(pid), count: productSales[pid] }))
        .filter(item => item.product)
        .sort((a, b) => b.count - a.count);

      if (sortedProds.length === 0) {
        bestSellersList.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">Belum ada data penjualan tercatat.</p>`;
      } else {
        bestSellersList.innerHTML = sortedProds.slice(0, 4).map(it => `
          <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-muted); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <img src="${it.product.gambar_url}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;">
            <div style="flex-grow: 1;">
              <div style="font-size: 0.82rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; color: var(--text-primary);">${it.product.nama_produk}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${this.formatRupiah(it.product.harga)}</div>
            </div>
            <span class="role-bar-badge" style="font-size: 0.72rem;">${it.count} Sold</span>
          </div>
        `).join('');
      }
    }
  }

  // --- ADMIN: INVENTORY MANAGEMENT ---
  renderAdminInventory() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    const products = DB.getProducts();
    const sizes = DB.getProductSizes();

    tbody.innerHTML = products.map(prod => {
      const prodSizes = sizes.filter(s => s.product_id === prod.id);
      const totalStock = prodSizes.reduce((sum, s) => sum + s.stok, 0);

      const sizeInputs = prodSizes.map(s => `
        <div style="display: inline-flex; align-items: center; gap: 0.35rem; margin-right: 0.5rem; margin-bottom: 0.25rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">${s.ukuran}:</span>
          <input type="number" 
                 value="${s.stok}" 
                 min="0" 
                 style="width: 55px; padding: 0.25rem 0.4rem; font-size: 0.78rem;" 
                 onchange="app.saveStockAdjustment('${s.id}', this.value)">
        </div>
      `).join('');

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${prod.gambar_url}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px;">
              <div>
                <strong style="color: var(--text-primary); font-size: 0.9rem;">${prod.nama_produk}</strong>
                <div class="mono-text" style="font-size: 0.72rem; color: var(--text-muted);">${prod.id}</div>
              </div>
            </div>
          </td>
          <td><span class="role-bar-badge">${prod.kategori}</span></td>
          <td class="mono-text font-weight-bold">${this.formatRupiah(prod.harga)}</td>
          <td>
            <div style="display: flex; flex-wrap: wrap;">${sizeInputs}</div>
          </td>
          <td>
            <strong style="color: ${totalStock > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
              ${totalStock} pcs
            </strong>
          </td>
          <td>
            <button class="role-btn" onclick="app.openProductModal('${prod.id}')" title="Preview Tampilan">
              Lihat Preview
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  saveStockAdjustment(sizeId, newStock) {
    const updated = DB.updateStock(sizeId, newStock);
    if (updated) {
      this.showToast(`Stok ukuran ${updated.ukuran} berhasil diubah menjadi ${updated.stok}`, 'success');
      this.renderCatalog();
    }
  }

  openAddProductModal() {
    this.openModal('add-product-modal');
  }

  handleAddNewProduct(event) {
    event.preventDefault();

    const productData = {
      nama_produk: document.getElementById('new-prod-name').value,
      kategori: document.getElementById('new-prod-cat').value,
      harga: document.getElementById('new-prod-price').value,
      deskripsi: document.getElementById('new-prod-desc').value,
      gambar_url: document.getElementById('new-prod-img').value
    };

    const sizesData = [
      { ukuran: 'S', stok: document.getElementById('new-stock-s').value },
      { ukuran: 'M', stok: document.getElementById('new-stock-m').value },
      { ukuran: 'L', stok: document.getElementById('new-stock-l').value },
      { ukuran: 'XL', stok: document.getElementById('new-stock-xl').value }
    ];

    const newProd = DB.addProduct(productData, sizesData);
    this.closeModal('add-product-modal');
    this.refreshAdminData();
    this.renderCatalog();
    this.showToast(`Koleksi "${newProd.nama_produk}" berhasil dirilis ke database!`, 'success');
  }

  // --- ADMIN: ORDERS FULFILLMENT ---
  renderAdminOrders() {
    const tbody = document.getElementById('admin-orders-table-body');
    if (!tbody) return;

    const orders = DB.getOrders();
    const orderItems = DB.getOrderItems();

    tbody.innerHTML = orders.map(ord => {
      const user = DB.getUserById(ord.user_id);
      const items = orderItems.filter(i => i.order_id === ord.id);

      const itemsDesc = items.map(it => {
        const prod = DB.getProductById(it.product_id);
        return `${prod ? prod.nama_produk : 'Item'} (${it.ukuran}) &times; ${it.jumlah}`;
      }).join('<br>');

      return `
        <tr>
          <td>
            <span class="mono-text" style="font-weight: 700; color: var(--accent-red);">#${ord.id}</span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${new Date(ord.created_at).toLocaleDateString('id-ID')}</div>
          </td>
          <td>
            <strong style="color: var(--text-primary);">${user ? user.nama_lengkap : 'Pelanggan'}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${user ? user.email : ''}</div>
            <div style="font-size: 0.7rem; color: var(--text-secondary); max-width: 180px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${ord.alamat_pengiriman}
            </div>
          </td>
          <td style="font-size: 0.8rem; line-height: 1.4;">${itemsDesc}</td>
          <td class="mono-text font-weight-bold">${this.formatRupiah(ord.total_harga)}</td>
          <td>
            <select style="font-size: 0.78rem; padding: 0.35rem 0.6rem;" onchange="app.adminChangeOrderStatus('${ord.id}', this.value)">
              <option value="Pending" ${ord.status_pesanan === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Paid" ${ord.status_pesanan === 'Paid' ? 'selected' : ''}>Paid (Terbayar)</option>
              <option value="Shipped" ${ord.status_pesanan === 'Shipped' ? 'selected' : ''}>Shipped (Dikirim)</option>
              <option value="Delivered" ${ord.status_pesanan === 'Delivered' ? 'selected' : ''}>Delivered (Selesai)</option>
              <option value="Canceled" ${ord.status_pesanan === 'Canceled' ? 'selected' : ''}>Canceled (Batal)</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <input type="text" 
                     id="resi-input-${ord.id}" 
                     placeholder="No. Resi J&T/SiCepat" 
                     value="${ord.resi_pengiriman || ''}" 
                     class="mono-text"
                     style="width: 140px; padding: 0.35rem 0.5rem; font-size: 0.75rem;">
              <button class="role-btn" onclick="app.adminSaveResi('${ord.id}')">Simpan</button>
            </div>
          </td>
          <td>
            <button class="btn-outline-red" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="app.adminCancelFraudOrder('${ord.id}')">
              Batalkan Fraud
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  adminChangeOrderStatus(orderId, newStatus) {
    DB.updateOrderStatus(orderId, newStatus);
    this.refreshAdminData();
    this.showToast(`Status pesanan #${orderId} diubah menjadi "${newStatus}"`, 'success');
  }

  adminSaveResi(orderId) {
    const input = document.getElementById(`resi-input-${orderId}`);
    if (input) {
      const resiValue = input.value.trim();
      DB.updateOrderStatus(orderId, 'Shipped', resiValue);
      this.refreshAdminData();
      this.showToast(`Resi ${resiValue} berhasil dialokasikan dan status diperbarui ke "Shipped"`, 'success');
    }
  }

  adminCancelFraudOrder(orderId) {
    if (confirm(`Yakin ingin membatalkan pesanan #${orderId} karena aktivitas terindikasi fraud?`)) {
      DB.updateOrderStatus(orderId, 'Canceled');
      this.refreshAdminData();
      this.showToast(`Pesanan #${orderId} telah dibatalkan.`, 'info');
    }
  }

  // --- ADMIN: CUSTOMER DIRECTORY (ZERO-TRUST) ---
  renderAdminCustomers() {
    const tbody = document.getElementById('admin-customers-table-body');
    if (!tbody) return;

    const users = DB.getUsers();
    tbody.innerHTML = users.map(u => `
      <tr>
        <td class="mono-text" style="color: var(--accent-red); font-size: 0.75rem;">${u.id}</td>
        <td><strong style="color: var(--text-primary);">${u.nama_lengkap}</strong></td>
        <td>${u.email}</td>
        <td>
          <span class="role-bar-badge" style="${u.role === 'admin' ? 'border-color: var(--accent-red);' : 'border-color: var(--accent-blue); color: var(--accent-blue); background: rgba(37,99,235,0.1);'}">
            ${u.role.toUpperCase()}
          </span>
        </td>
        <td>${u.no_telepon || '-'}</td>
        <td>
          <code class="mono-text" style="font-size: 0.72rem; color: var(--text-muted); background: var(--bg-muted); padding: 0.2rem 0.4rem; border-radius: 4px;">
            ${u.password_hash.slice(0, 15)}...[Argon2/Bcrypt Secured]
          </code>
        </td>
        <td>
          <span class="status-pill status-paid">ACTIVE</span>
        </td>
      </tr>
    `).join('');
  }

  // --- MODAL UTILITIES ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  openSchemaModal() {
    this.openModal('schema-modal');
  }

  navigateTo(section) {
    if (section === 'catalog') {
      this.selectedCategory = 'ALL';
      this.searchQuery = '';
      this.renderCatalog();
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }
}

// Global Application Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new FozzApp();
});
