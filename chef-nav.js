(function () {
    const pageMap = {
        "xurmoopa 2.html": "bosh-sahifa",
        "xurmoopa2.html": "bosh-sahifa",
        "chefdashboard.html": "buyurtmalar",
        "daromad.html": "daromad",
        "profil.html": "profil",
        "menu.html": "taom-qoshish",
        "chat.html": "chat",
        "bildirishnoma.html": "bildirishnoma"
    };

    function normalizePath(pathname) {
        return decodeURIComponent(pathname.split("/").pop() || "xurmoOpa 2.html").toLowerCase();
    }

    function currentPageKey() {
        if (window.location.hash === "#today-menu-section") return "bugungi-menyu";
        return pageMap[normalizePath(window.location.pathname)] || "";
    }

    function setActiveNav() {
        const activeKey = currentPageKey();
        document.querySelectorAll(".sidebar-menu .menu-item, .chef-sidebar .menu-item").forEach((item) => {
            const isActive = item.dataset.page === activeKey;
            item.classList.toggle("active", isActive);
            item.classList.toggle("is-active", isActive);
            if (isActive) item.setAttribute("aria-current", "page");
            else item.removeAttribute("aria-current");
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setActiveNav();

        document.querySelectorAll('[data-page="bugungi-menyu"]').forEach((item) => {
            item.addEventListener("click", (event) => {
                const target = document.getElementById("today-menu-section");
                if (!target && !item.getAttribute("href").includes("#today-menu-section")) return;
                if (target) {
                    event.preventDefault();
                    history.replaceState(null, "", "#today-menu-section");
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveNav();
                    document.querySelector(".sidebar, .chef-sidebar")?.classList.remove("mobile-open");
                }
            });
        });

        const sidebar = document.querySelector(".sidebar, .chef-sidebar");
        const mobileBtn = document.querySelector("[data-chef-sidebar-toggle]");
        if (sidebar && mobileBtn) {
            mobileBtn.addEventListener("click", () => {
                sidebar.classList.toggle("mobile-open");
                mobileBtn.innerHTML = sidebar.classList.contains("mobile-open")
                    ? '<i class="fa-solid fa-xmark"></i>'
                    : '<i class="fa-solid fa-bars"></i>';
            });
        }
    });

    window.addEventListener("hashchange", setActiveNav);
})();
