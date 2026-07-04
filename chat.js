const mockDatabase = {
  ahmad: {
    name: "Chef Ahmad",
    avatarClass: "ahmad-img",
    role: "Bosh Oshpaz • Qozon Palov",
    status: "Sizning buyurtmangiz tayyorlanmoqda",
    suggestions: [
      "Osh ajoyib chiqibdi!",
      "Kuryer qachon keladi?",
      "Rahmat, qo'lingiz dard ko'rmasin!",
    ],
    chatHistory: [
      {
        type: "alert",
        title: "Tayyorlash jarayoni boshlandi",
        body: "Chef Ahmad siz tanlagan maxsus masalliqlar bilan taomni tayyorlashga kirishdi.",
      },
      {
        type: "incoming",
        msg: "Assalomu alaykum! Buyurtmangiz qabul qilindi. Oshga xohishingizga ko'ra ko'proq achchiq muruch qo'shib, dimlab qo'ydim.",
        time: "15:30",
      },
      {
        type: "outgoing",
        msg: "Vaalaykum assalom! Katta rahmat Ahmad aka, o'zi achchiqroq yaxshi ko'raman.",
        time: "15:32",
      },
    ],
    smartResponses: {
      ajoyib:
        "Yoqimli ishtaha! Biz uchun mijozlarimizning mamnunligi birinchi o'rinda turadi. Keyingi safar ham bundan-da mazali qilib tayyorlab beramiz!",
      qachon:
        "Buyurtma hozirgina kuryerga topshirildi. Issiq holatida 15-20 daqiqa atrofida manzilingizga yetib boradi. Xaritada kuzatib borishingiz mumkin.",
      rahmat:
        "Sizga ham ishonch bildirishganingiz uchun rahmat! Salomat bo'ling, har doim xizmatingizdamiz.",
    },
  },
  nilufar: {
    name: "Nilufar Opa",
    avatarClass: "nilufar-img",
    role: "Doimiy Mijoz",
    status: "Buyurtma muvaffaqiyatli topshirildi",
    suggestions: [
      "Ertaga yana buyurtma beramiz",
      "Manti ham bormi?",
      "Sifat zo'r!",
    ],
    chatHistory: [
      {
        type: "incoming",
        msg: "Salom, bugungi somsa va manti buyurtmalari vaqtida yetib keldi. Oilamiz bilan juda mamnun bo'ldik!",
        time: "Kecha, 18:10",
      },
      {
        type: "outgoing",
        msg: "Yoqimli ishtaha, Nilufar opa! Har doim eng yangi va sifatli mahsulotlardan foydalanamiz.",
        time: "Kecha, 18:15",
      },
    ],
    smartResponses: {
      ertaga:
        "Albatta, ertangi menyu uchun buyurtmani hozirdan shakllantirib qo'ysangiz, o'z vaqtida issiqina yetkaziladi.",
      manti:
        "Ha, menyuyimizda go'shtli, qovoqli va dumi solingan oliy nav manti turlari mavljud. Istalgan vaqtda buyurtma berishingiz mumkin.",
      sifat:
        "Rahmat! Biz taomlarimiz tozaligi va sifatiga 100% kafolat beramiz.",
    },
  },
  mahmud: {
    name: "Mahmud Amaki",
    avatarClass: "mahmud-img",
    role: "VIP Mijoz",
    status: "Yangi so'rov",
    suggestions: ["Joy band qilish", "Menyuni ko'rish"],
    chatHistory: [
      {
        type: "incoming",
        msg: "Ertaga kechki payt 5 kishilik joy bormi? Oilaviy o'tirmoqchi edik.",
        time: "12 Iyun",
      },
    ],
    smartResponses: {
      joy: "Assalomu alaykum, Mahmud amaki! Albatta, ertaga soat nechchiga va qaysi zalga (VIP yoki umumiy) joy bron qilib qo'yay?",
      menyu:
        "Ertangi maxsus menyuda: Shashlik, Tandir kabob va To'y oshi bo'ladi. Tanlovingizni aytsangiz, oldindan tayyorlab qo'yamiz.",
    },
  },
};

let currentUserId = "ahmad";

const messagesBox = document.getElementById("messagesBox");
const dynamicHeader = document.getElementById("dynamicHeader");
const suggestionsPanel = document.getElementById("suggestionsPanel");
const chatInputField = document.getElementById("chatInputField");

function loadChatWorkspace(userId) {
  currentUserId = userId;
  const user = mockDatabase[userId];

  dynamicHeader.innerHTML = `
        <div class="active-user-meta" style="display: flex; align-items: center; gap: 10px;">
            <button onclick="window.history.back()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: inherit; display: flex; align-items: center; justify-content: center; padding: 5px;">←</button>
            <div class="avatar-ring online">
                <div class="user-avatar ${user.avatarClass}"></div>
            </div>
            <div class="meta-info">
                <h3>${user.name}</h3>
                <p>${user.role}</p>
            </div>
        </div>
        <div class="header-action-group">
            <div class="status-capsule">${user.status}</div>
            <button class="header-icon">📞</button>
            <button class="header-icon">⋮</button>
        </div>
    `;

  suggestionsPanel.innerHTML = "";
  user.suggestions.forEach((text) => {
    const pill = document.createElement("button");
    pill.classList.add("suggestion-pill");
    pill.innerText = text;
    pill.onclick = () => {
      chatInputField.value = text;
      handleMessageSubmit();
    };
    suggestionsPanel.appendChild(pill);
  });

  renderChatMessages();
}

function renderChatMessages() {
  messagesBox.innerHTML =
    '<div class="timeline-center"><span>Bugun</span></div>';
  const currentHistory = mockDatabase[currentUserId].chatHistory;

  currentHistory.forEach((item) => {
    if (item.type === "alert") {
      messagesBox.innerHTML += `
                <div class="luxury-alert">
                    <div class="alert-badge-icon">✓</div>
                    <div class="alert-text-node">
                        <h5>${item.title}</h5>
                        <p>${item.body}</p>
                    </div>
                </div>`;
    } else {
      const isOutgoing = item.type === "outgoing";
      const checkIcon = isOutgoing
        ? '<span class="double-check">✓✓</span>'
        : "";
      let content = item.isImg
        ? `<img src="${item.msg}" class="uploaded-media-img">`
        : item.msg;

      const row = document.createElement("div");
      row.classList.add("msg-wrapper", item.type);
      row.innerHTML = `
                <div class="premium-bubble">
                    ${content}
                    <span class="bubble-time">${item.time}${checkIcon}</span>
                </div>`;
      messagesBox.appendChild(row);
    }
  });
  messagesBox.scrollHeight
    ? (messagesBox.scrollTop = messagesBox.scrollHeight)
    : null;
}

function changeActiveChat(userId) {
  document
    .querySelectorAll(".convo-item")
    .forEach((el) => el.classList.remove("active"));
  if (event?.currentTarget) event.currentTarget.classList.add("active");
  loadChatWorkspace(userId);
}

function getClockTime() {
  const time = new Date();
  return (
    time.getHours().toString().padStart(2, "0") +
    ":" +
    time.getMinutes().toString().padStart(2, "0")
  );
}

// AQLLI JAVOB BERISH TIZIMI (YANGILANDI)
function handleMessageSubmit() {
  const rawText = chatInputField.value.trim();
  if (!rawText) return;

  saveMessageToDatabase(rawText, "outgoing", false);
  chatInputField.value = "";

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();

    const userObj = mockDatabase[currentUserId];
    const lowerInput = rawText.toLowerCase();

    let finalizedResponse = `${userObj.name} hozirgina xabaringizni ko'rdi, tez orada shaxsan javob beradi!`;
    let found = false;

    Object.keys(userObj.smartResponses).forEach((keyword) => {
      if (lowerInput.includes(keyword)) {
        finalizedResponse = userObj.smartResponses[keyword];
        found = true;
      }
    });

    // Agar foydalanuvchi "lavash" yoki bazada yo'q boshqa taomlarni so'rasa:
    if (
      !found &&
      (lowerInput.includes("lavash") ||
        lowerInput.includes("ovqat") ||
        lowerInput.includes("taom") ||
        lowerInput.includes("shashlik"))
    ) {
      finalizedResponse = `Hozirda menyuyimizda aynan shu taom tugab qolgan edi, lekin siz uchun maxsus buyurtma asosida oshpazimiz tayyorlab bera oladilar! 😊`;
    }

    saveMessageToDatabase(finalizedResponse, "incoming", false);
  }, 1500);
}

function saveMessageToDatabase(payload, direction, isImg) {
  mockDatabase[currentUserId].chatHistory.push({
    type: direction,
    msg: payload,
    time: getClockTime(),
    isImg: isImg,
  });

  const previewEl = document.getElementById(`side-preview-${currentUserId}`);
  if (previewEl) {
    previewEl.innerText = isImg ? "📷 Rasm yuborildi" : payload;
  }

  renderChatMessages();
}

function showTypingIndicator() {
  const indRow = document.createElement("div");
  indRow.classList.add("msg-wrapper", "incoming");
  indRow.id = "typingIndicatorNode";
  indRow.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>`;
  messagesBox.appendChild(indRow);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function removeTypingIndicator() {
  const node = document.getElementById("typingIndicatorNode");
  if (node) node.remove();
}

function mediaUploadHandler(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      saveMessageToDatabase(e.target.result, "outgoing", true);
    };
    reader.readAsDataURL(file);
  }
}

function handleInputKey(e) {
  if (e.key === "Enter") handleMessageSubmit();
}

// EMOJI PANEL FUNKSIYALARI
function toggleEmojiPicker(event) {
  event.stopPropagation();
  const picker = document.getElementById("customEmojiPicker");
  picker.classList.toggle("show");
}

function insertEmoji(emoji) {
  const inputField = document.getElementById("chatInputField");
  inputField.value += emoji;
  inputField.focus();
}

document.addEventListener("click", function (event) {
  const picker = document.getElementById("customEmojiPicker");
  const toggleBtn = document.getElementById("emojiToggleBtn");

  if (picker && !picker.contains(event.target) && event.target !== toggleBtn) {
    picker.classList.remove("show");
  }
});

function bootChatFromParams() {
  const params = new URLSearchParams(window.location.search);
  const customer = params.get("customer");
  const order = params.get("order");

  if (!customer && !order) {
    loadChatWorkspace("ahmad");
    return;
  }

  const id = `order-${(order || customer || "new").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  mockDatabase[id] = {
    name: customer || "Yangi mijoz",
    avatarClass: "mahmud-img",
    role: order ? `Buyurtma ${order}` : "Buyurtma bo'yicha suhbat",
    status: "Buyurtma konteksti ochildi",
    suggestions: ["Buyurtmangiz tayyorlanmoqda", "Yetkazish vaqtini aniqlayman", "Rahmat!"],
    chatHistory: [
      {
        type: "alert",
        title: "Buyurtma chatga ulandi",
        body: order
          ? `${order} raqamli buyurtma bo'yicha suhbat ochildi.`
          : "Mijoz bilan suhbat ochildi.",
      },
    ],
    smartResponses: {
      tayyor: "Buyurtmangiz tayyorlanish jarayonida. Tayyor bo'lishi bilan darhol xabar beramiz.",
      yetkazish: "Yetkazish vaqtini tekshiryapman, odatda 15-20 daqiqa ichida manzilga yetib boradi.",
      rahmat: "Sizga ham rahmat! Yoqimli ishtaha.",
    },
  };

  const list = document.querySelector(".conversation-list");
  if (list) {
    const item = document.createElement("div");
    item.className = "convo-item active";
    item.onclick = () => changeActiveChat(id);
    item.innerHTML = `
      <div class="avatar-ring online">
        <div class="user-avatar mahmud-img"></div>
      </div>
      <div class="convo-details">
        <div class="convo-meta">
          <h4>${mockDatabase[id].name}</h4>
          <span class="time-stamp">Hozir</span>
        </div>
        <p class="preview-text" id="side-preview-${id}">${mockDatabase[id].role}</p>
        <div class="tag-row"><span class="badge-status priority">Buyurtma chat</span></div>
      </div>
    `;
    list.prepend(item);
    document.querySelectorAll(".convo-item").forEach((el) => {
      if (el !== item) el.classList.remove("active");
    });
  }

  loadChatWorkspace(id);
}

// Start
bootChatFromParams();
