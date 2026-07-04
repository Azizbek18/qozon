// ==========================================
// 0. SUPABASE INITIALIZATION
// ==========================================
const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
let supabaseClient = null;
try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase library not loaded. Running in offline/fallback mode.");
    }
} catch (e) {
    console.error("Failed to initialize Supabase client:", e);
}

// ==========================================
// 1. GLOBAL O'ZGARUVCHILAR
// ==========================================
let allChefsData = [];
let showingAllChefs = false;

const INITIAL_ITEMS = 6;
let allFoodsData = [];
let currentFilter = 'all';
let isFoodsExpanded = false;


// ==========================================
// 2. COUNTDOWN TIMER (Yangi menyu vaqti)
// ==========================================
function initCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;

    function tick() {
        const now = new Date();
        const nextMeal = new Date(now);
        // Keyingi soat 12:00 yoki 18:00 ga hisoblaydi
        const hours = now.getHours();
        if (hours < 12) {
            nextMeal.setHours(12, 0, 0, 0);
        } else if (hours < 18) {
            nextMeal.setHours(18, 0, 0, 0);
        } else {
            nextMeal.setDate(nextMeal.getDate() + 1);
            nextMeal.setHours(12, 0, 0, 0);
        }

        const diff = nextMeal - now;
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${s}`;
    }

    tick();
    setInterval(tick, 1000);
}


// ==========================================
// 3. CHEFS LOGIC
// ==========================================
const fallbackChefs = [
    {
        name: "Xurmo Opa",
        image_url: "Cook Xurmo opa.svg",
        location: "Chilonzor, 3-kvartal",
        meal_count: 18,
        rating_score: "4.9"
    },
    {
        name: "Lola Opa",
        image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150",
        location: "Yunusobod, 11-mavze",
        meal_count: 12,
        rating_score: "4.8"
    },
    {
        name: "Azizbek Aka",
        image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150",
        location: "Uchtepa, Toshkent",
        meal_count: 25,
        rating_score: "4.7"
    }
];

function useFallbackChefs() {
    allChefsData = fallbackChefs;
    renderChefs(allChefsData.slice(0, 3));
    const loadMoreBtn = document.getElementById('load-more-chefs');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.onclick = () => {
            const btnText = loadMoreBtn.querySelector('.btn-text');
            const btnArrow = loadMoreBtn.querySelector('.btn-arrow');
            if (showingAllChefs) {
                renderChefs(allChefsData.slice(0, 3));
                if (btnText) btnText.textContent = "Ko'proq ko'rish";
                if (btnArrow) btnArrow.style.transform = "none";
                showingAllChefs = false;
            } else {
                renderChefs(allChefsData);
                if (btnText) btnText.textContent = "Kamroq ko'rish";
                if (btnArrow) btnArrow.style.transform = "rotate(180deg)";
                showingAllChefs = true;
            }
        };
    }
}

async function fetchChefsFromSupabase() {
    const loadMoreBtn = document.getElementById('load-more-chefs');
    if (!supabaseClient) {
        console.warn("Supabase client not initialized. Using fallback chefs.");
        useFallbackChefs();
        return;
    }
    try {
        const { data: chefs, error } = await supabaseClient
            .from('chefs')
            .select('*');

        if (error) throw error;

        if (chefs && chefs.length > 0) {
            allChefsData = chefs;
            renderChefs(allChefsData.slice(0, 3));

            if (allChefsData.length > 3 && loadMoreBtn) {
                loadMoreBtn.style.display = 'inline-flex';
            }

            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    const btnText = loadMoreBtn.querySelector('.btn-text');
                    const btnArrow = loadMoreBtn.querySelector('.btn-arrow');
                    if (showingAllChefs) {
                        renderChefs(allChefsData.slice(0, 3));
                        if (btnText) btnText.textContent = "Ko'proq ko'rish";
                        if (btnArrow) btnArrow.style.transform = "none";
                        showingAllChefs = false;
                    } else {
                        renderChefs(allChefsData);
                        if (btnText) btnText.textContent = "Kamroq ko'rish";
                        if (btnArrow) btnArrow.style.transform = "rotate(180deg)";
                        showingAllChefs = true;
                    }
                });
            }
        } else {
            useFallbackChefs();
        }
    } catch (err) {
        console.error('Oshpazlarni yuklashda xatolik:', err.message);
        useFallbackChefs();
    }
}

function renderChefs(chefsList) {
    const chefContainer = document.querySelector('.chefs-grid');
    if (!chefContainer) return;
    chefContainer.innerHTML = '';

    chefsList.forEach(chef => {
        const name     = chef.name || chef.full_name || "Noma'lum oshpaz";
        const image    = chef.avatar_url || chef.image_url || chef.image || 'https://cdn.dribbble.com/userupload/37942659/file/original-e75e34cb44361a6425fd82f51f07777b.png?resize=752x&vertical=center';
        const location = chef.location || chef.address || "Manzil ko'rsatilmagan";
        const meals    = chef.meal_count || chef.meals || 0;
        const rating   = chef.rating_score || chef.rating || '5.0';

        const html = `
            <div class="chef-card" onclick="window.location.href='xurmoOpa.html'" style="cursor: pointer;">
                <img src="${image}" alt="${name}">
                <h3>${name}</h3>
                <p class="chef-location">📍 ${location}</p>
                <div class="chef-meta">
                    <span class="meal-badge">${meals}+ Taom</span>
                    <span class="rating-badge">⭐ ${rating}</span>
                </div>
            </div>
        `;
        chefContainer.insertAdjacentHTML('beforeend', html);
    });

    // Animatsiya uchun kichik kechikish
    setTimeout(() => {
        chefContainer.querySelectorAll('.chef-card').forEach(el => el.classList.add('visible'));
    }, 60);
}


// ==========================================
// 4. FOODS LOGIC
// ==========================================
const fallbackFoods = [
    {
        name: "An'anaviy O'zbek Palovi",
        price: 35000,
        image_url: "Traditional Uzbek Plov (1).svg",
        chef_name: "Xurmo Opa",
        portions_left: 3,
        category: "osh"
    },
    {
        name: "Manti (Go'shtli)",
        price: 30000,
        image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
        chef_name: "Lola Opa",
        portions_left: 8,
        category: "manti"
    },
    {
        name: "Mastava",
        price: 22000,
        image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
        chef_name: "Azizbek Aka",
        portions_left: 2,
        category: "shurva"
    },
    {
        name: "Uyg'ur Lag'moni",
        price: 28000,
        image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        chef_name: "Azizbek Aka",
        portions_left: 6,
        category: "shurva"
    },
    {
        name: "Somsa (Go'shtli)",
        price: 8000,
        image_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80",
        chef_name: "Xurmo Opa",
        portions_left: 15,
        category: "somsa"
    },
    {
        name: "Achchiq-Chuchuq Salati",
        price: 10000,
        image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        chef_name: "Lola Opa",
        portions_left: 20,
        category: "salat"
    }
];

function useFallbackFoods() {
    allFoodsData = fallbackFoods;
    renderFoods();
}

async function fetchFoodsFromSupabase() {
    if (!supabaseClient) {
        console.warn("Supabase client not initialized. Using fallback foods.");
        useFallbackFoods();
        return;
    }
    try {
        const { data: foods, error } = await supabaseClient
            .from('foods')
            .select('*');

        if (error) throw error;

        if (foods && foods.length > 0) {
            allFoodsData = foods;
            renderFoods();
        } else {
            useFallbackFoods();
        }
    } catch (err) {
        console.error("Taomlarni yuklashda xatolik:", err.message);
        useFallbackFoods();
    }
}

function renderFoods() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    const filtered = allFoodsData.filter(food => {
        if (currentFilter === 'all') return true;
        const cat = food.category ? food.category.toLowerCase() : '';
        if (currentFilter === 'suyuq') {
            return cat === 'shurva' || cat === 'sho\'rvalar' || cat === 'suyuq' || cat === 'suyuq taomlar';
        }
        if (currentFilter === 'quyuq') {
            return cat === 'osh' || cat === 'manti' || cat === 'asosiy taomlar' || cat === 'kabablar' || cat === 'quyuq' || cat === 'quyuq taomlar';
        }
        if (currentFilter === 'somsa-non') {
            return cat === 'somsa' || cat === 'shirinlik' || cat === 'desertlar' || cat === 'non' || cat === 'somsa-non' || cat === 'pitsalar' || cat === 'fastfud' || cat === 'ichimliklar';
        }
        if (currentFilter === 'salatlar') {
            return cat === 'salat' || cat === 'salatlar';
        }
        return false;
    });

    filtered.forEach((food, index) => {
        const name        = food.name || "Noma'lum taom";
        const price       = new Intl.NumberFormat('ru-RU').format(food.price) + ' UZS';
        const image       = food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
        const chef        = food.chef_name || 'Oshpaz';
        const badgeHTML   = (food.portions_left < 5) ? '<span class="badge">Tez tugaydi</span>' : '';
        const hiddenClass = (index >= INITIAL_ITEMS && !isFoodsExpanded) ? 'hidden' : 'show';

        let categoryGroup = 'all';
        const cat = food.category ? food.category.toLowerCase() : '';
        if (cat === 'shurva' || cat === 'sho\'rvalar' || cat === 'suyuq' || cat === 'suyuq taomlar') {
            categoryGroup = 'suyuq';
        } else if (cat === 'osh' || cat === 'manti' || cat === 'asosiy taomlar' || cat === 'kabablar' || cat === 'quyuq' || cat === 'quyuq taomlar') {
            categoryGroup = 'quyuq';
        } else if (cat === 'somsa' || cat === 'shirinlik' || cat === 'desertlar' || cat === 'non' || cat === 'somsa-non' || cat === 'pitsalar' || cat === 'fastfud' || cat === 'ichimliklar') {
            categoryGroup = 'somsa-non';
        } else if (cat === 'salat' || cat === 'salatlar') {
            categoryGroup = 'salatlar';
        }

        const html = `
            <div class="food-card ${hiddenClass}" data-category="${categoryGroup}" onclick="window.location.href='food.detalis.html'" style="cursor: pointer;">
                <div class="card-image">
                    ${badgeHTML}
                    <img src="${image}" alt="${name}">
                    <span class="price">${price}</span>
                </div>
                <div class="card-content">
                    <h3>${name}</h3>
                    <p>Yangi va mazali uy taomi.</p>
                    <div class="card-footer">
                        <div class="chef">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(chef)}&background=random" alt="${chef}">
                            ${chef}
                        </div>
                        <button class="cart-btn" aria-label="Savatchaga qo'shish">🛒</button>
                    </div>
                </div>
            </div>
        `;
        menuGrid.insertAdjacentHTML('beforeend', html);
    });

    updateSeeMoreButton(filtered.length);
    initCartButtons();
}

function updateSeeMoreButton(filteredLength) {
    const btn = document.getElementById('see-more-btn');
    if (!btn) return;
    btn.style.display = filteredLength <= INITIAL_ITEMS ? 'none' : 'inline-flex';
    const btnText = btn.querySelector('.btn-text');
    const btnArrow = btn.querySelector('.btn-arrow');
    if (isFoodsExpanded) {
        if (btnText) btnText.textContent = "Kamroq ko'rish";
        if (btnArrow) btnArrow.style.transform = "rotate(180deg)";
    } else {
        if (btnText) btnText.textContent = "Ko'proq ko'rish";
        if (btnArrow) btnArrow.style.transform = "none";
    }
}


// ==========================================
// 5. CART BUTTONS
// ==========================================
function initCartButtons() {
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            btn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                alert("Taom savatchaga qo'shildi! 🛒");
            }, 100);
        };
    });
}


// ==========================================
// 6. CALCULATOR
// ==========================================
function initCalculator() {
    const slider     = document.getElementById('order-slider');
    const ordersDisp = document.getElementById('current-orders');
    const resultDisp = document.getElementById('result-display');
    const PROFIT     = 11333.333;

    function fmt(n) { return new Intl.NumberFormat('ru-RU').format(n); }

    function update() {
        if (!slider || !ordersDisp || !resultDisp) return;
        const val = parseInt(slider.value);
        ordersDisp.textContent = `${val} ta`;
        resultDisp.textContent = `${fmt(Math.round(val * 30 * PROFIT))} UZS+`;
        resultDisp.style.transform = 'scale(1.05)';
        setTimeout(() => { resultDisp.style.transform = 'scale(1)'; }, 100);
    }

    if (slider) {
        slider.addEventListener('input', update);
        update();
    }
}


// ==========================================
// 7. MOBILE NAV
// ==========================================
function initMobileNav() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const target = item.getAttribute('data-target');
            if (target === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

            const map = {
                menu:       '.menu-section',
                calculator: '.calculator-card',
                location:   '.location-section',
            };

            const el = document.querySelector(map[target]);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}


// ==========================================
// 8. SUBSCRIBE FORM
// ==========================================
function initSubscribeForm() {
    const form = document.querySelector('.subscribe-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn   = form.querySelector('.sub-btn');

        if (input && input.value.trim()) {
            btn.innerHTML = '✓';
            btn.style.background = '#2E7D32';
            alert(`Rahmat! Yangiliklar ${input.value} ga yuboriladi. 🚀`);
            input.value = '';
            input.disabled = true;
        }
    });
}


// ==========================================
// 9. SOCIAL BUTTONS
// ==========================================
function initSocialButtons() {
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'translateY(-2px) scale(0.9)';
            setTimeout(() => { btn.style.transform = ''; }, 150);
        });
    });
}


// ==========================================
// 10. LOADER
// ==========================================
function initLoader() {
    const hideLoader = () => {
        const loader = document.getElementById('site-loader');
        if (!loader) return;
        if (loader.dataset.animated) return;
        loader.dataset.animated = 'true';
        
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            document.body.classList.remove('loader-active');
        }, 1500); // 1.5s is ideal for transition after DOM is ready
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideLoader);
    } else {
        hideLoader();
    }
    
    // Safety net fallback
    window.addEventListener('load', hideLoader);
}


// ==========================================
// 11. SCROLL ANIMATIONS (IntersectionObserver)
// ==========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in, .scale-in');

    if (!('IntersectionObserver' in window)) {
        // Fallback: show everything immediately
        animatedElements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}


// ==========================================
// 12. HEADER SCROLL EFFECT (Glassmorphism)
// ==========================================
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 60;

    function onScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    // Use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    // Check initial state
    onScroll();
}


// ==========================================
// 13. 3D TILT EFFECT ON FOOD CARDS
// ==========================================
function initTiltEffect() {
    const cards = document.querySelectorAll('.food-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}


// ==========================================
// 14. MOBILE SIDEBAR MENU
// ==========================================
function initMobileSidebarMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    const navLinks = menu ? menu.querySelectorAll('.nav-link') : [];

    if (!toggleBtn || !menu || !overlay) return;

    function toggleMenu() {
        const isOpen = menu.classList.toggle('active');
        toggleBtn.classList.toggle('active', isOpen);
        overlay.classList.toggle('active', isOpen);
        document.body.classList.toggle('mobile-menu-active', isOpen);
    }

    function closeMenu() {
        menu.classList.remove('active');
        toggleBtn.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-active');
    }

    toggleBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}


// ==========================================
// 15. MAIN — DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Ma'lumotlar
    fetchChefsFromSupabase();
    fetchFoodsFromSupabase();

    // Countdown
    initCountdown();

    // Filtr tugmalari
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter') || 'all';
            isFoodsExpanded = false;
            renderFoods();
            // Re-init tilt for new cards
            setTimeout(initTiltEffect, 100);
        });
    });

    // Ko'proq / Kamroq ko'rish
    const seeMoreBtn = document.getElementById('see-more-btn');
    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            isFoodsExpanded = !isFoodsExpanded;
            if (!isFoodsExpanded) {
                document.querySelector('.menu-section')?.scrollIntoView({ behavior: 'smooth' });
            }
            renderFoods();
            setTimeout(initTiltEffect, 100);
        });
    }

    // Qolgan modullar
    initCalculator();
    initMobileNav();
    initSubscribeForm();
    initSocialButtons();
    initMobileSidebarMenu();

    // Yangi dizayn modullari
    initScrollAnimations();
    initHeaderScroll();

    // Auth-state header initialization
    initHeaderAuth();
    initProfileDropdown();

    // Tilt effect — init after chefs/foods load
    setTimeout(initTiltEffect, 500);
});

// Re-init tilt when chefs render (since they're async)
const originalRenderChefs = renderChefs;
renderChefs = function(chefsList) {
    originalRenderChefs(chefsList);
    // Re-observe new elements for scroll animation
    initScrollAnimations();
};

const originalRenderFoods = renderFoods;
renderFoods = function() {
    originalRenderFoods();
    setTimeout(initTiltEffect, 100);
};

// ==========================================
// 16. HEADER AUTHENTICATION STATUS HANDLE
// ==========================================
async function initHeaderAuth() {
    if (!supabaseClient) {
        // Safe fallback if supabase is offline
        updateHeaderUI(null);
        return;
    }
    
    // Check current session
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateHeaderUI(session ? session.user : null);
        
        // Listen for changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            updateHeaderUI(session ? session.user : null);
        });
    } catch (e) {
        console.error("Error checking auth status:", e);
        updateHeaderUI(null);
    }
}

function updateHeaderUI(user) {
    const loginBtn = document.getElementById('header-login-btn');
    const profileBtn = document.getElementById('header-profile-btn');
    const orderBtn = document.getElementById('header-order-btn');
    
    const mobileLoginItem = document.getElementById('mobile-login-item');
    const mobileProfileItem = document.getElementById('mobile-profile-item');
    const mobileOrderItem = document.getElementById('mobile-order-item');
    
    if (user) {
        // User logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-flex';
        if (orderBtn) orderBtn.style.display = 'inline-block';
        
        if (mobileLoginItem) mobileLoginItem.style.display = 'none';
        if (mobileProfileItem) mobileProfileItem.style.display = 'block';
        if (mobileOrderItem) mobileOrderItem.style.display = 'block';

        // Update user profile info inside dropdown
        const email = user.email || '';
        const emailEl = document.getElementById('dropdown-user-email');
        if (emailEl) emailEl.innerText = email;

        const name = user.user_metadata?.full_name || 'Foydalanuvchi';
        const nameEl = document.getElementById('dropdown-user-name');
        if (nameEl) nameEl.innerText = name;
        const profileNameEl = document.getElementById('header-profile-name');
        if (profileNameEl) profileNameEl.innerText = name;

        if (supabaseClient) {
            supabaseClient.from('profiles').select('full_name, role, avatar_url').eq('id', user.id).single()
                .then(({ data: profile }) => {
                    if (profile) {
                        const fullName = profile.full_name || name;
                        if (nameEl) nameEl.innerText = fullName;
                        if (profileNameEl) profileNameEl.innerText = fullName;
                        
                        if (profile.avatar_url) {
                            const avatarImg = document.getElementById('dropdown-avatar-img');
                            if (avatarImg) avatarImg.src = profile.avatar_url;
                        }
                        
                        const chefLink = document.getElementById('dropdown-chef-dashboard-link');
                        const profileSettingsLink = document.getElementById('dropdown-profile-settings-link');
                        if (chefLink) {
                            chefLink.style.display = (profile.role === 'oshpaz') ? 'block' : 'none';
                        }
                        if (profileSettingsLink) {
                            profileSettingsLink.href = (profile.role === 'oshpaz') ? 'profil.html' : 'kirish.html';
                        }
                    }
                }).catch(err => console.error("Error fetching header user profile details:", err));
        }
    } else {
        // User logged out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (orderBtn) orderBtn.style.display = 'none';
        
        if (mobileLoginItem) mobileLoginItem.style.display = 'block';
        if (mobileProfileItem) mobileProfileItem.style.display = 'none';
        if (mobileOrderItem) mobileOrderItem.style.display = 'none';
    }
}

// ==========================================
// 17. PROFILE DROPDOWN INTERACTION
// ==========================================
function initProfileDropdown() {
    const trigger = document.getElementById('profileTriggerBtn');
    const menu = document.getElementById('profileDropdownMenu');
    const logoutBtn = document.getElementById('dropdownLogoutBtn');

    if (!trigger || !menu) return;

    // Toggle dropdown on click
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = menu.classList.contains('active');
        if (isActive) {
            menu.classList.remove('active');
            trigger.classList.remove('active');
        } else {
            menu.classList.add('active');
            trigger.classList.add('active');
        }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
            menu.classList.remove('active');
            trigger.classList.remove('active');
        }
    });

    // Handle logout click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (supabaseClient) {
                try {
                    const { error } = await supabaseClient.auth.signOut();
                    if (error) throw error;
                    // Reload the page on sign out
                    window.location.reload();
                } catch (err) {
                    console.error("Sign out error:", err);
                    alert("Tizimdan chiqishda xatolik yuz berdi.");
                }
            }
        });
    }
}
