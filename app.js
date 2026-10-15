document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '5210000000000';
  let cart = [];
  let favorites = new Set();
  let onlyFavorites = false;
  let searchQuery = '';
  let activeFilters = {
    category: 'todos',
    brand: 'todas',
    size: 'todas'
  };
  let currentModalProduct = null;
  let selectedModalSize = '';

  const productCards = Array.from(document.querySelectorAll('.product-card'));
  const categoryContainer = document.getElementById('filter-category');
  const brandContainer = document.getElementById('filter-brand');
  const sizeContainer = document.getElementById('filter-size');
  const productCounter = document.getElementById('product-counter');
  const emptyState = document.getElementById('empty-state');
  const resetFiltersBtn = document.getElementById('reset-filters');
  const favFilterBtn = document.getElementById('fav-filter-btn');
  const favCountBadge = document.getElementById('fav-count');

  const formatMXN = (amount) =>
    `$ ${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;

  const formatShortMXN = (amount) =>
    `$${Number(amount).toLocaleString('es-MX')} MXN`;

  productCards.forEach((card) => {
    const colorsRaw = card.dataset.color || '';
    const swatchContainer = card.querySelector('.card-swatches');
    if (swatchContainer && colorsRaw) {
      colorsRaw.split(',').forEach((entry) => {
        const [name, hex] = entry.split(':');
        const dot = document.createElement('span');
        dot.className = 'swatch-dot';
        dot.title = name ? name.trim() : '';
        dot.style.backgroundColor = hex ? hex.trim() : '#111';
        swatchContainer.appendChild(dot);
      });
    }

    const favBtn = card.querySelector('.fav-btn');
    const id = card.dataset.id;
    favBtn.addEventListener('click', () => {
      if (favorites.has(id)) {
        favorites.delete(id);
        favBtn.classList.remove('active');
      } else {
        favorites.add(id);
        favBtn.classList.add('active');
      }
      favCountBadge.textContent = favorites.size;
      favCountBadge.hidden = favorites.size === 0;
      if (onlyFavorites && favorites.size === 0) {
        onlyFavorites = false;
      }
      applyFilters();
    });
  });

  favFilterBtn.addEventListener('click', () => {
    if (favorites.size === 0) {
      document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    onlyFavorites = !onlyFavorites;
    applyFilters();
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
  });

  const searchToggle = document.getElementById('search-toggle');
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  searchToggle.addEventListener('click', () => {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) {
      searchInput.focus();
      document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
    }
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchBar.hidden = true;
    applyFilters();
  });

  const buildDynamicFilters = () => {
    const categories = ['todos', 'hombre', 'mujer', 'accesorios'];
    const brands = new Set(['todas']);
    const sizes = new Set(['todas']);

    productCards.forEach((card) => {
      if (card.dataset.brand) brands.add(card.dataset.brand.trim());
      if (card.dataset.size) {
        card.dataset.size.split(',').forEach((s) => sizes.add(s.trim()));
      }
    });

    const renderChips = (items, container, filterKey) => {
      container.innerHTML = '';
      items.forEach((val) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `chip ${activeFilters[filterKey] === val.toLowerCase() ? 'active' : ''}`;
        btn.textContent = val.toUpperCase();
        btn.addEventListener('click', () => {
          onlyFavorites = false;
          activeFilters[filterKey] = val.toLowerCase();
          buildDynamicFilters();
          applyFilters();
        });
        container.appendChild(btn);
      });
    };

    renderChips(categories, categoryContainer, 'category');
    renderChips(Array.from(brands), brandContainer, 'brand');
    renderChips(Array.from(sizes), sizeContainer, 'size');
  };

  const applyFilters = () => {
    let visibleCount = 0;
    productCards.forEach((card) => {
      const id = card.dataset.id;
      const cat = (card.dataset.category || '').toLowerCase();
      const brand = (card.dataset.brand || '').toLowerCase();
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      const sizes = (card.dataset.size || '').toLowerCase().split(',').map((s) => s.trim());

      const matchCat = activeFilters.category === 'todos' || cat === activeFilters.category;
      const matchBrand = activeFilters.brand === 'todas' || brand === activeFilters.brand;
      const matchSize = activeFilters.size === 'todas' || sizes.includes(activeFilters.size);
      const matchFav = !onlyFavorites || favorites.has(id);
      const matchSearch = !searchQuery || title.includes(searchQuery) || brand.includes(searchQuery);

      if (matchCat && matchBrand && matchSize && matchFav && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    productCounter.textContent = `${String(visibleCount).padStart(2, '0')} PIEZA${visibleCount === 1 ? '' : 'S'}`;
    emptyState.hidden = visibleCount > 0;
  };

  resetFiltersBtn.addEventListener('click', () => {
    activeFilters = { category: 'todos', brand: 'todas', size: 'todas' };
    onlyFavorites = false;
    searchQuery = '';
    searchInput.value = '';
    buildDynamicFilters();
    applyFilters();
  });

  buildDynamicFilters();
  applyFilters();

  const menuToggle = document.getElementById('menu-toggle');
  const closeMenu = document.getElementById('close-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');

  const toggleMobileMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    mobileOverlay.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  };

  menuToggle.addEventListener('click', () => toggleMobileMenu(true));
  closeMenu.addEventListener('click', () => toggleMobileMenu(false));
  mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));

  document.querySelectorAll('[data-filter-nav], [data-split-filter]').forEach((link) => {
    link.addEventListener('click', () => {
      const targetCat = link.dataset.filterNav || link.dataset.splitFilter;
      if (targetCat) {
        onlyFavorites = false;
        activeFilters.category = targetCat.toLowerCase();
        buildDynamicFilters();
        applyFilters();
      }
      toggleMobileMenu(false);
    });
  });

  const productModal = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalBrand = document.getElementById('modal-brand');
  const modalTitle = document.getElementById('modal-title');
  const modalPrice = document.getElementById('modal-price');
  const modalSizes = document.getElementById('modal-sizes');
  const addToBagBtn = document.getElementById('add-to-bag-btn');

  productCards.forEach((card) => {
    const btn = card.querySelector('.btn-quickview');
    btn.addEventListener('click', () => {
      const name = card.querySelector('.card-title').textContent;
      const brand = card.dataset.brand;
      const price = Number(card.dataset.price);
      const image = card.querySelector('img').src;
      const sizes = (card.dataset.size || 'UNITALLA').split(',').map((s) => s.trim());

      currentModalProduct = { name, brand, price, image };
      selectedModalSize = sizes[0];

      modalImg.src = image;
      modalImg.alt = name;
      modalBrand.textContent = brand.toUpperCase();
      modalTitle.textContent = name;
      modalPrice.textContent = formatMXN(price);

      modalSizes.innerHTML = '';
      sizes.forEach((size) => {
        const sBtn = document.createElement('button');
        sBtn.type = 'button';
        sBtn.className = `size-option ${size === selectedModalSize ? 'active' : ''}`;
        sBtn.textContent = size;
        sBtn.addEventListener('click', () => {
          selectedModalSize = size;
          modalSizes.querySelectorAll('.size-option').forEach((el) => el.classList.remove('active'));
          sBtn.classList.add('active');
        });
        modalSizes.appendChild(sBtn);
      });

      productModal.showModal();
    });
  });

  modalClose.addEventListener('click', () => productModal.close());
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.close();
  });

  const bagButton = document.getElementById('bag-button');
  const bagCount = document.getElementById('bag-count');
  const cartQuantity = document.getElementById('cart-quantity');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout');

  const toggleCart = (open) => {
    cartDrawer.classList.toggle('open', open);
    cartOverlay.classList.toggle('open', open);
    cartDrawer.setAttribute('aria-hidden', String(!open));
    bagButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('locked', open);
  };

  bagButton.addEventListener('click', () => toggleCart(true));
  cartClose.addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));

  const renderCart = () => {
    bagCount.textContent = cart.length;
    cartQuantity.textContent = `${cart.length} ${cart.length === 1 ? 'PIEZA' : 'PIEZAS'}`;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty">TU BOLSA ESTÁ VACÍA</div>';
      cartTotalEl.textContent = '$ 0.00 MXN';
      return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
      subtotal += item.price;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">TALLA: ${item.size}</div>
          <div class="cart-item-price">${formatMXN(item.price)}</div>
        </div>
        <button class="cart-remove" type="button" aria-label="Eliminar">×</button>
      `;
      row.querySelector('.cart-remove').addEventListener('click', () => {
        cart.splice(index, 1);
        renderCart();
      });
      cartItemsContainer.appendChild(row);
    });

    cartTotalEl.textContent = formatMXN(subtotal);
  };

  addToBagBtn.addEventListener('click', () => {
    if (!currentModalProduct) return;
    cart.push({
      name: currentModalProduct.name,
      size: selectedModalSize,
      price: currentModalProduct.price,
      image: currentModalProduct.image
    });
    renderCart();
    productModal.close();
    toggleCart(true);
  });

  whatsappCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    const lines = cart.map((item) => `1x ${item.name} (Talla ${item.size}) — ${formatShortMXN(item.price)}`);
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    const message =
      `Hola Silver Beast, quiero ordenar las siguientes piezas:\n` +
      lines.join('\n\n') +
      `\n\nTotal: ${formatShortMXN(total)}\n¿Tienen disponibilidad para envío?`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  renderCart();

  const reviewsCarousel = document.getElementById('reviews-carousel');
  const reviewsPrev = document.getElementById('reviews-prev');
  const reviewsNext = document.getElementById('reviews-next');

  reviewsPrev.addEventListener('click', () => {
    reviewsCarousel.scrollBy({ left: -340, behavior: 'smooth' });
  });

  reviewsNext.addEventListener('click', () => {
    reviewsCarousel.scrollBy({ left: 340, behavior: 'smooth' });
  });

  const evidenceModal = document.getElementById('evidence-modal');
  const evidenceClose = document.getElementById('evidence-close');
  const evidenceCustomer = document.getElementById('evidence-customer');
  const evidenceGallery = document.getElementById('evidence-gallery');

  document.querySelectorAll('.review-card').forEach((card) => {
    const trigger = card.querySelector('.review-photo-wrapper');
    trigger.addEventListener('click', () => {
      const customer = card.dataset.customer || 'Cliente Verificado';
      const rawEvidence = (card.dataset.evidence || '').replace(/[\[\]]/g, '');
      const urls = rawEvidence.split(',').map((u) => u.trim()).filter(Boolean);

      evidenceCustomer.textContent = customer.toUpperCase();
      evidenceGallery.innerHTML = '';

      urls.forEach((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Evidencia de ${customer}`;
        img.loading = 'lazy';
        evidenceGallery.appendChild(img);
      });

      evidenceModal.showModal();
    });
  });

  evidenceClose.addEventListener('click', () => evidenceModal.close());
  evidenceModal.addEventListener('click', (e) => {
    if (e.target === evidenceModal) evidenceModal.close();
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
});