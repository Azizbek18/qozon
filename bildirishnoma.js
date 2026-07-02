/* ============================================================
   API SIMULATSIYASI — to'liq backend simulyatsiya
   ============================================================ */
const API = {
  _codes: {},
  _users: JSON.parse(localStorage.getItem('qz_users') || '[]'),
  _save() { localStorage.setItem('qz_users', JSON.stringify(this._users)); },
  _genCode() { return String(Math.floor(100000 + Math.random() * 900000)); },
  _delay(ms) { return new Promise(r => setTimeout(r, ms)); },

  // Ro'yxatdan o'tish — validatsiya + kod generatsiya
  async register(d) {
    await this._delay(800);
    if (!d.name || !d.surname || !d.email || !d.phone || !d.password)
      return { ok: false, msg: "Barcha maydonlarni to'ldiring" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      return { ok: false, msg: "Noto'g'ri email formati" };
    if (!/^\+?998\d{9}$/.test(d.phone.replace(/\s/g, '')))
      return { ok: false, msg: "Noto'g'ri telefon formati (+998...)" };
    if (this._users.find(u => u.email === d.email))
      return { ok: false, msg: "Bu email allaqachon ro'yxatdan o'tgan" };
    if (this._users.find(u => u.phone === d.phone))
      return { ok: false, msg: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
    if (d.password.length < 6)
      return { ok: false, msg: "Parol kamida 6 belgi bo'lishi kerak" };
    if (d.password !== d.password2)
      return { ok: false, msg: "Parollar mos kelmayapti" };
    const code = this._genCode();
    this._codes[d.email] = code;
    this._codes[d.phone] = code;
    return { ok: true, code, to: d.email, phone: d.phone };
  },

  // Kod yuborish
  async sendCode(to) {
    await this._delay(600);
    const code = this._genCode();
    this._codes[to] = code;
    return { ok: true, code, to };
  },

  // Kod tasdiqlash
  async verifyCode(to, code) {
    await this._delay(400);
    if (this._codes[to] && this._codes[to] === code) {
      delete this._codes[to];
      return { ok: true };
    }
    return { ok: false, msg: "Noto'g'ri kod" };
  },

  // Ro'yxatni tasdiqlash
  async confirmRegister(d) {
    await this._delay(500);
    const user = {
      id: Date.now(),
      name: d.name, surname: d.surname,
      email: d.email, phone: d.phone,
      password: d.password,
      createdAt: new Date().toISOString(),
      orders: 0, totalSpent: 0
    };
    this._users.push(user);
    this._save();
    return { ok: true, user };
  },

  // Kirish
  async login(emailOrPhone, password) {
    await this._delay(700);
    const user = this._users.find(
      u => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.password === password
    );
    if (!user) return { ok: false, msg: "Email/telefon yoki parol noto'g'ri" };
    return { ok: true, user };
  },

  // Buyurtma yaratish
  async createOrder(d) {
    await this._delay(900);
    const orderId = '#QZ-' + Math.floor(10000 + Math.random() * 90000);
    const user = this._users.find(u => u.id === currentUser?.id);
    if (user) { user.orders = (user.orders || 0) + 1; this._save(); }
    return { ok: true, orderId };
  },

  // Profil yangilash
  async updateProfile(uid, updates) {
    await this._delay(500);
    const u = this._users.find(x => x.id === uid);
    if (!u) return { ok: false };
    Object.assign(u, updates);
    this._save();
    return { ok: true, user: u };
  },

  // Parol o'zgartirish
  async changePass(uid, oldP, newP) {
    await this._delay(500);
    const u = this._users.find(x => x.id === uid);
    if (!u) return { ok: false, msg: "Foydalanuvchi topilmadi" };
    if (u.password !== oldP) return { ok: false, msg: "Eski parol noto'g'ri" };
    if (newP.length < 6) return { ok: false, msg: "Yangi parol kamida 6 belgi" };
    u.password = newP;
    this._save();
    return { ok: true };
  },

  // Hisobni o'chirish
  async deleteAccount(uid) {
    await this._delay(600);
    this._users = this._users.filter(u => u.id !== uid);
    this._save();
    return { ok: true };
  },

  // Telefon bo'yicha foydalanuvchi qidirish
  findUserByPhone(phone) {
    return this._users.find(u => u.phone === phone) || null;
  }
};

/* ============================================================
   12 TA TIL
   ============================================================ */
const LANGS = [
  { code: 'uz', label: "O'zbekcha", flag: "\u{1F1FA}\u{1F1FF}" },
  { code: 'ru', label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: 'en', label: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: 'tr', label: "T\u00FCrk\u00E7e", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: 'ko', label: "\uD55C\uAD6D\uC5B4", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: 'zh', label: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: 'ar', label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: 'es', label: "Espa\u00F1ol", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: 'fr', label: "Fran\u00E7ais", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: 'de', label: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: 'ja', label: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: 'hi', label: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" }
];

/* ============================================================
   HOLAT O'ZGARUVCHILARI
   ============================================================ */
let currentLang = localStorage.getItem('qz_lang') || 'uz';
let currentUser = JSON.parse(localStorage.getItem('qz_current') || 'null');
let currentCurrency = localStorage.getItem('qz_curr') || 'UZS';
let verifyTarget = '', verifyAction = '', pendingRegData = null, pendingOrderData = null;
let deliveryType = 'delivery', deliveryFee = 15000, promoApplied = false, promoDiscount = 0;
const SERVICE_RATE = 0.05;
const RATES = { UZS: 1, RUB: 0.00735, USD: 0.0000794 };
const SYMBOLS = { UZS: "so'm", RUB: "\u20BD", USD: "$" };

const cartData = [
  { id: 1, name: "Osh to'pi", rest: "Osh Markazi", price: 35000, oldPrice: 42000, qty: 2, img: "https://picsum.photos/seed/osh11/200/200.jpg", tags: [{ text: "Mashhur", type: "hot" }, { text: "Go'shtli", type: "" }], checked: true },
  { id: 2, name: "Manti (10 dona)", rest: "Cho'lpon Milliy Taomlar", price: 45000, oldPrice: null, qty: 1, img: "https://picsum.photos/seed/manti22/200/200.jpg", tags: [{ text: "Yangi", type: "new" }], checked: true },
  { id: 3, name: "Lag'mon", rest: "Buxoro Cafe", price: 32000, oldPrice: 38000, qty: 1, img: "https://picsum.photos/seed/lagmon33/200/200.jpg", tags: [], checked: true },
  { id: 4, name: "Shashlik (6 dona)", rest: "Cho'lpon Milliy Taomlar", price: 55000, oldPrice: null, qty: 1, img: "https://picsum.photos/seed/shash44/200/200.jpg", tags: [{ text: "Mashhur", type: "hot" }], checked: false },
  { id: 5, name: "Norin", rest: "Osh Markazi", price: 28000, oldPrice: 33000, qty: 1, img: "https://picsum.photos/seed/norin55/200/200.jpg", tags: [], checked: true }
];
const recommendations = [
  { name: "Chak-chak", rest: "Tatar Sariqi", price: 18000, img: "https://picsum.photos/seed/chak66/200/200.jpg" },
  { name: "Somsa (5 dona)", rest: "Somsa Xon", price: 25000, img: "https://picsum.photos/seed/somsa77/200/200.jpg" },
  { name: "Qozon kabob", rest: "Buxoro Cafe", price: 65000, img: "https://picsum.photos/seed/kabob88/200/200.jpg" }
];

/* ============================================================
   VALYUTA
   ============================================================ */
function convertPrice(u) { return Math.round(u * RATES[currentCurrency]) }
function formatPrice(u) { return convertPrice(u).toLocaleString('uz-UZ') + ' ' + SYMBOLS[currentCurrency] }
function setCurrency(c) {
  currentCurrency = c; localStorage.setItem('qz_curr', c);
  renderCart(); renderCartDD(); updateSummary(); renderRecs();
  const d1 = document.getElementById('delPrice1');
  if (d1 && deliveryFee > 0) d1.textContent = formatPrice(deliveryFee);
}

/* ============================================================
   TIL
   ============================================================ */
function renderLangMenu() {
  document.getElementById('langMenu').innerHTML = LANGS.map(l =>
    `<button data-code="${l.code}" class="${l.code === currentLang ? 'active' : ''}" onclick="setLang('${l.code}');closeLangMenu()">${l.flag} ${l.label}</button>`
  ).join('');
  const s = document.getElementById('settLangSelect');
  if (s) s.innerHTML = LANGS.map(l => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.flag} ${l.label}</option>`).join('');
}
function toggleLangMenu() { const m = document.getElementById('langMenu'), b = document.getElementById('langBtn'); m.classList.toggle('open'); b.classList.toggle('open'); closeCartDD() }
function closeLangMenu() { document.getElementById('langMenu').classList.remove('open'); document.getElementById('langBtn').classList.remove('open') }
function setLang(c) { currentLang = c; localStorage.setItem('qz_lang', c); document.getElementById('langLbl').textContent = c.toUpperCase(); renderLangMenu(); renderCart(); renderCartDD(); renderRecs() }

/* ============================================================
   SAVAT CHIZISH
   ============================================================ */
function renderCart() {
  const c = document.getElementById('cartItems'), ti = cartData.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = ti + ' ta';
  document.getElementById('cartBadge').textContent = ti;
  document.getElementById('statItems').textContent = ti;
  document.getElementById('heroTag').textContent = ti + ' ta mahsulot tanlangan';
  let saved = 0; cartData.forEach(i => { if (i.oldPrice) saved += (i.oldPrice - i.price) * i.qty });
  document.getElementById('statSaved').textContent = convertPrice(saved).toLocaleString('uz-UZ');
  if (!cartData.length) {
    c.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon"><i class="fas fa-shopping-bag"></i></div><h3>Savat bo'sh</h3><p>Hali hech narsa qo'shilmagan.</p></div>`;
    document.getElementById('orderBtn').disabled = true; updateSummary(); return;
  }
  document.getElementById('orderBtn').disabled = false;
  c.innerHTML = cartData.map((item, idx) => {
    const tagsH = item.tags.map(tg => `<span class="ci-tag ${tg.type}">${tg.text}</span>`).join('');
    const sa = item.oldPrice ? (item.oldPrice - item.price) * item.qty : 0;
    return `<div class="ci" data-id="${item.id}" style="animation:fiu .5s ease-out ${idx * .05}s both">
      <div class="ci-check ${item.checked ? 'checked' : ''}" onclick="toggleCheck(${item.id})"><i class="fas fa-check"></i></div>
      <div class="ci-img"><img src="${item.img}" alt="${item.name}" loading="lazy"/></div>
      <div class="ci-info"><div class="ci-name">${item.name}</div><div class="ci-rest"><i class="fas fa-store"></i> ${item.rest}</div><div class="ci-tags">${tagsH}</div></div>
      <div class="ci-qty"><button onclick="changeQty(${item.id},-1)" ${item.qty <= 1 ? 'disabled' : ''}><i class="fas fa-minus"></i></button><div class="qty-val" id="qv${item.id}">${item.qty}</div><button onclick="changeQty(${item.id},1)"><i class="fas fa-plus"></i></button></div>
      <div class="ci-price">${item.oldPrice ? `<span class="old-price">${formatPrice(item.oldPrice * item.qty)}</span>` : ''}${formatPrice(item.price * item.qty)}${sa > 0 ? `<span class="save-badge">-${formatPrice(sa)}</span>` : ''}</div>
      <button class="ci-del" onclick="removeItem(${item.id})"><i class="fas fa-trash-alt"></i></button></div>`;
  }).join('');
  updateSummary();
}

function renderCartDD() {
  const dd = document.getElementById('cartDD');
  if (!cartData.length) { dd.innerHTML = `<div style="padding:30px 20px;text-align:center;color:var(--text2);font-size:13px"><i class="fas fa-shopping-bag" style="font-size:32px;opacity:.15;display:block;margin-bottom:10px"></i>Savat bo'sh</div>`; return }
  const total = cartData.reduce((s, i) => s + i.price * i.qty, 0);
  dd.innerHTML = `<div class="cart-dd-hd"><span><i class="fas fa-shopping-bag" style="color:var(--accent);margin-right:6px"></i> Savat (${cartData.reduce((s, i) => s + i.qty, 0)})</span><button class="cart-dd-clear" onclick="clearCart();renderCartDD()">Tozalash</button></div>
    <div class="cart-dd-items">${cartData.slice(0, 5).map(i => `<div class="cart-dd-item"><img src="${i.img}" alt="${i.name}"/><div class="cdd-info"><div class="cdd-name">${i.name}</div><div class="cdd-rest">${i.rest}</div></div><div class="cdd-right"><div class="cdd-price">${formatPrice(i.price * i.qty)}</div><div class="cdd-qty">x${i.qty}</div></div></div>`).join('')}${cartData.length > 5 ? `<div style="padding:10px 18px;text-align:center;font-size:11px;color:var(--text3)">+${cartData.length - 5} ta ko'proq</div>` : ''}</div>
    <div class="cart-dd-foot"><div class="cart-dd-total">${formatPrice(total)}</div><button class="cart-dd-go" onclick="closeCartDD();window.scrollTo({top:0,behavior:'smooth'})">Savatga o'tish</button></div>`;
}

function renderRecs() {
  document.getElementById('recList').innerHTML = recommendations.map(r =>
    `<div class="rec-item"><img src="${r.img}" alt="${r.name}" loading="lazy"/><div class="rec-info"><div class="rec-name">${r.name}</div><div class="rec-rest">${r.rest}</div></div><div class="rec-price">${formatPrice(r.price)}</div><button class="rec-add" onclick="addRec('${r.name}','${r.rest}',${r.price},'${r.img}')"><i class="fas fa-plus"></i></button></div>`
  ).join('');
}

function changeQty(id, d) {
  const i = cartData.find(x => x.id === id); if (!i) return;
  i.qty = Math.max(1, i.qty + d); renderCart(); renderCartDD();
  const el = document.getElementById('qv' + id);
  if (el) { el.classList.remove('qty-bump'); void el.offsetWidth; el.classList.add('qty-bump'); }
}
function toggleCheck(id) { const i = cartData.find(x => x.id === id); if (i) { i.checked = !i.checked; renderCart(); } }
function removeItem(id) {
  const el = document.querySelector(`.ci[data-id="${id}"]`);
  if (el) { el.classList.add('ci-removing'); setTimeout(() => { const it = cartData.find(x => x.id === id); cartData = cartData.filter(x => x.id !== id); renderCart(); renderCartDD(); if (it) showToast('warning', "O'chirildi", it.name + ' olib tashlandi'); }, 400); }
}
function clearCart() {
  if (!cartData.length) return; cartData.length = 0; promoApplied = false; promoDiscount = 0;
  document.getElementById('discountRow').style.display = 'none'; document.getElementById('promoBtn').textContent = "Qo'llash";
  document.getElementById('promoBtn').classList.remove('applied'); document.getElementById('promoInput').disabled = false; document.getElementById('promoInput').value = '';
  renderCart(); renderCartDD(); showToast('info', 'Tozalandi', 'Savat bo\'shatildi');
}
function addRec(name, rest, price, img) {
  const ex = cartData.find(i => i.name === name);
  if (ex) { ex.qty++; renderCart(); renderCartDD(); showToast('info', 'Yangilandi', name + ' miqdori oshirildi'); return }
  cartData.push({ id: Date.now(), name, rest, price, oldPrice: null, qty: 1, img, tags: [{ text: 'Yangi', type: 'new' }], checked: true });
  renderCart(); renderCartDD(); showToast('success', 'Qo\'shildi', name + ' savatga qo\'shildi');
}
function updateSummary() {
  const ch = cartData.filter(i => i.checked), sub = ch.reduce((s, i) => s + i.price * i.qty, 0),
    svc = Math.round(sub * SERVICE_RATE), disc = promoApplied ? Math.round(sub * promoDiscount) : 0, tot = Math.max(0, sub + deliveryFee + svc - disc);
  document.getElementById('subtotalVal').textContent = formatPrice(sub);
  document.getElementById('deliveryVal').textContent = deliveryFee === 0 ? 'Bepul' : formatPrice(deliveryFee);
  document.getElementById('serviceVal').textContent = formatPrice(svc);
  document.getElementById('totalVal').textContent = formatPrice(tot);
  if (promoApplied && disc > 0) { document.getElementById('discountRow').style.display = 'flex'; document.getElementById('discountVal').textContent = '-' + formatPrice(disc); }
  else { document.getElementById('discountRow').style.display = 'none'; }
}
function applyPromo() {
  const inp = document.getElementById('promoInput'), btn = document.getElementById('promoBtn'), code = inp.value.trim().toUpperCase();
  if (promoApplied) return; if (!code) { showToast('error', 'Xato', 'Promo kodni kiriting'); inp.focus(); return }
  if (code === 'QOZON20') { promoApplied = true; promoDiscount = .2; btn.textContent = "Qo'llandi"; btn.classList.add('applied'); inp.disabled = true; updateSummary(); showToast('success', 'Promo faol!', '20% chegirma') }
  else if (code === 'BEPUL') { promoApplied = true; promoDiscount = 0; deliveryFee = 0; btn.textContent = "Qo'llandi"; btn.classList.add('applied'); inp.disabled = true; updateSummary(); showToast('success', 'Promo faol!', 'Yetkazib berish bepul') }
  else { showToast('error', 'Xato', 'Noto\'g\'ri promo kod'); inp.style.borderColor = 'var(--danger)'; setTimeout(() => inp.style.borderColor = '', 2000) }
}
function selectDelivery(el, type, fee) {
  document.querySelectorAll('.del-opt').forEach(o => o.classList.remove('active')); el.classList.add('active');
  deliveryType = type; deliveryFee = fee; const d1 = document.getElementById('delPrice1'); if (d1 && fee > 0) d1.textContent = formatPrice(fee); updateSummary();
}
function toggleCartDD() { const dd = document.getElementById('cartDD'); closeLangMenu(); if (dd.classList.contains('open')) closeCartDD(); else { renderCartDD(); dd.classList.add('open') } }
function closeCartDD() { document.getElementById('cartDD').classList.remove('open') }

/* ============================================================
   AUTH — KIRISH / RO'YXATDAN O'TISH
   ============================================================ */
function switchAuthTab(tab) {
  document.querySelectorAll('#authTabs button').forEach((b, i) => b.classList.toggle('active', i === (tab === 'login' ? 0 : 1)));
  document.getElementById('loginPanel').classList.toggle('active', tab === 'login');
  document.getElementById('registerPanel').classList.toggle('active', tab === 'register');
  document.getElementById('authTitle').textContent = tab === 'login' ? 'Kirish' : "Ro'yxatdan o'tish";
}

async function doRegister() {
  const d = {
    name: document.getElementById('regName').value.trim(),
    surname: document.getElementById('regSurname').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    phone: document.getElementById('regPhone').value.trim().replace(/\s/g, ''),
    password: document.getElementById('regPass').value,
    password2: document.getElementById('regPass2').value
  };
  // Xato maydonlarni tozalash
  document.querySelectorAll('#registerPanel .fi').forEach(f => f.classList.remove('err'));
  const res = await API.register(d);
  if (!res.ok) {
    showToast('error', 'Xato', res.msg);
    // Xato maydonni belgilash
    if (res.msg.includes('email')) document.getElementById('regEmail').classList.add('err');
    if (res.msg.includes('telefon') || res.msg.includes('Telefon')) document.getElementById('regPhone').classList.add('err');
    if (res.msg.includes('Parol')) { document.getElementById('regPass').classList.add('err'); document.getElementById('regPass2').classList.add('err'); }
    if (res.msg.includes('maydon')) document.querySelectorAll('#registerPanel .fi').forEach(f => { if (!f.value.trim()) f.classList.add('err'); });
    return;
  }
  pendingRegData = d; verifyTarget = d.email; verifyAction = 'register';
  closeModal('authModal');
  showVerifyModal(d.email);
  // REAL KOD — SMS va Email notification orqali ko'rinadi
  showNotifToast('sms', d.phone, 'qozon: Tasdiqlash kodi — ' + res.code + '. Hech kimga bermang.');
  setTimeout(() => showNotifToast('email', d.email, 'qozon tasdiqlash kodi: ' + res.code + '. Agar siz bo\'lmasangiz, emailni ozgartiring.'), 1200);
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim(), pass = document.getElementById('loginPass').value;
  document.querySelectorAll('#loginPanel .fi').forEach(f => f.classList.remove('err'));
  if (!email || !pass) {
    showToast('error', 'Xato', 'Maydonlarni to\'ldiring');
    if (!email) document.getElementById('loginEmail').classList.add('err');
    if (!pass) document.getElementById('loginPass').classList.add('err');
    return;
  }
  const res = await API.login(email, pass);
  if (!res.ok) {
    showToast('error', 'Xato', res.msg);
    document.getElementById('loginEmail').classList.add('err');
    document.getElementById('loginPass').classList.add('err');
    return;
  }
  currentUser = res.user; localStorage.setItem('qz_current', JSON.stringify(currentUser));
  closeModal('authModal'); updateProfileUI(); showToast('success', 'Xush kelibsiz!', currentUser.name + '!');
}

function showVerifyModal(to) {
  openModal('verifyModal');
  document.getElementById('verifyTo').textContent = to;
  const box = document.getElementById('codeInputs'); box.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const inp = document.createElement('input'); inp.type = 'text'; inp.maxLength = 1; inp.className = 'code-input'; inp.autocomplete = 'one-time-code';
    inp.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, ''); // Faqat raqam
      if (e.target.value && i < 5) box.children[i + 1].focus();
      e.target.classList.toggle('filled', !!e.target.value);
      e.target.classList.remove('wrong');
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !e.target.value && i > 0) box.children[i - 1].focus(); });
    box.appendChild(inp);
  }
  box.children[0].focus();
  const rl = document.getElementById('resendLink'); rl.classList.add('disabled');
  let sec = 60;
  const iv = setInterval(() => { sec--; rl.textContent = sec + 's'; if (sec <= 0) { clearInterval(iv); rl.classList.remove('disabled'); rl.textContent = 'Kod qayta yuborish'; } }, 1000);
  rl._iv = iv;
}

async function doVerify() {
  const code = Array.from(document.querySelectorAll('.code-input')).map(i => i.value).join('');
  if (code.length < 6) { showToast('error', 'Xato', '6 xonali kodni kiriting'); return }
  const res = await API.verifyCode(verifyTarget, code);
  if (!res.ok) {
    showToast('error', 'Xato', res.msg);
    document.querySelectorAll('.code-input').forEach(i => { i.classList.add('wrong'); i.value = ''; i.classList.remove('filled'); });
    document.querySelector('.code-input').focus();
    return;
  }
  closeModal('verifyModal');
  if (verifyAction === 'register' && pendingRegData) {
    const r = await API.confirmRegister(pendingRegData);
    if (r.ok) { currentUser = r.user; localStorage.setItem('qz_current', JSON.stringify(currentUser)); updateProfileUI(); showToast('success', 'Muvaffaqiyat!', "Ro'yxatdan o'tdingiz, " + currentUser.name + '!'); }
    pendingRegData = null;
  } else if (verifyAction === 'order' && pendingOrderData) {
    await finishOrder(pendingOrderData); pendingOrderData = null;
  }
}

async function resendCode() {
  if (document.getElementById('resendLink').classList.contains('disabled')) return;
  const res = await API.sendCode(verifyTarget);
  if (res.ok) {
    showVerifyModal(verifyTarget);
    showNotifToast('sms', verifyTarget, 'qozon: Yangi tasdiqlash kodi — ' + res.code);
    setTimeout(() => showNotifToast('email', verifyTarget, 'qozon yangi kod: ' + res.code), 800);
  }
}

/* ============================================================
   BUYURTMA FLOW
   ============================================================ */
function startOrder() {
  if (!cartData.filter(i => i.checked).length) { showToast('warning', 'Diqqat', 'Kamida bitta mahsulot tanlang'); return }
  if (!currentUser) { showToast('warning', 'Kirish kerak', 'Avval tizimga kiring'); openModal('authModal'); return }
  openModal('orderFormModal');
  if (currentUser.phone) document.getElementById('orderPhone').value = currentUser.phone;
  if (currentUser.email) document.getElementById('orderEmail').value = currentUser.email;
}

async function sendOrderCode() {
  const phone = document.getElementById('orderPhone').value.trim().replace(/\s/g, ''),
    email = document.getElementById('orderEmail').value.trim(),
    addr = document.getElementById('orderAddress').value.trim();
  document.getElementById('orderPhone').classList.remove('err');
  document.getElementById('orderEmail').classList.remove('err');
  if (!phone) { showToast('error', 'Xato', 'Telefon raqamni kiriting'); document.getElementById('orderPhone').classList.add('err'); return }
  if (!email) { showToast('error', 'Xato', 'Emailni kiriting'); document.getElementById('orderEmail').classList.add('err'); return }
  pendingOrderData = { phone, email, address: addr, note: document.getElementById('orderNote').value.trim() };
  const res = await API.sendCode(phone);
  if (res.ok) {
    verifyTarget = phone; verifyAction = 'order';
    closeModal('orderFormModal');
    showVerifyModal(phone);
    // REAL KOD — SMS va Email notification
    showNotifToast('sms', phone, 'qozon: Buyurtma tasdiqlash kodi — ' + res.code + '. Hech kimga bermang.');
    setTimeout(() => showNotifToast('email', email, 'qozon: Buyurtma kodiniz: ' + res.code + '. Bu kodni kiriting.'), 1500);
  }
}

async function finishOrder(data) {
  const res = await API.createOrder(data); if (!res.ok) return;
  document.getElementById('successOrderId').textContent = res.orderId; openModal('successModal');
  cartData.splice(0, cartData.length, ...cartData.filter(i => !i.checked));
  promoApplied = false; promoDiscount = 0;
  document.getElementById('discountRow').style.display = 'none'; document.getElementById('promoBtn').textContent = "Qo'llash";
  document.getElementById('promoBtn').classList.remove('applied'); document.getElementById('promoInput').disabled = false; document.getElementById('promoInput').value = '';
  renderCart(); renderCartDD(); showToast('success', 'Buyurtma yaratildi', res.orderId);
  // Kuryer xabarnomasi
  setTimeout(() => showNotifToast('courier', data.phone, 'qozon: Kuryer yo\'lga chiqdi. Taxminan 25-35 daqiqa ichida yetib keladi. Buyurtma: ' + res.orderId), 4000);
}

/* ============================================================
   XABARNOMA TOAST — SMS/Email/Kuryer
   ============================================================ */
function showNotifToast(type, to, msg) {
  const tc = document.getElementById('toastContainer'), el = document.createElement('div'); el.className = 'sms-toast';
  const icons = { sms: 'fa-sms', email: 'fa-envelope', courier: 'fa-motorcycle' };
  const cls = { sms: 'sms', email: 'email', courier: 'courier' };
  const now = new Date(); const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  el.innerHTML = `<div class="sms-toast-icon ${cls[type]}"><i class="fas ${icons[type]}"></i></div>
    <div class="sms-toast-body"><div class="sms-toast-title">${type === 'sms' ? 'SMS' : type === 'email' ? 'Email' : 'Kuryer'} — ${to} <span class="verified">REAL KOD</span></div><div class="sms-toast-msg">${msg}</div><div class="sms-toast-time">${time}</div></div>
    <button class="sms-toast-x" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
  tc.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 10000);
}

/* ============================================================
   PROFIL — KO'RISH, O'ZGARTIRISH, CHIQISH
   ============================================================ */
function handleProfileClick() {
  closeCartDD(); closeLangMenu();
  if (!currentUser) { openModal('authModal'); return }
  openModal('profileModal'); switchProfileTab('info');
}

function switchProfileTab(tab) {
  const tabs = document.querySelectorAll('#profileTabs button'), panels = ['ptInfo', 'ptSettings', 'ptSecurity', 'ptLogout'];
  const idx = panels.indexOf('pt' + tab.charAt(0).toUpperCase() + tab.slice(1));
  tabs.forEach((b, i) => b.classList.toggle('active', i === idx));
  panels.forEach((p, i) => document.getElementById(p).classList.toggle('active', i === idx));
  if (tab === 'info' && currentUser) {
    document.getElementById('pfEditName').value = currentUser.name || '';
    document.getElementById('pfEditSurname').value = currentUser.surname || '';
    document.getElementById('pfEditEmail').value = currentUser.email || '';
    document.getElementById('pfEditPhone').value = currentUser.phone || '';
  }
}

async function saveProfile() {
  if (!currentUser) return;
  const r = await API.updateProfile(currentUser.id, {
    name: document.getElementById('pfEditName').value,
    surname: document.getElementById('pfEditSurname').value,
    phone: document.getElementById('pfEditPhone').value
  });
  if (r.ok) { currentUser = r.user; localStorage.setItem('qz_current', JSON.stringify(currentUser)); updateProfileUI(); showToast('success', 'Saqlandi', 'Profil yangilandi'); }
}

async function changePassword() {
  if (!currentUser) return;
  const r = await API.changePass(currentUser.id, document.getElementById('oldPass').value, document.getElementById('newPass').value);
  if (!r.ok) { showToast('error', 'Xato', r.msg); return }
  showToast('success', "O'zgartirildi", 'Parol yangilandi');
  document.getElementById('oldPass').value = ''; document.getElementById('newPass').value = ''; document.getElementById('newPass2').value = '';
}

async function deleteAccount() {
  if (!currentUser) return;
  await API.deleteAccount(currentUser.id);
  currentUser = null; localStorage.removeItem('qz_current');
  closeModal('profileModal'); updateProfileUI(); showToast('info', "O'chirildi", 'Hisob muvaffaqiyatli o\'chirildi');
}

function doLogout() {
  currentUser = null; localStorage.removeItem('qz_current');
  closeModal('profileModal'); updateProfileUI(); showToast('info', 'Chiqdingiz', 'Tizimdan chiqdingiz');
}

function updateProfileUI() {
  const av = document.getElementById('navAv'), nm = document.getElementById('navNm');
  if (currentUser) {
    const initials = (currentUser.name || '')[0] + (currentUser.surname || '')[0];
    nm.textContent = currentUser.name + ' ' + currentUser.surname;
    av.innerHTML = `<span>${initials}</span>`;
    document.getElementById('pfName').textContent = currentUser.name + ' ' + currentUser.surname;
    document.getElementById('pfEmail').textContent = currentUser.email;
    document.getElementById('pfPhone').textContent = currentUser.phone;
    document.getElementById('pfRole').textContent = 'Foydalanuvchi';
    document.getElementById('pfJoined').textContent = "Ro'yxat: " + new Date(currentUser.createdAt).toLocaleDateString('uz-UZ');
    document.getElementById('pfAvBig').innerHTML = `<span>${initials}</span>`;
  } else {
    nm.textContent = 'Profil'; av.innerHTML = '<i class="fas fa-user"></i>';
    document.getElementById('pfName').textContent = 'Mehmon';
    document.getElementById('pfEmail').textContent = 'Tizimga kirmagan';
    document.getElementById('pfPhone').textContent = '';
    document.getElementById('pfRole').textContent = 'Mehmon';
    document.getElementById('pfJoined').textContent = '';
    document.getElementById('pfAvBig').innerHTML = '<i class="fas fa-user"></i>';
  }
}

/* ============================================================
   TRUST BADGES — TO'LIQ ISHLAYDI
   ============================================================ */
const TRUST = {
  protection: { icon: 'fa-shield-alt', color: 'var(--success)', bg: 'var(--success-bg)', title: "To'liq himoya", desc: "Barcha buyurtmalarimiz to'liq himoya ostida.\n\n\u2022 Taom sifati mos kelmasa — 100% to'lov qaytariladi\n\u2022 Yetkazib berish kechiksa — bepul yetkazib berish\n\u2022 Noto'g'ri taom kelsa — almashtirish yoki pul qaytarish\n\u2022 24 soat ichida ariza berish mumkin\n\u2022 Qo'shimcha rasmiy shikoyat yo'li mavjud" },
  payment: { icon: 'fa-lock', color: 'var(--accent)', bg: 'var(--accent-light)', title: "Xavfsiz to'lov", desc: "SSL shifrlash bilan himoyalangan.\n\nValyutalar:\n\u2022 UZS — O'zbekiston so'mi\n\u2022 RUB — Rossiya rubli\n\u2022 USD — Amerika dollari\n\nTo'lov usullari:\n\u2022 Payme\n\u2022 Click\n\u2022 Uzum\n\u2022 VISA / Mastercard\n\nKarta ma'lumotlari saqlanmaydi." },
  cancel: { icon: 'fa-undo', color: 'var(--info)', bg: 'var(--info-bg)', title: "Bekor qilish", desc: "Har qanday vaqtda bekor qilishingiz mumkin.\n\n\u2022 Yetkazish boshlanishidan oldin — 100% qaytariladi\n\u2022 Kuryer yo'lga chiqqandan keyin — taom narxi qaytariladi\n\u2022 Taom yetkazilgandan keyin — qaytarib bo'lmaydi\n\u2022 1 ta klikda bekor qilish\n\u2022 Avtomatik pul qaytarish 1-3 ish kuni" },
  support: { icon: 'fa-headset', color: 'var(--warning)', bg: 'var(--warning-bg)', title: "24/7 yordam", desc: "Kuniga 24 soat, haftasiga 7 kun.\n\n\u2022 Telegram: @qozon_support\n\u2022 Telefon: +998 71 200 00 00\n\u2022 Email: support@qozon.uz\n\u2022 Ichki chat tugmasi\n\nO'rtacha javob vaqti — 2 daqiqa." }
};
function showTrust(key) {
  const d = TRUST[key]; if (!d) return;
  document.getElementById('trustTitle').textContent = d.title;
  document.getElementById('trustBody').innerHTML = `<div style="text-align:center;margin-bottom:20px"><div style="width:72px;height:72px;border-radius:50%;background:${d.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:30px;color:${d.color}"><i class="fas ${d.icon}"></i></div></div><p style="font-size:13px;color:var(--text2);line-height:1.9;white-space:pre-line">${d.desc}</p>`;
  openModal('trustModal');
}

/* ============================================================
   AKCENT RANGI
   ============================================================ */
function setAccentColor(el, color) {
  document.querySelectorAll('.set-color').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent2', color);
  showToast('info', 'Rang', 'Akcent rangi o\'zgartirildi');
}

/* ============================================================
   MODAL, TEMA, SOZLAMALAR
   ============================================================ */
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden' }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = '' }
function openSettings() { closeCartDD(); closeLangMenu(); openModal('settingsModal') }
function showNotifications() { showToast('info', 'Bildirishnoma', '3-ta buyurtmangiz yetkazilmoqda'); document.getElementById('notifBadge').style.display = 'none' }
document.querySelectorAll('.mo').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));

function toggleTheme() {
  const h = document.documentElement, isD = h.getAttribute('data-theme') === 'dark';
  h.setAttribute('data-theme', isD ? 'light' : 'dark');
  document.querySelector('#themeBtn i').className = isD ? 'fas fa-moon' : 'fas fa-sun';
  const dt = document.getElementById('darkToggle'); if (dt) dt.classList.toggle('on', !isD);
  localStorage.setItem('qz_theme', isD ? 'light' : 'dark');
}
function toggleParticles() { const on = document.getElementById('particles').style.opacity === '0'; document.getElementById('particles').style.opacity = on ? '0.5' : '0'; document.getElementById('particleToggle').classList.toggle('on', on); }
function clearAllData() { localStorage.clear(); currentUser = null; cartData.length = 0; renderCart(); renderCartDD(); updateProfileUI(); closeModal('settingsModal'); showToast('info', 'Tozalandi', 'Barcha ma\'lumotlar o\'chirildi'); }
(function () { const s = localStorage.getItem('qz_theme'); if (s === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); document.querySelector('#themeBtn i').className = 'fas fa-sun'; const dt = document.getElementById('darkToggle'); if (dt) dt.classList.add('on'); } })();

/* ============================================================
   TOAST
   ============================================================ */
function showToast(type, title, msg) {
  const tc = document.getElementById('toastContainer'), icons = { success: 'fa-check', error: 'fa-times', info: 'fa-info', warning: 'fa-exclamation' };
  const el = document.createElement('div'); el.className = `toast toast-${type}`;
  el.innerHTML = `<div class="toast-ic"><i class="fas ${icons[type]}"></i></div><div class="toast-bd"><div class="toast-tt">${title}</div><div class="toast-ms">${msg}</div></div><button class="toast-x" onclick="this.parentElement.classList.replace('show','hide');setTimeout(()=>this.parentElement.remove(),400)"><i class="fas fa-times"></i></button><div class="toast-pg" style="width:100%;animation:toastPg 3.5s linear forwards"></div>`;
  tc.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.replace('show', 'hide'); setTimeout(() => el.remove(), 400); }, 3500);
}
const pgS = document.createElement('style'); pgS.textContent = '@keyframes toastPg{from{width:100%}to{width:0%}}'; document.head.appendChild(pgS);

/* ============================================================
   SCROLL VA PARTICLES
   ============================================================ */
window.addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20));
(function () {
  const c = document.getElementById('particles'), ctx = c.getContext('2d'); let w, h, ps = [];
  function rs() { w = c.width = innerWidth; h = c.height = innerHeight } rs(); addEventListener('resize', rs);
  for (let i = 0; i < 50; i++) ps.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + .5, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, o: Math.random() * .5 + .2 });
  function draw() {
    ctx.clearRect(0, 0, w, h); const dk = document.documentElement.getAttribute('data-theme') === 'dark', col = dk ? '251,146,60' : '249,115,22';
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${col},${p.o})`; ctx.fill(); });
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 130) { ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.strokeStyle = `rgba(${col},${.09 * (1 - d / 130)})`; ctx.lineWidth = .5; ctx.stroke(); } }
    requestAnimationFrame(draw);
  } draw();
})();

/* Tashqi klik */
document.addEventListener('click', e => { if (!e.target.closest('#cartBtnWrap')) closeCartDD(); if (!e.target.closest('.ldd')) closeLangMenu(); });
document.getElementById('promoInput').addEventListener('keydown', e => { if (e.key === 'Enter') applyPromo(); });

/* ============================================================
   ISHGA TUSHIRISH
   ============================================================ */
renderLangMenu();
updateProfileUI();
renderCart();
renderCartDD();
renderRecs();