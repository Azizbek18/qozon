const MENU_SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const MENU_SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
const menuSupabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(MENU_SUPABASE_URL, MENU_SUPABASE_KEY) : null;

// Kod brauzerda HTML to'liq yuklangandan keyin ishga tushadi
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. RASM YUKLASH (KAMERA ZONASI)
    // ==========================================
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadTitle = document.getElementById('uploadTitle');

    // Kamera maydoni bosilganda yashirin inputni ishga tushiradi
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Rasm tanlanganda uning nomini ekranga chiqaradi
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            uploadTitle.textContent = fileInput.files[0].name;
        }
    });

    // ==========================================
    // 2. COUNTER (SONI +/- TUGMALARI)
    // ==========================================
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const counterValue = document.getElementById('counterValue');

    // Soni oshirish
    plusBtn.addEventListener('click', () => {
        let current = parseInt(counterValue.textContent);
        counterValue.textContent = current + 1;
    });

    // Soni kamaytirish (1 tadan kamayib ketmaydi)
    minusBtn.addEventListener('click', () => {
        let current = parseInt(counterValue.textContent);
        if (current > 1) {
            counterValue.textContent = current - 1;
        }
    });

    // ==========================================
    // 3. MASALLIQLAR (TAGS TIZIMI)
    // ==========================================
    const tagsContainer = document.getElementById('tagsContainer');
    const tagInput = document.getElementById('tagInput');

    // Yangi masalliq yaratish funksiyasi
    function createNewTag(text) {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerHTML = `${text} <button type="button">×</button>`;
        
        // Yangi yaratilgan tagning "x" tugmasiga o'chirish hodisasi
        span.querySelector('button').addEventListener('click', () => {
            span.remove();
        });
        return span;
    }

    // HTML ichida tayyor turgan dastlabki taglarni o'chirishni yoqish
    const existingTags = tagsContainer.querySelectorAll('.tag');
    existingTags.forEach(tag => {
        tag.querySelector('button').addEventListener('click', () => {
            tag.remove();
        });
    });

    // Input ichida "Enter" bosilganda yangi tag qo'shish
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Form yuborilib, sahifa yangilanishini to'xtatadi
            const value = tagInput.value.trim();
            
            if (value !== '') {
                const newTag = createNewTag(value);
                tagsContainer.insertBefore(newTag, tagInput); // Inputdan oldinga qo'shadi
                tagInput.value = ''; // Inputni tozalaydi
            }
        }
    });

    // ==========================================
    // 4. OYNA YOPISH VA BEKOR QILISH
    // ==========================================
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');

    [closeBtn, cancelBtn].forEach(button => {
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'xurmoOpa 2.html';
            });
        }
    });

    // ==========================================
    // 5. MENYUGA QO'SHISH (FORM SUBMIT)
    // ==========================================
    const form = document.querySelector('.modal-form');
    const submitBtn = form.querySelector('button[type="submit"], .save-btn, .submit-btn');

    function readImageAsDataUrl(file) {
        return new Promise((resolve) => {
            if (!file) { resolve(null); return; }
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Sahifa yangilanib ketishini oldini oladi

        const name = document.querySelector('input[placeholder="M: Milliy palov"]').value.trim();
        const category = document.querySelector('.form-select').value;
        const price = parseInt(document.querySelector('.grid-4 div:nth-child(1) input').value, 10) || 0;
        const portionsLeft = parseInt(counterValue.textContent, 10) || 0;

        if (!name) {
            alert("Taom nomini kiriting.");
            return;
        }
        if (!menuSupabaseClient) {
            alert("Xatolik: Supabase ulanmagan.");
            return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saqlanmoqda...'; }

        try {
            const { data: { user } } = await menuSupabaseClient.auth.getUser();
            if (!user) {
                alert("Taom qo'shish uchun tizimga kiring.");
                return;
            }
            const { data: chefRow, error: chefError } = await menuSupabaseClient
                .from('chefs').select('id, full_name').eq('user_id', user.id).single();
            if (chefError || !chefRow) {
                alert("Oshpaz profili topilmadi.");
                return;
            }

            const imageUrl = await readImageAsDataUrl(fileInput.files[0]);

            const foodPayload = {
                chef_id: chefRow.id,
                chef_name: chefRow.full_name || 'Oshpaz',
                name: name,
                category: category || null,
                price: price,
                portions_left: portionsLeft,
                is_available: portionsLeft > 0,
                image_url: imageUrl || undefined
            };

            const { error } = await menuSupabaseClient.from('foods').insert(foodPayload);
            if (error) {
                console.error('Taom qo\'shishda xatolik:', error);
                alert("Taomni saqlab bo'lmadi: " + error.message);
                return;
            }

            alert("Taom muvaffaqiyatli qo'shildi!");
            window.location.href = 'xurmoOpa 2.html';
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Saqlash'; }
        }
    });

    // ==========================================
    // 6. THEME TOGGLER (Dark / Light)
    // ==========================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem("xurmo-glass-theme") || "dark";
        
        // Dastlabki temani yuklash
        if (savedTheme === "light") {
            document.body.classList.remove("theme-dark");
            document.body.classList.add("theme-light");
        } else {
            document.body.classList.remove("theme-light");
            document.body.classList.add("theme-dark");
        }

        themeToggleBtn.addEventListener('click', () => {
            if (document.body.classList.contains("theme-dark")) {
                document.body.classList.remove("theme-dark");
                document.body.classList.add("theme-light");
                localStorage.setItem("xurmo-glass-theme", "light");
            } else {
                document.body.classList.remove("theme-light");
                document.body.classList.add("theme-dark");
                localStorage.setItem("xurmo-glass-theme", "dark");
            }
        });
    }
});