document.addEventListener('DOMContentLoaded', () => {

const settings_body = document.getElementById("settings");
const exercise_body = document.getElementById("exercise");
const finish_body   = document.getElementById("finish");

settings_body.style.display = "block";
exercise_body.style.display = "none";
finish_body.style.display   = "none";

const speedSelect     = document.getElementById("speedSelect");
const durationInput   = document.getElementById("durationInput");
const criterionSelect = document.getElementById("criterionSelect");
const startButton     = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const timeLeftEl   = document.getElementById("timeLeft");
const arrowEl      = document.getElementById("arrowDisplay");
const wordEl       = document.getElementById("wordDisplay");
const feedback     = document.getElementById("feedback");
const criterionLabel = document.getElementById("criterionLabel");

const finishCorrect = document.getElementById("finishCorrect");
const finishWrong   = document.getElementById("finishWrong");
const finishTotal   = document.getElementById("finishTotal");
const finishTime    = document.getElementById("finishTime");

const DIRECTIONS = [
    { key: "up",    arrow: "↑", word: "YUKARI" },
    { key: "down",  arrow: "↓", word: "AŞAĞI"  },
    { key: "left",  arrow: "←", word: "SOL"    },
    { key: "right", arrow: "→", word: "SAĞ"    }
];

let correct = 0, wrong = 0, total = 0;
let speed = 0, criterion = "arrow";
let answered = false, exerciseActive = false;
let remainingSeconds = 0;
let currentCorrectDir = null;

let responseTimer = null, exerciseTimer = null, countdownInterval = null;

startButton.addEventListener("click", start);

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function start() {
    speed     = Number(speedSelect.value);
    criterion = criterionSelect.value;
    const durationSeconds = Number(durationInput.value);

    criterionLabel.textContent = criterion === "arrow" ? "Oka göre" : "Yazıya göre";

    settings_body.style.display = "none";
    exercise_body.style.display = "block";
    finish_body.style.display   = "none";

    startExercise(durationSeconds);
}

function startExercise(durationSeconds) {
    correct = 0; wrong = 0; total = 0;
    updateStats();

    exerciseActive   = true;
    remainingSeconds = durationSeconds;
    timeLeftEl.textContent = remainingSeconds;

    countdownInterval = setInterval(() => {
        if (!exerciseActive) return;
        remainingSeconds--;
        timeLeftEl.textContent = remainingSeconds;
        if (remainingSeconds <= 0) clearInterval(countdownInterval);
    }, 1000);

    exerciseTimer = setTimeout(() => finishExercise(), durationSeconds * 1000);

    showNextQuestion();
}

function showNextQuestion() {
    if (!exerciseActive) return;
    if (responseTimer) clearTimeout(responseTimer);

    answered = false;
    feedback.textContent = "";
    feedback.classList.add("d-none");

    const arrowDir = getRandom(DIRECTIONS);
    const wordDir  = getRandom(DIRECTIONS);

    arrowEl.textContent = arrowDir.arrow;
    wordEl.textContent  = wordDir.word;

    restartFlash(arrowEl);
    restartFlash(wordEl);

    currentCorrectDir = criterion === "arrow" ? arrowDir.key : wordDir.key;

    responseTimer = setTimeout(() => {
        if (!answered && exerciseActive) handleTimeout();
    }, speed);
}

function restartFlash(el) {
    el.classList.remove("flash-once");
    void el.offsetWidth;
    el.classList.add("flash-once");
}

function handleTimeout() {
    answered = true;
    wrong++;
    feedback.textContent = "Süre Doldu ✖";
    feedback.className   = "position-absolute text-warning fs-5 fw-bold";
    feedback.classList.remove("d-none");
    updateStats();
    setTimeout(() => { if (exerciseActive) showNextQuestion(); }, 400);
}

document.addEventListener("keydown", (e) => {
    if (!exerciseActive || answered || currentCorrectDir === null) return;
    const dirMap = {
        "ArrowUp":    "up",
        "ArrowDown":  "down",
        "ArrowLeft":  "left",
        "ArrowRight": "right"
    };
    if (dirMap[e.key]) checkAnswer(dirMap[e.key]);
});

function checkAnswer(dir) {
    answered = true;
    if (responseTimer) clearTimeout(responseTimer);
    feedback.classList.remove("d-none");

    if (dir === currentCorrectDir) {
        correct++;
        feedback.textContent = "Doğru ✔";
        feedback.className   = "position-absolute text-success fs-5 fw-bold";
    } else {
        wrong++;
        feedback.textContent = "Yanlış ✖";
        feedback.className   = "position-absolute text-danger fs-5 fw-bold";
    }

    updateStats();
    setTimeout(() => { if (exerciseActive) showNextQuestion(); }, 400);
}

function updateStats() {
    total = correct + wrong;
    correctCount.textContent = correct;
    wrongCount.textContent   = wrong;
    totalCount.textContent   = total;
}

function finishExercise() {
    exerciseActive = false;
    if (exerciseTimer)     clearTimeout(exerciseTimer);
    if (responseTimer)     clearTimeout(responseTimer);
    if (countdownInterval) clearInterval(countdownInterval);

    finishCorrect.textContent = correct;
    finishWrong.textContent   = wrong;
    finishTotal.textContent   = total;
    finishTime.textContent    = Number(durationInput.value);

    exercise_body.style.display = "none";
    finish_body.style.display   = "flex";
    currentCorrectDir = null;
}

});
