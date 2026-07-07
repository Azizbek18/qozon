/**
 * Qozon — Mijoz profili
 */

document.addEventListener("DOMContentLoaded", () => {

    // ══════════════════════════════════════════════════
    // TOAST NOTIFICATION
    // ══════════════════════════════════════════════════
    function showToast(title, message, icon = "📋") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.classList.add("qz-toast");
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div>
                <h5>${title}</h5>
                <p>${message}</p>
            </div>
        `;
        container.appendChild(toast);

        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));

        setTimeout(() => {
            toast.classList.remove("show");
            toast.addEventListener("transitionend", () => toast.remove());
        }, 3500);
    }

    // ══════════════════════════════════════════════════
    // SUPABASE INIT & USER DATA
    // ══════════════════════════════════════════════════
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let authUser = null;
    let userProfile = null;

    const avatarImg = document.getElementById("avatarImg");
    const avatarFallbackIcon = document.getElementById("avatarFallbackIcon");

    // Eski hisoblarga tasodifan yozib qo'yilgan umumiy placeholder rasm —
    // haqiqiy profil surati emas, shu sabab icon fallback ko'rsatiladi.
    function isRealAvatar(url) {
        return !!url && !url.includes('user-male-circle');
    }

    function setAvatar(url) {
        if (isRealAvatar(url)) {
            avatarImg.src = url;
            avatarImg.style.display = "block";
            avatarFallbackIcon.style.display = "none";
        } else {
            avatarImg.style.display = "none";
            avatarImg.removeAttribute("src");
            avatarFallbackIcon.style.display = "block";
        }
    }

    // Agar rasm manzili buzilgan/yuklanmasa ham fallback ikonkaga qaytish
    avatarImg.addEventListener("error", () => setAvatar(null));

    async function loadUserData() {
        try {
            const { data: { session } } = await client.auth.getSession();
            if (!session) return;
            authUser = session.user;

            const { data: profile } = await client
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profile) userProfile = profile;

            populateUI();
            loadStats();
        } catch (err) {
            console.error("Failed to load user profile:", err);
            showToast("Xatolik", "Profil ma'lumotlarini yuklashda xatolik yuz berdi.", "❌");
        }
    }

    function populateUI() {
        if (!authUser) return;

        const fullName = userProfile?.full_name || authUser.user_metadata?.full_name || "Foydalanuvchi";
        const phone = userProfile?.phone || authUser.user_metadata?.phone || "";
        const email = authUser.email || "";
        const avatarUrl = userProfile?.avatar_url || authUser.user_metadata?.avatar_url || "";
        const joinedDate = new Date(userProfile?.created_at || authUser.created_at);

        document.getElementById("displayName").textContent = fullName;
        document.getElementById("displayEmail").textContent = email;
        document.getElementById("displayJoined").innerHTML =
            `<i class="fa-solid fa-calendar-days"></i> A'zo bo'lgan sana: ${joinedDate.toLocaleDateString("uz-UZ")}`;

        setAvatar(avatarUrl);

        document.getElementById("inputFullName").value = fullName;
        document.getElementById("inputPhone").value = phone;
        document.getElementById("inputEmail").value = email;
        document.getElementById("inputAddress").value = localStorage.getItem("qz_customer_address") || "";
    }

    async function loadStats() {
        if (!authUser) return;
        try {
            const { count } = await client
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('customer_id', authUser.id);

            document.getElementById("statOrders").textContent = count || 0;
        } catch (err) {
            console.error("Failed to load order count:", err);
        }

        try {
            const favFoods = JSON.parse(localStorage.getItem("qz_favorites") || "[]");
            const favChefs = JSON.parse(localStorage.getItem("qz_fav_chefs") || "[]");
            document.getElementById("statFavorites").textContent = favFoods.length + favChefs.length;
        } catch (err) {
            document.getElementById("statFavorites").textContent = "0";
        }
    }

    loadUserData();


    // ══════════════════════════════════════════════════
    // PERSONAL INFORMATION FORM EDIT/SAVE
    // ══════════════════════════════════════════════════
    const btnEditPersonal = document.getElementById("btnEditPersonal");
    const btnCancelPersonal = document.getElementById("btnCancelPersonal");
    const btnSavePersonal = document.getElementById("btnSavePersonal");
    const personalActions = document.getElementById("personalActions");
    const personalInputs = [
        document.getElementById("inputFullName"),
        document.getElementById("inputPhone"),
        document.getElementById("inputAddress")
    ];

    btnEditPersonal.addEventListener("click", () => {
        personalInputs.forEach(input => input.disabled = false);
        personalActions.classList.remove("hidden");
        btnEditPersonal.style.display = "none";
    });

    btnCancelPersonal.addEventListener("click", () => {
        populateUI();
        personalInputs.forEach(input => input.disabled = true);
        personalActions.classList.add("hidden");
        btnEditPersonal.style.display = "flex";
    });

    btnSavePersonal.addEventListener("click", async () => {
        const fullNameVal = document.getElementById("inputFullName").value.trim();
        const phoneVal = document.getElementById("inputPhone").value.trim();
        const addressVal = document.getElementById("inputAddress").value.trim();

        if (!fullNameVal) {
            showToast("Xatolik", "Ism va Familiya kiritilishi shart!", "❌");
            return;
        }

        btnSavePersonal.disabled = true;
        btnSavePersonal.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';

        try {
            const { error } = await client
                .from('profiles')
                .update({ full_name: fullNameVal, phone: phoneVal })
                .eq('id', authUser.id);

            if (error) throw error;

            localStorage.setItem("qz_customer_address", addressVal);

            await client.auth.updateUser({ data: { full_name: fullNameVal, phone: phoneVal } });

            showToast("Profil saqlandi", "Ma'lumotlar muvaffaqiyatli saqlandi!", "✅");

            personalInputs.forEach(input => input.disabled = true);
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


    // ══════════════════════════════════════════════════
    // AVATAR UPLOAD (base64 → Supabase)
    // ══════════════════════════════════════════════════
    const avatarInput = document.getElementById("avatarInput");
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

                setAvatar(base64Data);
                showToast("Muvaffaqiyat", "Profil rasmi yangilandi!", "✅");
            } catch (err) {
                console.error("Upload avatar failed:", err);
                showToast("Xatolik", "Rasmni yuklab bo'lmadi.", "❌");
            }
        };
        reader.readAsDataURL(file);
    });


    // ══════════════════════════════════════════════════
    // SECURITY: PASSWORD UPDATE
    // ══════════════════════════════════════════════════
    const btnEditSecurity = document.getElementById("btnEditSecurity");
    const btnCancelSecurity = document.getElementById("btnCancelSecurity");
    const btnSaveSecurity = document.getElementById("btnSaveSecurity");
    const securityActions = document.getElementById("securityActions");
    const securityInputs = [
        document.getElementById("inputNewPass"),
        document.getElementById("inputConfirmPass")
    ];

    btnEditSecurity.addEventListener("click", () => {
        securityInputs.forEach(input => { input.disabled = false; input.value = ""; });
        securityActions.classList.remove("hidden");
        btnEditSecurity.style.display = "none";
    });

    btnCancelSecurity.addEventListener("click", () => {
        securityInputs.forEach(input => { input.disabled = true; input.value = ""; });
        securityActions.classList.add("hidden");
        btnEditSecurity.style.display = "flex";
    });

    document.querySelectorAll(".toggle-pass").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const targetInput = document.getElementById(btn.dataset.target);
            if (targetInput) {
                const isPass = targetInput.type === "password";
                targetInput.type = isPass ? "text" : "password";
                btn.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            }
        });
    });

    btnSaveSecurity.addEventListener("click", async () => {
        const newPass = document.getElementById("inputNewPass").value;
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

            securityInputs.forEach(input => { input.disabled = true; input.value = ""; });
            securityActions.classList.add("hidden");
            btnEditSecurity.style.display = "flex";
        } catch (err) {
            console.error("Save password failed:", err);
            showToast("Xatolik", err.message || "Parolni yangilashda xatolik.", "❌");
        } finally {
            btnSaveSecurity.disabled = false;
            btnSaveSecurity.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Parolni yangilash';
        }
    });


    // ══════════════════════════════════════════════════
    // PREFERENCES
    // ══════════════════════════════════════════════════
    document.querySelectorAll(".toggle-switch input").forEach(pref => {
        const key = `qz_mijoz_pref_${pref.dataset.pref}`;
        const savedVal = localStorage.getItem(key);
        if (savedVal !== null) pref.checked = savedVal === "true";

        pref.addEventListener("change", (e) => {
            localStorage.setItem(key, e.target.checked);
            const label = e.target.closest(".pref-item")?.querySelector("h4").textContent || "Sozlama";
            showToast("Sozlama saqlandi", `${label} holati o'zgartirildi.`, "⚙️");
        });
    });


    // ══════════════════════════════════════════════════
    // LOGOUT
    // ══════════════════════════════════════════════════
    async function doLogout() {
        showToast("Chiqish", "Sessiya yakunlanmoqda...", "⏳");
        await client.auth.signOut();
        window.location.href = "kirish.html";
    }

    document.getElementById("btnHeaderLogout").addEventListener("click", doLogout);
    document.getElementById("btnQuickLogout").addEventListener("click", doLogout);


    // ══════════════════════════════════════════════════
    // DANGER ZONE: DELETE ACCOUNT
    // ══════════════════════════════════════════════════
    const btnDeleteAccount = document.getElementById("btnDeleteAccount");
    const deleteModal = document.getElementById("deleteModal");
    const btnModalCancel = document.getElementById("btnModalCancel");
    const btnModalConfirm = document.getElementById("btnModalConfirm");

    btnDeleteAccount.addEventListener("click", () => deleteModal.classList.remove("hidden"));
    btnModalCancel.addEventListener("click", () => deleteModal.classList.add("hidden"));

    btnModalConfirm.addEventListener("click", async () => {
        showToast("O'chirilmoqda", "Hisobingiz o'chirilmoqda...", "⏳");
        try {
            await client.from('profiles').delete().eq('id', authUser.id);
        } catch (err) {
            console.error("Delete profile failed:", err);
        } finally {
            await client.auth.signOut();
            window.location.href = "kirish.html";
        }
    });

});
