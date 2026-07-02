/* =============================================
   SUPABASE CONFIG
   ============================================= */
const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

const sbFetch = (path) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
    }
}).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

/* =============================================
   STATE
   ============================================= */
let allFoods = [];
let allChefs = [];
let cart = [];
let activeTab = 'taomlar'; // 'taomlar' | 'oshpazlar'

/* =============================================
   DOM REFS
   ============================================= */
const productsGrid    = document.getElementById('productsGrid');
const resultsCount    = document.getElementById('resultsCount');
const sortSelect      = document.getElementById('sortSelect');
const priceSlider     = document.getElementById('priceSlider');
const priceLabel      = document.getElementById('priceLabel');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const cartModal       = document.getElementById('cartModal');
const cartToggleBtn   = document.getElementById('cartToggleBtn');
const closeCartBtn    = document.getElementById('closeCartBtn');
const cartItemsList   = document.getElementById('cartItemsList');
const cartBadgeCount  = document.getElementById('cartBadgeCount');
const cartTotalSum    = document.getElementById('cartTotalSum');
const subTabs         = document.querySelectorAll('.sub-tab');
const distBtns        = document.querySelectorAll('.dist-btn');

/* =============================================
   SUPABASE LOAD
   ============================================= */
async function loadFoods() {
    const data = await sbFetch('foods?select=*&order=created_at.desc');
    allFoods = data;
}

async function loadChefs() {
    if (allChefs.length) return; // bir marta yukla
    const data = await sbFetch('chefs?select=*&order=created_at.desc');
    allChefs = data;
}

/* =============================================
   RENDER — TAOMLAR
   ============================================= */
function renderFoods(foods) {
    productsGrid.innerHTML = '';

    if (!foods.length) {
        productsGrid.innerHTML = '<div class="state-msg">Hech qanday taom topilmadi 😕</div>';
        resultsCount.textContent = '0 ta natija';
        return;
    }

    resultsCount.textContent = `${foods.length} ta taom topildi`;

    foods.forEach(food => {
        const price = Number(food.price).toLocaleString('uz-UZ');
        const rating = food.rating ?? 5.0;

        const imgEl = food.image_url
            ? `<img src="${food.image_url}" alt="${food.name}" loading="lazy">`
            : `<div class="card-image-placeholder">🍽️</div>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id       = food.id;
        card.dataset.price    = food.price;
        card.dataset.category = food.category || '';
        card.dataset.rating   = food.rating || 5;

        card.innerHTML = `
            <div class="card-image-box">
                ${imgEl}
                ${food.portions_left <= 5 ? '<span class="badge tag-yangi">Kam qoldi</span>' : ''}
                <button class="like-btn">🤍</button>
            </div>
            <div class="card-body">
                <div class="card-title-row">
                    <h3 class="dish-name-el">${food.name}</h3>
                    <span class="card-rating">★ ${rating}</span>
                </div>
                <p class="card-desc">${food.chef_name ? `👨‍🍳 ${food.chef_name}` : ''} ${food.category ? `• ${food.category}` : ''}</p>
                <div class="card-footer">
                    <div>
                        <span class="card-price">${price} so'm</span>
                        <span class="card-meta">${food.portions_left} porsiya qoldi</span>
                    </div>
                    <button class="btn-add-cart">Savatga</button>
                </div>
            </div>`;

        productsGrid.appendChild(card);
    });

    attachCardListeners();
}

/* =============================================
   RENDER — OSHPAZLAR
   ============================================= */
function renderChefs(chefs) {
    productsGrid.innerHTML = '';

    if (!chefs.length) {
        productsGrid.innerHTML = '<div class="state-msg">Hech qanday oshpaz topilmadi 😕</div>';
        resultsCount.textContent = '0 ta natija';
        return;
    }

    resultsCount.textContent = `${chefs.length} ta oshpaz topildi`;

    chefs.forEach(chef => {
        const rating = chef.rating ?? 5.0;

        const avatarEl = chef.avatar_url
            ? `<img class="chef-avatar" src="${chef.avatar_url}" alt="${chef.full_name}" loading="lazy">`
            : `<div class="chef-avatar-placeholder">👨‍🍳</div>`;

        const card = document.createElement('div');
        card.className = 'chef-card';
        card.dataset.rating = rating;

        card.innerHTML = `
            ${avatarEl}
            <div class="chef-info">
                <div class="chef-name">
                    ${chef.full_name}
                    ${chef.is_verified ? ' ✅' : ''}
                </div>
                <div class="chef-spec">${chef.speciality || 'Oshpaz'}</div>
                <div class="chef-rating">
                    <span class="star">★</span> ${rating}
                </div>
            </div>
            <button class="like-btn" style="position:static; background:#F5F0EF;">🤍</button>`;

        productsGrid.appendChild(card);
    });

    // Like tugmalari
    productsGrid.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            btn.textContent = btn.textContent === '🤍' ? '❤️' : '🤍';
        });
    });
}

/* =============================================
   FILTER & SORT LOGIC
   ============================================= */
function getFilteredFoods() {
    const checkedCats = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(c => c.value);
    const maxPrice = parseInt(priceSlider.value);
    const sortVal = sortSelect.value;

    let result = [...allFoods];

    if (checkedCats.length) {
        result = result.filter(f => !f.category || checkedCats.includes(f.category));
    }
    result = result.filter(f => Number(f.price) <= maxPrice);

    if (sortVal === 'arzon') result.sort((a, b) => a.price - b.price);
    else if (sortVal === 'qimmat') result.sort((a, b) => b.price - a.price);
    else if (sortVal === 'reyting') result.sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));

    return result;
}

function getFilteredChefs() {
    const sortVal = sortSelect.value;
    let result = [...allChefs];
    if (sortVal === 'reyting') result.sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));
    return result;
}

/* =============================================
   TAB SWITCH
   ============================================= */
async function switchTab(type) {
    activeTab = type;
    productsGrid.innerHTML = skeletons();

    try {
        if (type === 'taomlar') {
            await loadFoods();
            renderFoods(getFilteredFoods());
        } else {
            await loadChefs();
            renderChefs(getFilteredChefs());
        }
    } catch (err) {
        productsGrid.innerHTML = `<div class="error-msg">⚠️ Xatolik: ${err.message}</div>`;
    }
}

function skeletons() {
    return Array(3).fill(`
        <div class="skeleton-card">
            <div class="skeleton sk-img"></div>
            <div class="sk-body">
                <div class="skeleton sk-line" style="width:70%"></div>
                <div class="skeleton sk-line" style="width:50%"></div>
                <div class="skeleton sk-line" style="width:35%"></div>
            </div>
        </div>`).join('');
}

/* =============================================
   CARD LISTENERS (savat + like)
   ============================================= */
function attachCardListeners() {
    productsGrid.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            btn.textContent = btn.textContent === '🤍' ? '❤️' : '🤍';
        });
    });

    productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', e => {
            const card = e.target.closest('.product-card');
            const id    = card.dataset.id;
            const name  = card.querySelector('.dish-name-el').textContent.trim();
            const price = parseInt(card.dataset.price);

            const existing = cart.find(i => i.id === id);
            if (existing) existing.quantity++;
            else cart.push({ id, name, price, quantity: 1 });

            updateBadge();

            btn.textContent = "Qo'shildi ✓";
            btn.style.background = '#28a745';
            setTimeout(() => { btn.textContent = 'Savatga'; btn.style.background = ''; }, 1200);
        });
    });
}

/* =============================================
   CART
   ============================================= */
function updateBadge() {
    cartBadgeCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function renderCart() {
    cartItemsList.innerHTML = '';
    if (!cart.length) {
        cartItemsList.innerHTML = '<p class="empty-cart-msg">Savatingiz hozircha bo\'sh.</p>';
        cartTotalSum.textContent = "0 so'm";
        return;
    }
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItemsList.insertAdjacentHTML('beforeend', `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>${item.quantity} x ${item.price.toLocaleString()} so'm</span>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">❌</button>
            </div>`);
    });
    cartTotalSum.textContent = total.toLocaleString() + " so'm";
    cartItemsList.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cart = cart.filter(i => i.id !== btn.dataset.id);
            renderCart();
            updateBadge();
        });
    });
}

/* =============================================
   EVENT LISTENERS
   ============================================= */
subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        subTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        switchTab(tab.dataset.type);
    });
});

distBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        distBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

priceSlider.addEventListener('input', e => {
    const v = parseInt(e.target.value);
    priceLabel.textContent = `15k - ${Math.round(v / 1000)}k`;
});

sortSelect.addEventListener('change', () => {
    if (activeTab === 'taomlar') renderFoods(getFilteredFoods());
    else renderChefs(getFilteredChefs());
});

applyFiltersBtn.addEventListener('click', () => {
    if (activeTab === 'taomlar') renderFoods(getFilteredFoods());
    else renderChefs(getFilteredChefs());
});

cartToggleBtn.addEventListener('click', () => { cartModal.classList.add('open'); renderCart(); });
closeCartBtn.addEventListener('click', () => cartModal.classList.remove('open'));
cartModal.addEventListener('click', e => { if (e.target === cartModal) cartModal.classList.remove('open'); });

// Checkout button listener in cart
const checkoutBtn = document.querySelector('.btn-checkout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (!cart.length) {
            alert("Savatingiz bo'sh. Iltimos, taom qo'shing!");
            return;
        }
        window.location.href = 'chekout.html';
    });
}

/* =============================================
   INIT
   ============================================= */
switchTab('taomlar');