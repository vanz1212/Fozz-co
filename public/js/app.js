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
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" onclick="app.openReturnRequestForOrder('${ord.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                Ajukan Retur / Tukar
              </button>
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
    this.renderAdminReturns();
    this.updateAdminReturnsBadge();
  }

  refreshAdminData() {
    this.renderAdminDashboard();
    this.renderAdminInventory();
    this.renderAdminOrders();
    this.renderAdminCustomers();
    this.renderAdminReturns();
    this.updateAdminReturnsBadge();
  }

  switchAdminTab(tabName) {
    const tabs = ['dashboard', 'inventory', 'orders', 'customers', 'returns'];
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
    if (tabName === 'returns') this.renderAdminReturns();
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

  navigateTo(section, params = {}) {
    const catalogView = document.getElementById('customer-catalog-view');
    const returnsView = document.getElementById('customer-returns-view');
    const navCatalog = document.getElementById('nav-link-catalog');
    const navReturns = document.getElementById('nav-link-returns');

    if (section === 'catalog') {
      if (catalogView) catalogView.style.display = 'block';
      if (returnsView) returnsView.style.display = 'none';
      if (navCatalog) navCatalog.classList.add('active');
      if (navReturns) navReturns.classList.remove('active');
      this.selectedCategory = 'ALL';
      this.searchQuery = '';
      this.renderCatalog();
      window.scrollTo({ top: params.scrollToProducts ? 400 : 0, behavior: 'smooth' });
    } else if (section === 'returns') {
      if (catalogView) catalogView.style.display = 'none';
      if (returnsView) returnsView.style.display = 'block';
      if (navCatalog) navCatalog.classList.remove('active');
      if (navReturns) navReturns.classList.add('active');
      this.renderReturnsPage(params.orderId);
      if (params.scrollToRMA) {
        setTimeout(() => {
          const rmaCard = document.getElementById('rma-portal-card');
          if (rmaCard) rmaCard.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // --- RETURNS & EXCHANGE SYSTEM (RMA PORTAL) ---
  renderReturnsPage(preselectedOrderId = null) {
    const user = DB.getCurrentUser();
    const orderSelect = document.getElementById('return-order-select');
    if (!orderSelect) return;

    const orders = user ? DB.getOrders().filter(o => o.user_id === user.id) : DB.getOrders();

    orderSelect.innerHTML = `
      <option value="">-- Pilih Pesanan yang Ingin Diretur/Ditukar --</option>
      ${orders.map(o => {
        const dateStr = new Date(o.created_at).toLocaleDateString('id-ID');
        return `<option value="${o.id}" ${o.id === preselectedOrderId ? 'selected' : ''}>#${o.id} &bull; Status: ${o.status_pesanan} &bull; ${this.formatRupiah(o.total_harga)} (${dateStr})</option>`;
      }).join('')}
    `;

    if (preselectedOrderId) {
      orderSelect.value = preselectedOrderId;
      this.handleReturnOrderSelect(preselectedOrderId);
    } else if (orders.length > 0) {
      orderSelect.value = orders[0].id;
      this.handleReturnOrderSelect(orders[0].id);
    }

    this.renderMyReturnsList();
  }

  handleReturnOrderSelect(orderId) {
    const prodSelect = document.getElementById('return-product-select');
    if (!prodSelect) return;

    if (!orderId) {
      prodSelect.innerHTML = `<option value="">-- Pilih pesanan terlebih dahulu --</option>`;
      return;
    }

    const items = DB.getOrderItems().filter(i => i.order_id === orderId);
    if (items.length === 0) {
      prodSelect.innerHTML = `<option value="">Tidak ada artikel dalam pesanan ini</option>`;
      return;
    }

    prodSelect.innerHTML = items.map(item => {
      const prod = DB.getProductById(item.product_id);
      const name = prod ? prod.nama_produk : 'Artikel Streetwear';
      return `<option value="${item.product_id}|${item.ukuran}|${name}">${name} (Size ${item.ukuran}) &times; ${item.jumlah} pcs</option>`;
    }).join('');

    this.handleReturnProductSelect(prodSelect.value);
  }

  handleReturnProductSelect(val) {
    if (!val) return;
    const [productId, currentSize] = val.split('|');
    const targetSizeSelect = document.getElementById('target-size-select');
    const stockStatus = document.getElementById('target-size-stock-status');
    if (!targetSizeSelect) return;

    const allSizes = DB.getSizesForProduct(productId);
    targetSizeSelect.innerHTML = `
      <option value="">-- Pilih Ukuran Pengganti --</option>
      ${allSizes.map(s => {
        const isCurrent = s.ukuran === currentSize;
        const isAvailable = s.stok > 0;
        return `<option value="${s.ukuran}" ${isCurrent ? 'disabled' : ''} ${!isAvailable ? 'disabled' : ''}>
          Size ${s.ukuran} ${isCurrent ? '(Ukuran Saat Ini)' : (isAvailable ? `(Tersedia: ${s.stok} pcs)` : '(Stok Habis)')}
        </option>`;
      }).join('')}
    `;

    if (stockStatus) stockStatus.textContent = '';
  }

  handleReturnTypeChange(type) {
    const targetContainer = document.getElementById('target-size-container');
    const cardEx = document.getElementById('type-card-exchange');
    const cardDef = document.getElementById('type-card-defect');
    const cardWr = document.getElementById('type-card-wrong');

    if (cardEx) cardEx.classList.toggle('active', type === 'exchange_size');
    if (cardDef) cardDef.classList.toggle('active', type === 'defect_refund');
    if (cardWr) cardWr.classList.toggle('active', type === 'wrong_item');

    if (targetContainer) {
      targetContainer.style.display = type === 'exchange_size' ? 'block' : 'none';
      const targetSelect = document.getElementById('target-size-select');
      if (targetSelect) {
        if (type === 'exchange_size') targetSelect.setAttribute('required', 'required');
        else targetSelect.removeAttribute('required');
      }
    }
  }

  handleTargetSizeChange(size) {
    const stockStatus = document.getElementById('target-size-stock-status');
    if (!stockStatus) return;
    if (size) {
      stockStatus.textContent = `Pilihan: Size ${size} (Siap dialokasikan)`;
    } else {
      stockStatus.textContent = '';
    }
  }

  submitReturnRequest(event) {
    event.preventDefault();
    const user = DB.getCurrentUser();
    if (!user) {
      this.showToast('Silakan login terlebih dahulu untuk mengajukan retur.', 'info');
      return;
    }

    const orderId = document.getElementById('return-order-select').value;
    const prodVal = document.getElementById('return-product-select').value;
    const returnType = document.querySelector('input[name="return_type"]:checked')?.value || 'exchange_size';
    const targetSize = document.getElementById('target-size-select')?.value || null;
    const reason = document.getElementById('return-reason').value.trim();
    const photoUrl = document.getElementById('return-photo-url').value.trim();
    const checkHangtag = document.getElementById('check-hangtag').checked;
    const checkUnboxing = document.getElementById('check-unboxing').checked;

    if (!orderId || !prodVal) {
      this.showToast('Pilih nomor pesanan dan artikel yang ingin diajukan retur!', 'info');
      return;
    }

    if (returnType === 'exchange_size' && !targetSize) {
      this.showToast('Pilih ukuran baru pengganti yang diinginkan!', 'info');
      return;
    }

    if (!checkHangtag || !checkUnboxing) {
      this.showToast('Anda wajib mengonfirmasi seluruh syarat kondisi produk & video unboxing.', 'info');
      return;
    }

    const [productId, currentSize, productName] = prodVal.split('|');

    const newTicket = DB.createReturnRequest({
      order_id: orderId,
      user_id: user.id,
      product_id: productId,
      product_name: productName,
      current_size: currentSize,
      request_type: returnType,
      target_size: targetSize,
      reason: reason,
      condition_confirmed: true,
      video_unboxing_confirmed: true,
      photo_url: photoUrl || undefined
    });

    this.showToast(`Tiket RMA #${newTicket.id} berhasil diterbitkan! Tim QA FOZZ akan meninjau dalam 1x24 jam.`, 'success');
    document.getElementById('return-reason').value = '';
    document.getElementById('return-photo-url').value = '';
    document.getElementById('check-hangtag').checked = false;
    document.getElementById('check-unboxing').checked = false;

    this.renderMyReturnsList();
    this.updateAdminReturnsBadge();
  }

  renderMyReturnsList() {
    const container = document.getElementById('my-returns-list');
    const badge = document.getElementById('my-returns-count-badge');
    if (!container) return;

    const user = DB.getCurrentUser();
    const returns = user ? DB.getReturnsByUserId(user.id) : DB.getReturns();

    if (badge) badge.textContent = `${returns.length} Tiket`;

    if (returns.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.85rem; border: 2px dashed var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card);">
          <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📦</div>
          Belum ada riwayat pengajuan retur aktif.<br>Jika produk Anda mengalami kendala ukuran atau cacat jahitan, silakan isi formulir di samping.
        </div>
      `;
      return;
    }

    container.innerHTML = returns.map(item => {
      const dateStr = new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      const typeLabel = item.request_type === 'exchange_size' ? 'Tukar Ukuran' : (item.request_type === 'defect_refund' ? 'Cacat Produksi' : 'Salah Kirim');

      let statusBadge = '';
      if (item.status === 'submitted') statusBadge = '<span class="status-pill status-pending">Menunggu Review QA</span>';
      else if (item.status === 'approved') statusBadge = '<span class="status-pill status-paid">Disetujui QA</span>';
      else if (item.status === 'rejected') statusBadge = '<span class="status-pill status-canceled">Ditolak</span>';
      else if (item.status === 'completed') statusBadge = '<span class="status-pill status-delivered">Selesai (Completed)</span>';
      else statusBadge = `<span class="status-pill">${item.status}</span>`;

      const isStep1Done = true;
      const isStep2Done = item.status === 'approved' || item.status === 'completed';
      const isStep3Done = item.return_tracking_no !== null || item.status === 'completed';
      const isStep4Done = item.status === 'completed';

      return `
        <div class="rma-ticket-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <span class="mono-text" style="font-weight: 800; font-size: 0.85rem; color: var(--accent-red);">${item.id}</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">Ref: Order #${item.order_id} &bull; ${dateStr}</div>
            </div>
            ${statusBadge}
          </div>

          <div style="background: var(--bg-muted); border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 0.75rem;">
            <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-primary); margin-bottom: 0.2rem;">
              ${item.product_name}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; gap: 0.75rem;">
              <span>Tipe: <strong>${typeLabel}</strong></span>
              <span>Ukuran: <strong style="text-decoration: line-through; opacity: 0.7;">Size ${item.current_size}</strong> &rarr; <strong style="color: var(--accent-green);">Size ${item.target_size || 'Refund/Ganti'}</strong></span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; font-style: italic;">
              "${item.reason}"
            </div>
          </div>

          <!-- RMA Timeline -->
          <div class="rma-status-timeline">
            <div class="rma-timeline-step ${isStep1Done ? 'completed' : ''}">
              <div class="rma-timeline-dot">1</div>
              <span class="rma-timeline-label">Diajukan</span>
            </div>
            <div class="rma-timeline-step ${isStep2Done ? 'completed' : (item.status === 'submitted' ? 'active' : '')}">
              <div class="rma-timeline-dot">2</div>
              <span class="rma-timeline-label">Review QA</span>
            </div>
            <div class="rma-timeline-step ${isStep3Done ? 'completed' : (item.status === 'approved' ? 'active' : '')}">
              <div class="rma-timeline-dot">3</div>
              <span class="rma-timeline-label">Kirim Unit</span>
            </div>
            <div class="rma-timeline-step ${isStep4Done ? 'completed' : ''}">
              <div class="rma-timeline-dot">4</div>
              <span class="rma-timeline-label">Selesai</span>
            </div>
          </div>

          <!-- QA Feedback / Tracking Notes -->
          <div style="font-size: 0.75rem; background: var(--bg-subtle); border-left: 3px solid var(--accent-red); padding: 0.5rem 0.75rem; margin-top: 0.75rem;">
            <strong>Catatan QA HQ:</strong> ${item.admin_note || 'Sedang dalam antrean review spesifikasi.'}
            ${item.replacement_tracking_no ? `
              <div style="margin-top: 0.25rem;">
                Resi Unit Pengganti: <strong class="mono-text" style="color: var(--accent-blue);">${item.replacement_tracking_no}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  openReturnRequestForOrder(orderId) {
    this.closeModal('order-history-modal');
    this.navigateTo('returns', { orderId, scrollToRMA: true });
  }

  refreshReturnsData() {
    this.renderReturnsPage();
    this.showToast('Data tiket retur dan stok ukuran telah disinkronkan!', 'info');
  }

  toggleFaq(element) {
    element.classList.toggle('open');
  }

  copyHubAddress() {
    const text = "FOZZ.CO DISTRIBUTION CENTER & RMA HUB\nGedung Urban Streetwear Pavilion Lt. 3\nJl. Senopati No. 42, RT 06 / RW 02, Kebayoran Baru, Jakarta Selatan 12190\nUP: Tim Quality Assurance RMA (+62 811-3699-2273)";
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Alamat Hub Logistik FOZZ berhasil disalin ke clipboard!', 'success');
    }).catch(() => {
      this.showToast('Alamat: Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190', 'info');
    });
  }

  // --- ADMIN: RMA TICKETS MANAGEMENT ---
  updateAdminReturnsBadge() {
    const badge = document.getElementById('admin-returns-badge');
    if (!badge) return;
    const returns = DB.getReturns();
    const pendingCount = returns.filter(r => r.status === 'submitted' || r.status === 'approved').length;
    badge.textContent = pendingCount;
  }

  renderAdminReturns() {
    const tbody = document.getElementById('admin-returns-table-body');
    if (!tbody) return;

    this.updateAdminReturnsBadge();
    const returns = DB.getReturns();

    if (returns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada tiket permohonan retur aktif saat ini.</td></tr>`;
      return;
    }

    tbody.innerHTML = returns.map(item => {
      const user = DB.getUserById(item.user_id);
      const dateStr = new Date(item.created_at).toLocaleDateString('id-ID');

      return `
        <tr>
          <td>
            <span class="mono-text" style="color: var(--accent-red); font-weight: 700;">${item.id}</span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${dateStr}</div>
          </td>
          <td>
            <strong>${user ? user.nama_lengkap : 'Pelanggan'}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${user ? user.email : ''}</div>
            <div style="font-size: 0.72rem; color: var(--accent-blue); font-family: var(--font-mono);">Ref: #${item.order_id}</div>
          </td>
          <td>
            <strong style="color: var(--text-primary); font-size: 0.82rem;">${item.product_name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">
              Size Saat Ini: <strong style="text-decoration: line-through;">${item.current_size}</strong>
              ${item.target_size ? `&rarr; Size Target: <strong style="color: var(--accent-green);">${item.target_size}</strong>` : ''}
            </div>
          </td>
          <td style="max-width: 200px;">
            <span class="role-bar-badge" style="font-size: 0.68rem; margin-bottom: 0.35rem;">
              ${item.request_type === 'exchange_size' ? 'Tukar Ukuran' : (item.request_type === 'defect_refund' ? 'Cacat Produksi' : 'Salah Kirim')}
            </span>
            <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
              "${item.reason}"
            </div>
          </td>
          <td>
            <select style="font-size: 0.78rem; padding: 0.35rem 0.6rem;" onchange="app.adminChangeReturnStatus('${item.id}', this.value)">
              <option value="submitted" ${item.status === 'submitted' ? 'selected' : ''}>Submitted (Review QA)</option>
              <option value="approved" ${item.status === 'approved' ? 'selected' : ''}>Approved (Disetujui)</option>
              <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Rejected (Ditolak)</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed (Selesai)</option>
            </select>
          </td>
          <td>
            <input type="text" 
                   id="admin-return-note-${item.id}" 
                   value="${item.admin_note || ''}" 
                   placeholder="Catatan QA untuk pembeli"
                   style="font-size: 0.75rem; padding: 0.35rem 0.5rem; width: 170px;"
                   onchange="app.adminSaveReturnNote('${item.id}', this.value)">
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <input type="text" 
                     id="admin-return-tracking-${item.id}" 
                     value="${item.replacement_tracking_no || ''}" 
                     placeholder="Resi Unit Baru"
                     class="mono-text"
                     style="font-size: 0.75rem; padding: 0.35rem 0.5rem; width: 130px;">
              <button class="role-btn" onclick="app.adminSaveReturnTracking('${item.id}')">Kirim Resi</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  adminChangeReturnStatus(returnId, newStatus) {
    DB.updateReturnStatus(returnId, newStatus);
    this.renderAdminReturns();
    this.showToast(`Status tiket RMA #${returnId} diubah menjadi "${newStatus}"`, 'success');
  }

  adminSaveReturnNote(returnId, note) {
    DB.updateReturnStatus(returnId, null, note);
    this.showToast(`Catatan QA untuk RMA #${returnId} berhasil disimpan!`, 'info');
  }

  adminSaveReturnTracking(returnId) {
    const input = document.getElementById(`admin-return-tracking-${returnId}`);
    if (input) {
      const tracking = input.value.trim();
      DB.updateReturnStatus(returnId, 'completed', 'Unit baru telah dikirimkan ke alamat Anda.', tracking);
      this.renderAdminReturns();
      this.showToast(`Resi unit baru ${tracking} berhasil dialokasikan & RMA diselesaikan!`, 'success');
    }
  }
}

// Global Application Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new FozzApp();
});
