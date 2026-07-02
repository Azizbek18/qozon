document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. DINAMIK GRAFIK: HAFTA VA OY MA'LUMOTLARI
    // ==========================================
    const chartContainer = document.getElementById("bar-chart-container");
    const chartTitleText = document.getElementById("chart-title-text");
    const chartSubtitleText = document.getElementById("chart-subtitle-text");

    const graphData = {
        hafta: {
            title: "Haftalik Buyurtmalar Dinamikasi",
            subtitle: "Oxirgi 7 kunlik ko'rsatkichlar",
            labels: ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Yaō"],
            values: ["40%", "65%", "50%", "85%", "95%", "75%", "80%"]
        },
        oy: {
            title: "Oylik Buyurtmalar Dinamikasi",
            subtitle: "Oxirgi 30 kunlik umumiy ko'rsatkichlar",
            labels: ["1-hafta", "2-hafta", "3-hafta", "4-hafta"],
            values: ["85%", "45%", "95%", "60%"]
        }
    };

    function renderChart(mode) {
        chartContainer.innerHTML = "";
        const data = graphData[mode];
        chartTitleText.textContent = data.title;
        chartSubtitleText.textContent = data.subtitle;

        data.labels.forEach((label, i) => {
            const wrapper = document.createElement("div");
            wrapper.className = "bar-wrapper";
            
            const bar = document.createElement("div");
            bar.className = "bar";
            if (i === data.labels.length - 1) bar.classList.add("active"); // Oxirgisini aktiv qilish
            
            wrapper.appendChild(bar);
            
            const span = document.createElement("span");
            span.textContent = label;
            wrapper.appendChild(span);
            
            chartContainer.appendChild(wrapper);

            // Sekin ko'tarilish animatsiyasi
            setTimeout(() => {
                bar.style.height = data.values[i];
            }, 50);
        });
    }
    renderChart("hafta"); // Boshlang'ich holat

    // Hafta/Oy tugmalari klik hodisasi
    document.querySelectorAll(".btn-toggle").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".btn-toggle").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            renderChart(this.dataset.mode);
        });
    });

    // ==========================================
    // 2. YANGI OSHPAZ QO'SHISH TIZIMI
    // ==========================================
    const addChefModal = document.getElementById("add-chef-modal");
    const chefsTableBody = document.getElementById("chefs-table-body");

    document.getElementById("open-add-chef-modal").addEventListener("click", () => addChefModal.classList.remove("hidden"));
    document.getElementById("close-chef-modal").addEventListener("click", () => addChefModal.classList.add("hidden"));

    document.getElementById("add-chef-form").addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("new-chef-name").value;
        const type = document.getElementById("new-chef-type").value;
        const city = document.getElementById("new-chef-city").value;

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><div class="chef-info"><div class="avatar-img">👨‍🍳</div><div><strong>${name}</strong><p>${type}</p></div></div></td>
            <td>${city}</td><td><strong>0</strong></td>
            <td><span class="status-badge active">Faol</span></td>
        `;
        chefsTableBody.appendChild(newRow);
        
        this.reset();
        addChefModal.classList.add("hidden");
        alert("Yangi oshpaz muvaffaqiyatli ro'yxatga qo'shildi!");
    });

    // ==========================================
    // 3. MODERATSIYA: TASDIQLASH VA HUJJATLAR
    // ==========================================
    const viewDocModal = document.getElementById("view-doc-modal");
    const docContentText = document.getElementById("doc-content-text");
    const moderationBadge = document.querySelector(".badge");

    // Hujjatni ko'rish funksiyasi (Dinamik delegatsiya)
    document.getElementById("moderation-container").addEventListener("click", function(e) {
        const viewBtn = e.target.closest(".view-doc-btn");
        const approveBtn = e.target.closest(".approve-btn");

        if (viewBtn) {
            docContentText.textContent = viewBtn.dataset.doc;
            viewDocModal.classList.remove("hidden");
        }

        if (approveBtn) {
            const card = approveBtn.closest(".mod-card");
            const chefName = card.querySelector("strong").textContent;
            
            alert(`${chefName} arizasi qabul qilindi. Oshpazlar bo'limiga o'tkazildi!`);
            
            // Oshpazlar ro'yxatiga avtomatik qo'shish
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><div class="chef-info"><div class="avatar-img">🧑‍🍳</div><div><strong>${chefName}</strong><p>Yangi oshpaz</p></div></div></td>
                <td>Toshkent</td><td><strong>0</strong></td>
                <td><span class="status-badge active">Faol</span></td>
            `;
            chefsTableBody.appendChild(newRow);

            card.remove();
            moderationBadge.textContent = Math.max(0, parseInt(moderationBadge.textContent) - 1);
        }
    });

    document.getElementById("close-doc-modal").addEventListener("click", () => viewDocModal.classList.add("hidden"));

    // ==========================================
    // 4. GLOBAL QIDIRUV (SEKSIYALARGA O'TISH)
    // ==========================================
    const searchInput = document.getElementById("global-search");
    const searchResults = document.getElementById("search-results");

    const sections = [
        { name: "Overview (Grafik va Statistika)", id: "overview-section", title: "Dashboard Overview" },
        { name: "Oshpazlar Ro'yxati", id: "chefs-section", title: "Oshpazlar Boshqaruvi" },
        { name: "Moderatsiya Navbati (Arizalar)", id: "moderation-section", title: "Moderatsiya Tizimi" }
    ];

    searchInput.addEventListener("input", function() {
        const value = this.value.toLowerCase().trim();
        searchResults.innerHTML = "";

        if (!value) {
            searchResults.classList.add("hidden");
            return;
        }

        const filtered = sections.filter(s => s.name.toLowerCase().includes(value));

        if (filtered.length > 0) {
            searchResults.classList.remove("hidden");
            filtered.forEach(s => {
                const div = document.createElement("div");
                div.className = "search-item";
                div.textContent = s.name;
                div.addEventListener("click", () => {
                    // Sahifani almashtirish
                    document.querySelectorAll(".page-content").forEach(p => p.classList.add("hidden"));
                    document.getElementById(s.id).classList.remove("hidden");
                    
                    // Menyu aktivligini to'g'rilash
                    document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
                    const activeMenu = document.querySelector(`[data-target="${s.id}"]`);
                    if (activeMenu) activeMenu.classList.add("active");

                    document.getElementById("dynamic-title").textContent = s.title;
                    searchInput.value = "";
                    searchResults.classList.add("hidden");
                });
                searchResults.appendChild(div);
            });
        } else {
            searchResults.classList.add("hidden");
        }
    });

    // Sidebar menyu navigatsiyasi
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
            this.classList.add("active");

            const target = this.dataset.target;
            document.querySelectorAll(".page-content").forEach(p => p.classList.add("hidden"));
            document.getElementById(target).classList.remove("hidden");
            
            const currentSec = sections.find(s => s.id === target);
            if (currentSec) document.getElementById("dynamic-title").textContent = currentSec.title;
        });
    });

    // ==========================================
    // 5. TEPA HEADER: HABARLAR, SOZLAMALAR VA EXCEL YUKLASH
    // ==========================================
    const notifBtn = document.getElementById("notif-btn");
    const notifDropdown = document.getElementById("notif-dropdown");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsDropdown = document.getElementById("settings-dropdown");

    notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle("hidden");
        settingsDropdown.classList.add("hidden");
    });

    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsDropdown.classList.toggle("hidden");
        notifDropdown.classList.add("hidden");
    });

    // Tashqariga klik bo'lganda dropdownlarni yopish
    document.addEventListener("click", () => {
        notifDropdown.classList.add("hidden");
        settingsDropdown.classList.add("hidden");
        searchResults.classList.add("hidden");
    });

    // Tungi rejimni yoqish
    document.getElementById("dark-mode-toggle").addEventListener("change", function() {
        document.body.classList.toggle("dark-theme", this.checked);
    });

    document.getElementById("clear-cache").addEventListener("click", () => alert("Tizim keshi muvaffaqiyatli tozalandi!"));

    // Excel/PDF yuklash (Tepada chetdagi tugma)
    document.getElementById("export-btn").addEventListener("click", () => {
        alert("Dashboard hisobotlari Excel/PDF formatida yuklab olinmoqda...");
    });
});