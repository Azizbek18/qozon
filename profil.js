/**
 * Xurmo opa — Glassmorphism 3D Pro Dashboard
 * Interaktiv JS: Toast, Counter, Toggle, Theme, 3D Tilt, Mobile Menu
 */

document.addEventListener("DOMContentLoaded", () => {

    // ══════════════════════════════════════════════════
    // 1. 3D TOAST NOTIFICATION SYSTEM
    // ══════════════════════════════════════════════════
    function showToast(title, message, icon = "📋") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.classList.add("custom-3d-toast");

        toast.innerHTML = `
            <div class="toast-body">
                <div class="toast-avatar">${icon}</div>
                <div class="toast-text-block">
                    <h5>${title}</h5>
                    <p>${message}</p>
                </div>
            </div>
            <div class="toast-time-line"></div>
        `;

        container.appendChild(toast);

        // 3D kirish animatsiyasi
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add("show");
            });
        });

        const duration = 3500;
        const timeLine = toast.querySelector(".toast-time-line");

        // Progress bar animatsiyasi
        timeLine.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
            timeLine.style.width = "0%";
        });

        // Chiqish animatsiyasi
        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hide");
            toast.addEventListener("transitionend", () => toast.remove());
        }, duration);
    }


    // ══════════════════════════════════════════════════
    // 2. COUNTER ANIMATION (Soni sezgir ko'tarish)
    // ══════════════════════════════════════════════════
    function animateCounters() {
        const counters = document.querySelectorAll(".counter");
        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const decimals = parseInt(counter.dataset.decimals) || 0;
            const duration = 1500;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutExpo
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = eased * target;

                if (decimals > 0) {
                    counter.textContent = current.toFixed(decimals);
                } else if (target >= 10000) {
                    counter.textContent = Math.floor(current).toLocaleString("uz-UZ");
                } else {
                    counter.textContent = Math.floor(current);
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    if (decimals > 0) {
                        counter.textContent = target.toFixed(decimals);
                    } else if (target >= 10000) {
                        counter.textContent = target.toLocaleString("uz-UZ");
                    } else {
                        counter.textContent = target;
                    }
                }
            }

            requestAnimationFrame(update);
        });
    }

    // Sahifa ochilganda animatsiyani boshlash
    setTimeout(animateCounters, 400);



    // ══════════════════════════════════════════════════
    // 2. SUPABASE INITIALIZATION & USER DATA SYNC
    // ══════════════════════════════════════════════════
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let authUser = null;
    let userProfile = null;

    // Eski hisoblarga tasodifan yozib qo'yilgan umumiy placeholder rasm —
    // haqiqiy profil surati emas, shu sabab e'tiborga olinmaydi.
    function isRealAvatar(url) {
        return !!url && !url.includes('user-male-circle');
    }

    async function loadUserData() {
        try {
            const { data: { session } } = await client.auth.getSession();
            if (!session) return;
            authUser = session.user;

            // Fetch profile data
            const { data: profile, error } = await client
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profile) {
                userProfile = profile;
            }

            populateUI();
            loadDynamicStats();
        } catch (err) {
            console.error("Failed to load user profile:", err);
            showToast("Xatolik", "Profil ma'lumotlarini yuklashda xatolik yuz berdi.", "❌");
        }
    }

    function populateUI() {
        if (!authUser) return;

        const fullName = userProfile?.full_name || authUser.user_metadata?.full_name || "Oshpaz";
        const phone = userProfile?.phone || authUser.user_metadata?.phone || "";
        const email = authUser.email || "";
        const avatarUrl = [userProfile?.avatar_url, authUser.user_metadata?.avatar_url].find(isRealAvatar)
            || "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=120&h=120";

        // Sidebar update
        const sidebarName = document.querySelector(".profile-name");
        if (sidebarName) sidebarName.textContent = fullName;
        
        const sidebarImg = document.querySelector(".profile-img");
        if (sidebarImg) sidebarImg.src = avatarUrl;

        // Main display name
        const displayName = document.getElementById("displayName");
        if (displayName) displayName.textContent = fullName;

        const profileAvatar = document.getElementById("profileAvatar");
        if (profileAvatar) profileAvatar.src = avatarUrl;

        // Input fields
        const inputFullName = document.getElementById("inputFullName");
        if (inputFullName) inputFullName.value = fullName;

        const inputPhone = document.getElementById("inputPhone");
        if (inputPhone) inputPhone.value = phone;

        const inputEmail = document.getElementById("inputEmail");
        if (inputEmail) inputEmail.value = email;

        // Address & Bio fallback from local storage
        const inputAddress = document.getElementById("inputAddress");
        if (inputAddress) {
            inputAddress.value = localStorage.getItem("qz_chef_address") || "Toshkent, Chilonzor tumani";
        }
        
        const inputBio = document.getElementById("inputBio");
        if (inputBio) {
            inputBio.value = localStorage.getItem("qz_chef_bio") || "An'anaviy taomlarni mehr bilan tayyorlayman.";
        }
    }

    async function loadDynamicStats() {
        if (!userProfile) return;
        try {
            const { count, error } = await client
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('chef_name', userProfile.full_name);

            if (!error && count !== null) {
                // Update Order Counts
                const statsVal = document.querySelector(".avatar-stat-val");
                if (statsVal) statsVal.textContent = count;
                
                const miniStatVal = document.querySelector(".mini-stat-val");
                if (miniStatVal) miniStatVal.textContent = count;
            }
        } catch (err) {
            console.error("Failed to load chef orders count:", err);
        }
    }

    loadUserData();


    // ══════════════════════════════════════════════════
    // 3. PERSONAL INFORMATION FORM EDIT/SAVE
    // ══════════════════════════════════════════════════
    const btnEditPersonal = document.getElementById("btnEditPersonal");
    const btnCancelPersonal = document.getElementById("btnCancelPersonal");
    const btnSavePersonal = document.getElementById("btnSavePersonal");
    const personalActions = document.getElementById("personalActions");
    const personalInputs = [
        document.getElementById("inputFullName"),
        document.getElementById("inputPhone"),
        document.getElementById("inputAddress"),
        document.getElementById("inputBio")
    ];

    if (btnEditPersonal) {
        btnEditPersonal.addEventListener("click", () => {
            personalInputs.forEach(input => {
                if (input) input.disabled = false;
            });
            personalActions.classList.remove("hidden");
            btnEditPersonal.style.display = "none";
        });
    }

    if (btnCancelPersonal) {
        btnCancelPersonal.addEventListener("click", () => {
            populateUI();
            personalInputs.forEach(input => {
                if (input) input.disabled = true;
            });
            personalActions.classList.add("hidden");
            btnEditPersonal.style.display = "flex";
        });
    }

    if (btnSavePersonal) {
        btnSavePersonal.addEventListener("click", async () => {
            const fullNameVal = document.getElementById("inputFullName").value.trim();
            const phoneVal = document.getElementById("inputPhone").value.trim();
            const addressVal = document.getElementById("inputAddress").value.trim();
            const bioVal = document.getElementById("inputBio").value.trim();

            if (!fullNameVal) {
                showToast("Xatolik", "Ism va Familiya kiritilishi shart!", "❌");
                return;
            }

            btnSavePersonal.disabled = true;
            btnSavePersonal.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';

            try {
                const { error: profileError } = await client
                    .from('profiles')
                    .update({
                        full_name: fullNameVal,
                        phone: phoneVal
                    })
                    .eq('id', authUser.id);

                if (profileError) throw profileError;

                localStorage.setItem("qz_chef_address", addressVal);
                localStorage.setItem("qz_chef_bio", bioVal);

                await client.auth.updateUser({
                    data: {
                        full_name: fullNameVal,
                        phone: phoneVal
                    }
                });

                showToast("Profil saqlandi", "Ma'lumotlar muvaffaqiyatli saqlandi!", "✅");

                personalInputs.forEach(input => {
                    if (input) input.disabled = true;
                });
                personalActions.classList.add("hidden");
                btnEditPersonal.style.display = "flex";
                
                loadUserData();
            } catch (err) {
                console.error("Save profile failed:", err);
                showToast("Xatolik", err.message || "Saqlashda xatolik yuz berdi", "❌");
            } finally {
                btnSavePersonal.disabled = false;
                btnSavePersonal.innerHTML = '<i class="fa-solid fa-check"></i> Saqlash';
            }
        });
    }


    // ══════════════════════════════════════════════════
    // 4. AVATAR UPLOAD & BASE64 SYNC
    // ══════════════════════════════════════════════════
    const btnChangeAvatar = document.getElementById("btnChangeAvatar");
    if (btnChangeAvatar) {
        const avatarInput = document.createElement("input");
        avatarInput.type = "file";
        avatarInput.accept = "image/*";
        avatarInput.style.display = "none";
        document.body.appendChild(avatarInput);

        btnChangeAvatar.addEventListener("click", () => {
            avatarInput.click();
        });

        avatarInput.addEventListener("change", async () => {
            const file = avatarInput.files[0];
            if (!file) return;

            showToast("Yuklanmoqda", "Rasm qayta ishlanmoqda...", "⏳");

            const reader = new FileReader();
            reader.onload = async () => {
                const base64Data = reader.result;

                try {
                    const { error } = await client
                        .from('profiles')
                        .update({ avatar_url: base64Data })
                        .eq('id', authUser.id);

                    if (error) throw error;

                    const sidebarImg = document.querySelector(".profile-img");
                    if (sidebarImg) sidebarImg.src = base64Data;
                    
                    const profileAvatar = document.getElementById("profileAvatar");
                    if (profileAvatar) profileAvatar.src = base64Data;

                    showToast("Muvaffaqiyat", "Profil rasmi yangilandi!", "✅");
                } catch (err) {
                    console.error("Upload avatar failed:", err);
                    showToast("Xatolik", "Rasmni yuklab bo'lmadi.", "❌");
                }
            };
            reader.readAsDataURL(file);
        });
    }


    // ══════════════════════════════════════════════════
    // 5. SECURITY PASSWORD UPDATE & INDICATION
    // ══════════════════════════════════════════════════
    const btnEditSecurity = document.getElementById("btnEditSecurity");
    const btnCancelSecurity = document.getElementById("btnCancelSecurity");
    const btnSaveSecurity = document.getElementById("btnSaveSecurity");
    const securityActions = document.getElementById("securityActions");
    const passStrength = document.getElementById("passStrength");
    const securityInputs = [
        document.getElementById("inputCurrentPass"),
        document.getElementById("inputNewPass"),
        document.getElementById("inputConfirmPass")
    ];

    if (btnEditSecurity) {
        btnEditSecurity.addEventListener("click", () => {
            securityInputs.forEach(input => {
                if (input) {
                    input.disabled = false;
                    input.value = "";
                }
            });
            securityActions.classList.remove("hidden");
            passStrength.classList.remove("hidden");
            btnEditSecurity.style.display = "none";
        });
    }

    if (btnCancelSecurity) {
        btnCancelSecurity.addEventListener("click", () => {
            securityInputs.forEach(input => {
                if (input) {
                    input.disabled = true;
                    input.value = "";
                    input.placeholder = "••••••••";
                }
            });
            securityActions.classList.add("hidden");
            passStrength.classList.add("hidden");
            btnEditSecurity.style.display = "flex";
        });
    }

    const togglePassBtns = document.querySelectorAll(".toggle-pass");
    togglePassBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = btn.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                const isPass = targetInput.type === "password";
                targetInput.type = isPass ? "text" : "password";
                btn.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            }
        });
    });

    const newPassInput = document.getElementById("inputNewPass");
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (newPassInput) {
        newPassInput.addEventListener("input", () => {
            const val = newPassInput.value;
            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[a-z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const colors = ["#ef4444", "#f59e0b", "#10b981"];
            const text = ["Kuchsiz", "O'rtacha", "Kuchli"];
            
            let level = 0;
            if (score >= 4) level = 2;
            else if (score >= 2) level = 1;

            strengthFill.style.width = `${(score / 5) * 100}%`;
            strengthFill.style.backgroundColor = colors[level];
            strengthText.textContent = text[level];
            strengthText.style.color = colors[level];
        });
    }

    if (btnSaveSecurity) {
        btnSaveSecurity.addEventListener("click", async () => {
            const newPass = newPassInput.value;
            const confirmPass = document.getElementById("inputConfirmPass").value;

            if (newPass.length < 8) {
                showToast("Xatolik", "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak!", "❌");
                return;
            }

            if (newPass !== confirmPass) {
                showToast("Xatolik", "Yangi parollar mos kelmadi!", "❌");
                return;
            }

            btnSaveSecurity.disabled = true;
            btnSaveSecurity.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yangilanmoqda...';

            try {
                const { error } = await client.auth.updateUser({ password: newPass });
                if (error) throw error;

                showToast("Parol yangilandi", "Xavfsizlik paroli o'zgartirildi!", "✅");

                securityInputs.forEach(input => {
                    if (input) {
                        input.disabled = true;
                        input.value = "";
                        input.placeholder = "••••••••";
                    }
                });
                securityActions.classList.add("hidden");
                passStrength.classList.add("hidden");
                btnEditSecurity.style.display = "flex";
            } catch (err) {
                console.error("Save password failed:", err);
                showToast("Xatolik", err.message || "Parolni yangilashda xatolik.", "❌");
            } finally {
                btnSaveSecurity.disabled = false;
                btnSaveSecurity.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Parolni yangilash';
            }
        });
    }


    // ══════════════════════════════════════════════════
    // 6. PREFERENCES CONFIGURATION (Notifications & Sound)
    // ══════════════════════════════════════════════════
    const preferences = document.querySelectorAll(".toggle-switch input");
    preferences.forEach(pref => {
        const key = `qz_pref_${pref.dataset.pref}`;
        const savedVal = localStorage.getItem(key);
        if (savedVal !== null) {
            pref.checked = savedVal === "true";
        }

        pref.addEventListener("change", (e) => {
            localStorage.setItem(key, e.target.checked);
            const label = e.target.closest(".pref-item")?.querySelector("h4").textContent || "Sozlama";
            showToast("Sozlama saqlandi", `${label} holati o'zgartirildi.`, "⚙️");
        });
    });


    // ══════════════════════════════════════════════════
    // 7. QUICK ACTIONS HANDLERS
    // ══════════════════════════════════════════════════
    const btnQuickShare = document.getElementById("btnQuickShare");
    if (btnQuickShare) {
        btnQuickShare.addEventListener("click", () => {
            navigator.clipboard.writeText(window.location.origin).then(() => {
                showToast("Ulashish", "Havola buferga nusxalandi!", "🔗");
            });
        });
    }

    const btnQuickQr = document.getElementById("btnQuickQr");
    if (btnQuickQr) {
        btnQuickQr.addEventListener("click", () => {
            showToast("QR Kod", "Sizning QR kodingiz yuklanmoqda...", "📱");
        });
    }

    const btnQuickSupport = document.getElementById("btnQuickSupport");
    if (btnQuickSupport) {
        btnQuickSupport.addEventListener("click", () => {
            showToast("Qo'llab-quvvatlash", "Telegram support kanaliga yo'naltirilmoqda...", "💬");
        });
    }

    const btnQuickLogout = document.getElementById("btnQuickLogout");
    if (btnQuickLogout) {
        btnQuickLogout.addEventListener("click", async () => {
            showToast("Chiqish", "Sessiya yakunlanmoqda...", "⏳");
            await client.auth.signOut();
            window.location.href = "kirish.html";
        });
    }


    // ══════════════════════════════════════════════════
    // 8. DANGER ZONE (Delete Account Dialog)
    // ══════════════════════════════════════════════════
    const btnDeleteAccount = document.getElementById("btnDeleteAccount");
    const deleteModal = document.getElementById("deleteModal");
    const btnModalCancel = document.getElementById("btnModalCancel");
    const btnModalConfirm = document.getElementById("btnModalConfirm");

    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener("click", () => {
            deleteModal.classList.remove("hidden");
        });
    }

    if (btnModalCancel) {
        btnModalCancel.addEventListener("click", () => {
            deleteModal.classList.add("hidden");
        });
    }

    if (btnModalConfirm) {
        btnModalConfirm.addEventListener("click", async () => {
            showToast("O'chirilmoqda", "Hisobingiz o'chirilmoqda...", "⏳");
            try {
                await client.from('profiles').delete().eq('id', authUser.id);
                await client.auth.signOut();
                window.location.href = "kirish.html";
            } catch (err) {
                console.error("Delete profile failed:", err);
                await client.auth.signOut();
                window.location.href = "kirish.html";
            }
        });
    }


    // ══════════════════════════════════════════════════
    // 9. THEME SWITCHER
    // ══════════════════════════════════════════════════
    const themeButtons = document.querySelectorAll(".theme-btn");
    const savedTheme = "light";
    localStorage.setItem("xurmo-glass-theme", "light");

    if (savedTheme === "light") {
        document.body.classList.remove("theme-dark");
        document.body.classList.add("theme-light");
        themeButtons.forEach(b => {
            b.classList.toggle("active", b.dataset.theme === "light");
        });
    }

    themeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.body.classList.remove("theme-dark", "theme-light");
            document.body.classList.add("theme-light", "chef-light");
            themeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            localStorage.setItem("xurmo-glass-theme", "light");

            showToast("Yagona dizayn", "Sahifa och-qizil Qozon uslubida ishlayapti.", "OK");
        });
    });


    // ══════════════════════════════════════════════════
    // 14. MOBILE MENU TOGGLE
    // ══════════════════════════════════════════════════
    // Mobil menyu tugmasini yaratish
    const mobileBtn = document.createElement("button");
    mobileBtn.classList.add("mobile-menu-btn");
    mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    mobileBtn.setAttribute("aria-label", "Menyu");
    document.body.appendChild(mobileBtn);

    const sidebar = document.querySelector(".sidebar");

    mobileBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
        const isOpen = sidebar.classList.contains("mobile-open");
        mobileBtn.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    // Tashqi qismga bosilganda yopish
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768
            && sidebar.classList.contains("mobile-open")
            && !sidebar.contains(e.target)
            && !mobileBtn.contains(e.target)) {
            sidebar.classList.remove("mobile-open");
            mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });


    // ══════════════════════════════════════════════════
    // 11. INITIAL WELCOME TOAST
    // ══════════════════════════════════════════════════
    setTimeout(() => {
        showToast(
            "Profil sozlamalari",
            "Shaxsiy ma'lumotlar va xavfsizlik sozlamalarini boshqaring.",
            "⚙️"
        );
    }, 1200);

});
