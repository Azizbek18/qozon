// ==========================================
// QOZON - BUYURTMA KUZATISH (REAL-TIME)
// ==========================================

const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

const STATUS_STEP_MAP = {
    'pending':   0,
    'accepted':  1,
    'preparing': 2,
    'ready':     3,
    'picked_up': 4,
    'delivered': 4,
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

const STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];
const DONE_STATUSES = ['ready', 'picked_up', 'delivered', 'cancelled'];
const STATUS_TIMELINE = {
    pending: {
        title: 'Oshpaz buyurtmani qabul qilishini kutmoqda...',
        desc: 'Buyurtmangiz oshpaz paneliga yuborildi. Qabul qilingach status avtomatik yangilanadi.'
    },
    accepted: {
        title: 'Buyurtma qabul qilindi',
        desc: 'Oshpaz buyurtmangizni tasdiqladi va tayyorlashga navbatga oldi.'
    },
    preparing: {
        title: 'Taom tayyorlanmoqda',
        desc: 'Oshpaz taomingizni tayyorlashni boshladi. Xushboʻy hidlar tarala boshladi!'
    },
    ready: {
        title: 'Taom tayyor',
        desc: 'Buyurtmangiz tayyor. Olib ketish yoki yetkazib berish jarayoni boshlanishi mumkin.'
    },
    picked_up: {
        title: 'Olib ketildi',
        desc: 'Buyurtma olib ketildi. Yoqimli ishtaha!'
    },
    delivered: {
        title: 'Yetkazib berildi',
        desc: 'Buyurtma muvaffaqiyatli yakunlandi. Yoqimli ishtaha!'
    },
    cancelled: {
        title: 'Buyurtma bekor qilindi',
        desc: 'Buyurtma bekor qilingan deb belgilandi.'
    }
};

const SUMMARY_STATUS = {
    pending: {
        title: '⏳ Oshpaz javobini kutmoqda',
        eyebrow: 'JARAYON HOLATI',
        meta: 'Oshpaz buyurtmani qabul qilishi kutilmoqda...',
        tone: 'pending'
    },
    accepted: {
        title: '✅ Oshpaz buyurtmani qabul qildi',
        eyebrow: "KEYINGI BOSQICH",
        meta: 'Tez orada tayyorlash boshlanadi',
        tone: 'success'
    },
    preparing: {
        title: '👨‍🍳 Taom tayyorlanmoqda',
        eyebrow: "TAYYOR BO'LISH VAQTI",
        meta: 'Tayyorlanmoqda...',
        tone: 'success'
    },
    ready: {
        title: '📦 Taom tayyor',
        eyebrow: 'OLIB KETISH',
        meta: 'Buyurtmangiz tayyor',
        tone: 'success'
    },
    picked_up: {
        title: '🚶 Buyurtma olib ketildi',
        eyebrow: 'YAKUNLANDI',
        meta: 'Yoqimli ishtaha!',
        tone: 'success'
    },
    delivered: {
        title: '✅ Buyurtma yetkazib berildi',
        eyebrow: 'YAKUNLANDI',
        meta: 'Yoqimli ishtaha!',
        tone: 'success'
    },
    cancelled: {
        title: '❌ Buyurtma bekor qilindi',
        eyebrow: 'BEKOR QILINDI',
        meta: 'Buyurtma faol emas',
        tone: 'cancelled'
    }
};

let currentOrderId = null;
let pollingInterval = null;
let lastKnownStatus = null;
let realtimeClient = null;
let realtimeChannel = null;
let statusEvents = [];
let currentChefContact = {
    name: 'Xurmo opa',
    phone: '',
    orderNumber: '#QZ-0000'
};

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

    // --- BUYURTMA MA'LUMOTLARINI YUKLASH ---
    const orderNumber = localStorage.getItem('qz_current_order_number') || '#QZ-0000';
    currentOrderId = localStorage.getItem('qz_current_order_id') || null;
    currentChefContact.orderNumber = orderNumber;

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
            currentChefContact.name = foodData.chef || 'Xurmo opa';
            currentChefContact.phone = foodData.chef_phone || foodData.chefPhone || foodData.phone || '';
        }
    } catch(e) {}

    initChefContactButton();
    hydrateChefContact();

    statusEvents = loadStatusHistory();

    // Boshlang'ich holat va realtime kuzatuv
    if (currentOrderId) {
        startLiveStatusTracking();
    } else {
        applyOrderStatus('pending', new Date().toISOString(), { silent: true });
    }

    // --- BEKOR QILISH TUGMASI ---
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCancelConfirmToast();
        });
    }

    window.addEventListener('resize', () => {
        const step = (STATUS_STEP_MAP[lastKnownStatus] !== undefined) ? STATUS_STEP_MAP[lastKnownStatus] : 0;
        updateProgressBar(step);
    });
});

function getToastContainer() {
    let container = document.getElementById('trackingToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'trackingToastContainer';
        container.className = 'tracking-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }
    return container;
}

function removeTrackingToast(toast) {
    if (!toast || toast.dataset.removing === 'true') return;
    toast.dataset.removing = 'true';
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 280);
}

function showTrackingToast(type, title, message, options = {}) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `tracking-toast tracking-toast-${type}`;
    toast.innerHTML = `
        <div class="tracking-toast-icon">${options.icon || (type === 'success' ? '✓' : type === 'danger' ? '!' : 'i')}</div>
        <div class="tracking-toast-body">
            <div class="tracking-toast-title">${title}</div>
            <div class="tracking-toast-message">${message}</div>
            ${options.actions || ''}
        </div>
        <button class="tracking-toast-close" type="button" aria-label="Yopish">×</button>
        ${options.persist ? '' : '<div class="tracking-toast-progress"></div>'}
    `;

    toast.querySelector('.tracking-toast-close')?.addEventListener('click', () => removeTrackingToast(toast));
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    if (!options.persist) {
        setTimeout(() => removeTrackingToast(toast), options.duration || 3600);
    }

    return toast;
}

function showCancelConfirmToast() {
    if (document.querySelector('.tracking-toast-confirm')) return;

    const toast = showTrackingToast(
        'danger',
        'Buyurtmani bekor qilasizmi?',
        "Bu amal buyurtma holatini bekor qilingan deb belgilaydi.",
        {
            icon: '!',
            persist: true,
            actions: `
                <div class="tracking-toast-actions">
                    <button class="tracking-toast-secondary" type="button" data-toast-cancel>Yo'q</button>
                    <button class="tracking-toast-danger" type="button" data-order-cancel>Ha, bekor qilish</button>
                </div>
            `
        }
    );
    toast.classList.add('tracking-toast-confirm');

    toast.querySelector('[data-toast-cancel]')?.addEventListener('click', () => removeTrackingToast(toast));
    toast.querySelector('[data-order-cancel]')?.addEventListener('click', async (event) => {
        const btn = event.currentTarget;
        btn.disabled = true;
        btn.textContent = 'Bekor qilinmoqda...';
        await cancelCurrentOrder();
        removeTrackingToast(toast);
    });
}

async function cancelCurrentOrder() {
    if (currentOrderId) {
        await updateOrderStatusInDB(currentOrderId, 'cancelled');
    }

    stopLiveStatusTracking();
    localStorage.removeItem('qz_active_order');
    localStorage.removeItem('qz_current_order_id');
    localStorage.removeItem('qz_current_order_number');
    localStorage.removeItem('qz_current_order_food');

    showTrackingToast('success', 'Buyurtma bekor qilindi', "Siz bosh sahifaga yo'naltirilasiz.", {
        icon: '✓',
        duration: 1800
    });
    setTimeout(() => {
        window.location.href = 'buyordashbord.html';
    }, 900);
}

function initChefContactButton() {
    const contactBtn = document.getElementById('contactChefBtn');
    if (!contactBtn) return;

    contactBtn.addEventListener('click', handleChefContact);
}

function normalizePhone(phone) {
    const cleaned = String(phone || '').replace(/[^\d+]/g, '');
    if (!cleaned) return '';
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 9) return '+998' + cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('998')) return '+' + cleaned;
    return cleaned;
}

async function hydrateChefContact() {
    if (currentChefContact.phone || !currentChefContact.name || typeof supabase === 'undefined') return;

    try {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const escapedName = currentChefContact.name.replace(/'/g, "''");
        const { data } = await client
            .from('chefs')
            .select('*')
            .or(`full_name.eq.${escapedName},name.eq.${escapedName}`)
            .limit(1);

        const chef = data && data[0];
        if (!chef) return;

        currentChefContact.phone = chef.phone || chef.phone_number || chef.contact_phone || chef.telegram_phone || '';
        const chefNameEl = document.getElementById('trackingChefName');
        if (chefNameEl && (chef.full_name || chef.name)) chefNameEl.textContent = chef.full_name || chef.name;
    } catch (err) {
        console.warn('Chef contact lookup failed:', err);
    }
}

function handleChefContact() {
    const phone = normalizePhone(currentChefContact.phone);
    if (phone) {
        window.location.href = 'tel:' + phone;
        return;
    }

    const params = new URLSearchParams({
        chef: currentChefContact.name || 'Oshpaz',
        order: currentChefContact.orderNumber || '',
        orderId: currentOrderId || ''
    });
    window.location.href = 'chat.html?' + params.toString();
}

function getStatusStorageKey() {
    const key = currentOrderId || currentChefContact.orderNumber || 'current';
    return 'qz_order_status_history_' + key;
}

function loadStatusHistory() {
    try {
        const stored = JSON.parse(localStorage.getItem(getStatusStorageKey()) || '[]');
        return Array.isArray(stored) ? stored.filter(item => item && item.status) : [];
    } catch (e) {
        return [];
    }
}

function saveStatusHistory() {
    try {
        localStorage.setItem(getStatusStorageKey(), JSON.stringify(statusEvents.slice(-10)));
    } catch (e) {}
}

function getStatusRank(status) {
    if (status === 'cancelled') return 99;
    const index = STATUS_FLOW.indexOf(status);
    return index === -1 ? 0 : index;
}

function addStatusEvent(status, timestamp, options = {}) {
    const safeStatus = STATUS_TIMELINE[status] ? status : 'pending';
    const time = timestamp || new Date().toISOString();
    const currentIndex = STATUS_FLOW.indexOf(safeStatus);

    if (safeStatus === 'cancelled') {
        statusEvents = statusEvents.filter(event => event.status === 'pending' || event.status === 'accepted' || event.status === 'preparing');
    } else if (currentIndex >= 0) {
        statusEvents = statusEvents.filter(event => {
            const rank = STATUS_FLOW.indexOf(event.status);
            return rank >= 0 && rank <= currentIndex;
        });
    }

    if (currentIndex >= 0) {
        STATUS_FLOW.slice(0, currentIndex + 1).forEach((flowStatus, index) => {
            if (!statusEvents.some(item => item.status === flowStatus)) {
                statusEvents.push({
                    status: flowStatus,
                    time: index === currentIndex ? time : (options.createdAt || time)
                });
            }
        });
    } else if (!statusEvents.some(item => item.status === safeStatus)) {
        statusEvents.push({ status: safeStatus, time });
    }

    const existing = statusEvents.find(item => item.status === safeStatus);
    if (existing && options.refreshTime) existing.time = time;

    statusEvents = statusEvents
        .filter((event, index, arr) => arr.findIndex(item => item.status === event.status) === index)
        .sort((a, b) => getStatusRank(a.status) - getStatusRank(b.status));
    saveStatusHistory();
}

function startLiveStatusTracking() {
    fetchOrderStatus();
    setupRealtimeStatusSubscription();
    pollingInterval = setInterval(fetchOrderStatus, 4000);
}

function stopLiveStatusTracking() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    if (realtimeChannel && realtimeClient) {
        realtimeClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
}

function setupRealtimeStatusSubscription() {
    if (!currentOrderId || typeof supabase === 'undefined') return;
    try {
        realtimeClient = realtimeClient || supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        if (realtimeChannel) realtimeClient.removeChannel(realtimeChannel);
        realtimeChannel = realtimeClient
            .channel('order-tracking-' + currentOrderId)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: 'id=eq.' + currentOrderId
            }, payload => {
                const order = payload.new || payload.old;
                if (!order || !order.status) return;
                processOrderStatus(order, { source: 'realtime' });
            })
            .subscribe();
    } catch (err) {
        console.warn('Realtime status subscription failed:', err);
    }
}

async function fetchOrderStatus() {
    if (!currentOrderId) return;
    try {
        const resp = await fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + currentOrderId + '&select=status,order_number,created_at,updated_at', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!data || data.length === 0) return;
        processOrderStatus(data[0], { source: 'polling' });
    } catch(err) { console.error('Polling error:', err); }
}

function processOrderStatus(order, options = {}) {
    const newStatus = order.status || 'pending';
    const statusChanged = newStatus !== lastKnownStatus;
    applyOrderStatus(newStatus, order.updated_at || order.created_at || new Date().toISOString(), {
        createdAt: order.created_at,
        source: options.source,
        silent: !statusChanged
    });
}

function applyOrderStatus(status, timestamp, options = {}) {
    const safeStatus = STATUS_TIMELINE[status] ? status : 'pending';
    const previousStatus = lastKnownStatus;
    lastKnownStatus = safeStatus;

    addStatusEvent(safeStatus, timestamp, {
        createdAt: options.createdAt,
        refreshTime: options.source === 'realtime'
    });
    updateUI(safeStatus);
    renderStatusTimeline(safeStatus);

    if (!options.silent && previousStatus && previousStatus !== safeStatus) {
        showTrackingToast('info', 'Status yangilandi', STATUS_LABELS[safeStatus] || safeStatus, {
            icon: '⏱',
            duration: 3200
        });
    }

    if (safeStatus === 'delivered' || safeStatus === 'cancelled') {
        stopLiveStatusTracking();
        if (safeStatus === 'delivered') {
            setTimeout(() => {
                localStorage.removeItem('qz_active_order');
                localStorage.removeItem('qz_current_order_id');
            }, 3000);
        }
    }
}

function updateUI(status) {
    const stepIndex = (STATUS_STEP_MAP[status] !== undefined) ? STATUS_STEP_MAP[status] : 0;
    const steps = document.querySelectorAll('.order-step');
    updateSummaryBanner(status);
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
        cancelContainer.style.display = DONE_STATUSES.includes(status) ? 'none' : '';
    }
}

function updateSummaryBanner(status) {
    const summary = SUMMARY_STATUS[status] || SUMMARY_STATUS.pending;
    const card = document.getElementById('trackingSummaryCard');
    const title = document.getElementById('trackingSummaryTitle');
    const eyebrow = document.getElementById('trackingSummaryEyebrow');
    const meta = document.getElementById('trackingSummaryMeta');

    if (card) {
        card.classList.remove('summary-pending', 'summary-success', 'summary-cancelled');
        card.classList.add('summary-' + summary.tone);
    }
    if (title) title.textContent = summary.title;
    if (eyebrow) eyebrow.textContent = summary.eyebrow;
    if (meta) meta.textContent = summary.meta;
}

function updateProgressBar(stepIndex) {
    const steps = document.querySelectorAll('.order-step');
    const progressFill = document.querySelector('.order-progress-fill');
    if (!progressFill || steps.length === 0) return;
    const safeStep = Math.max(0, stepIndex);
    const percentage = (safeStep / (steps.length - 1)) * 100;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        progressFill.style.width = '100%';
        progressFill.style.height = percentage + '%';
    } else {
        progressFill.style.height = '100%';
        progressFill.style.width = percentage + '%';
    }
}

function renderStatusTimeline(currentStatus) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const events = [...statusEvents].sort((a, b) => getStatusRank(b.status) - getStatusRank(a.status));
    timeline.innerHTML = events.map(event => {
        const meta = STATUS_TIMELINE[event.status] || STATUS_TIMELINE.pending;
        const d = event.time ? new Date(event.time) : new Date();
        const timeStr = d.toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'});
        const stateClass = event.status === currentStatus ? 'active' : 'completed';
        const desc = meta.desc ? `<p class="status-desc">${meta.desc}</p>` : '';
        return `
            <div class="timeline-item ${stateClass} status-${event.status}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="status-title-row">
                        <h4>${meta.title}</h4>
                        <span class="time">${timeStr}</span>
                    </div>
                    ${desc}
                </div>
            </div>
        `;
    }).join('');
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
