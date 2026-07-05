document.addEventListener("DOMContentLoaded", () => {
    // --- BOSHLANG'ICH O'ZGARUVCHILAR ---
    const itemPrice = 36000;
    let deliveryFee = 0;
    let discountPercent = 0; // Chegirma foizi

    // --- PROMO-KODLAR BAZASI (Xatolik bo'lmasligi uchun har ikki holat ham qo'shildi) ---
    const promoCodesDatabase = {
        "osh10": 10,       "OSH10": 10,
        "promo25": 25,     "PROMO25": 25,
        "palov50": 50,     "PALOV50": 50,
        "qozon2025": 100,  "QOZON2025": 100,
        "qozon2026": 30,    "QOZON2026": 30
    };

    // --- DOM ELEMENTLAR ---
    const btnPlus = document.getElementById('btn-plus');
    const btnMinus = document.getElementById('btn-minus');
    const cartQuantityInput = document.getElementById('cart-quantity');
    const itemQtyDisplay = document.getElementById('item-qty-display');
    const itemTotalDisplay = document.getElementById('item-total-display');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const grandTotalElement = document.querySelector(".grand-total");
    const serviceFeeElement = document.querySelector(".summary-row .free-text");
    const submitBtn = document.querySelector(".submit-order-btn");

    // Yangi elementlar
    const addressBlock = document.getElementById('address-block');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const promoInput = document.getElementById('promo-input');
    const promoBtn = document.getElementById('promo-btn');
    const promoMessage = document.getElementById('promo-message');

    const methodCards = document.querySelectorAll(".delivery-methods .method-card");
    const timeButtons = document.querySelectorAll(".time-slots .time-btn");
    const paymentOptions = document.querySelectorAll(".payment-methods .payment-option");

    // Narxni formatlash funksiyasi (36000 -> 36,000 so'm)
    function formatPrice(price) {
        return price.toLocaleString('en-US') + " so'm";
    }

    // ==========================================
    // ASOSIY DINAMIK HISOB-KITOB MANTIQI
    // ==========================================
    function updateCartAndTotal() {
        let quantity = parseInt(cartQuantityInput.value);
        if (isNaN(quantity) || quantity < 1) quantity = 1;

        // 1. Mahsulot summasini hisoblash (Subtotal)
        let subtotal = itemPrice * quantity;
        if (itemQtyDisplay) itemQtyDisplay.textContent = `${quantity} x ${formatPrice(itemPrice)}`;
        if (itemTotalDisplay) itemTotalDisplay.textContent = formatPrice(subtotal);
        if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);

        // 2. Chegirmani hisoblash
        let discountAmount = subtotal * (discountPercent / 100);

        // Agar chegirma bo'lsa, vizual ko'rsatish uchun "Summary" qismiga dinamik qator qo'shamiz
        let discountRow = document.getElementById('summary-discount-row');
        if (discountAmount > 0) {
            if (!discountRow) {
                discountRow = document.createElement('div');
                discountRow.id = 'summary-discount-row';
                discountRow.className = 'summary-row';
                discountRow.style.color = '#e74c3c';
                discountRow.style.fontWeight = '500';
                summarySubtotal.parentElement.insertAdjacentElement('afterend', discountRow);
            }
            discountRow.innerHTML = `<span>Chegirma (${discountPercent}%)</span> <span>-${formatPrice(discountAmount)}</span>`;
        } else if (discountRow) {
            discountRow.remove();
        }

        // 3. Yakuniy Jami Summa (Subtotal - Chegirma + Yetkazib berish)
        if (grandTotalElement) {
            const totalSum = (subtotal - discountAmount) + deliveryFee;
            grandTotalElement.innerText = formatPrice(totalSum);
        }
    }

    // ==========================================
    // PLUS / MINUS TUGMALARI VA INPUT LOGIKASI
    // ==========================================
    if (btnPlus && cartQuantityInput) {
        btnPlus.addEventListener('click', () => {
            let currentQty = parseInt(cartQuantityInput.value) || 1;
            currentQty++;
            cartQuantityInput.value = currentQty;
            updateCartAndTotal();
        });
    }

    if (btnMinus && cartQuantityInput) {
        btnMinus.addEventListener('click', () => {
            let currentQty = parseInt(cartQuantityInput.value) || 1;
            if (currentQty > 1) {
                currentQty--;
                cartQuantityInput.value = currentQty;
                updateCartAndTotal();
            }
        });
    }

    if (cartQuantityInput) {
        cartQuantityInput.addEventListener('input', function () {
            let currentQty = parseInt(this.value);
            if (!isNaN(currentQty) && currentQty >= 1) {
                updateCartAndTotal();
            }
        });

        cartQuantityInput.addEventListener('blur', function () {
            if (this.value === '' || parseInt(this.value) < 1) {
                this.value = 1;
            }
            updateCartAndTotal();
        });
    }

    // ==========================================
    // YETKAZIB BERISH VA MANZIL REJIMI
    // ==========================================
    methodCards.forEach(card => {
        card.addEventListener("click", () => {
            document.querySelector(".delivery-methods .method-card.active")?.classList.remove("active");
            card.classList.add("active");

            const methodText = card.querySelector("p").innerText;

            if (methodText.includes("Yetkazib berish")) {
                deliveryFee = 15000;
                if (serviceFeeElement) {
                    serviceFeeElement.innerText = "15,000 so'm";
                    serviceFeeElement.style.color = "#e74c3c";
                }
                if (addressBlock) addressBlock.style.display = "block";
            } else {
                deliveryFee = 0;
                if (serviceFeeElement) {
                    serviceFeeElement.innerText = "Bepul";
                    serviceFeeElement.style.color = "#27ae60";
                }
                if (addressBlock) {
                    addressBlock.style.display = "none";
                    if (deliveryAddressInput) deliveryAddressInput.value = "";
                }
            }
            updateCartAndTotal();
        });
    });

    // ==========================================
    // PROMO-KOD TEKSHIRISH LOGIKASI (MUVOFIQLASHTIRILDI)
    // ==========================================
    if (promoBtn && promoInput && promoMessage) {
        promoBtn.addEventListener('click', () => {
            // Bo'sh joylarni olib tashlaymiz
            const code = promoInput.value.trim(); 

            if (code.toLowerCase() in promoCodesDatabase || code.toUpperCase() in promoCodesDatabase) {
                // Ikkala holatda ham mos keladigan foizni olamiz
                discountPercent = promoCodesDatabase[code.toLowerCase()] || promoCodesDatabase[code.toUpperCase()];

                if (discountPercent === 100) {
                    promoMessage.innerText = `✓ '${code}' faollashdi! Buyurtma mutloq BEPUL (100% chegirma)!`;
                    promoMessage.style.color = "#27ae60";
                } else {
                    promoMessage.innerText = `✓ '${code}' faollashdi! ${discountPercent}% chegirma hisoblandi.`;
                    promoMessage.style.color = "#27ae60";
                }
            } else if (code === "") {
                promoMessage.innerText = "Iltimos, promo-kod kiriting.";
                promoMessage.style.color = "#e67e22";
                discountPercent = 0;
            } else {
                discountPercent = 0;
                promoMessage.innerText = "❌ Noto'g'ri promo-kod!";
                promoMessage.style.color = "#e74c3c";
            }
            updateCartAndTotal();
        });
    }

    // ==========================================
    // VAQT VA TO'LOV SELEKTORLARI
    // ==========================================
    timeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(".time-slots .time-btn.active")?.classList.remove("active");
            btn.classList.add("active");
        });
    });

    paymentOptions.forEach(option => {
        option.addEventListener("click", () => {
            document.querySelector(".payment-methods .payment-option.active")?.classList.remove("active");
            const oldCheck = document.querySelector(".payment-methods .check-icon");
            if (oldCheck) oldCheck.remove();

            option.classList.add("active");
            const radioInput = option.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;

            const checkSpan = document.createElement("span");
            checkSpan.classList.add("check-icon");
            checkSpan.innerText = "✓";
            option.appendChild(checkSpan);
        });
    });

    // ==========================================
    // TOAST BILDIRISHNOMA FUNKSIYASI
    // ==========================================
    function triggerPremiumToast(title, method, time, payment, total, count, address) {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.classList.add("custom-toast");

        let addressHTML = method.includes("Yetkazib berish") ? `<li>• Manzil: <b>${address}</b></li>` : '';

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon-wrapper">
                    <span class="toast-bell-icon">🔔</span>
                </div>
                <div class="toast-details">
                    <h5 style="margin:0; font-size:16px; color:#2d3748;">${title}</h5>
                    <p style="font-size: 13px; margin: 5px 0; opacity: 0.8;">Buyurtma qabul qilindi:</p>
                    <ul style="list-style: none; padding: 0; margin:0; font-size:13px;">
                        <li>• Soni: <b>${count} ta</b></li>
                        <li>• Usul: <b>${method}</b></li>
                        ${addressHTML}
                        <li>• Vaqt: <b>${time}</b></li>
                        <li>• To'lov: <b>${payment}</b></li>
                        <li>• Jami: <span style="color: #27ae60; font-weight: bold;">${total}</span></li>
                    </ul>
                </div>
            </div>
            <div class="toast-progress" style="position:absolute; bottom:0; left:0; height:4px; background:#3182ce;"></div>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 50);

        const duration = 5000;
        const progressBar = toast.querySelector(".toast-progress");
        progressBar.style.width = "100%";
        setTimeout(() => {
            progressBar.style.transition = `width ${duration}ms linear`;
            progressBar.style.width = "0%";
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hide");
            toast.addEventListener("transitionend", () => toast.remove());
        }, duration);
    }

    // ==========================================
    // TASDIQLASH (VALIDATSIYA BILAN)
    // ==========================================
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            const selectedMethod = document.querySelector(".delivery-methods .method-card.active p")?.innerText || "O'zingiz olib keting";
            const selectedTime = document.querySelector(".time-slots .time-btn.active")?.innerText || "13:00";
            const selectedPayment = document.querySelector(".payment-methods .payment-option.active .payment-text")?.innerText || "Click / Payme";
            const finalPrice = grandTotalElement ? grandTotalElement.innerText : "36,000 so'm";
            const finalCount = cartQuantityInput ? cartQuantityInput.value : "1";
            const addressValue = deliveryAddressInput ? deliveryAddressInput.value.trim() : "";

            if (selectedMethod.includes("Yetkazib berish") && addressValue === "") {
                alert("⚠️ Iltimos, yetkazib berish manzilingizni kiriting!");
                if (deliveryAddressInput) deliveryAddressInput.focus();
                return;
            }

            triggerPremiumToast(
                "Buyurtma Tasdiqlandi!",
                selectedMethod,
                selectedTime,
                selectedPayment.trim(),
                finalPrice,
                finalCount,
                addressValue
            );
        });
    }

    // Ilk yuklanishda hisoblash
    updateCartAndTotal();
});
/**
 * PREMIUM TOAST TIZIMI
 * Nurmuhammad Yusufboev loyihalari uchun
 */

const toastContainer = document.getElementById('toast-container');

/**
 * Toast yaratish funksiyasi
 * @param {string} title - Sarlavha
 * @param {Array} messages - Ro'yxat ko'rinishidagi xabarlar
 */
function showToast(title, messages = []) {
    // Toast elementini yaratish
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    // Toast ichki tuzilishi
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon-wrapper">
                <span class="toast-bell-icon">🔔</span>
            </div>
            <div class="toast-details">
                <h5>${title}</h5>
                <ul>
                    ${messages.map(msg => `<li>${msg}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div class="toast-progress"></div>
    `;

    toastContainer.appendChild(toast);

    // Animatsiya uchun biroz kutish
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Progress bar animatsiyasi (5 soniyadan keyin o'chadi)
    const progress = toast.querySelector('.toast-progress');
    progress.style.transition = 'width 5s linear';
    progress.style.width = '0%';

    // Toastni o'chirish jarayoni
    const removeToast = () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 500);
    };

    // 5 soniyadan keyin avtomatik o'chirish
    setTimeout(removeToast, 5000);
}

// QO'LLANISHI:
// Bu kodni buyurtma tasdiqlanganda chaqirasiz
/*
showToast('Buyurtma Tasdiqlandi!', [
    'Soni: 8 ta',
    'Usul: Yetkazib berish',
    'Manzil: qeqe',
    'Vaqt: 13:30',
    'To\'lov: Karta orqali (onlayn)',
    'Jami: 303,000 so\'m'
]);
*/
function changeTheme(theme, btnElement) {
  document.body.className = "";
  document.body.classList.add("theme-" + theme);
  
  // Tanlovni saqlab qolish
  localStorage.setItem('theme', theme);

  const options = document.querySelectorAll(".switch-opt");
  options.forEach((opt) => opt.classList.remove("active"));
  btnElement.classList.add("active");

  const slider = document.querySelector(".switcher-slider");
  slider.style.left = (theme === "light") ? "2px" : "38px";
}

// Sahifa yuklanganda avvalgi rejimni o'qish
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const btn = savedTheme === 'light' ? document.querySelector('.switch-opt') : document.querySelectorAll('.switch-opt')[1];
  changeTheme(savedTheme, btn);
});
document.querySelectorAll(".payment-option").forEach((option) => {
  option.addEventListener("click", function () {
    // Barcha aktiv klasslarni olib tashlash
    document.querySelectorAll(".payment-option").forEach((o) => {
      o.classList.remove("active");
    });

    // Bosilganini aktiv qilish
    this.classList.add("active");
    
    // Radio tugmani tanlash
    const radioInput = this.querySelector('input[type="radio"]');
    if (radioInput) radioInput.checked = true;
  });
});
// --- SAVATCHA VA HISOBLASH LOGIKASI ---
document.addEventListener("DOMContentLoaded", () => {
    const itemPrice = 36000;
    let quantity = 1;

    // Elementlarni olish
    const cartQuantity = document.getElementById("cart-quantity");
    const itemQtyDisplay = document.getElementById("item-qty-display");
    const itemTotalDisplay = document.getElementById("item-total-display");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryTotal = document.getElementById("summary-total");
    const btnPlus = document.getElementById("btn-plus");
    const btnMinus = document.getElementById("btn-minus");

    // Narxni formatlash
    function formatPrice(price) {
        return price.toLocaleString("en-US") + " so'm";
    }

    // Yangilash funksiyasi
    function updateCart() {
        // Savatcha sonini yangilash
        cartQuantity.textContent = quantity;
        
        // Tafsilotlar qatorini yangilash
        itemQtyDisplay.textContent = `${quantity} x ${formatPrice(itemPrice)}`;

        // Jami hisobni yangilash
        let total = itemPrice * quantity;
        itemTotalDisplay.textContent = formatPrice(total);
        summarySubtotal.textContent = formatPrice(total);
        summaryTotal.textContent = formatPrice(total);
    }

    // Tugmalar hodisalari
    if (btnPlus) {
        btnPlus.addEventListener("click", () => {
            quantity++;
            updateCart();
        });
    }

    if (btnMinus) {
        btnMinus.addEventListener("click", () => {
            if (quantity > 1) {
                quantity--;
                updateCart();
            }
        });
    }
});


// ==========================================
// EXTRACTED FROM buyutma.html
// ========================================== 
/* ========== API SIMULATSIYASI ========== */
      const API={
        _codes:{},
        _users:JSON.parse(localStorage.getItem('qz_users')||'[]'),
        _save(){localStorage.setItem('qz_users',JSON.stringify(this._users))},
        _genCode(){return String(Math.floor(100000+Math.random()*900000))},
        _delay(ms){return new Promise(r=>setTimeout(r,ms))},

        async register(d){
          await this._delay(800);
          if(!d.name||!d.surname||!d.email||!d.phone||!d.password) return{ok:false,msg:"Barcha maydonlarni to'ldiring"};
          if(this._users.find(u=>u.email===d.email)) return{ok:false,msg:"Bu email allaqachon ro'yxatdan o'tgan"};
          if(this._users.find(u=>u.phone===d.phone)) return{ok:false,msg:"Bu telefon raqam allaqachon ro'yxatdan o'tgan"};
          if(d.password.length<6) return{ok:false,msg:"Parol kamida 6 belgi bo'lishi kerak"};
          if(d.password!==d.password2) return{ok:false,msg:"Parollar mos kelmayapti"};
          const code=this._genCode();
          this._codes[d.email]=code;
          this._codes[d.phone]=code;
          return{ok:true,code,to:d.email};
        },

        async sendCode(to){
          await this._delay(600);
          const code=this._genCode();
          this._codes[to]=code;
          return{ok:true,code,to};
        },

        async verifyCode(to,code){
          await this._delay(400);
          if(this._codes[to]&&this._codes[to]===code){delete this._codes[to];return{ok:true}}
          return{ok:false,msg:"Noto'g'ri kod"};
        },

        async confirmRegister(d){
          await this._delay(500);
          const user={id:Date.now(),name:d.name,surname:d.surname,email:d.email,phone:d.phone,password:d.password,createdAt:new Date().toISOString()};
          this._users.push(user);this._save();
          return{ok:true,user};
        },

        async login(emailOrPhone,password){
          await this._delay(700);
          const user=this._users.find(u=>(u.email===emailOrPhone||u.phone===emailOrPhone)&&u.password===password);
          if(!user) return{ok:false,msg:"Email/telefon yoki parol noto'g'ri"};
          return{ok:true,user};
        },

        async createOrder(d){
          await this._delay(900);
          return{ok:true,orderId:'#QZ-'+Math.floor(10000+Math.random()*90000)};
        },

        async updateProfile(uid,updates){
          await this._delay(500);
          const u=this._users.find(x=>x.id===uid);
          if(!u) return{ok:false};
          Object.assign(u,updates);this._save();
          return{ok:true,user:u};
        },

        async changePass(uid,oldP,newP){
          await this._delay(500);
          const u=this._users.find(x=>x.id===uid);
          if(!u) return{ok:false,msg:"Foydalanuvchi topilmadi"};
          if(u.password!==oldP) return{ok:false,msg:"Eski parol noto'g'ri"};
          if(newP.length<6) return{ok:false,msg:"Yangi parol kamida 6 belgi"};
          u.password=newP;this._save();
          return{ok:true};
        }
      };

      /* ========== 12 TIL ========== */
      const LANGS=[
        {code:'uz',label:"O'zbekcha",flag:"\u{1F1FA}\u{1F1FF}"},
        {code:'ru',label:"\u0420\u0443\u0441\u0441\u043A\u0438\u0439",flag:"\u{1F1F7}\u{1F1FA}"},
        {code:'en',label:"English",flag:"\u{1F1EC}\u{1F1E7}"},
        {code:'tr',label:"T\u00FCrk\u00E7e",flag:"\u{1F1F9}\u{1F1F7}"},
        {code:'ko',label:"\uD55C\uAD6D\uC5B4",flag:"\u{1F1F0}\u{1F1F7}"},
        {code:'zh',label:"\u4E2D\u6587",flag:"\u{1F1E8}\u{1F1F3}"},
        {code:'ar',label:"\u0627\u0644\u0639\u0631\u0628\u064A\u0629",flag:"\u{1F1F8}\u{1F1E6}"},
        {code:'es',label:"Espa\u00F1ol",flag:"\u{1F1EA}\u{1F1F8}"},
        {code:'fr',label:"Fran\u00E7ais",flag:"\u{1F1EB}\u{1F1F7}"},
        {code:'de',label:"Deutsch",flag:"\u{1F1E9}\u{1F1EA}"},
        {code:'ja',label:"\u65E5\u672C\u8A9E",flag:"\u{1F1EF}\u{1F1F5}"},
        {code:'hi',label:"\u0939\u093F\u0928\u094D\u0926\u0940",flag:"\u{1F1EE}\u{1F1F3}"}
      ];

      /* ========== SUPABASE ========== */
      const SUPABASE_URL='https://usoekoycypxbcxzwoaea.supabase.co';
      const SUPABASE_KEY='sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
      const supaClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

      /* ========== HOLAT ========== */
      let currentLang=localStorage.getItem('qz_lang')||'uz';
      let currentUser=null;
      let currentCurrency=localStorage.getItem('qz_curr')||'UZS';
      let verifyTarget='',verifyAction='',pendingRegData=null,pendingOrderData=null;
      let deliveryType='delivery',deliveryFee=15000,promoApplied=false,promoDiscount=0;
      let appliedPromoId=null,promoPercent=0,promoFixedAmount=0;
      const SERVICE_RATE=0.05;
      const RATES={UZS:1,RUB:0.00735,USD:0.0000794};
      const SYMBOLS={UZS:"so'm",RUB:"\u20BD",USD:"$"};

      /* Haqiqiy savat \u2014 qz_cart (menu/taom sahifalaridan qo'shilgan) */
      function loadCartFromStorage(){
        let raw=[];
        try{raw=JSON.parse(localStorage.getItem('qz_cart')||'[]')}catch(e){raw=[]}
        return raw.map(it=>({id:it.id,foodId:it.foodId,name:it.name,rest:it.chef||'',price:it.price,oldPrice:null,qty:it.quantity||1,img:it.image||'',tags:[],checked:true}));
      }
      function saveCartToStorage(){
        const raw=cartData.map(it=>({id:it.id,foodId:it.foodId||it.id,name:it.name,price:it.price,image:it.img,chef:it.rest,quantity:it.qty}));
        localStorage.setItem('qz_cart',JSON.stringify(raw));
      }
      let cartData=loadCartFromStorage();
      const recommendations=[
        {name:"Chak-chak",rest:"Tatar Sariqi",price:18000,img:"https://picsum.photos/seed/chak66/200/200.jpg"},
        {name:"Somsa (5 dona)",rest:"Somsa Xon",price:25000,img:"https://picsum.photos/seed/somsa77/200/200.jpg"},
        {name:"Qozon kabob",rest:"Buxoro Cafe",price:65000,img:"https://picsum.photos/seed/kabob88/200/200.jpg"}
      ];

      /* ========== VALYUTA ========== */
      function convertPrice(u){return Math.round(u*RATES[currentCurrency])}
      function formatPrice(u){return convertPrice(u).toLocaleString('uz-UZ')+' '+SYMBOLS[currentCurrency]}
      function setCurrency(c){currentCurrency=c;localStorage.setItem('qz_curr',c);renderCart();renderCartDD();updateSummary();renderRecs();const d1=document.getElementById('delPrice1');if(d1&&deliveryFee>0)d1.textContent=formatPrice(deliveryFee)}

      /* ========== TIL ========== */
      function renderLangMenu(){
        document.getElementById('langMenu').innerHTML=LANGS.map(l=>`<button data-code="${l.code}" class="${l.code===currentLang?'active':''}" onclick="setLang('${l.code}');closeLangMenu()">${l.flag} ${l.label}</button>`).join('');
        const s=document.getElementById('settLangSelect');if(s)s.innerHTML=LANGS.map(l=>`<option value="${l.code}" ${l.code===currentLang?'selected':''}>${l.flag} ${l.label}</option>`).join('');
      }
      function toggleLangMenu(){const m=document.getElementById('langMenu'),b=document.getElementById('langBtn');m.classList.toggle('open');b.classList.toggle('open');closeCartDD()}
      function closeLangMenu(){document.getElementById('langMenu').classList.remove('open');document.getElementById('langBtn').classList.remove('open')}
      function setLang(c){currentLang=c;localStorage.setItem('qz_lang',c);document.getElementById('langLbl').textContent=c.toUpperCase();renderLangMenu();renderCart();renderCartDD();renderRecs()}

      /* ========== SAVAT CHIZISH ========== */
      function renderCart(){
        const c=document.getElementById('cartItems'),ti=cartData.reduce((s,i)=>s+i.qty,0);
        document.getElementById('cartCount').textContent=ti+' ta';document.getElementById('cartBadge').textContent=ti;document.getElementById('statItems').textContent=ti;document.getElementById('heroTag').textContent=ti+' ta mahsulot tanlangan';
        let saved=0;cartData.forEach(i=>{if(i.oldPrice)saved+=(i.oldPrice-i.price)*i.qty});document.getElementById('statSaved').textContent=convertPrice(saved).toLocaleString('uz-UZ');
        if(!cartData.length){c.innerHTML=`<div class="cart-empty"><div class="cart-empty-icon"><i class="fas fa-shopping-bag"></i></div><h3>Savat bo'sh</h3><p>Hali hech narsa qo'shilmagan.</p></div>`;document.getElementById('orderBtn').disabled=true;updateSummary();return}
        document.getElementById('orderBtn').disabled=false;
        c.innerHTML=cartData.map((item,idx)=>{const tagsH=item.tags.map(tg=>`<span class="ci-tag ${tg.type}">${tg.text}</span>`).join('');const sa=item.oldPrice?(item.oldPrice-item.price)*item.qty:0;
        return`<div class="ci" data-id="${item.id}" style="animation:fiu .5s ease-out ${idx*.05}s both"><div class="ci-check ${item.checked?'checked':''}" onclick="toggleCheck(${item.id})"><i class="fas fa-check"></i></div><div class="ci-img"><img src="${item.img}" alt="${item.name}" loading="lazy"/></div><div class="ci-info"><div class="ci-name">${item.name}</div><div class="ci-rest"><i class="fas fa-store"></i> ${item.rest}</div><div class="ci-tags">${tagsH}</div></div><div class="ci-qty"><button onclick="changeQty(${item.id},-1)" ${item.qty<=1?'disabled':''}><i class="fas fa-minus"></i></button><div class="qty-val">${item.qty}</div><button onclick="changeQty(${item.id},1)"><i class="fas fa-plus"></i></button></div><div class="ci-price">${item.oldPrice?`<span class="old-price">${formatPrice(item.oldPrice*item.qty)}</span>`:''}${formatPrice(item.price*item.qty)}${sa>0?`<span class="save-badge">-${formatPrice(sa)}</span>`:''}</div><button class="ci-del" onclick="removeItem(${item.id})"><i class="fas fa-trash-alt"></i></button></div>`}).join('');
        updateSummary();
      }

      function renderCartDD(){
        const dd=document.getElementById('cartDD');
        if(!cartData.length){dd.innerHTML=`<div style="padding:30px 20px;text-align:center;color:var(--text2);font-size:13px"><i class="fas fa-shopping-bag" style="font-size:32px;opacity:.15;display:block;margin-bottom:10px"></i>Savat bo'sh</div>`;return}
        const total=cartData.reduce((s,i)=>s+i.price*i.qty,0);
        dd.innerHTML=`<div class="cart-dd-hd"><i class="fas fa-shopping-bag"></i> Savat (${cartData.reduce((s,i)=>s+i.qty,0)})</div><div class="cart-dd-items">${cartData.slice(0,5).map(i=>`<div class="cart-dd-item"><img src="${i.img}" alt="${i.name}"/><div class="cdd-info"><div class="cdd-name">${i.name}</div><div class="cdd-rest">${i.rest}</div></div><div><span class="cdd-price">${formatPrice(i.price*i.qty)}</span><span class="cdd-qty">x${i.qty}</span></div></div>`).join('')}${cartData.length>5?`<div style="padding:10px 18px;text-align:center;font-size:11px;color:var(--text3)">+${cartData.length-5} ta ko'proq</div>`:''}</div><div class="cart-dd-foot"><div class="cart-dd-total">${formatPrice(total)}</div><button class="cart-dd-go" onclick="closeCartDD();window.scrollTo({top:0,behavior:'smooth'})">Savatga o'tish</button></div>`;
      }

      function renderRecs(){document.getElementById('recList').innerHTML=recommendations.map(r=>`<div class="rec-item"><img src="${r.img}" alt="${r.name}" loading="lazy"/><div class="rec-info"><div class="rec-name">${r.name}</div><div class="rec-rest">${r.rest}</div></div><div class="rec-price">${formatPrice(r.price)}</div><button class="rec-add" onclick="addRec('${r.name}','${r.rest}',${r.price},'${r.img}')"><i class="fas fa-plus"></i></button></div>`).join('')}

      function changeQty(id,d){const i=cartData.find(x=>x.id===id);if(i){i.qty=Math.max(1,i.qty+d);saveCartToStorage();renderCart();renderCartDD()}}
      function toggleCheck(id){const i=cartData.find(x=>x.id===id);if(i){i.checked=!i.checked;renderCart()}}
      function removeItem(id){const el=document.querySelector(`.ci[data-id="${id}"]`);if(el){el.classList.add('ci-removing');setTimeout(()=>{const it=cartData.find(x=>x.id===id);cartData=cartData.filter(x=>x.id!==id);saveCartToStorage();renderCart();renderCartDD();if(it)showToast('warning','O\'chirildi',it.name+' olib tashlandi')},400)}}
      function clearCart(){if(!cartData.length)return;cartData=[];saveCartToStorage();promoApplied=false;promoDiscount=0;appliedPromoId=null;promoPercent=0;promoFixedAmount=0;document.getElementById('discountRow').style.display='none';document.getElementById('promoBtn').textContent='Qo\'llash';document.getElementById('promoBtn').classList.remove('applied');document.getElementById('promoInput').disabled=false;document.getElementById('promoInput').value='';renderCart();renderCartDD();showToast('info','Tozalandi','Savat bo\'shatildi')}
      function addRec(name,rest,price,img){const ex=cartData.find(i=>i.name===name);if(ex){ex.qty++;saveCartToStorage();renderCart();renderCartDD();showToast('info','Yangilandi',name+' miqdori oshirildi');return}cartData.push({id:Date.now(),name,rest,price,oldPrice:null,qty:1,img,tags:[{text:'Yangi',type:'new'}],checked:true});saveCartToStorage();renderCart();renderCartDD();showToast('success','Qo\'shildi',name+' savatga qo\'shildi')}
      function updateSummary(){const ch=cartData.filter(i=>i.checked),sub=ch.reduce((s,i)=>s+i.price*i.qty,0),svc=Math.round(sub*SERVICE_RATE),disc=promoApplied?(promoPercent?Math.round(sub*promoPercent/100):promoFixedAmount):0,tot=Math.max(0,sub+deliveryFee+svc-disc);document.getElementById('subtotalVal').textContent=formatPrice(sub);document.getElementById('deliveryVal').textContent=deliveryFee===0?'Bepul':formatPrice(deliveryFee);document.getElementById('serviceVal').textContent=formatPrice(svc);document.getElementById('totalVal').textContent=formatPrice(tot);if(promoApplied&&disc>0){document.getElementById('discountRow').style.display='flex';document.getElementById('discountVal').textContent='-'+formatPrice(disc)}else{document.getElementById('discountRow').style.display='none'}}
      async function applyPromo(){
        const inp=document.getElementById('promoInput'),btn=document.getElementById('promoBtn'),code=inp.value.trim().toUpperCase();
        if(promoApplied)return;
        if(!code){showToast('error','Xato','Promo kodni kiriting');inp.focus();return}
        const sub=cartData.filter(i=>i.checked).reduce((s,i)=>s+i.price*i.qty,0);
        const{data:promo,error}=await supaClient.from('promo_codes').select('*').eq('code',code).eq('is_active',true).single();
        const now=new Date();
        const valid=promo&&!error&&(!promo.valid_until||new Date(promo.valid_until)>now)&&sub>=(promo.min_order_amount||0);
        if(valid){
          appliedPromoId=promo.id;
          promoPercent=promo.discount_type==='percent'?Number(promo.discount_value):0;
          promoFixedAmount=promo.discount_type==='fixed'?Number(promo.discount_value):0;
          promoApplied=true;
          btn.textContent='Qo\'llandi';btn.classList.add('applied');inp.disabled=true;
          updateSummary();
          showToast('success','Promo faol!',promo.discount_type==='percent'?`${promo.discount_value}% chegirma`:`${Number(promo.discount_value).toLocaleString('ru-RU')} so'm chegirma`);
        }else if(promo&&sub<(promo.min_order_amount||0)){
          showToast('error','Xato',`Minimal buyurtma: ${Number(promo.min_order_amount).toLocaleString('ru-RU')} so'm`);
        }else{
          showToast('error','Xato','Noto\'g\'ri yoki muddati o\'tgan promo kod');
          inp.style.borderColor='var(--danger)';setTimeout(()=>inp.style.borderColor='',2000)
        }
      }
      function selectDelivery(el,type,fee){document.querySelectorAll('.del-opt').forEach(o=>o.classList.remove('active'));el.classList.add('active');deliveryType=type;deliveryFee=fee;const d1=document.getElementById('delPrice1');if(d1&&fee>0)d1.textContent=formatPrice(fee);updateSummary()}
      function toggleCartDD(){const dd=document.getElementById('cartDD');closeLangMenu();if(dd.classList.contains('open'))closeCartDD();else{renderCartDD();dd.classList.add('open')}}
      function closeCartDD(){document.getElementById('cartDD').classList.remove('open')}

      /* ========== AUTH ========== */
      function switchAuthTab(tab){document.querySelectorAll('#authTabs button').forEach((b,i)=>b.classList.toggle('active',i===(tab==='login'?0:1)));document.getElementById('loginPanel').classList.toggle('active',tab==='login');document.getElementById('registerPanel').classList.toggle('active',tab==='register');document.getElementById('authTitle').textContent=tab==='login'?'Kirish':'Ro\'yxatdan o\'tish'}

      async function doRegister(){
        const d={name:document.getElementById('regName').value.trim(),surname:document.getElementById('regSurname').value.trim(),email:document.getElementById('regEmail').value.trim(),phone:document.getElementById('regPhone').value.trim(),password:document.getElementById('regPass').value,password2:document.getElementById('regPass2').value};
        document.querySelectorAll('#registerPanel .fi').forEach(f=>f.classList.remove('err'));
        const res=await API.register(d);
        if(!res.ok){showToast('error','Xato',res.msg);return}
        pendingRegData=d;verifyTarget=d.email;verifyAction='register';
        closeModal('authModal');
        showVerifyModal(d.email);
        /* SMS va Email xabarnomalari — KOD SHU YERDA KO'RSATILADI */
        showNotifToast('sms',d.phone,'qozon: Tasdiqlash kodi — '+res.code+'. Hech kimga bermang.');
        setTimeout(()=>showNotifToast('email',d.email,'qozon tasdiqlash kodi: '+res.code+'. Agar siz bo\'lmasangiz, emailni ozgartiring.'),1200);
      }

      async function doLogin(){
        const email=document.getElementById('loginEmail').value.trim(),pass=document.getElementById('loginPass').value;
        if(!email||!pass){showToast('error','Xato','Maydonlarni to\'ldiring');return}
        const res=await API.login(email,pass);
        if(!res.ok){showToast('error','Xato',res.msg);return}
        currentUser=res.user;localStorage.setItem('qz_current',JSON.stringify(currentUser));closeModal('authModal');updateProfileUI();showToast('success','Xush kelibsiz!',currentUser.name+'!');
      }

      function showVerifyModal(to){
        openModal('verifyModal');
        document.getElementById('verifyTo').textContent=to;
        const box=document.getElementById('codeInputs');box.innerHTML='';
        for(let i=0;i<6;i++){const inp=document.createElement('input');inp.type='text';inp.maxLength=1;inp.className='code-input';inp.addEventListener('input',e=>{if(e.target.value&&i<5)box.children[i+1].focus();e.target.classList.toggle('filled',!!e.target.value)});inp.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!e.target.value&&i>0)box.children[i-1].focus()});box.appendChild(inp)}
        box.children[0].focus();
        const rl=document.getElementById('resendLink');rl.classList.add('disabled');
        let sec=60;const iv=setInterval(()=>{sec--;rl.textContent=sec+'s';if(sec<=0){clearInterval(iv);rl.classList.remove('disabled');rl.textContent='Kod qayta yuborish'}},1000);
        rl._iv=iv;
      }

      async function doVerify(){
        const code=Array.from(document.querySelectorAll('.code-input')).map(i=>i.value).join('');
        if(code.length<6){showToast('error','Xato','6 xonali kodni kiriting');return}
        const res=await API.verifyCode(verifyTarget,code);
        if(!res.ok){showToast('error','Xato',res.msg);document.querySelectorAll('.code-input').forEach(i=>{i.value='';i.classList.remove('filled')});document.querySelector('.code-input').focus();return}
        closeModal('verifyModal');
        if(verifyAction==='register'&&pendingRegData){
          const r=await API.confirmRegister(pendingRegData);
          if(r.ok){currentUser=r.user;localStorage.setItem('qz_current',JSON.stringify(currentUser));updateProfileUI();showToast('success','Muvaffaqiyat!','Ro\'yxatdan o\'tdingiz, '+currentUser.name+'!')}
          pendingRegData=null;
        }else if(verifyAction==='order'&&pendingOrderData){
          await finishOrder(pendingOrderData);pendingOrderData=null;
        }
      }

      async function resendCode(){
        if(document.getElementById('resendLink').classList.contains('disabled'))return;
        const res=await API.sendCode(verifyTarget);
        if(res.ok){
          showVerifyModal(verifyTarget);
          showNotifToast('sms',verifyTarget,'qozon: Yangi tasdiqlash kodi — '+res.code);
          setTimeout(()=>showNotifToast('email',verifyTarget,'qozon yangi kod: '+res.code),800);
        }
      }

      /* ========== BUYURTMA ========== */
      function startOrder(){
        if(!cartData.filter(i=>i.checked).length){showToast('warning','Diqqat','Kamida bitta mahsulot tanlang');return}
        if(!currentUser){showToast('warning','Kirish kerak','Avval tizimga kiring');openModal('authModal');return}
        openModal('orderFormModal');
        if(currentUser.phone)document.getElementById('orderPhone').value=currentUser.phone;
        if(currentUser.email)document.getElementById('orderEmail').value=currentUser.email;
      }

      async function sendOrderCode(){
        const phone=document.getElementById('orderPhone').value.trim(),email=document.getElementById('orderEmail').value.trim(),addr=document.getElementById('orderAddress').value.trim();
        if(!phone){showToast('error','Xato','Telefon raqamni kiriting');document.getElementById('orderPhone').classList.add('err');return}
        if(!email){showToast('error','Xato','Emailni kiriting');document.getElementById('orderEmail').classList.add('err');return}
        document.getElementById('orderPhone').classList.remove('err');document.getElementById('orderEmail').classList.remove('err');
        pendingOrderData={phone,email,address:addr,note:document.getElementById('orderNote').value.trim()};
        const res=await API.sendCode(phone);
        if(res.ok){
          verifyTarget=phone;verifyAction='order';
          closeModal('orderFormModal');
          showVerifyModal(phone);
          /* REAL KOD — faqat SMS/Email notification orqali ko'rinadi */
          showNotifToast('sms',phone,'qozon: Buyurtma tasdiqlash kodi — '+res.code+'. Hech kimga bermang.');
          setTimeout(()=>showNotifToast('email',email,'qozon: Buyurtma kodiniz: '+res.code+'. Bu kodni kiriting.'),1500);
        }
      }

      async function finishOrder(data){
        const items=cartData.filter(i=>i.checked);
        if(!items.length)return;
        const orderNumber='QZ-'+Math.floor(10000+Math.random()*90000);
        const foodNames=items.map(i=>`${i.name} (${i.qty}x)`).join(', ');
        const firstItem=items[0];
        let chefId=null;
        if(firstItem.rest){
          const{data:chefRow}=await supaClient.from('chefs').select('id').eq('full_name',firstItem.rest).single();
          if(chefRow)chefId=chefRow.id;
        }
        const orderPayload={
          order_number:orderNumber,
          customer_id:currentUser?currentUser.id:null,
          customer_name:currentUser?(currentUser.name+' '+(currentUser.surname||'')).trim():'Mehmon',
          customer_phone:data.phone||(currentUser?currentUser.phone:'')||'',
          food_name:foodNames,
          food_image:firstItem.img||'',
          chef_id:chefId,
          chef_name:firstItem.rest||'Oshpaz',
          quantity:items.reduce((s,i)=>s+i.qty,0),
          price:items.reduce((s,i)=>s+i.price*i.qty,0),
          total_price:(()=>{const sub=items.reduce((s,i)=>s+i.price*i.qty,0),disc=promoApplied?(promoPercent?Math.round(sub*promoPercent/100):promoFixedAmount):0;return Math.max(0,sub+deliveryFee-disc)})(),
          status:'pending',
          notes:`Manzil: ${data.address||''}. Izoh: ${data.note||''}`
        };
        const{data:created,error}=await supaClient.from('orders').insert(orderPayload).select().single();
        if(error){showToast('error','Xato','Buyurtmani yaratib bo\'lmadi');return}
        if(promoApplied&&appliedPromoId&&currentUser){
          supaClient.from('promo_code_redemptions').insert({promo_code_id:appliedPromoId,user_id:currentUser.id,order_id:created.id}).then(({error})=>{if(error)console.error('Promo qo\'llanishini saqlashda xatolik:',error)});
        }
        document.getElementById('successOrderId').textContent=orderNumber;openModal('successModal');
        cartData=cartData.filter(i=>!i.checked);saveCartToStorage();promoApplied=false;promoDiscount=0;appliedPromoId=null;promoPercent=0;promoFixedAmount=0;
        document.getElementById('discountRow').style.display='none';document.getElementById('promoBtn').textContent='Qo\'llash';document.getElementById('promoBtn').classList.remove('applied');document.getElementById('promoInput').disabled=false;document.getElementById('promoInput').value='';
        renderCart();renderCartDD();showToast('success','Buyurtma yaratildi',orderNumber);
        /* Kuryer xabarnomasi */
        setTimeout(()=>showNotifToast('courier',data.phone,'qozon: Kuryer yo\'lga chiqdi. Taxminan 25-35 daqiqa ichida yetib keladi. Buyurtma: '+orderNumber),4000);
      }

      /* ========== XABARNOMA TOAST (SMS/Email/Kuryer) ========== */
      function showNotifToast(type,to,msg){
        const tc=document.getElementById('toastContainer'),el=document.createElement('div');el.className='sms-toast';
        const icons={sms:'fa-sms',email:'fa-envelope',courier:'fa-motorcycle'};
        const titles={sms:'SMS — '+to,email:'Email — '+to,courier:'Kuryer — '+to};
        const cls={sms:'sms',email:'email',courier:'courier'};
        const now=new Date();const time=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
        el.innerHTML=`<div class="sms-toast-icon ${cls[type]}"><i class="fas ${icons[type]}"></i></div><div class="sms-toast-body"><div class="sms-toast-title">${titles[type]}</div><div class="sms-toast-msg">${msg}</div><div class="sms-toast-time">${time}</div></div><button class="sms-toast-x" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
        tc.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
        setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),500)},8000);
      }

      /* ========== PROFIL ========== */
      function handleProfileClick(){closeCartDD();closeLangMenu();if(!currentUser){openModal('authModal');return}openModal('profileModal');switchProfileTab('info')}
      function switchProfileTab(tab){
        const tabs=document.querySelectorAll('#profileTabs button'),panels=['ptInfo','ptSettings','ptSecurity','ptLogout'];
        const idx=panels.indexOf('pt'+tab.charAt(0).toUpperCase()+tab.slice(1));
        tabs.forEach((b,i)=>b.classList.toggle('active',i===idx));panels.forEach((p,i)=>document.getElementById(p).classList.toggle('active',i===idx));
        if(tab==='info'&&currentUser){document.getElementById('pfEditName').value=currentUser.name||'';document.getElementById('pfEditSurname').value=currentUser.surname||'';document.getElementById('pfEditEmail').value=currentUser.email||'';document.getElementById('pfEditPhone').value=currentUser.phone||''}
      }
      async function saveProfile(){
        if(!currentUser)return;
        const fullName=(document.getElementById('pfEditName').value.trim()+' '+document.getElementById('pfEditSurname').value.trim()).trim();
        const phone=document.getElementById('pfEditPhone').value.trim();
        const{error}=await supaClient.from('profiles').update({full_name:fullName,phone}).eq('id',currentUser.id);
        if(error){showToast('error','Xato','Profilni saqlab bo\'lmadi');return}
        currentUser.name=fullName;currentUser.phone=phone;
        updateProfileUI();showToast('success','Saqlandi','Profil yangilandi');
      }
      async function changePassword(){
        if(!currentUser)return;
        const newPass=document.getElementById('newPass').value,newPass2=document.getElementById('newPass2').value;
        if(newPass.length<6){showToast('error','Xato','Yangi parol kamida 6 belgi');return}
        if(newPass!==newPass2){showToast('error','Xato','Parollar mos kelmayapti');return}
        const{error}=await supaClient.auth.updateUser({password:newPass});
        if(error){showToast('error','Xato',error.message);return}
        showToast('success','O\'zgartirildi','Parol yangilandi');document.getElementById('oldPass').value='';document.getElementById('newPass').value='';document.getElementById('newPass2').value='';
      }
      async function doLogout(){await supaClient.auth.signOut();currentUser=null;closeModal('profileModal');updateProfileUI();showToast('info','Chiqdingiz','Tizimdan chiqdingiz');setTimeout(()=>window.location.href='kirish.html',800)}
      function updateProfileUI(){
        const av=document.getElementById('navAv'),nm=document.getElementById('navNm');
        if(currentUser){const fullName=(currentUser.name+' '+(currentUser.surname||'')).trim();const initials=((currentUser.name||'')[0]||'')+((currentUser.surname||'')[0]||'');nm.textContent=fullName;av.innerHTML=`<span style="font-size:11px;font-weight:700">${initials}</span>`;document.getElementById('pfName').textContent=fullName;document.getElementById('pfEmail').textContent=currentUser.email;document.getElementById('pfRole').textContent='Foydalanuvchi';document.getElementById('pfAvBig').innerHTML=`<span style="font-size:28px;font-weight:800">${initials}</span>`}
        else{nm.textContent='Profil';av.innerHTML='<i class="fas fa-user"></i>';document.getElementById('pfName').textContent='Mehmon';document.getElementById('pfEmail').textContent='Tizimga kirmagan';document.getElementById('pfRole').textContent='Mehmon';document.getElementById('pfAvBig').innerHTML='<i class="fas fa-user"></i>'}
      }

      /* ========== TRUST BADGES ========== */
      const TRUST={
        protection:{icon:'fa-shield-alt',color:'var(--success)',bg:'var(--success-bg)',title:"To'liq himoya",desc:"Barcha buyurtmalarimiz to'liq himoya ostida. Agar taom sifati yoki yetkazib berish vaqtida muammo yuzaga kelsa, pulingiz 100% qaytariladi. Biz sizga kafolat beramiz — xavfsiz va ishonchli xarid qiling.\n\nHimoya qoidalari:\n\u2022 Taom sifati mos kelmasa — to'liq to'lov qaytariladi\n\u2022 Yetkazib berish kechiksa — bepul yetkazib berish\n\u2022 Noto'g'ri taom kelsa — almashtirish yoki pul qaytarish\n\u2022 24 soat ichida ariza berish mumkin"},
        payment:{icon:'fa-lock',color:'var(--accent)',bg:'var(--accent-light)',title:"Xavfsiz to'lov",desc:"Barcha to'lovlar SSL shifrlash orqali himoyalangan. Karta ma'lumotlaringiz bizning serverlarda saqlanmaydi.\n\nQo'llab-quvvatlanadigan valyutalar:\n\u2022 UZS — O'zbekiston so'mi\n\u2022 RUB — Rossiya rubli\n\u2022 USD — Amerika dollari\n\nTo'lov usullari: Payme, Click, Uzum, VISA, Mastercard"},
        cancel:{icon:'fa-undo',color:'var(--info)',bg:'var(--info-bg)',title:"Bekor qilish",desc:"Buyurtmangizni yetkazib berish boshlanishidan oldin bepul bekor qilishingiz mumkin.\n\nBekor qilish shartlari:\n\u2022 Yetkazib berish boshlanishidan oldin — 100% to'lov qaytariladi\n\u2022 Kuryer yo'lga chiqqanidan keyin — faqat taom narxi qaytariladi\n\u2022 Taom yetkazilgandan keyin — qaytarib bo'lmaydi\n\u2022 1 ta klikda bekor qilish"},
        support:{icon:'fa-headset',color:'var(--warning)',bg:'var(--warning-bg)',title:"24/7 yordam",desc:"Kuniga 24 soat, haftasiga 7 kun yordam beramiz.\n\nBog'lanish usullari:\n\u2022 Telegram: @qozon_support\n\u2022 Telefon: +998 71 200 00 00\n\u2022 Email: support@qozon.uz\n\u2022 Ichki chat: Sahifadagi chat tugmasi\n\nO'rtacha javob vaqti — 2 daqiqa. Sizning qulayligingiz — bizning ustuvorligimiz."}
      };
      function showTrust(key){const d=TRUST[key];if(!d)return;document.getElementById('trustTitle').textContent=d.title;document.getElementById('trustBody').innerHTML=`<div style="text-align:center;margin-bottom:20px"><div style="width:72px;height:72px;border-radius:50%;background:${d.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:30px;color:${d.color}"><i class="fas ${d.icon}"></i></div></div><p style="font-size:13px;color:var(--text2);line-height:1.9;white-space:pre-line">${d.desc}</p>`;openModal('trustModal')}

      /* ========== MODAL ========== */
      function openModal(id){document.getElementById(id).classList.add('open');document.body.style.overflow='hidden'}
      function closeModal(id){document.getElementById(id).classList.remove('open');document.body.style.overflow=''}
      function openSettings(){closeCartDD();closeLangMenu();openModal('settingsModal')}
      /* ========== BILDIRISHNOMALAR (public.notifications) ========== */
      let notifRealtimeChannel=null;
      async function updateNotifBadge(){
        const badge=document.getElementById('notifBadge');
        if(!badge)return;
        if(!currentUser){badge.style.display='none';return}
        const{count}=await supaClient.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',currentUser.id).eq('is_read',false);
        if(count>0){badge.textContent=count>9?'9+':String(count);badge.style.display='flex'}else{badge.style.display='none'}
      }
      function closeNotifDD(){const dd=document.getElementById('notifDD');if(dd)dd.classList.remove('open')}
      async function showNotifications(){
        let dd=document.getElementById('notifDD');
        if(!dd){dd=document.createElement('div');dd.id='notifDD';dd.className='cart-dd';document.getElementById('notifBtn').insertAdjacentElement('afterend',dd)}
        if(dd.classList.contains('open')){closeNotifDD();return}
        closeCartDD();closeLangMenu();dd.classList.add('open');
        if(!currentUser){dd.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text2);font-size:13px">Bildirishnomalarni ko'rish uchun tizimga kiring</div>`;return}
        dd.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text2);font-size:13px">Yuklanmoqda...</div>`;
        const{data,error}=await supaClient.from('notifications').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(15);
        if(error||!data||!data.length){
          dd.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text2);font-size:13px">Hozircha bildirishnoma yo'q</div>`;
        }else{
          dd.innerHTML=data.map(n=>`<div style="padding:12px 16px;border-bottom:1px solid var(--border);${n.is_read?'':'background:var(--info-bg)'}"><div style="font-size:13px;font-weight:700;margin-bottom:3px">${n.title}</div><div style="font-size:12px;color:var(--text2);margin-bottom:4px">${n.body||''}</div><div style="font-size:11px;color:var(--text3)">${new Date(n.created_at).toLocaleString('uz')}</div></div>`).join('');
          const unreadIds=data.filter(n=>!n.is_read).map(n=>n.id);
          if(unreadIds.length){await supaClient.from('notifications').update({is_read:true}).in('id',unreadIds);updateNotifBadge()}
        }
      }
      function initNotifications(){
        if(!currentUser)return;
        updateNotifBadge();
        if(notifRealtimeChannel)supaClient.removeChannel(notifRealtimeChannel);
        notifRealtimeChannel=supaClient.channel('notifications-'+currentUser.id)
          .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${currentUser.id}`},()=>updateNotifBadge())
          .subscribe();
      }
      document.querySelectorAll('.mo').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));

      /* ========== TEMA ========== */
      function toggleTheme(){const h=document.documentElement,isD=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',isD?'light':'dark');document.querySelector('#themeBtn i').className=isD?'fas fa-moon':'fas fa-sun';const dt=document.getElementById('darkToggle');if(dt)dt.classList.toggle('on',!isD);localStorage.setItem('qz_theme',isD?'light':'dark')}
      function toggleParticles(){const on=document.getElementById('particles').style.opacity==='0';document.getElementById('particles').style.opacity=on?'0.5':'0';document.getElementById('particleToggle').classList.toggle('on',on)}
      function clearAllData(){localStorage.clear();currentUser=null;cartData.length=0;renderCart();renderCartDD();updateProfileUI();closeModal('settingsModal');showToast('info','Tozalandi','Barcha ma\'lumotlar o\'chirildi')}
      (function(){const s=localStorage.getItem('qz_theme');if(s==='dark'){document.documentElement.setAttribute('data-theme','dark');document.querySelector('#themeBtn i').className='fas fa-sun';const dt=document.getElementById('darkToggle');if(dt)dt.classList.add('on')}})();

      /* ========== TOAST ========== */
      function showToast(type,title,msg){const tc=document.getElementById('toastContainer'),icons={success:'fa-check',error:'fa-times',info:'fa-info',warning:'fa-exclamation'};const el=document.createElement('div');el.className=`toast toast-${type}`;el.innerHTML=`<div class="toast-ic"><i class="fas ${icons[type]}"></i></div><div class="toast-bd"><div class="toast-tt">${title}</div><div class="toast-ms">${msg}</div></div><button class="toast-x" onclick="this.parentElement.classList.replace('show','hide');setTimeout(()=>this.parentElement.remove(),400)"><i class="fas fa-times"></i></button><div class="toast-pg" style="width:100%;animation:toastPg 3.5s linear forwards"></div>`;tc.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.replace('show','hide');setTimeout(()=>el.remove(),400)},3500)}
      const pgS=document.createElement('style');pgS.textContent='@keyframes toastPg{from{width:100%}to{width:0%}}';document.head.appendChild(pgS);

      /* ========== SCROLL ========== */
      window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20));

      /* ========== PARTICLES ========== */
      document.addEventListener('click',e=>{if(!e.target.closest('#cartBtnWrap'))closeCartDD();if(!e.target.closest('.ldd'))closeLangMenu();if(!e.target.closest('#notifBtn')&&!e.target.closest('#notifDD'))closeNotifDD()});
      document.getElementById('promoInput').addEventListener('keydown',e=>{if(e.key==='Enter')applyPromo()});

      /* ========== INIT ========== */
      async function loadCurrentUser(){
        const{data:{session}}=await supaClient.auth.getSession();
        if(!session){currentUser=null;updateProfileUI();return}
        const authUser=session.user;
        const{data:profile}=await supaClient.from('profiles').select('*').eq('id',authUser.id).single();
        const fullName=profile?.full_name||authUser.user_metadata?.full_name||'';
        currentUser={id:authUser.id,name:fullName,surname:'',email:authUser.email||'',phone:profile?.phone||authUser.user_metadata?.phone||''};
        updateProfileUI();
        initNotifications();
      }
      document.getElementById('notifBadge').style.display='none';
      renderLangMenu();updateProfileUI();renderCart();renderCartDD();renderRecs();loadCurrentUser();