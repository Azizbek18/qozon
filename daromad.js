document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================================
    // 1. DAROMAD KALKULYATORI
    // ==========================================================
    const slider = document.getElementById("order-slider");
    const orderCountVal = document.getElementById("order-count-val");
    const estimatedIncome = document.getElementById("estimated-income");

    // Oshpaz topadigan o'rtacha sof foyda va oydagi kunlar
    const PROFIT_PER_ORDER = 10000; 
    const DAYS_IN_MONTH = 30;

    if (slider && orderCountVal && estimatedIncome) {
        slider.addEventListener("input", function () {
            const val = slider.value;
            orderCountVal.textContent = val;
            
            // Formula: kunlik buyurtma * foyda * 30 kun
            let calculated = val * PROFIT_PER_ORDER * DAYS_IN_MONTH;
            
            // Pullarni chiroyli formatda chiqarish (masalan: 4 500 000 so'm)
            estimatedIncome.textContent = calculated.toLocaleString('uz-UZ') + " so'm";
        });
    }

    // ==========================================================
    // 2. REFERAL KODINI NUSXALASH
    // ==========================================================
    const btnCopy = document.getElementById("btn-copy");
    const refCodeElement = document.getElementById("ref-code");

    if (btnCopy && refCodeElement) {
        btnCopy.addEventListener("click", function () {
            const refCode = refCodeElement.textContent.trim();
            navigator.clipboard.writeText(refCode).then(() => {
                // Ikonkani vaqtincha "check" belgisiga o'zgartirish
                btnCopy.innerHTML = '<i class="fa-solid fa-check" style="color: #27a376;"></i>';
                setTimeout(() => {
                    btnCopy.innerHTML = '<i class="fa-regular fa-copy"></i>';
                }, 2000);
            }).catch(err => {
                console.error('Nusxalashda xatolik yuz berdi: ', err);
            });
        });
    }

    // ==========================================================
    // 3. HAFTALIK / OYLIK STATISTIKA DIAGRAMMASI
    // ==========================================================
    const barsWrapper = document.getElementById("chart-bars-wrapper");
    const toggleButtons = document.querySelectorAll(".btn-toggle");
    const statsTitle = document.getElementById("stats-title");

    // Diagramma ma'lumotlar ombori
    const chartData = {
        hafta: [
            { label: "Du", height: "40%", active: false },
            { label: "Se", height: "60%", active: false },
            { label: "Ch", height: "50%", active: false },
            { label: "Pa", height: "85%", active: true }, 
            { label: "Ju", height: "65%", active: false },
            { label: "Sho", height: "45%", active: false },
            { label: "Yak", height: "30%", active: false }
        ],
        oy: [
            { label: "01", height: "30%", active: false },
            { label: "05", height: "55%", active: false },
            { label: "10", height: "45%", active: false },
            { label: "15", height: "75%", active: false },
            { label: "20", height: "90%", active: true },  
            { label: "25", height: "60%", active: false },
            { label: "30", height: "40%", active: false }
        ]
    };

    // Diagrammani chizish funksiyasi
    function renderChart(type) {
        if (!barsWrapper) return;
        
        barsWrapper.innerHTML = ""; // Dinamik tozalash

        // Sarlavhani yangilash
        if (statsTitle) {
            statsTitle.textContent = type === "hafta" ? "Haftalik statistika" : "Oylik statistika";
        }

        const currentData = chartData[type];

        currentData.forEach(item => {
            const barDiv = document.createElement("div");
            barDiv.className = `bar ${item.active ? 'active' : ''}`;
            barDiv.style.height = item.height; 
            barDiv.style.setProperty("--height", item.height);

            const spanLabel = document.createElement("span");
            spanLabel.textContent = item.label;

            barDiv.appendChild(spanLabel);
            barsWrapper.appendChild(barDiv);

            // Ustun bosilganda aktivlikni boshqarish
            barDiv.addEventListener("click", function () {
                document.querySelectorAll(".bar").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
            });
        });
    }

    // Rejim o'zgartirish tugmalari hodisasi
    toggleButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            toggleButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            // Matnga qarab rejimni aniqlash (Hafta / Oy)
            const mode = this.textContent.trim().toLowerCase();
            if (mode === "hafta" || mode === "oy") {
                renderChart(mode);
            }
        });
    });

    // Dastlabki yuklanishda haftalik diagrammani chiqarish
    if (barsWrapper) {
        renderChart("hafta");
    }

    // ==========================================================
    // 4. BURGER MENYU LOGIKASI
    // ==========================================================
    const burgerToggle = document.getElementById("burger-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (burgerToggle && mobileMenu) {
        const icon = burgerToggle.querySelector("i");

        burgerToggle.addEventListener("click", function () {
            // Menyuni ochish/yopish klassini almashtirish
            mobileMenu.classList.toggle("open");
            
            // Ikonkani o'zgartirish (bars <-> xmark)
            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-xmark");
            }
        });

        // Menyu ichidagi linklar bosilganda menyuni yopish
        const menuLinks = mobileMenu.querySelectorAll(".nav-links a, .btn-order");
        menuLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            });
        });
    }
});