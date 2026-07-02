// ==========================================
// 1. THEME SWITCHER LOGIC
// ==========================================
function changeTheme(theme, btnElement) {
    document.body.className = 'theme-' + theme;
    
    // Update active class on switcher buttons
    const buttons = document.querySelectorAll('.switch-opt');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        // If loaded from localStorage, find the correct button to set active
        const targetBtn = document.querySelector(`.switch-opt[onclick*="${theme}"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    // Update slider position
    const slider = document.querySelector('.switcher-slider');
    if (slider) {
        if (theme === 'dark') {
            slider.style.left = '38px';
        } else {
            slider.style.left = '4px';
        }
    }
    
    // Save theme preference in localStorage
    localStorage.setItem('qozon_theme', theme);
}

// Ensure changeTheme is in the global window scope
window.changeTheme = changeTheme;


// ==========================================
// 2. CART SYSTEM LOGIC
// ==========================================
let cart = JSON.parse(localStorage.getItem('qozon_cart')) || [];

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalCount > 0) {
        badge.textContent = totalCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function saveCart() {
    localStorage.setItem('qozon_cart', JSON.stringify(cart));
    updateCartBadge();
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('total-price');
    if (!cartItemsContainer || !totalPriceEl) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Savatingiz hozircha bo\'sh.</div>';
        totalPriceEl.textContent = '0 so\'m';
        return;
    }
    
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const html = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name} (${item.quantity} dona)</h4>
                    <p>${formatPrice(item.price * item.quantity)} so'm</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">O'chirish</button>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', html);
    });
    
    totalPriceEl.textContent = formatPrice(total) + ' so\'m';
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}

// Make removeFromCart globally accessible for inline onclick
window.removeFromCart = removeFromCart;

function openCartModal() {
    const overlay = document.getElementById('cart-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        renderCart();
    }
}

// Function to close cart modal
function closeCartModal() {
    const overlay = document.getElementById('cart-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}


// ==========================================
// 3. DOMContentLoaded INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // A. Apply saved theme
    const savedTheme = localStorage.getItem('qozon_theme') || 'light';
    changeTheme(savedTheme);
    
    // B. Initialize Cart Badge
    updateCartBadge();
    
    // C. Modal Event Listeners
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (openCartBtn) {
        openCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartModal();
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            closeCartModal();
        });
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                closeCartModal();
            }
        });
    }
    
    // D. Add to Cart Button Listeners
    const addToCartBtns = document.querySelectorAll('.btn-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.menu-card');
            if (!card) return;
            
            const titleEl = card.querySelector('.menu-title');
            const priceEl = card.querySelector('.menu-price');
            
            if (titleEl && priceEl) {
                const name = titleEl.textContent.trim();
                const priceText = priceEl.textContent.replace(/[^0-9]/g, '');
                const price = parseInt(priceText, 10) || 0;
                
                addToCart(name, price);
                
                // Visual Button Feedback
                const originalText = btn.textContent;
                btn.textContent = 'Qo\'shildi ✓';
                btn.style.background = '#2ecc71';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 1000);
            }
        });
    });
    
    // E. Order Button / Checkout Listener
    const checkoutBtn = document.querySelector('.cart-modal .btn-order');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Savatingiz bo\'sh. Iltimos, taom qo\'shing!');
                return;
            }
            
            alert('Rahmat! Buyurtmangiz qabul qilindi. Buyurtmani kuzatish sahifasiga yo\'naltirilmoqdasiz...');
            cart = [];
            saveCart();
            closeCartModal();
            window.location.href = 'orderTracking.html';
        });
    }
});
