/* ==========================================
   QOZON — SEVIMLILAR JS
   ========================================== */

const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

/* ---------- TABS ---------- */
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
});

/* ---------- FAVORITES HELPERS ---------- */
function getFavoriteIds() {
    try { return JSON.parse(localStorage.getItem('qz_favorites') || '[]').map(String); }
    catch(e) { return []; }
}
function saveFavoriteIds(ids) {
    localStorage.setItem('qz_favorites', JSON.stringify(ids));
}

/* ---------- FOOD CARD ---------- */
function createFoodCard(food) {
    const price    = new Intl.NumberFormat('ru-RU').format(food.price || 0);
    const rating   = food.rating ?? 4.9;
    const reviews  = food.reviews_count ?? 0;
    const portions = food.portions_left ?? 0;
    const imgUrl   = food.image_url || food.image
        || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
    const safeId   = String(food.id);
    const safeName = (food.name || '').replace(/'/g, "\\'");
    const safeChef = (food.chef_name || 'Oshpaz').replace(/'/g, "\\'");
    const safeImg  = imgUrl.replace(/'/g, "\\'");

    const card = document.createElement('div');
    card.className = 'food-card';
    card.innerHTML = `
        <div class="food-img-wrap" onclick="window.location.href='food.detalis.html?id=${safeId}'">
            <img src="${imgUrl}" alt="${food.name || ''}" onerror="this.src='./Traditional Uzbek Plov (1).svg'">
            <div class="portions-badge">${portions} porsiya qoldi</div>
            <button class="fav-remove-btn" title="Sevimlilardan olib tashlash"
                onclick="event.stopPropagation(); removeFavoriteCard(this, '${safeId}')">❤️</button>
        </div>
        <div class="food-info" onclick="window.location.href='food.detalis.html?id=${safeId}'">
            <div class="food-name">${food.name || ''}</div>
            ${food.chef_name ? `<div class="food-chef">👨‍🍳 ${food.chef_name}</div>` : ''}
            <div class="rating">
                <span class="star">★</span> ${rating}
                <span class="count">(${reviews})</span>
            </div>
            <div class="food-meta">
                <div class="food-price">${price} so'm</div>
                <button onclick="event.stopPropagation(); addToCartFromFav('${safeId}', '${safeName}', ${food.price || 0}, '${safeImg}', '${safeChef}')">
                    🛍️ Savatga
                </button>
            </div>
        </div>
    `;
    return card;
}

/* ---------- RECENTLY VIEWED CARD ---------- */
function createRecentCard(item) {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.onclick = () => { window.location.href = `food.detalis.html?id=${item.id}`; };
    const imgUrl = item.image || './Traditional Uzbek Plov (1).svg';
    const price  = new Intl.NumberFormat('ru-RU').format(item.price || 0);
    card.innerHTML = `
        <div class="food-img-wrap">
            <img src="${imgUrl}" alt="${item.name || ''}" onerror="this.src='./Traditional Uzbek Plov (1).svg'">
        </div>
        <div class="food-info">
            <div class="food-name">${item.name || ''}</div>
            ${item.chef ? `<div class="food-chef">👨‍🍳 ${item.chef}</div>` : ''}
            <div class="food-meta">
                <div class="food-price">${price} so'm</div>
            </div>
        </div>
    `;
    return card;
}

/* ---------- LOAD FAVORITE FOODS ---------- */
async function loadFavoriteFoods() {
    const panel  = document.getElementById('taomlar');
    const favIds = getFavoriteIds();

    if (favIds.length === 0) {
        panel.innerHTML = `
            <div class="state-msg" style="grid-column:1/-1; padding:52px 20px;">
                <div style="font-size:52px; margin-bottom:16px;">🤍</div>
                <h3 style="font-size:18px; font-weight:800; color:#2d1b0e; margin-bottom:8px;">Sevimli taomlar yo'q</h3>
                <p style="color:#8b7355; font-size:14px; margin-bottom:20px;">Taomlar sahifasida ❤️ tugmasini bosib saqlang</p>
                <a href="buyordashbord.html"
                   style="display:inline-block;padding:12px 28px;background:#e63946;color:#fff;border-radius:16px;font-weight:700;text-decoration:none;font-size:14px;box-shadow:0 3px 0 #9b1d20;">
                    Taomlarni ko'rish
                </a>
            </div>`;
        return;
    }

    /* Skeleton */
    panel.innerHTML = Array(Math.min(favIds.length, 4)).fill('').map(() => `
        <div class="skeleton-card">
            <div class="skeleton sk-img"></div>
            <div class="sk-lines">
                <div class="skeleton sk-line" style="width:65%"></div>
                <div class="skeleton sk-line" style="width:40%"></div>
                <div class="skeleton sk-line" style="width:55%"></div>
            </div>
        </div>`).join('');

    try {
        const idsParam = favIds.map(id => `id.eq.${id}`).join(',');
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/foods?or=(${idsParam})&select=*`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        panel.innerHTML = '';

        if (!res.ok) { renderOfflineMsg(panel, favIds.length); return; }

        const foods = await res.json();
        if (!foods.length) { renderOfflineMsg(panel, favIds.length); return; }

        foods.forEach(food => panel.appendChild(createFoodCard(food)));

        /* Eski/o'chirilgan ID larni tozalash */
        const foundIds = foods.map(f => String(f.id));
        if (foundIds.length !== favIds.length) saveFavoriteIds(foundIds);

    } catch(err) {
        console.error('Supabase error:', err);
        renderOfflineMsg(panel, favIds.length);
    }
}

function renderOfflineMsg(panel, count) {
    panel.innerHTML = `
        <div class="state-msg" style="grid-column:1/-1; padding:40px 20px;">
            <div style="font-size:40px; margin-bottom:12px;">📡</div>
            <p style="color:#8b7355; font-size:14px;">
                Internet ulanmagan. <strong>${count} ta</strong> sevimli taom saqlangan.
            </p>
            <a href="buyordashbord.html"
               style="display:inline-block;margin-top:16px;padding:10px 24px;background:#e63946;color:#fff;border-radius:14px;font-weight:700;text-decoration:none;font-size:13px;">
                Asosiy sahifa
            </a>
        </div>`;
}

/* ---------- LOAD RECENTLY VIEWED ---------- */
function loadRecentlyViewed() {
    const panel  = document.getElementById('yaqinda');
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('qz_recently_viewed') || '[]'); } catch(e) {}

    if (recent.length === 0) {
        panel.innerHTML = `
            <div class="state-msg" style="grid-column:1/-1; padding:52px 20px;">
                <div style="font-size:48px; margin-bottom:12px;">👀</div>
                <p style="color:#8b7355; font-size:14px;">Hali hech qanday taom ko'rilmagan</p>
            </div>`;
        return;
    }

    panel.innerHTML = '';
    recent.slice(0, 8).forEach(item => panel.appendChild(createRecentCard(item)));
}

/* ---------- REMOVE FROM FAVORITES ---------- */
window.removeFavoriteCard = function(btn, foodId) {
    const ids = getFavoriteIds().filter(id => id !== String(foodId));
    saveFavoriteIds(ids);

    const card = btn.closest('.food-card');
    if (card) {
        card.style.transition = 'all 0.28s ease';
        card.style.opacity    = '0';
        card.style.transform  = 'scale(0.88)';
        setTimeout(() => {
            card.remove();
            const panel = document.getElementById('taomlar');
            if (panel && panel.querySelectorAll('.food-card').length === 0) loadFavoriteFoods();
        }, 280);
    }
    showMiniToast('Sevimlilardan olib tashlandi');
};

/* ---------- ADD TO CART ---------- */
window.addToCartFromFav = function(foodId, name, price, image, chef) {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('qz_cart') || '[]'); } catch(e) {}
    const uid = String(foodId) + '_';
    const ex  = cart.find(i => i.id === uid);
    if (ex) { ex.quantity = (ex.quantity || 1) + 1; }
    else { cart.push({ id: uid, foodId, name, price, image, chef, quantity: 1 }); }
    localStorage.setItem('qz_cart', JSON.stringify(cart));
    showMiniToast('✅ Savatga qo\'shildi!');
};

/* ---------- MINI TOAST ---------- */
function showMiniToast(msg) {
    const old = document.getElementById('sevToast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'sevToast';
    t.textContent = msg;
    Object.assign(t.style, {
        position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)',
        background:'#2d1b0e', color:'#fff', padding:'12px 26px',
        borderRadius:'40px', fontSize:'13px', fontWeight:'700',
        zIndex:'9999', opacity:'0', transition:'opacity 0.22s ease',
        whiteSpace:'nowrap', pointerEvents:'none',
        boxShadow:'0 4px 20px rgba(45,27,14,0.25)'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 2200);
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    loadFavoriteFoods();
    loadRecentlyViewed();
    initChefFavorites();
    updateAllChefBadges();
    /* Oshpazlar tab fav tugmasi animatsiyasi */
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => { btn.style.transform = ''; }, 200);
        });
    });
});

/* ==========================================
   OSHPAZ SEVIMLILARI
   ========================================== */

/* localStorage helpers */
function getFavChefs() {
    try { return JSON.parse(localStorage.getItem('qz_fav_chefs') || '[]'); }
    catch(e) { return []; }
}
function saveFavChefs(arr) { localStorage.setItem('qz_fav_chefs', JSON.stringify(arr)); }

/* Fav food meta (chef name bilan saqlanadi) */
function getFavMeta() {
    try { return JSON.parse(localStorage.getItem('qz_fav_meta') || '{}'); }
    catch(e) { return {}; }
}

/* Bitta oshpazning sevimli taomlar sonini hisoblash */
function countChefFavFoods(chefName) {
    const meta = getFavMeta();
    return Object.values(meta).filter(m => m.chef && m.chef.toLowerCase() === chefName.toLowerCase()).length;
}

/* Badge ni yangilash */
function updateChefBadge(chefId, chefName) {
    const badge = document.getElementById('chef-count-' + chefId);
    if (!badge) return;
    const count = countChefFavFoods(chefName);
    if (count > 0) {
        badge.textContent = count + ' ta taom';
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

/* Barcha oshpaz badgelarini yangilash */
function updateAllChefBadges() {
    document.querySelectorAll('.chef-card[data-chef-id]').forEach(card => {
        const chefId   = card.getAttribute('data-chef-id');
        const chefName = card.getAttribute('data-chef-name');
        updateChefBadge(chefId, chefName);
    });
}

/* Oshpazni sevimliga qo'shish/olib tashlash */
window.toggleChefFav = function(btn, chefId, chefName) {
    let favChefs = getFavChefs();
    const isFav  = favChefs.includes(chefId);

    if (isFav) {
        favChefs = favChefs.filter(id => id !== chefId);
        btn.textContent = '🤍';
        btn.classList.remove('active');
        showMiniToast(chefName + ' sevimlilardan olib tashlandi');
    } else {
        favChefs.push(chefId);
        btn.textContent = '❤️';
        btn.classList.add('active');
        btn.style.transform = 'scale(1.35)';
        setTimeout(() => { btn.style.transform = ''; }, 250);
        showMiniToast('❤️ ' + chefName + ' sevimlilarga qo\'shildi!');
    }

    saveFavChefs(favChefs);
    initChefFavorites();
};

/* Kard click — fav btn ga bosilmagan bo'lsa navigate qilish */
window.handleChefCardClick = function(event, card, href) {
    if (event.target.closest('.chef-fav-btn') || event.target.closest('.fav-btn')) return;
    window.location.href = href;
};

/* Sahifa ochilganda oshpaz tugmalarini to'g'ri holat bilan ko'rsatish */
function initChefFavorites() {
    const favChefs = getFavChefs();
    let visibleCount = 0;

    document.querySelectorAll('.chef-card[data-chef-id]').forEach(card => {
        const chefId   = card.getAttribute('data-chef-id');
        const chefName = card.getAttribute('data-chef-name');
        const btn      = card.querySelector('.chef-fav-btn');
        const isFav    = favChefs.includes(chefId);

        if (btn) {
            if (isFav) {
                btn.textContent = '❤️';
                btn.classList.add('active');
            } else {
                btn.textContent = '🤍';
                btn.classList.remove('active');
            }
        }

        if (isFav) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }

        updateChefBadge(chefId, chefName);
    });

    let emptyMsg = document.getElementById('empty-chefs-msg');
    if (!emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.id = 'empty-chefs-msg';
        emptyMsg.className = 'state-msg';
        emptyMsg.innerHTML = `
            <div style="font-size:32px; margin-bottom:10px;">🍳</div>
            <h3>Sevimli oshpazlar yo'q</h3>
            <p style="color:#a3907c; font-size:13px; margin: 5px 0 15px;">Hali birorta ham oshpazni sevimlilarga qo'shmadingiz.</p>
            <button class="order-btn" onclick="window.location.href='buyordashbord.html'" style="display:inline-flex; align-items:center; background:#e63946; color:#fff; border:none; padding:10px 20px; border-radius:30px; font-weight:700; cursor:pointer; font-size:12px;">Oshpazlarni topish</button>
        `;
        const oshpazlarPanel = document.getElementById('oshpazlar');
        if (oshpazlarPanel) {
            oshpazlarPanel.appendChild(emptyMsg);
        }
    }

    if (visibleCount === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
    }
}

