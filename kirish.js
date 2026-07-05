// Supabase credentials
const SUPABASE_URL = 'https://usoekoycypxbcxzwoaea.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BL1ADSdK5cXfmXI4rrTmRA_eixc8I0-';
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseClient = window.supabaseClient;



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





// ==========================================

// EXTRACTED FROM kirish.html

// ========================================== 

const FOODS = [

        {

          id: 1,

          name: "Osh",

          price: 35000,

          img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "milliy",

          desc: "An'anaviy o'zbek oshi, ziravorlar bilan",

          rating: 4.8,

        },

        {

          id: 2,

          name: "Manti",

          price: 28000,

          img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "milliy",

          desc: "Bug'doy xamirli manti, qo'y go'shti",

          rating: 4.7,

        },

        {

          id: 3,

          name: "Plov",

          price: 40000,

          img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "milliy",

          desc: "Samarqand plovi, qo'zichoq go'shti",

          rating: 4.9,

        },

        {

          id: 4,

          name: "Lag'mon",

          price: 30000,

          img: "https://images.unsplash.com/photo-1612966608997-303747b974a7?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "milliy",

          desc: "Qo'l yozilgan lag'mon, sabzavotli",

          rating: 4.6,

        },

        {

          id: 5,

          name: "Shashlik",

          price: 45000,

          img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "grill",

          desc: "Qo'y shashlik, piyoz va sok bilan",

          rating: 4.8,

        },

        {

          id: 6,

          name: "Tikka kabob",

          price: 42000,

          img: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "grill",

          desc: "Muqimiy tikka kabob, maxsus marinad",

          rating: 4.7,

        },

        {

          id: 7,

          name: "Lyulya-kebab",

          price: 38000,

          img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "grill",

          desc: "Maydalangan go'sht lyulya, lavash bilan",

          rating: 4.5,

        },

        {

          id: 8,

          name: "Non",

          price: 8000,

          img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "nonushta",

          desc: "Issiq tandir noni, yong'oq urug'i",

          rating: 4.5,

        },

        {

          id: 9,

          name: "Qatiq",

          price: 12000,

          img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "nonushta",

          desc: "Uy qatiqi, murch va zira bilan",

          rating: 4.3,

        },

        {

          id: 10,

          name: "Tuxum qaylash",

          price: 18000,

          img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&h=300&q=80",

          cat: "nonushta",

          desc: "2 ta tuxum, non va choy bilan",

          rating: 4.4,

        },

        {

          id: 11,

          name: "Chak-chak",

          price: 18000,

          img: "https://picsum.photos/seed/chak111/300/200.jpg",

          cat: "shirinlik",

          desc: "O'zbek shirinligi, asal bilan",

          rating: 4.4,

        },

        {

          id: 12,

          name: "Somsa",

          price: 15000,

          img: "https://picsum.photos/seed/somsa12/300/200.jpg",

          cat: "nonushta",

          desc: "Issiq qo'y somsa, piyozli",

          rating: 4.7,

        },

        {

          id: 13,

          name: "Norin",

          price: 32000,

          img: "https://picsum.photos/seed/norin13/300/200.jpg",

          cat: "milliy",

          desc: "Norin lag'mon, qatiq va piyoz",

          rating: 4.5,

        },

        {

          id: 14,

          name: "Halva",

          price: 14000,

          img: "https://picsum.photos/seed/halva14/300/200.jpg",

          cat: "shirinlik",

          desc: "Sug'diyon halva, yong'oq bilan",

          rating: 4.3,

        },

        {

          id: 15,

          name: "Choy",

          price: 5000,

          img: "https://picsum.photos/seed/choy15/300/200.jpg",

          cat: "ichimlik",

          desc: "Yashil choy, limon va shakar",

          rating: 4.6,

        },

        {

          id: 16,

          name: "Ayran",

          price: 8000,

          img: "https://picsum.photos/seed/ayran16/300/200.jpg",

          cat: "ichimlik",

          desc: "Salqin ayran, tuz va zira",

          rating: 4.4,

        },

      ];

      const CATS = [

        { id: "all", label: "Hammasi" },

        { id: "milliy", label: "Milliy" },

        { id: "grill", label: "Grill" },

        { id: "nonushta", label: "Nonushta" },

        { id: "shirinlik", label: "Shirinlik" },

        { id: "ichimlik", label: "Ichimlik" },

      ];

      const COMMENTS_DATA = [

        {

          name: "Dilshod R.",

          text: "Osh juda mazali edi, haqiqiy Samarqand taomi!",

          rating: 5,

          date: "2 kun oldin",

          avatar: "D",

        },

        {

          name: "Madina K.",

          text: "Manti va lag'mon ajoyib, lekin yetkazish sekin kechdi.",

          rating: 4,

          date: "5 kun oldin",

          avatar: "M",

        },

        {

          name: "Sardor B.",

          text: "Shashlik o't olovdan chiqqandek edi! Eng yaxshi joy.",

          rating: 5,

          date: "1 hafta oldin",

          avatar: "S",

        },

        {

          name: "Nilufar A.",

          text: "Chak-chak va non juda yangi va mazali. Bolalar yoqtirdi.",

          rating: 4,

          date: "2 hafta oldin",

          avatar: "N",

        },

        {

          name: "Jasur T.",

          text: "Plov va tikka kabob buyurtma qildim, ikkalasi ham a'lo!",

          rating: 5,

          date: "3 hafta oldin",

          avatar: "J",

        },

      ];

      const ORDERS_DATA = [

        {

          id: "#TN-4821",

          items: ["Osh", "Non"],

          total: 43000,

          status: "delivered",

          statusText: "Yetkazildi",

          date: "15 Yan 2025",

        },

        {

          id: "#TN-4790",

          items: ["Plov", "Shashlik", "Lag'mon"],

          total: 115000,

          status: "delivered",

          statusText: "Yetkazildi",

          date: "12 Yan 2025",

        },

        {

          id: "#TN-4755",

          items: ["Manti", "Choy", "Somsa"],

          total: 51000,

          status: "delivered",

          statusText: "Yetkazildi",

          date: "8 Yan 2025",

        },

        {

          id: "#TN-4855",

          items: ["Manti", "Somsa"],

          total: 43000,

          status: "preparing",

          statusText: "Tayyorlanmoqda",

          date: "Bugun",

        },

        {

          id: "#TN-4860",

          items: ["Osh", "Chak-chak", "Non"],

          total: 61000,

          status: "onway",

          statusText: "Yo'lda",

          date: "Bugun",

        },

      ];

      let curLang = "uz";

      const I18N = {

        uz: {

          tagline: "O'zbek taomlarini onlayn buyurtma qiling",

          f1: "Har kuni yangi taomlar",

          f2: "Uyga yetkazib berish",

          f3: "Tez va ishonchli xizmat",

          f4: "Chegirmalar va aksiyalar",

          f5: "15-30 daqiqada yetkazish",

          s1: "Mijozlar",

          s2: "Taomlar",

          s3: "Reyting",

          rtxt: "Bu ilova orqali eng mazali taomlarni osongina buyurtma qildim. Judayam qulay!",

          rauth: "— Alisher, Toshkent",

          wb: "Xush kelibsiz",

          lsub: "Hisobingizga kiring",

          eph: "Email manzil",

          pph: "Parol",

          lbtn: "Kirish",

          or: "yoki",

          lg: "Google orqali",

          lf: "Facebook orqali",

          na: "Hisob yo'qmi?",

          rl: "Ro'yxatdan o'ting",

          rtitle: "Ro'yxatdan o'tish",

          rsub: "Yangi hisob yarating",

          nph: "Ism familiya",

          pph2: "Telefon raqam",

          pph2c: "Parolni tasdiqlang",

          rbtn: "Hisob yaratish",

          ah: "Hisobingiz bormi?",

          ll: "Kirish",

          vtitle: "Tasdiqlash",

          vsub: "6 xonali kodni kiriting",

          vtimer: "Kod muddati:",

          nr: "Kod kelmadi?",

          resend: "Qayta yuborish",

          vbtn: "Tasdiqlash",

          ct: "Savat",

          csub: "Tanlangan taomlaringiz",

          ceT: "Hali taom tanlamadingiz",

          wt: "Istaklar",

          wsub: "Yoqtirgan taomlaringiz",

          weT: "Yurak tugmasini bosing",

          vt: "Ovoz berish",

          vsub2: "Sevimli taomlaringizga baho bering",

          cmt: "Izohlar",

          cmtsub: "Foydalanuvchilar fikrlari",

          cmtph: "Fikringizni yozing...",

          cmtsend: "Yuborish",

          ot: "Buyurtmalar",

          osub: "So'nggi buyurtmalaringiz",

          mt: "Menyu",

          msub: "Taomlar va narxlar",

          promo_tag: "Maxsus taklif",

          promo_title: "20% chegirma",

          promo_desc: "Birinchi buyurtmangizga 20% chegirma",

          trk: "Yetkazib berish",

          trksub: "Buyurtmangiz holati",

          drv_info: "Honda CD 110 · 01 AA 777",

          tr1: "Qabul qilindi",

          tr2: "Tayyorlanmoqda",

          tr3: "Yo'lda",

          tr4: "Yetkazildi",

          trk_order: "Buyurtma raqami",

          trk_items: "Taomlar",

          trk_total: "Jami",

          trk_eta: "Taxminiy vaqt",

          stitle: "Sozlamalar",

          ssub: "Ilova sozlamalari",

          sg_notif: "Bildirishnomalar",

          sn_push: "Push bildirishnomalar",

          sn_push_d: "Yangi takliflar haqida xabardor bo'ling",

          sn_email: "Email xabarnoma",

          sn_email_d: "Aksiyalar va chegirmalar haqida xat oling",

          sn_promo: "Promo xabarnomalar",

          sn_promo_d: "Maxsus takliflar haqida bildirishnoma oling",

          sg_lang: "Til tanlash",

          sg_app: "Ilova",

          sa_clear: "Keshni tozalash",

          sa_clear_d: "Mahalliy ma'lumotlarni o'chirish",

          sa_clear_b: "Tozalash",

          sa_ver: "Versiya",

          sa_ver_d: "Hozirgi ilova versiyasi",

          sa_about: "Ilova haqida",

          sa_about_d: "TaomNash haqida batafsil",

          fn: "Ism familiya",

          ph: "Telefon",

          ad: "Manzil",

          jd: "Qo'shilgan sana",

          ep: "Tahrirlash",

          lo: "Chiqish",

          cancel: "Bekor qilish",

          save: "Saqlash",

          avh: "Rasmni o'zgartirish uchun bosing",

          bonus_l: "Bonus ballari",

          bonus_d: "Keyingi xarid uchun ishlatiladi",

          ps1: "Buyurtma",

          ps2: "Istak",

          ps3: "Izoh",

          ts: "Muvaffaqiyatli!",

          te: "Xatolik!",

          ti: "Ma'lumot",

          tw: "Ogohlantirish",

          addCart: "Savatga qo'shildi",

          rmCart: "Savatdan o'chirildi",

          addWish: "Istaklarga qo'shildi",

          rmWish: "Istaklardan o'chirildi",

          voted: "Ovozingiz qabul qilindi!",

          cmtOk: "Izoh qo'shildi!",

          cacheOk: "Kesh tozalandi",

          logged: "Muvaffaqiyatli kirdingiz!",

          regOk: "Ro'yxatdan muvaffaqiyatli o'tdingiz!",

          vOk: "Tasdiqlash muvaffaqiyatli!",

          fillAll: "Barcha maydonlarni to'ldiring",

          badEmail: "Noto'g'ri email",

          badPass: "Parol kamida 6 belgi",

          passMatch: "Parollar mos kelmayapti",

          badCode: "Noto'g'ri kod",

          codeExp: "Kod muddati o'tdi, qayta yuboring",

          promoOk: "Promo kod qo'llanildi!",

        },

        ru: {

          tagline: "Заказывайте узбекские блюда онлайн",

          f1: "Новые блюда каждый день",

          f2: "Доставка на дом",

          f3: "Быстрая и надёжная служба",

          f4: "Скидки и акции",

          f5: "Доставка за 15-30 минут",

          s1: "Клиентов",

          s2: "Блюд",

          s3: "Рейтинг",

          rtxt: "Через это приложение я легко заказал самые вкусные блюда!",

          rauth: "— Алишер, Ташкент",

          wb: "Добро пожаловать",

          lsub: "Войдите в аккаунт",

          eph: "Email адрес",

          pph: "Пароль",

          lbtn: "Войти",

          or: "или",

          lg: "Через Google",

          lf: "Через Facebook",

          na: "Нет аккаунта?",

          rl: "Зарегистрируйтесь",

          rtitle: "Регистрация",

          rsub: "Создайте новый аккаунт",

          nph: "Имя фамилия",

          pph2: "Номер телефона",

          pph2c: "Подтвердите пароль",

          rbtn: "Создать аккаунт",

          ah: "Уже есть аккаунт?",

          ll: "Войти",

          vtitle: "Подтверждение",

          vsub: "Введите 6-значный код",

          vtimer: "Срок действия кода:",

          nr: "Код не пришёл?",

          resend: "Отправить снова",

          vbtn: "Подтвердить",

          ct: "Корзина",

          csub: "Ваши выбранные блюда",

          ceT: "Вы ещё не выбрали блюда",

          wt: "Избранное",

          wsub: "Ваши любимые блюда",

          weT: "Нажмите на сердечко",

          vt: "Голосование",

          vsub2: "Оцените любимые блюда",

          cmt: "Отзывы",

          cmtsub: "Мнения пользователей",

          cmtph: "Напишите своё мнение...",

          cmtsend: "Отправить",

          ot: "Заказы",

          osub: "Ваши последние заказы",

          mt: "Меню",

          msub: "Блюда и цены",

          promo_tag: "Специальное предложение",

          promo_title: "Скидка 20%",

          promo_desc: "На первый заказ скидка 20%",

          trk: "Доставка",

          trksub: "Статус вашего заказа",

          drv_info: "Honda CD 110 · 01 AA 777",

          tr1: "Принят",

          tr2: "Готовится",

          tr3: "В пути",

          tr4: "Доставлен",

          trk_order: "Номер заказа",

          trk_items: "Блюда",

          trk_total: "Итого",

          trk_eta: "Примерное время",

          stitle: "Настройки",

          ssub: "Настройки приложения",

          sg_notif: "Уведомления",

          sn_push: "Push-уведомления",

          sn_push_d: "Будьте в курсе предложений",

          sn_email: "Email рассылка",

          sn_email_d: "Получайте письма об акциях",

          sn_promo: "Промо уведомления",

          sn_promo_d: "Уведомления о спецпредложениях",

          sg_lang: "Выбор языка",

          sg_app: "Приложение",

          sa_clear: "Очистить кеш",

          sa_clear_d: "Удалить локальные данные",

          sa_clear_b: "Очистить",

          sa_ver: "Версия",

          sa_ver_d: "Текущая версия",

          sa_about: "О приложении",

          sa_about_d: "Подробнее о TaomNash",

          fn: "Имя фамилия",

          ph: "Телефон",

          ad: "Адрес",

          jd: "Дата регистрации",

          ep: "Редактировать",

          lo: "Выйти",

          cancel: "Отмена",

          save: "Сохранить",

          avh: "Нажмите для смены фото",

          bonus_l: "Бонусные баллы",

          bonus_d: "Для следующей покупки",

          ps1: "Заказов",

          ps2: "Избранное",

          ps3: "Отзывов",

          ts: "Успешно!",

          te: "Ошибка!",

          ti: "Информация",

          tw: "Внимание",

          addCart: "Добавлено в корзину",

          rmCart: "Удалено из корзины",

          addWish: "Добавлено в избранное",

          rmWish: "Удалено из избранного",

          voted: "Голос принят!",

          cmtOk: "Отзыв добавлен!",

          cacheOk: "Кеш очищен",

          logged: "Успешный вход!",

          regOk: "Успешная регистрация!",

          vOk: "Успешное подтверждение!",

          fillAll: "Заполните все поля",

          badEmail: "Неверный email",

          badPass: "Пароль минимум 6 символов",

          passMatch: "Пароли не совпадают",

          badCode: "Неверный код",

          codeExp: "Срок действия кода истёк",

          promoOk: "Промокод применён!",

        },

        en: {

          tagline: "Order Uzbek dishes online",

          f1: "New dishes every day",

          f2: "Home delivery",

          f3: "Fast and reliable service",

          f4: "Discounts and promotions",

          f5: "Delivery in 15-30 minutes",

          s1: "Customers",

          s2: "Dishes",

          s3: "Rating",

          rtxt: "Through this app I easily ordered the most delicious dishes. Very convenient!",

          rauth: "— Alisher, Tashkent",

          wb: "Welcome",

          lsub: "Sign in to your account",

          eph: "Email address",

          pph: "Password",

          lbtn: "Sign In",

          or: "or",

          lg: "With Google",

          lf: "With Facebook",

          na: "No account?",

          rl: "Sign Up",

          rtitle: "Sign Up",

          rsub: "Create a new account",

          nph: "Full name",

          pph2: "Phone number",

          pph2c: "Confirm password",

          rbtn: "Create Account",

          ah: "Already have an account?",

          ll: "Sign In",

          vtitle: "Verification",

          vsub: "Enter the 6-digit code",

          vtimer: "Code expires in:",

          nr: "Didn't get the code?",

          resend: "Resend",

          vbtn: "Verify",

          ct: "Cart",

          csub: "Your selected dishes",

          ceT: "You haven't selected any dishes yet",

          wt: "Wishlist",

          wsub: "Your favorite dishes",

          weT: "Tap the heart button",

          vt: "Vote",

          vsub2: "Rate your favorite dishes",

          cmt: "Reviews",

          cmtsub: "User opinions",

          cmtph: "Write your opinion...",

          cmtsend: "Send",

          ot: "Orders",

          osub: "Your recent orders",

          mt: "Menu",

          msub: "Dishes and prices",

          promo_tag: "Special offer",

          promo_title: "20% off",

          promo_desc: "20% off your first order",

          trk: "Delivery",

          trksub: "Your order status",

          drv_info: "Honda CD 110 · 01 AA 777",

          tr1: "Accepted",

          tr2: "Preparing",

          tr3: "On the way",

          tr4: "Delivered",

          trk_order: "Order number",

          trk_items: "Dishes",

          trk_total: "Total",

          trk_eta: "Estimated time",

          stitle: "Settings",

          ssub: "App settings",

          sg_notif: "Notifications",

          sn_push: "Push notifications",

          sn_push_d: "Stay informed about new offers",

          sn_email: "Email newsletter",

          sn_email_d: "Get emails about promotions",

          sn_promo: "Promo notifications",

          sn_promo_d: "Get notified about special offers",

          sg_lang: "Language selection",

          sg_app: "App",

          sa_clear: "Clear cache",

          sa_clear_d: "Remove local data",

          sa_clear_b: "Clear",

          sa_ver: "Version",

          sa_ver_d: "Current app version",

          sa_about: "About app",

          sa_about_d: "More about TaomNash",

          fn: "Full name",

          ph: "Phone",

          ad: "Address",

          jd: "Joined date",

          ep: "Edit",

          lo: "Sign Out",

          cancel: "Cancel",

          save: "Save",

          avh: "Tap to change photo",

          bonus_l: "Bonus points",

          bonus_d: "Used for next purchase",

          ps1: "Orders",

          ps2: "Wishlist",

          ps3: "Reviews",

          ts: "Success!",

          te: "Error!",

          ti: "Info",

          tw: "Warning",

          addCart: "Added to cart",

          rmCart: "Removed from cart",

          addWish: "Added to wishlist",

          rmWish: "Removed from wishlist",

          voted: "Your vote is accepted!",

          cmtOk: "Review added!",

          cacheOk: "Cache cleared",

          logged: "Successfully logged in!",

          regOk: "Successfully registered!",

          vOk: "Successfully verified!",

          fillAll: "Fill all fields",

          badEmail: "Invalid email",

          badPass: "Password at least 6 characters",

          passMatch: "Passwords don't match",

          badCode: "Wrong code",

          codeExp: "Code expired, please resend",

          promoOk: "Promo code applied!",

        },

      };

      function t(k) {

        return (I18N[curLang] && I18N[curLang][k]) || k;

      }

      function applyI18n() {

        document.querySelectorAll("[data-i18n]").forEach((el) => {

          const k = el.getAttribute("data-i18n");

          if (I18N[curLang] && I18N[curLang][k])

            el.textContent = I18N[curLang][k];

        });

        document.querySelectorAll("[data-i18n-ph]").forEach((el) => {

          const k = el.getAttribute("data-i18n-ph");

          if (I18N[curLang] && I18N[curLang][k])

            el.placeholder = I18N[curLang][k];

        });

        renderLangGrid();

      }



      /* Holat */

      let user = JSON.parse(localStorage.getItem("tn_user") || "null");

      let cart = JSON.parse(localStorage.getItem("tn_cart") || "[]");

      let wishes = JSON.parse(localStorage.getItem("tn_wish") || "[]");

      let votes = JSON.parse(localStorage.getItem("tn_votes") || "{}");

      let comments = JSON.parse(localStorage.getItem("tn_cmts") || "null") || [

        ...COMMENTS_DATA,

      ];

      let verifyCode = "";

      let cmtRating = 0;

      let currentPg = "pgLogin";

      let timerSec = 300;

      let timerIv = null;

      let codeExpired = false;

      let resendCount = 60;

      let resendIv = null;

      let curCat = "all";

      let selectedRole = "mijoz";

      window.setRole = function(role) {

        selectedRole = role;

        document.querySelectorAll(".role-selector").forEach((sel) => {

          sel.querySelectorAll(".role-btn").forEach((btn) => {

            const isActive = btn.getAttribute("onclick").includes(role);

            btn.classList.toggle("active", isActive);

          });

        });

      };



      function save() {

        localStorage.setItem("tn_cart", JSON.stringify(cart));

        localStorage.setItem("tn_wish", JSON.stringify(wishes));

        localStorage.setItem("tn_votes", JSON.stringify(votes));

        localStorage.setItem("tn_cmts", JSON.stringify(comments));

        if (user) localStorage.setItem("tn_user", JSON.stringify(user));

      }



      /* Toast */

      function toast(msg, type = "ti") {

        const c = document.getElementById("tc");

        const icons = {

          ts: "fa-check-circle",

          te: "fa-times-circle",

          ti: "fa-info-circle",

          tw: "fa-exclamation-triangle",

        };

        const d = document.createElement("div");

        d.className = "toast " + type;

        d.innerHTML = `<i class="fas ${icons[type] || icons.ti} tic"></i><span class="tmsg">${msg}</span><button class="tx" onclick="rmToast(this.parentElement)"><i class="fas fa-times"></i></button><div class="tbar"></div>`;

        c.appendChild(d);

        requestAnimationFrame(() => d.classList.add("show"));

        setTimeout(() => rmToast(d), 4200);

      }

      function rmToast(el) {

        if (!el || !el.parentElement) return;

        el.classList.remove("show");

        el.classList.add("hide");

        setTimeout(() => el.remove(), 400);

      }



      /* Modal */

      function openModal(h) {

        document.getElementById("modalBody").innerHTML = h;

        document.getElementById("modal").classList.add("on");

      }

      function closeModal() {

        document.getElementById("modal").classList.remove("on");

      }

      document.getElementById("modal").addEventListener("click", (e) => {

        if (e.target === e.currentTarget) closeModal();

      });



      /* Navigatsiya */

      function go(id) {

        document

          .querySelectorAll(".pg")

          .forEach((p) => p.classList.remove("on"));

        const pg = document.getElementById(id);

        if (pg) pg.classList.add("on");

        currentPg = id;

        updateNav();

        if (id === "pgCart") renderCart();

        if (id === "pgWish") renderWish();

        if (id === "pgVote") renderVote();

        if (id === "pgComments") renderComments();

        if (id === "pgOrders") renderOrders();

        if (id === "pgProfile") renderProfile();

        if (id === "pgSettings") applyI18n();

        if (id === "pgMenu") renderMenu();

      }

      function navTo(btn) {

        const pg = btn.getAttribute("data-pg");

        if (pg) go(pg);

      }

      function updateNav() {

        document

          .querySelectorAll(".bnav-item")

          .forEach((b) =>

            b.classList.toggle("on", b.getAttribute("data-pg") === currentPg),

          );

        const badge = document.getElementById("cartBadge");

        if (cart.length > 0) {

          badge.style.display = "flex";

          badge.textContent = cart.reduce((s, i) => s + i.qty, 0);

        } else badge.style.display = "none";

      }



      /* Tema */

      document.getElementById("thBtn").addEventListener("click", () => {

        const h = document.documentElement;

        const dark = h.getAttribute("data-theme") === "dark";

        h.setAttribute("data-theme", dark ? "light" : "dark");

        document.querySelector("#thBtn i").className = dark

          ? "fas fa-moon"

          : "fas fa-sun";

      });



      /* Til */

      const langs = [

        { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },

        { code: "ru", label: "Русский", flag: "🇷🇺" },

        { code: "en", label: "English", flag: "🇬🇧" },

      ];

      function buildLangMenu() {

        document.getElementById("lMenu").innerHTML = langs

          .map(

            (l) =>

              `<button class="lo${l.code === curLang ? " on" : ""}" onclick="setLang('${l.code}')">${l.flag} ${l.label}</button>`,

          )

          .join("");

      }

      function setLang(c) {

        curLang = c;

        buildLangMenu();

        applyI18n();

        document.getElementById("lMenu").classList.remove("open");

      }

      document

        .getElementById("lnBtn")

        .addEventListener("click", () =>

          document.getElementById("lMenu").classList.toggle("open"),

        );

      document.addEventListener("click", (e) => {

        if (!e.target.closest(".ldd"))

          document.getElementById("lMenu").classList.remove("open");

      });

      function renderLangGrid() {

        const g = document.getElementById("settLangGrid");

        if (!g) return;

        g.innerHTML = langs

          .map(

            (l) =>

              `<button class="sett-lang-btn${l.code === curLang ? " on" : ""}" onclick="setLang('${l.code}')">${l.flag}<br>${l.label}</button>`,

          )

          .join("");

      }



      function tpw(id, btn) {

        const inp = document.getElementById(id);

        const show = inp.type === "password";

        inp.type = show ? "text" : "password";

        btn.querySelector("i").className = show

          ? "fas fa-eye-slash"

          : "fas fa-eye";

      }



      /* Kirish */

            /* Kirish */
      document.getElementById("fLogin").addEventListener("submit", async (e) => {
        e.preventDefault();
        const em = document.getElementById("lE").value.trim();
        const pw = document.getElementById("lP").value;
        if (!em || !pw) {
          toast(t("fillAll"), "tw");
          return;
        }
        if (!/\S+@\S+\.\S+/.test(em)) {
          toast(t("badEmail"), "te");
          document.getElementById("lE").classList.add("shk");
          setTimeout(
            () => document.getElementById("lE").classList.remove("shk"),
            500,
          );
          return;
        }
        if (pw.length < 6) {
          toast(t("badPass"), "te");
          document.getElementById("lP").classList.add("shk");
          setTimeout(
            () => document.getElementById("lP").classList.remove("shk"),
            500,
          );
          return;
        }
        
        const btn = e.target.querySelector("button[type='submit']");
        const btnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Kirish...`;

        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: em,
            password: pw
          });

          if (error) {
            toast(error.message, "te");
            btn.disabled = false;
            btn.innerHTML = btnText;
            return;
          }

          const userObj = data.user;
          if (userObj) {
            let { data: profile, error: profileError } = await supabaseClient
              .from('profiles')
              .select('role, full_name, phone')
              .eq('id', userObj.id)
              .single();

            // Extract metadata fields stored on signup
            const meta = userObj.user_metadata || {};
            const metaName = meta.full_name || '';
            const metaPhone = meta.phone || '';
            const metaRole = meta.role || selectedRole;

            // Since we are authenticated now, RLS permits updating/inserting profiles
            if (profile) {
              if (!profile.full_name || !profile.phone || profile.role === 'user') {
                const { data: updatedProfile } = await supabaseClient
                  .from('profiles')
                  .update({
                    full_name: profile.full_name || metaName,
                    phone: profile.phone || metaPhone,
                    role: (profile.role && profile.role !== 'user') ? profile.role : metaRole
                  })
                  .eq('id', userObj.id)
                  .select()
                  .single();
                if (updatedProfile) {
                  profile = updatedProfile;
                }
              }
            } else {
              const { data: insertedProfile } = await supabaseClient
                .from('profiles')
                .insert({
                  id: userObj.id,
                  full_name: metaName,
                  phone: metaPhone,
                  role: metaRole
                })
                .select()
                .single();
              if (insertedProfile) {
                profile = insertedProfile;
              }
            }

            let role = selectedRole;
            let name = "Foydalanuvchi";
            let phone = "";

            if (profile) {
              role = profile.role || selectedRole;
              name = profile.full_name || name;
              phone = profile.phone || phone;
            }

            user = {
              name: name,
              email: userObj.email,
              phone: phone,
              address: "",
              joined: new Date(userObj.created_at).toLocaleDateString("uz"),
              role: role
            };
            save();

            document.getElementById("prBtn").style.display = "flex";
            if (user.role === "oshpaz") {
              toast(t("logged"), "ts");
              setTimeout(() => {
                window.location.href = "oshpazlarOnboard.html";
              }, 800);
            } else {
              toast(t("logged"), "ts");
              setTimeout(() => {
                window.location.href = "buyordashbord.html";
              }, 800);
            }
          }
        } catch (err) {
          toast(err.message || "Xatolik yuz berdi", "te");
        } finally {
          btn.disabled = false;
          btn.innerHTML = btnText;
        }
      });

      /* Ro'yxatdan o'tish */
      document.getElementById("fReg").addEventListener("submit", async (e) => {
        e.preventDefault();
        const n = document.getElementById("rN").value.trim();
        const ph = document.getElementById("rPh").value.trim();
        const em = document.getElementById("rE").value.trim();
        const p = document.getElementById("rP").value;
        const p2 = document.getElementById("rP2").value;
        if (!n || !ph || !em || !p || !p2) {
          toast(t("fillAll"), "tw");
          return;
        }
        if (!/\S+@\S+\.\S+/.test(em)) {
          toast(t("badEmail"), "te");
          return;
        }
        if (p.length < 6) {
          toast(t("badPass"), "te");
          return;
        }
        if (p !== p2) {
          toast(t("passMatch"), "te");
          return;
        }

        const btn = e.target.querySelector("button[type='submit']");
        const btnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Ro'yxatdan o'tish...`;

        try {
          const { data, error } = await supabaseClient.auth.signUp({
            email: em,
            password: p,
            options: {
              data: {
                full_name: n,
                phone: ph,
                role: selectedRole
              }
            }
          });

          if (error) {
            toast(error.message, "te");
            btn.disabled = false;
            btn.innerHTML = btnText;
            return;
          }

          const userObj = data.user;
          if (userObj) {
            // Attempt client-side write immediately (works if email confirmation is disabled)
            await supabaseClient
              .from('profiles')
              .update({
                full_name: n,
                phone: ph,
                role: selectedRole
              })
              .eq('id', userObj.id);

            // Clear local user storage so they log in manually
            user = null;
            user = {
              name: n,
              email: em,
              phone: ph,
              address: "",
              joined: new Date(userObj.created_at).toLocaleDateString("uz"),
              role: selectedRole
            };
            save();

            document.getElementById("prBtn").style.display = "flex";
            toast(t("regOk") || "Muvaffaqiyatli ro'yxatdan o'tdingiz!", "ts");
            setTimeout(() => {
              if (selectedRole === "oshpaz") {
                go("pgLogin");
              } else {
                window.location.href = "buyordashbord.html";
              }
            }, 1000);
          }
        } catch (err) {
          toast(err.message || "Xatolik yuz berdi", "te");
        } finally {
          btn.disabled = false;
          btn.innerHTML = btnText;
        }
      });

      /* Tasdiqlash - 5 daqiqa */

      function startVerify() {

        verifyCode = String(Math.floor(100000 + Math.random() * 900000));

        codeExpired = false;

        timerSec = 300;

        go("pgVerify");

        startTimer();

        startResend();

        document.querySelectorAll("#codeInputs .ci").forEach((i) => {

          i.value = "";

          i.classList.remove("ok", "err");

        });

        console.log(

          "%c Tasdiqlash kodi: " + verifyCode,

          "color:#e63946;font-size:16px;font-weight:bold;background:#fff8f0;padding:4px 8px;border-radius:4px",

        );

        toast("SMS Tasdiqlash kodi (sinov uchun): " + verifyCode, "ts");

      }

      function startTimer() {

        if (timerIv) clearInterval(timerIv);

        const fill = document.getElementById("timerFill");

        const disp = document.getElementById("timerDisplay");

        const info = document.getElementById("timerInfo");

        info.classList.remove("expired");

        fill.style.width = "100%";

        timerIv = setInterval(() => {

          timerSec--;

          if (timerSec <= 0) {

            clearInterval(timerIv);

            codeExpired = true;

            info.classList.add("expired");

            disp.textContent = "0:00";

            fill.style.width = "0%";

            return;

          }

          const m = Math.floor(timerSec / 60);

          const s = timerSec % 60;

          const txt = m + ":" + (s < 10 ? "0" : "") + s;

          disp.textContent = txt;

          fill.style.width = (timerSec / 300) * 100 + "%";

        }, 1000);

      }

      function startResend() {

        resendCount = 60;

        const btn = document.getElementById("resendBtn");

        const txt = document.getElementById("rt");

        btn.disabled = true;

        if (resendIv) clearInterval(resendIv);

        resendIv = setInterval(() => {

          resendCount--;

          txt.textContent = resendCount;

          if (resendCount <= 0) {

            clearInterval(resendIv);

            btn.disabled = false;

            txt.textContent = "60";

          }

        }, 1000);

      }

      document.getElementById("resendBtn").addEventListener("click", () => {

        if (resendCount > 0) return;

        verifyCode = String(Math.floor(100000 + Math.random() * 900000));

        codeExpired = false;

        timerSec = 300;

        startTimer();

        startResend();

        document.querySelectorAll("#codeInputs .ci").forEach((i) => {

          i.value = "";

          i.classList.remove("ok", "err");

        });

        console.log(

          "%c Yangi kod: " + verifyCode,

          "color:#e63946;font-size:16px;font-weight:bold",

        );

        toast(t("ti"), "ti");

      });



      /* Kod input */

      document.querySelectorAll("#codeInputs .ci").forEach((inp, i, all) => {

        inp.addEventListener("input", (e) => {

          const v = e.target.value.replace(/\D/g, "");

          e.target.value = v;

          if (v && i < all.length - 1) all[i + 1].focus();

        });

        inp.addEventListener("keydown", (e) => {

          if (e.key === "Backspace" && !inp.value && i > 0) all[i - 1].focus();

        });

        inp.addEventListener("paste", (e) => {

          e.preventDefault();

          const txt = (e.clipboardData || window.clipboardData)

            .getData("text")

            .replace(/\D/g, "");

          for (let j = 0; j < Math.min(txt.length, all.length); j++) {

            all[j].value = txt[j];

            all[j].classList.remove("err", "ok");

          }

          if (txt.length > 0) all[Math.min(txt.length, all.length) - 1].focus();

        });

      });



      function doVerify() {

        if (codeExpired) {

          toast(t("codeExp"), "te");

          return;

        }

        const inputs = document.querySelectorAll("#codeInputs .ci");

        let code = "";

        inputs.forEach((i) => {

          i.classList.remove("err", "ok");

          code += i.value;

        });

        if (code.length < 6) {

          toast(t("fillAll"), "tw");

          return;

        }

        if (code === verifyCode) {

          inputs.forEach((i) => i.classList.add("ok"));

          toast(t("vOk"), "ts");

          if (timerIv) clearInterval(timerIv);

          setTimeout(() => {

            if (!user) {

              user = {

                name:

                  document.getElementById("rN").value.trim() || "Foydalanuvchi",

                email:

                  document.getElementById("rE").value.trim() ||

                  document.getElementById("lE").value.trim(),

                phone: document.getElementById("rPh").value.trim() || "",

                address: "",

                joined: new Date().toLocaleDateString("uz"),

                role: selectedRole

              };

              save();

            } else {

              user.role = selectedRole;

              save();

            }

            document.getElementById("prBtn").style.display = "flex";

            if (user.role === "oshpaz") {

              toast(t("logged"), "ts");

              setTimeout(() => {

                window.location.href = "oshpazlarOnboard.html";

              }, 1000);

            } else {

              go("pgProfile");

              toast(t("logged"), "ts");

            }

          }, 800);

        } else {

          inputs.forEach((i) => i.classList.add("err"));

          toast(t("badCode"), "te");

          setTimeout(

            () => inputs.forEach((i) => i.classList.remove("err")),

            600,

          );

        }

      }



      /* Google/FB */

      function gLogin() {

        const b = event.target.closest(".sb");

        b.classList.add("ld");

        setTimeout(() => {

          b.classList.remove("ld");

          user = {

            name: "Google Foydalanuvchi",

            email: "user@gmail.com",

            phone: "",

            address: "",

            joined: new Date().toLocaleDateString("uz"),

          };

          save();

          document.getElementById("prBtn").style.display = "flex";

          go("pgProfile");

          toast(t("logged"), "ts");

        }, 1500);

      }

      function fLogin() {

        const b = event.target.closest(".sb");

        b.classList.add("ld");

        setTimeout(() => {

          b.classList.remove("ld");

          user = {

            name: "Facebook Foydalanuvchi",

            email: "user@facebook.com",

            phone: "",

            address: "",

            joined: new Date().toLocaleDateString("uz"),

          };

          save();

          document.getElementById("prBtn").style.display = "flex";

          go("pgProfile");

          toast(t("logged"), "ts");

        }, 1500);

      }



      /* Profil */

      document

        .getElementById("prBtn")

        .addEventListener("click", () => go("pgProfile"));

      document.getElementById("avIn").addEventListener("change", (e) => {

        const f = e.target.files[0];

        if (!f) return;

        const r = new FileReader();

        r.onload = (ev) => {

          document.getElementById("avImg").src = ev.target.result;

          document.getElementById("avImg").style.display = "block";

          document.getElementById("avDisp").style.display = "none";

          if (user) {

            user.avatar = ev.target.result;

            save();

          }

        };

        r.readAsDataURL(f);

      });

      function renderProfile() {

        if (!user) return;

        document.getElementById("pvName").textContent = user.name;

        document.getElementById("pvEmail").textContent = user.email;

        document.getElementById("pvPhone").textContent = user.phone || "—";

        document.getElementById("pvAddr").textContent = user.address || "—";

        document.getElementById("pvDate").textContent = user.joined || "—";

        if (user.avatar) {

          document.getElementById("avImg").src = user.avatar;

          document.getElementById("avImg").style.display = "block";

          document.getElementById("avDisp").style.display = "none";

        }

        document.getElementById("profileView").style.display = "block";

        document.getElementById("editForm").style.display = "none";

      }

      function showEdit() {

        document.getElementById("eN").value = user.name;

        document.getElementById("ePh").value = user.phone;

        document.getElementById("eAd").value = user.address;

        document.getElementById("profileView").style.display = "none";

        document.getElementById("editForm").style.display = "block";

      }

      function cancelEdit() {

        document.getElementById("profileView").style.display = "block";

        document.getElementById("editForm").style.display = "none";

      }

      async function saveEdit() {
        const newName = document.getElementById("eN").value.trim() || user.name;
        const newPhone = document.getElementById("ePh").value.trim();
        const newAddress = document.getElementById("eAd").value.trim();

        user.name = newName;
        user.phone = newPhone;
        user.address = newAddress;
        save();

        if (supabaseClient) {
            try {
                const { data: { user: authUser } } = await supabaseClient.auth.getUser();
                if (authUser) {
                    await supabaseClient
                        .from('profiles')
                        .update({
                            full_name: newName,
                            phone: newPhone
                        })
                        .eq('id', authUser.id);
                    
                    await supabaseClient.auth.updateUser({
                        data: {
                            full_name: newName,
                            phone: newPhone
                        }
                    });
                }
            } catch (err) {
                console.error("Supabase profile save failed:", err);
            }
        }

        renderProfile();
        toast(t("ts"), "ts");
      }

      async function doLogout() {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }

        user = null;
        localStorage.removeItem("tn_user");

        document.getElementById("prBtn").style.display = "none";
        go("pgLogin");
        toast(t("lo"), "ti");
      }



      /* Menu */

      function renderMenu() {

        const cf = document.getElementById("catFilter");

        cf.innerHTML = CATS.map(

          (c) =>

            `<button class="cat-btn${c.id === curCat ? " on" : ""}" onclick="filterCat('${c.id}')">${c.label}</button>`,

        ).join("");

        const fg = document.getElementById("foodGrid");

        const items =

          curCat === "all" ? FOODS : FOODS.filter((f) => f.cat === curCat);

        fg.innerHTML = items

          .map(

            (f) =>

              `<div class="food-card"><button class="fc-wish${wishes.includes(f.id) ? " on" : ""}" onclick="toggleWish(${f.id})"><i class="fas fa-heart"></i></button><img src="${f.img}" alt="${f.name}"/><div class="fc-body"><div class="fc-name">${f.name}</div><div class="fc-desc">${f.desc}</div><div class="fc-foot"><span class="fc-price">${f.price.toLocaleString()} so'm</span><span class="fc-rating"><i class="fas fa-star"></i> ${f.rating}</span></div></div><button class="fc-add" onclick="addToCart(${f.id})"><i class="fas fa-plus"></i></button></div>`,

          )

          .join("");

      }

      function filterCat(c) {

        curCat = c;

        renderMenu();

      }

      function applyPromo() {

        toast(t("promoOk"), "ts");

      }



      /* Savat */

      function addToCart(id) {

        const f = FOODS.find((x) => x.id === id);

        if (!f) return;

        const ex = cart.find((x) => x.id === id);

        if (ex) ex.qty++;

        else

          cart.push({

            id: f.id,

            name: f.name,

            price: f.price,

            img: f.img,

            qty: 1,

          });

        save();

        updateNav();

        toast(t("addCart"), "ts");

      }

      function rmCart(id) {

        cart = cart.filter((x) => x.id !== id);

        save();

        updateNav();

        renderCart();

        toast(t("rmCart"), "ti");

      }

      function chgQty(id, d) {

        const it = cart.find((x) => x.id === id);

        if (!it) return;

        it.qty += d;

        if (it.qty <= 0) return rmCart(id);

        save();

        updateNav();

        renderCart();

      }

      function renderCart() {

        const el = document.getElementById("cartList");

        if (!cart.length) {

          el.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>${t("ceT")}</p></div>`;

          return;

        }

        let h = "";

        cart.forEach((it) => {

          h += `<div class="cart-item"><img class="cart-img" src="${it.img}" alt="${it.name}"/><div class="cart-info"><h4>${it.name}</h4><span>${(it.price * it.qty).toLocaleString()} so'm</span></div><div class="cart-qty"><button onclick="chgQty(${it.id},-1)">−</button><span>${it.qty}</span><button onclick="chgQty(${it.id},1)">+</button></div><button class="cart-rm" onclick="rmCart(${it.id})"><i class="fas fa-trash-alt"></i></button></div>`;

        });

        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

        h += `<div class="cart-total"><span>Jami:</span><strong>${total.toLocaleString()} so'm</strong></div>`;

        el.innerHTML = h;

      }



      /* Istaklar */

      function toggleWish(id) {

        const idx = wishes.indexOf(id);

        if (idx >= 0) {

          wishes.splice(idx, 1);

          toast(t("rmWish"), "ti");

        } else {

          wishes.push(id);

          toast(t("addWish"), "ts");

        }

        save();

        if (currentPg === "pgMenu") renderMenu();

        if (currentPg === "pgWish") renderWish();

      }

      function renderWish() {

        const el = document.getElementById("wishList");

        if (!wishes.length) {

          el.innerHTML = `<div class="cart-empty"><i class="fas fa-heart"></i><p>${t("weT")}</p></div>`;

          return;

        }

        let h = "";

        wishes.forEach((id) => {

          const f = FOODS.find((x) => x.id === id);

          if (!f) return;

          h += `<div class="wish-card"><img src="${f.img}" alt="${f.name}"/><div class="wish-info"><h4>${f.name}</h4><p>${f.price.toLocaleString()} so'm</p></div><div class="wish-actions"><button onclick="addToCart(${f.id})" title="Savatga"><i class="fas fa-cart-plus"></i></button><button onclick="toggleWish(${f.id})" style="color:var(--dng)" title="O'chirish"><i class="fas fa-trash-alt"></i></button></div></div>`;

        });

        el.innerHTML = h;

      }



      /* Ovoz */

      function renderVote() {

        const el = document.getElementById("voteList");

        let h = "";

        FOODS.forEach((f) => {

          const v = votes[f.id] || 0;

          const pct = Math.min(v * 20, 100);

          h += `<div class="vote-card"><img src="${f.img}" alt="${f.name}"/><div class="vote-info"><h4>${f.name}</h4><p>${f.desc}</p><div class="stars" id="vs_${f.id}">${[1, 2, 3, 4, 5].map((s) => `<button data-v="${s}" class="${s <= v ? "on" : ""}" onclick="setVote(${f.id},${s})"><i class="fas fa-star"></i></button>`).join("")}</div><div class="vote-bar"><div class="vote-bar-fill" style="width:${pct}%"></div></div></div><button class="vote-btn${v ? " voted" : ""}" onclick="setVote(${f.id},${v || 5})" ${v ? "disabled" : ""}><i class="fas fa-check"></i></button></div>`;

        });

        el.innerHTML = h;

      }

      function setVote(id, val) {

        votes[id] = val;

        save();

        renderVote();

        if (val) toast(t("voted"), "ts");

      }



      /* Izohlar */

      function renderComments() {

        const el = document.getElementById("commentList");

        let h = "";

        comments.forEach((c) => {

          h += `<div class="comment-card"><div class="comment-head"><div class="comment-avatar">${c.avatar || c.name[0]}</div><div class="comment-meta"><h4>${c.name}</h4><span>${c.date}</span></div></div><div class="comment-stars">${[1, 2, 3, 4, 5].map((s) => `<i class="fas fa-star${s <= c.rating ? "" : " empty"}"></i>`).join("")}</div><p class="comment-text">${c.text}</p></div>`;

        });

        el.innerHTML = h;

        cmtRating = 0;

        document

          .querySelectorAll("#cmtStars button")

          .forEach((b) => b.classList.remove("on"));

      }

      document.querySelectorAll("#cmtStars button").forEach((b) => {

        b.addEventListener("click", () => {

          cmtRating = parseInt(b.getAttribute("data-v"));

          document

            .querySelectorAll("#cmtStars button")

            .forEach((bb, i) => bb.classList.toggle("on", i < cmtRating));

        });

      });

      function addComment() {

        const txt = document.getElementById("cmtText").value.trim();

        if (!txt || !cmtRating || !user) {

          toast(t("fillAll"), "tw");

          return;

        }

        comments.unshift({

          name: user.name,

          text: txt,

          rating: cmtRating,

          date: "Hozirgina",

          avatar: user.name[0].toUpperCase(),

        });

        save();

        renderComments();

        document.getElementById("cmtText").value = "";

        cmtRating = 0;

        toast(t("cmtOk"), "ts");

      }



      /* Buyurtmalar */

      function renderOrders() {

        const el = document.getElementById("orderList");

        el.innerHTML = ORDERS_DATA.map(

          (o) =>

            `<div class="order-card"><div class="order-head"><span class="order-id">${o.id}</span><span class="order-status ${o.status}">${o.statusText}</span></div><div class="order-items">${o.items.map((i) => `<span class="order-item-tag">${i}</span>`).join("")}</div><div class="order-foot"><span class="order-date">${o.date}</span><span class="order-total">${o.total.toLocaleString()} so'm</span></div></div>`,

        ).join("");

      }



      /* Sozlamalar */

      function clearCache() {

        localStorage.clear();

        cart = [];

        wishes = [];

        votes = {};

        comments = [...COMMENTS_DATA];

        toast(t("cacheOk"), "ts");

        updateNav();

      }



      /* Karusel */

      function buildCarousel() {

        const carouselFoods = FOODS.slice(0, 8);

        const count = carouselFoods.length;

        const radius = 290;

        

        document.getElementById("cScene").innerHTML = carouselFoods

          .map((f, i) => {

            const angle = (360 / count) * i;

            return `<div class="cci" style="transform: rotateY(${angle}deg) translateZ(${radius}px);">

              <img src="${f.img}" alt="${f.name}"/>

              <div class="cci-i">

                <h4>${f.name}</h4>

                <span>${f.price.toLocaleString()} so'm</span>

              </div>

            </div>`;

          })

          .join("");

      }



      /* Responsive nav */

      function checkMobile() {

        document

          .getElementById("bNav")

          .classList.toggle("show", window.innerWidth <= 960);

      }

      window.addEventListener("resize", checkMobile);



      /* Parallax blob */

      document.getElementById("lp").addEventListener("mousemove", (e) => {

        const r = e.currentTarget.getBoundingClientRect();

        const x = (e.clientX - r.left) / r.width - 0.5;

        const y = (e.clientY - r.top) / r.height - 0.5;

        document.querySelectorAll(".blob").forEach((b, i) => {

          b.style.transform = `translate(${x * (i + 1) * 15}px,${y * (i + 1) * 15}px)`;

        });

      });



      /* Init */

      buildLangMenu();

      buildCarousel();

      applyI18n();

      checkMobile();

      updateNav();

      // Auto-detect and sync Supabase session
      async function initAuthSync() {
        if (!supabaseClient) return;
        try {
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (session && session.user) {
            let { data: profile } = await supabaseClient
              .from('profiles')
              .select('role, full_name, phone')
              .eq('id', session.user.id)
              .single();

            const meta = session.user.user_metadata || {};
            
            user = {
              name: profile?.full_name || meta.full_name || "Foydalanuvchi",
              email: session.user.email,
              phone: profile?.phone || meta.phone || "",
              address: "",
              joined: new Date(session.user.created_at).toLocaleDateString("uz"),
              role: profile?.role || meta.role || "mijoz"
            };

            localStorage.setItem("tn_user", JSON.stringify(user));
            
            const prBtn = document.getElementById("prBtn");
            if (prBtn) prBtn.style.display = "flex";
            
            const params = new URLSearchParams(window.location.search);
            const screenParam = params.get('screen');
            if (screenParam === 'orders') {
                go('pgOrders');
            } else if (screenParam === 'settings') {
                go('pgSettings');
            } else {
                go('pgProfile');
            }
          } else {
            user = null;
            localStorage.removeItem("tn_user");
            const prBtn = document.getElementById("prBtn");
            if (prBtn) prBtn.style.display = "none";
            go("pgLogin");
          }
        } catch (err) {
          console.error("Session sync failed:", err);
        }
      }

      initAuthSync();

      // Parse role query parameter (mijoz or oshpaz) to set default role tab
      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role');
      if (roleParam === 'mijoz' || roleParam === 'oshpaz') {
          if (typeof window.setRole === 'function') {
              window.setRole(roleParam);
          }
      }