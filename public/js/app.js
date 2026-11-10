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
    this.newProductFile = null;
    this.editProductFile = null;

    this.init();
  }

  init() {
    this.initTheme();
    this.checkDebugBarVisibility();
    this.initRouting();
    this.updateUserUI();
    this.renderCatalog();
    this.updateCartBadges();
    this.updateWishlistBadges();
    this.initAdminViews();
    this.initHeroPatternAnimation();

    // Periksa notifikasi penolakan / peringatan keamanan (misal dialihkan dari admin.html)
    const secAlert = sessionStorage.getItem('fozz_security_alert');
    if (secAlert) {
      sessionStorage.removeItem('fozz_security_alert');
      setTimeout(() => {
        this.showToast(secAlert, 'danger');
      }, 350);
    }

    // Listener keyboard Escape untuk menutup menu navigasi mobile
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMobileMenu(false);
      }
    });

    // Otomatis tutup menu mobile jika viewport di-resize ke ukuran desktop & perbarui status bar debug
    window.addEventListener('resize', () => {
      this.checkDebugBarVisibility();
      if (window.innerWidth > 1024) {
        this.toggleMobileMenu(false);
      }
    });

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

  // Debug Bar Controller: otomatis sembunyikan di mobile/tablet & layar sentuh
  checkDebugBarVisibility() {
    const isMobileDevice = window.innerWidth <= 1024 ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isDismissed = sessionStorage.getItem('fozz_hide_debug_bar') === 'true';

    const roleBar = document.getElementById('role-bar');
    if (roleBar) {
      if (isMobileDevice || isDismissed) {
        roleBar.style.display = 'none';
        roleBar.setAttribute('aria-hidden', 'true');
      } else {
        roleBar.style.display = 'flex';
        roleBar.removeAttribute('aria-hidden');
      }
    }
  }

  dismissDebugBar() {
    const roleBar = document.getElementById('role-bar');
    if (roleBar) {
      roleBar.style.display = 'none';
      roleBar.setAttribute('aria-hidden', 'true');
    }
    sessionStorage.setItem('fozz_hide_debug_bar', 'true');
    this.showToast('Bar debug disembunyikan.', 'info');
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

    const isDanger = type === 'danger';
    const isSuccess = type === 'success';
    const strokeColor = isSuccess ? '#10b981' : '#ff334b';

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isDanger) {
      toast.style.borderColor = 'var(--accent-red)';
      toast.style.borderLeft = '6px solid var(--accent-red)';
      toast.style.background = 'rgba(255, 42, 64, 0.08)';
    }
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    const duration = isDanger ? 4000 : 2800;
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'transform 0.08s cubic-bezier(0, 0, 0.2, 1)';
      setTimeout(() => toast.remove(), 80);
    }, duration);
  }

  // --- ROUTING & ADMIN ACCESS GATE ---
  initRouting() {
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  }

  handleRouting() {
    const hash = window.location.hash;
    const isStandaloneAdmin = window.location.pathname.endsWith('admin.html') || window.location.pathname.startsWith('/admin');
    if (hash === '#admin' || hash === '#/admin' || window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      if (!isStandaloneAdmin) {
        window.location.href = 'admin.html';
        return;
      }
      const user = DB.getCurrentUser();
      const isAdminAuthenticated = sessionStorage.getItem('fozz_admin_authenticated') === 'true';
      if (user && user.role === 'admin' && isAdminAuthenticated) {
        this.showAdminView();
      } else {
        this.showCustomerView();
      }
    } else {
      if (!isStandaloneAdmin) {
        this.showCustomerView();
      }
    }
  }

  requestAdminAccess(event) {
    if (event) event.preventDefault();
    const user = DB.getCurrentUser();
    if (user && user.role === 'customer') {
      this.showToast('Akses Admin Ditolak: Anda login sebagai pelanggan umum (' + (user.nama_lengkap || user.email) + ').', 'danger');
      return;
    }
    window.location.href = 'admin.html';
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
    const btnCust = document.getElementById('btn-switch-customer');
    const btnAdmin = document.getElementById('btn-switch-admin');
    const roleLabel = document.getElementById('role-label');

    if (custView) custView.style.display = 'none';
    if (adminView) adminView.style.display = 'block';
    if (btnCust) btnCust.classList.remove('active');
    if (btnAdmin) btnAdmin.classList.add('active');
    if (roleLabel && currentUser) {
      roleLabel.textContent = `ADMIN HQ: ${currentUser.nama_lengkap}`;
    }
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
    const btnCust = document.getElementById('btn-switch-customer');
    const btnAdmin = document.getElementById('btn-switch-admin');
    const roleLabel = document.getElementById('role-label');
    const currentUser = DB.getCurrentUser();

    if (custView) custView.style.display = 'block';
    if (adminView) adminView.style.display = 'none';
    if (btnCust) btnCust.classList.add('active');
    if (btnAdmin) btnAdmin.classList.remove('active');
    if (roleLabel && currentUser) {
      roleLabel.textContent = `CUSTOMER: ${currentUser.nama_lengkap}`;
    }

    this.updateUserUI();
  }

  logoutAdmin() {
    sessionStorage.removeItem('fozz_admin_authenticated');
    DB.setCurrentUser(null);

    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      history.pushState(null, document.title, window.location.pathname + window.location.search);
    }

    this.showCustomerView();
    this.updateUserUI();
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
    const mobileNavName = document.getElementById('mobile-nav-user-name');
    const mobileLabel = document.getElementById('mobile-user-panel-label');
    const roleLabel = document.getElementById('role-label');

    if (currentUser && currentUser.nama_lengkap) {
      if (navName) navName.textContent = currentUser.nama_lengkap;
      if (mobileNavName) mobileNavName.textContent = currentUser.nama_lengkap;
      if (mobileLabel) mobileLabel.textContent = 'PELANGGAN AKTIF';
      if (roleLabel) {
        roleLabel.textContent = `${currentUser.role === 'admin' ? 'ADMIN HQ' : 'CUSTOMER'}: ${currentUser.nama_lengkap}`;
      }
    } else {
      if (navName) navName.textContent = 'Masuk / Daftar';
      if (mobileNavName) mobileNavName.textContent = 'Masuk / Daftar';
      if (mobileLabel) mobileLabel.textContent = 'AKUN PELANGGAN';
      if (roleLabel) {
        roleLabel.textContent = 'PEMBELI UMUM';
      }
    }
  }

  // Mobile Navigation Drawer Toggle
  toggleMobileMenu(isOpen) {
    const drawer = document.getElementById('mobile-nav-drawer');
    const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
    if (!drawer) return;

    const shouldOpen = typeof isOpen === 'boolean' ? isOpen : !drawer.classList.contains('open');
    if (shouldOpen) {
      drawer.classList.add('open');
      if (toggleBtn) {
        toggleBtn.classList.add('active');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      if (toggleBtn) {
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }
  }

  // --- CATALOG & EXPLORATION ---
  renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Hanya tampilkan artikel aktif di etalase toko (artikel berstatus 'archived' disembunyikan)
    let products = DB.getProducts().filter(p => p.status !== 'archived');
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

    // Size Filter (Mendukung ukuran huruf, angka 28-34, dan ALL-SIZE)
    if (this.selectedSizeFilter && this.selectedSizeFilter.trim() !== '') {
      const allSizes = DB.getProductSizes();
      const targetSize = this.selectedSizeFilter.trim().toLowerCase();
      const productIdsWithSize = allSizes
        .filter(s => s.ukuran && s.ukuran.toString().trim().toLowerCase() === targetSize && s.stok > 0)
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

    this.renderSizeFilterOptions();

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
    this.toggleMobileMenu(false);
    // 1. Pindah view kembali ke katalog jika saat ini berada di halaman retur
    const catalogView = document.getElementById('customer-catalog-view');
    const returnsView = document.getElementById('customer-returns-view');
    const navCatalog = document.getElementById('nav-link-catalog');
    const navReturns = document.getElementById('nav-link-returns');

    if (returnsView && returnsView.style.display !== 'none') {
      if (catalogView) catalogView.style.display = 'block';
      returnsView.style.display = 'none';
      if (navCatalog) navCatalog.classList.add('active');
      if (navReturns) navReturns.classList.remove('active');

      // Scroll halus ke daftar produk katalog
      setTimeout(() => {
        const filterBar = document.querySelector('.filter-bar') || document.querySelector('.catalog-section');
        if (filterBar) {
          filterBar.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }
      }, 50);
    }

    // 2. Set kategori aktif dan sinkronkan pill kategori
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

    // 3. Reset ukuran terpilih jika ukuran tersebut tidak ada di kategori terpilih
    if (this.selectedSizeFilter) {
      const allSizes = DB.getProductSizes();
      const catProds = category === 'ALL' 
        ? DB.getProducts().filter(p => p.status !== 'archived') 
        : DB.getProducts().filter(p => p.status !== 'archived' && p.kategori && p.kategori.toLowerCase() === category.toLowerCase());
      const catProdIds = new Set(catProds.map(p => p.id));
      const hasSize = allSizes.some(s => catProdIds.has(s.product_id) && s.ukuran && s.ukuran.toString().toLowerCase() === this.selectedSizeFilter.toLowerCase());
      if (!hasSize) {
        this.selectedSizeFilter = '';
      }
    }

    // 4. Render ulang katalog produk
    this.renderCatalog();
  }

  handleSearch(val) {
    this.searchQuery = val;
    this.renderCatalog();
  }

  renderSizeFilterOptions() {
    const select = document.getElementById('size-filter-select');
    if (!select) return;

    // Ambil seluruh ukuran unik dari database (dinamis)
    const allSizes = DB.getProductSizes() || [];
    const sizeSet = new Set();
    allSizes.forEach(s => {
      if (s.ukuran) sizeSet.add(s.ukuran.toString().trim());
    });

    // Pastikan varian baseline selalu tercakup
    ['S', 'M', 'L', 'XL', '28', '30', '32', '34', 'ALL-SIZE'].forEach(sz => sizeSet.add(sz));

    const letterOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];
    const letterSizes = [];
    const numericSizes = [];
    const otherSizes = [];

    Array.from(sizeSet).forEach(sz => {
      const upper = sz.toUpperCase();
      if (letterOrder.includes(upper)) {
        letterSizes.push(sz);
      } else if (!isNaN(parseFloat(sz)) && /^\d+$/.test(sz.trim())) {
        numericSizes.push(sz);
      } else {
        otherSizes.push(sz);
      }
    });

    letterSizes.sort((a, b) => letterOrder.indexOf(a.toUpperCase()) - letterOrder.indexOf(b.toUpperCase()));
    numericSizes.sort((a, b) => parseFloat(a) - parseFloat(b));
    otherSizes.sort((a, b) => a.localeCompare(b));

    const currentVal = (this.selectedSizeFilter || '').trim().toLowerCase();

    let html = '<option value="">Semua Size</option>';

    if (letterSizes.length > 0) {
      html += '<optgroup label="Tops &amp; Outerwear">';
      letterSizes.forEach(s => {
        const isSel = currentVal === s.toLowerCase() ? 'selected' : '';
        html += `<option value="${s}" ${isSel}>Size ${s}</option>`;
      });
      html += '</optgroup>';
    }

    if (numericSizes.length > 0) {
      html += '<optgroup label="Pants / Waist">';
      numericSizes.forEach(s => {
        const isSel = currentVal === s.toLowerCase() ? 'selected' : '';
        html += `<option value="${s}" ${isSel}>Size ${s}</option>`;
      });
      html += '</optgroup>';
    }

    if (otherSizes.length > 0) {
      html += '<optgroup label="Accessories / Universal">';
      otherSizes.forEach(s => {
        const isSel = currentVal === s.toLowerCase() ? 'selected' : '';
        const label = s.toUpperCase() === 'ALL-SIZE' ? 'ALL-SIZE' : s;
        html += `<option value="${s}" ${isSel}>${label}</option>`;
      });
      html += '</optgroup>';
    }

    if (select.innerHTML !== html) {
      select.innerHTML = html;
    }
    select.value = this.selectedSizeFilter || '';
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
    if (isOpen) this.toggleMobileMenu(false);
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
    this.toggleMobileMenu(false);
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
    const userId = currentUser ? currentUser.id : null;
    const newOrder = DB.createOrder(userId, cart, address, courier, 20000, "Pending", paymentMethod);

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

  renderPaymentInstrument(order) {
    const container = document.getElementById('gateway-instrument-container');
    if (!container) return;

    if (order.status_pesanan === 'Paid') {
      container.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.08); border: 2px solid var(--accent-green); border-radius: var(--radius-md); padding: 2.25rem 1.5rem; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--accent-green); color: #fff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.85rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 style="font-size: 1.4rem; color: var(--accent-green); margin-bottom: 0.4rem;">Pembayaran Berhasil Dikonfirmasi!</h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); max-width: 460px; margin: 0 auto 1.5rem; line-height: 1.5;">
            Terima kasih! Pembayaran Anda telah kami terima secara otomatis. Stok produk Anda telah diamankan dan pesanan Anda sedang disiapkan untuk pengiriman.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" onclick="app.closePaymentGatewayModal(); app.openOrderHistory();">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              Lacak Perjalanan Paket &amp; Resi &rarr;
            </button>
          </div>
        </div>
      `;
      return;
    }

    const isQris = order.payment_method === 'qris' || order.payment_method === 'credit_card';

    if (isQris) {
      // Dynamic QRIS View with Step-by-Step Flow & Konfirmasi Bayar
      container.innerHTML = `
        <div class="payment-steps-container">
          <!-- STEP 1: Scan QRIS -->
          <div class="payment-step">
            <div class="payment-step-number">1</div>
            <div class="payment-step-content">
              <div class="payment-step-title">Pindai Kode QRIS</div>
              <div class="payment-step-desc">Buka aplikasi m-banking atau e-wallet Anda, lalu scan kode QR di bawah ini.</div>
            </div>
          </div>

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
                <rect x="0" y="0" width="200" height="200" fill="#ffffff"/>
                <rect x="15" y="15" width="45" height="45" fill="#000000"/>
                <rect x="22" y="22" width="31" height="31" fill="#ffffff"/>
                <rect x="29" y="29" width="17" height="17" fill="#000000"/>
                <rect x="140" y="15" width="45" height="45" fill="#000000"/>
                <rect x="147" y="22" width="31" height="31" fill="#ffffff"/>
                <rect x="154" y="29" width="17" height="17" fill="#000000"/>
                <rect x="15" y="140" width="45" height="45" fill="#000000"/>
                <rect x="22" y="147" width="31" height="31" fill="#ffffff"/>
                <rect x="29" y="154" width="17" height="17" fill="#000000"/>
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

            <div style="font-size: 1.15rem; font-weight: 900; color: #ff2a40; font-family: var(--font-mono); margin-bottom: 0.5rem;">
              ${this.formatRupiah(order.total_harga)}
            </div>

            <div class="payment-badges">
              <span class="payment-badge">GoPay</span>
              <span class="payment-badge">OVO</span>
              <span class="payment-badge">DANA</span>
              <span class="payment-badge">ShopeePay</span>
              <span class="payment-badge">BCA Mobile</span>
              <span class="payment-badge">Livin'</span>
            </div>
          </div>

          <!-- STEP 2: Konfirmasi Bayar -->
          <div class="payment-step-connector">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>

          <div class="payment-step">
            <div class="payment-step-number">2</div>
            <div class="payment-step-content">
              <div class="payment-step-title">Konfirmasi Pembayaran</div>
              <div class="payment-step-desc">Setelah berhasil scan & bayar di aplikasi Anda, tekan tombol di bawah untuk mengonfirmasi pembayaran.</div>
            </div>
          </div>

          <!-- PROMINENT KONFIRMASI BAYAR BUTTON -->
          <button class="btn-confirm-pay" id="btn-confirm-pay-qris" onclick="app.confirmPayment('${order.id}', 'qris')">
            <svg class="confirm-pay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            KONFIRMASI BAYAR
          </button>
        </div>
      `;
    } else {
      // Virtual Account View with Step-by-Step Flow & Konfirmasi Bayar
      const activeBank = (order.va_bank || 'BCA').toLowerCase();
      const currentUser = DB.getCurrentUser();

      container.innerHTML = `
        <div class="payment-steps-container">
          <!-- STEP 1: Salin Nomor VA -->
          <div class="payment-step">
            <div class="payment-step-number">1</div>
            <div class="payment-step-content">
              <div class="payment-step-title">Salin Nomor Virtual Account</div>
              <div class="payment-step-desc">Pilih bank, salin nomor VA, lalu transfer melalui m-banking atau ATM Anda.</div>
            </div>
          </div>

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

            <div style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.25rem;">
                <span style="color: var(--text-muted);">Nama Rekening Tujuan:</span>
                <strong>FOZZ - ${(currentUser && currentUser.nama_lengkap ? currentUser.nama_lengkap : 'PELANGGAN RESMI').toUpperCase()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span style="color: var(--text-muted);">Tipe Virtual Account:</span>
                <strong style="color: var(--accent-green);">Closed VA (Auto-Reconciled)</strong>
              </div>
            </div>
          </div>

          <!-- STEP 2: Konfirmasi Bayar -->
          <div class="payment-step-connector">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>

          <div class="payment-step">
            <div class="payment-step-number">2</div>
            <div class="payment-step-content">
              <div class="payment-step-title">Konfirmasi Pembayaran</div>
              <div class="payment-step-desc">Setelah transfer berhasil melalui m-banking atau ATM, tekan tombol di bawah untuk mengonfirmasi pembayaran.</div>
            </div>
          </div>

          <!-- PROMINENT KONFIRMASI BAYAR BUTTON -->
          <button class="btn-confirm-pay" id="btn-confirm-pay-va" onclick="app.confirmPayment('${order.id}', 'va')">
            <svg class="confirm-pay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            KONFIRMASI BAYAR
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
  }

  // --- KONFIRMASI BAYAR: Verifikasi Otomatis ---
  confirmPayment(orderId, instrumentType) {
    const btn = document.getElementById(`btn-confirm-pay-${instrumentType}`);
    if (!btn || btn.disabled) return;

    // Disable button and show processing spinner
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner"></span>
      Memverifikasi Pembayaran...
    `;

    setTimeout(() => {
      this.simulateWebhookPayment(orderId, instrumentType);
    }, 700);
  }

  simulateWebhookPayment(orderId, instrumentType) {
    const order = DB.getOrders().find(o => o.id === orderId);
    if (!order) return;

    // Update status pesanan ke Paid
    DB.updateOrderStatus(order.id, 'Paid', null, {
      settlement_time: new Date().toISOString(),
      signature_verified: true,
      webhook_received: true
    });

    this.renderCatalog();
    this.updateCartBadges();

    const updatedOrder = DB.getOrders().find(o => o.id === orderId);
    const statusPill = document.getElementById('gateway-order-status');
    if (statusPill) {
      statusPill.textContent = 'Paid';
      statusPill.className = 'status-pill status-paid';
    }

    this.renderPaymentInstrument(updatedOrder);
    this.showToast(`Pembayaran pesanan #${order.id} berhasil diverifikasi!`, 'success');
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
    this.toggleMobileMenu(false);
    const currentUser = DB.getCurrentUser();
    const container = document.getElementById('order-history-container');
    const allOrders = DB.getOrders();
    const myOrders = currentUser ? allOrders.filter(o => o.user_id === currentUser.id) : [];

    if (!currentUser) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted); border: 2px dashed var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔐</div>
          <h3 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 0.35rem;">Masuk untuk Melacak Pesanan</h3>
          <p style="font-size: 0.85rem; max-width: 380px; margin: 0 auto 1.25rem auto;">Silakan masuk atau daftar akun resmi FOZZ untuk melacak riwayat paket dan nomor resi pengiriman real-time Anda.</p>
          <button class="btn-primary" onclick="app.closeModal('order-history-modal'); app.openProfileModal();" style="margin: 0 auto;">
            Masuk / Buat Akun
          </button>
        </div>
      `;
      this.openModal('order-history-modal');
      return;
    }

    if (myOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          <h3>Belum ada pesanan aktif</h3>
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
                ${['shipped', 'delivered'].includes((ord.status_pesanan || '').toLowerCase()) ? `
                  <button class="btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" onclick="app.openReturnRequestForOrder('${ord.id}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                    Ajukan Retur / Tukar Size
                  </button>
                ` : `
                  <span style="font-size: 0.72rem; color: var(--text-muted); background: var(--bg-muted); padding: 0.35rem 0.6rem; border-radius: 4px;">
                    Retur aktif setelah Shipped/Delivered
                  </span>
                `}
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

  // --- USER PROFILE & SUPABASE AUTHENTICATION (PEMBELI UMUM: MASUK & DAFTAR RESMI) ---
  openProfileModal() {
    this.toggleMobileMenu(false);
    const user = DB.getCurrentUser();

    const authContainer = document.getElementById('auth-forms-container');
    const profileContainer = document.getElementById('auth-profile-container');

    if (!user) {
      if (authContainer) authContainer.style.display = 'block';
      if (profileContainer) profileContainer.style.display = 'none';
      this.switchAuthTab('login');

      // Bersihkan input & error
      const loginEmail = document.getElementById('login-customer-email');
      const loginPass = document.getElementById('login-customer-password');
      const loginErr = document.getElementById('login-customer-error');
      const regErr = document.getElementById('register-customer-error');
      if (loginEmail) loginEmail.value = '';
      if (loginPass) loginPass.value = '';
      if (loginErr) { loginErr.style.display = 'none'; loginErr.textContent = ''; }
      if (regErr) { regErr.style.display = 'none'; regErr.textContent = ''; }
    } else {
      if (authContainer) authContainer.style.display = 'none';
      if (profileContainer) profileContainer.style.display = 'block';

      const avatarEl = document.getElementById('logged-user-avatar');
      const nameEl = document.getElementById('logged-user-name');
      const emailEl = document.getElementById('logged-user-email');
      const editName = document.getElementById('profile-edit-name');
      const editPhone = document.getElementById('profile-edit-phone');
      const editAddress = document.getElementById('profile-edit-address');

      const initial = (user.nama_lengkap || user.email || 'U').charAt(0).toUpperCase();
      if (avatarEl) avatarEl.textContent = initial;
      if (nameEl) nameEl.textContent = user.nama_lengkap || 'Pelanggan FOZZ';
      if (emailEl) emailEl.textContent = user.email || '';
      if (editName) editName.value = user.nama_lengkap || '';
      if (editPhone) editPhone.value = user.no_telepon || '';
      if (editAddress) editAddress.value = user.alamat_default || '';
    }

    this.openModal('user-profile-modal');
  }

  switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const panelLogin = document.getElementById('auth-panel-login');
    const panelRegister = document.getElementById('auth-panel-register');
    const loginErr = document.getElementById('login-customer-error');
    const regErr = document.getElementById('register-customer-error');

    if (loginErr) { loginErr.style.display = 'none'; loginErr.textContent = ''; }
    if (regErr) { regErr.style.display = 'none'; regErr.textContent = ''; }

    if (tab === 'register') {
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
      if (panelLogin) panelLogin.style.display = 'none';
      if (panelRegister) panelRegister.style.display = 'block';
      setTimeout(() => {
        const nameInput = document.getElementById('reg-customer-name');
        if (nameInput) nameInput.focus();
      }, 60);
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (panelLogin) panelLogin.style.display = 'block';
      if (panelRegister) panelRegister.style.display = 'none';
      setTimeout(() => {
        const emailInput = document.getElementById('login-customer-email');
        if (emailInput) emailInput.focus();
      }, 60);
    }
  }

  toggleAuthPasswordVisibility(inputId, iconId, textId) {
    const passInput = document.getElementById(inputId);
    const passIcon = document.getElementById(iconId);
    const passText = document.getElementById(textId);
    if (!passInput) return;

    if (passInput.type === 'password') {
      passInput.type = 'text';
      if (passIcon) passIcon.textContent = '🔒';
      if (passText) passText.textContent = 'Tutup';
    } else {
      passInput.type = 'password';
      if (passIcon) passIcon.textContent = '👁️';
      if (passText) passText.textContent = 'Lihat';
    }
  }

  async handleCustomerLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('login-customer-email');
    const passInput = document.getElementById('login-customer-password');
    const errEl = document.getElementById('login-customer-error');
    const btnSubmit = document.getElementById('btn-submit-login');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !password) {
      if (errEl) {
        errEl.textContent = 'Silakan masukkan email dan kata sandi Anda.';
        errEl.style.display = 'block';
      }
      return;
    }

    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

    // Loading State
    const originalBtnHtml = btnSubmit ? btnSubmit.innerHTML : 'Masuk Sekarang';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        Memverifikasi Akun Supabase...
      `;
    }

    try {
      const result = await DB.signInCustomer({ email, password });

      if (!result.success) {
        if (errEl) {
          errEl.textContent = result.error || 'Gagal masuk akun. Silakan periksa kredensial Anda.';
          errEl.style.display = 'block';
        }
        if (passInput) passInput.focus();
        return;
      }

      // Berhasil Login
      this.closeModal('user-profile-modal');
      this.updateUserUI();
      this.showToast(`Selamat datang kembali, ${result.user.nama_lengkap}! Sesi Supabase aktif.`, 'success');

      if (this.currentRole === 'customer') {
        this.renderCatalog();
      }
    } catch (err) {
      if (errEl) {
        errEl.textContent = 'Terjadi kesalahan sistem saat mencoba masuk. Silakan coba kembali.';
        errEl.style.display = 'block';
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnHtml;
      }
    }
  }

  async handleCustomerRegister(event) {
    event.preventDefault();
    const nameInput = document.getElementById('reg-customer-name');
    const emailInput = document.getElementById('reg-customer-email');
    const passInput = document.getElementById('reg-customer-password');
    const confirmInput = document.getElementById('reg-customer-confirm-password');
    const phoneInput = document.getElementById('reg-customer-phone');
    const addrInput = document.getElementById('reg-customer-address');
    const errEl = document.getElementById('register-customer-error');
    const btnSubmit = document.getElementById('btn-submit-register');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value : '';
    const confirmPass = confirmInput ? confirmInput.value : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const address = addrInput ? addrInput.value.trim() : '';

    if (!name || !email || !pass) {
      if (errEl) {
        errEl.textContent = 'Nama lengkap, email, dan kata sandi wajib diisi.';
        errEl.style.display = 'block';
      }
      return;
    }

    if (pass.length < 6) {
      if (errEl) {
        errEl.textContent = 'Kata sandi minimal harus 6 karakter (ketentuan Supabase).';
        errEl.style.display = 'block';
      }
      if (passInput) passInput.focus();
      return;
    }

    if (pass !== confirmPass) {
      if (errEl) {
        errEl.textContent = 'Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.';
        errEl.style.display = 'block';
      }
      if (confirmInput) confirmInput.focus();
      return;
    }

    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

    // Loading State
    const originalBtnHtml = btnSubmit ? btnSubmit.innerHTML : 'Daftar Akun Baru';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        Mendaftarkan ke Supabase Auth...
      `;
    }

    try {
      const result = await DB.signUpCustomer({
        email,
        password: pass,
        nama_lengkap: name,
        no_telepon: phone,
        alamat_default: address
      });

      if (!result.success) {
        if (errEl) {
          errEl.textContent = result.error || 'Gagal mendaftarkan akun. Silakan periksa data Anda.';
          errEl.style.display = 'block';
        }
        return;
      }

      if (result.requiresConfirmation) {
        this.showToast('Registrasi Berhasil! Silakan periksa inbox email Anda untuk aktivasi.', 'success');
        this.switchAuthTab('login');
        const loginEmailInput = document.getElementById('login-customer-email');
        if (loginEmailInput) loginEmailInput.value = email;
      } else {
        this.closeModal('user-profile-modal');
        this.updateUserUI();
        this.showToast(`Akun berhasil dibuat! Selamat datang di FOZZ.CO, ${result.user.nama_lengkap}.`, 'success');
      }
    } catch (err) {
      if (errEl) {
        errEl.textContent = 'Terjadi kesalahan sistem saat mendaftar. Silakan coba kembali.';
        errEl.style.display = 'block';
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnHtml;
      }
    }
  }

  async handleUpdateProfile(event) {
    event.preventDefault();
    const name = document.getElementById('profile-edit-name').value.trim();
    const phone = document.getElementById('profile-edit-phone').value.trim();
    const address = document.getElementById('profile-edit-address').value.trim();

    if (!name) {
      this.showToast('Nama lengkap wajib diisi.', 'warn');
      return;
    }

    const result = await DB.updateCustomerProfile({
      nama_lengkap: name,
      no_telepon: phone,
      alamat_default: address
    });

    if (result.success) {
      this.updateUserUI();
      this.closeModal('user-profile-modal');
      this.showToast('Profil dan alamat pengiriman berhasil diperbarui.', 'success');
    } else {
      this.showToast(result.error || 'Gagal memperbarui profil.', 'danger');
    }
  }

  async logoutCustomer() {
    await DB.signOutCustomer();
    this.updateUserUI();
    this.closeModal('user-profile-modal');
    this.showToast('Anda telah keluar dari akun. Mode pembeli umum aktif.', 'info');
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
      const isArchived = prod.status === 'archived';

      const sizeInputs = prodSizes.map(s => {
        const isLow = s.stok <= 3 && s.stok > 0;
        const isOut = s.stok === 0;
        const statusClass = isOut ? 'out-of-stock' : (isLow ? 'low-stock' : '');
        
        return `
          <div class="restock-size-card" id="size-card-${s.id}">
            <div class="restock-size-header">
              <span class="restock-size-label">SIZE ${s.ukuran}</span>
              <span class="restock-size-count ${statusClass}">${s.stok} pcs</span>
            </div>
            <div class="restock-size-body">
              <input type="number" 
                     value="${s.stok}" 
                     min="0" 
                     class="restock-input" 
                     title="Ubah angka total stok Size ${s.ukuran}" 
                     onchange="app.saveStockAdjustment('${s.id}', this.value)">
              <div class="restock-quick-chips">
                <button type="button" class="btn-restock-chip" onclick="app.quickAddStock('${s.id}', 1, '${s.ukuran}')" title="Tambah +1 pcs Size ${s.ukuran}">+1</button>
                <button type="button" class="btn-restock-chip" onclick="app.quickAddStock('${s.id}', 5, '${s.ukuran}')" title="Tambah +5 pcs Size ${s.ukuran}">+5</button>
                <button type="button" class="btn-restock-chip highlight" onclick="app.quickAddStock('${s.id}', 10, '${s.ukuran}')" title="Tambah +10 pcs saat kiriman konveksi tiba">+10</button>
                <button type="button" class="btn-restock-chip custom" onclick="app.promptQuickAddStock('${s.id}', '${s.ukuran}')" title="Restock Kustom (+N pcs)">+N</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const statusBadge = isArchived
        ? `<span class="badge-tag" style="background: rgba(255, 51, 75, 0.15); color: var(--accent-red); border: 1px solid var(--accent-red); font-size: 0.68rem; padding: 0.2rem 0.5rem; font-weight: 700;">DIARSIPKAN</span>`
        : `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-green); border: 1px solid var(--accent-green); font-size: 0.68rem; padding: 0.2rem 0.5rem; font-weight: 700;">AKTIF</span>`;

      return `
        <tr style="${isArchived ? 'opacity: 0.65; background: rgba(0, 0, 0, 0.02);' : ''}">
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${prod.gambar_url}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);">
              <div>
                <strong style="color: var(--text-primary); font-size: 0.9rem;">${prod.nama_produk}</strong>
                <div class="mono-text" style="font-size: 0.72rem; color: var(--text-muted);">${prod.id}</div>
              </div>
            </div>
          </td>
          <td><span class="role-bar-badge">${prod.kategori}</span></td>
          <td class="mono-text font-weight-bold">${this.formatRupiah(prod.harga)}</td>
          <td>
            <div class="restock-sizes-container">${sizeInputs}</div>
          </td>
          <td>
            <strong style="color: ${totalStock > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
              ${totalStock} pcs
            </strong>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 0.35rem; flex-wrap: wrap;">
              <button class="role-btn" style="padding: 0.35rem 0.6rem; font-size: 0.72rem; border-color: var(--accent-green); color: var(--accent-green); display: inline-flex; align-items: center; gap: 4px;" onclick="app.openBatchRestockModal('${prod.id}')" title="Batch Restock Kiriman Konveksi">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Restock
              </button>
              <button class="role-btn" style="padding: 0.35rem 0.6rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;" onclick="app.openEditProductModal('${prod.id}')" title="Edit Detail &amp; Harga">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </button>
              <button class="role-btn" style="padding: 0.35rem 0.6rem; font-size: 0.72rem; ${isArchived ? 'border-color: var(--accent-green); color: var(--accent-green);' : 'border-color: #f59e0b; color: #f59e0b;'}" onclick="app.adminToggleArchiveProduct('${prod.id}')" title="${isArchived ? 'Aktifkan Kembali ke Katalog' : 'Arsipkan Drop'}">
                ${isArchived ? 'Aktifkan' : 'Arsipkan'}
              </button>
              <button class="role-btn" style="padding: 0.35rem 0.6rem; font-size: 0.72rem; border-color: var(--accent-red); color: var(--accent-red);" onclick="app.adminDeleteProduct('${prod.id}')" title="Hapus Drop">
                Hapus
              </button>
              <button class="role-btn" style="padding: 0.35rem 0.45rem; font-size: 0.72rem; opacity: 0.75;" onclick="app.openProductModal('${prod.id}')" title="Preview Tampilan Toko">
                👁️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  saveStockAdjustment(sizeId, newStock) {
    const parsed = Math.max(0, parseInt(newStock, 10) || 0);
    const updated = DB.updateStock(sizeId, parsed);
    if (updated) {
      this.showToast(`Stok Size ${updated.ukuran} diperbarui jadi ${updated.stok} pcs.`, 'success');
      this.renderAdminInventory();
      this.renderCatalog();
    }
  }

  quickAddStock(sizeId, addAmount, sizeName) {
    const added = parseInt(addAmount, 10) || 0;
    if (added <= 0) return;

    const updated = DB.restockSize(sizeId, added);
    if (updated) {
      this.showToast(`📦 Restock Berhasil! +${added} pcs Size ${sizeName || updated.ukuran} masuk gudang (Total sekarang: ${updated.stok} pcs).`, 'success');
      this.renderAdminInventory();
      this.renderCatalog();
    }
  }

  promptQuickAddStock(sizeId, sizeName) {
    const input = prompt(`Masukkan jumlah pcs Size ${sizeName} yang baru tiba dari konveksi:`, '10');
    if (input === null) return;
    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount <= 0) {
      this.showToast('Jumlah restock harus berupa angka positif.', 'info');
      return;
    }
    this.quickAddStock(sizeId, amount, sizeName);
  }

  // --- ADMIN: BATCH RESTOCK MODAL CONTROLLER ---
  openBatchRestockModal(productId) {
    const prod = DB.getProductById(productId);
    if (!prod) {
      this.showToast('Produk tidak ditemukan.', 'error');
      return;
    }

    const sizes = DB.getProductSizes().filter(s => s.product_id === prod.id);

    const prodIdInput = document.getElementById('batch-restock-prod-id');
    const prodIdLabel = document.getElementById('batch-restock-prod-id-label');
    const headerContainer = document.getElementById('batch-restock-product-header');
    const sizesContainer = document.getElementById('batch-restock-sizes-container');
    const noteInput = document.getElementById('batch-restock-note');

    if (prodIdInput) prodIdInput.value = prod.id;
    if (prodIdLabel) prodIdLabel.textContent = prod.id;
    if (noteInput) noteInput.value = '';

    if (headerContainer) {
      const currentTotal = sizes.reduce((sum, s) => sum + s.stok, 0);
      headerContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem; background: var(--bg-muted); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border-color);">
          <img src="${prod.gambar_url}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="role-bar-badge">${prod.kategori}</span>
              <span class="mono-text" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Total Saat Ini: <strong style="color: var(--accent-green);">${currentTotal} pcs</strong></span>
            </div>
            <h3 style="font-size: 1.05rem; margin: 0.2rem 0; font-family: var(--font-heading);">${prod.nama_produk}</h3>
            <span class="mono-text font-weight-bold" style="font-size: 0.8rem; color: var(--text-primary);">${this.formatRupiah(prod.harga)}</span>
          </div>
        </div>
      `;
    }

    if (sizesContainer) {
      sizesContainer.innerHTML = `
        <div style="background: var(--bg-surface); border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem;">
          <div style="display: grid; grid-template-columns: 75px 95px 1fr 95px; gap: 0.5rem; align-items: center; font-weight: 800; font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); border-bottom: 1.5px solid var(--border-color); padding-bottom: 0.4rem; margin-bottom: 0.5rem;">
            <span>Ukuran</span>
            <span>Stok Live</span>
            <span>+ Masuk (pcs)</span>
            <span style="text-align: right;">Stok Baru</span>
          </div>
          ${sizes.map(s => `
            <div style="display: grid; grid-template-columns: 75px 95px 1fr 95px; gap: 0.5rem; align-items: center; padding: 0.45rem 0; border-bottom: 1px dashed var(--border-color);">
              <div>
                <span class="role-bar-badge" style="font-size: 0.78rem; font-weight: 800;">SIZE ${s.ukuran}</span>
              </div>
              <div>
                <span class="mono-text" style="font-weight: 700; font-size: 0.82rem; color: ${s.stok > 0 ? 'var(--text-primary)' : 'var(--accent-red)'};">${s.stok} pcs</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.3rem;">
                <input type="number" 
                       id="batch-add-${s.id}" 
                       data-size-id="${s.id}" 
                       data-current-stock="${s.stok}"
                       data-size-name="${s.ukuran}"
                       value="0" 
                       min="0" 
                       class="restock-input" 
                       style="width: 58px; font-weight: 800;" 
                       oninput="app.updateBatchRestockPreview('${s.id}')">
                <button type="button" class="btn-restock-chip" onclick="app.setBatchAddInput('${s.id}', 5)">+5</button>
                <button type="button" class="btn-restock-chip highlight" onclick="app.setBatchAddInput('${s.id}', 10)">+10</button>
                <button type="button" class="btn-restock-chip" onclick="app.setBatchAddInput('${s.id}', 20)">+20</button>
              </div>
              <div style="text-align: right;">
                <strong id="batch-preview-${s.id}" class="mono-text" style="color: var(--accent-green); font-size: 0.82rem;">
                  ${s.stok} pcs
                </strong>
              </div>
            </div>
          `).join('')}
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.65rem; font-size: 0.8rem; font-weight: 800;">
            <span style="color: var(--text-secondary);">TOTAL KIRIMAN FISIK MASUK:</span>
            <span id="batch-total-added-preview" class="badge-tag" style="background: var(--accent-green); color: #fff; font-size: 0.82rem; padding: 0.25rem 0.6rem;">+0 pcs</span>
          </div>
        </div>
      `;
    }

    this.openModal('batch-restock-modal');
  }

  setBatchAddInput(sizeId, amount) {
    const input = document.getElementById(`batch-add-${sizeId}`);
    if (input) {
      const current = parseInt(input.value, 10) || 0;
      input.value = current + amount;
      this.updateBatchRestockPreview(sizeId);
    }
  }

  updateBatchRestockPreview(sizeId) {
    const input = document.getElementById(`batch-add-${sizeId}`);
    const previewEl = document.getElementById(`batch-preview-${sizeId}`);
    if (input && previewEl) {
      const currentStock = parseInt(input.getAttribute('data-current-stock'), 10) || 0;
      const added = Math.max(0, parseInt(input.value, 10) || 0);
      const newStock = currentStock + added;
      previewEl.textContent = added > 0 ? `${newStock} pcs (+${added})` : `${newStock} pcs`;
    }

    const allInputs = document.querySelectorAll('[id^="batch-add-"]');
    let grandTotalAdded = 0;
    allInputs.forEach(inp => {
      grandTotalAdded += Math.max(0, parseInt(inp.value, 10) || 0);
    });

    const totalEl = document.getElementById('batch-total-added-preview');
    if (totalEl) {
      totalEl.textContent = `+${grandTotalAdded} pcs`;
      totalEl.style.background = grandTotalAdded > 0 ? 'var(--accent-green)' : 'var(--text-muted)';
    }

    const submitBtn = document.getElementById('batch-restock-submit-btn');
    if (submitBtn) {
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Konfirmasi Masuk Gudang (+${grandTotalAdded} pcs)
      `;
    }
  }

  handleBatchRestockSubmit(event) {
    event.preventDefault();
    const prodId = document.getElementById('batch-restock-prod-id').value;
    const prod = DB.getProductById(prodId);
    if (!prod) return;

    const allInputs = document.querySelectorAll('[id^="batch-add-"]');
    const additions = {};
    let totalAdded = 0;

    allInputs.forEach(inp => {
      const sizeId = inp.getAttribute('data-size-id');
      const added = Math.max(0, parseInt(inp.value, 10) || 0);
      if (added > 0) {
        additions[sizeId] = added;
        totalAdded += added;
      }
    });

    if (totalAdded <= 0) {
      this.showToast('Masukkan kuantitas kiriman masuk fisik (minimal 1 pcs).', 'info');
      return;
    }

    const updatedSizes = DB.batchRestockProduct(prodId, additions);
    const note = document.getElementById('batch-restock-note').value.trim();
    const noteText = note ? ` [Ref: ${note}]` : '';

    this.closeModal('batch-restock-modal');
    this.refreshAdminData();
    this.renderCatalog();
    this.showToast(`📦 Restock Sukses! +${totalAdded} pcs berhasil dimasukkan ke stok drop "${prod.nama_produk}"${noteText}.`, 'success');
  }

  openAddProductModal() {
    this.newProductFile = null;
    const fileInput = document.getElementById('new-prod-file');
    const imgHidden = document.getElementById('new-prod-img');
    const previewContainer = document.getElementById('new-prod-preview-container');
    const previewImg = document.getElementById('new-prod-preview-img');

    if (fileInput) fileInput.value = '';
    if (imgHidden) imgHidden.value = '';
    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.style.display = 'none';

    this.openModal('add-product-modal');
  }

  handleProductFileSelected(event, mode = 'new') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('File harus berupa gambar (PNG, JPG, WEBP, AVIF).', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showToast('Ukuran foto melebihi batas maksimal 10MB.', 'warning');
      return;
    }

    if (mode === 'new') {
      this.newProductFile = file;
    } else {
      this.editProductFile = file;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const previewImg = document.getElementById(`${mode}-prod-preview-img`);
      const previewContainer = document.getElementById(`${mode}-prod-preview-container`);
      const fileNameEl = document.getElementById(`${mode}-prod-file-name`);
      const fileSizeEl = document.getElementById(`${mode}-prod-file-size`);
      const statusBadge = document.getElementById(`${mode}-prod-status-badge`);
      const hiddenInput = document.getElementById(`${mode}-prod-img`);

      if (previewImg) previewImg.src = dataUrl;
      if (previewContainer) previewContainer.style.display = 'flex';
      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileSizeEl) fileSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      if (statusBadge) {
        statusBadge.textContent = 'READY: SUPABASE BUCKET';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        statusBadge.style.color = 'var(--accent-green)';
        statusBadge.style.borderColor = 'var(--accent-green)';
      }
      if (hiddenInput) hiddenInput.value = dataUrl;

      this.showToast(`Foto "${file.name}" terpilih. Siap diupload ke Supabase Storage.`, 'info');
    };
    reader.readAsDataURL(file);
  }

  clearProductFileSelected(mode = 'new') {
    const fileInput = document.getElementById(`${mode}-prod-file`);
    const previewContainer = document.getElementById(`${mode}-prod-preview-container`);
    const previewImg = document.getElementById(`${mode}-prod-preview-img`);
    const hiddenInput = document.getElementById(`${mode}-prod-img`);

    if (fileInput) fileInput.value = '';

    if (mode === 'new') {
      this.newProductFile = null;
      if (hiddenInput) hiddenInput.value = '';
      if (previewImg) previewImg.src = '';
      if (previewContainer) previewContainer.style.display = 'none';
      this.showToast('Foto produk dibatalkan.', 'info');
    } else {
      this.editProductFile = null;
      const prodId = document.getElementById('edit-prod-id').value;
      const prod = prodId ? DB.getProductById(prodId) : null;
      if (prod && prod.gambar_url) {
        if (hiddenInput) hiddenInput.value = prod.gambar_url;
        if (previewImg) previewImg.src = prod.gambar_url;
        const fileNameEl = document.getElementById('edit-prod-file-name');
        const fileSizeEl = document.getElementById('edit-prod-file-size');
        const statusBadge = document.getElementById('edit-prod-status-badge');
        if (fileNameEl) fileNameEl.textContent = `Aset Visual: ${prod.nama_produk}`;
        if (fileSizeEl) fileSizeEl.textContent = 'Supabase CDN / Web Asset';
        if (statusBadge) {
          statusBadge.textContent = 'TERPASANG';
          statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
          statusBadge.style.color = 'var(--accent-green)';
          statusBadge.style.borderColor = 'var(--accent-green)';
        }
        this.showToast('Foto dikembalikan ke aset awal.', 'info');
      }
    }
  }

  async handleAddNewProduct(event) {
    event.preventDefault();

    const imgHidden = document.getElementById('new-prod-img');
    if (!this.newProductFile && (!imgHidden || !imgHidden.value)) {
      this.showToast('Pilih file foto produk asli terlebih dahulu (klik tombol Pilih Foto).', 'warning');
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="confirm-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 6px;"></div>
        Mengunggah ke Supabase Storage...
      `;
    }

    try {
      let finalImageUrl = imgHidden ? imgHidden.value : '';

      // Upload file asli ke Supabase Storage Bucket ('product-images')
      if (this.newProductFile) {
        this.showToast('Mengunggah foto produk ke Supabase Storage Bucket...', 'info');
        finalImageUrl = await DB.uploadProductImage(this.newProductFile);
      }

      const productData = {
        nama_produk: document.getElementById('new-prod-name').value.trim(),
        kategori: document.getElementById('new-prod-cat').value,
        harga: Number(document.getElementById('new-prod-price').value),
        deskripsi: document.getElementById('new-prod-desc').value.trim(),
        gambar_url: finalImageUrl
      };

      const sizesData = [
        { ukuran: 'S', stok: document.getElementById('new-stock-s').value },
        { ukuran: 'M', stok: document.getElementById('new-stock-m').value },
        { ukuran: 'L', stok: document.getElementById('new-stock-l').value },
        { ukuran: 'XL', stok: document.getElementById('new-stock-xl').value }
      ];

      const newProd = DB.addProduct(productData, sizesData);
      this.newProductFile = null;
      this.closeModal('add-product-modal');
      this.refreshAdminData();
      this.renderCatalog();
      this.showToast(`Drop "${newProd.nama_produk}" resmi dirilis dengan foto Supabase Storage!`, 'success');
    } catch (err) {
      console.error('[FOZZ App] Error saat menambah produk:', err);
      this.showToast('Terjadi kesalahan saat memproses rilis drop.', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  }

  // --- ADMIN: EDIT & ARCHIVE PRODUCT CONTROLLERS ---
  openEditProductModal(productId) {
    const prod = DB.getProductById(productId);
    if (!prod) {
      this.showToast('Produk tidak ditemukan.', 'error');
      return;
    }

    this.editProductFile = null;
    const fileInput = document.getElementById('edit-prod-file');
    if (fileInput) fileInput.value = '';

    const idInput = document.getElementById('edit-prod-id');
    const idLabel = document.getElementById('edit-prod-id-label');
    const nameInput = document.getElementById('edit-prod-name');
    const catInput = document.getElementById('edit-prod-cat');
    const priceInput = document.getElementById('edit-prod-price');
    const statusInput = document.getElementById('edit-prod-status');
    const descInput = document.getElementById('edit-prod-desc');
    const imgInput = document.getElementById('edit-prod-img');
    const previewImg = document.getElementById('edit-prod-preview-img');
    const previewContainer = document.getElementById('edit-prod-preview-container');
    const fileNameEl = document.getElementById('edit-prod-file-name');
    const fileSizeEl = document.getElementById('edit-prod-file-size');
    const statusBadge = document.getElementById('edit-prod-status-badge');
    const sizesGrid = document.getElementById('edit-prod-sizes-grid');

    if (idInput) idInput.value = prod.id;
    if (idLabel) idLabel.textContent = prod.id;
    if (nameInput) nameInput.value = prod.nama_produk || '';
    if (catInput) catInput.value = prod.kategori || 'Outerwear';
    if (priceInput) priceInput.value = prod.harga || 0;
    if (statusInput) statusInput.value = prod.status || 'active';
    if (descInput) descInput.value = prod.deskripsi || '';
    if (imgInput) imgInput.value = prod.gambar_url || '';
    if (previewImg) previewImg.src = prod.gambar_url || '';
    if (previewContainer) previewContainer.style.display = prod.gambar_url ? 'flex' : 'none';
    if (fileNameEl) fileNameEl.textContent = `Aset Visual: ${prod.nama_produk}`;
    if (fileSizeEl) fileSizeEl.textContent = 'Supabase CDN / Web Asset';
    if (statusBadge) {
      statusBadge.textContent = 'TERPASANG';
      statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      statusBadge.style.color = 'var(--accent-green)';
      statusBadge.style.borderColor = 'var(--accent-green)';
    }

    if (sizesGrid) {
      const allSizes = DB.getProductSizes().filter(s => s.product_id === prod.id);
      const standardSizes = ['S', 'M', 'L', 'XL'];
      
      sizesGrid.innerHTML = standardSizes.map(sz => {
        const found = allSizes.find(s => s.ukuran && s.ukuran.toUpperCase() === sz);
        const currentStock = found ? found.stok : 0;
        return `
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: 700;">Size ${sz}</span>
            <input type="number" id="edit-stock-${sz.toLowerCase()}" data-size="${sz}" value="${currentStock}" min="0" style="width: 100%;">
          </div>
        `;
      }).join('');
    }

    this.openModal('edit-product-modal');
  }

  handleEditProductUrlInput(val) {
    this.handleProductUrlInput(val);
  }

  handleEditProductImageUpload(event) {
    this.handleProductFileSelected(event, 'edit');
  }

  async handleEditProductSubmit(event) {
    event.preventDefault();
    const prodId = document.getElementById('edit-prod-id').value;
    if (!prodId) return;

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="confirm-spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 6px;"></div>
        Menyimpan ke Supabase Storage...
      `;
    }

    try {
      let finalImageUrl = document.getElementById('edit-prod-img').value.trim();

      // Jika admin memilih file foto baru dari perangkat
      if (this.editProductFile) {
        this.showToast('Mengunggah foto baru ke Supabase Storage Bucket...', 'info');
        finalImageUrl = await DB.uploadProductImage(this.editProductFile);
      }

      const productData = {
        nama_produk: document.getElementById('edit-prod-name').value.trim(),
        kategori: document.getElementById('edit-prod-cat').value,
        harga: Number(document.getElementById('edit-prod-price').value),
        status: document.getElementById('edit-prod-status').value,
        deskripsi: document.getElementById('edit-prod-desc').value.trim(),
        gambar_url: finalImageUrl
      };

      const standardSizes = ['s', 'm', 'l', 'xl'];
      const sizesData = standardSizes.map(sz => {
        const el = document.getElementById(`edit-stock-${sz}`);
        return {
          ukuran: sz.toUpperCase(),
          stok: el ? Math.max(0, parseInt(el.value, 10) || 0) : 0
        };
      });

      const updated = DB.updateProduct(prodId, productData, sizesData);
      this.editProductFile = null;
      if (updated) {
        this.closeModal('edit-product-modal');
        this.refreshAdminData();
        this.renderCatalog();
        this.showToast(`Drop "${updated.nama_produk}" berhasil diperbarui dengan foto Supabase!`, 'success');
      } else {
        this.showToast('Gagal memperbarui drop.', 'error');
      }
    } catch (err) {
      console.error('[FOZZ App] Error edit produk:', err);
      this.showToast('Gagal memperbarui drop produk.', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  }

  adminToggleArchiveProduct(productId) {
    const prod = DB.getProductById(productId);
    if (!prod) return;

    const isCurrentlyArchived = prod.status === 'archived';
    const actionName = isCurrentlyArchived ? 'mengaktifkan kembali' : 'mengarsipkan (menonaktifkan)';
    const confirmMsg = `Yakin ingin ${actionName} drop "${prod.nama_produk}"?\n\n${
      isCurrentlyArchived 
        ? 'Produk akan kembali muncul di etalase katalog belanja publik.' 
        : 'Produk akan disembunyikan dari katalog belanja publik tetapi data riwayat order tetap aman.'
    }`;

    if (!confirm(confirmMsg)) return;

    const res = DB.toggleArchiveProduct(productId);
    if (res) {
      this.refreshAdminData();
      this.renderCatalog();
      const statusText = res.isArchived ? 'telah diarsipkan dari katalog' : 'telah diaktifkan kembali ke katalog';
      this.showToast(`Drop "${prod.nama_produk}" ${statusText}.`, 'success');
    }
  }

  adminDeleteProduct(productId) {
    const prod = DB.getProductById(productId);
    if (!prod) return;

    const confirmMsg = `PERINGATAN: Yakin ingin menghapus drop "${prod.nama_produk}" (${productId})?\n\nJika produk sudah memiliki riwayat transaksi order, sistem akan otomatis mengalihkannya ke status Arsip demi integritas data relasional.`;

    if (!confirm(confirmMsg)) return;

    const res = DB.deleteProduct(productId);
    if (res.hasOrders) {
      this.refreshAdminData();
      this.renderCatalog();
      this.showToast(`Drop "${prod.nama_produk}" dialihkan ke ARSIP karena memiliki riwayat pesanan.`, 'info');
    } else if (res.success) {
      this.refreshAdminData();
      this.renderCatalog();
      this.showToast(`Drop "${prod.nama_produk}" telah dihapus permanen.`, 'success');
    } else {
      this.showToast('Gagal memproses penghapusan drop.', 'error');
    }
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
          <span class="status-pill status-paid">ACTIVE</span>
        </td>
      </tr>
    `).join('');
  }

  // --- MODAL UTILITIES ---
  openModal(modalId) {
    this.toggleMobileMenu(false);
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

  openSchemaModal() {
    this.showToast('Dokumentasi skema database SQL tersimpan di file supabase_schema.sql.', 'info');
  }

  openSizeGuideModal() {
    this.openModal('size-guide-modal');
  }

  navigateTo(section, params = {}) {
    this.toggleMobileMenu(false);
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

    const allUserOrders = user ? DB.getOrders().filter(o => o.user_id === user.id) : [];

    // Batasi pilihan retur hanya untuk pesanan berstatus Delivered (atau minimal Shipped)
    const eligibleOrders = allUserOrders.filter(o => {
      const st = (o.status_pesanan || '').trim().toLowerCase();
      return st === 'delivered' || st === 'shipped';
    });

    if (eligibleOrders.length === 0) {
      orderSelect.innerHTML = `
        <option value="">-- Tidak ada pesanan memenuhi syarat (Wajib Shipped/Delivered) --</option>
      `;
      const prodSelect = document.getElementById('return-product-select');
      if (prodSelect) {
        prodSelect.innerHTML = `<option value="">Belum ada pesanan yang sudah dikirim/diterima</option>`;
      }
      this.renderMyReturnsList();
      return;
    }

    orderSelect.innerHTML = `
      <option value="">-- Pilih Nomor Pesanan --</option>
      ${eligibleOrders.map(o => {
        const dateStr = new Date(o.created_at).toLocaleDateString('id-ID');
        const isDelivered = (o.status_pesanan || '').toLowerCase() === 'delivered';
        const badge = isDelivered ? '✓ Diterima (Delivered)' : '🚚 Sedang Dikirim (Shipped)';
        return `<option value="${o.id}" ${o.id === preselectedOrderId ? 'selected' : ''}>#${o.id} &bull; [${badge}] &bull; ${this.formatRupiah(o.total_harga)} (${dateStr})</option>`;
      }).join('')}
    `;

    const hasPreselected = eligibleOrders.some(o => o.id === preselectedOrderId);
    if (preselectedOrderId && hasPreselected) {
      orderSelect.value = preselectedOrderId;
      this.handleReturnOrderSelect(preselectedOrderId);
    } else {
      orderSelect.value = eligibleOrders[0].id;
      this.handleReturnOrderSelect(eligibleOrders[0].id);
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

  handleReturnPhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    const previewContainer = document.getElementById('return-photo-preview-container');
    const previewImg = document.getElementById('return-photo-preview-img');
    const nameEl = document.getElementById('return-photo-name');
    const sizeEl = document.getElementById('return-photo-size');
    const hiddenUrlInput = document.getElementById('return-photo-url');

    if (!file) {
      if (previewContainer) previewContainer.style.display = 'none';
      if (hiddenUrlInput) hiddenUrlInput.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showToast('File harus berupa gambar (JPG, PNG, WEBP).', 'info');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Ukuran gambar maksimal 5MB.', 'info');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      if (previewImg) previewImg.src = result;
      if (hiddenUrlInput) hiddenUrlInput.value = result;
      if (nameEl) nameEl.textContent = file.name;
      if (sizeEl) sizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      if (previewContainer) previewContainer.style.display = 'block';
      this.showToast('Preview gambar lokal berhasil dimuat.', 'success');
    };
    reader.readAsDataURL(file);
  }

  removeReturnPhoto() {
    const fileInput = document.getElementById('return-photo-file');
    const previewContainer = document.getElementById('return-photo-preview-container');
    const previewImg = document.getElementById('return-photo-preview-img');
    const hiddenUrlInput = document.getElementById('return-photo-url');

    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.src = '';
    if (hiddenUrlInput) hiddenUrlInput.value = '';
    if (previewContainer) previewContainer.style.display = 'none';
    this.showToast('Foto bukti telah dihapus.', 'info');
  }

  handleProductImageUpload(event) {
    this.handleProductFileSelected(event, 'new');
  }

  handleProductUrlInput(val) {
    const previewContainer = document.getElementById('new-prod-preview-container');
    const previewImg = document.getElementById('new-prod-preview-img');
    if (val && val.trim().startsWith('http')) {
      if (previewImg) previewImg.src = val.trim();
      if (previewContainer) previewContainer.style.display = 'flex';
    } else if (previewContainer) {
      previewContainer.style.display = 'none';
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

    if (orderId) {
      const orderRecord = DB.getOrders().find(o => o.id === orderId);
      if (orderRecord) {
        const st = (orderRecord.status_pesanan || '').toLowerCase();
        if (st !== 'delivered' && st !== 'shipped') {
          this.showToast('Hanya pesanan berstatus Delivered atau minimal Shipped yang dapat diajukan retur.', 'info');
          return;
        }
      }
    }
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
    const retFile = document.getElementById('return-photo-file');
    if (retFile) retFile.value = '';
    const retPreview = document.getElementById('return-photo-preview-container');
    if (retPreview) retPreview.style.display = 'none';
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
    const returns = user ? DB.getReturnsByUserId(user.id) : [];

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
            ${item.photo_url ? `
              <div style="margin-top: 0.6rem; display: flex; align-items: center; gap: 0.6rem;">
                <img src="${item.photo_url}" alt="Foto Bukti" style="width: 52px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); border: 1.5px solid var(--border-color); cursor: pointer;" onclick="window.open('${item.photo_url}', '_blank')" title="Klik untuk perbesar foto bukti">
                <span style="font-size: 0.72rem; color: var(--text-muted);">Foto bukti fisik terlampir</span>
              </div>
            ` : ''}
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
    const order = DB.getOrders().find(o => o.id === orderId);
    if (order) {
      const st = (order.status_pesanan || '').trim().toLowerCase();
      if (st !== 'delivered' && st !== 'shipped') {
        this.showToast(`Pesanan #${orderId} belum dapat diretur karena status masih "${order.status_pesanan}". Syarat retur: paket minimal sudah Shipped atau Delivered.`, 'info');
        return;
      }
    }
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

