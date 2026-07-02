document.addEventListener("DOMContentLoaded", () => {
    // Supabase credentials
    const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co'; 
    const SUPABASE_ANON_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Elements
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const loginForm = document.getElementById('loginForm');
    const googleBtn = document.getElementById('googleBtn');
    const smsBtn = document.querySelector('.social-login .social-btn:first-child'); // SMS kod bilan kirish

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

    // 2. Show/Hide Password
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.classList.remove("fa-eye");
                togglePassword.classList.add("fa-eye-slash");
            } else {
                passwordInput.type = "password";
                togglePassword.classList.remove("fa-eye-slash");
                togglePassword.classList.add("fa-eye");
            }
        });
    }

    // Phone number normalization helper
    function normalizePhone(phone) {
        let clean = phone.replace(/[^\d]/g, ''); // keep only digits
        if (clean.startsWith('998') && clean.length === 12) {
            return '+' + clean;
        } else if (clean.length === 9) {
            return '+998' + clean;
        }
        return phone; // fallback
    }

    // 3. Email & Password or Phone & Password Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.querySelector('#username').value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                alert("Iltimos, barcha maydonlarni to'ldiring.");
                return;
            }

            let credentials = {};
            if (username.includes('@')) {
                credentials = { email: username, password: password };
            } else {
                const normalized = normalizePhone(username);
                credentials = { phone: normalized, password: password };
            }

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword(credentials);
                if (error) throw error;

                alert("Tizimga muvaffaqiyatli kirdingiz!");
                window.location.href = 'promoChegirma.html';
            } catch (error) {
                console.error('Kirishda xatolik:', error.message);
                alert('Kirishda xatolik yuz berdi: ' + error.message);
            }
        });
    }

    // 4. Google OAuth Login
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

    // 5. SMS OTP Login
    if (smsBtn) {
        smsBtn.addEventListener('click', async () => {
            const rawPhone = prompt("Telefon raqamingizni kiriting (Masalan: 90 123 45 67):");
            if (!rawPhone) return;
            const phone = normalizePhone(rawPhone);

            try {
                const { error } = await supabaseClient.auth.signInWithOtp({
                    phone: phone,
                });
                if (error) throw error;

                const otpCode = prompt("Telefoningizga yuborilgan 6 xonali SMS kodni kiriting:");
                if (!otpCode) return;

                const { error: verifyError } = await supabaseClient.auth.verifyOtp({
                    phone: phone,
                    token: otpCode,
                    type: 'sms'
                });
                if (verifyError) throw verifyError;

                alert("Tizimga muvaffaqiyatli kirdingiz!");
                window.location.href = 'promoChegirma.html';
            } catch (error) {
                console.error('SMS xatolik:', error.message);
                alert('Xatolik yuz berdi: ' + error.message);
            }
        });
    }
});

// Loader control
document.body.classList.add("loader-active");
window.addEventListener("load", () => {
    const loader = document.getElementById("site-loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            document.body.classList.remove("loader-active");
        }, 400); 
    }
});
