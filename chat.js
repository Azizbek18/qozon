/* ==========================================
   QOZON — CHAT (public.conversations / public.chat_messages)
   ========================================== */
const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
const chatClient = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const messagesBox = document.getElementById("messagesBox");
const dynamicHeader = document.getElementById("dynamicHeader");
const suggestionsPanel = document.getElementById("suggestionsPanel");
const chatInputField = document.getElementById("chatInputField");

let myUserId = null;      // auth.uid()
let myChefId = null;      // agar oshpaz bo'lsa — chefs.id
let isChef = false;
let conversations = [];   // {id, customer_id, chef_id, order_id, customer_name, chef_name}
let activeConversationId = null;
let messagesChannel = null;

if (chatInputField) chatInputField.disabled = true;

function getClockTime(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

const AVATAR_PALETTE = ['#e63946', '#ff8a5b', '#ffb703', '#2a9d8f', '#457b9d', '#8e44ad', '#e07a5f', '#3a86ff'];
function avatarColorFor(name) {
  const code = (name || '').trim().charCodeAt(0) || 0;
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}
function avatarInitialHTML(name) {
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return `<div class="user-avatar" style="display:flex;align-items:center;justify-content:center;background:${avatarColorFor(name)};color:#fff;font-weight:700;">${letter}</div>`;
}

/* ---------- ISHGA TUSHIRISH ---------- */
async function bootChat() {
  if (!chatClient) {
    messagesBox.innerHTML = `<div class="chat-empty-state">Chat ishlamayapti (Supabase yuklanmadi).</div>`;
    return;
  }
  const { data: { user } } = await chatClient.auth.getUser();
  if (!user) {
    messagesBox.innerHTML = `<div class="chat-empty-state">Chatdan foydalanish uchun tizimga kiring.</div>`;
    return;
  }
  myUserId = user.id;

  const { data: chefRow } = await chatClient.from('chefs').select('id').eq('user_id', myUserId).maybeSingle();
  if (chefRow) {
    isChef = true;
    myChefId = chefRow.id;
    await loadChefConversations();
  } else {
    isChef = false;
    await loadOrCreateCustomerConversation();
  }
}

/* ---------- OSHPAZ REJIMI: barcha suhbatlar ro'yxati ---------- */
async function loadChefConversations() {
  const list = document.querySelector('.conversation-list');
  if (list) list.innerHTML = `<div class="convo-list-placeholder">Yuklanmoqda...</div>`;

  const { data, error } = await chatClient
    .from('conversations')
    .select('id, customer_id, chef_id, order_id, created_at')
    .eq('chef_id', myChefId)
    .order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    conversations = [];
    if (list) list.innerHTML = `<div class="convo-list-placeholder">Hozircha suhbatlar yo'q.</div>`;
    dynamicHeader.innerHTML = '';
    messagesBox.innerHTML = `<div class="chat-empty-state"><i class="fa-regular fa-comments" style="font-size:28px;display:block;margin-bottom:10px;color:var(--text-faint)"></i>Hozircha suhbatlar yo'q.</div>`;
    suggestionsPanel.innerHTML = '';
    return;
  }

  const customerIds = Array.from(new Set(data.map(c => c.customer_id)));
  const { data: profiles } = await chatClient.from('profiles').select('id, full_name').in('id', customerIds);
  const namesById = {};
  (profiles || []).forEach(p => { namesById[p.id] = p.full_name || 'Mijoz'; });

  conversations = data.map(c => ({ ...c, customer_name: namesById[c.customer_id] || 'Mijoz' }));

  if (list) {
    list.innerHTML = conversations.map((c, i) => `
      <div class="convo-item${i === 0 ? ' active' : ''}" data-conv-id="${c.id}" onclick="changeActiveChat(${c.id})">
        <div class="avatar-ring${i === 0 ? ' online' : ''}">
          ${avatarInitialHTML(c.customer_name)}
        </div>
        <div class="convo-details">
          <div class="convo-meta">
            <h4>${c.customer_name}</h4>
            <span class="time-stamp">${new Date(c.created_at).toLocaleDateString('uz')}</span>
          </div>
          <p class="preview-text" id="side-preview-${c.id}">Suhbatni ochish uchun bosing</p>
        </div>
      </div>
    `).join('');
  }

  subscribeToAllChefMessages();
  if (conversations.length) openConversation(conversations[0].id);
}

/* ---------- MIJOZ REJIMI: bitta suhbatni topish/yaratish ---------- */
async function loadOrCreateCustomerConversation() {
  const params = new URLSearchParams(window.location.search);
  // Ba'zi statik hostinglar ".html" manzillarni "toza" URL'ga
  // yo'naltirishda query-string'ni tashlab yuborishi mumkin — shu sabab
  // orderId topilmasa, joriy faol buyurtmaga (localStorage) qaraymiz.
  const orderId = params.get('orderId') || localStorage.getItem('qz_current_order_id');
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.style.display = 'none';
  document.querySelector('.premium-app')?.classList.add('mobile-chat-open');

  if (!orderId) {
    dynamicHeader.innerHTML = '';
    messagesBox.innerHTML = `<div class="chat-empty-state"><i class="fa-regular fa-comment-dots" style="font-size:28px;display:block;margin-bottom:10px;color:var(--text-faint)"></i>Suhbat topilmadi. Buyurtma kuzatuvi orqali oshpazga xabar yozing.</div>`;
    return;
  }

  const { data: order, error: orderErr } = await chatClient
    .from('orders').select('id, chef_id, chef_name').eq('id', orderId).single();
  if (orderErr || !order || !order.chef_id) {
    dynamicHeader.innerHTML = '';
    messagesBox.innerHTML = `<div class="chat-empty-state">Bu buyurtma uchun oshpaz aniqlanmadi.</div>`;
    return;
  }

  let { data: conv } = await chatClient
    .from('conversations').select('id')
    .eq('customer_id', myUserId).eq('chef_id', order.chef_id).eq('order_id', order.id)
    .maybeSingle();

  if (!conv) {
    const { data: created, error: createErr } = await chatClient
      .from('conversations')
      .insert({ customer_id: myUserId, chef_id: order.chef_id, order_id: order.id })
      .select().single();
    if (createErr) {
      dynamicHeader.innerHTML = '';
      messagesBox.innerHTML = `<div class="chat-empty-state">Suhbat ochilmadi: ${createErr.message}</div>`;
      return;
    }
    conv = created;
  }

  conversations = [{ id: conv.id, chef_name: order.chef_name || 'Oshpaz' }];
  openConversation(conv.id, order.chef_name || 'Oshpaz');
}

/* ---------- SUHBATNI OCHISH ---------- */
async function openConversation(conversationId, headerName) {
  activeConversationId = conversationId;
  if (chatInputField) chatInputField.disabled = false;
  document.querySelectorAll('.convo-item').forEach(el => {
    el.classList.toggle('active', el.dataset.convId === String(conversationId));
  });

  const conv = conversations.find(c => c.id === conversationId);
  const title = headerName || (conv ? (conv.customer_name || conv.chef_name) : 'Suhbat');
  const roleLabel = isChef ? 'Mijoz' : 'Oshpaz';

  dynamicHeader.innerHTML = `
    <div class="active-user-meta">
      <button class="header-back-btn" onclick="handleChatBack()"><i class="fa-solid fa-arrow-left"></i></button>
      <div class="avatar-ring online">${avatarInitialHTML(title)}</div>
      <div class="meta-info"><h3>${title}</h3><p>${roleLabel}</p></div>
    </div>
  `;
  suggestionsPanel.innerHTML = '';

  await renderChatMessages();
  subscribeToActiveConversation();
}

function changeActiveChat(conversationId) {
  document.querySelector('.premium-app')?.classList.add('mobile-chat-open');
  openConversation(conversationId);
}

/* Mobilda: suhbat ochilgan bo'lsa ro'yxatga qaytish, aks holda haqiqiy orqaga navigatsiya */
function handleChatBack() {
  const app = document.querySelector('.premium-app');
  const sidebar = document.querySelector('.sidebar');
  const sidebarAvailable = sidebar && sidebar.style.display !== 'none';
  if (app && sidebarAvailable && app.classList.contains('mobile-chat-open')) {
    app.classList.remove('mobile-chat-open');
  } else {
    window.history.back();
  }
}

/* ---------- XABARLARNI YUKLASH VA CHIZISH ---------- */
async function renderChatMessages() {
  if (!activeConversationId) return;
  messagesBox.innerHTML = '<div class="timeline-center"><span>Yuklanmoqda...</span></div>';

  const { data, error } = await chatClient
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', activeConversationId)
    .order('created_at', { ascending: true });

  if (error || !data) { messagesBox.innerHTML = ''; return; }

  messagesBox.innerHTML = '<div class="timeline-center"><span>Suhbat</span></div>';
  data.forEach(item => appendMessageToDOM(item));
  messagesBox.scrollTop = messagesBox.scrollHeight;

  const unreadIds = data.filter(m => !m.is_read && m.sender_id !== myUserId).map(m => m.id);
  if (unreadIds.length) {
    chatClient.from('chat_messages').update({ is_read: true }).in('id', unreadIds).then(() => {});
  }
}

function appendMessageToDOM(item) {
  const isOutgoing = item.sender_id === myUserId;
  const checkIcon = isOutgoing ? '<span class="double-check">✓✓</span>' : '';
  const content = item.image_url ? `<img src="${item.image_url}" class="uploaded-media-img">` : (item.message || '');

  const row = document.createElement('div');
  row.classList.add('msg-wrapper', isOutgoing ? 'outgoing' : 'incoming');
  row.innerHTML = `
    <div class="premium-bubble">
      ${content}
      <span class="bubble-time">${getClockTime(item.created_at)}${checkIcon}</span>
    </div>`;
  messagesBox.appendChild(row);
}

/* ---------- XABAR YUBORISH ---------- */
async function handleMessageSubmit() {
  const rawText = chatInputField.value.trim();
  if (!rawText || !activeConversationId) return;
  chatInputField.value = '';
  await sendMessage({ message: rawText });
}

async function mediaUploadHandler(event) {
  const file = event.target.files[0];
  if (!file || !activeConversationId) return;
  const reader = new FileReader();
  reader.onload = async (e) => { await sendMessage({ image_url: e.target.result }); };
  reader.readAsDataURL(file);
}

async function sendMessage(fields) {
  const payload = { conversation_id: activeConversationId, sender_id: myUserId, message: null, image_url: null, ...fields };
  const { data, error } = await chatClient.from('chat_messages').insert(payload).select().single();
  if (error) { console.error('Xabar yuborishda xatolik:', error); return; }
  appendMessageToDOM(data);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  const previewEl = document.getElementById(`side-preview-${activeConversationId}`);
  if (previewEl) previewEl.innerText = fields.image_url ? '📷 Rasm yuborildi' : fields.message;
}

/* ---------- REALTIME ---------- */
function subscribeToActiveConversation() {
  if (messagesChannel) chatClient.removeChannel(messagesChannel);
  messagesChannel = chatClient
    .channel('chat-messages-' + activeConversationId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${activeConversationId}` }, (payload) => {
      if (payload.new.sender_id === myUserId) return; // o'zimiz allaqachon qo'shdik
      appendMessageToDOM(payload.new);
      messagesBox.scrollTop = messagesBox.scrollHeight;
      chatClient.from('chat_messages').update({ is_read: true }).eq('id', payload.new.id).then(() => {});
    })
    .subscribe();
}

function subscribeToAllChefMessages() {
  if (!myChefId) return;
  chatClient
    .channel('chef-inbox-' + myChefId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
      const conv = conversations.find(c => c.id === payload.new.conversation_id);
      if (!conv) return; // boshqa oshpazga tegishli suhbat
      const previewEl = document.getElementById(`side-preview-${conv.id}`);
      if (previewEl && payload.new.conversation_id !== activeConversationId) {
        previewEl.innerText = payload.new.image_url ? '📷 Rasm' : payload.new.message;
      }
      if (payload.new.conversation_id === activeConversationId && payload.new.sender_id !== myUserId) {
        appendMessageToDOM(payload.new);
        messagesBox.scrollTop = messagesBox.scrollHeight;
      }
    })
    .subscribe();
}

function handleInputKey(e) {
  if (e.key === "Enter") handleMessageSubmit();
}

/* ---------- EMOJI PANEL ---------- */
function toggleEmojiPicker(event) {
  event.stopPropagation();
  const picker = document.getElementById("customEmojiPicker");
  picker.classList.toggle("show");
}

function insertEmoji(emoji) {
  const inputField = document.getElementById("chatInputField");
  inputField.value += emoji;
  inputField.focus();
}

document.addEventListener("click", function (event) {
  const picker = document.getElementById("customEmojiPicker");
  const toggleBtn = document.getElementById("emojiToggleBtn");
  if (picker && !picker.contains(event.target) && event.target !== toggleBtn) {
    picker.classList.remove("show");
  }
});

bootChat();
