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
    this.initRouting();
    this.updateUserUI();
    this.renderCatalog();
    this.updateCartBadges();
    this.updateWishlistBadges();
    this.initAdminViews();
    this.initHeroPatternAnimation();

    // Listener Real-time Cloud Sync Supabase
    window.addEventListener('fozz:data-synced', () => {
      this.renderCatalog();
      this.updateCartBadges();
      this.updateWishlistBadges();
      if (this.currentRole === 'admin') {
        this.renderAdminInventory();
        this.renderAdminOrders();
        this.renderAdminAnalytics();
        this.renderAdminReturns();
      }
    });
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
    this.updateThemeIcons();
  }

  toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const label = document.getElementById('theme-toggle-text');
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('fozz_theme', 'light');
      if (label) label.textContent = 'Tema: Brutal Light';
      this.showToast('Tema: Brutal Light aktif.', 'success');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('fozz_theme', 'dark');
      if (label) label.textContent = 'Tema: Brutal Dark';
      this.showToast('Tema: Brutal Dark aktif.', 'info');
    }
    this.updateThemeIcons();
  }

  updateThemeIcons() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(el => {
      el.innerHTML = isDark 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    });
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

  // --- ROUTING & ADMIN ACCESS GATE ---
  initRouting() {
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  }

  handleRouting() {
    const hash = window.location.hash;
    if (hash === '#admin' || hash === '#/admin' || window.location.pathname === '/admin') {
      const user = DB.getCurrentUser();
      const isAdminAuthenticated = sessionStorage.getItem('fozz_admin_authenticated') === 'true';
      if (user && user.role === 'admin' && isAdminAuthenticated) {
        this.showAdminView();
      } else {
        this.showCustomerView();
        this.openAdminLoginModal();
      }
    } else {
      this.showCustomerView();
    }
  }

  requestAdminAccess(event) {
    if (event) event.preventDefault();
    const user = DB.getCurrentUser();
    const isAdminAuthenticated = sessionStorage.getItem('fozz_admin_authenticated') === 'true';
    if (user && user.role === 'admin' && isAdminAuthenticated) {
      window.location.hash = '#admin';
      this.showAdminView();
    } else {
      this.openAdminLoginModal();
    }
  }

  openAdminLoginModal() {
    const errorEl = document.getElementById('admin-login-error');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    const emailInput = document.getElementById('admin-login-email');
    const passInput = document.getElementById('admin-login-password');
    if (passInput) passInput.value = '';

    const passToggleIcon = document.getElementById('admin-pass-toggle-icon');
    const passToggleText = document.getElementById('admin-pass-toggle-text');
    if (passInput) passInput.type = 'password';
    if (passToggleIcon) passToggleIcon.textContent = '👁️';
    if (passToggleText) passToggleText.textContent = 'Lihat';

    this.openModal('admin-login-modal');
    setTimeout(() => {
      if (emailInput && !emailInput.value) {
        emailInput.focus();
      } else if (passInput) {
        passInput.focus();
      }
    }, 120);
  }

  toggleAdminPasswordVisibility() {
    const passInput = document.getElementById('admin-login-password');
    const passToggleIcon = document.getElementById('admin-pass-toggle-icon');
    const passToggleText = document.getElementById('admin-pass-toggle-text');
    if (!passInput) return;

    if (passInput.type === 'password') {
      passInput.type = 'text';
      if (passToggleIcon) passToggleIcon.textContent = '🙈';
      if (passToggleText) passToggleText.textContent = 'Sembunyikan';
    } else {
      passInput.type = 'password';
      if (passToggleIcon) passToggleIcon.textContent = '👁️';
      if (passToggleText) passToggleText.textContent = 'Lihat';
    }
  }

  fillDemoAdminCreds() {
    const emailInput = document.getElementById('admin-login-email');
    const passInput = document.getElementById('admin-login-password');
    const errorEl = document.getElementById('admin-login-error');
    if (emailInput) emailInput.value = 'admin@fozz.co';
    if (passInput) passInput.value = 'admin123';
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    this.showToast('Kredensial demo terisi (admin@fozz.co / admin123). Klik Autentikasi untuk masuk.', 'info');
  }

  handleAdminLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('admin-login-email');
    const passwordInput = document.getElementById('admin-login-password');
    const errorEl = document.getElementById('admin-login-error');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email) {
      if (errorEl) {
        errorEl.textContent = 'Silakan masukkan alamat email administrator.';
        errorEl.style.display = 'block';
      }
      if (emailInput) emailInput.focus();
      return;
    }

    if (!password) {
      if (errorEl) {
        errorEl.textContent = 'Silakan masukkan kata sandi (password) administrator.';
        errorEl.style.display = 'block';
      }
      if (passwordInput) passwordInput.focus();
      return;
    }

    const users = DB.getUsers();
    const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // 1. Cek apakah user ada dan memiliki peran admin
    if (!targetUser || targetUser.role !== 'admin') {
      if (errorEl) {
        errorEl.innerHTML = `
          <strong>Akses Ditolak:</strong> Akun dengan email <code>${email}</code> tidak terdaftar sebagai administrator sistem FOZZ HQ.
        `;
        errorEl.style.display = 'block';
      }
      if (emailInput) emailInput.focus();
      this.showToast('Akun bukan administrator atau tidak ditemukan.', 'info');
      return;
    }

    // 2. Verifikasi Password Admin (admin123 atau field password yang tersimpan)
    const isPasswordCorrect = (password === 'admin123') || (targetUser.password && targetUser.password === password);

    if (!isPasswordCorrect) {
      if (errorEl) {
        errorEl.innerHTML = `
          <strong>Password Salah:</strong> Kata sandi yang Anda masukkan tidak sesuai untuk akun <code>${email}</code>. Silakan periksa kembali.
        `;
        errorEl.style.display = 'block';
      }
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
      this.showToast('Password administrator salah!', 'info');
      return;
    }

    // 3. Autentikasi Berhasil
    sessionStorage.setItem('fozz_admin_authenticated', 'true');
    DB.setCurrentUser(targetUser);

    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    if (passwordInput) passwordInput.value = '';

    this.closeModal('admin-login-modal');
    window.location.hash = '#admin';
    this.showAdminView();
    this.showToast(`Autentikasi Berhasil. Selamat datang di HQ Control, ${targetUser.nama_lengkap}!`, 'success');
  }

  showAdminView() {
    const isAdminAuthenticated = sessionStorage.getItem('fozz_admin_authenticated') === 'true';
    const currentUser = DB.getCurrentUser();

    // Guard: Wajib terautentikasi dan memiliki role admin
    if (!isAdminAuthenticated || !currentUser || currentUser.role !== 'admin') {
      this.showCustomerView();
      this.openAdminLoginModal();
      this.showToast('Autentikasi login admin diperlukan sebelum membuka panel CMS.', 'info');
      return;
    }

    this.currentRole = 'admin';
    const custView = document.getElementById('customer-view');
    const adminView = document.getElementById('admin-view');
    const adminUserDisplay = document.getElementById('admin-user-display');

    if (custView) custView.style.display = 'none';
    if (adminView) adminView.style.display = 'block';
    if (adminUserDisplay && currentUser) {
      adminUserDisplay.textContent = `${currentUser.nama_lengkap} (Admin)`;
    }

    this.refreshAdminData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showCustomerView() {
    this.currentRole = 'customer';
    const custView = document.getElementById('customer-view');
    const adminView = document.getElementById('admin-view');

    if (custView) custView.style.display = 'block';
    if (adminView) adminView.style.display = 'none';

    this.updateUserUI();
  }

  logoutAdmin() {
    sessionStorage.removeItem('fozz_admin_authenticated');
    const customerUser = DB.getUsers().find(u => u.role === 'customer') || SEED_USERS[1];
    DB.setCurrentUser(customerUser);

    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      history.pushState(null, document.title, window.location.pathname + window.location.search);
    }

    this.showCustomerView();
    this.renderCatalog();
    this.showToast('Sesi Admin HQ ditutup. Berhasil logout.', 'info');
  }

  // Switch between Customer Storefront and HQ Portal Admin (CMS)
  switchRole(role) {
    if (role === 'admin') {
      this.requestAdminAccess();
    } else {
      this.logoutAdmin();
    }
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
      countLabel.textContent = `${products.length} drop tersedia`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>Nol hasil untuk filter ini</h3>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Coba reset kata kunci atau pilih kategori drop lain.</p>
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
                Detail Drop
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
      if (label) label.textContent = 'Pilih size yang tersedia';
      if (addBtn) addBtn.disabled = true;
      return;
    }

    const sizes = DB.getSizesForProduct(this.activeModalProduct.id);
    const targetSize = sizes.find(s => s.ukuran === this.selectedProductSize);

    if (targetSize && targetSize.stok > 0) {
      if (label) {
        label.textContent = `${targetSize.stok} pcs tersisa • Fast moving`;
        label.style.color = 'var(--accent-green)';
      }
      if (addBtn) addBtn.disabled = false;
    } else {
      if (label) {
        label.textContent = 'Size ini habis (Sold Out)';
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
    this.showToast(`${this.activeModalProduct.nama_produk} (Size ${this.selectedProductSize}) ditambahkan ke bag. Stok terjamin real-time!`, 'success');
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
          <h4>Shopping Bag Masih Kosong</h4>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Belum ada artikel pilihan Anda. Temukan koleksi favorit dengan bahan katun kelas tertinggi di katalog sekarang.</p>
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
    this.showToast('Item dicoret dari bag', 'info');
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
    this.showToast(isSaved ? 'Drop disimpan ke Wishlist' : 'Drop dicoret dari Wishlist', 'info');
  }

  updateWishlistBadges() {
    const wishlist = DB.getWishlist();
    const badge = document.getElementById('wishlist-badge');
    if (badge) badge.textContent = wishlist.length;
  }

  openWishlistModal() {
    const wishlist = DB.getWishlist();
    if (wishlist.length === 0) {
      this.showToast('Wishlist masih kosong. Tandai drop incaran di katalog.', 'info');
      return;
    }
    // Filter by wishlist items
    this.selectedCategory = 'ALL';
    this.searchQuery = '';
    const grid = document.getElementById('products-grid');
    const allProducts = DB.getProducts();
    const favProducts = allProducts.filter(p => wishlist.includes(p.id));

    this.showToast(`Menampilkan ${favProducts.length} drop di Wishlist`, 'info');
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
            <button class="btn-view-product" onclick="app.openProductModal('${prod.id}')">Detail Drop</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // --- CHECKOUT & TRANSACTION INTEGRITY ---
  openCheckoutModal() {
    const cart = DB.getCart();
    if (cart.length === 0) {
      this.showToast('Keranjang belanja Anda masih kosong. Silakan pilih koleksi favorit terlebih dahulu.', 'info');
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
    const paymentMethod = document.getElementById('checkout-payment-method').value || 'qris';

    // 1. Relational Order Inisiasi berstatus 'Pending' (TTL 15 Menit)
    // 2. Line items terkunci di `order_items` (anti-distorsi harga)
    // 3. Masuk ke Payment Gateway Engine untuk penyelesaian transaksi real-time
    const newOrder = DB.createOrder(currentUser.id, cart, address, courier, 20000, "Pending", paymentMethod);

    this.closeModal('checkout-modal');
    this.updateCartBadges();
    this.renderCatalog();
    this.showToast(`Order #${newOrder.id} dibuat. Menghubungkan ke Payment Gateway...`, 'info');

    // Buka Gateway Simulation Modal
    setTimeout(() => {
      this.openPaymentGatewayModal(newOrder.id);
    }, 250);
  }

  // --- REAL-TIME PAYMENT GATEWAY SIMULATION ENGINE ---
  openPaymentGatewayModal(orderId) {
    const order = DB.getOrders().find(o => o.id === orderId);
    if (!order) return;

    this.activeGatewayOrderId = orderId;

    // Set UI Texts
    const orderIdEl = document.getElementById('gateway-order-id');
    const orderStatusEl = document.getElementById('gateway-order-status');
    const methodNameEl = document.getElementById('gateway-method-name');
    const orderTotalEl = document.getElementById('gateway-order-total');

    if (orderIdEl) orderIdEl.textContent = `#${order.id}`;
    if (orderStatusEl) {
      orderStatusEl.textContent = order.status_pesanan;
      orderStatusEl.className = `status-pill status-${order.status_pesanan.toLowerCase()}`;
    }
    if (methodNameEl) {
      const methodLabels = {
        qris: 'QRIS Dinamis (Real-Time ASPI)',
        va_bca: 'BCA Virtual Account (Auto-Settled)',
        va_mandiri: 'Mandiri Virtual Account',
        va_bri: 'BRI Virtual Account',
        va_bni: 'BNI Virtual Account',
        credit_card: 'Credit Card (3DS Tokenized)'
      };
      methodNameEl.textContent = methodLabels[order.payment_method] || 'Payment Gateway';
    }
    if (orderTotalEl) orderTotalEl.textContent = this.formatRupiah(order.total_harga);

    // Render payment specific instrument view (QRIS / VA)
    this.renderPaymentInstrument(order);

    // Start Expiration Timer (15 Minutes countdown)
    this.startGatewayCountdown(order);

    // Initialize Terminal Logs
    this.initGatewayTerminal(order);

    this.openModal('payment-gateway-modal');
  }

  closePaymentGatewayModal() {
    if (this.gatewayCountdownInterval) {
      clearInterval(this.gatewayCountdownInterval);
    }
    this.closeModal('payment-gateway-modal');
  }

  startGatewayCountdown(order) {
    if (this.gatewayCountdownInterval) {
      clearInterval(this.gatewayCountdownInterval);
    }

    const timerDisplay = document.getElementById('gateway-timer-display');
    const expiryTime = new Date(order.payment_expired_at || (Date.now() + 15 * 60 * 1000)).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const distance = expiryTime - now;

      if (distance <= 0) {
        clearInterval(this.gatewayCountdownInterval);
        if (timerDisplay) timerDisplay.textContent = '00:00 (EXPIRED)';
        DB.updateOrderStatus(order.id, 'Cancelled', null, { cancelled_reason: 'Waktu Pembayaran Habis (TTL 15m Expired)' });
        this.showToast(`Order #${order.id} telah kedaluwarsa.`, 'warn');
        this.renderCatalog();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    };

    updateTimer();
    this.gatewayCountdownInterval = setInterval(updateTimer, 1000);
  }

  initGatewayTerminal(order) {
    const logsBody = document.getElementById('gateway-logs-body');
    const clock = document.getElementById('gateway-terminal-clock');
    if (clock) clock.textContent = new Date().toLocaleTimeString('id-ID');

    if (!logsBody) return;
    logsBody.innerHTML = `
      <div class="terminal-line meta">[SYSTEM] Initializing Zero-Trust TLS 1.3 Channel...</div>
      <div class="terminal-line">[GATEWAY] POST /v1/charge HTTP/2 &bull; Status: 201 Created</div>
      <div class="terminal-line">[PAYLOAD] Token Ref: <span style="color:#f43f5e;">${order.transaction_id || 'TRX-PG-INIT'}</span> &bull; TTL: 900s</div>
      <div class="terminal-line">[NETWORK] Listening on wss://gateway.fozz.co/events/${order.id}...</div>
      <div class="terminal-line warn">[STANDBY] Menunggu konfirmasi pembayaran dari nasabah / aggregator...</div>
    `;
  }

  appendTerminalLog(message, type = '') {
    const logsBody = document.getElementById('gateway-logs-body');
    if (!logsBody) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = message;
    logsBody.appendChild(line);
    const terminal = document.getElementById('gateway-terminal-logs');
    if (terminal) terminal.scrollTop = terminal.scrollHeight;
  }

  renderPaymentInstrument(order) {
    const container = document.getElementById('gateway-instrument-container');
    if (!container) return;

    if (order.status_pesanan === 'Paid') {
      container.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.08); border: 2px solid var(--accent-green); border-radius: var(--radius-md); padding: 2rem; text-align: center;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--accent-green); color: #fff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.75rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 style="font-size: 1.35rem; color: var(--accent-green); margin-bottom: 0.35rem;">Pembayaran Terverifikasi Real-Time!</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.25rem;">
            Signature HMAC-SHA512 telah diverifikasi. Trigger atomik PostgreSQL telah memotong stok di <code class="mono-text">product_sizes</code> dan pesanan telah diteruskan ke tim gudang FOZZ HQ.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" onclick="app.closePaymentGatewayModal(); app.openOrderHistory();">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              Lacak Perjalanan Paket & Resi &rarr;
            </button>
            <button class="btn-secondary" onclick="app.closePaymentGatewayModal(); app.openSchemaModal('gateway');">
              Bedah Arsitektur Gateway
            </button>
          </div>
        </div>
      `;
      return;
    }

    const isQris = order.payment_method === 'qris' || order.payment_method === 'credit_card';

    if (isQris) {
      // Dynamic QRIS View
      container.innerHTML = `
        <div class="qris-card">
          <div class="qris-logo-bar">
            <span class="qris-badge-tag">QRIS</span>
            <span style="font-size: 0.72rem; font-weight: 800; color: #1e293b;">ASPI &bull; GPN TERAKREDITASI</span>
          </div>

          <div style="font-size: 0.78rem; font-weight: 800; color: #0f172a; margin-bottom: 0.2rem;">FOZZ STREETWEAR HQ</div>
          <div style="font-size: 0.68rem; color: #64748b; font-family: var(--font-mono); margin-bottom: 0.75rem;">NMID: ID1020268800912 &bull; TAG-01: 12 (DYNAMIC)</div>

          <!-- Stylized Dynamic QR Code Container -->
          <div class="qris-code-container">
            <svg width="200" height="200" viewBox="0 0 200 200" style="display: block; margin: 0 auto;">
              <!-- Outer border & corner squares -->
              <rect x="0" y="0" width="200" height="200" fill="#ffffff"/>
              <!-- Position Corner Top-Left -->
              <rect x="15" y="15" width="45" height="45" fill="#000000"/>
              <rect x="22" y="22" width="31" height="31" fill="#ffffff"/>
              <rect x="29" y="29" width="17" height="17" fill="#000000"/>
              <!-- Position Corner Top-Right -->
              <rect x="140" y="15" width="45" height="45" fill="#000000"/>
              <rect x="147" y="22" width="31" height="31" fill="#ffffff"/>
              <rect x="154" y="29" width="17" height="17" fill="#000000"/>
              <!-- Position Corner Bottom-Left -->
              <rect x="15" y="140" width="45" height="45" fill="#000000"/>
              <rect x="22" y="147" width="31" height="31" fill="#ffffff"/>
              <rect x="29" y="154" width="17" height="17" fill="#000000"/>
              <!-- Pattern Simulation Bits -->
              <rect x="75" y="15" width="10" height="10" fill="#000000"/>
              <rect x="95" y="15" width="10" height="10" fill="#000000"/>
              <rect x="115" y="15" width="10" height="10" fill="#000000"/>
              <rect x="75" y="35" width="20" height="10" fill="#000000"/>
              <rect x="105" y="35" width="15" height="10" fill="#000000"/>
              <rect x="15" y="75" width="15" height="10" fill="#000000"/>
              <rect x="35" y="75" width="15" height="10" fill="#000000"/>
              <rect x="75" y="75" width="12" height="12" fill="#ff2a40"/>
              <rect x="95" y="75" width="15" height="10" fill="#000000"/>
              <rect x="135" y="75" width="20" height="10" fill="#000000"/>
              <rect x="170" y="75" width="15" height="10" fill="#000000"/>
              <rect x="15" y="95" width="10" height="20" fill="#000000"/>
              <rect x="40" y="95" width="15" height="10" fill="#000000"/>
              <rect x="70" y="95" width="25" height="10" fill="#000000"/>
              <rect x="110" y="95" width="20" height="20" fill="#000000"/>
              <rect x="145" y="95" width="10" height="10" fill="#000000"/>
              <rect x="165" y="95" width="20" height="10" fill="#000000"/>
              <rect x="15" y="120" width="25" height="10" fill="#000000"/>
              <rect x="75" y="120" width="15" height="15" fill="#000000"/>
              <rect x="100" y="120" width="15" height="10" fill="#ff2a40"/>
              <rect x="135" y="120" width="15" height="20" fill="#000000"/>
              <rect x="160" y="120" width="25" height="10" fill="#000000"/>
              <rect x="75" y="145" width="20" height="15" fill="#000000"/>
              <rect x="105" y="145" width="15" height="10" fill="#000000"/>
              <rect x="155" y="145" width="30" height="10" fill="#000000"/>
              <rect x="75" y="170" width="10" height="15" fill="#000000"/>
              <rect x="95" y="170" width="25" height="10" fill="#000000"/>
              <rect x="135" y="170" width="20" height="15" fill="#000000"/>
              <rect x="165" y="170" width="15" height="15" fill="#000000"/>
            </svg>
            <div class="qris-emblem">FOZZ</div>
          </div>

          <div style="font-size: 0.75rem; color: #475569; margin-bottom: 0.5rem;">
            Pindai dengan BCA Mobile, Livin', GoPay, OVO, ShopeePay, atau DANA.
          </div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #ff2a40; font-family: var(--font-mono); margin-bottom: 0.75rem;">
            ${this.formatRupiah(order.total_harga)}
          </div>

          <!-- Raw EMVCo String Preview Accordion -->
          <div style="text-align: left; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 0.5rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem; font-weight: 700; color: #475569; margin-bottom: 0.25rem;">
              <span>EMVCo Dynamic Payload:</span>
              <button type="button" class="role-btn" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;" onclick="app.copyToClipboard('${order.qris_payload}', this)">Salin Payload</button>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.62rem; color: #0f172a; word-break: break-all; max-height: 48px; overflow-y: auto;">
              ${order.qris_payload || 'EMVCo.QRIS.FOZZ.HQ.PAYLOAD'}
            </div>
          </div>

          <!-- SIMULATOR BUTTON (Trigger Real-Time Webhook) -->
          <button class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.85rem;" onclick="app.simulateWebhookPayment('${order.id}', 'qris')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Simulasi Scan &amp; Bayar via M-Banking (Kirim Webhook)
          </button>
        </div>
      `;
    } else {
      // Virtual Account View
      const activeBank = (order.va_bank || 'BCA').toLowerCase();
      const currentUser = DB.getCurrentUser();

      container.innerHTML = `
        <div class="va-display-card">
          <!-- Bank Selector Tabs -->
          <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 0.4rem;">Pilih Rekening Bank Virtual Account:</div>
          <div class="va-bank-selector">
            <button class="va-bank-chip ${activeBank === 'bca' ? 'active' : ''}" onclick="app.selectVaBank('${order.id}', 'bca')">BCA</button>
            <button class="va-bank-chip ${activeBank === 'mandiri' ? 'active' : ''}" onclick="app.selectVaBank('${order.id}', 'mandiri')">MANDIRI</button>
            <button class="va-bank-chip ${activeBank === 'bri' ? 'active' : ''}" onclick="app.selectVaBank('${order.id}', 'bri')">BRI</button>
            <button class="va-bank-chip ${activeBank === 'bni' ? 'active' : ''}" onclick="app.selectVaBank('${order.id}', 'bni')">BNI</button>
          </div>

          <!-- VA Number Card -->
          <div style="margin-bottom: 1rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block;">Nomor Virtual Account (${activeBank.toUpperCase()}):</label>
            <div class="copy-input-group">
              <input type="text" class="copy-input-field" value="${order.va_number}" readonly id="va-input-field">
              <button class="copy-action-btn" onclick="app.copyToClipboard('${order.va_number}', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Salin VA
              </button>
            </div>
          </div>

          <!-- Bill Amount Card -->
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block;">Total Nominal Transfer (Exact Fixed Amount):</label>
            <div class="copy-input-group">
              <input type="text" class="copy-input-field" value="${this.formatRupiah(order.total_harga)}" readonly style="color: var(--accent-red);">
              <button class="copy-action-btn" onclick="app.copyToClipboard('${order.total_harga}', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Salin Nominal
              </button>
            </div>
          </div>

          <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.25rem;">
              <span style="color: var(--text-muted);">Nama Rekening Tujuan:</span>
              <strong>FOZZ - ${(currentUser.nama_lengkap || 'IVAN PRATAMA').toUpperCase()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
              <span style="color: var(--text-muted);">Tipe Virtual Account:</span>
              <strong style="color: var(--accent-green);">Closed VA (Auto-Reconciled)</strong>
            </div>
          </div>

          <!-- SIMULATOR BUTTON (Trigger Real-Time Webhook) -->
          <button class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.85rem;" onclick="app.simulateWebhookPayment('${order.id}', 'va')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Simulasi Transfer VA via Mobile Banking (Kirim Webhook)
          </button>
        </div>
      `;
    }
  }

  selectVaBank(orderId, bankCode) {
    const orders = DB.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.va_bank = bankCode.toUpperCase();
    order.va_number = DB.generateVaNumber(bankCode, order.id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    this.renderPaymentInstrument(order);
    this.appendTerminalLog(`[ROUTING] Bank Switch changed to: <span style="color:#38bdf8;">${bankCode.toUpperCase()}</span> &bull; New VA: ${order.va_number}`, 'meta');
  }

  simulateWebhookPayment(orderId, instrumentType) {
    const order = DB.getOrders().find(o => o.id === orderId);
    if (!order) return;

    // Visual sequence showing the real-time automated verification stages
    this.appendTerminalLog(`[CLIENT] Triggering Simulated Customer Transfer (${instrumentType.toUpperCase()})...`, 'accent');

    setTimeout(() => {
      this.appendTerminalLog(`[AGGREGATOR] Network Clearing Switch (BI-FAST/ASPI): Transaction Authorized ✓`, 'success');
    }, 200);

    setTimeout(() => {
      this.appendTerminalLog(`[INBOUND WEBHOOK] HTTP 200 POST /api/webhooks/payment-gateway`, 'accent');
      this.appendTerminalLog(`&nbsp;&nbsp;&bull; Payload: { order_id: "${order.id}", status: "settlement", gross_amount: ${order.total_harga} }`, 'meta');
      this.appendTerminalLog(`&nbsp;&nbsp;&bull; Header X-Signature: HMAC-SHA512(<span style="color:#34d399;">VALIDATED_MATCH</span>)`, 'success');
      this.appendTerminalLog(`&nbsp;&nbsp;&bull; Idempotency-Key Check: <span style="color:#34d399;">PASS (No Replay)</span>`, 'success');
    }, 450);

    setTimeout(() => {
      this.appendTerminalLog(`[DATABASE TRANSACTION] BEGIN;`, 'meta');
      this.appendTerminalLog(`&nbsp;&nbsp;&bull; UPDATE orders SET status_pesanan = 'Paid' WHERE id = '${order.id}';`, 'meta');
      this.appendTerminalLog(`&nbsp;&nbsp;&bull; <span style="color:#f43f5e; font-weight:800;">TRIGGER ATOMIK:</span> UPDATE product_sizes SET stok = stok - oi.jumlah;`, 'accent');
      this.appendTerminalLog(`[DATABASE TRANSACTION] COMMIT; &bull; Stock locked permanently!`, 'success');

      // Update database status
      DB.updateOrderStatus(order.id, 'Paid', null, {
        settlement_time: new Date().toISOString(),
        signature_verified: true,
        webhook_received: true
      });

      this.renderCatalog();
      this.updateCartBadges();

      // Broadcast real-time push to client UI
      this.appendTerminalLog(`[REAL-TIME BROADCAST] WebSocket push -> Client UI State Updated to PAID!`, 'success');

      const updatedOrder = DB.getOrders().find(o => o.id === orderId);
      const statusPill = document.getElementById('gateway-order-status');
      if (statusPill) {
        statusPill.textContent = 'Paid';
        statusPill.className = 'status-pill status-paid';
      }

      this.renderPaymentInstrument(updatedOrder);
      this.showToast(`Pembayaran #${order.id} terverifikasi via Webhook real-time!`, 'success');
    }, 850);
  }

  copyToClipboard(text, btnElement) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btnElement ? btnElement.innerHTML : '';
        if (btnElement) {
          btnElement.innerHTML = `✓ Tersalin!`;
          btnElement.style.background = 'var(--accent-green)';
          setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.background = '';
          }, 1500);
        }
        this.showToast('Teks berhasil disalin ke clipboard.', 'success');
      });
    }
  }

  confirmCancelOrder(orderId) {
    if (confirm(`Apakah Anda yakin ingin membatalkan pesanan #${orderId}? Alokasi stok akan dilepaskan.`)) {
      DB.cancelOrder(orderId, "Dibatalkan oleh Pelanggan");
      this.renderCatalog();
      this.openOrderHistory();
      this.showToast(`Pesanan #${orderId} telah dibatalkan. Kuota dilepaskan ke katalog.`, 'info');
    }
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
          <h3>Belum ada order untuk dilacak</h3>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Pilih koleksi favorit Anda di katalog, lalu pantau perjalanan paket dan nomor resi secara real-time di sini.</p>
        </div>
      `;
    } else {
      container.innerHTML = myOrders.map(ord => {
        const items = DB.getOrderItems().filter(i => i.order_id === ord.id);
        const dateStr = new Date(ord.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        const isPending = ord.status_pesanan === 'Pending';
        const isPaid = ord.status_pesanan === 'Paid' || ord.status_pesanan === 'Shipped' || ord.status_pesanan === 'Delivered';
        const isCancelled = ord.status_pesanan === 'Cancelled' || ord.status_pesanan === 'Refunded';

        const statusClass = `status-${ord.status_pesanan.toLowerCase()}`;

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
          <div class="stat-card" style="padding: 1.5rem; ${isPending ? 'border-color: var(--accent-gold);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div>
                <span class="mono-text" style="font-size: 0.75rem; color: var(--accent-red); font-weight: 700;">#${ord.id}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">&bull; ${dateStr}</span>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">Kurir: <strong style="color: var(--text-primary);">${ord.courier || 'Ekspedisi Reguler'}</strong></div>
                ${ord.payment_method ? `
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
                    Metode: <strong style="color: var(--text-primary); text-transform: uppercase;">${ord.payment_method.replace('_', ' ')}</strong>
                    ${isPaid ? '<span style="color: var(--accent-green); font-weight: 700; margin-left: 0.35rem;">✓ Settlement Verified</span>' : ''}
                  </div>
                ` : ''}
              </div>
              <span class="status-pill ${statusClass}">
                ${isPending ? '<span class="beacon-pulse amber"></span>' : ''}
                ${ord.status_pesanan}
              </span>
            </div>

            ${isPending ? `
              <!-- Pending Payment Urgent Banner -->
              <div style="background: rgba(245, 158, 11, 0.08); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <strong style="color: var(--accent-gold); font-size: 0.82rem; display: block;">Menunggu Pembayaran Real-Time:</strong>
                  <span style="font-size: 0.75rem; color: var(--text-secondary);">Kunci stok artikel limited edition Anda sebelum jendela TTL 15 menit habis.</span>
                </div>
                <button class="btn-primary" style="padding: 0.45rem 0.85rem; font-size: 0.78rem; background: var(--accent-red);" onclick="app.openPaymentGatewayModal('${ord.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  Bayar Sekarang (QRIS / VA) &rarr;
                </button>
              </div>
            ` : ''}

            <!-- Items details -->
            <div style="background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1rem;">
              ${itemsSummary}
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; border-top: 1px dashed var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem;">
                <span>Total Tagihan Pesanan:</span>
                <span class="mono-text" style="color: var(--accent-red);">${this.formatRupiah(ord.total_harga)}</span>
              </div>
            </div>

            <!-- Tracking & Airway Bill -->
            <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Nomor Resi (Airway Bill):</span>
                <span class="mono-text" style="font-weight: 700; color: ${ord.resi_pengiriman ? 'var(--accent-silver)' : 'var(--accent-gold)'};">
                  ${ord.resi_pengiriman ? ord.resi_pengiriman : (isPending ? 'Menunggu Pelunasan Tagihan' : 'Menunggu Input Resi oleh HQ')}
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Tujuan: ${ord.alamat_pengiriman}</div>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              ${isPending ? `
                <button class="btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" onclick="app.confirmCancelOrder('${ord.id}')">
                  Batalkan Pesanan
                </button>
                <button class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem;" onclick="app.openPaymentGatewayModal('${ord.id}')">
                  Selesaikan Pembayaran &rarr;
                </button>
              ` : ''}

              ${!isPending && !isCancelled ? `
                <button class="btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" onclick="app.openReturnRequestForOrder('${ord.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                  Ajukan Retur / Tukar Size
                </button>
              ` : ''}

              ${ord.status_pesanan === 'Shipped' ? `
                <button class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem;" onclick="app.confirmDelivery('${ord.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Terima Paket &amp; Selesaikan Order
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
    this.showToast(`Order #${orderId} diselesaikan. Drop resmi diterima!`, 'success');
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
    this.showToast('Profil akun & alamat default berhasil diperbarui.', 'success');
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
          <div class="stat-card-title">Total Omzet Kotor (Gross)</div>
          <div class="stat-card-val" style="color: var(--accent-red);">${this.formatRupiah(grossRevenue)}</div>
          <div class="stat-card-sub">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            +18.4% vs bulan lalu
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-title">Pendapatan Bersih (Net)</div>
          <div class="stat-card-val">${this.formatRupiah(netRevenue)}</div>
          <div class="stat-card-sub" style="color: var(--accent-green);">Margin Bersih Terjaga</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-title">Order Selesai / Terbayar</div>
          <div class="stat-card-val">${paidOrders.length} Order</div>
          <div class="stat-card-sub" style="color: var(--accent-blue);">Konversi Checkout 94%</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-title">Drop Aktif di Katalog</div>
          <div class="stat-card-val">${products.length} Drop</div>
          <div class="stat-card-sub" style="color: var(--accent-silver);">Sinkronisasi Relasional Live</div>
        </div>
      `;
    }

    // Dashboard Recent Orders Table
    const recentTable = document.getElementById('dashboard-recent-orders-table');
    if (recentTable) {
      recentTable.innerHTML = `
        <thead>
          <tr>
            <th>Nomor Pesanan</th>
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
        bestSellersList.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">Belum ada drop yang terjual.</p>`;
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
              Preview Drop
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  saveStockAdjustment(sizeId, newStock) {
    const updated = DB.updateStock(sizeId, newStock);
    if (updated) {
      this.showToast(`Stok Size ${updated.ukuran} diupdate jadi ${updated.stok} pcs.`, 'success');
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
    this.showToast(`Drop "${newProd.nama_produk}" resmi dirilis ke katalog!`, 'success');
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
              <option value="Pending" ${ord.status_pesanan === 'Pending' ? 'selected' : ''}>Pending (Antrean)</option>
              <option value="Paid" ${ord.status_pesanan === 'Paid' ? 'selected' : ''}>Paid (Terverifikasi)</option>
              <option value="Shipped" ${ord.status_pesanan === 'Shipped' ? 'selected' : ''}>Shipped (Di Ekspedisi)</option>
              <option value="Delivered" ${ord.status_pesanan === 'Delivered' ? 'selected' : ''}>Delivered (Selesai)</option>
              <option value="Canceled" ${ord.status_pesanan === 'Canceled' ? 'selected' : ''}>Canceled (Batal)</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <input type="text" 
                     id="resi-input-${ord.id}" 
                     placeholder="No. Resi (J&T / SiCepat)" 
                     value="${ord.resi_pengiriman || ''}" 
                     class="mono-text"
                     style="width: 140px; padding: 0.35rem 0.5rem; font-size: 0.75rem;">
              <button class="role-btn" onclick="app.adminSaveResi('${ord.id}')">Kunci Resi</button>
            </div>
          </td>
          <td>
            <button class="btn-outline-red" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="app.adminCancelFraudOrder('${ord.id}')">
              Void Fraud
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  adminChangeOrderStatus(orderId, newStatus) {
    DB.updateOrderStatus(orderId, newStatus);
    this.refreshAdminData();
    this.showToast(`Status order #${orderId} diupdate jadi "${newStatus}".`, 'success');
  }

  adminSaveResi(orderId) {
    const input = document.getElementById(`resi-input-${orderId}`);
    if (input) {
      const resiValue = input.value.trim();
      DB.updateOrderStatus(orderId, 'Shipped', resiValue);
      this.refreshAdminData();
      this.showToast(`Resi ${resiValue} terpasang. Order #${orderId} masuk status Shipped.`, 'success');
    }
  }

  adminCancelFraudOrder(orderId) {
    if (confirm(`Kunci void: Yakin batalkan order #${orderId} karena indikasi fraud?`)) {
      DB.updateOrderStatus(orderId, 'Canceled');
      this.refreshAdminData();
      this.showToast(`Order #${orderId} di-void & dibatalkan.`, 'info');
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
    if (modalId === 'admin-login-modal') {
      const isAdminAuth = sessionStorage.getItem('fozz_admin_authenticated') === 'true';
      if (!isAdminAuth && (window.location.hash === '#admin' || window.location.hash === '#/admin')) {
        history.pushState(null, document.title, window.location.pathname + window.location.search);
        this.showCustomerView();
      }
    }
  }

  openSchemaModal(tab = 'gateway') {
    this.openModal('schema-modal');
    this.switchArchTab(tab);
  }

  copySupabaseSql() {
    fetch('/supabase_schema.sql')
      .then(res => res.text())
      .then(sql => {
        navigator.clipboard.writeText(sql);
        this.showToast('Skema SQL (supabase_schema.sql) berhasil disalin ke clipboard!', 'success');
      })
      .catch(() => {
        this.showToast('Buka file supabase_schema.sql di root project untuk melihat skema.', 'info');
      });
  }

  switchArchTab(tabName) {
    const tabs = ['gateway', 'qris', 'va', 'db'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}-arch`);
      const content = document.getElementById(`arch-content-${t}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (content) content.style.display = t === tabName ? 'block' : 'none';
    });
  }

  openSizeGuideModal() {
    this.openModal('size-guide-modal');
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
      } else if (params.scrollToFaq) {
        setTimeout(() => {
          const faqList = document.querySelector('.faq-list');
          if (faqList) faqList.scrollIntoView({ behavior: 'smooth' });
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
      <option value="">-- Pilih Nomor Pesanan --</option>
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
      prodSelect.innerHTML = `<option value="">-- Pilih Nomor Pesanan terlebih dahulu --</option>`;
      return;
    }

    const items = DB.getOrderItems().filter(i => i.order_id === orderId);
    if (items.length === 0) {
      prodSelect.innerHTML = `<option value="">Tidak ada item dalam order ini</option>`;
      return;
    }

    prodSelect.innerHTML = items.map(item => {
      const prod = DB.getProductById(item.product_id);
      const name = prod ? prod.nama_produk : 'Drop Streetwear';
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
          Size ${s.ukuran} ${isCurrent ? '(Size Saat Ini)' : (isAvailable ? `(Stok: ${s.stok} pcs)` : '(Sold Out)')}
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
      stockStatus.textContent = `Pilihan: Size ${size} (Slot ready)`;
    } else {
      stockStatus.textContent = '';
    }
  }

  submitReturnRequest(event) {
    event.preventDefault();
    const user = DB.getCurrentUser();
    if (!user) {
      this.showToast('Login dulu sebelum mengajukan retur.', 'info');
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
      this.showToast('Pilih nomor order dan artikel yang mau diretur!', 'info');
      return;
    }

    if (returnType === 'exchange_size' && !targetSize) {
      this.showToast('Pilih ukuran baru pengganti yang diinginkan!', 'info');
      return;
    }

    if (!checkHangtag || !checkUnboxing) {
      this.showToast('Centang konfirmasi kondisi produk & unboxing video tanpa jeda!', 'info');
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

    this.showToast(`Tiket RMA #${newTicket.id} aktif. Tim QA FOZZ akan mengaudit dalam 1x24 jam.`, 'success');
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
          Belum ada tiket retur aktif.<br>Fitting kurang pas atau ada cacat jahitan? Kirim form di samping.
        </div>
      `;
      return;
    }

    container.innerHTML = returns.map(item => {
      const dateStr = new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      const typeLabel = item.request_type === 'exchange_size' ? 'Tukar Size' : (item.request_type === 'defect_refund' ? 'Cacat Jahitan/Bahan' : 'Salah Kirim Artikel');

      let statusBadge = '';
      if (item.status === 'submitted') statusBadge = '<span class="status-pill status-pending">Menunggu Audit QA</span>';
      else if (item.status === 'approved') statusBadge = '<span class="status-pill status-paid">Disetujui QA</span>';
      else if (item.status === 'rejected') statusBadge = '<span class="status-pill status-canceled">Ditolak QA</span>';
      else if (item.status === 'completed') statusBadge = '<span class="status-pill status-delivered">Selesai (Resolved)</span>';
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
              <span class="rma-timeline-label">Audit QA</span>
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
            <strong>Catatan Tim QA HQ:</strong> ${item.admin_note || 'Masuk antrean audit spesifikasi.'}
            ${item.replacement_tracking_no ? `
              <div style="margin-top: 0.25rem;">
                Resi Unit Baru: <strong class="mono-text" style="color: var(--accent-blue);">${item.replacement_tracking_no}</strong>
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
    this.showToast('Data tiket RMA dan stok size berhasil disinkronkan.', 'info');
  }

  toggleFaq(element) {
    element.classList.toggle('open');
  }

  copyHubAddress() {
    const text = "FOZZ.CO DISTRIBUTION CENTER & RMA HUB\nGedung Urban Streetwear Pavilion Lt. 3\nJl. Senopati No. 42, RT 06 / RW 02, Kebayoran Baru, Jakarta Selatan 12190\nUP: Tim Quality Assurance RMA (+62 811-3699-2273)";
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Alamat Hub Logistik disalin ke clipboard!', 'success');
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nol tiket RMA aktif saat ini.</td></tr>`;
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
              ${item.request_type === 'exchange_size' ? 'Tukar Size' : (item.request_type === 'defect_refund' ? 'Cacat Jahitan/Bahan' : 'Salah Kirim Artikel')}
            </span>
            <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
              "${item.reason}"
            </div>
          </td>
          <td>
            <select style="font-size: 0.78rem; padding: 0.35rem 0.6rem;" onchange="app.adminChangeReturnStatus('${item.id}', this.value)">
              <option value="submitted" ${item.status === 'submitted' ? 'selected' : ''}>Submitted (Audit QA)</option>
              <option value="approved" ${item.status === 'approved' ? 'selected' : ''}>Approved (Lolos Audit)</option>
              <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Rejected (Ditolak)</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed (Resolved)</option>
            </select>
          </td>
          <td>
            <input type="text" 
                   id="admin-return-note-${item.id}" 
                   value="${item.admin_note || ''}" 
                   placeholder="Catatan QA untuk buyer"
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
              <button class="role-btn" onclick="app.adminSaveReturnTracking('${item.id}')">Kunci Resi</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  adminChangeReturnStatus(returnId, newStatus) {
    DB.updateReturnStatus(returnId, newStatus);
    this.renderAdminReturns();
    this.showToast(`Status tiket RMA #${returnId} diubah jadi "${newStatus}".`, 'success');
  }

  adminSaveReturnNote(returnId, note) {
    DB.updateReturnStatus(returnId, null, note);
    this.showToast(`Catatan QA untuk RMA #${returnId} tersimpan!`, 'info');
  }

  adminSaveReturnTracking(returnId) {
    const input = document.getElementById(`admin-return-tracking-${returnId}`);
    if (input) {
      const tracking = input.value.trim();
      DB.updateReturnStatus(returnId, 'completed', 'Unit baru telah dikirimkan ke alamat Anda.', tracking);
      this.renderAdminReturns();
      this.showToast(`Resi unit baru ${tracking} terpasang & tiket RMA diselesaikan!`, 'success');
    }
  }

  // --- HERO KINETIC PATTERN SHOWCASE ANIMATION ENGINE ---
  initHeroPatternAnimation() {
    const canvas = document.getElementById('hero-pattern-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.patternModes = [
      'TOPOGRAPHIC CONTOUR MESH',
      'CYBER ISOMETRIC GRID & RADAR',
      'BRUTALIST KINETIC HATCH & GLYPHS',
      'QUANTUM MATRIX VORTEX'
    ];
    this.currentPatternMode = 0;
    this.patternSpeedMultiplier = 1.0;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking for interactive physics
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    });

    // Touch support for mobile devices
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    });

    // Particles data for Mode 2 & Mode 3
    const glyphSymbols = ['+', '✕', '▪', '▲', 'FOZZ', 'AW26', '480GSM', 'SYSTEM', '01'];
    const glyphNodes = Array.from({ length: 24 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      symbol: glyphSymbols[Math.floor(Math.random() * glyphSymbols.length)],
      size: 9 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.02
    }));

    const quantumParticles = Array.from({ length: 65 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 40 + Math.random() * 260,
      speed: 0.006 + Math.random() * 0.012,
      size: 1.5 + Math.random() * 2.5,
      z: Math.random()
    }));

    let radarAngle = 0;
    let time = 0;
    let lastTime = performance.now();
    let isVisible = true;

    // IntersectionObserver to avoid rendering when scrolled away
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);

    // Frame rate indicator counter
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    const fpsLabel = document.getElementById('pattern-fps-label');

    const render = (now) => {
      requestAnimationFrame(render);
      if (!isVisible || width === 0 || height === 0) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt * this.patternSpeedMultiplier;

      // Update FPS label every second
      frameCount++;
      if (now - lastFpsUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        if (fpsLabel) fpsLabel.textContent = `${fps} FPS`;
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Smooth mouse interpolation
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const accentRed = isDark ? '#ff3b53' : '#ff2a40';
      const bgFill = isDark ? '#07080c' : '#f8f6f0';
      const baseLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 12, 16, 0.08)';
      const midLineColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(10, 12, 16, 0.18)';
      const textColor = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(10, 12, 16, 0.65)';

      // Clear canvas with subtle background
      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, width, height);

      // Render based on current pattern mode
      switch (this.currentPatternMode) {
        case 0:
          // MODE 0: TOPOGRAPHIC CONTOUR MESH
          this.renderTopographicMesh(ctx, width, height, time, mouse, isDark, accentRed, baseLineColor, midLineColor);
          break;
        case 1:
          // MODE 1: CYBER ISOMETRIC GRID & RADAR
          this.renderIsometricRadar(ctx, width, height, time, radarAngle, mouse, isDark, accentRed, baseLineColor, midLineColor, textColor);
          radarAngle += 0.025 * this.patternSpeedMultiplier;
          break;
        case 2:
          // MODE 2: BRUTALIST KINETIC HATCH & GLYPHS
          this.renderBrutalistHatch(ctx, width, height, time, glyphNodes, mouse, isDark, accentRed, baseLineColor, midLineColor);
          break;
        case 3:
          // MODE 3: QUANTUM MATRIX VORTEX
          this.renderQuantumVortex(ctx, width, height, time, quantumParticles, mouse, isDark, accentRed, baseLineColor);
          break;
      }
    };

    requestAnimationFrame(render);
  }

  // --- RENDERING SUB-ROUTINES ---
  renderTopographicMesh(ctx, width, height, time, mouse, isDark, accentRed, baseLineColor, midLineColor) {
    const numLines = 16;
    const stepX = 14;
    const spacingY = height / (numLines + 1);

    for (let i = 1; i <= numLines; i++) {
      const baseY = i * spacingY;
      const isKeyLine = (i % 4 === 0);
      const isRedLine = (i === 4 || i === 12);

      ctx.beginPath();
      ctx.lineWidth = isRedLine ? 2 : (isKeyLine ? 1.5 : 1);
      ctx.strokeStyle = isRedLine ? accentRed : (isKeyLine ? midLineColor : baseLineColor);

      if (isRedLine) {
        ctx.shadowColor = accentRed;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      let started = false;
      for (let x = 0; x <= width + stepX; x += stepX) {
        const wave1 = Math.sin(x * 0.007 + time * 0.8 + i * 0.35) * 22;
        const wave2 = Math.cos(x * 0.015 - time * 0.5 + i * 0.5) * 14;
        const wave3 = Math.sin(x * 0.003 + i * 0.7) * 18;

        let y = baseY + wave1 + wave2 + wave3;

        // Interactive mouse distortion
        if (mouse.x > -500) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (1 - dist / 180) * 45;
            y += (dy > 0 ? force : -force);
          }
        }

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }

        // Elevation tag
        if (isRedLine && Math.abs(x - width * 0.78) < stepX) {
          ctx.fillStyle = accentRed;
          ctx.font = '700 9px "JetBrains Mono", monospace';
          ctx.fillText(`+${i * 30}M // 480GSM`, x, y - 6);
        }
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  renderIsometricRadar(ctx, width, height, time, radarAngle, mouse, isDark, accentRed, baseLineColor, midLineColor, textColor) {
    const cx = width / 2;
    const cy = height / 2;

    // Moving diagonal perspective grid
    const gridSize = 45;
    const offset = (time * 28) % gridSize;

    ctx.strokeStyle = baseLineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -gridSize; x <= width + gridSize; x += gridSize) {
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset - height * 0.5, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Concentric Technical Circles
    const radii = [60, 110, 170, 230];
    radii.forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = (idx === 2) ? midLineColor : baseLineColor;
      ctx.lineWidth = (idx === 2) ? 1.5 : 1;
      if (idx === 1) ctx.setLineDash([4, 6]);
      else ctx.setLineDash([]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Rotating Radar Sweep Beam
    const sweepLength = 230;
    const sweepEnd = {
      x: cx + Math.cos(radarAngle) * sweepLength,
      y: cy + Math.sin(radarAngle) * sweepLength
    };

    // Draw radar beam line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepEnd.x, sweepEnd.y);
    ctx.strokeStyle = accentRed;
    ctx.lineWidth = 2;
    ctx.shadowColor = accentRed;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Radar cone trail
    const trailSegments = 8;
    for (let i = 1; i <= trailSegments; i++) {
      const trailAngle = radarAngle - (i * 0.04);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(trailAngle) * sweepLength, cy + Math.sin(trailAngle) * sweepLength);
      ctx.strokeStyle = isDark ? `rgba(255, 59, 83, ${0.35 - (i / trailSegments) * 0.35})` : `rgba(255, 42, 64, ${0.25 - (i / trailSegments) * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Interactive crosshair if mouse inside
    if (mouse.x > -500) {
      ctx.strokeStyle = accentRed;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mouse.x - 16, mouse.y);
      ctx.lineTo(mouse.x + 16, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - 16);
      ctx.lineTo(mouse.x, mouse.y + 16);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillText(`LOC [${Math.round(mouse.x)}, ${Math.round(mouse.y)}]`, mouse.x + 12, mouse.y - 10);
    }
  }

  renderBrutalistHatch(ctx, width, height, time, glyphNodes, mouse, isDark, accentRed, baseLineColor, midLineColor) {
    // Background moving 45-degree hatch stripes
    const hatchStep = 32;
    const hatchOffset = (time * 24) % hatchStep;
    ctx.strokeStyle = baseLineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -height; x <= width + height; x += hatchStep) {
      ctx.moveTo(x + hatchOffset, 0);
      ctx.lineTo(x + hatchOffset + height, height);
    }
    ctx.stroke();

    // Floating glyph symbols and connecting constellation
    glyphNodes.forEach((node, i) => {
      node.x += node.vx * this.patternSpeedMultiplier;
      node.y += node.vy * this.patternSpeedMultiplier;
      node.rot += node.vrot;

      // Wrap around bounds
      if (node.x < -40) node.x = width + 40;
      if (node.x > width + 40) node.x = -40;
      if (node.y < -40) node.y = height + 40;
      if (node.y > height + 40) node.y = -40;

      // Mouse repulsion
      if (mouse.x > -500) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          node.x += (dx / d) * 3;
          node.y += (dy / d) * 3;
        }
      }

      // Constellation lines to nearby neighbors
      for (let j = i + 1; j < glyphNodes.length; j++) {
        const other = glyphNodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = 1 - dist / 130;
          ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${alpha * 0.18})` : `rgba(10, 12, 16, ${alpha * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }

      // Render Glyph Symbol
      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(node.rot);
      ctx.font = `800 ${node.size}px "JetBrains Mono", monospace`;
      ctx.fillStyle = (i % 3 === 0) ? accentRed : (isDark ? '#e2e8f0' : '#0a0c10');
      if (i % 3 === 0) {
        ctx.shadowColor = accentRed;
        ctx.shadowBlur = 8;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.symbol, 0, 0);
      ctx.restore();
    });
  }

  renderQuantumVortex(ctx, width, height, time, particles, mouse, isDark, accentRed, baseLineColor) {
    const cx = (mouse.x > -500) ? (width / 2 + (mouse.x - width / 2) * 0.4) : width / 2;
    const cy = (mouse.y > -500) ? (height / 2 + (mouse.y - height / 2) * 0.4) : height / 2;

    // Draw concentric orbital paths
    ctx.strokeStyle = baseLineColor;
    ctx.lineWidth = 1;
    [70, 140, 210].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    particles.forEach((p, idx) => {
      p.angle += p.speed * this.patternSpeedMultiplier;
      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius * 0.65;

      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = (idx % 2 === 0) ? accentRed : (isDark ? '#ffffff' : '#0a0c10');
      if (idx % 2 === 0) {
        ctx.shadowColor = accentRed;
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Particle speed trail
      ctx.beginPath();
      const prevX = cx + Math.cos(p.angle - 0.08) * p.radius;
      const prevY = cy + Math.sin(p.angle - 0.08) * p.radius * 0.65;
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isDark ? 'rgba(255, 59, 83, 0.3)' : 'rgba(255, 42, 64, 0.25)';
      ctx.lineWidth = p.size * 0.8;
      ctx.stroke();
    });
  }

  // --- INTERACTIVE CONTROLS ---
  cycleHeroPattern() {
    if (!this.patternModes) return;
    this.currentPatternMode = (this.currentPatternMode + 1) % this.patternModes.length;
    const modeName = this.patternModes[this.currentPatternMode];
    const titleEl = document.getElementById('pattern-mode-title');
    if (titleEl) {
      titleEl.textContent = modeName;
    }
    this.showToast(`Corak Kinetik: ${modeName}`, 'info');
  }

  toggleHeroPatternSpeed() {
    if (this.patternSpeedMultiplier === 1.0) {
      this.patternSpeedMultiplier = 1.5;
    } else if (this.patternSpeedMultiplier === 1.5) {
      this.patternSpeedMultiplier = 2.0;
    } else {
      this.patternSpeedMultiplier = 1.0;
    }
    const textEl = document.getElementById('pattern-speed-text');
    if (textEl) {
      textEl.textContent = `${this.patternSpeedMultiplier.toFixed(1)}X`;
    }
    this.showToast(`Kecepatan Animasi: ${this.patternSpeedMultiplier.toFixed(1)}X`, 'info');
  }

  // Backward-compatible stubs in case legacy calls exist
  toggleHeroVideoMute() {
    this.cycleHeroPattern();
  }

  toggleHeroVideoPlay() {
    this.toggleHeroPatternSpeed();
  }
}

// Global Application Instance
window.app = null;
function initFozzApp() {
  if (!window.app) {
    window.app = new FozzApp();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initFozzApp);
} else {
  initFozzApp();
}

