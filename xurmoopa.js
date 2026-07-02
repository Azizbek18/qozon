// Oshpazlar paneli uchun funksionallik
let cart = [];

// Initialize local cart count from persistent cart
try {
    const savedCart = JSON.parse(localStorage.getItem('qz_cart') || '[]');
    const totalCount = savedCart.reduce((sum, item) => sum + item.quantity, 0);
    document.addEventListener('DOMContentLoaded', () => {
        const orderBtn = document.querySelector('.btn-order');
        if (orderBtn && totalCount > 0) {
            orderBtn.innerText = `Buyurtma berish (${totalCount})`;
        }
    });
} catch(e) {}

// Yangi Custom Modalni ochish funksiyasi
function showModal(title, message) {
    const modal = document.getElementById('customModal');
    if (!modal) return;
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    
    modal.classList.add('show');
}

// Modalni yopish funksiyasi
function closeModal() {
    const modal = document.getElementById('customModal');
    if (modal) modal.classList.remove('show');
}

// Tashqarini bosganda ham modal yopilishi uchun
window.addEventListener('click', function(e) {
    const modal = document.getElementById('customModal');
    if (e.target === modal) {
        closeModal();
    }
});

// 1. Savat (Cart) tizimi - dynamic function
window.addFoodToCart = function(id, name, price, image, chefName, button) {
    let cartItems = [];
    try {
        cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
    } catch(e) {
        cartItems = [];
    }
    
    const existing = cartItems.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({
            id: id,
            name: name,
            price: price,
            image: image,
            chef: chefName,
            quantity: 1
        });
    }
    
    localStorage.setItem('qz_cart', JSON.stringify(cartItems));
    
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const orderBtn = document.querySelector('.btn-order');
    if (orderBtn) {
        orderBtn.innerText = `Buyurtma berish (${totalCount})`;
    }
    
    const originalText = button.innerText;
    button.innerText = "✓ Qo'shildi";
    button.style.backgroundColor = "#2ecc71";
    button.style.color = "white";
    
    setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = "";
        button.style.color = "";
    }, 1500);
}

// 2. Hodisalar
const loginBtn = document.querySelector('.btn-login');
if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showModal("Tizimga kirish", "Tizimga kirish oynasiga yo'naltirilmoqdasiz...");
        setTimeout(() => {
            window.location.href = "xurmoOpa 2.html";
        }, 1500);
    });
}

const orderBtn = document.querySelector('.btn-order');
if (orderBtn) {
    orderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = "buyordashbord.html";
    });
}

const allReviewsBtn = document.querySelector('.btn-all-reviews');
if (allReviewsBtn) {
    allReviewsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showModal("Sharhlar", "Barcha sharhlar yuklanmoqda...");
    });
}

// Theme handling
function changeTheme(themeName, element) {
    if (themeName !== 'light' && themeName !== 'dark') return;

    document.body.className = '';
    document.body.classList.add('theme-' + themeName);
    
    const buttons = document.querySelectorAll('.switch-opt');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (element) {
        element.classList.add('active');
    }
    
    localStorage.setItem('qozon-chef-theme', themeName);
}

document.addEventListener("DOMContentLoaded", function() {
    const savedTheme = localStorage.getItem('qozon-chef-theme') || 'light';
    
    document.body.className = '';
    document.body.classList.add('theme-' + savedTheme);
    
    const buttons = document.querySelectorAll('.switch-opt');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(savedTheme)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});

// ==========================================================================
// SUPABASE DYNAMIC LOADER FOR CHEF DETAILS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const chefId = parseInt(urlParams.get('id')) || 1;

    if (typeof supabase !== 'undefined') {
        const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
        
        try {
            const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            
            // 1. Fetch Chef details
            client.from('chefs').select('*').eq('id', chefId).single().then(({ data: chef, error }) => {
                if (error) throw error;
                if (chef) {
                    // Update Page Title
                    document.title = `${chef.full_name} - Oshpazlar paneli`;
                    
                    // Update Profile Banner details
                    const nameEl = document.getElementById('chefName');
                    if (nameEl) nameEl.textContent = chef.full_name;
                    
                    const avatarEl = document.getElementById('chefAvatar');
                    if (avatarEl) {
                        avatarEl.src = chef.avatar_url || chef.image || 'https://cdn.dribbble.com/userupload/37942659/file/original-e75e34cb44361a6425fd82f51f07777b.png?resize=752x&vertical=center';
                        avatarEl.alt = chef.full_name;
                    }
                    
                    const ratingEl = document.getElementById('chefRating');
                    if (ratingEl) ratingEl.textContent = `★ ${chef.rating || '5.0'}`;
                    
                    const bigRatingEl = document.querySelector('.rating-big');
                    if (bigRatingEl) bigRatingEl.textContent = chef.rating || '5.0';
                    
                    const locationEl = document.getElementById('chefLocation');
                    if (locationEl) locationEl.textContent = `📍 ${chef.location || chef.address || 'Toshkent, Yunusobod'}`;
                    
                    // Render Tags
                    const tagsEl = document.getElementById('chefTags');
                    if (tagsEl) {
                        const spec = chef.speciality || 'Milliy taomlar ustasi';
                        const specTags = spec.split(' va ').flatMap(s => s.split(', '));
                        let tagsHTML = '';
                        specTags.forEach(t => {
                            tagsHTML += `<span class="tag">${t}</span>`;
                        });
                        if (chef.is_verified) {
                            tagsHTML += `<span class="tag font-bold verified">✓ Tasdiqlangan</span>`;
                        }
                        tagsEl.innerHTML = tagsHTML;
                    }
                    
                    // 2. Fetch Chef Foods
                    client.from('foods').select('*').eq('chef_name', chef.full_name).then(({ data: foods, error: foodsError }) => {
                        if (foodsError) throw foodsError;
                        renderChefMenu(foods || [], chef.full_name);
                    }).catch(err => {
                        console.error("Error fetching foods:", err);
                        renderChefMenu([], chef.full_name);
                    });
                }
            }).catch(err => {
                console.error("Error fetching chef:", err);
                showModal("Xatolik", "Oshpaz ma'lumotlarini yuklashda xatolik yuz berdi.");
            });
            
        } catch (e) {
            console.error("Supabase client init error:", e);
        }
    } else {
        console.warn("Supabase SDK not loaded");
    }
});

function renderChefMenu(foods, chefName) {
    const container = document.getElementById('chefMenuContainer');
    if (!container) return;
    
    if (foods.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 15px; font-weight: 600;">
                🍳 Ushbu oshpazning bugungi menyusi bo'sh.
            </div>
        `;
        return;
    }
    
    let html = '';
    foods.forEach(food => {
        const priceFormatted = new Intl.NumberFormat('ru-RU').format(food.price) + " so'm";
        const image = food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
        const rating = food.rating || food.rating_score || '4.8';
        const reviewsCount = food.reviews_count || 12;
        const portions = food.portions_left || 5;
        
        html += `
            <div class="menu-card" data-food-id="${food.id}" onclick="window.location.href='food.detalis.html?id=${food.id}'" style="cursor: pointer;">
                <img src="${image}" alt="${food.name}" class="menu-img">
                <div class="menu-info">
                    <div class="menu-header">
                        <div class="menu-title">${food.name}</div>
                        <div class="menu-price">${priceFormatted}</div>
                    </div>
                    <div class="menu-desc">${food.category || 'Asosiy taom'} • 🔥 ${portions} ta qoldi • ⭐ ${rating} (${reviewsCount} ta sharh)</div>
                    <div class="menu-footer">
                        <div class="menu-time">🕒 Tayyor bo'lishi: 20-30 daq</div>
                        <button class="btn-cart" onclick="event.stopPropagation(); addFoodToCart(${food.id}, '${food.name.replace(/'/g, "\\'")}', ${food.price}, '${image}', '${chefName.replace(/'/g, "\\'")}', this)">Savatga</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}