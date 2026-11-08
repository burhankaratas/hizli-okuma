document.addEventListener('DOMContentLoaded', () => {

const settings_body = document.getElementById("settings");
const exercise_body = document.getElementById("exercise");
const finish_body   = document.getElementById("finish");

settings_body.style.display = "block";
exercise_body.style.display = "none";
finish_body.style.display   = "none";

const speedSelect   = document.getElementById("speedSelect");
const durationInput = document.getElementById("durationInput");
const rangeSelect   = document.getElementById("rangeSelect");
const opSelect      = document.getElementById("opSelect");
const startButton   = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const timeLeftEl   = document.getElementById("timeLeft");

const leftSideEl  = document.getElementById("leftSide");
const rightSideEl = document.getElementById("rightSide");
const feedback    = document.getElementById("feedback");

const finishCorrect = document.getElementById("finishCorrect");
const finishWrong   = document.getElementById("finishWrong");
const finishTotal   = document.getElementById("finishTotal");
const finishTime    = document.getElementById("finishTime");

let correct = 0;
let wrong   = 0;
let total   = 0;
let speed   = 0;

let answered        = false;
let isFirstQuestion = false;
let exerciseActive  = false;
let remainingSeconds = 0;

let prevActual    = 0;
let currentActual = 0;
let selectedOp    = "mix";
let maxVal        = 10;

let responseTimer     = null;
let exerciseTimer     = null;
let countdownInterval = null;

startButton.addEventListener("click", start);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOp(mode) {
    if (mode !== "mix") return mode;
    const ops = ["+", "-", "×"];
    return ops[getRandomInt(0, 2)];
}

function computeResult(a, op, b) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    return a * b;
}

function buildEquation() {
    const op = pickOp(selectedOp);
    let a = getRandomInt(0, maxVal);
    let b = getRandomInt(0, maxVal);
    if (op === "-" && b > a) [a, b] = [b, a];
    const result = computeResult(a, op, b);
    return { a, op, b, result, text: `${a} ${op} ${b}` };
}

function start() {
    speed      = Number(speedSelect.value);
    maxVal     = Number(rangeSelect.value);
    selectedOp = opSelect.value;
    const durationSeconds = Number(durationInput.value);

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

    exerciseTimer = setTimeout(() => {
        finishExercise();
    }, durationSeconds * 1000);

    showFirstEquation();
}

function showFirstEquation() {
    if (!exerciseActive) return;

    const eq = buildEquation();
    prevActual = eq.result;

    leftSideEl.textContent  = eq.text;
    rightSideEl.textContent = `= ${eq.result}`;
    rightSideEl.style.color = "#94a3b8";

    feedback.textContent = "Başlangıç";
    feedback.className   = "position-absolute text-muted fs-5 fw-semibold";
    feedback.classList.remove("d-none");

    isFirstQuestion = true;
    answered = true;

    responseTimer = setTimeout(() => {
        if (exerciseActive) showNextQuestion();
    }, speed);
}

function showNextQuestion() {
    if (!exerciseActive) return;
    if (responseTimer) clearTimeout(responseTimer);

    const eq = buildEquation();
    currentActual = eq.result;

    leftSideEl.textContent  = eq.text;
    rightSideEl.textContent = `= ${prevActual}`;
    rightSideEl.style.color = "#fbbf24";

    feedback.textContent = "";
    feedback.classList.add("d-none");

    isFirstQuestion = false;
    answered = false;

    responseTimer = setTimeout(() => {
        if (!answered && exerciseActive) handleTimeout();
    }, speed);
}

function handleTimeout() {
    answered = true;
    wrong++;
    feedback.textContent = "Süre Doldu ✖";
    feedback.className   = "position-absolute text-warning fs-5 fw-bold";
    feedback.classList.remove("d-none");
    updateStats();
    prevActual = currentActual;
    setTimeout(() => { if (exerciseActive) showNextQuestion(); }, 400);
}

document.addEventListener("keydown", (event) => {
    if (!exerciseActive || isFirstQuestion || answered) return;

    if (event.key === "ArrowRight") checkAnswer(true);
    else if (event.key === "ArrowLeft")  checkAnswer(false);
});

function checkAnswer(userSaysCorrect) {
    answered = true;
    if (responseTimer) clearTimeout(responseTimer);
    feedback.classList.remove("d-none");

    const isCorrect = (currentActual === prevActual);

    if (userSaysCorrect === isCorrect) {
        correct++;
        feedback.textContent = "Doğru ✔";
        feedback.className   = "position-absolute text-success fs-5 fw-bold";
    } else {
        wrong++;
        feedback.textContent = "Yanlış ✖";
        feedback.className   = "position-absolute text-danger fs-5 fw-bold";
    }

    updateStats();
    prevActual = currentActual;

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
    if (exerciseTimer) clearTimeout(exerciseTimer);
    if (responseTimer) clearTimeout(responseTimer);
    if (countdownInterval) clearInterval(countdownInterval);

    finishCorrect.textContent = correct;
    finishWrong.textContent   = wrong;
    finishTotal.textContent   = total;
    finishTime.textContent    = Number(durationInput.value);

    exercise_body.style.display = "none";
    finish_body.style.display   = "flex";
}

});
