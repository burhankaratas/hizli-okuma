document.addEventListener('DOMContentLoaded', () => {

const settings_body  = document.getElementById("settings");
const exercise_body  = document.getElementById("exercise");

settings_body.style.display = "block";
exercise_body.style.display = "none";

const charCountInput  = document.getElementById("charCountInput");
const flashSpeedInput = document.getElementById("flashSpeedInput");
const startButton     = document.getElementById("startButton");

const flashArea    = document.getElementById("flashArea");
const flashWords   = document.getElementById("flashWords");
const answerInput  = document.getElementById("answerInput");
const feedbackEl   = document.getElementById("feedback");
const hintEl       = document.getElementById("hint");
const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const charDisplay  = document.getElementById("charDisplay");

let allWords     = [];
let wordsByLen   = {};   // { 3: ["bir","göz",...], 4: ["elma",...], ... }
let currentWords = [];
let flashTimer   = null;

// Durum makinesi:
//   "idle"     → başlamadı
//   "blinking" → kutu yanıp sönüyor
//   "showing"  → kelimeler ekranda
//   "input"    → kullanıcı yazıyor
//   "feedback" → doğru/yanlış gösterildi
let state = "idle";

let correct = 0;
let wrong   = 0;
let total   = 0;
let currentCharCount = 5;  // aktif harf sayısı (otomatik artar)

// ── Türkçe normalize ──────────────────────────────────────────
function normalize(str) {
    return str
        .toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .trim();
}

// ── Veri yükleme & indeksleme ─────────────────────────────────
fetch('/static/data/takistoskop.json')
    .then(r => r.json())
    .then(data => {
        allWords = data;
        // Kelimeleri harf sayısına göre grupla
        allWords.forEach(w => {
            const len = w.replace(/\s/g, '').length;
            if (!wordsByLen[len]) wordsByLen[len] = [];
            wordsByLen[len].push(w);
        });
    })
    .catch(() => {
        allWords = ["elma","masa","kitap","yıldız","bulut","at","el","bir","göz"];
        allWords.forEach(w => {
            const len = w.replace(/\s/g, '').length;
            if (!wordsByLen[len]) wordsByLen[len] = [];
            wordsByLen[len].push(w);
        });
    });

// ── Harf sayısına göre kelime kombinasyonu seç ────────────────
// Hedef: boşluklar hariç toplam karakter sayısı === target
// Strateji: mümkün olduğunca az kelimeyle tam hedefi bul.
// Bulamazsa ±1 toleransla dener, o da olmazsa en yakını alır.
function pickWordsForCharCount(target) {
    // Tek kelimeyle tam eşleşme
    if (wordsByLen[target] && wordsByLen[target].length > 0) {
        return [randomFrom(wordsByLen[target])];
    }

    // İki kelimeyle tam eşleşme: a + b = target
    const availLens = Object.keys(wordsByLen).map(Number).filter(n => n < target);
    shuffleArr(availLens);
    for (const a of availLens) {
        const b = target - a;
        if (wordsByLen[b] && wordsByLen[b].length > 0) {
            const w1 = randomFrom(wordsByLen[a]);
            const pool2 = wordsByLen[b].filter(w => w !== w1);
            const w2 = randomFrom(pool2.length > 0 ? pool2 : wordsByLen[b]);
            return [w1, w2];
        }
    }

    // Üç kelimeyle tam eşleşme
    for (const a of availLens) {
        const rem = target - a;
        const bLens = Object.keys(wordsByLen).map(Number).filter(n => n < rem);
        for (const b of bLens) {
            const c = rem - b;
            if (wordsByLen[c] && wordsByLen[c].length > 0) {
                return [
                    randomFrom(wordsByLen[a]),
                    randomFrom(wordsByLen[b]),
                    randomFrom(wordsByLen[c])
                ];
            }
        }
    }

    // Tam bulunamazsa: mevcut en yakın uzunluktaki tek kelime
    const allLens = Object.keys(wordsByLen).map(Number);
    allLens.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    return [randomFrom(wordsByLen[allLens[0]])];
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// ── Başlat ────────────────────────────────────────────────────
startButton.addEventListener("click", () => {
    const cc = Math.min(Math.max(parseInt(charCountInput.value) || 5, 1), 30);
    charCountInput.value = cc;
    currentCharCount = cc;

    settings_body.style.display = "none";
    exercise_body.style.display = "block";

    correct = 0; wrong = 0; total = 0;
    updateStats();

    startRound();
});

// ── Enter document seviyesinde ────────────────────────────────
document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    if (state === "input") {
        e.preventDefault();
        checkAnswer();
    } else if (state === "feedback") {
        e.preventDefault();
        startRound();
    }
});

// ── Yeni tur ──────────────────────────────────────────────────
function startRound() {
    state = "blinking";

    answerInput.value      = "";
    answerInput.readOnly   = true;
    feedbackEl.textContent = "";
    feedbackEl.className   = "fw-bold fs-5";
    hintEl.textContent     = "";
    flashWords.textContent = "";
    flashArea.classList.remove("showing", "blink-warn");

    // Harf sayısına göre kelimeler seç
    const target = currentCharCount;
    currentWords = pickWordsForCharCount(target);

    // 3 kez yanıp sön → kelimeyi göster
    const blinkTimes = [0, 100, 200, 300, 400, 500];
    blinkTimes.forEach((t, i) => {
        setTimeout(() => {
            if (i % 2 === 0) flashArea.classList.add("blink-warn");
            else             flashArea.classList.remove("blink-warn");
        }, t);
    });

    setTimeout(() => {
        flashArea.classList.remove("blink-warn");
        flashArea.classList.add("showing");
        flashWords.textContent = currentWords.join("  ");
        fitFontSize();
        state = "showing";

        const flashMs = parseInt(flashSpeedInput.value) || 800;
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(() => hideWords(), flashMs);

    }, 600);
}

// ── Font boyutunu kutuya sığdır ───────────────────────────────
function fitFontSize() {
    const maxPx  = 90;
    const minPx  = 18;
    const pad    = 48;
    const availW = flashArea.clientWidth - pad;

    let size = maxPx;
    flashWords.style.fontSize  = size + "px";
    flashWords.style.whiteSpace = "nowrap";

    while (flashWords.scrollWidth > availW && size > minPx) {
        size -= 2;
        flashWords.style.fontSize = size + "px";
    }
}

// ── Kelimeleri gizle ──────────────────────────────────────────
function hideWords() {
    flashWords.textContent = "";
    flashArea.classList.remove("showing", "blink-warn");
    state = "input";
    answerInput.readOnly = false;
    answerInput.focus();
}

// ── Cevap kontrolü ────────────────────────────────────────────
function checkAnswer() {
    if (state !== "input") return;
    if (flashTimer) clearTimeout(flashTimer);
    hideWords();

    state = "feedback";
    answerInput.readOnly = true;

    const userInput  = answerInput.value.trim().split(/\s+/).map(normalize);
    const correctArr = currentWords.map(normalize);
    const isCorrect  = arraysEqual(userInput, correctArr);

    total++;
    if (isCorrect) {
        correct++;
        feedbackEl.textContent = "Doğru ✔";
        feedbackEl.className   = "fw-bold fs-5 text-success";

        // Her 6 doğruda harf sayısını 1 artır (maks 30)
        if (correct % 6 === 0 && currentCharCount < 30) {
            currentCharCount++;
        }
    } else {
        wrong++;
        feedbackEl.textContent = "Yanlış ✖";
        feedbackEl.className   = "fw-bold fs-5 text-danger";
        hintEl.textContent     = "Doğru: " + currentWords.join("  ");
    }

    updateStats();
}

// ── Yardımcılar ───────────────────────────────────────────────
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

function updateStats() {
    correctCount.textContent = correct;
    wrongCount.textContent   = wrong;
    totalCount.textContent   = total;
    charDisplay.textContent  = currentCharCount;
}

});
