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
    const modal = document.querySelector('.modal-card');

    // Ikkala tugma bosilganda ham formani tozalaydi yoki ogohlantiradi
    [closeBtn, cancelBtn].forEach(button => {
        button.addEventListener('click', () => {
            if (confirm("Haqiqatan ham bekor qilmoqchimisiz? Ma'lumotlar o'chib ketadi.")) {
                document.querySelector('.modal-form').reset(); // Formani tozalash
                counterValue.textContent = "10"; // Counterni dastlabki holatga qaytarish
                uploadTitle.textContent = "Rasm yuklang"; // Rasmni qaytarish
                alert("Oyna yopildi (Forma tozalandi).");
            }
        });
    });

    // ==========================================
    // 5. MENYUGA QO'SHISH (FORM SUBMIT)
    // ==========================================
    const form = document.querySelector('.modal-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Sahifa yangilanib ketishini oldini oladi

        // Kiritilgan barcha masalliq (tag)larni massivga yig'ish
        const ingredients = [];
        tagsContainer.querySelectorAll('.tag').forEach(tag => {
            // "×" belgisini olib tashlab matnni saqlaydi
            ingredients.push(tag.textContent.replace('×', '').trim());
        });

        // Barcha ma'lumotlarni bitta chiroyli Objectga yig'ish
        const foodData = {
            nomi: document.querySelector('input[placeholder="M: Milliy palov"]').value,
            kategoriya: document.querySelector('.form-select').value,
            tavsif: document.querySelector('.form-textarea').value,
            narxi: document.querySelector('.grid-4 div:nth-child(1) input').value,
            soni: counterValue.textContent,
            tayyorlashVaqti: document.querySelector('.grid-4 div:nth-child(3) input').value,
            tayyorVaqtiSoat: document.querySelector('.time-wrapper input').value,
            masalliqlar: ingredients,
            allergenMavjud: document.getElementById('allergenSwitch').checked,
            rasmFayli: fileInput.files[0] ? fileInput.files[0].name : "Yuklanmagan"
        };

        // Dasturchilar uchun konsol oynasiga tekshirish uchun chiqarish
        console.log("Yig'ilgan ma'lumotlar:", foodData);
        alert("Taom muvaffaqiyatli qo'shildi! Natijani ko'rish uchun (F12 -> Console) oynasini oching.");
        window.location.href = 'xurmoOpa 2.html';
    });
});
   const themeToggleBtn = document.getElementById('themeToggleBtn');
        
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });