document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Yulduzchalarni baholash tizimi (Ikkala blok uchun alohida)
    setupRating('food-rating');
    setupRating('chef-rating');

    function setupRating(containerId) {
        const container = document.getElementById(containerId);
        const stars = container.querySelectorAll('i');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                
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

    // 4. Yuborish tugmasi bosilganda
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.addEventListener('click', () => {
        alert("Rahmat! Fikringiz muvaffaqiyatli yuborildi.");
    });
});