/**
 * Xurmo opa — Glassmorphism 3D Pro Dashboard
 * Interaktiv JS: Supabase Realtime, Toast, Counter, Toggle, Theme, Mobile Menu
 */

document.addEventListener("DOMContentLoaded", async () => {
    // ══════════════════════════════════════════════════
    // 1. SUPABASE CLIENT & AUTH SEANS
    // ══════════════════════════════════════════════════
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
    
    let supabaseClient;
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase script is missing!");
    }

    let chefName = "Xurmo opa"; // Default fallback
    let loggedInUser = null;

    if (supabaseClient) {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                loggedInUser = session.user;
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('full_name, avatar_url, role')
                    .eq('id', loggedInUser.id)
                    .single();
                
                if (profile) {
                    if (profile.full_name) {
                        chefName = profile.full_name;
                        // Update UI name
                        document.querySelectorAll('.profile-name').forEach(el => el.textContent = chefName);
                    }
                    // Eski hisoblarga tasodifan yozib qo'yilgan umumiy placeholder
                    // rasm — haqiqiy profil surati emas, shu sabab e'tiborga olinmaydi.
                    if (profile.avatar_url && !profile.avatar_url.includes('user-male-circle')) {
                        document.querySelectorAll('.profile-img').forEach(el => el.src = profile.avatar_url);
                    }
                }
            }
        } catch (e) {
            console.error("Error getting session:", e);
        }
    }

    // ══════════════════════════════════════════════════
    // 2. 3D TOAST NOTIFICATION SYSTEM
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

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add("show");
            });
        });

        const duration = 3500;
        const timeLine = toast.querySelector(".toast-time-line");

        timeLine.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
            timeLine.style.width = "0%";
        });

        setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.add("hide");
            toast.addEventListener("transitionend", () => toast.remove());
        }, duration);
    }

    // ══════════════════════════════════════════════════
    // 3. COUNTER ANIMATION
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

    // ══════════════════════════════════════════════════
    // 4. REALTIME ORDERS & STATS LOADING
    // ══════════════════════════════════════════════════
    async function loadChefOrders() {
        if (!supabaseClient) return;

        try {
            const { data: orders, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('chef_name', chefName)
                .order('created_at', { ascending: false });

            if (error) throw error;

            renderOrders(orders || []);
            calculateStats(orders || []);
        } catch (err) {
            console.error("Error loading chef orders:", err);
        }
    }

    function renderOrders(orders) {
        const orderList = document.querySelector('.order-list');
        if (!orderList) return;

        const activeOrders = orders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status));

        if (activeOrders.length === 0) {
            orderList.innerHTML = `<div class="state-msg" style="text-align:center; padding:20px; color:var(--text-muted);">Hozircha faol buyurtmalar yo'q.</div>`;
            return;
        }

        orderList.innerHTML = '';

        activeOrders.forEach(order => {
            const timeStr = new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
            
            const card = document.createElement('div');
            card.className = 'order-item glass-card glass-order';

            let actionHtml = '';
            if (order.status === 'pending') {
                actionHtml = `
                    <div class="order-actions-row" style="display:flex; gap:8px;">
                        <button class="btn-order-accept" style="background:#10b981; border:none; padding:6px 12px; border-radius:8px; color:#fff; font-size:11px; font-weight:700; cursor:pointer;" onclick="updateOrderStatus('${order.id}', 'accepted')">Qabul qilish</button>
                        <button class="btn-order-cancel" style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; padding:6px 12px; border-radius:8px; color:#ef4444; font-size:11px; font-weight:700; cursor:pointer;" onclick="updateOrderStatus('${order.id}', 'cancelled')">Rad etish</button>
                    </div>
                `;
            } else {
                actionHtml = `
                    <div class="status-select-wrap">
                        <select class="status-select glass-select" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="accepted" ${order.status === 'accepted' ? 'selected' : ''}>Qabul qilindi</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Tayyorlanmoqda</option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Tayyor bo'ldi</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Yetkazildi</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Bekor qilish</option>
                        </select>
                    </div>
                `;
            }

            const phoneBtn = order.customer_phone ? `
                <a href="tel:${order.customer_phone}" class="btn-action glass-btn-icon" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-phone"></i>
                </a>
            ` : '';

            card.innerHTML = `
                <div class="order-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="order-details" style="flex:1;">
                    <h4>${order.customer_name || 'Mehmon'}</h4>
                    <p>${order.quantity}x ${order.food_name}</p>
                    <span class="order-time">${timeStr}</span>
                </div>
                ${actionHtml}
                ${phoneBtn}
            `;

            orderList.appendChild(card);
        });
    }

    window.updateOrderStatus = async function(orderId, newStatus) {
        if (!supabaseClient) return;

        try {
            const { error } = await supabaseClient
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;

            showToast("Holat yangilandi", `Buyurtma muvaffaqiyatli yangilandi!`, "⏳");
            loadChefOrders();
        } catch (err) {
            console.error("Error updating status:", err);
            showToast("Xatolik", "Statusni yangilab bo'lmadi.", "❌");
        }
    };

    function calculateStats(orders) {
        const totalEarnings = orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.total_price || 0), 0);

        const totalCount = orders.length;

        const uniqueCustomers = new Set(orders.map(o => o.customer_phone || o.customer_name)).size;

        const pendingCount = orders.filter(o => o.status === 'pending').length;

        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].dataset.target = totalEarnings;
            statValues[1].dataset.target = totalCount;
            statValues[2].dataset.target = uniqueCustomers;
            statValues[3].dataset.target = pendingCount;
            animateCounters();
        }
    }

    // ══════════════════════════════════════════════════
    // 5. DYNAMIC FOODS / MENU LOADING
    // ══════════════════════════════════════════════════
    async function loadChefMenu() {
        if (!supabaseClient) return;

        try {
            const { data: foods, error } = await supabaseClient
                .from('foods')
                .select('*')
                .eq('chef_name', chefName);

            if (error) throw error;

            renderMenu(foods || []);
        } catch (err) {
            console.error("Error loading menu:", err);
        }
    }

    function renderMenu(foods) {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        if (foods.length === 0) {
            menuList.innerHTML = `<div class="state-msg" style="text-align:center; padding:20px; color:var(--text-muted);">Menyuda taomlar mavjud emas.</div>`;
            return;
        }

        menuList.innerHTML = '';

        foods.forEach(food => {
            const isChecked = food.portions_left > 0;
            const imgUrl = food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&h=80';
            
            const row = document.createElement('div');
            row.className = 'menu-item-row glass-card glass-menu-row';
            if (!isChecked) {
                row.style.opacity = "0.4";
                row.style.filter = "grayscale(0.5)";
            }

            row.innerHTML = `
                <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                <img src="${imgUrl}" alt="${food.name}" class="menu-item-img" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&h=80';">
                <div class="menu-item-details">
                    <h4>${food.name}</h4>
                    <p>${food.price.toLocaleString()} so'm / porsiya</p>
                </div>
                <div class="counter-container glass-pill glass-counter">
                    <button class="counter-btn minus" onclick="updatePortions('${food.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="counter-val">${food.portions_left || 0}</span>
                    <button class="counter-btn plus" onclick="updatePortions('${food.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleFoodAvailability('${food.id}', this.checked)">
                    <span class="slider"></span>
                </label>
                <button class="btn-action glass-btn-icon" style="margin-left: 8px; color: var(--red-400);" onclick="deleteFoodItem('${food.id}', '${food.name.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            menuList.appendChild(row);
        });
    }

    window.updatePortions = async function(foodId, delta) {
        if (!supabaseClient) return;

        try {
            const { data: food } = await supabaseClient.from('foods').select('portions_left, name').eq('id', foodId).single();
            if (!food) return;

            let newPortions = (food.portions_left || 0) + delta;
            if (newPortions < 0) {
                showToast("Xatolik", `<b>${food.name}</b> zaxirada qolmagan!`, "❌");
                return;
            }

            const { error } = await supabaseClient
                .from('foods')
                .update({ portions_left: newPortions })
                .eq('id', foodId);

            if (error) throw error;

            showToast(delta > 0 ? "Zaxira ko'paydi" : "Zaxira kamaydi", `<b>${food.name}</b> — ${newPortions} porsiya qoldi.`, delta > 0 ? "✅" : "📦");
            loadChefMenu();
        } catch (err) {
            console.error("Error updating portions:", err);
        }
    };

    window.toggleFoodAvailability = async function(foodId, isAvailable) {
        if (!supabaseClient) return;

        try {
            const portions = isAvailable ? 10 : 0;
            const { error } = await supabaseClient
                .from('foods')
                .update({ portions_left: portions })
                .eq('id', foodId);

            if (error) throw error;

            showToast(isAvailable ? "Taom faol" : "Taom muzlatildi", `Mijozlar menyusida holat yangilandi.`, isAvailable ? "✅" : "❄️");
            loadChefMenu();
        } catch (err) {
            console.error("Error toggling availability:", err);
        }
    };

    window.deleteFoodItem = async function(foodId, name) {
        if (!supabaseClient) return;

        if (!confirm(`Haqiqatan ham "${name}" taomini o'chirmoqchisiz?`)) return;

        try {
            const { error } = await supabaseClient.from('foods').delete().eq('id', foodId);
            if (error) throw error;

            showToast("O'chirildi", `"${name}" menyudan muvaffaqiyatli o'chirildi.`, "🗑️");
            loadChefMenu();
        } catch (err) {
            console.error("Error deleting food:", err);
            showToast("Xatolik", "Taomni o'chirib bo'lmadi.", "❌");
        }
    };

    // ══════════════════════════════════════════════════
    // 6. REALTIME PUBSUB SETUP (Auto sync on changes)
    // ══════════════════════════════════════════════════
    function setupRealtimeSubscriptions() {
        if (!supabaseClient) return;

        supabaseClient
            .channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
                console.log("Realtime order change detected:", payload);
                loadChefOrders();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'foods' }, payload => {
                console.log("Realtime food change detected:", payload);
                loadChefMenu();
            })
            .subscribe();
    }

    // ══════════════════════════════════════════════════
    // 7. INITIAL WORKERS
    // ══════════════════════════════════════════════════
    await loadChefOrders();
    await loadChefMenu();
    setupRealtimeSubscriptions();

    // ══════════════════════════════════════════════════
    // 8. SIDEBAR MENU NAVIGATION
    // ══════════════════════════════════════════════════
    const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const page = item.getAttribute("data-page");
            if (page === "bugungi-menyu") {
                e.preventDefault();
                document.querySelector(".sidebar-menu .menu-item.active")?.classList.remove("active");
                item.classList.add("active");

                const el = document.getElementById("today-menu-section");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }

                if (window.innerWidth <= 768) {
                    document.querySelector(".sidebar")?.classList.remove("mobile-open");
                }
            }
        });
    });

    // ══════════════════════════════════════════════════
    // 9. NOTIFICATION BUTTON
    // ══════════════════════════════════════════════════
    const notifBtn = document.getElementById("btnNotification");
    if (notifBtn) {
        notifBtn.addEventListener("click", () => {
            showToast("Bildirishnomalar", "Yangi bildirishnomalar tekshirilmoqda...", "🔔");
        });
    }

    // ══════════════════════════════════════════════════
    // 10. ADD MENU BUTTON
    // ══════════════════════════════════════════════════
    const addMenuBtn = document.getElementById("btnAddMenu");
    if (addMenuBtn) {
        addMenuBtn.addEventListener("click", () => {
            window.location.href = "menu.html";
        });
    }

    // ══════════════════════════════════════════════════
    // 11. DETAILS BUTTON
    // ══════════════════════════════════════════════════
    const detailsBtn = document.getElementById("btnDetails");
    if (detailsBtn) {
        detailsBtn.addEventListener("click", () => {
            window.location.href = "daromad.html";
        });
    }

    // ══════════════════════════════════════════════════
    // 12. SEE ALL LINK
    // ══════════════════════════════════════════════════
    const seeAllLink = document.querySelector(".see-all");
    if (seeAllLink) {
        seeAllLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "menu.html";
        });
    }

    // ══════════════════════════════════════════════════
    // 13. THEME SWITCHER (Dark / Light)
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
    // 15. CHART BAR ANIMATION
    // ══════════════════════════════════════════════════
    const chartBars = document.querySelectorAll(".chart-bar-fill");
    chartBars.forEach(bar => {
        const h = bar.style.getPropertyValue("--bar-h");
        bar.style.height = "0%";
        setTimeout(() => {
            bar.style.height = h;
        }, 600);
    });

    // ══════════════════════════════════════════════════
    // 16. INITIAL WELCOME TOAST
    // ══════════════════════════════════════════════════
    setTimeout(() => {
        showToast(
            `${chefName} Boshqaruv Paneli`,
            "Dashboard muvaffaqiyatli yuklandi. Real-vaqt rejimi faol!",
            "👨‍🍳"
        );
    }, 1200);

    // ══════════════════════════════════════════════════
    // 17. PROFILE SECTION CLICK REDIRECT
    // ══════════════════════════════════════════════════
    const profileSection = document.querySelector(".profile-section");
    if (profileSection) {
        profileSection.style.cursor = "pointer";
        profileSection.addEventListener("click", () => {
            window.location.href = "profil.html";
        });
    }
});
