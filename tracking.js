document.addEventListener("DOMContentLoaded", function() {
    
    // 1. QO'NG'IROQ VA SMS TUGMALARI UCHUN ODDIY EVENTLAR
    const btnCall = document.querySelector(".btn-call");
    const btnSms = document.querySelector(".btn-sms");

    if(btnCall) {
        btnCall.addEventListener("click", function() {
            alert("Kuryer Dilshod bilan bog'lanilmoqda: +998 (90) 123-45-67");
        });
    }

    if(btnSms) {
        btnSms.addEventListener("click", function() {
            window.location.href = "chat.html";
        });
    }

    // 2. XARITA KONTROLLARI SIMULYATSIYASI
    const ctrlButtons = document.querySelectorAll(".ctrl-btn");
    ctrlButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Kontrollarni bosganda tugma qisqa effekt berishi uchun
            this.style.transform = "scale(0.95)";
            setTimeout(() => {
                this.style.transform = "scale(1)";
            }, 100);
        });
    });

    // 3. KURYERNING HARAKATLANISH SIMULYATSIYASI (Vizual chiroyli effekt uchun)
    const courierIcon = document.querySelector(".moving-courier");
    if (courierIcon) {
        let direction = 1;
        let step = 0;
        
        setInterval(() => {
            step += 0.1 * direction;
            if (step > 3 || step < -3) {
                direction *= -1; // Yo'nalishni o'zgartirish
            }
            // Kuryer belgisini chiziq bo'ylab ozgina tebratib turish
            courierIcon.style.transform = `translate(calc(-50% + ${step}px), calc(-50% + ${step * 0.5}px))`;
        }, 150);
    }
});