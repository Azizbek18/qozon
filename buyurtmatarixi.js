document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {

        document.querySelectorAll(".tab")
        .forEach(btn => btn.classList.remove("active"));

        tab.classList.add("active");
    });
});

// ==========================================
// EXTRACTED FROM buyurtmatarixi.html
// ========================================== 
/* ==============================================
           1. BOSHLANG'ICH MA'LUMOTLAR
           ============================================== */
      var defaultOrders = [
        {
          id: "#1042",
          client: "Sardor Karimov",
          phone: "+998 90 123 45 67",
          amount: 85000,
          status: "delivered",
          date: "2024-12-15",
        },
        {
          id: "#1043",
          client: "Dilnoza Rahimova",
          phone: "+998 91 234 56 78",
          amount: 120000,
          status: "preparing",
          date: "2024-12-15",
        },
        {
          id: "#1044",
          client: "Jasur Toshmatov",
          phone: "+998 93 345 67 89",
          amount: 45000,
          status: "pending",
          date: "2024-12-14",
        },
        {
          id: "#1045",
          client: "Nodira Azimova",
          phone: "+998 94 456 78 90",
          amount: 95000,
          status: "cancelled",
          date: "2024-12-14",
        },
        {
          id: "#1046",
          client: "Bobur Aliyev",
          phone: "+998 95 567 89 01",
          amount: 150000,
          status: "delivered",
          date: "2024-12-13",
        },
        {
          id: "#1047",
          client: "Gulnora Karimova",
          phone: "+998 96 678 90 12",
          amount: 67000,
          status: "preparing",
          date: "2024-12-13",
        },
        {
          id: "#1048",
          client: "Timur Xasanov",
          phone: "+998 97 789 01 23",
          amount: 112000,
          status: "pending",
          date: "2024-12-12",
        },
        {
          id: "#1049",
          client: "Zulfiya Murodova",
          phone: "+998 98 890 12 34",
          amount: 78000,
          status: "delivered",
          date: "2024-12-12",
        },
        {
          id: "#1050",
          client: "Rustam Sobirov",
          phone: "+998 99 901 23 45",
          amount: 134000,
          status: "pending",
          date: "2024-12-11",
        },
        {
          id: "#1051",
          client: "Malika Usmonova",
          phone: "+998 88 012 34 56",
          amount: 56000,
          status: "preparing",
          date: "2024-12-11",
        },
        {
          id: "#1052",
          client: "Akbar Jo'rayev",
          phone: "+998 90 111 22 33",
          amount: 98000,
          status: "delivered",
          date: "2024-12-10",
        },
        {
          id: "#1053",
          client: "Sevinch Tojiboyeva",
          phone: "+998 91 222 33 44",
          amount: 143000,
          status: "pending",
          date: "2024-12-10",
        },
      ];

      var defaultProducts = [
        {
          id: 1,
          name: "Osh",
          category: "Taomlar",
          price: 35000,
          image: "https://picsum.photos/seed/osh/400/300.jpg",
          desc: "An'anaviy o'zbek oshi",
        },
        {
          id: 2,
          name: "Plov",
          category: "Taomlar",
          price: 40000,
          image: "https://picsum.photos/seed/plov/400/300.jpg",
          desc: "Samarqand plovi",
        },
        {
          id: 3,
          name: "Manti",
          category: "Taomlar",
          price: 30000,
          image: "https://picsum.photos/seed/manti/400/300.jpg",
          desc: "Bug'doy manti",
        },
        {
          id: 4,
          name: "Lag'mon",
          category: "Taomlar",
          price: 28000,
          image: "https://picsum.photos/seed/lagman/400/300.jpg",
          desc: "Qo'lda yopilgan lag'mon",
        },
        {
          id: 5,
          name: "Shashlik",
          category: "Taomlar",
          price: 45000,
          image: "https://picsum.photos/seed/shashlik/400/300.jpg",
          desc: "Qiyma shashlik",
        },
        {
          id: 6,
          name: "Choynak",
          category: "Ichimliklar",
          price: 8000,
          image: "https://picsum.photos/seed/choy/400/300.jpg",
          desc: "Yashil choy",
        },
        {
          id: 7,
          name: "Limonad",
          category: "Ichimliklar",
          price: 12000,
          image: "https://picsum.photos/seed/lemon/400/300.jpg",
          desc: "Limon limonad",
        },
        {
          id: 8,
          name: "Halva",
          category: "Desertlar",
          price: 15000,
          image: "https://picsum.photos/seed/halva/400/300.jpg",
          desc: "Sug'orilgan halva",
        },
        {
          id: 9,
          name: "Salat",
          category: "Salatlar",
          price: 18000,
          image: "https://picsum.photos/seed/saladuz/400/300.jpg",
          desc: "Chizg'it salat",
        },
        {
          id: 10,
          name: "Nonushta",
          category: "Nonushta",
          price: 22000,
          image: "https://picsum.photos/seed/breakfast/400/300.jpg",
          desc: "To'liq nonushta",
        },
        {
          id: 11,
          name: "Norin",
          category: "Taomlar",
          price: 32000,
          image: "https://picsum.photos/seed/norin/400/300.jpg",
          desc: "Norin (qazi bilan)",
        },
        {
          id: 12,
          name: "Qozon kabob",
          category: "Taomlar",
          price: 55000,
          image: "https://picsum.photos/seed/kabob/400/300.jpg",
          desc: "Qozonda pishirilgan kabob",
        },
      ];

      var defaultNotifications = [
        {
          id: 1,
          type: "order",
          title: "Yangi buyurtma",
          desc: "Dilnoza Rahimova yangi buyurtma berdi — 120,000 so'm",
          time: "5 daqiqa oldin",
          tag: "new",
          unread: true,
        },
        {
          id: 2,
          type: "delivered",
          title: "Buyurtma yetkazildi",
          desc: "Sardor Karimov buyurtmasi muvaffaqiyatli yetkazildi",
          time: "15 daqiqa oldin",
          tag: "success",
          unread: true,
        },
        {
          id: 3,
          type: "comment",
          title: "Yangi izoh",
          desc: "Jasur Toshmatov mahsulotga izoh qoldirdi",
          time: "32 daqiqa oldin",
          tag: "info",
          unread: true,
        },
        {
          id: 4,
          type: "payment",
          title: "To'lov qabul qilindi",
          desc: "Bobur Aliyev to'lovi — 150,000 so'm",
          time: "1 soat oldin",
          tag: "success",
          unread: true,
        },
        {
          id: 5,
          type: "cancelled",
          title: "Buyurtma bekor qilindi",
          desc: "Nodira Azimova buyurtmasini bekor qildi",
          time: "1.5 soat oldin",
          tag: "danger",
          unread: false,
        },
        {
          id: 6,
          type: "review",
          title: "Yangi sharh",
          desc: "Timur Xasanov 5 yulduz sharh qoldirdi",
          time: "2 soat oldin",
          tag: "warning",
          unread: false,
        },
        {
          id: 7,
          type: "stock",
          title: "Mahsulot tugaydi",
          desc: "Limonad zaxirasi kam qoldi — 3 dona",
          time: "3 soat oldin",
          tag: "danger",
          unread: false,
        },
        {
          id: 8,
          type: "promo",
          title: "Aksiya boshlandi",
          desc: "25% chegirma aksiyasi bugundan boshlab",
          time: "5 soat oldin",
          tag: "info",
          unread: false,
        },
      ];

      var defaultReviews = [
        {
          id: 1,
          name: "Sardor Karimov",
          rating: 5,
          text: "Osh juda mazali edi! Yetkazish ham o'z vaqtida bo'ldi. Raxmat!",
          date: "2024-12-15",
          product: "Osh",
        },
        {
          id: 2,
          name: "Dilnoza Rahimova",
          rating: 4,
          text: "Plov yaxshi, lekin biroz sho'r edi. Keyingi marta sho'rlikni kamaytiring.",
          date: "2024-12-14",
          product: "Plov",
        },
        {
          id: 3,
          name: "Jasur Toshmatov",
          rating: 5,
          text: "Manti ajoyib! Onam tayyorlagandek bo'ldi. Albatta yana buyurtma beraman.",
          date: "2024-12-13",
          product: "Manti",
        },
        {
          id: 4,
          name: "Bobur Aliyev",
          rating: 5,
          text: "Shashlik va choynak — eng yaxshi kombinatsiya! Tashakkur.",
          date: "2024-12-12",
          product: "Shashlik",
        },
        {
          id: 5,
          name: "Gulnora Karimova",
          rating: 3,
          text: "Lag'mon ta'mi yoqdi, lekin yetkazish 45 daqiqa davom etdi.",
          date: "2024-12-11",
          product: "Lag'mon",
        },
        {
          id: 6,
          name: "Timur Xasanov",
          rating: 4,
          text: "Norin juda zo'r edi! Faqat porsiya ozroq ko'p bo'lsa yaxshi bo'lardi.",
          date: "2024-12-10",
          product: "Norin",
        },
      ];

      var chartData = [
        { label: "Dush", value: 85 },
        { label: "Sesh", value: 120 },
        { label: "Chor", value: 95 },
        { label: "Pay", value: 140 },
        { label: "Jum", value: 180 },
        { label: "Shan", value: 150 },
        { label: "Yak", value: 110 },
      ];

      /* ==============================================
           2. HOLAT (STATE) O'ZGARUVCHILARI
           ============================================== */
      var currentLang = localStorage.getItem("mk_lang") || "uz";
      var currentTheme = localStorage.getItem("mk_theme") || "light";
      var currentUser = JSON.parse(localStorage.getItem("mk_user") || "null");
      var orders =
        JSON.parse(localStorage.getItem("mk_orders") || "null") ||
        JSON.parse(JSON.stringify(defaultOrders));
      var products =
        JSON.parse(localStorage.getItem("mk_products") || "null") ||
        JSON.parse(JSON.stringify(defaultProducts));
      var notifications =
        JSON.parse(localStorage.getItem("mk_notifs") || "null") ||
        JSON.parse(JSON.stringify(defaultNotifications));
      var reviews =
        JSON.parse(localStorage.getItem("mk_reviews") || "null") ||
        JSON.parse(JSON.stringify(defaultReviews));
      var settings = JSON.parse(
        localStorage.getItem("mk_settings") || "null",
      ) || {
        newOrderNotif: true,
        soundNotif: false,
        emailNotif: true,
        smsNotif: false,
        pushNotif: false,
        twoFa: false,
        showOnline: true,
        darkMode: false,
        currency: "UZS",
        deliveryFee: 15000,
        minOrder: 30000,
        workStart: "09:00",
        workEnd: "23:00",
        deliveryRadius: 15,
        profileVisibility: "public",
        perPage: "10",
      };
      var currentPage = "dashboard";
      var editingOrderId = null;

      /* ==============================================
           3. OTP KODLARI VA TIMERLAR
           ============================================== */
      var emailCode = "";
      var phoneCode = "";
      var emailTimerInterval = null;
      var phoneTimerInterval = null;
      var emailTimerSeconds = 60;
      var phoneTimerSeconds = 60;

      /* ==============================================
           4. YORDAMCHI FUNKSIYALAR
           ============================================== */

      /* Ma'lumotlarni localStorage'ga saqlash */
      function saveData() {
        localStorage.setItem("mk_orders", JSON.stringify(orders));
        localStorage.setItem("mk_products", JSON.stringify(products));
        localStorage.setItem("mk_notifs", JSON.stringify(notifications));
        localStorage.setItem("mk_reviews", JSON.stringify(reviews));
        localStorage.setItem("mk_settings", JSON.stringify(settings));
        localStorage.setItem("mk_user", JSON.stringify(currentUser));
      }

      /* Narxni formatlash (valyutaga qarab) */
      function formatPrice(amount) {
        var curr = settings.currency || "UZS";
        if (curr === "USD") return "$" + (amount / 12500).toFixed(2);
        if (curr === "RUB")
          return Math.round(amount / 140).toLocaleString() + " rubl";
        return amount.toLocaleString() + " so'm";
      }

      /* Status badge HTML yaratish */
      function statusBadge(status) {
        var labels = {
          pending: "Kutilmoqda",
          preparing: "Tayyorlanmoqda",
          delivered: "Yetkazildi",
          cancelled: "Bekor qilindi",
        };
        return (
          '<span class="status-badge ' +
          status +
          '">' +
          (labels[status] || status) +
          "</span>"
        );
      }

      /* Yulduzlar HTML yaratish */
      function starsHTML(rating) {
        var html = "";
        for (var i = 0; i < 5; i++) {
          html +=
            i < rating
              ? '<i class="fas fa-star"></i> '
              : '<i class="far fa-star"></i> ';
        }
        return html;
      }

      /* Ismning bosh harflarini olish */
      function getInitials(firstName, lastName) {
        var parts = [];
        if (firstName) parts.push(firstName.trim()[0]);
        if (lastName) parts.push(lastName.trim()[0]);
        if (parts.length === 0) return "?";
        return parts.join("").toUpperCase();
      }

      /* Tasodifiy 6 xonali kod generatsiya qilish */
      function generateCode() {
        var code = "";
        for (var i = 0; i < 6; i++) {
          code += Math.floor(Math.random() * 10).toString();
        }
        return code;
      }

      /* Email formatini tekshirish */
      function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }

      /* Telefon formatini tekshirish (o'zbek raqami) */
      function isValidPhone(phone) {
        var cleaned = phone.replace(/[\s\-\(\)]/g, "");
        return cleaned.length >= 9 && /^\+?998/.test(cleaned);
      }

      /* Formani tozalash (xatolarni) */
      function clearFieldError(inputId, errorId) {
        var inp = document.getElementById(inputId);
        var err = document.getElementById(errorId);
        if (inp) inp.classList.remove("error");
        if (err) err.classList.remove("show");
      }

      /* Formada xato ko'rsatish */
      function showFieldError(inputId, errorId) {
        var inp = document.getElementById(inputId);
        var err = document.getElementById(errorId);
        if (inp) inp.classList.add("error");
        if (err) err.classList.add("show");
      }

      /* ==============================================
           5. TOAST BILDIRISHNOMALARI
           ============================================== */
      function showToast(type, title, message, duration) {
        duration = duration || 4000;
        var container = document.getElementById("toastContainer");
        var icons = {
          success: "fa-check",
          error: "fa-times",
          warning: "fa-exclamation",
          info: "fa-info",
        };
        var toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.innerHTML =
          '<div class="toast-icon"><i class="fas ' +
          (icons[type] || "fa-info") +
          '"></i></div>' +
          '<div class="toast-content"><div class="toast-title">' +
          title +
          "</div>" +
          '<div class="toast-message">' +
          message +
          "</div></div>" +
          '<button class="toast-close" onclick="removeToast(this.parentElement)"><i class="fas fa-times"></i></button>' +
          '<div class="toast-progress" style="animation-duration:' +
          duration +
          'ms"></div>';
        container.appendChild(toast);
        setTimeout(function () {
          removeToast(toast);
        }, duration);
      }

      function removeToast(el) {
        if (!el || el.classList.contains("removing")) return;
        el.classList.add("removing");
        setTimeout(function () {
          if (el.parentElement) el.parentElement.removeChild(el);
        }, 500);
      }

      /* ==============================================
           6. MODAL / CONFIRM
           ============================================== */
      function openModal(id) {
        document.getElementById(id).classList.add("show");
        document.body.style.overflow = "hidden";
      }

      function closeModal(id) {
        document.getElementById(id).classList.remove("show");
        document.body.style.overflow = "";
      }

      var confirmCallback = null;

      function showConfirm(title, desc, callback) {
        document.getElementById("confirmTitle").textContent = title;
        document.getElementById("confirmDesc").textContent = desc;
        confirmCallback = callback;
        document.getElementById("confirmOverlay").classList.add("show");
        document.body.style.overflow = "hidden";
      }

      function closeConfirm() {
        document.getElementById("confirmOverlay").classList.remove("show");
        document.body.style.overflow = "";
        confirmCallback = null;
      }

      document
        .getElementById("confirmAction")
        .addEventListener("click", function () {
          if (confirmCallback) confirmCallback();
          closeConfirm();
        });

      /* ==============================================
           7. MAVZU ALMASHTIRISH
           ============================================== */
      function toggleTheme() {
        currentTheme = currentTheme === "light" ? "dark" : "light";
        applyTheme();
        localStorage.setItem("mk_theme", currentTheme);
        settings.darkMode = currentTheme === "dark";
        saveData();
      }

      function applyTheme() {
        document.documentElement.setAttribute("data-theme", currentTheme);
        var icon = document.querySelector("#themeToggle i");
        icon.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
        var dmToggle = document.getElementById("darkModeToggle");
        if (dmToggle) {
          if (currentTheme === "dark") dmToggle.classList.add("active");
          else dmToggle.classList.remove("active");
        }
      }

      /* ==============================================
           8. TIL ALMASHTIRISH
           ============================================== */
      function switchLang(lang) {
        currentLang = lang;
        localStorage.setItem("mk_lang", lang);
        document.querySelectorAll(".lang-btn").forEach(function (btn) {
          btn.classList.toggle(
            "active",
            btn.getAttribute("data-lang") === lang,
          );
        });
        var langSel = document.getElementById("langSelect");
        if (langSel) langSel.value = lang;
      }

      /* ==============================================
           9. NAVIGATSIYA
           ============================================== */
      function navigateTo(page) {
        currentPage = page;
        document.querySelectorAll(".nav-item").forEach(function (item) {
          item.classList.toggle(
            "active",
            item.getAttribute("data-page") === page,
          );
        });
        document.querySelectorAll(".page-panel").forEach(function (panel) {
          panel.classList.remove("active");
        });
        var target = document.getElementById("page-" + page);
        if (target) target.classList.add("active");

        var titles = {
          dashboard: "Dashboard",
          orders: "Buyurtmalar",
          products: "Mahsulotlar",
          notifications: "Bildirishnomalar",
          reviews: "Sharhlar",
          analytics: "Statistika",
          settings: "Sozlamalar",
        };
        document.getElementById("pageTitle").textContent = titles[page] || page;
        document.getElementById("breadcrumbCurrent").textContent =
          titles[page] || page;

        closeSidebar();
        renderAll();

        /* Sozlamalar sahifasi ochilganda ma'lumotlarni yangilash */
        if (page === "settings") updateSettingsDisplay();
      }

      /* ==============================================
           10. SIDEBAR
           ============================================== */
      function toggleSidebar() {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebarOverlay").classList.toggle("show");
      }

      function closeSidebar() {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebarOverlay").classList.remove("show");
      }

      /* ==============================================
           11. PROFIL DROPDOWN
           ============================================== */
      function handleProfileClick() {
        if (!currentUser) {
          openModal("loginModal");
          return;
        }
        document.getElementById("profileDropdown").classList.toggle("show");
      }

      function closeDropdown() {
        document.getElementById("profileDropdown").classList.remove("show");
      }

      /* Tashqi klikni ushlash — dropdrownni yopish */
      document.addEventListener("click", function (e) {
        var wrapper = document.querySelector(".profile-wrapper");
        if (wrapper && !wrapper.contains(e.target)) {
          closeDropdown();
        }
      });

      /* ==============================================
           12. LOGIN — QADAMLI RO'YXATDAN O'TISH
           ============================================== */

      /* 1-qadam: Ma'lumotlarni tekshirib, email kodini yuborish */
      function goToEmailStep() {
        var valid = true;
        var firstName = document.getElementById("regFirstName").value.trim();
        var lastName = document.getElementById("regLastName").value.trim();
        var email = document.getElementById("regEmail").value.trim();
        var phone = document.getElementById("regPhone").value.trim();
        var password = document.getElementById("regPassword").value;
        var password2 = document.getElementById("regPassword2").value;

        /* Barcha xatolarni avval tozalash */
        clearFieldError("regFirstName", "errFirstName");
        clearFieldError("regLastName", "errLastName");
        clearFieldError("regEmail", "errEmail");
        clearFieldError("regPhone", "errPhone");
        clearFieldError("regPassword", "errPassword");
        clearFieldError("regPassword2", "errPassword2");

        /* Tekshirish */
        if (!firstName) {
          showFieldError("regFirstName", "errFirstName");
          valid = false;
        }
        if (!lastName) {
          showFieldError("regLastName", "errLastName");
          valid = false;
        }
        if (!isValidEmail(email)) {
          showFieldError("regEmail", "errEmail");
          valid = false;
        }
        if (!isValidPhone(phone)) {
          showFieldError("regPhone", "errPhone");
          valid = false;
        }
        if (password.length < 6) {
          showFieldError("regPassword", "errPassword");
          valid = false;
        }
        if (password !== password2) {
          showFieldError("regPassword2", "errPassword2");
          valid = false;
        }

        if (!valid) {
          showToast(
            "error",
            "Xatolik",
            "Barcha maydonlarni to'g'ri to'ldiring",
          );
          return;
        }

        /* Email kodini generatsiya qilish va ko'rsatish */
        emailCode = generateCode();
        document.getElementById("emailDisplay").textContent = email;
        showToast(
          "success",
          "Email kod yuborildi",
          "Kod: " + emailCode + " (demo)",
        );

        /* 2-qadamni ko'rsatish */
        showLoginStep(2);
        startEmailTimer();

        /* Birinchi OTP inputga fokus */
        setTimeout(function () {
          document.querySelector("#emailOtpRow .otp-input").focus();
        }, 300);
      }

      /* 2-qadam: Email kodni tasdiqlash */
      function verifyEmailCode() {
        var code = getOtpValue("email");
        clearFieldError("emailOtpRow", "errEmailOtp");

        if (code !== emailCode) {
          document.getElementById("errEmailOtp").classList.add("show");
          /* Barcha OTP inputlarni qizil qilish */
          document
            .querySelectorAll("#emailOtpRow .otp-input")
            .forEach(function (inp) {
              inp.classList.add("error");
            });
          showToast(
            "error",
            "Noto'g'ri kod",
            "Email kodini tekshirib qayta kiriting",
          );
          return;
        }

        /* Email tasdiqlandi — telefon kodiga o'tish */
        phoneCode = generateCode();
        var phone = document.getElementById("regPhone").value.trim();
        document.getElementById("phoneDisplay").textContent = phone;
        showToast(
          "success",
          "SMS kod yuborildi",
          "Kod: " + phoneCode + " (demo)",
        );

        /* 3-qadamni ko'rsatish */
        showLoginStep(3);
        startPhoneTimer();

        setTimeout(function () {
          document.querySelector("#phoneOtpRow .otp-input").focus();
        }, 300);
      }

      /* 3-qadam: Telefon kodni tasdiqlash va kirish */
      function verifyPhoneCode() {
        var code = getOtpValue("phone");
        clearFieldError("phoneOtpRow", "errPhoneOtp");

        if (code !== phoneCode) {
          document.getElementById("errPhoneOtp").classList.add("show");
          document
            .querySelectorAll("#phoneOtpRow .otp-input")
            .forEach(function (inp) {
              inp.classList.add("error");
            });
          showToast(
            "error",
            "Noto'g'ri kod",
            "SMS kodini tekshirib qayta kiriting",
          );
          return;
        }

        /* Foydalanuvchi ma'lumotlarini saqlash */
        currentUser = {
          firstName: document.getElementById("regFirstName").value.trim(),
          lastName: document.getElementById("regLastName").value.trim(),
          email: document.getElementById("regEmail").value.trim(),
          phone: document.getElementById("regPhone").value.trim(),
          password: document.getElementById("regPassword").value,
          birth: document.getElementById("regBirth").value,
          gender: document.getElementById("regGender").value,
          avatar: "",
          address: "",
          bio: "",
          phone2: "",
          telegram: "",
          instagram: "",
          emailVerified: true,
          phoneVerified: true,
          createdAt: new Date().toISOString(),
        };

        saveData();
        updateProfileUI();
        updateSettingsDisplay();
        closeModal("loginModal");
        showToast(
          "success",
          "Muvaffaqiyat!",
          "Tizimga xush kelibsiz, " + currentUser.firstName + "!",
        );

        /* Timerni tozalash */
        clearInterval(emailTimerInterval);
        clearInterval(phoneTimerInterval);
      }

      /* ==============================================
           13. OTP INPUT LOGIKASI
           ============================================== */

      /* Belgini kiritganda keyingi inputga o'tish */
      function handleOtpInput(input) {
        input.value = input.value.replace(/[^0-9]/g, "");
        if (input.value.length === 1) {
          input.classList.add("filled");
          input.classList.remove("error");
          var next = input.nextElementSibling;
          if (next && next.classList.contains("otp-input")) {
            next.focus();
          }
        } else {
          input.classList.remove("filled");
        }
      }

      /* Backspace bosilganda oldingi inputga qaytish */
      function handleOtpKeydown(e, input) {
        if (e.key === "Backspace" && input.value === "") {
          var prev = input.previousElementSibling;
          if (prev && prev.classList.contains("otp-input")) {
            prev.focus();
            prev.value = "";
            prev.classList.remove("filled");
          }
        }
      }

      /* Barcha OTP inputlardan qiymatni olish */
      function getOtpValue(type) {
        var code = "";
        document
          .querySelectorAll('.otp-input[data-otp="' + type + '"]')
          .forEach(function (inp) {
            code += inp.value;
          });
        return code;
      }

      /* ==============================================
           14. QADAM INDIKATORI VA SAHIFALAR
           ============================================== */

      function showLoginStep(step) {
        /* Barcha qadamlarni yashirish */
        document.querySelectorAll(".login-step").forEach(function (el) {
          el.style.display = "none";
        });
        document.getElementById("loginStep" + step).style.display = "block";

        /* Indikatorni yangilash */
        document
          .querySelectorAll("#loginSteps .step-item")
          .forEach(function (item) {
            var s = parseInt(item.getAttribute("data-step"));
            item.classList.remove("active", "done");
            if (s < step) item.classList.add("done");
            if (s === step) item.classList.add("active");
          });
        document
          .querySelectorAll("#loginSteps .step-line")
          .forEach(function (line, idx) {
            line.classList.toggle("done", idx < step - 1);
          });
      }

      function goBackToStep(step) {
        showLoginStep(step);
        if (step === 1) {
          clearInterval(emailTimerInterval);
        }
      }

      /* ==============================================
           15. TIMERLAR (Kod qayta yuborish)
           ============================================== */

      function startEmailTimer() {
        emailTimerSeconds = 60;
        document.getElementById("emailTimer").style.display = "";
        document.getElementById("emailResendWrap").style.display = "none";
        clearInterval(emailTimerInterval);
        emailTimerInterval = setInterval(function () {
          emailTimerSeconds--;
          document.getElementById("emailTimerSec").textContent =
            emailTimerSeconds;
          if (emailTimerSeconds <= 0) {
            clearInterval(emailTimerInterval);
            document.getElementById("emailTimer").style.display = "none";
            document.getElementById("emailResendWrap").style.display = "";
          }
        }, 1000);
      }

      function startPhoneTimer() {
        phoneTimerSeconds = 60;
        document.getElementById("phoneTimer").style.display = "";
        document.getElementById("phoneResendWrap").style.display = "none";
        clearInterval(phoneTimerInterval);
        phoneTimerInterval = setInterval(function () {
          phoneTimerSeconds--;
          document.getElementById("phoneTimerSec").textContent =
            phoneTimerSeconds;
          if (phoneTimerSeconds <= 0) {
            clearInterval(phoneTimerInterval);
            document.getElementById("phoneTimer").style.display = "none";
            document.getElementById("phoneResendWrap").style.display = "";
          }
        }, 1000);
      }

      function resendEmailCode() {
        emailCode = generateCode();
        showToast(
          "success",
          "Qayta yuborildi",
          "Yangi email kod: " + emailCode,
        );
        /* OTP inputlarni tozalash */
        document
          .querySelectorAll("#emailOtpRow .otp-input")
          .forEach(function (inp) {
            inp.value = "";
            inp.classList.remove("filled", "error");
          });
        startEmailTimer();
        document.querySelector("#emailOtpRow .otp-input").focus();
      }

      function resendPhoneCode() {
        phoneCode = generateCode();
        showToast("success", "Qayta yuborildi", "Yangi SMS kod: " + phoneCode);
        document
          .querySelectorAll("#phoneOtpRow .otp-input")
          .forEach(function (inp) {
            inp.value = "";
            inp.classList.remove("filled", "error");
          });
        startPhoneTimer();
        document.querySelector("#phoneOtpRow .otp-input").focus();
      }

      /* ==============================================
           16. PROFIL UI YANGILASH
           ============================================== */
      function updateProfileUI() {
        var headerAvatar = document.getElementById("headerAvatar");
        var headerName = document.getElementById("headerName");
        var dropdownAvatar = document.getElementById("dropdownAvatar");
        var dropdownName = document.getElementById("dropdownName");
        var dropdownEmail = document.getElementById("dropdownEmail");

        if (currentUser) {
          var fullName =
            (currentUser.firstName || "") + " " + (currentUser.lastName || "");
          headerName.textContent = fullName.trim();
          var initials = getInitials(
            currentUser.firstName,
            currentUser.lastName,
          );

          if (currentUser.avatar) {
            headerAvatar.innerHTML =
              '<img src="' + currentUser.avatar + '" alt="avatar">';
            dropdownAvatar.innerHTML =
              '<img src="' + currentUser.avatar + '" alt="avatar">';
          } else {
            headerAvatar.innerHTML = initials;
            dropdownAvatar.innerHTML = initials;
          }

          dropdownName.textContent = fullName.trim();
          dropdownEmail.textContent = currentUser.email || "";
        } else {
          headerName.textContent = "Profilga kirish";
          headerAvatar.innerHTML = '<i class="fas fa-user"></i>';
          dropdownAvatar.innerHTML = '<i class="fas fa-user"></i>';
          dropdownName.textContent = "";
          dropdownEmail.textContent = "";
        }
      }

      /* Sozlamalar sahifasidagi profil ma'lumotlarini yangilash */
      function updateSettingsDisplay() {
        if (!currentUser) {
          document.getElementById("settingsName").textContent = "Kiritilmagan";
          document.getElementById("settingsEmail").textContent = "Kiritilmagan";
          document.getElementById("settingsPhone").textContent = "Kiritilmagan";
          document.getElementById("settingsBirth").textContent = "Kiritilmagan";
          document.getElementById("settingsGender").textContent =
            "Kiritilmagan";
          document.getElementById("settingsAddress").textContent =
            "Kiritilmagan";
          document.getElementById("settingsBio").textContent = "Kiritilmagan";
          document.getElementById("settingsEmailStatus").style.display = "none";
          document.getElementById("settingsPhoneStatus").style.display = "none";
          return;
        }

        var fullName =
          (currentUser.firstName || "") + " " + (currentUser.lastName || "");
        document.getElementById("settingsName").textContent =
          fullName.trim() || "Kiritilmagan";
        document.getElementById("settingsEmail").textContent =
          currentUser.email || "Kiritilmagan";
        document.getElementById("settingsPhone").textContent =
          currentUser.phone || "Kiritilmagan";
        document.getElementById("settingsBirth").textContent =
          currentUser.birth || "Kiritilmagan";
        document.getElementById("settingsGender").textContent =
          currentUser.gender === "male"
            ? "Erkak"
            : currentUser.gender === "female"
              ? "Ayol"
              : "Kiritilmagan";
        document.getElementById("settingsAddress").textContent =
          currentUser.address || "Kiritilmagan";
        document.getElementById("settingsBio").textContent =
          currentUser.bio || "Kiritilmagan";

        document.getElementById("settingsEmailStatus").style.display =
          currentUser.emailVerified ? "" : "none";
        document.getElementById("settingsPhoneStatus").style.display =
          currentUser.phoneVerified ? "" : "none";
      }

      /* ==============================================
           17. CHIQISH (LOGOUT)
           ============================================== */
      function logout() {
        closeDropdown();
        if (!currentUser) return;
        showConfirm(
          "Chiqish",
          "Haqiqatan ham tizimdan chiqmoqchimisiz?",
          function () {
            currentUser = null;
            saveData();
            updateProfileUI();
            showToast("info", "Chiqish", "Tizimdan muvaffaqiyatli chiqdingiz");
          },
        );
      }

      /* ==============================================
           18. PROFIL TAHRIRLASH (KENGAYTIRILGAN)
           ============================================== */
      function openEditModal() {
        closeDropdown();
        if (!currentUser) {
          openModal("loginModal");
          return;
        }

        /* Hozirgi qiymatlarni inputlarga joylashtirish */
        document.getElementById("editFirstName").value =
          currentUser.firstName || "";
        document.getElementById("editLastName").value =
          currentUser.lastName || "";
        document.getElementById("editEmail").value = currentUser.email || "";
        document.getElementById("editPhone").value = currentUser.phone || "";
        document.getElementById("editPhone2").value = currentUser.phone2 || "";
        document.getElementById("editBirth").value = currentUser.birth || "";
        document.getElementById("editGender").value = currentUser.gender || "";
        document.getElementById("editAddress").value =
          currentUser.address || "";
        document.getElementById("editBio").value = currentUser.bio || "";
        document.getElementById("editTelegram").value =
          currentUser.telegram || "";
        document.getElementById("editInstagram").value =
          currentUser.instagram || "";

        /* Avatar */
        var img = document.getElementById("editAvatarImg");
        var icon = document.getElementById("editAvatarIcon");
        if (currentUser.avatar) {
          img.src = currentUser.avatar;
          img.style.display = "block";
          icon.style.display = "none";
        } else {
          img.style.display = "none";
          icon.style.display = "";
        }

        openModal("editModal");
      }

      /* Avatar faylini o'qish */
      function handleAvatarUpload(e) {
        var file = e.target.files[0];
        if (!file) return;

        /* Fayl hajmini tekshirish (5MB) */
        if (file.size > 5 * 1024 * 1024) {
          showToast(
            "error",
            "Fayl katta",
            "Rasm hajmi 5MB dan oshmasligi kerak",
          );
          return;
        }

        var reader = new FileReader();
        reader.onload = function (ev) {
          document.getElementById("editAvatarImg").src = ev.target.result;
          document.getElementById("editAvatarImg").style.display = "block";
          document.getElementById("editAvatarIcon").style.display = "none";
        };
        reader.readAsDataURL(file);
      }

      /* Barcha o'zgarishlarni saqlash */
      function saveProfile() {
        if (!currentUser) return;

        currentUser.firstName =
          document.getElementById("editFirstName").value.trim() ||
          currentUser.firstName;
        currentUser.lastName =
          document.getElementById("editLastName").value.trim() ||
          currentUser.lastName;
        currentUser.email =
          document.getElementById("editEmail").value.trim() ||
          currentUser.email;
        currentUser.phone =
          document.getElementById("editPhone").value.trim() ||
          currentUser.phone;
        currentUser.phone2 = document.getElementById("editPhone2").value.trim();
        currentUser.birth = document.getElementById("editBirth").value;
        currentUser.gender = document.getElementById("editGender").value;
        currentUser.address = document
          .getElementById("editAddress")
          .value.trim();
        currentUser.bio = document.getElementById("editBio").value.trim();
        currentUser.telegram = document
          .getElementById("editTelegram")
          .value.trim();
        currentUser.instagram = document
          .getElementById("editInstagram")
          .value.trim();

        var imgEl = document.getElementById("editAvatarImg");
        if (imgEl.style.display !== "none" && imgEl.src) {
          currentUser.avatar = imgEl.src;
        }

        saveData();
        updateProfileUI();
        updateSettingsDisplay();
        closeModal("editModal");
        showToast(
          "success",
          "Saqlandi",
          "Profil ma'lumotlari muvaffaqiyatli saqlandi",
        );
      }

      /* ==============================================
           19. PAROL O'ZGARTIRISH
           ============================================== */
      function openPasswordModal() {
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("newPassword2").value = "";
        clearFieldError("currentPassword", "errCurrentPwd");
        clearFieldError("newPassword", "errNewPwd");
        clearFieldError("newPassword2", "errNewPwd2");
        openModal("passwordModal");
      }

      function changePassword() {
        clearFieldError("currentPassword", "errCurrentPwd");
        clearFieldError("newPassword", "errNewPwd");
        clearFieldError("newPassword2", "errNewPwd2");

        var current = document.getElementById("currentPassword").value;
        var newPwd = document.getElementById("newPassword").value;
        var newPwd2 = document.getElementById("newPassword2").value;

        if (current !== currentUser.password) {
          showFieldError("currentPassword", "errCurrentPwd");
          showToast("error", "Xatolik", "Joriy parol noto'g'ri");
          return;
        }
        if (newPwd.length < 6) {
          showFieldError("newPassword", "errNewPwd");
          showToast(
            "error",
            "Xatolik",
            "Yangi parol kamida 6 belgidan iborat bo'lishi kerak",
          );
          return;
        }
        if (newPwd !== newPwd2) {
          showFieldError("newPassword2", "errNewPwd2");
          showToast("error", "Xatolik", "Parollar mos kelmadi");
          return;
        }

        currentUser.password = newPwd;
        saveData();
        closeModal("passwordModal");
        showToast("success", "Saqlandi", "Parol muvaffaqiyatli o'zgartirildi");
      }

      /* ==============================================
           20. BUYURTMALAR
           ============================================== */
      function renderOrders() {
        var search = (
          document.getElementById("orderSearch")
            ? document.getElementById("orderSearch").value
            : ""
        ).toLowerCase();
        var filter = document.getElementById("orderFilter")
          ? document.getElementById("orderFilter").value
          : "all";

        var filtered = orders.filter(function (o) {
          var matchSearch =
            o.client.toLowerCase().indexOf(search) !== -1 ||
            o.id.toLowerCase().indexOf(search) !== -1;
          var matchFilter = filter === "all" || o.status === filter;
          return matchSearch && matchFilter;
        });

        var body = document.getElementById("ordersBody");
        if (!body) return;

        if (filtered.length === 0) {
          body.innerHTML =
            '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--fg-m);">Hech narsa topilmadi</td></tr>';
          return;
        }

        body.innerHTML = filtered
          .map(function (o) {
            return (
              "<tr>" +
              '<td style="font-weight:800;color:var(--accent);">' +
              o.id +
              "</td>" +
              "<td>" +
              o.client +
              "</td>" +
              "<td>" +
              o.phone +
              "</td>" +
              '<td style="font-weight:800;">' +
              formatPrice(o.amount) +
              "</td>" +
              "<td>" +
              statusBadge(o.status) +
              "</td>" +
              "<td>" +
              o.date +
              "</td>" +
              '<td><button class="btn btn-outline btn-sm" onclick="openStatusModal(\'' +
              o.id +
              '\')"><i class="fas fa-edit"></i></button></td>' +
              "</tr>"
            );
          })
          .join("");

        updateBadges();
      }

      function renderDashboardOrders() {
        var body = document.getElementById("dashboardOrdersBody");
        if (!body) return;
        var recent = orders.slice(0, 5);
        body.innerHTML = recent
          .map(function (o) {
            return (
              "<tr>" +
              '<td style="font-weight:800;color:var(--accent);">' +
              o.id +
              "</td>" +
              "<td>" +
              o.client +
              "</td>" +
              '<td style="font-weight:800;">' +
              formatPrice(o.amount) +
              "</td>" +
              "<td>" +
              statusBadge(o.status) +
              "</td>" +
              "<td>" +
              o.date +
              "</td></tr>"
            );
          })
          .join("");
      }

      function openStatusModal(orderId) {
        editingOrderId = orderId;
        var order = orders.find(function (o) {
          return o.id === orderId;
        });
        if (order)
          document.getElementById("newStatusSelect").value = order.status;
        openModal("statusModal");
      }

      function saveStatus() {
        if (!editingOrderId) return;
        var newStatus = document.getElementById("newStatusSelect").value;
        var order = orders.find(function (o) {
          return o.id === editingOrderId;
        });
        if (order) {
          order.status = newStatus;
          saveData();
          renderOrders();
          renderDashboardOrders();
          closeModal("statusModal");
          var labels = {
            pending: "Kutilmoqda",
            preparing: "Tayyorlanmoqda",
            delivered: "Yetkazildi",
            cancelled: "Bekor qilindi",
          };
          showToast(
            "success",
            "Holat o'zgartirildi",
            order.id + " → " + (labels[newStatus] || newStatus),
          );
        }
        editingOrderId = null;
      }

      /* ==============================================
           21. MAHSULOTLAR
           ============================================== */
      function renderProducts() {
        var grid = document.getElementById("productsGrid");
        if (!grid) return;
        if (products.length === 0) {
          grid.innerHTML =
            '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-box-open"></i><p>Hech narsa topilmadi</p></div>';
          return;
        }
        grid.innerHTML = products
          .map(function (p) {
            return (
              '<div class="product-card animate-in">' +
              '<img class="pc-img" src="' +
              (p.image || "https://picsum.photos/seed/default/400/300.jpg") +
              '" alt="' +
              p.name +
              '" onerror="this.src=\'https://picsum.photos/seed/fallback/400/300.jpg\'">' +
              '<div class="pc-body">' +
              '<div class="pc-cat">' +
              p.category +
              "</div>" +
              '<div class="pc-name">' +
              p.name +
              "</div>" +
              '<div class="pc-price">' +
              formatPrice(p.price) +
              "</div>" +
              "</div>" +
              '<div class="pc-actions">' +
              '<button class="btn btn-outline btn-sm" style="flex:1;" onclick="deleteProduct(' +
              p.id +
              ')"><i class="fas fa-trash-alt"></i></button>' +
              "</div></div>"
            );
          })
          .join("");
      }

      function openAddProductModal() {
        document.getElementById("prodName").value = "";
        document.getElementById("prodPrice").value = "";
        document.getElementById("prodImage").value = "";
        document.getElementById("prodDesc").value = "";
        document.getElementById("prodCategory").value = "Taomlar";
        openModal("addProductModal");
      }

      function addProduct() {
        var name = document.getElementById("prodName").value.trim();
        var price = parseInt(document.getElementById("prodPrice").value) || 0;
        var category = document.getElementById("prodCategory").value;
        var image = document.getElementById("prodImage").value.trim();
        var desc = document.getElementById("prodDesc").value.trim();

        if (!name) {
          showToast("error", "Xatolik", "Mahsulot nomi kiritilishi shart");
          return;
        }
        if (price <= 0) {
          showToast("error", "Xatolik", "Narxni to'g'ri kiriting");
          return;
        }

        var maxId = products.reduce(function (max, p) {
          return Math.max(max, p.id);
        }, 0);
        products.push({
          id: maxId + 1,
          name: name,
          category: category,
          price: price,
          image:
            image ||
            "https://picsum.photos/seed/prod" + (maxId + 1) + "/400/300.jpg",
          desc: desc,
        });
        saveData();
        renderProducts();
        closeModal("addProductModal");
        showToast("success", "Qo'shildi", "Mahsulot muvaffaqiyatli qo'shildi");
      }

      function deleteProduct(id) {
        showConfirm(
          "O'chirish",
          "Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?",
          function () {
            products = products.filter(function (p) {
              return p.id !== id;
            });
            saveData();
            renderProducts();
            showToast(
              "info",
              "O'chirildi",
              "Mahsulot muvaffaqiyatli o'chirildi",
            );
          },
        );
      }

      /* ==============================================
           22. BILDIRISHNOMALAR
           ============================================== */
      function renderNotifications() {
        var list = document.getElementById("notifList");
        if (!list) return;
        if (notifications.length === 0) {
          list.innerHTML =
            '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>Hech narsa yo\'q</p></div>';
          return;
        }
        var iconMap = {
          order: "fa-shopping-bag",
          delivered: "fa-check-circle",
          comment: "fa-comment",
          payment: "fa-credit-card",
          cancelled: "fa-times-circle",
          review: "fa-star",
          stock: "fa-exclamation-triangle",
          promo: "fa-percent",
        };
        list.innerHTML = notifications
          .map(function (n) {
            return (
              '<div class="notif-card' +
              (n.unread ? " unread" : "") +
              '" onclick="markRead(' +
              n.id +
              ')">' +
              '<div class="notif-icon ' +
              n.type +
              '"><i class="fas ' +
              (iconMap[n.type] || "fa-bell") +
              '"></i></div>' +
              '<div class="notif-body">' +
              '<div class="notif-title">' +
              n.title +
              "</div>" +
              '<div class="notif-desc">' +
              n.desc +
              "</div>" +
              '<div class="notif-meta">' +
              '<span class="notif-time"><i class="far fa-clock"></i> ' +
              n.time +
              "</span>" +
              '<span class="notif-tag ' +
              n.tag +
              '">' +
              n.tag.toUpperCase() +
              "</span>" +
              "</div></div></div>"
            );
          })
          .join("");
        updateBadges();
      }

      function markRead(id) {
        var n = notifications.find(function (n) {
          return n.id === id;
        });
        if (n) {
          n.unread = false;
          saveData();
          renderNotifications();
        }
      }

      function markAllRead() {
        notifications.forEach(function (n) {
          n.unread = false;
        });
        saveData();
        renderNotifications();
        showToast(
          "success",
          "Tayyor",
          "Barcha bildirishnomalar o'qilgan deb belgilandi",
        );
      }

      /* ==============================================
           23. SHARHLAR
           ============================================== */
      function renderReviews() {
        var list = document.getElementById("reviewsList");
        if (!list) return;
        if (reviews.length === 0) {
          list.innerHTML =
            '<div class="empty-state"><i class="fas fa-star"></i><p>Hech narsa yo\'q</p></div>';
          return;
        }
        list.innerHTML = reviews
          .map(function (r) {
            return (
              '<div class="review-card animate-in">' +
              '<div class="rc-top">' +
              '<div class="rc-avatar">' +
              getInitials(r.name.split(" ")[0], r.name.split(" ")[1]) +
              "</div>" +
              '<div><div class="rc-name">' +
              r.name +
              "</div>" +
              '<div class="rc-date">' +
              r.date +
              " — " +
              r.product +
              "</div></div></div>" +
              '<div class="rc-stars">' +
              starsHTML(r.rating) +
              ' <span style="color:var(--fg-m);font-size:11px;margin-left:4px;">' +
              r.rating +
              "/5 yulduz</span></div>" +
              '<div class="rc-text">' +
              r.text +
              "</div></div>"
            );
          })
          .join("");
      }

      /* ==============================================
           24. GRAFIK
           ============================================== */
      function renderChart() {
        var wrap = document.getElementById("chartBars");
        if (!wrap) return;
        var maxVal = Math.max.apply(
          null,
          chartData.map(function (d) {
            return d.value;
          }),
        );
        wrap.innerHTML = chartData
          .map(function (d) {
            var h = Math.max(4, (d.value / maxVal) * 140);
            return (
              '<div class="chart-bar-col">' +
              '<div class="chart-bar-value">' +
              d.value +
              "</div>" +
              '<div class="chart-bar" style="height:' +
              h +
              'px;"></div>' +
              '<div class="chart-bar-label">' +
              d.label +
              "</div></div>"
            );
          })
          .join("");
      }

      /* ==============================================
           25. SOZLAMALAR
           ============================================== */
      function toggleSwitch(el) {
        el.classList.toggle("active");
        var setting = el.getAttribute("data-setting");
        if (setting) {
          settings[setting] = el.classList.contains("active");
          saveData();
          showToast("success", "Saqlandi", "Sozlama o'zgartirildi");
        }
      }

      function saveCurrency() {
        settings.currency = document.getElementById("currencySelect").value;
        saveData();
        renderAll();
        showToast("success", "Saqlandi", "Valyuta o'zgartirildi");
      }

      function confirmClearData() {
        showConfirm(
          "Ma'lumotlarni o'chirish",
          "Barcha ma'lumotlarni o'chirish — bu amalni qaytarib bo'lmaydi!",
          function () {
            orders = JSON.parse(JSON.stringify(defaultOrders));
            products = JSON.parse(JSON.stringify(defaultProducts));
            notifications = JSON.parse(JSON.stringify(defaultNotifications));
            reviews = JSON.parse(JSON.stringify(defaultReviews));
            saveData();
            renderAll();
            showToast(
              "success",
              "Tayyor",
              "Barcha ma'lumotlar boshlang'ich holatga qaytarildi",
            );
          },
        );
      }

      function confirmDeleteAccount() {
        showConfirm(
          "Hisobni o'chirish",
          "Hisobingiz butunlay o'chiriladi. Barcha ma'lumotlaringiz yo'qoladi!",
          function () {
            currentUser = null;
            saveData();
            updateProfileUI();
            updateSettingsDisplay();
            showToast(
              "warning",
              "O'chirildi",
              "Hisobingiz muvaffaqiyatli o'chirildi",
            );
          },
        );
      }

      /* ==============================================
           26. BADGE LARNI YANGILASH
           ============================================== */
      function updateBadges() {
        var pendingCount = orders.filter(function (o) {
          return o.status === "pending" || o.status === "preparing";
        }).length;
        var unreadCount = notifications.filter(function (n) {
          return n.unread;
        }).length;
        var ob = document.getElementById("ordersBadge");
        var nb = document.getElementById("notifBadge");
        if (ob) {
          ob.textContent = pendingCount;
          ob.style.display = pendingCount > 0 ? "" : "none";
        }
        if (nb) {
          nb.textContent = unreadCount;
          nb.style.display = unreadCount > 0 ? "" : "none";
        }
      }

      /* ==============================================
           27. BARCHA SAHIFALARNI CHIZISH
           ============================================== */
      function renderAll() {
        renderDashboardOrders();
        renderOrders();
        renderProducts();
        renderNotifications();
        renderReviews();
        renderChart();
        updateProfileUI();
        updateBadges();
      }

      /* ==============================================
           28. SAHIFA YUKLANGANDA ISHGA TUSHIRISH
           ============================================== */
      (function init() {
        applyTheme();
        switchLang(currentLang);
        renderAll();

        /* Sozlamalar selectlarni moslashtirish */
        var cs = document.getElementById("currencySelect");
        if (cs) cs.value = settings.currency || "UZS";
        var df = document.getElementById("deliveryFeeInput");
        if (df) df.value = settings.deliveryFee || 15000;
        var mo = document.getElementById("minOrderInput");
        if (mo) mo.value = settings.minOrder || 30000;
        var ws = document.getElementById("workStart");
        if (ws) ws.value = settings.workStart || "09:00";
        var we = document.getElementById("workEnd");
        if (we) we.value = settings.workEnd || "23:00";
        var dr = document.getElementById("deliveryRadius");
        if (dr) dr.value = settings.deliveryRadius || 15;
        var pp = document.getElementById("perPageSelect");
        if (pp) pp.value = settings.perPage || "10";
        var pv = document.getElementById("profileVisibility");
        if (pv) pv.value = settings.profileVisibility || "public";

        /* Toggle switchlarni holatiga qarab o'rnatish */
        document
          .querySelectorAll(".toggle-switch[data-setting]")
          .forEach(function (toggle) {
            var key = toggle.getAttribute("data-setting");
            if (settings[key]) {
              toggle.classList.add("active");
            } else {
              toggle.classList.remove("active");
            }
          });

        /* Foydalanuvchi yo'q bo'lsa login modalni ko'rsatish */
        if (!currentUser) {
          setTimeout(function () {
            openModal("loginModal");
          }, 600);
        }
      })();