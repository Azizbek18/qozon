// ==========================================
// QOZON DASHBOARD — INDEX.JS (Bento Redesign)
// ==========================================

// ==========================================
// 1. GLOBAL STATE
// ==========================================
let allFoodsData = [];
let allChefsData = [];
let currentFilter = 'all';
let searchQuery = '';
let cartItems = [];
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
        .replace(/['`’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (slug) return slug;

    const hash = raw.split('').reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, index + 17);
    return `chef-${hash.toString(36)}`;
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
try {
    cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
} catch(e) {
    cartItems = [];
}
let cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
let favorites = new Set();
try {
    const savedFavs = JSON.parse(localStorage.getItem('qz_favorites') || '[]');
    savedFavs.forEach(id => favorites.add(String(id)));
} catch(e) {}
const INITIAL_ITEMS = 6;
let isFoodsExpanded = false;

// ==========================================
// SEVIMLI TAOMLARNI SUPABASE (favorite_foods) BILAN SINXRONLASH
// ==========================================
const FAV_SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const FAV_SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
const favSupabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(FAV_SUPABASE_URL, FAV_SUPABASE_KEY) : null;
let favCurrentUserId = null;

async function syncFavoritesFromServer() {
    if (!favSupabaseClient) return;
    try {
        const { data: { user } } = await favSupabaseClient.auth.getUser();
        if (!user) return;
        favCurrentUserId = user.id;
        const { data, error } = await favSupabaseClient.from('favorite_foods').select('food_id').eq('user_id', user.id);
        if (error || !data) return;
        data.forEach(row => favorites.add(String(row.food_id)));
        localStorage.setItem('qz_favorites', JSON.stringify(Array.from(favorites)));
        renderFoods();
        updateFavBadge();
    } catch (e) {
        console.error('Sevimlilarni serverdan yuklashda xatolik:', e);
    }
}

function syncFavoriteToggleToServer(foodId, isNowFavorite) {
    if (!favSupabaseClient || !favCurrentUserId) return;
    const numericId = parseInt(foodId, 10);
    if (!numericId) return;
    if (isNowFavorite) {
        favSupabaseClient.from('favorite_foods').insert({ user_id: favCurrentUserId, food_id: numericId }).then(({ error }) => {
            if (error) console.error('Sevimlilarga saqlashda xatolik:', error);
        });
    } else {
        favSupabaseClient.from('favorite_foods').delete().eq('user_id', favCurrentUserId).eq('food_id', numericId).then(({ error }) => {
            if (error) console.error("Sevimlilardan o'chirishda xatolik:", error);
        });
    }
}

const DELIVERY_TIMES = ['20-30 daq', '25-35 daq', '30-40 daq', '15-25 daq', '35-45 daq'];

// ==========================================
// 2. HEADER SCROLL EFFECT
// ==========================================
function initHeaderScroll() {
    const header = document.getElementById('dashHeader');
    if (!header) return;

    function onScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        header.classList.toggle('scrolled', scrollY > 20);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ==========================================
// 3. SEARCH FUNCTIONALITY
// ==========================================
function initSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    if (!input) return;

    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        searchQuery = input.value.trim().toLowerCase();

        if (searchQuery.length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }

        debounceTimer = setTimeout(() => {
            renderFoods();
        }, 200);
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            searchQuery = '';
            clearBtn.style.display = 'none';
            renderFoods();
            input.focus();
        });
    }

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const q = input.value.trim();
        const district = localStorage.getItem('qz_district') || 'Yunusobod';
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (district) params.set('district', district);
        window.location.href = `qidiruvnatijalari.html?${params.toString()}`;
    });
}

// ==========================================
// 4. CATEGORIES
// ==========================================
function initCategories() {
    const track = document.getElementById('categoriesTrack');
    if (!track) return;

    track.querySelectorAll('.duo-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            track.querySelectorAll('.duo-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter') || 'all';
            isFoodsExpanded = false;
            renderFoods();
        });
    });
}

// ==========================================
// 5. TOAST NOTIFICATION SYSTEM
// ==========================================
let toastQueue = [];

function showToast(type, title, message, duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️',
        error: '❌'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Yopish">✕</button>
        <div class="toast-progress" style="width: 100%;"></div>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });
    });

    const progress = toast.querySelector('.toast-progress');
    progress.style.transitionDuration = duration + 'ms';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            progress.style.width = '0%';
        });
    });

    const timer = setTimeout(() => removeToast(toast), duration);
    toast._timer = timer;

    toastQueue.push(toast);
}

function removeToast(toast) {
    if (!toast || toast._removing) return;
    toast._removing = true;
    clearTimeout(toast._timer);
    toast.classList.remove('visible');
    toast.classList.add('hiding');
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        toastQueue = toastQueue.filter(t => t !== toast);
    }, 300);
}

// ==========================================
// 6. FOOD DATA & RENDERING
// ==========================================
const fallbackFoods = [
    {
        name: "Tovuqli Grek Salati",
        price: 35000,
        image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        chef_name: "Lola Opa",
        portions_left: 3,
        category: "salat",
        rating: "4.9"
    },
    {
        name: "Uy Mastavasi",
        price: 28000,
        image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
        chef_name: "Umida Shox",
        portions_left: 5,
        category: "shurva",
        rating: "4.8"
    },
    {
        name: "Go'shtli Manti (5ta)",
        price: 42000,
        image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
        chef_name: "Azizbek Aka",
        portions_left: 2,
        category: "manti",
        rating: "5.0"
    },
    {
        name: "Somsa (Go'shtli)",
        price: 8000,
        image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80",
        chef_name: "Xurmo Opa",
        portions_left: 15,
        category: "somsa",
        rating: "4.9"
    },
    {
        name: "An'anaviy O'zbek Palovi",
        price: 35000,
        image_url: "Traditional Uzbek Plov (1).svg",
        chef_name: "Xurmo Opa",
        portions_left: 4,
        category: "osh",
        rating: "4.9"
    },
    {
        name: "Shakarli Pahlava",
        price: 15000,
        image_url: "https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=600&q=80",
        chef_name: "Xurmo Opa",
        portions_left: 4,
        category: "shirinlik",
        rating: "4.8"
    }
];

function useFallbackFoods() {
    allFoodsData = fallbackFoods;
    renderFoods();
}

function fetchFoods() {
    // Try Supabase first, fallback to static data
    if (typeof supabase !== 'undefined') {
        const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
        try {
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            client.from('foods').select('*').then(({ data, error }) => {
                if (error) throw error;
                if (data && data.length > 0) {
                    allFoodsData = data;
                    renderFoods();
                } else {
                    useFallbackFoods();
                }
            }).catch(() => useFallbackFoods());
        } catch {
            useFallbackFoods();
        }
    } else {
        useFallbackFoods();
    }
}

function renderFoods() {
    const grid = document.getElementById('foodGrid');
    const emptyState = document.getElementById('emptyState');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = allFoodsData.filter(food => {
        if (currentFilter !== 'all') {
            const cat = (food.category || '').toLowerCase();
            const name = (food.name || '').toLowerCase();

            if (currentFilter === 'osh') {
                if (!(cat === 'osh' || cat === 'palov' || name.includes('osh') || name.includes('palov'))) return false;
            } else if (currentFilter === 'shurva') {
                if (!(cat === 'shurva' || cat.includes('shurva') || cat.includes('sho\'rva'))) return false;
            } else if (currentFilter === 'somsa') {
                if (!(cat === 'somsa' || name.includes('somsa'))) return false;
            } else if (currentFilter === 'manti') {
                if (!(cat === 'manti' || name.includes('manti'))) return false;
            } else if (currentFilter === 'salat') {
                if (!(cat === 'salat' || cat.includes('salat'))) return false;
            } else if (currentFilter === 'shirinlik') {
                if (!(cat === 'shirinlik' || cat.includes('desert') || cat.includes('shirinlik'))) return false;
            } else {
                if (cat !== currentFilter) return false;
            }
        }

        if (searchQuery) {
            const name = (food.name || '').toLowerCase();
            const chef = (food.chef_name || '').toLowerCase();
            if (!name.includes(searchQuery) && !chef.includes(searchQuery)) return false;
        }

        return true;
    });

    if (emptyState) {
        emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
    }

    const itemsToShow = isFoodsExpanded ? filtered : filtered.slice(0, INITIAL_ITEMS);

    itemsToShow.forEach((food, index) => {
        const name = food.name || "Noma'lum taom";
        const price = new Intl.NumberFormat('ru-RU').format(food.price) + " so'm";
        const image = food.image_url || food.image || getFoodFallbackImage(name, food.category, index);
        const chef = food.chef_name || 'Oshpaz';
        const portions = food.portions_left || 0;
        const rating = food.rating || food.rating_score || '4.5';
        const isLow = portions < 5;
        const deliveryTime = DELIVERY_TIMES[Math.floor(Math.random() * DELIVERY_TIMES.length)];
        const foodId = food.id || index;
        const isFav = favorites.has(foodId);

        const card = document.createElement('div');
        card.className = 'food-card';
        card.style.animationDelay = `${index * 0.06}s`;
        card.setAttribute('data-food-id', foodId);

        const reviewsCount = Math.floor(parseFloat(rating) * 35 + (portions * 5) + 12);
        card.innerHTML = `
            <div class="food-card-image" onclick="window.location.href='food.detalis.html?id=${foodId}'">
                <img src="${image}" alt="${name}" loading="lazy" onerror="setFoodImageFallback(this, '${name.replace(/'/g, "\\'")}', '${String(food.category || '').replace(/'/g, "\\'")}', ${index})">
                <span class="food-card-portions-badge">🔥 ${portions} ta qoldi</span>
                <span class="food-card-price-badge">${price}</span>
                <button class="food-card-fav ${isFav ? 'active' : ''}" data-fav-id="${foodId}" onclick="event.stopPropagation(); toggleFavorite(this, '${foodId}', '${name.replace(/'/g, "\\'")}')" title="Sevimlilarga qo'shish">${isFav ? '❤️' : '🤍'}</button>
            </div>
            <div class="food-card-body" onclick="window.location.href='food.detalis.html?id=${foodId}'">
                <h3 class="food-card-title">${name}</h3>
                <div class="food-card-meta">
                    <span class="food-card-rating">⭐ ${rating} (${reviewsCount})</span>
                    <span class="food-card-dot">•</span>
                    <span class="food-card-chef-name">${chef}</span>
                </div>
                <div class="food-card-footer" style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light);">
                    <div class="food-card-portion" style="display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: var(--text-light);">
                        🔥 <strong style="color: var(--red); font-weight: 900;">${portions}</strong> ta qoldi
                    </div>
                    <button class="food-card-add" style="border: none;">
                        +
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    updateSeeMoreButton(filtered.length);
    initFoodCardInteractions();
}

function updateSeeMoreButton(filteredLength) {
    const container = document.getElementById('seeMoreContainer');
    const btn = document.getElementById('seeMoreBtn');
    if (!container || !btn) return;

    if (filteredLength > INITIAL_ITEMS) {
        container.style.display = 'flex';
        btn.textContent = isFoodsExpanded ? "Kamroq ko'rish" : "Ko'proq ko'rish";
    } else {
        container.style.display = 'none';
    }
}

function initSeeMore() {
    const btn = document.getElementById('seeMoreBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        isFoodsExpanded = !isFoodsExpanded;
        if (!isFoodsExpanded) {
            document.querySelector('.bento-foods')?.scrollIntoView({ behavior: 'smooth' });
        }
        renderFoods();
    });
}

// ==========================================
// 7. FOOD CARD INTERACTIONS
// ==========================================
// Global favorites toggle function (callable from inline onclick)
window.toggleFavorite = function(btn, foodId, foodName) {
    const isActive = btn.classList.contains('active');
    const card     = btn.closest('.food-card');
    const chef     = card ? (card.querySelector('.food-card-chef-name')?.textContent || '') : '';
    const image    = card ? (card.querySelector('.food-card-image img')?.src || '') : '';
    const priceRaw = card ? (card.querySelector('.food-card-price-badge')?.textContent || '0') : '0';
    const price    = parseInt(priceRaw.replace(/[^\d]/g, '')) || 0;

    // qz_fav_meta — chef nomi bilan meta saqlash
    let meta = {};
    try { meta = JSON.parse(localStorage.getItem('qz_fav_meta') || '{}'); } catch(e) {}

    if (isActive) {
        favorites.delete(String(foodId));
        delete meta[String(foodId)];
        btn.classList.remove('active');
        btn.innerHTML = '🤍';
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        showToast('info', 'Olib tashlandi', "Sevimlilar ro'yxatidan olib tashlandi");
    } else {
        favorites.add(String(foodId));
        meta[String(foodId)] = { name: foodName, chef, image, price };
        btn.classList.add('active');
        btn.innerHTML = '❤️';
        btn.style.transform = 'scale(1.35)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
        showToast('success', "Sevimlilarga qo'shildi", '❤️ Bu taom sevimlilarga saqlandi!');
    }
    // localStorage ga saqlash
    localStorage.setItem('qz_favorites', JSON.stringify(Array.from(favorites)));
    localStorage.setItem('qz_fav_meta', JSON.stringify(meta));
    // Tizimga kirgan bo'lsa — serverga (favorite_foods) ham yozish
    syncFavoriteToggleToServer(foodId, !isActive);
    // Header badge ni yangilash
    updateFavBadge();
};

function initFoodCardInteractions() {
    // .food-card-fav tugmasi inline onclick="toggleFavorite(...)" orqali ishlaydi
    // Bu yerda ikkinchi listener qo'shilmaydi (ikki toast chiqmasligi uchun)

    document.querySelectorAll('.food-card-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const card = btn.closest('.food-card');
            if (!card) return;
            
            const foodId = parseInt(card.getAttribute('data-food-id')) || 0;
            const name = card.querySelector('.food-card-title')?.textContent || "Taom";
            const chef = card.querySelector('.food-card-chef-name')?.textContent || "Oshpaz";
            const image = card.querySelector('.food-card-image img')?.src || "";
            
            const priceText = card.querySelector('.food-card-price-badge')?.textContent || "0";
            const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
            
            addToCart(foodId, name, price, image, chef);

            // Duolingo-style button animation
            btn.style.transform = 'translateY(3px)';
            btn.style.borderBottomWidth = '0';
            btn.style.boxShadow = 'none';
            btn.textContent = '✓';
            btn.style.background = 'var(--green)';
            setTimeout(() => {
                btn.style.transform = '';
                btn.style.borderBottomWidth = '';
                btn.style.boxShadow = '';
                btn.textContent = '+';
                btn.style.background = '';
            }, 700);

            showToast('success', 'Savatchaga qo\'shildi', `${name} savatchaga qo'shildi 🛒`);
        });
    });
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = cartCount;
    badge.classList.toggle('empty', cartCount === 0);
}

function updateFavBadge() {
    const badge = document.getElementById('favHeaderBadge');
    if (!badge) return;
    try {
        const favs = JSON.parse(localStorage.getItem('qz_favorites') || '[]');
        const favChefs = JSON.parse(localStorage.getItem('qz_fav_chefs') || '[]');
        const count = favs.length + favChefs.length;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch(e) {
        badge.style.display = 'none';
    }
}

// ==========================================
// 8. CHEF DATA & RENDERING
// ==========================================
const fallbackChefs = [
    {
        name: "Lola Opa",
        image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80",
        location: "Yunusobod",
        meal_count: 18,
        rating_score: "4.9",
        specialties: ["Milliy", "Yevropa"],
        distance: "450m",
        walk_time: "15-25 daq",
        online: true
    },
    {
        name: "Azizbek Aka",
        image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=150&q=80",
        location: "Yunusobod",
        meal_count: 24,
        rating_score: "5.0",
        specialties: ["Qozon kabob", "Dimlama"],
        distance: "800m",
        walk_time: "30-40 daq",
        online: true
    },
    {
        name: "Nilufar H.",
        image_url: "https://images.unsplash.com/photo-1607887946228-c71149939462?auto=format&fit=crop&w=150&q=80",
        location: "Yunusobod",
        meal_count: 15,
        rating_score: "4.7",
        specialties: ["Parhez", "Fitness"],
        distance: "1.1km",
        walk_time: "20-30 daq",
        online: true
    }
];

function useFallbackChefs() {
    allChefsData = fallbackChefs;
    renderChefs();
}

function fetchChefs() {
    if (typeof supabase !== 'undefined') {
        const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
        try {
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            client.from('chefs').select('*').then(({ data, error }) => {
                if (error) throw error;
                if (data && data.length > 0) {
                    allChefsData = data;
                    renderChefs();
                } else {
                    useFallbackChefs();
                }
            }).catch(() => useFallbackChefs());
        } catch {
            useFallbackChefs();
        }
    } else {
        useFallbackChefs();
    }
}

function renderChefs() {
    const track = document.getElementById('chefsTrack');
    if (!track) return;
    track.innerHTML = '';

    // Sevimli oshpazlar ro'yxati
    let favChefs = [];
    try { favChefs = JSON.parse(localStorage.getItem('qz_fav_chefs') || '[]'); } catch(e) {}

    allChefsData.forEach((chef, index) => {
        const name       = chef.name || chef.full_name || "Noma'lum oshpaz";
        const image      = chef.avatar_url || chef.image_url || chef.image || getChefFallbackImage(name, index);
        const location   = chef.location || chef.address || "Manzil ko'rsatilmagan";
        const meals      = chef.meal_count || chef.meals || 0;
        const rating     = chef.rating_score || chef.rating || '5.0';
        const specialties = chef.specialties || ["Osh", "Manti"];
        const walkTime   = chef.walk_time || Math.floor(Math.random() * 15 + 8) + ' min';
        const isOnline   = chef.online !== false;
        const chefId     = makeChefFavoriteId(chef, name, index);
        const isFav      = favChefs.includes(chefId);

        const specText = (Array.isArray(specialties) ? specialties.join(' va ') : specialties) + ' ustasi';

        const card = document.createElement('div');
        card.className = 'chef-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.setAttribute('data-chef-id', chefId);
        card.setAttribute('data-chef-name', name);

        // Navigate faqat fav tugmaga bosilmasa
        card.onclick = (e) => {
            if (e.target.closest('.chef-card-fav-btn')) return;
            window.location.href = `xurmoOpa.html?id=${chef.id}`;
        };

        card.innerHTML = `
            <img class="chef-avatar" src="${image}" alt="${name}" loading="lazy" onerror="setChefImageFallback(this, '${name.replace(/'/g, "\\'")}', ${index})">
            <div class="chef-card-info">
                <h3 class="chef-card-name">${name}</h3>
                <p class="chef-card-spec">${specText}</p>
                <p class="chef-card-meta-line">⭐ ${rating} &nbsp;•&nbsp; ${walkTime}</p>
            </div>
            <div class="chef-card-actions">
                <button class="chef-card-fav-btn ${isFav ? 'active' : ''}"
                    data-chef-id="${chefId}"
                    title="Sevimlilarga qo'shish"
                    onclick="event.stopPropagation(); toggleChefFavDash(this, '${chefId}', '${name.replace(/'/g,"\\'")}')">
                    ${isFav ? '❤️' : '🤍'}
                </button>
                <div class="chef-distance-tag">${chef.distance || '450m'}</div>
            </div>
        `;

        track.appendChild(card);
    });
}

// Oshpaz sevimlilari toggle — buyordashbord sahifasida
window.toggleChefFavDash = function(btn, chefId, chefName) {
    if (!chefId) {
        chefId = makeChefFavoriteId({}, chefName || 'oshpaz', Date.now());
        if (btn) btn.dataset.chefId = chefId;
    }

    let favChefs = [];
    try { favChefs = JSON.parse(localStorage.getItem('qz_fav_chefs') || '[]'); } catch(e) {}
    let chefMeta = {};
    try { chefMeta = JSON.parse(localStorage.getItem('qz_fav_chef_meta') || '{}'); } catch(e) {}

    const isFav = favChefs.includes(chefId);
    if (isFav) {
        favChefs = favChefs.filter(id => id !== chefId);
        delete chefMeta[chefId];
        btn.innerHTML = '🤍';
        btn.classList.remove('active');
        btn.style.transform = 'scale(0.85)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        showToast('info', 'Olib tashlandi', chefName + " sevimlilardan olib tashlandi");
    } else {
        favChefs.push(chefId);
        const card = btn.closest('.chef-card');
        chefMeta[chefId] = {
            id: chefId,
            name: chefName,
            image: card?.querySelector('.chef-avatar')?.src || getChefFallbackImage(chefName, favChefs.length),
            title: card?.querySelector('.chef-card-spec')?.textContent || 'Uy oshpazi',
            rating: card?.querySelector('.chef-card-meta-line')?.textContent || '⭐ 5.0',
            distance: card?.querySelector('.chef-distance-tag')?.textContent || ''
        };
        btn.innerHTML = '❤️';
        btn.classList.add('active');
        btn.style.transform = 'scale(1.4)';
        setTimeout(() => { btn.style.transform = ''; }, 220);
        showToast('success', "Sevimlilarga qo'shildi", '❤️ ' + chefName + " sevimlilarga saqlandi!");
    }
    localStorage.setItem('qz_fav_chefs', JSON.stringify(favChefs));
    localStorage.setItem('qz_fav_chef_meta', JSON.stringify(chefMeta));
    updateFavBadge();
};

// ==========================================
// 9. "SEE ALL" LINK HANDLERS
// ==========================================
function initSeeAllLinks() {
    const seeAllLink = document.getElementById('seeAllLink');
    if (seeAllLink) {
        seeAllLink.addEventListener('click', (e) => {
            e.preventDefault();
            const params = new URLSearchParams({
                type: 'taomlar',
                district: localStorage.getItem('qz_district') || 'Yunusobod'
            });
            if (currentFilter && currentFilter !== 'all') params.set('category', currentFilter);
            if (searchQuery) params.set('q', searchQuery);
            window.location.href = `qidiruvnatijalari.html?${params.toString()}`;
        });
    }

    const seeAllChefsLink = document.getElementById('seeAllChefsLink');
    if (seeAllChefsLink) {
        seeAllChefsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const params = new URLSearchParams({
                type: 'oshpazlar',
                district: localStorage.getItem('qz_district') || 'Yunusobod'
            });
            if (searchQuery) params.set('q', searchQuery);
            window.location.href = `qidiruvnatijalari.html?${params.toString()}`;
        });
    }
}

// ==========================================
// 10. CART BUTTON
// ==========================================
function saveCart() {
    localStorage.setItem('qz_cart', JSON.stringify(cartItems));
    cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    updateCartBadge();
    renderCartDrawer();
}

function addToCart(foodId, name, price, image, chef) {
    const existing = cartItems.find(item => item.id === foodId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({
            id: foodId,
            name: name,
            price: price,
            image: image,
            chef: chef,
            quantity: 1
        });
    }
    saveCart();
}

window.updateCartItemQuantity = function(foodId, delta) {
    const item = cartItems.find(item => item.id === foodId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cartItems = cartItems.filter(i => i.id !== foodId);
        }
        saveCart();
    }
}

function renderCartDrawer() {
    const body = document.getElementById('cartDrawerBody');
    const totalPriceEl = document.getElementById('cartTotalPrice');
    if (!body) return;

    if (cartItems.length === 0) {
        body.innerHTML = `
            <div class="cart-empty-state">
                <div class="cart-empty-visual" aria-hidden="true">
                    <svg viewBox="0 0 96 96" role="img" focusable="false">
                        <path class="cart-empty-basket" d="M20 39h56l-6 33a8 8 0 0 1-7.9 6.6H33.9A8 8 0 0 1 26 72L20 39Z"/>
                        <path class="cart-empty-handle" d="M35 39c1.4-10 6-18 13-18s11.6 8 13 18"/>
                        <path class="cart-empty-line" d="M36 51v14M48 51v14M60 51v14"/>
                        <circle class="cart-empty-plus-bg" cx="72" cy="26" r="13"/>
                        <path class="cart-empty-plus" d="M72 19v14M65 26h14"/>
                    </svg>
                </div>
                <p>Savatchangiz hozircha bo'sh</p>
                <span>Mazali taomlar tanlab, savatga qo'shing!</span>
            </div>
        `;
        if (totalPriceEl) totalPriceEl.textContent = "0 so'm";
        return;
    }

    let html = '';
    let total = 0;

    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const formattedPrice = new Intl.NumberFormat('ru-RU').format(item.price) + " so'm";
        html += `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div>
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-chef">${item.chef}</p>
                    </div>
                    <div class="cart-item-price-row">
                        <span class="cart-item-price">${formattedPrice}</span>
                        <div class="cart-item-qty">
                            <button class="cart-qty-btn decrease-qty" onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button class="cart-qty-btn increase-qty" onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    body.innerHTML = html;
    if (totalPriceEl) {
        totalPriceEl.textContent = new Intl.NumberFormat('ru-RU').format(total) + " so'm";
    }
}

function initCartButton() {
    const cartBtn = document.getElementById('cartBtn');
    const drawer = document.getElementById('cartDrawer');
    const closeBtn = document.getElementById('cartDrawerClose');
    const overlay = document.getElementById('cartDrawerOverlay');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');

    if (cartBtn && drawer) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            drawer.classList.add('open');
            renderCartDrawer();
        });
    }

    if (closeBtn && drawer) {
        closeBtn.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    }

    if (overlay && drawer) {
        overlay.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                showToast('info', 'Savatcha bo\'sh', 'Avval taom tanlang');
                return;
            }
            window.location.href = 'chekout.html';
        });
    }
}

// ==========================================
// 11. LOCATION PILL
// ==========================================
function initLocationPill() {
    const pill = document.getElementById('locationPill');
    if (!pill) return;

    // Toshkent tumanlari
    const DISTRICTS = [
        { name: 'Yunusobod',    icon: '🏙️', sub: 'Shimoliy Toshkent' },
        { name: 'Chilonzor',    icon: '🌳', sub: 'Gʻarbiy Toshkent' },
        { name: 'Yakkasaroy',   icon: '🏛️', sub: 'Markaziy Toshkent' },
        { name: 'Mirzo Ulugbek',icon: '🔭', sub: 'Sharqiy Toshkent' },
        { name: 'Mirobod',      icon: '🏢', sub: 'Markaziy Toshkent' },
        { name: 'Shayxontohur', icon: '🕌', sub: 'Shimoli-sharq' },
        { name: 'Olmazor',      icon: '🌸', sub: 'Gʻarbiy Toshkent' },
        { name: 'Uchtepa',      icon: '🏘️', sub: 'Gʻarbiy Toshkent' },
        { name: 'Bektemir',     icon: '🏗️', sub: 'Janubi-sharq' },
        { name: 'Sergeli',      icon: '🏡', sub: 'Janubiy Toshkent' },
        { name: 'Yashnobod',    icon: '🌿', sub: 'Janubiy Toshkent' },
        { name: 'Yangihayot',   icon: '🌱', sub: 'Janubiy Toshkent' },
    ];

    let currentDistrict = localStorage.getItem('qz_district') || 'Yunusobod';

    // Header va banner matnini yangilash
    function updateLocationText(name) {
        const pillSpan = pill.querySelector('span');
        if (pillSpan) pillSpan.textContent = name;
        // Banner subtitle
        const bannerSub = document.querySelector('.banner-subtitle');
        if (bannerSub) {
            bannerSub.textContent = `📍 ${name} • 1.2 km atrofida 14 oshpaz`;
        }
    }

    // Districtlar ro'yxatini render qilish
    function renderDistricts(filter = '') {
        const list = document.getElementById('districtsList');
        if (!list) return;
        const filtered = DISTRICTS.filter(d =>
            d.name.toLowerCase().includes(filter.toLowerCase())
        );
        if (filtered.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">Tuman topilmadi</div>';
            return;
        }
        list.innerHTML = filtered.map(d => `
            <div class="district-item ${d.name === currentDistrict ? 'active' : ''}"
                 onclick="selectDistrict('${d.name}')">
                <div class="district-icon">${d.icon}</div>
                <div class="district-info">
                    <div class="district-name">${d.name}</div>
                    <div class="district-sub">${d.sub}</div>
                </div>
                <span class="district-check">✅</span>
            </div>
        `).join('');
    }

    // Districtni tanlash
    window.selectDistrict = function(name) {
        currentDistrict = name;
        localStorage.setItem('qz_district', name);
        updateLocationText(name);
        renderDistricts(document.getElementById('locationSearchInput')?.value || '');
        setTimeout(closeLocationModal, 300);
        showToast('success', 'Manzil yangilandi', `📍 ${name} tanlandi`);
    };

    // Qidiruv filtri
    window.filterDistricts = function(val) { renderDistricts(val); };

    // Modalni ochish
    window.openLocationModal = function() {
        const overlay = document.getElementById('locationModalOverlay');
        if (!overlay) return;
        renderDistricts();
        overlay.classList.add('open');
        setTimeout(() => {
            document.getElementById('locationSearchInput')?.focus();
        }, 200);
    };

    // Modalni yopish
    window.closeLocationModal = function() {
        const overlay = document.getElementById('locationModalOverlay');
        if (overlay) overlay.classList.remove('open');
        const inp = document.getElementById('locationSearchInput');
        if (inp) inp.value = '';
        renderDistricts();
    };

    // Pill click
    pill.addEventListener('click', () => openLocationModal());

    // ESC tugmasi bilan yopish
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLocationModal();
    });

    // Sahifa ochilganda saqlangan manzilni ko'rsatish
    updateLocationText(currentDistrict);
}

// ==========================================
// 12. FAVORITES RENDERING
// ==========================================
function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    let meta = {};
    try { meta = JSON.parse(localStorage.getItem('qz_fav_meta') || '{}'); } catch (e) {}

    const favItems = Array.from(favorites).map(id => {
        const m = meta[id] || {};
        return { id, name: m.name || 'Taom', chef: m.chef || '', image: m.image || FOOD_PLACEHOLDER_IMAGE, price: m.price || 0 };
    });

    if (!favItems.length) {
        grid.innerHTML = `<p style="padding:12px 0;color:var(--text-light,#8b7355);font-size:13px">Hozircha sevimli taomlaringiz yo'q.</p>`;
        return;
    }

    favItems.slice(0, 6).forEach(item => {
        const card = document.createElement('div');
        card.className = 'fav-card';
        const safeName = String(item.name).replace(/'/g, "\\'");
        const safeChef = String(item.chef).replace(/'/g, "\\'");
        const safeImage = String(item.image).replace(/'/g, "\\'");
        card.innerHTML = `
            <img class="fav-img" src="${item.image}" alt="${item.name}">
            <div class="fav-info">
                <h4 class="fav-title">${item.name}</h4>
                <p class="fav-count">${item.chef || ''}</p>
            </div>
            <button class="fav-order-btn" onclick="event.stopPropagation(); addToCart('${item.id}', '${safeName}', ${item.price}, '${safeImage}', '${safeChef}'); showToast('success', 'Savatchaga qo\\'shildi', '${safeName} savatchaga qo\\'shildi! 🛒');">Qayta olish</button>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// 13. MAIN — DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Header
    initHeaderScroll();

    // Set dynamic username and avatar from local storage / Supabase session
    try {
        function getLoggedInUserName() {
            const keys = ["tn_user", "qz_current", "mk_user", "user"];
            for (const key of keys) {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        const name = parsed.name || parsed.full_name || parsed.fullName;
                        if (name) return name;
                    }
                } catch (e) {}
            }
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
                    try {
                        const data = localStorage.getItem(key);
                        if (data) {
                            const parsed = JSON.parse(data);
                            const user = parsed.user || parsed;
                            if (user) {
                                const meta = user.user_metadata || {};
                                const name = meta.full_name || meta.name || user.email;
                                if (name) return name;
                            }
                        }
                    } catch (e) {}
                }
            }
            return "Malika";
        }

        const userName = getLoggedInUserName();
        const nameEl = document.getElementById("userNameText");
        if (nameEl) nameEl.textContent = userName;

        // Try to find avatar picture
        let userAvatar = "";
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        const user = parsed.user || parsed;
                        if (user && user.user_metadata) {
                            userAvatar = user.user_metadata.avatar_url || user.user_metadata.picture || "";
                        }
                    }
                } catch(e){}
            }
        }
        if (!userAvatar) {
            const keys = ["tn_user", "qz_current", "mk_user"];
            for (const key of keys) {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        userAvatar = parsed.avatar || parsed.avatar_url || "";
                    }
                } catch(e){}
            }
        }

        // Eski hisoblarga tasodifan yozib qo'yilgan umumiy placeholder rasm —
        // haqiqiy profil surati emas, shu sabab icon fallback ko'rsatiladi.
        function isRealAvatar(url) {
            return !!url && !url.includes('user-male-circle');
        }

        function setHeaderAvatar(url) {
            const imgEl = document.getElementById("headerAvatarImg");
            const fallbackEl = document.getElementById("headerAvatarFallback");
            if (!imgEl || !fallbackEl) return;
            if (isRealAvatar(url)) {
                imgEl.src = url;
                imgEl.style.display = "block";
                fallbackEl.style.display = "none";
            } else {
                imgEl.style.display = "none";
                imgEl.removeAttribute("src");
                fallbackEl.style.display = "flex";
            }
        }

        const headerAvatarImgEl = document.getElementById("headerAvatarImg");
        if (headerAvatarImgEl) {
            headerAvatarImgEl.addEventListener("error", () => setHeaderAvatar(""));
        }

        setHeaderAvatar(userAvatar);

        // Authoritative sync: real avatar/full_name from the "profiles" table
        if (favSupabaseClient) {
            favSupabaseClient.auth.getSession().then(({ data: { session } }) => {
                if (!session) return;
                favSupabaseClient
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        if (profile && profile.full_name && nameEl) nameEl.textContent = profile.full_name;
                        setHeaderAvatar(profile?.avatar_url || "");
                    })
                    .catch(err => console.error("Error fetching header profile:", err));
            }).catch(err => console.error("Error fetching session for header avatar:", err));
        }
    } catch (e) {
        console.error("Error reading local user details:", e);
    }

    // Search
    initSearch();

    // Categories
    initCategories();

    // Fetch data
    fetchFoods();
    fetchChefs();
    renderFavorites();
    syncFavoritesFromServer();

    // UI interactions
    initSeeMore();
    initSeeAllLinks();
    initCartButton();
    initLocationPill();

    // Initial cart badge
    updateCartBadge();
    // Initial favorites badge
    updateFavBadge();

    // Check if there is an active order in progress
    const activeOrder = localStorage.getItem('qz_active_order');
    const orderBar = document.getElementById('floatingOrderBar');
    if (orderBar) {
        orderBar.style.display = activeOrder === 'true' ? 'flex' : 'none';
    }

    // Show toast if redirected from empty checkout
    if (localStorage.getItem('qz_checkout_empty_alert') === 'true') {
        localStorage.removeItem('qz_checkout_empty_alert');
        setTimeout(() => {
            showToast('info', 'Savatcha bo\'sh', 'Avval taom tanlang');
        }, 300);
    }
});
