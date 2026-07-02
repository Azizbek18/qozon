// ==========================================
// QOZON - BUYURTMA KUZATISH (REAL-TIME)
// ==========================================

const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

const STATUS_STEP_MAP = {
    'pending':   0,
    'accepted':  1,
    'preparing': 1,
    'ready':     2,
    'picked_up': 3,
    'delivered': 3,
    'cancelled': -1
};

const STATUS_LABELS = {
    'pending':   'Oshpaz buyurtmani qabul qilishini kutmoqda...',
    'accepted':  'Oshpaz buyurtmani qabul qildi!',
    'preparing': 'Taom tayyorlanmoqda...',
    'ready':     'Taom tayyor! Olib ketishingiz mumkin.',
    'picked_up': 'Olib ketildi!',
    'delivered': 'Yetkazib berildi!',
    'cancelled': 'Buyurtma bekor qilindi.'
};

let currentOrderId = null;
let pollingInterval = null;
let lastKnownStatus = null;

document.addEventListener('DOMContentLoaded', () => {

    // --- BURGER MENU ---
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
                burgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // --- HEADER FOYDALANUVCHI ISMI ---
    try {
        let loggedInUser = null;
        for (const key of ['tn_user', 'qz_current', 'mk_user', 'user']) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && (data.name || data.full_name || data.email)) {
                    loggedInUser = data; break;
                }
            } catch(e) {}
        }
        if (loggedInUser) {
            const nameText = (loggedInUser.user_metadata && loggedInUser.user_metadata.full_name)
                || loggedInUser.full_name || loggedInUser.name || loggedInUser.email;
            const avatarUrl = (loggedInUser.user_metadata && loggedInUser.user_metadata.avatar_url)
                || loggedInUser.avatar_url || loggedInUser.avatar
                || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80';
            const menuActions = document.querySelector('.menu-actions');
            if (menuActions) {
                menuActions.innerHTML = '<a href="buyordashbord.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;"><span style="font-weight:700;font-size:15px;">' + nameText + '</span><img src="' + avatarUrl + '" alt="Avatar" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #e8ddd0;cursor:pointer;"></a>';
            }
        }
    } catch(e) {}

    // --- BUYURTMA MA'LUMOTLARINI YUKLASH ---
    const orderNumber = localStorage.getItem('qz_current_order_number') || '#QZ-0000';
    currentOrderId = localStorage.getItem('qz_current_order_id') || null;

    const orderNumEl = document.getElementById('orderNumber');
    if (orderNumEl) orderNumEl.textContent = 'Buyurtma raqami: ' + orderNumber;

    try {
        const foodData = JSON.parse(localStorage.getItem('qz_current_order_food') || 'null');
        if (foodData) {
            const foodNameEl = document.getElementById('trackingFoodName');
            const foodImgEl = document.getElementById('trackingFoodImg');
            const foodDescEl = document.getElementById('trackingFoodDesc');
            const chefNameEl = document.getElementById('trackingChefName');
            if (foodNameEl) foodNameEl.textContent = foodData.name + ' (' + foodData.quantity + ' porsiya)';
            if (foodImgEl && foodData.image) foodImgEl.src = foodData.image;
            if (foodDescEl) foodDescEl.textContent = new Intl.NumberFormat('ru-RU').format(foodData.price * foodData.quantity) + " so'm";
            if (chefNameEl) chefNameEl.textContent = foodData.chef || 'Xurmo opa';
        }
    } catch(e) {}

    // Boshlang'ich holat
    updateUI('pending');

    // Real-time polling (har 4 soniyada)
    if (currentOrderId) {
        startRealtimePolling();
    }

    // --- BEKOR QILISH TUGMASI ---
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Haqiqatdan ham buyurtmani bekor qilmoqchimisiz?')) return;
            if (currentOrderId) {
                await updateOrderStatusInDB(currentOrderId, 'cancelled');
            }
            stopPolling();
            localStorage.removeItem('qz_active_order');
            localStorage.removeItem('qz_current_order_id');
            localStorage.removeItem('qz_current_order_number');
            localStorage.removeItem('qz_current_order_food');
            alert("Buyurtmangiz bekor qilindi.");
            window.location.href = 'buyordashbord.html';
        });
    }

    window.addEventListener('resize', () => {
        const step = (STATUS_STEP_MAP[lastKnownStatus] !== undefined) ? STATUS_STEP_MAP[lastKnownStatus] : 0;
        updateProgressBar(step);
    });
});

function startRealtimePolling() {
    fetchOrderStatus();
    pollingInterval = setInterval(fetchOrderStatus, 4000);
}

function stopPolling() {
    if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
}

async function fetchOrderStatus() {
    if (!currentOrderId) return;
    try {
        const resp = await fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + currentOrderId + '&select=status,order_number,updated_at', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!data || data.length === 0) return;
        const newStatus = data[0].status;
        if (newStatus !== lastKnownStatus) {
            lastKnownStatus = newStatus;
            updateUI(newStatus);
            addTimelineEntry(newStatus, data[0].updated_at);
            if (newStatus === 'delivered' || newStatus === 'cancelled') {
                stopPolling();
                if (newStatus === 'delivered') {
                    setTimeout(() => {
                        localStorage.removeItem('qz_active_order');
                        localStorage.removeItem('qz_current_order_id');
                    }, 3000);
                }
            }
        }
    } catch(err) { console.error('Polling error:', err); }
}

function updateUI(status) {
    const stepIndex = (STATUS_STEP_MAP[status] !== undefined) ? STATUS_STEP_MAP[status] : 0;
    const steps = document.querySelectorAll('.order-step');
    steps.forEach((step, index) => {
        step.classList.remove('step-completed', 'step-active', 'step-pending');
        if (index < stepIndex) {
            step.classList.add('step-completed');
            const icon = step.querySelector('.order-icon i');
            if (icon) icon.className = 'fa-solid fa-check';
        } else if (index === stepIndex) {
            step.classList.add('step-active');
        } else {
            step.classList.add('step-pending');
        }
    });
    updateProgressBar(stepIndex);

    const statusMsgEl = document.getElementById('orderStatusMsg');
    if (statusMsgEl) {
        statusMsgEl.textContent = STATUS_LABELS[status] || '';
        statusMsgEl.style.display = 'block';
    }

    const cancelContainer = document.querySelector('.cancel-container');
    if (cancelContainer) {
        const doneStatuses = ['ready', 'picked_up', 'delivered', 'cancelled'];
        cancelContainer.style.display = doneStatuses.includes(status) ? 'none' : '';
    }
}

function updateProgressBar(stepIndex) {
    const steps = document.querySelectorAll('.order-step');
    const progressFill = document.querySelector('.order-progress-fill');
    if (!progressFill || steps.length === 0) return;
    const percentage = (stepIndex / (steps.length - 1)) * 100;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        progressFill.style.width = '100%';
        progressFill.style.height = percentage + '%';
    } else {
        progressFill.style.height = '100%';
        progressFill.style.width = percentage + '%';
    }
}

function addTimelineEntry(status, updatedAt) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    const label = STATUS_LABELS[status] || status;
    const d = updatedAt ? new Date(updatedAt) : new Date();
    const timeStr = d.toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'});
    const newItem = document.createElement('div');
    newItem.className = 'timeline-item active';
    newItem.innerHTML = '<div class="timeline-dot"></div><div class="timeline-content"><div class="status-title-row"><h4>' + label + '</h4><span class="time">' + timeStr + '</span></div></div>';
    timeline.insertBefore(newItem, timeline.firstChild);
    timeline.querySelectorAll('.timeline-item:not(:first-child)').forEach(item => {
        item.classList.remove('active');
        item.classList.add('completed');
    });
}

async function updateOrderStatusInDB(orderId, newStatus) {
    try {
        await fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + orderId, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY
            },
            body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
        });
    } catch(err) { console.error('Status update error:', err); }
}
