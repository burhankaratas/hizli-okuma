document.addEventListener('DOMContentLoaded', () => {

const settings_body = document.getElementById("settings");
const exercise_body = document.getElementById("exercise");
const finish_body   = document.getElementById("finish");

settings_body.style.display = "block";
exercise_body.style.display = "none";
finish_body.style.display   = "none";

const speedSelect   = document.getElementById("speedSelect");
const durationInput = document.getElementById("durationInput");
const opSelect      = document.getElementById("opSelect");
const startButton   = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const timeLeftEl   = document.getElementById("timeLeft");

const exprLeftEl  = document.getElementById("exprLeft");
const exprRightEl = document.getElementById("exprRight");
const feedback    = document.getElementById("feedback");

const finishCorrect = document.getElementById("finishCorrect");
const finishWrong   = document.getElementById("finishWrong");
const finishTotal   = document.getElementById("finishTotal");
const finishTime    = document.getElementById("finishTime");

let correct = 0;
let wrong   = 0;
let total   = 0;
let speed   = 0;
let answered      = false;
let exerciseActive = false;
let remainingSeconds = 0;
let currentBiggest   = null;
let selectedOp       = "mix";

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

function buildExpression(mode) {
    const op = pickOp(mode);
    const a  = getRandomInt(0, 9);
    const b  = getRandomInt(0, 9);
    let result;
    if (op === "+") result = a + b;
    else if (op === "-") result = a - b;
    else result = a * b;
    return { text: `${a} ${op} ${b}`, result };
}

function buildQuestion(mode) {
    while (true) {
        const left  = buildExpression(mode);
        const right = buildExpression(mode);
        if (left.result === right.result) continue;
        return {
            leftText:  left.text,
            rightText: right.text,
            biggest:   left.result > right.result ? "left" : "right"
        };
    }
}

function start() {
    speed      = Number(speedSelect.value);
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

    showNextQuestion();
}

function showNextQuestion() {
    if (!exerciseActive) return;
    if (responseTimer) clearTimeout(responseTimer);

    answered = false;
    const q  = buildQuestion(selectedOp);
    currentBiggest = q.biggest;

    exprLeftEl.textContent  = q.leftText;
    exprRightEl.textContent = q.rightText;

    restartFlash(exprLeftEl);
    restartFlash(exprRightEl);

    feedback.textContent = "";
    feedback.classList.add("d-none");

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

document.addEventListener("keydown", (event) => {
    if (!exerciseActive || answered || currentBiggest === null) return;
    if (event.key === "ArrowRight") checkAnswer("right");
    else if (event.key === "ArrowLeft")  checkAnswer("left");
});

function checkAnswer(direction) {
    answered = true;
    if (responseTimer) clearTimeout(responseTimer);
    feedback.classList.remove("d-none");

    if (currentBiggest === direction) {
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
    if (exerciseTimer) clearTimeout(exerciseTimer);
    if (responseTimer) clearTimeout(responseTimer);
    if (countdownInterval) clearInterval(countdownInterval);

    finishCorrect.textContent = correct;
    finishWrong.textContent   = wrong;
    finishTotal.textContent   = total;
    finishTime.textContent    = Number(durationInput.value);

    exercise_body.style.display = "none";
    finish_body.style.display   = "flex";
    currentBiggest = null;
}

});
