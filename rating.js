const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
const supabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {

    let foodRatingValue = 0;
    let chefRatingValue = 0;
    let currentOrder = null;

    // 1. Yulduzchalarni baholash tizimi (Ikkala blok uchun alohida)
    setupRating('food-rating', (v) => { foodRatingValue = v; });
    setupRating('chef-rating', (v) => { chefRatingValue = v; });

    function setupRating(containerId, onSelect) {
        const container = document.getElementById(containerId);
        const stars = container.querySelectorAll('i');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                onSelect(value);

                stars.forEach((s, index) => {
                    if (index < value) {
                        s.classList.remove('fa-regular');
                        s.classList.add('fa-solid');
                    } else {
                        s.classList.remove('fa-solid');
                        s.classList.add('fa-regular');
                    }
                });
            });
        });
    }

    // 2. Teglarni tanlash (Ko'p marta tanlash imkoniyati)
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // 3. Rasm yuklanganda matnni o'zgartirish (Vizual feedback)
    const fileInput = document.getElementById('image-input');
    const uploadZoneSpan = document.querySelector('.upload-zone span');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadZoneSpan.textContent = `Rasm tanlandi: ${e.target.files[0].name}`;
            uploadZoneSpan.style.color = '#db6c57';
        }
    });

    // 4. Buyurtma ma'lumotlarini URL/localStorage orqali topib, sarlavhani to'ldirish
    async function loadOrderInfo() {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id') || localStorage.getItem('qz_current_order_id');
        if (!orderId || !supabaseClient) return;

        const { data, error } = await supabaseClient
            .from('orders')
            .select('id, food_id, food_name, chef_id, chef_name, created_at')
            .eq('id', orderId)
            .single();

        if (error || !data) return;
        currentOrder = data;

        const nameEl = document.querySelector('.product-name');
        const dateEl = document.querySelector('.date');
        if (nameEl) nameEl.textContent = data.food_name || "Taom";
        if (dateEl && data.created_at) {
            dateEl.textContent = new Date(data.created_at).toLocaleDateString('uz', { day: 'numeric', month: 'long' });
        }
    }
    loadOrderInfo();

    // 5. Yuborish tugmasi bosilganda — public.reviews jadvaliga yozish
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.addEventListener('click', async () => {
        if (!foodRatingValue && !chefRatingValue) {
            alert("Iltimos, kamida bitta bahoni tanlang.");
            return;
        }
        if (!supabaseClient) {
            alert("Xatolik: baholash tizimi ishlamayapti.");
            return;
        }

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert("Baho qoldirish uchun avval tizimga kiring.");
            return;
        }

        const selectedTags = Array.from(document.querySelectorAll('.tag.active')).map(t => t.textContent.trim());
        const baseComment = document.querySelector('.comment-area').value.trim();
        const comment = selectedTags.length ? `[${selectedTags.join(', ')}] ${baseComment}`.trim() : baseComment;
        const orderId = currentOrder ? currentOrder.id : null;
        const foodId = currentOrder ? currentOrder.food_id : null;
        const chefId = currentOrder ? currentOrder.chef_id : null;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Yuborilmoqda...';

        const rows = [];
        if (foodRatingValue && foodId) {
            rows.push({ order_id: orderId, user_id: user.id, food_id: foodId, rating: foodRatingValue, comment: comment || null });
        }
        if (chefRatingValue && chefId) {
            rows.push({ order_id: orderId, user_id: user.id, chef_id: chefId, rating: chefRatingValue, comment: comment || null });
        }

        if (!rows.length) {
            // Buyurtma food_id/chef_id topilmagan bo'lsa ham, foydalanuvchi bahosi yo'qolib ketmasin
            if (foodRatingValue) rows.push({ order_id: orderId, user_id: user.id, food_id: null, chef_id: null, rating: foodRatingValue, comment: comment || null });
        }

        try {
            for (const row of rows) {
                if (!row.food_id && !row.chef_id) continue;
                const { error } = await supabaseClient.from('reviews').insert(row);
                if (error) console.error('Sharh saqlashda xatolik:', error);
            }
            alert("Rahmat! Fikringiz muvaffaqiyatli yuborildi.");
            window.location.href = 'buyordashbord.html';
        } catch (err) {
            console.error(err);
            alert("Xatolik yuz berdi, qaytadan urinib ko'ring.");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Yuborish';
        }
    });
});
