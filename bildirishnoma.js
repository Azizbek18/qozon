/* ==========================================
   QOZON — OSHPAZ BILDIRISHNOMALARI
   Manbalar: public.notifications (tizim), public.orders (buyurtmalar),
   public.reviews (sharhlar) — hammasi bitta ro'yxatga birlashtiriladi.
   ========================================== */

const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
const client = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const notifList = document.getElementById('notifList');
const notifTabs = document.getElementById('notifTabs');
const btnMarkAllRead = document.getElementById('btnMarkAllRead');

const ORDER_STATUS_LABELS = {
    pending: 'Javobingizni kutmoqda',
    accepted: 'Siz qabul qildingiz',
    preparing: 'Tayyorlanmoqda',
    ready: 'Tayyor, olib ketish/yetkazish kutilmoqda',
    picked_up: 'Olib ketildi',
    delivered: 'Yetkazildi',
    cancelled: 'Bekor qilindi'
};

const TYPE_ICONS = {
    order: 'fa-bag-shopping',
    review: 'fa-star',
    system: 'fa-bell',
    promo: 'fa-gift',
    info: 'fa-circle-info'
};

let allItems = [];
let activeFilter = 'all';
let myUserId = null;

function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'hozirgina';
    if (diffMin < 60) return diffMin + ' daqiqa oldin';
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return diffHour + ' soat oldin';
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return diffDay + ' kun oldin';
    return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

async function boot() {
    if (!client) {
        renderEmpty('Bildirishnomalarni yuklab bo\'lmadi (Supabase ulanmagan).');
        return;
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session) return;
    myUserId = session.user.id;

    const { data: profile } = await client
        .from('profiles')
        .select('full_name')
        .eq('id', myUserId)
        .single();
    const chefName = profile?.full_name || '';

    const { data: chefRow } = await client
        .from('chefs')
        .select('id')
        .eq('user_id', myUserId)
        .maybeSingle();
    const myChefId = chefRow?.id || null;

    const [ordersRes, reviewsRes, notifsRes] = await Promise.all([
        chefName
            ? client.from('orders').select('id, order_number, food_name, customer_name, status, created_at')
                .eq('chef_name', chefName).order('created_at', { ascending: false }).limit(40)
            : Promise.resolve({ data: [] }),
        myChefId
            ? client.from('reviews').select('id, user_id, rating, comment, created_at')
                .eq('chef_id', myChefId).order('created_at', { ascending: false }).limit(40)
            : Promise.resolve({ data: [] }),
        client.from('notifications').select('id, title, body, type, is_read, created_at')
            .eq('user_id', myUserId).order('created_at', { ascending: false }).limit(40)
    ]);

    const orders = ordersRes.data || [];
    const reviews = reviewsRes.data || [];
    const notifs = notifsRes.data || [];

    let reviewerNames = {};
    const reviewerIds = Array.from(new Set(reviews.map(r => r.user_id).filter(Boolean)));
    if (reviewerIds.length) {
        const { data: reviewers } = await client.from('profiles').select('id, full_name').in('id', reviewerIds);
        (reviewers || []).forEach(p => { reviewerNames[p.id] = p.full_name || 'Mijoz'; });
    }

    const orderItems = orders.map(o => ({
        key: 'order-' + o.id,
        type: 'order',
        title: `Buyurtma #${o.order_number || o.id}`,
        desc: `${o.food_name || 'Taom'} — ${o.customer_name || 'Mijoz'} • ${ORDER_STATUS_LABELS[o.status] || o.status}`,
        created_at: o.created_at,
        unread: o.status === 'pending',
        dbId: null
    }));

    const reviewItems = reviews.map(r => ({
        key: 'review-' + r.id,
        type: 'review',
        title: `Yangi sharh — ${'⭐'.repeat(r.rating)} (${r.rating}/5)`,
        desc: `${reviewerNames[r.user_id] || 'Mijoz'}: "${r.comment || 'Izohsiz baho qoldirdi'}"`,
        created_at: r.created_at,
        unread: false,
        dbId: null
    }));

    const systemItems = notifs.map(n => ({
        key: 'notif-' + n.id,
        type: n.type || 'system',
        title: n.title,
        desc: n.body || '',
        created_at: n.created_at,
        unread: !n.is_read,
        dbId: n.id
    }));

    allItems = [...orderItems, ...reviewItems, ...systemItems]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    renderList();
}

function renderEmpty(message) {
    notifList.innerHTML = `
        <div class="notif-empty">
            <i class="fa-regular fa-bell-slash"></i>
            <h3>Bildirishnoma yo'q</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function renderList() {
    const filtered = activeFilter === 'all' ? allItems : allItems.filter(i => i.type === activeFilter);

    if (!filtered.length) {
        renderEmpty(activeFilter === 'all'
            ? 'Hozircha hech qanday bildirishnoma yo\'q.'
            : 'Bu turdagi bildirishnomalar hozircha yo\'q.');
        return;
    }

    notifList.innerHTML = filtered.map(item => `
        <div class="notif-item ${item.unread ? 'unread' : ''}" data-key="${item.key}" ${item.dbId ? `data-db-id="${item.dbId}"` : ''}>
            <div class="notif-icon type-${item.type}"><i class="fa-solid ${TYPE_ICONS[item.type] || 'fa-bell'}"></i></div>
            <div class="notif-body">
                <div class="notif-top-row">
                    <span class="notif-title">${escapeHtml(item.title)}</span>
                    <span class="notif-time">${timeAgo(item.created_at)}</span>
                </div>
                <p class="notif-desc">${escapeHtml(item.desc)}</p>
            </div>
            ${item.unread ? '<span class="unread-marker"></span>' : ''}
        </div>
    `).join('');

    notifList.querySelectorAll('.notif-item[data-db-id]').forEach(el => {
        el.addEventListener('click', () => markOneRead(el));
    });
}

async function markOneRead(el) {
    const dbId = el.dataset.dbId;
    if (!dbId || !el.classList.contains('unread')) return;
    el.classList.remove('unread');
    const marker = el.querySelector('.unread-marker');
    if (marker) marker.remove();

    const item = allItems.find(i => String(i.dbId) === String(dbId));
    if (item) item.unread = false;

    try {
        await client.from('notifications').update({ is_read: true }).eq('id', dbId);
    } catch (err) {
        console.error('Bildirishnomani o\'qilgan deb belgilashda xatolik:', err);
    }
}

btnMarkAllRead.addEventListener('click', async () => {
    const unreadDbIds = allItems.filter(i => i.unread && i.dbId).map(i => i.dbId);
    allItems.forEach(i => { if (i.dbId) i.unread = false; });
    renderList();

    if (!unreadDbIds.length || !client) return;
    try {
        await client.from('notifications').update({ is_read: true }).in('id', unreadDbIds).eq('user_id', myUserId);
    } catch (err) {
        console.error('Barchasini o\'qilgan deb belgilashda xatolik:', err);
    }
});

notifTabs.querySelectorAll('.notif-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        notifTabs.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.dataset.filter;
        renderList();
    });
});

boot();
