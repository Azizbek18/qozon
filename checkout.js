/* ==========================================
   QOZON — CHECKOUT JS (DYNAMIC & PREMIUM)
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

    // 1. Savatchani localStorage dan yuklash
    let cartItems = [];
    try {
        cartItems = JSON.parse(localStorage.getItem('qz_cart') || '[]');
    } catch(e) {
        cartItems = [];
    }

    // Savat bo'sh bo'lsa dashboardga qaytarish
    if (cartItems.length === 0) {
        localStorage.setItem('qz_checkout_empty_alert', 'true');
        window.location.href = 'buyordashbord.html';
        return;
    }

    const itemsListContainer = document.getElementById("checkout-items-list");
    const subtotalSummaryElement = document.getElementById("subtotal-val");
    const serviceFeeElement = document.getElementById("delivery-val");
    const grandTotalElement = document.querySelector(".grand-total");
    const submitBtn = document.querySelector(".submit-order-btn");
    
    const methodCards = document.querySelectorAll(".delivery-selector-grid .method-select-card");
    const timeButtons = document.querySelectorAll(".time-picker-row .time-slot-pill");
    const paymentRows = document.querySelectorAll(".payment-selector-list .payment-option-row");

    let subtotal = 0;
    let deliveryFee = 0;

    // 2. Taomlarni dinamik render qilish va subtotal hisoblash
    if (itemsListContainer) {
        itemsListContainer.innerHTML = '';
        cartItems.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            subtotal += itemTotal;

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}" alt="${item.name}" class="product-img">
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <p class="chef-name">👨‍🍳 ${item.chef || 'Oshpaz'}</p>
                    <div class="product-meta">
                        <span class="qty-price">${item.quantity || 1} x ${new Intl.NumberFormat('ru-RU').format(item.price || 0)} so'm</span>
                        <span class="total-item-price">${new Intl.NumberFormat('ru-RU').format(itemTotal)} so'm</span>
                    </div>
                </div>
            `;
            itemsListContainer.appendChild(card);
        });
    }

    // Subtotal matnini yangilash
    if (subtotalSummaryElement) {
        subtotalSummaryElement.innerText = `${subtotal.toLocaleString('ru-RU')} so'm`;
    }

    // 3. Qabul qilish usuli mantiqlari
    methodCards.forEach(card => {
        card.addEventListener("click", () => {
            document.querySelector(".delivery-selector-grid .method-select-card.active")?.classList.remove("active");
            card.classList.add("active");

            const methodTitle = card.querySelector(".method-meta h4").innerText;
            if (methodTitle.includes("Yetkazib berish")) {
                deliveryFee = 15000;
                if (serviceFeeElement) {
                    serviceFeeElement.innerText = "15,000 so'm";
                    serviceFeeElement.classList.remove("free");
                }
            } else {
                deliveryFee = 0;
                if (serviceFeeElement) {
                    serviceFeeElement.innerText = "Bepul";
                    serviceFeeElement.classList.add("free");
                }
            }
            updateTotal();
        });
    });

    // Vaqt tanlash
    timeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(".time-picker-row .time-slot-pill.active")?.classList.remove("active");
            btn.classList.add("active");
        });
    });

    // To'lov turi
    paymentRows.forEach(option => {
        option.addEventListener("click", () => {
            document.querySelector(".payment-selector-list .payment-option-row.active")?.classList.remove("active");
            option.classList.add("active");
            const radioInput = option.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;
        });
    });

    function updateTotal() {
        if (!grandTotalElement) return;
        const totalSum = subtotal + deliveryFee;
        grandTotalElement.innerText = `${totalSum.toLocaleString('ru-RU')} so'm`;
    }

    // Dastlabki hisob-kitobni yangilash
    updateTotal();

    // Premium bildirishnoma chiqarish
    function triggerPremiumToast(title, method, time, payment, total) {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "custom-toast";

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon-wrapper">
                    <span class="toast-bell-icon">🔔</span>
                </div>
                <div class="toast-details">
                    <h5>${title}</h5>
                    <p>Sizda yangi buyurtma mavjud:</p>
                    <ul>
                        <li>• Usul: ${method}</li>
                        <li>• Vaqt: ${time}</li>
                        <li>• To'lov: 📲 ${payment}</li>
                        <li>• Jami: <b>${total}</b></li>
                    </ul>
                </div>
            </div>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);
        setTimeout(() => { toast.classList.add("show"); }, 50);

        const duration = 4000;
        const progressBar = toast.querySelector(".toast-progress");
        progressBar.style.transition = `width ${duration}ms linear`;
        setTimeout(() => { progressBar.style.width = "0%"; }, 50);

        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hide");
            toast.addEventListener("transitionend", () => { toast.remove(); });
        }, duration);
    }

    // 4. Tasdiqlash va Supabasega yuborish
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const selectedMethod = document.querySelector(".delivery-selector-grid .method-select-card.active .method-meta h4")?.innerText || "O'zingiz olib keting";
            const selectedTime = document.querySelector(".time-picker-row .time-slot-pill.active")?.innerText || "13:00";
            const selectedPayment = document.querySelector(".payment-selector-list .payment-option-row.active .payment-name")?.innerText || "Click / Payme / Apelsin";
            const finalPrice = grandTotalElement ? grandTotalElement.innerText : `${subtotal} so'm`;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `⏳ Yuborilmoqda...`;

            // Foydalanuvchi ma'lumotlarini olish
            let userData = null;
            for (const key of ["tn_user", "qz_current", "mk_user", "user"]) {
                try {
                    const d = JSON.parse(localStorage.getItem(key) || 'null');
                    if (d && (d.name || d.full_name || d.email)) { userData = d; break; }
                } catch(e) {}
            }

            const orderNumber = 'QZ-' + Date.now().toString().slice(-4);
            const foodNames = cartItems.map(item => `${item.name} (${item.quantity || 1}x)`).join(', ');
            const firstItem = cartItems[0];

            const orderPayload = {
                order_number: orderNumber,
                customer_name: userData ? (userData.full_name || userData.name || userData.email || 'Mehmon') : 'Mehmon',
                customer_phone: userData ? (userData.phone || '+998 90 123 45 67') : '+998 90 123 45 67',
                food_name: foodNames,
                food_image: firstItem ? (firstItem.image || '') : '',
                chef_name: firstItem ? (firstItem.chef || 'Oshpaz') : 'Oshpaz',
                quantity: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
                price: subtotal,
                total_price: subtotal + deliveryFee,
                status: 'pending',
                notes: `Vaqt: ${selectedTime}, Usul: ${selectedMethod}, To'lov: ${selectedPayment}`
            };

            try {
                const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(orderPayload)
                });

                if (resp.ok) {
                    const newOrder = await resp.json();
                    const createdOrder = Array.isArray(newOrder) ? newOrder[0] : newOrder;
                    
                    localStorage.setItem('qz_active_order', 'true');
                    localStorage.setItem('qz_current_order_id', createdOrder.id);
                    localStorage.setItem('qz_current_order_number', orderNumber);
                    localStorage.setItem('qz_current_order_food', JSON.stringify({
                        name: foodNames,
                        image: firstItem ? firstItem.image : '',
                        chef: firstItem ? firstItem.chef : 'Oshpaz',
                        quantity: 1,
                        price: subtotal + deliveryFee
                    }));
                } else {
                    localStorage.setItem('qz_active_order', 'true');
                    localStorage.setItem('qz_current_order_number', orderNumber);
                }
            } catch (err) {
                console.error("Supabase order failed, fallback:", err);
                localStorage.setItem('qz_active_order', 'true');
                localStorage.setItem('qz_current_order_number', orderNumber);
            }

            // Savatchani tozalash
            localStorage.setItem('qz_cart', '[]');

            triggerPremiumToast(
                "Muvaffaqiyatli",
                selectedMethod,
                selectedTime,
                selectedPayment,
                finalPrice
            );

            setTimeout(() => {
                if (selectedMethod.toLowerCase().includes("yetkazib")) {
                    window.location.href = "tracking.html";
                } else {
                    window.location.href = "orderTracking.html";
                }
            }, 2500);
        });
    }
});

// ==========================================
// TEMA O'ZGARTIRISH LOGIKASI (LIGHT / DARK ONLY)
// ==========================================
window.toggleCheckoutTheme = function() {
    const body = document.body;
    const isDark = body.classList.contains('theme-dark');
    if (isDark) {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        localStorage.setItem('qz_theme', 'light');
    } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        localStorage.setItem('qz_theme', 'dark');
    }
};

// Sahifa yuklanganda mavjud temani qo'llash
const savedTheme = localStorage.getItem('qz_theme') || 'light';
document.body.className = '';
document.body.classList.add('theme-' + savedTheme);

