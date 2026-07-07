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
const CHEF_PLACEHOLDER_ICON = 'images/chef-placeholder.svg';
const FOOD_PLACEHOLDER_IMAGE = './Traditional Uzbek Plov (1).svg';
const FOOD_FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&h=420&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&h=420&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&h=420&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=420&q=80',
    'https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=600&h=420&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=420&q=80'
];
const CHEF_FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=160&h=160&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=160&h=160&q=80',
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=160&h=160&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&h=160&q=80',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=160&h=160&q=80'
];

function getChefFallbackImage(name = '', index = 0) {
    const seed = String(name).split('').reduce((sum, char) => sum + char.charCodeAt(0), index);
    return CHEF_FALLBACK_IMAGES[Math.abs(seed) % CHEF_FALLBACK_IMAGES.length];
}

function makeChefFavoriteId(chef = {}, fallbackName = '', index = 0) {
    const rawId = chef.id || chef.user_id || chef.profile_id || fallbackName || chef.full_name || chef.name || `oshpaz-${index}`;
    const raw = String(rawId).trim().toLowerCase();
    const slug = raw
        .trim()
        .replace(/['`’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (slug) return slug;

    const hash = raw.split('').reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, index + 17);
    return `chef-${hash.toString(36)}`;
}

function buildChefProfileUrl(chef = {}, fallbackName = '', index = 0) {
    const params = new URLSearchParams();
    const rawId = chef.id || chef.user_id || chef.profile_id;
    const name = fallbackName || chef.full_name || chef.name || '';
    if (rawId !== undefined && rawId !== null && String(rawId).trim()) {
        params.set('id', String(rawId).trim());
    }
    if (name) params.set('name', name);
    if (!params.has('id') && !params.has('name')) {
        params.set('name', `Oshpaz ${index + 1}`);
    }
    return `xurmoOpa.html?${params.toString()}`;
}

function getFavChefs() {
    try {
        return JSON.parse(localStorage.getItem('qz_fav_chefs') || '[]');
    } catch (e) {
        return [];
    }
}

function getFavChefMeta() {
    try {
        return JSON.parse(localStorage.getItem('qz_fav_chef_meta') || '{}');
    } catch (e) {
        return {};
    }
}

function saveFavChefs(favChefs, chefMeta) {
    localStorage.setItem('qz_fav_chefs', JSON.stringify(favChefs));
    localStorage.setItem('qz_fav_chef_meta', JSON.stringify(chefMeta));
}

window.setChefImageFallback = function(img, name = '', index = 0) {
    const nextStep = Number(img.dataset.fallbackStep || 0);
    if (nextStep < CHEF_FALLBACK_IMAGES.length) {
        img.dataset.fallbackStep = String(nextStep + 1);
        img.src = CHEF_FALLBACK_IMAGES[(Math.abs(index) + nextStep) % CHEF_FALLBACK_IMAGES.length];
        return;
    }
    img.onerror = null;
    img.src = CHEF_PLACEHOLDER_ICON;
};

function getFoodFallbackImage(name = '', category = '', index = 0) {
    const key = `${name} ${category}`.toLowerCase();
    if (key.includes('osh') || key.includes('palov') || key.includes('plov')) return './Traditional Uzbek Plov (1).svg';
    if (key.includes('somsa')) return 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&h=420&q=80';
    if (key.includes('manti')) return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&h=420&q=80';
    if (key.includes('shurva') || key.includes("sho'rva") || key.includes('soup')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&h=420&q=80';
    if (key.includes('salat')) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&h=420&q=80';
    if (key.includes('shirin') || key.includes('dessert')) return 'https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=600&h=420&q=80';
    const seed = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), index);
    return FOOD_FALLBACK_IMAGES[Math.abs(seed) % FOOD_FALLBACK_IMAGES.length];
}

window.setFoodImageFallback = function(img, name = '', category = '', index = 0) {
    const nextStep = Number(img.dataset.fallbackStep || 0);
    if (nextStep === 0) {
        img.dataset.fallbackStep = '1';
        img.src = getFoodFallbackImage(name, category, index);
        return;
    }
    if (nextStep <= FOOD_FALLBACK_IMAGES.length) {
        img.dataset.fallbackStep = String(nextStep + 1);
        img.src = FOOD_FALLBACK_IMAGES[(Math.abs(index) + nextStep - 1) % FOOD_FALLBACK_IMAGES.length];
        return;
    }
    img.onerror = null;
    img.src = FOOD_PLACEHOLDER_IMAGE;
};
const initialParams = new URLSearchParams(window.location.search);
let pageQuery = (initialParams.get('q') || '').trim().toLowerCase();
let pageCategory = (initialParams.get('category') || '').trim().toLowerCase();
let pageDistrict = (initialParams.get('district') || localStorage.getItem('qz_district') || '').trim();

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
const mainSearchInput = document.getElementById('mainSearchInput');
const searchTitle     = document.getElementById('searchTitle');

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

    foods.forEach((food, index) => {
        const price = Number(food.price).toLocaleString('uz-UZ');
        const rating = food.rating ?? 5.0;
        const foodName = food.name || 'Taom';
        const foodCategory = food.category || '';
        const imageSrc = food.image_url || food.image || getFoodFallbackImage(foodName, foodCategory, index);

        const imgEl = `<img src="${imageSrc}" alt="${foodName}" loading="lazy" onerror="setFoodImageFallback(this, '${foodName.replace(/'/g, "\\'")}', '${String(foodCategory).replace(/'/g, "\\'")}', ${index})">`;

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

        card.addEventListener('click', (event) => {
            if (event.target.closest('.like-btn') || event.target.closest('.btn-add-cart')) return;
            const params = new URLSearchParams();
            params.set('id', food.id);
            if (pageDistrict) params.set('district', pageDistrict);
            if (pageQuery) params.set('q', pageQuery);
            window.location.href = `food.detalis.html?${params.toString()}`;
        });

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

    chefs.forEach((chef, index) => {
        const rating = chef.rating ?? 5.0;
        const chefName = chef.full_name || chef.name || 'Oshpaz';
        const chefId = makeChefFavoriteId(chef, chefName, index);
        const favChefs = getFavChefs();
        const isFavChef = favChefs.includes(chefId);

        const avatarSrc = chef.avatar_url || chef.image_url || chef.image || getChefFallbackImage(chefName, index);
        const avatarEl = `<img class="chef-avatar" src="${avatarSrc}" alt="${chefName}" loading="lazy" onerror="setChefImageFallback(this, '${chefName.replace(/'/g, "\\'")}', ${index})">`;

        const card = document.createElement('div');
        card.className = 'chef-card';
        card.dataset.rating = rating;
        card.dataset.chefId = chefId;
        card.dataset.chefName = chefName;
        card.style.cursor = 'pointer';
        card.addEventListener('click', (event) => {
            if (event.target.closest('.chef-like-btn')) return;
            window.location.href = buildChefProfileUrl(chef, chefName, index);
        });

        card.innerHTML = `
            ${avatarEl}
            <div class="chef-info">
                <div class="chef-name">
                    ${chefName}
                    ${chef.is_verified ? ' ✅' : ''}
                </div>
                <div class="chef-spec">${chef.speciality || 'Oshpaz'}</div>
                <div class="chef-rating">
                    <span class="star">★</span> ${rating}
                </div>
            </div>
            <button class="like-btn chef-like-btn ${isFavChef ? 'active' : ''}" style="position:static; background:#F5F0EF;">${isFavChef ? '❤️' : '🤍'}</button>`;

        productsGrid.appendChild(card);
    });

    // Like tugmalari
    productsGrid.querySelectorAll('.chef-like-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const card = btn.closest('.chef-card');
            const chefId = card?.dataset.chefId;
            const chefName = card?.dataset.chefName || 'Oshpaz';
            if (!chefId) return;

            let favChefs = getFavChefs();
            const chefMeta = getFavChefMeta();

            if (favChefs.includes(chefId)) {
                favChefs = favChefs.filter(id => id !== chefId);
                delete chefMeta[chefId];
                btn.textContent = '🤍';
                btn.classList.remove('active');
            } else {
                favChefs.push(chefId);
                chefMeta[chefId] = {
                    id: chefId,
                    name: chefName,
                    image: card.querySelector('.chef-avatar')?.src || getChefFallbackImage(chefName, favChefs.length),
                    title: card.querySelector('.chef-spec')?.textContent?.trim() || 'Oshpaz',
                    rating: card.querySelector('.chef-rating')?.textContent?.trim() || '★ 5.0',
                    dish: 'Bugungi yangi menyu'
                };
                btn.textContent = '❤️';
                btn.classList.add('active');
            }

            saveFavChefs(favChefs, chefMeta);
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

    if (pageQuery) {
        result = result.filter(f => {
            const haystack = `${f.name || ''} ${f.chef_name || ''} ${f.category || ''}`.toLowerCase();
            return haystack.includes(pageQuery);
        });
    }

    if (pageCategory) {
        result = result.filter(f => (f.category || '').toLowerCase() === pageCategory);
    }

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
    if (pageQuery) {
        result = result.filter(c => {
            const haystack = `${c.full_name || ''} ${c.speciality || ''}`.toLowerCase();
            return haystack.includes(pageQuery);
        });
    }
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
            else cart.push({ id, name, price, quantity: 1, chef: card.querySelector('.card-desc')?.textContent.replace('👨‍🍳', '').trim() || 'Oshpaz' });

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

if (mainSearchInput) {
    mainSearchInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        pageQuery = mainSearchInput.value.trim().toLowerCase();
        if (searchTitle) searchTitle.textContent = pageQuery ? `"${mainSearchInput.value.trim()}" bo'yicha natijalar` : 'Barcha natijalar';
        if (activeTab === 'taomlar') renderFoods(getFilteredFoods());
        else renderChefs(getFilteredChefs());
    });
}

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
        localStorage.setItem('qz_cart', JSON.stringify(cart));
        const params = new URLSearchParams();
        if (pageDistrict) params.set('district', pageDistrict);
        window.location.href = `chekout.html${params.toString() ? `?${params.toString()}` : ''}`;
    });
}

/* =============================================
   INIT
   ============================================= */
if (mainSearchInput && pageQuery) mainSearchInput.value = initialParams.get('q');
if (searchTitle) {
    const cleanQuery = initialParams.get('q');
    const districtSuffix = pageDistrict ? ` • ${pageDistrict}` : '';
    searchTitle.textContent = cleanQuery ? `"${cleanQuery}" bo'yicha natijalar${districtSuffix}` : `Barcha natijalar${districtSuffix}`;
}
if (pageDistrict) {
    distBtns.forEach(btn => btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === pageDistrict.toLowerCase()));
}
const initialType = initialParams.get('type') === 'oshpazlar' ? 'oshpazlar' : 'taomlar';
subTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.type === initialType));
switchTab(initialType);
