document.addEventListener("DOMContentLoaded", () => {
    // Supabase credentials
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co'; 
    const SUPABASE_ANON_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Elements
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const tabBoxes = document.querySelectorAll(".reg-tab-box");
    const emailInput = document.getElementById("regEmail");
    const passwordInput = document.getElementById("regPassword");
    const toggleEye = document.getElementById("regToggleEye");
    const registerForm = document.getElementById('mainRegisterForm');
    const googleBtn = document.getElementById('regGoogleBtn');

    // Tizimga kirgan foydalanuvchini avtomatik yo'naltirish
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            window.location.href = 'promoChegirma.html';
        }
    });

    // 1. Dark Mode Toggle
    if (themeToggle && themeIcon) {
        // Load initial state
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
            themeIcon.className = "fa-solid fa-sun";
        } else {
            document.body.classList.remove("dark-mode");
            themeIcon.className = "fa-solid fa-moon";
        }

        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        });
    }

    // 2. Tab switching (Xaridor / Oshpaz)
    tabBoxes.forEach(tab => {
        tab.addEventListener("click", () => {
            tabBoxes.forEach(b => b.classList.remove("active"));
            tab.classList.add("active");
        });
    });

    // 3. Show/Hide Password
    if (toggleEye && passwordInput) {
        toggleEye.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            toggleEye.classList.toggle("fa-eye-slash", isPassword);
            toggleEye.classList.toggle("fa-eye", !isPassword);
        });
    }

    // 4. Signup Form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('regFullName').value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const activeTab = document.querySelector('.reg-tab-box.active');
            const role = activeTab ? activeTab.dataset.role : 'user';

            if (!fullName || !email || !password) {
                alert("Iltimos, barcha maydonlarni to'ldiring.");
                return;
            }

            try {
                // Supabase email and password sign up
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role
                        }
                    }
                });

                if (error) throw error;

                alert("Muvaffaqiyatli ro'yxatdan o'tdingiz! Agar Supabase loyihangizda email tasdiqlash yoqilgan bo'lsa, pochtangizga kelgan xatni tasdiqlang. So'ngra tizimga kirishingiz mumkin.");
                window.location.href = 'kirish.html';
            } catch (err) {
                console.error("Ro'yxatdan o'tishda xatolik:", err.message);
                alert("Ro'yxatdan o'tishda xatolik: " + err.message);
            }
        });
    }

    // 5. Google OAuth Login
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/promoChegirma.html'
                    }
                });
                if (error) throw error;
            } catch (error) {
                console.error('Google xatolik:', error.message);
                alert('Google orqali kirishda xatolik yuz berdi: ' + error.message);
            }
        });
    }
});
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "custom-toast";
  toast.innerText = message;
  
  container.appendChild(toast);
  
  // 3 soniyadan keyin o'chirish
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Til o'zgartirishni soddalashtirish
function changeLanguage(lang) {
  // Bu yerda matnlarni almashtirish logikasi bo'ladi
  console.log("Tanlangan til:", lang);
}