/* ============================================================
   KHAYRAT MAZOUZ — script.js
   الوظائف التفاعلية: السلة، الطلبات، التحميل الديناميكي
   ============================================================ */

// ── PRODUCTS DATA ─────────────────────────────────────────────
const products = [{
    id: 1,
    name: 'أملو تمازيرت',
    category: 'عسل طبيعي',
    price: 450,
    oldPrice: 600,
    image: 'A22.jpg',
 description: 'أملو مغربي أصيل من أركان سوس',
    badge: ' 700 غرام'
}, {
    id: 2,
    name: 'أملو تمازيرت',
    category: 'منتجات محلية',
    price: 250,
    oldPrice: null,
    image: 'A2.png',
    description: 'أملو مغربي أصيل من أركان سوس',
    badge: ' 500 غرام'
}, {
    id: 3,
    name: '  Goumage aker fassi ',
    category: ' طبيعية',
    price: 95,
    oldPrice: 130,
    image: 'F1.jpg',
    
    badge: 'خصم'

}];

// ── STATE ─────────────────────────────────────────────────────
let cart = [];
let currentProduct = null;
let modalQty = 1;

// ── DOM REFS ──────────────────────────────────────────────────
const grid = document.getElementById('featuredGrid');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartFoot = document.getElementById('cartFoot');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const checkoutBtn = document.getElementById('checkoutBtn');
const modalOverlay = document.getElementById('modalOverlay');
const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');
const modalProductName = document.getElementById('modalProductName');
const qtyVal = document.getElementById('qtyVal');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const sendOrder = document.getElementById('sendOrder');
const toast = document.getElementById('toast');
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');

// ── RENDER PRODUCTS ───────────────────────────────────────────
function renderProducts() {
    grid.innerHTML = products.map(p => `
        <div class="product-card" data-id="${p.id}">
            <div class="product-card__img">
                <img src="${p.image}" alt="${p.name}" loading="lazy"/>
                ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-card__body">
                <div class="product-card__cat">${p.category}</div>
                <div class="product-card__name">${p.name}</div>
                <div class="product-card__desc">${p.description}</div>
                <div class="product-card__price">
                    <span class="price-curr">${p.price} درهم</span>
                    ${p.oldPrice ? `<span class="price-old">${p.oldPrice} درهم</span>` : ''}
                    ${p.oldPrice ? `<span class="price-save">-${Math.round((1 - p.price/p.oldPrice)*100)}%</span>` : ''}
                </div>
                <div class="product-card__actions">
                    <button class="btn-buy" data-id="${p.id}">🛒 اشترِ الآن</button>
                    <button class="btn-cart" data-id="${p.id}">+</button>
                </div>
            </div>
        </div>
    `).join('');

    // Event listeners
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            openModal(id);
        });
    });

    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addToCart(id);
        });
    });
}

// ── CART FUNCTIONS ────────────────────────────────────────────
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCart();
    showToast('✅ تم إضافة ' + product.name + ' إلى السلة');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(id);
        return;
    }
    updateCart();
}

function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCart() {
    // Update badge
    const totalItems = getTotalItems();
    cartBadge.textContent = totalItems;

    // Update drawer
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">سلتك فارغة 🛒</div>';
        cartFoot.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item__img" src="${item.image}" alt="${item.name}"/>
                <div class="cart-item__info">
                    <div class="cart-item__name">${item.name}</div>
                    <div class="cart-item__price">${item.price} درهم</div>
                    <div class="cart-item__qty">
                        <button onclick="updateQty(${item.id}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item__del" onclick="removeFromCart(${item.id})">✕</button>
            </div>
        `).join('');
        cartFoot.style.display = 'block';
        cartTotal.textContent = getTotal();
    }
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    currentProduct = product;
    modalProductName.textContent = `${product.name} — ${product.price} درهم`;
    modalQty = 1;
    qtyVal.textContent = modalQty;
    modalOverlay.classList.add('open');
    orderModal.classList.add('open');
}

function closeModal() {
    modalOverlay.classList.remove('open');
    orderModal.classList.remove('open');
}

// ── SEND ORDER (WhatsApp) ─────────────────────────────────────
function sendOrderWhatsApp() {
    const name = document.getElementById('clientName').value.trim();
    const city = document.getElementById('clientCity').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const qty = parseInt(qtyVal.textContent);

    if (!name || !city || !address || !phone) {
        showToast('⚠️ الرجاء ملء جميع الحقول');
        return;
    }

    if (!currentProduct) return;

    const msg = `🛍️ *طلب جديد من خيرات مزوز*%0A%0A` +
        `👤 الاسم: ${name}%0A` +
        `📍 المدينة: ${city}%0A` +
        `🏠 العنوان: ${address}%0A` +
        `📱 الهاتف: ${phone}%0A%0A` +
        `📦 *المنتج:* ${currentProduct.name}%0A` +
        `🔢 الكمية: ${qty}%0A` +
        `💰 السعر: ${currentProduct.price * qty} درهم`;

    const url = `https://wa.me/212606002012?text=${msg}`;
    window.open(url, '_blank');

    closeModal();
    showToast('✅ تم إرسال طلبك بنجاح! سنتواصل معك قريبًا');
    // Reset form
    document.querySelectorAll('.modal__form input').forEach(inp => inp.value = '');
}

// ── EVENT LISTENERS ───────────────────────────────────────────

// Cart
cartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
});

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

closeCart.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

// Modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Qty controls
qtyMinus.addEventListener('click', () => {
    if (modalQty > 1) {
        modalQty--;
        qtyVal.textContent = modalQty;
    }
});
qtyPlus.addEventListener('click', () => {
    modalQty++;
    qtyVal.textContent = modalQty;
});

// Send order
sendOrder.addEventListener('click', sendOrderWhatsApp);

// Checkout from cart
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('⚠️ السلة فارغة');
        return;
    }
    closeCartDrawer();
    // Open modal with first product in cart
    const first = cart[0];
    const product = products.find(p => p.id === first.id);
    if (product) {
        // Set quantity to the cart quantity
        modalQty = first.qty;
        qtyVal.textContent = modalQty;
        // Pre-fill modal with product
        openModal(product.id);
        // Override quantity from cart
        // Actually let's keep it simple: just open modal for the product
    }
});

// Burger
burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileNav.classList.toggle('open');
});

// Close mobile nav on link click
mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileNav.classList.remove('open');
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ── INIT ──────────────────────────────────────────────────────
renderProducts();
updateCart();

// ── REVEAL ANIMATIONS ────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: .1 });

revealEls.forEach(el => observer.observe(el));
