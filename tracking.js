const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';

const STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];
const STATUS_META = {
    pending: {
        label: 'Oshpaz javobini kutmoqda',
        time: 'Kutilmoqda',
        desc: 'Buyurtma oshpaz paneliga yuborildi.',
        progress: 0,
        courier: 'Kuryer hali biriktirilmagan'
    },
    accepted: {
        label: 'Buyurtma qabul qilindi',
        time: 'Qabul qilindi',
        desc: 'Oshpaz buyurtmani tasdiqladi.',
        progress: 18,
        courier: 'Tayyorlash kutilmoqda'
    },
    preparing: {
        label: 'Tayyorlanmoqda',
        time: 'Oshpaz oshxonada',
        desc: 'Taom tayyorlanmoqda.',
        progress: 35,
        courier: 'Kuryer tayyor holatda'
    },
    ready: {
        label: 'Taom tayyor',
        time: 'Olib ketish kutilmoqda',
        desc: 'Buyurtma kuryerga topshirilishi mumkin.',
        progress: 55,
        courier: 'Kuryer yo‘lga chiqishga tayyor'
    },
    picked_up: {
        label: "Yo'lda",
        time: 'Yetkazilmoqda',
        desc: 'Kuryer buyurtmani olib ketdi.',
        progress: 78,
        courier: 'Kuryer yo‘lda'
    },
    delivered: {
        label: 'Yetkazib berildi',
        time: 'Yakunlandi',
        desc: 'Buyurtma yetkazib berildi.',
        progress: 100,
        courier: 'Buyurtma yakunlandi'
    },
    cancelled: {
        label: 'Buyurtma bekor qilindi',
        time: 'Bekor qilindi',
        desc: 'Buyurtma faol emas.',
        progress: 0,
        courier: 'Buyurtma bekor qilingan'
    }
};

let currentOrderId = null;
let currentOrderNumber = '#QZ-0000';
let currentStatus = 'pending';
let statusHistory = [];
let pollingInterval = null;
let realtimeClient = null;
let realtimeChannel = null;
let courierWobbleTimer = null;
let mapLiveTimer = null;
let currentOrder = null;
let currentFoodData = null;

document.addEventListener('DOMContentLoaded', () => {
    currentOrderId = localStorage.getItem('qz_current_order_id') || null;
    currentOrderNumber = localStorage.getItem('qz_current_order_number') || '#QZ-0000';
    currentFoodData = readFoodData();

    hydrateStaticOrderData();
    setupActions();
    renderStatus('pending', { silent: true });

    if (currentOrderId) {
        startLiveTracking();
    } else {
        showToast('info', 'Demo kuzatuv', 'Faol buyurtma topilmadi. Oxirgi ma’lumotlar ko‘rsatilmoqda.');
    }
});

function readFoodData() {
    try {
        return JSON.parse(localStorage.getItem('qz_current_order_food') || 'null');
    } catch (e) {
        return null;
    }
}

function hydrateStaticOrderData() {
    const foodTitle = document.getElementById('trackingFoodTitle');
    const chefName = document.getElementById('trackingChefName');
    const chefMarker = document.getElementById('chefMarkerLabel');
    const eta = document.getElementById('trackingEta');
    const help = document.querySelector('.help-icon');

    if (currentFoodData) {
        if (foodTitle) foodTitle.textContent = `${currentFoodData.name || 'Buyurtma'} (${currentFoodData.quantity || 1} porsiya)`;
        if (chefName) chefName.textContent = 'Oshpaz: ' + (currentFoodData.chef || 'Oshpaz');
        if (chefMarker) chefMarker.textContent = currentFoodData.chef || 'Oshpaz';
        if (eta) eta.textContent = currentFoodData.delivery_time || estimateEta();
    }

    if (help) {
        help.href = 'chat.html?' + new URLSearchParams({
            customer: 'Support',
            order: currentOrderNumber
        }).toString();
    }
}

function setupActions() {
    document.querySelector('.btn-call')?.addEventListener('click', () => {
        const phone = normalizePhone(currentFoodData?.courier_phone || currentFoodData?.customer_phone || '');
        if (phone) {
            window.location.href = 'tel:' + phone;
            return;
        }
        showToast('info', 'Kuryer hali biriktirilmagan', "Kuryer yo'lga chiqqach telefon ko'rinadi.");
    });

    document.querySelector('.btn-sms')?.addEventListener('click', () => {
        window.location.href = 'chat.html?' + new URLSearchParams({
            order: currentOrderNumber,
            orderId: currentOrderId || ''
        }).toString();
    });

    document.querySelectorAll('.ctrl-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => { this.style.transform = ''; }, 100);
        });
    });
}

function normalizePhone(phone) {
    const cleaned = String(phone || '').replace(/[^\d+]/g, '');
    if (!cleaned) return '';
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 9) return '+998' + cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('998')) return '+' + cleaned;
    return cleaned;
}

function startLiveTracking() {
    fetchOrder();
    setupRealtime();
    pollingInterval = setInterval(fetchOrder, 4000);
}

function stopLiveTracking() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    if (realtimeChannel && realtimeClient) {
        realtimeClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
    if (mapLiveTimer) {
        clearInterval(mapLiveTimer);
        mapLiveTimer = null;
    }
}

function setupRealtime() {
    if (typeof supabase === 'undefined' || !currentOrderId) return;
    try {
        realtimeClient = realtimeClient || supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        realtimeChannel = realtimeClient
            .channel('delivery-tracking-' + currentOrderId)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: 'id=eq.' + currentOrderId
            }, payload => {
                const order = payload.new || payload.old;
                if (order) processOrder(order, 'realtime');
            })
            .subscribe();
    } catch (err) {
        console.warn('Tracking realtime failed:', err);
    }
}

async function fetchOrder() {
    if (!currentOrderId) return;
    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${currentOrderId}&select=*`, {
            headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data && data[0]) processOrder(data[0], 'polling');
    } catch (err) {
        console.error('Tracking polling error:', err);
    }
}

function processOrder(order, source) {
    currentOrder = order || null;
    const nextStatus = order.status || 'pending';
    if (order.order_number) currentOrderNumber = order.order_number;
    mergeOrderDetails(order);
    renderStatus(nextStatus, {
        updatedAt: order.updated_at || order.created_at,
        createdAt: order.created_at,
        order,
        silent: nextStatus === currentStatus,
        source
    });
}

function mergeOrderDetails(order) {
    const foodTitle = document.getElementById('trackingFoodTitle');
    const chefName = document.getElementById('trackingChefName');
    const chefMarker = document.getElementById('chefMarkerLabel');

    if (foodTitle && order.food_name) {
        foodTitle.textContent = `${order.food_name} (${order.quantity || 1} porsiya)`;
    }
    if (chefName && order.chef_name) chefName.textContent = 'Oshpaz: ' + order.chef_name;
    if (chefMarker && order.chef_name) chefMarker.textContent = order.chef_name;
}

function renderStatus(status, options = {}) {
    const safeStatus = STATUS_META[status] ? status : 'pending';
    const previous = currentStatus;
    currentStatus = safeStatus;
    addHistory(safeStatus, options.updatedAt || new Date().toISOString(), options.createdAt);
    renderTimeline(safeStatus);
    updateCourierCard(safeStatus);
    updateMapProgress(safeStatus, options.order);
    startMapTicker();
    updateEta(safeStatus);

    if (!options.silent && previous !== safeStatus) {
        showToast('success', 'Status yangilandi', STATUS_META[safeStatus].label);
    }

    if (safeStatus === 'delivered' || safeStatus === 'cancelled') {
        stopLiveTracking();
    }
}

function addHistory(status, time, createdAt) {
    const statusIndex = STATUS_FLOW.indexOf(status);
    if (status === 'cancelled') {
        statusHistory = statusHistory.filter(item => ['pending', 'accepted', 'preparing'].includes(item.status));
        if (!statusHistory.some(item => item.status === 'cancelled')) statusHistory.push({ status, time });
    } else {
        statusHistory = statusHistory.filter(item => {
            const rank = STATUS_FLOW.indexOf(item.status);
            return rank >= 0 && rank <= statusIndex;
        });
        STATUS_FLOW.slice(0, statusIndex + 1).forEach((flowStatus, index) => {
            if (!statusHistory.some(item => item.status === flowStatus)) {
                statusHistory.push({
                    status: flowStatus,
                    time: index === statusIndex ? time : (createdAt || time)
                });
            }
        });
    }
}

function renderTimeline(activeStatus) {
    const timeline = document.getElementById('trackingTimeline');
    if (!timeline) return;

    const shown = [...statusHistory].sort((a, b) => getRank(b.status) - getRank(a.status));
    const nextStatuses = getFutureStatuses(activeStatus);
    const rows = [
        ...shown.map(item => timelineRow(item.status, item.time, item.status === activeStatus ? 'active' : 'completed')),
        ...nextStatuses.map(status => timelineRow(status, '', 'pending'))
    ];
    timeline.innerHTML = rows.join('');
}

function timelineRow(status, time, state) {
    const meta = STATUS_META[status] || STATUS_META.pending;
    const timeText = time ? new Date(time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : meta.time;
    const line = state === 'pending' ? '' : '<div class="line"></div>';
    return `
        <div class="timeline-item ${state} status-${status}">
            <div class="timeline-dot-wrapper">
                <div class="dot"></div>
                ${line}
            </div>
            <div class="timeline-content">
                <span class="status-name">${meta.label}</span>
                <span class="status-time ${state === 'active' ? 'highlight' : ''}">${timeText}</span>
                ${state === 'active' ? `<span class="status-desc">${meta.desc}</span>` : ''}
            </div>
        </div>
    `;
}

function getFutureStatuses(status) {
    if (status === 'cancelled' || status === 'delivered') return [];
    const index = STATUS_FLOW.indexOf(status);
    return STATUS_FLOW.slice(Math.max(index + 1, 1));
}

function getRank(status) {
    if (status === 'cancelled') return 99;
    const index = STATUS_FLOW.indexOf(status);
    return index === -1 ? 0 : index;
}

function updateCourierCard(status) {
    const courierName = document.getElementById('courierName');
    const courierStatus = document.getElementById('courierStatus');
    const callBtn = document.querySelector('.btn-call');
    const smsBtn = document.querySelector('.btn-sms');
    const isCourierVisible = ['ready', 'picked_up', 'delivered'].includes(status);

    if (courierName) courierName.textContent = isCourierVisible ? 'Dilshod' : 'Kuryer kutilmoqda';
    if (courierStatus) {
        courierStatus.innerHTML = isCourierVisible
            ? '<i class="fa-solid fa-star"></i> 4.9 <span class="order-count">(120+ buyurtma)</span>'
            : `<i class="fa-solid fa-circle-info"></i> ${STATUS_META[status].courier}`;
    }
    [callBtn, smsBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.toggle('is-disabled', !isCourierVisible);
    });
}

function updateMapProgress(status, order = currentOrder) {
    const courier = document.getElementById('movingCourier');
    if (!courier) return;

    const progress = getLiveMapProgress(status, order);
    const start = { top: 25, left: 50 };
    const end = { top: 60, left: 80 };
    const top = start.top + ((end.top - start.top) * progress / 100);
    const left = start.left + ((end.left - start.left) * progress / 100);
    courier.style.top = top + '%';
    courier.style.left = left + '%';
    courier.classList.toggle('is-waiting', progress < 45);
    courier.setAttribute('aria-label', `Kuryer xaritada ${Math.round(progress)} foiz masofani bosib o'tdi`);
    updateMapLiveStatus(progress, status, order);

    if (courierWobbleTimer) clearInterval(courierWobbleTimer);
    let wobble = 0;
    let direction = 1;
    courierWobbleTimer = setInterval(() => {
        wobble += 0.12 * direction;
        if (wobble > 3 || wobble < -3) direction *= -1;
        courier.style.transform = `translate(calc(-50% + ${wobble}px), calc(-50% + ${wobble * 0.45}px))`;
    }, 150);
}

function updateMapLiveStatus(progress, status, order) {
    const statusEl = document.getElementById('mapLiveStatus');
    if (!statusEl) return;
    const hasLiveSource = order && (
        order.delivery_progress !== undefined ||
        order.courier_progress !== undefined ||
        order.progress !== undefined ||
        order.courier_lat !== undefined
    );
    const sourceText = hasLiveSource
        ? 'real malumot'
        : 'status va vaqt';
    statusEl.innerHTML = `<span></span> Jonli xarita: ${Math.round(progress)}% (${sourceText})`;
    statusEl.classList.toggle('is-paused', status === 'pending' || status === 'cancelled');
}

function startMapTicker() {
    if (mapLiveTimer) return;
    mapLiveTimer = setInterval(() => {
        if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
            clearInterval(mapLiveTimer);
            mapLiveTimer = null;
            return;
        }
        updateMapProgress(currentStatus, currentOrder);
    }, 2500);
}

function getLiveMapProgress(status, order) {
    const fromOrder = Number(order?.delivery_progress ?? order?.courier_progress ?? order?.progress);
    if (Number.isFinite(fromOrder)) return clamp(fromOrder, 0, 100);

    const coordProgress = getCoordinateProgress(order);
    if (coordProgress !== null) return coordProgress;

    const metaProgress = STATUS_META[status]?.progress ?? 0;
    if (!order?.updated_at && !order?.created_at) return metaProgress;

    const startedAt = new Date(order.updated_at || order.created_at).getTime();
    const elapsedMinutes = Math.max(0, (Date.now() - startedAt) / 60000);
    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1];
    const nextProgress = STATUS_META[nextStatus]?.progress ?? metaProgress;
    const segmentProgress = clamp(elapsedMinutes / 12, 0, 0.85);
    return clamp(metaProgress + ((nextProgress - metaProgress) * segmentProgress), 0, 100);
}

function getCoordinateProgress(order) {
    const chef = readPoint(order, ['chef_lat', 'chef_lng'], ['restaurant_lat', 'restaurant_lng']);
    const customer = readPoint(order, ['customer_lat', 'customer_lng'], ['delivery_lat', 'delivery_lng']);
    const courier = readPoint(order, ['courier_lat', 'courier_lng'], ['driver_lat', 'driver_lng']);
    if (!chef || !customer || !courier) return null;

    const total = distance(chef, customer);
    if (!total) return null;
    const remaining = distance(courier, customer);
    return clamp(((total - remaining) / total) * 100, 0, 100);
}

function readPoint(source, primaryKeys, fallbackKeys) {
    const lat = Number(source?.[primaryKeys[0]] ?? source?.[fallbackKeys[0]]);
    const lng = Number(source?.[primaryKeys[1]] ?? source?.[fallbackKeys[1]]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function distance(a, b) {
    const lat = a.lat - b.lat;
    const lng = a.lng - b.lng;
    return Math.sqrt((lat * lat) + (lng * lng));
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function updateEta(status) {
    const eta = document.getElementById('trackingEta');
    if (!eta) return;
    if (status === 'delivered') {
        eta.textContent = 'Yetkazildi';
    } else if (status === 'cancelled') {
        eta.textContent = 'Bekor qilindi';
    } else if (currentFoodData?.delivery_time) {
        eta.textContent = currentFoodData.delivery_time;
    } else {
        eta.textContent = estimateEta();
    }
}

function estimateEta() {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

function showToast(type, title, message) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `tracking-toast tracking-toast-${type}`;
    toast.innerHTML = `
        <div class="tracking-toast-icon">${type === 'success' ? '✓' : 'i'}</div>
        <div>
            <div class="tracking-toast-title">${title}</div>
            <div class="tracking-toast-message">${message}</div>
        </div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 280);
    }, 3200);
}

function getToastContainer() {
    let container = document.getElementById('trackingToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'trackingToastContainer';
        container.className = 'tracking-toast-container';
        document.body.appendChild(container);
    }
    return container;
}
