/**
 * Xurmo opa Dashboard - To'liq Interaktiv JS paneli
 * 3D Glassmorphism Toastify va Dinamik Hisoblagichlar bilan
 */

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. 3D TOASTIFY (XABARNOMA) TIZIMI
    // ==========================================
    function showDashboardToast(title, message, iconOrImg, isUrl = false) {
        // HTML ichidagi toast-container elementini topamiz
        let container = document.getElementById("toast-container");
        
        // Agar konteyner hali HTML-da yo'q bo'lsa, uni dinamik yaratamiz
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }

        // Yangi xabarnoma elementi
        const toast = document.createElement("div");
        toast.classList.add("custom-3d-toast");

        // Rasm yoki Emoji ekanligini aniqlash
        const avatarContent = isUrl 
            ? `<img src="${iconOrImg}" alt="toast-img" style="width:100%; height:100%; border-radius:10px; object-fit:cover;">` 
            : iconOrImg;

        // Toast tarkibi
        toast.innerHTML = `
            <div class="toast-body" style="display: flex; align-items: center; gap: 12px;">
                <div class="toast-avatar" style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255, 255, 255, 0.6); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; box-shadow: 0 4px 8px rgba(0,0,0,0.05); overflow:hidden;">
                    ${avatarContent}
                </div>
                <div class="toast-text-block">
                    <h5 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${title}</h5>
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${message}</p>
                </div>
            </div>
            <div class="toast-time-line"></div>
        `;

        // Konteynerga qo'shish
        container.appendChild(toast);

        // O'ng tarafdan 3D effekt bilan uchib kirishi
        setTimeout(() => {
            toast.classList.add("show");
        }, 50);

        const duration = 3000; // Ekran yuzida turish vaqti (3 soniya)
        const timeLine = toast.querySelector(".toast-time-line");
        
        // Progress bar chizig'ini kamaytirish animatsiyasi
        timeLine.style.transition = `width ${duration}ms linear`;
        setTimeout(() => {
            timeLine.style.width = "0%";
        }, 50);

        // Vaqt tugagach o'ngga qaytib kirib ketishi va o'chirilishi
        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hide");
            
            // Animatsiya to'liq tugagach DOM dan o'chirish
            toast.addEventListener("transitionend", () => {
                toast.remove();
            });
        }, duration);
    }


    // ==========================================
    // 2. SIDEBAR MENYULARINI FAOLLASHTIRISH
    // ==========================================
    const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Avvalgi faol menyudan 'active' klassini olib tashlaymiz
            document.querySelector(".sidebar-menu .menu-item.active")?.classList.remove("active");
            
            // Bosilgan yangi menyuga 'active' klassini beramiz
            item.classList.add("active");

            // Emojilarni tozalab faqat matnni olish
            const menuName = item.innerText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
            
            showDashboardToast("Bo'lim yangilandi", `Siz hozir <b>${menuName}</b> oynasiga o'tdingiz.`, "📊");
        });
    });


    // ==========================================
    // 3. BILDirishnoma TUGMASI (🔔)
    // ==========================================
    const notificationBtn = document.querySelector(".btn-notification");
    if (notificationBtn) {
        notificationBtn.addEventListener("click", () => {
            showDashboardToast("Bildirishnomalar", "Sizda hozircha yangi yoki o'qilmagan tizimli xabarlar yo'q.", "🔔");
        });
    }


    // ==========================================
    // 4. FAOL BUYURTMALAR ELEMENTLARI
    // ==========================================
    
    // Telefon tugmasi bosilganda (📞)
    const phoneButtons = document.querySelectorAll(".btn-phone");
    phoneButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const clientName = btn.parentElement.querySelector("h4").innerText;
            showDashboardToast("Mijoz bilan aloqa", `<b>${clientName}</b> bilan telefon aloqasi o'rnatilmoqda...`, "📞");
        });
    });

    // Buyurtma holati o'zgartirilganda (Dropdown select)
    const statusDropdowns = document.querySelectorAll(".status-dropdown");
    statusDropdowns.forEach(dropdown => {
        dropdown.addEventListener("change", (e) => {
            const clientName = dropdown.parentElement.querySelector("h4").innerText;
            const currentStatus = e.target.value;
            
            showDashboardToast(
                "Buyurtma holati", 
                `<b>${clientName}</b> buyurtmasi hozir: <span style="color:#ff9f43; font-weight:600;">${currentStatus}</span>`, 
                "⏳"
            );
        });
    });


    // ==========================================
    // 5. BUGUNGI MENYU: ZAXIRA COUNTER VA TOGGLE SWITCH
    // ==========================================
    const menuRows = document.querySelectorAll(".menu-item-row");
    
    menuRows.forEach(row => {
        const foodName = row.querySelector("h4").innerText;
        const foodImg = row.querySelector(".menu-item-img").src;
        const counterVal = row.querySelector(".counter-val");
        const minusBtn = row.querySelector(".counter-btn:first-of-type");
        const plusBtn = row.querySelector(".counter-btn:last-of-type");
        const toggleInput = row.querySelector(".toggle-switch input");

        // Porsiyani kamaytirish (-) tugmasi
        minusBtn.addEventListener("click", () => {
            let currentCount = parseInt(counterVal.innerText);
            if (currentCount > 0) {
                currentCount--;
                counterVal.innerText = currentCount;
                showDashboardToast("Zaxira yangilandi", `<b>${foodName}</b> zaxirasi ${currentCount} porsiyaga tushdi.`, foodImg, true);
            } else {
                showDashboardToast("Xatolik", `<b>${foodName}</b> zaxirada qolmagan!`, "❌");
            }
        });

        // Porsiyani ko'paytirish (+) tugmasi
        plusBtn.addEventListener("click", () => {
            let currentCount = parseInt(counterVal.innerText);
            currentCount++;
            counterVal.innerText = currentCount;
            showDashboardToast("Zaxira to'ldirildi", `<b>${foodName}</b> zaxirasi ${currentCount} porsiyaga ko'paytirildi.`, foodImg, true);
        });

        // Taomni faollashtirish yoki muzlatish (Toggle Switch)
        toggleInput.addEventListener("change", (e) => {
            if (e.target.checked) {
                row.style.opacity = "1"; // To'liq ko'rinish
                showDashboardToast("Taom sotuvda", `<b>${foodName}</b> mijozlar menyusida yana faollashtirildi.`, foodImg, true);
            } else {
                row.style.opacity = "0.55"; // Shaffof holat (o'chganlik effekti)
                showDashboardToast("Taom muzlatildi", `<b>${foodName}</b> vaqtincha mijozlar ilovasidan yashirildi.`, foodImg, true);
            }
        });
    });


    // ==========================================
    // 6. DAROMAD: BATAFSIL HISOBOT TUGMASI
    // ==========================================
    const detailsBtn = document.querySelector(".btn-details");
    if (detailsBtn) {
        detailsBtn.addEventListener("click", () => {
            showDashboardToast("Hisobot generatsiyasi", "Haftalik mukammal tushum tahlili va diagrammasi tayyorlanmoqda...", "💰");
        });
    }

    // "Hammasini ko'rish" havolasi bosilganda
    const seeAllLink = document.querySelector(".see-all");
    if (seeAllLink) {
        seeAllLink.addEventListener("click", (e) => {
            e.preventDefault();
            showDashboardToast("Sahifa yuklanmoqda", "Barcha taomlar va arxiv menyu ro'yxatiga o'tilmoqda...", "🍳");
        });
    }
});

// ==========================================
// EXTRACTED FROM xurmoOpa 2.html
// ========================================== 
function changeTheme(themeName, btnElement) {
            // Faqat kiritilgan rejim light yoki dark bo'lsa ishlaydi
            if (themeName !== 'light' && themeName !== 'dark') return;

            document.body.className = '';
            document.body.classList.add('theme-' + themeName);
            
            const buttons = document.querySelectorAll('.theme-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            if (btnElement) {
                btnElement.classList.add('active');
            } else {
                buttons.forEach(btn => {
                    const onclickAttr = btn.getAttribute('onclick');
                    if (onclickAttr && onclickAttr.includes(themeName)) {
                        btn.classList.add('active');
                    }
                });
            }
            localStorage.setItem('xurmo-dashboard-theme', themeName);
        }

        // Sahifa yuklanganda xotirani tekshirish
        const savedTheme = localStorage.getItem('xurmo-dashboard-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            document.body.className = '';
            document.body.classList.add('theme-' + savedTheme);
            
            setTimeout(() => {
                const buttons = document.querySelectorAll('.theme-btn');
                buttons.forEach(btn => {
                    if(btn.getAttribute('onclick').includes(savedTheme)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }, 50);
        }