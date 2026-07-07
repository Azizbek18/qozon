// Qozon - Taom tafsilotlari (Food Details) Javascript kodlari
let baseFoodPrice = 28000;
let currentUnitPrice = 28000;
let mainCount = 1;
let foodNameText = "Fergana uslubida osh";
let foodImageUrl = "./image copy 2.png";
let foodChefName = "Xurmo opa";
const FOOD_PLACEHOLDER_IMAGE = './Traditional Uzbek Plov (1).svg';
const FOOD_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=800&h=520&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&h=520&q=80',
  'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&h=520&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&h=520&q=80',
  'https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=800&h=520&q=80'
];

function getFoodFallbackImage(name = '', category = '', index = 0) {
  const key = `${name} ${category}`.toLowerCase();
  if (key.includes('osh') || key.includes('palov') || key.includes('plov')) return FOOD_PLACEHOLDER_IMAGE;
  if (key.includes('somsa')) return FOOD_FALLBACK_IMAGES[0];
  if (key.includes('manti')) return FOOD_FALLBACK_IMAGES[2];
  if (key.includes('shurva') || key.includes("sho'rva")) return FOOD_FALLBACK_IMAGES[1];
  if (key.includes('shirin')) return FOOD_FALLBACK_IMAGES[4];
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

// Extract food ID from URL
const urlParams = new URLSearchParams(window.location.search);
const foodId = parseInt(urlParams.get('id')) || 20;

// Add-on price constants
const ingredientsPrices = {
  rice: 5000,
  meat: 15000,
  carrot: 2000,
  cumin: 1000
};

const ingredientsNames = {
  rice: "Devzira guruch",
  meat: "Qo'y go'shti",
  carrot: "Sariq sabzi",
  cumin: "Zira"
};

// Reviews — public.reviews jadvalidan yuklanadi (loadReviewsForFood orqali)
let reviewsDataList = [];
const REVIEW_AVATAR_COLORS = [
    { bg: "#ffe3e3", color: "#c92c36" },
    { bg: "#e3f2fd", color: "#1e88e5" },
    { bg: "#e8f5e9", color: "#43a047" },
    { bg: "#fff3e0", color: "#e65100" },
    { bg: "#f3e5f5", color: "#8e24aa" }
];

function timeAgoUz(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return mins <= 1 ? "hozirgina" : `${mins} daqiqa avval`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} soat avval`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "kecha";
    if (days < 7) return `${days} kun avval`;
    return new Date(dateStr).toLocaleDateString('uz');
}

async function loadReviewsForFood(client, targetFoodId) {
    try {
        const { data: reviews, error } = await client
            .from('reviews')
            .select('user_id, rating, comment, photo_url, created_at')
            .eq('food_id', targetFoodId)
            .order('created_at', { ascending: false });
        if (error || !reviews) return;

        const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
        let profilesById = {};
        if (userIds.length) {
            const { data: profiles } = await client.from('profiles').select('id, full_name').in('id', userIds);
            (profiles || []).forEach(p => { profilesById[p.id] = p.full_name; });
        }

        reviewsDataList = reviews.map((r, index) => {
            const name = profilesById[r.user_id] || 'Foydalanuvchi';
            const palette = REVIEW_AVATAR_COLORS[index % REVIEW_AVATAR_COLORS.length];
            return {
                author: name,
                avatar: name.charAt(0).toUpperCase(),
                avatarBg: palette.bg,
                avatarColor: palette.color,
                stars: '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating),
                rating: r.rating,
                time: timeAgoUz(r.created_at),
                text: r.comment || '',
                hasPhoto: !!r.photo_url
            };
        });

        const activeTab = document.querySelector('.review-tab.active');
        renderReviews(activeTab ? activeTab.textContent.trim() : 'Barchasi');
    } catch (e) {
        console.error('Sharhlarni yuklashda xatolik:', e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elementlari
  const minusBtn = document.querySelector(".minus-btn");
  const plusBtn = document.querySelector(".plus-btn");
  const counterValue = document.querySelector(".counter-value");
  const calculatedSum = document.querySelector(".calculated-sum");
  const mainCartActionBtn = document.getElementById("main-cart-action-btn");
  const clickableTags = document.querySelectorAll(".tag.clickable");

  // Load reviews list initially
  renderReviews("Barchasi");

  // Initialize Leaflet Live Map
  initLiveMap();

  // --- YAQINDA KO'RILGAN (Recently Viewed) SAQLASH ---
  // Sahifa ochilganda bu taomni recently_viewed ga qo'shish
  setTimeout(() => {
    try {
      let recent = JSON.parse(localStorage.getItem('qz_recently_viewed') || '[]');
      // Dublikatni olib tashlab, boshiga qo'shish
      recent = recent.filter(item => String(item.id) !== String(foodId));
      recent.unshift({
        id: foodId,
        name: foodNameText,
        image: foodImageUrl,
        chef: foodChefName,
        price: currentUnitPrice
      });
      // Max 10 ta
      recent = recent.slice(0, 10);
      localStorage.setItem('qz_recently_viewed', JSON.stringify(recent));
    } catch(e) {}
  }, 1500); // 1.5 soniyadan keyin (Supabase data yuklanib bo'lsin)

  // --- SEVIMLILARGA QO'SHISH (Food Detail Page) ---
  // Sahifa ochilganda yurak tugmasini to'g'ri holatda ko'rsatish
  setTimeout(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('qz_favorites') || '[]').map(String);
      const isFav = favs.includes(String(foodId));
      const outline = document.getElementById('favIconOutline');
      const filled  = document.getElementById('favIconFilled');
      const btn     = document.getElementById('favToggleBtn');
      if (outline && filled) {
        outline.style.display = isFav ? 'none' : 'block';
        filled.style.display  = isFav ? 'block' : 'none';
      }
      if (btn) btn.style.color = isFav ? '#e63946' : '';
    } catch(e) {}
  }, 500);

  // Format clickable tags with prices
  clickableTags.forEach(tag => {
      const key = tag.getAttribute('data-ing');
      const price = ingredientsPrices[key];
      if (price) {
          tag.textContent = `${tag.textContent} (+${new Intl.NumberFormat('ru-RU').format(price)} so'm)`;
      }
      
      // Tap toggle handler for ingredient customization
      tag.addEventListener("click", () => {
          tag.classList.toggle("active");
          updateCustomPrices();
      });
  });

  // Calculate customized unit price & total
  function updateCustomPrices() {
      const activeTags = document.querySelectorAll('.tag.clickable.active');
      let addonsSum = 0;
      activeTags.forEach(t => {
          addonsSum += ingredientsPrices[t.getAttribute('data-ing')];
      });
      
      currentUnitPrice = baseFoodPrice + addonsSum;
      
      // Update display price header
      const priceEl = document.getElementById('foodPrice');
      if (priceEl) priceEl.textContent = new Intl.NumberFormat('ru-RU').format(currentUnitPrice) + " so'm";
      
      // Sync quantity and checkout state
      syncCartState();
  }

  // Dynamic state sync function
  window.syncCartState = function() {
    let cartItems = [];
    try {
      cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
    } catch(e) {
      cartItems = [];
    }

    // Get current option combination unique ID
    const activeTags = document.querySelectorAll('.tag.clickable.active');
    const uniqueCartId = foodId + "_" + Array.from(activeTags).map(t => t.getAttribute('data-ing')).sort().join('_');

    const existing = cartItems.find(item => item.id === uniqueCartId);
    const buyBtnTextSpan = mainCartActionBtn ? mainCartActionBtn.querySelector(".buy-btn-text span") : null;
    const buyBtnIconSpan = mainCartActionBtn ? mainCartActionBtn.querySelector(".buy-btn-icon") : null;

    if (existing) {
      mainCount = existing.quantity;
      if (counterValue) counterValue.innerText = mainCount;
      if (buyBtnTextSpan) buyBtnTextSpan.textContent = window.innerWidth <= 480 ? "Buyurtma" : "Buyurtma berish";
      if (buyBtnIconSpan) buyBtnIconSpan.textContent = "⚡";
      if (mainCartActionBtn) {
        mainCartActionBtn.classList.add("view-cart-mode");
      }
    } else {
      if (counterValue) counterValue.innerText = mainCount;
      if (buyBtnTextSpan) buyBtnTextSpan.textContent = window.innerWidth <= 480 ? "Savatga" : "Savatga qo'shish";
      if (buyBtnIconSpan) buyBtnIconSpan.textContent = "🛍️";
      if (mainCartActionBtn) {
        mainCartActionBtn.classList.remove("view-cart-mode");
      }
    }

    if (calculatedSum) {
      const sum = currentUnitPrice * mainCount;
      calculatedSum.innerText = new Intl.NumberFormat('ru-RU').format(sum) + " so'm";
    }
  }

  // Porsiya hisoblagichlari click mantiqi
  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      if (mainCount < 10) {
        mainCount++;
        
        let cartItems = [];
        try {
          cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
        } catch(e) {}
        
        const activeTags = document.querySelectorAll('.tag.clickable.active');
        const uniqueCartId = foodId + "_" + Array.from(activeTags).map(t => t.getAttribute('data-ing')).sort().join('_');

        const existing = cartItems.find(item => item.id === uniqueCartId);
        if (existing) {
          existing.quantity = mainCount;
          localStorage.setItem('qz_cart', JSON.stringify(cartItems));
        }
        
        syncCartState();
      }
    });
  }

  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      let cartItems = [];
      try {
        cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
      } catch(e) {}

      const activeTags = document.querySelectorAll('.tag.clickable.active');
      const uniqueCartId = foodId + "_" + Array.from(activeTags).map(t => t.getAttribute('data-ing')).sort().join('_');

      if (mainCount > 1) {
        mainCount--;
        
        const existing = cartItems.find(item => item.id === uniqueCartId);
        if (existing) {
          existing.quantity = mainCount;
          localStorage.setItem('qz_cart', JSON.stringify(cartItems));
        }
        syncCartState();
      } else if (mainCount === 1) {
        // If they click minus on 1, remove item from cart!
        const filtered = cartItems.filter(item => item.id !== uniqueCartId);
        localStorage.setItem('qz_cart', JSON.stringify(filtered));
        mainCount = 1;
        syncCartState();
        triggerIphoneToast("Savatdan olindi", "Taom savatchangizdan olib tashlandi.", foodImageUrl);
      }
    });
  }

  // ASOSIY AKSIYA TUGMASI (Savatga solish / Buyurtma berish)
  if (mainCartActionBtn) {
    mainCartActionBtn.addEventListener("click", async () => {
      let cartItems = [];
      try {
        cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
      } catch(e) {}
      
      const activeTags = document.querySelectorAll('.tag.clickable.active');
      const uniqueCartId = foodId + "_" + Array.from(activeTags).map(t => t.getAttribute('data-ing')).sort().join('_');
      
      const existing = cartItems.find(item => item.id === uniqueCartId);
      
      if (existing) {
        window.location.href = "chekout.html";
      } else {
        // Build customizable option text
        const selectedAddonNames = [];
        activeTags.forEach(t => {
            selectedAddonNames.push(ingredientsNames[t.getAttribute('data-ing')]);
        });
        
        let finalItemName = foodNameText;
        if (selectedAddonNames.length > 0) {
            finalItemName += " (" + selectedAddonNames.map(n => "+" + n).join(', ') + ")";
        }

        // Savatga qo'shish
        cartItems.push({
          id: uniqueCartId,
          foodId: foodId,
          name: finalItemName,
          price: currentUnitPrice,
          image: foodImageUrl,
          chef: foodChefName,
          quantity: mainCount
        });
        localStorage.setItem('qz_cart', JSON.stringify(cartItems));

        // Tugma animatsiyasi
        const buyBtnTextSpan = mainCartActionBtn.querySelector(".buy-btn-text span");
        if (buyBtnTextSpan) {
          buyBtnTextSpan.textContent = "✓ Qo'shildi";
          mainCartActionBtn.style.backgroundColor = "#e63946";
          setTimeout(() => {
            mainCartActionBtn.style.backgroundColor = "";
            syncCartState();
          }, 1000);
        } else {
          syncCartState();
        }
        triggerIphoneToast("Savatga qo'shildi", `${finalItemName} savatga muvaffaqiyatli qo'shildi.`, foodImageUrl);
      }
    });
  }

  // TOAST LOGIKASI
  window.triggerIphoneToast = function(title, text, imageSrc) {
    let container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.classList.add("custom-toast");

    toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-avatar-wrapper">
                    <img src="${imageSrc}" class="toast-dynamic-img" alt="toast-img">
                </div>
                <div class="toast-details">
                    <h5>${title}</h5>
                    <p class="toast-desc">${text}</p>
                </div>
            </div>
            <div class="toast-progress"></div>
        `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => {
        toast.remove();
      });
    }, 2500);
  }
});

// ==========================================
// EXTRACTED FROM food.detalis.html
// ========================================== 
window.changeTheme = function(theme, btnElement) {
    document.body.className = '';
    document.body.classList.add('theme-' + theme);

    const options = document.querySelectorAll('.embed-opt');
    options.forEach(opt => opt.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const slider = document.querySelector('.embedded-slider');
    if (slider) {
        if (theme === 'light') {
            slider.style.left = '4px';
        } else if (theme === 'dark') {
            slider.style.left = '36px';
        }
    }
}

// ==========================================
// REVIEWS DYNAMIC RENDERER
// ==========================================
window.renderReviews = function(tabName = "Barchasi") {
    const listContainer = document.getElementById("reviewsList");
    if (!listContainer) return;
    
    let filtered = reviewsDataList;
    if (tabName === "Foto bilan") {
        filtered = reviewsDataList.filter(r => r.hasPhoto);
    } else if (tabName === "5 ★") {
        filtered = reviewsDataList.filter(r => r.rating === 5);
    }

    if (!filtered.length) {
        listContainer.innerHTML = `<p style="padding:16px 0;color:var(--text-light,#8b7355);font-size:13px">Hozircha sharhlar yo'q.</p>`;
        return;
    }

    let html = '';
    filtered.forEach(r => {
        html += `
            <div class="review-card" style="opacity: 0; transform: translateY(10px); transition: all 0.3s ease;">
                <div class="review-card-header">
                    <div class="review-user-avatar" style="background: ${r.avatarBg}; color: ${r.avatarColor};">${r.avatar}</div>
                    <div class="review-user-info">
                        <h5 class="review-user-name">${r.author}</h5>
                        <span class="review-time">${r.time}</span>
                    </div>
                    <div class="review-stars">${r.stars}</div>
                </div>
                <p class="review-text">${r.text}</p>
            </div>
        `;
    });
    listContainer.innerHTML = html;
    
    // Trigger smooth fade-in animation
    setTimeout(() => {
        const cards = listContainer.querySelectorAll('.review-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 80);
        });
    }, 50);
}

// ==========================================
// LEAFLET REAL LIVE MAP INITIALIZER
// ==========================================
window.initLiveMap = function() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Coordinates representing Yunusobod Tashkent
    const chefCoords = [41.3638, 69.2882];
    const userCoords = [41.3605, 69.2930]; // ~450m away

    // Center map between locations
    const midpoint = [
        (chefCoords[0] + userCoords[0]) / 2,
        (chefCoords[1] + userCoords[1]) / 2
    ];

    try {
        const map = L.map('map', {
            zoomControl: false,
            dragging: !L.Browser.mobile,
            tap: !L.Browser.mobile
        }).setView(midpoint, 15);

        // Add zoom buttons top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Voyager Premium CartoDB Tile Layer (highly polished clean tiles)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 20
        }).addTo(map);

        // Custom pulsing chef marker
        const chefIcon = L.divIcon({
            className: 'map-custom-marker chef-marker',
            html: `
                <div class="marker-pulse-wrapper">
                    <div class="marker-pulse"></div>
                    <span class="marker-emoji">🧑‍🍳</span>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        // Custom user home marker
        const userIcon = L.divIcon({
            className: 'map-custom-marker user-marker',
            html: `<span class="marker-emoji">🏠</span>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        L.marker(chefCoords, { icon: chefIcon }).addTo(map)
            .bindPopup("<b>Oshpaz oshxonasi</b><br>Shu yerdan taom yangi pishib chiqadi.")
            .openPopup();

        L.marker(userCoords, { icon: userIcon }).addTo(map)
            .bindPopup("<b>Sizning manzilingiz</b>");

        // Routing path line
        L.polyline([chefCoords, userCoords], {
            color: '#ff4757',
            weight: 3,
            dashArray: '5, 8',
            opacity: 0.8
        }).addTo(map);

    } catch (e) {
        console.error("Leaflet initialization failed:", e);
    }
}

// ==========================================
// SUPABASE DYNAMIC LOADER FOR FOOD DETAILS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Review tab switching
    document.querySelectorAll('.review-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderReviews(tab.textContent.trim());
        });
    });

    // Bookmark toggle with persistent storage integration
    const bookmarkBtn = document.querySelector('.bookmark-icon');
    if (bookmarkBtn) {
        let favorites = [];
        try {
            favorites = JSON.parse(localStorage.getItem('qz_favorites') || '[]');
        } catch(e) {}
        
        let isBookmarked = favorites.includes(foodId);
        if (isBookmarked) {
            bookmarkBtn.classList.add('active');
        } else {
            bookmarkBtn.classList.remove('active');
        }
        
        bookmarkBtn.addEventListener('click', () => {
            favorites = [];
            try {
                favorites = JSON.parse(localStorage.getItem('qz_favorites') || '[]');
            } catch(e) {}
            isBookmarked = favorites.includes(foodId);
            
            if (isBookmarked) {
                favorites = favorites.filter(id => id !== foodId);
                bookmarkBtn.classList.remove('active');
                triggerIphoneToast("Sevimlilardan olindi", "Taom sevimlilar ro'yxatidan o'chirildi.", foodImageUrl);
            } else {
                favorites.push(foodId);
                bookmarkBtn.classList.add('active');
                triggerIphoneToast("Sevimlilarga qo'shildi", "Taom sevimlilar ro'yxatiga qo'shildi.", foodImageUrl);
            }
            localStorage.setItem('qz_favorites', JSON.stringify(favorites));
            
            bookmarkBtn.style.transform = 'scale(1.2)';
            setTimeout(() => { bookmarkBtn.style.transform = ''; }, 200);
        });
    }

    // Dynamic loading from Supabase
    if (typeof supabase !== 'undefined') {
        const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
        
        try {
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            // 0. Fetch real reviews for this food (reviews table)
            loadReviewsForFood(client, foodId);

            // 1. Fetch Food details
            client.from('foods').select('*').eq('id', foodId).single().then(({ data: food, error }) => {
                if (error) throw error;
                if (food) {
                    baseFoodPrice = food.price;
                    currentUnitPrice = food.price;
                    foodNameText = food.name;
                    foodImageUrl = food.image_url || food.image || getFoodFallbackImage(food.name, food.category, foodId);
                    foodChefName = food.chef_name || "Oshpaz";

                    // Update document title
                    document.title = `Qozon — ${food.name}`;

                    // Update food name
                    const nameEl = document.getElementById('foodName');
                    if (nameEl) nameEl.textContent = food.name;

                    // Update portions badge
                    const portionsEl = document.getElementById('foodPortions');
                    if (portionsEl) portionsEl.textContent = `🔥 ${food.portions_left || 5} ta qoldi`;

                    // Update main food image
                    const imgEl = document.getElementById('foodImage');
                    if (imgEl) {
                        imgEl.onerror = () => setFoodImageFallback(imgEl, food.name, food.category, foodId);
                        imgEl.src = foodImageUrl;
                        imgEl.alt = food.name;
                    }

                    // Update rating and reviews
                    const ratingEl = document.getElementById('foodRating');
                    if (ratingEl) ratingEl.textContent = `⭐ ${food.rating || '4.9'}`;

                    const reviewsEl = document.getElementById('foodReviews');
                    if (reviewsEl) reviewsEl.textContent = `(${food.reviews_count || 120}+ baho)`;

                    // Update prices
                    const priceEl = document.getElementById('foodPrice');
                    if (priceEl) priceEl.textContent = new Intl.NumberFormat('ru-RU').format(food.price) + " so'm";

                    const oldPriceEl = document.getElementById('foodOldPrice');
                    if (oldPriceEl) oldPriceEl.textContent = new Intl.NumberFormat('ru-RU').format(Math.floor(food.price * 1.25)) + " so'm";

                    // Load/Sync the cart state
                    if (typeof syncCartState === 'function') {
                        let cartItems = [];
                        try {
                            cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
                        } catch(e) {}
                        
                        const activeTags = document.querySelectorAll('.tag.clickable.active');
                        const uniqueCartId = foodId + "_" + Array.from(activeTags).map(t => t.getAttribute('data-ing')).sort().join('_');
                        
                        const existing = cartItems.find(item => item.id === uniqueCartId);
                        if (existing) {
                            mainCount = existing.quantity;
                        } else {
                            mainCount = 1;
                        }
                        
                        syncCartState();
                    }

                    // 2. Fetch Chef details
                    client.from('chefs').select('*').eq('full_name', food.chef_name).single().then(({ data: chef, error: chefError }) => {
                        if (chefError) throw chefError;
                        if (chef) {
                            // Update Chef details
                            const chefNameEl = document.getElementById('chefName');
                            if (chefNameEl) chefNameEl.textContent = chef.full_name;

                            const chefAvatarEl = document.getElementById('chefAvatar');
                            if (chefAvatarEl) chefAvatarEl.src = chef.avatar_url || 'Cook Xurmo opa.svg';

                            const chefAddressEl = document.getElementById('chefAddress');
                            if (chefAddressEl && chef.address) {
                                chefAddressEl.textContent = chef.address;
                            }

                            const chefCard = document.getElementById('chefCard');
                            if (chefCard) {
                                chefCard.onclick = () => {
                                    window.location.href = `xurmoOpa.html?id=${chef.id}`;
                                };
                            }
                        }
                    }).catch(err => {
                        console.error("Error fetching chef:", err);
                        const chefCard = document.getElementById('chefCard');
                        if (chefCard) {
                            chefCard.onclick = () => {
                                window.location.href = 'xurmoOpa.html';
                            };
                        }
                    });
                }
            }).catch(err => {
                console.error("Error fetching food:", err);
            });

        } catch (e) {
            console.error("Supabase client init error:", e);
        }
    }
});

// ==========================================
// SEVIMLILARGA QO'SHISH — Food Detail Page
// ==========================================
window.toggleDetailFav = function() {
    try {
        let favs = JSON.parse(localStorage.getItem('qz_favorites') || '[]').map(String);
        const id = String(foodId);
        const isFav = favs.includes(id);

        const outline = document.getElementById('favIconOutline');
        const filled  = document.getElementById('favIconFilled');
        const btn     = document.getElementById('favToggleBtn');

        if (isFav) {
            // Sevimlilardan olib tashlash
            favs = favs.filter(f => f !== id);
            if (outline) outline.style.display = 'block';
            if (filled)  filled.style.display  = 'none';
            if (btn)     btn.style.color = '';
            triggerIphoneToast('Olib tashlandi', "Sevimlilar ro'yxatidan olib tashlandi", foodImageUrl);
        } else {
            // Sevimlilarga qo'shish
            favs.push(id);
            if (outline) outline.style.display = 'none';
            if (filled)  filled.style.display  = 'block';
            if (btn) {
                btn.style.color = '#e63946';
                btn.style.transform = 'scale(1.25)';
                setTimeout(() => { btn.style.transform = ''; }, 200);
            }
            triggerIphoneToast("Sevimlilarga qo'shildi", '❤️ Bu taom sevimlilarga saqlandi!', foodImageUrl);
        }

        localStorage.setItem('qz_favorites', JSON.stringify(favs));
    } catch(e) {
        console.error('toggleDetailFav error:', e);
    }
};
