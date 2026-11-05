// Здесь указываем юзернейм менеджера (без @), куда будет уходить заявка
const MANAGER_USERNAME = "Typicaltypeee"; 

const tg = window.Telegram?.WebApp;
if (tg) { 
    tg.ready(); 
    tg.expand(); 
    tg.setHeaderColor("#121212"); 
    tg.setBackgroundColor("#121212"); 
}

// Добавили поле oge
const answers = { name: "", frequency: "", goal: "", oge: "", injuries: "" };

function goToScreen(n) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    // Ищем экран по ID (он может быть как цифрой, так и словом "oge")
    document.getElementById(`screen-${n}`).classList.add("active");
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
    window.scrollTo(0, 0);
}

document.querySelector("#screen-1 [data-next]").addEventListener("click", () => {
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser?.first_name && !answers.name) {
        const input = document.getElementById("input-name");
        input.value = tgUser.first_name;
        answers.name = tgUser.first_name;
        document.getElementById("btn-name-next").disabled = false;
    }
    goToScreen(2);
    setTimeout(() => document.getElementById("input-name").focus(), 300);
});

const inputName = document.getElementById("input-name");
const btnNameNext = document.getElementById("btn-name-next");

inputName.addEventListener("input", () => {
    answers.name = inputName.value.trim();
    btnNameNext.disabled = answers.name.length === 0;
});

btnNameNext.addEventListener("click", () => {
    if (!answers.name) return;
    document.querySelectorAll(".user-name").forEach((el) => (el.textContent = answers.name));
    goToScreen(3);
});

inputName.addEventListener("keydown", (e) => { 
    if (e.key === "Enter" && answers.name) btnNameNext.click(); 
});

document.querySelectorAll(".btn-option").forEach((btn) => {
    btn.addEventListener("click", () => {
        const field = btn.dataset.field;
        answers[field] = btn.dataset.value;
        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        
        // Логика переходов между экранами (добавили oge)
        const nextScreenMap = { 
            frequency: 4, 
            goal: "oge", // После цели идем на ОГЭ
            oge: 5,      // После ОГЭ идем на травмы
            injuries: 6  // После травм идем на результат
        };
        
        const nextScreen = nextScreenMap[field];
        
        if (nextScreen === 6) {
            buildResult();
        }
        goToScreen(nextScreen);
    });
});

function buildApplicationText() {
    return `📝 #successtrain Новая заявка! Имя: ${answers.name}, Частота: ${answers.frequency}, Цель: ${answers.goal}, Подготовка к ОГЭ: ${answers.oge}, Травмы: ${answers.injuries}. Хочу начать тренироваться!`;
}

function buildResult() {
    const card = document.getElementById("result-card");
    card.innerHTML = `
        <div class="result-row"><span class="label">Имя</span><span class="value">${escapeHtml(answers.name)}</span></div>
        <div class="result-row"><span class="label">Частота</span><span class="value">${escapeHtml(answers.frequency)}</span></div>
        <div class="result-row"><span class="label">Цель</span><span class="value">${escapeHtml(answers.goal)}</span></div>
        <div class="result-row"><span class="label">ОГЭ/ЕГЭ</span><span class="value">${escapeHtml(answers.oge)}</span></div>
        <div class="result-row"><span class="label">Травмы</span><span class="value">${escapeHtml(answers.injuries)}</span></div>
    `;
    document.getElementById("result-text").value = buildApplicationText();
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.getElementById("btn-copy").addEventListener("click", async () => {
    const text = document.getElementById("result-text").value;
    try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
        else { const ta = document.getElementById("result-text"); ta.select(); document.execCommand("copy"); }
        showToast("Текст скопирован ✅");
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
    } catch (err) { showToast("Не удалось скопировать ❌"); }
});

document.getElementById("btn-send").addEventListener("click", () => {
    const text = encodeURIComponent(buildApplicationText());
    const url = `https://t.me/${MANAGER_USERNAME}?text=${text}`;
    if (tg) tg.openTelegramLink(url);
    else window.open(url, "_blank");
});

let toastTimer;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
