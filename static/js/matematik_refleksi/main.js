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
const startButton   = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const timeLeftEl   = document.getElementById("timeLeft");

const expressionEl = document.getElementById("expression");
const feedback     = document.getElementById("feedback");

const finishCorrect = document.getElementById("finishCorrect");
const finishWrong   = document.getElementById("finishWrong");
const finishTotal   = document.getElementById("finishTotal");
const finishTime    = document.getElementById("finishTime");

let correct = 0;
let wrong   = 0;
let total   = 0;

let speed    = 0;
let answered = false;

let responseTimer     = null;
let exerciseTimer     = null;
let countdownInterval = null;
let exerciseActive    = false;
let remainingSeconds  = 0;

let currentAnswerIsEven = null;

const operators = ["+", "-", "*"];

startButton.addEventListener("click", start);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function start() {
    speed = Number(speedSelect.value);
    const durationSeconds = Number(durationInput.value);
    const maxValue = Number(rangeSelect.value);

    settings_body.style.display = "none";
    exercise_body.style.display = "block";
    finish_body.style.display   = "none";

    startExercise(durationSeconds, maxValue);
}

function startExercise(durationSeconds, maxValue) {
    correct = 0;
    wrong   = 0;
    total   = 0;
    updateStats();

    exerciseActive = true;
    remainingSeconds = durationSeconds;
    timeLeftEl.textContent = remainingSeconds;

    // GÖRSEL GERİ SAYIM
    countdownInterval = setInterval(() => {
        if (!exerciseActive) return;

        remainingSeconds--;
        timeLeftEl.textContent = remainingSeconds;

        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);

    // ANA SÜRE 
    exerciseTimer = setTimeout(() => {
        finishExercise();
    }, durationSeconds * 1000);

    showNextQuestion(maxValue);
}

function buildQuestion(maxValue) {
    const op = operators[getRandomInt(0, operators.length - 1)];
    let a = getRandomInt(0, maxValue);
    let b = getRandomInt(0, maxValue);

    if (op === "-" && b > a) {
        [a, b] = [b, a];
    }

    let result = 0;
    if (op === "+") result = a + b;
    if (op === "-") result = a - b;
    if (op === "*") result = a * b;

    const displayOp = op === "*" ? "x" : op;
    return {
        text: `${a} ${displayOp} ${b}`,
        isEven: result % 2 === 0
    };
}

function showNextQuestion(maxValue) {
    if (!exerciseActive) return;

    if (responseTimer) clearTimeout(responseTimer);

    answered = false;
    const question = buildQuestion(maxValue);
    currentAnswerIsEven = question.isEven;

    expressionEl.textContent = question.text;

    feedback.textContent = "";
    feedback.classList.add("d-none");

    responseTimer = setTimeout(() => {
        if (!answered && exerciseActive) {
            handleTimeout(maxValue);
        }
    }, speed);
}

function handleTimeout(maxValue) {
    answered = true;
    wrong++;

    feedback.textContent = "Süre Doldu ✖";
    feedback.className   = "position-absolute text-warning fs-5 fw-bold";
    feedback.classList.remove("d-none");

    updateStats();

    setTimeout(() => {
        nextQuestion(maxValue);
    }, 400);
}

document.addEventListener("keydown", (event) => {
    if (!exerciseActive || answered || currentAnswerIsEven === null) return;

    if (event.key === "ArrowRight") {
        checkAnswer(true);
    } else if (event.key === "ArrowLeft") {
        checkAnswer(false);
    }
});

function checkAnswer(answerIsEven) {
    answered = true;
    if (responseTimer) clearTimeout(responseTimer);

    feedback.classList.remove("d-none");

    if (currentAnswerIsEven === answerIsEven) {
        correct++;
        feedback.textContent = "Doğru ✔";
        feedback.className   = "position-absolute text-success fs-5 fw-bold";
    } else {
        wrong++;
        feedback.textContent = "Yanlış ✖";
        feedback.className   = "position-absolute text-danger fs-5 fw-bold";
    }

    updateStats();

    setTimeout(() => {
        nextQuestion(Number(rangeSelect.value));
    }, 400);
}

function nextQuestion(maxValue) {
    if (!exerciseActive) return;
    showNextQuestion(maxValue);
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

    // FINISH İSTATİSTİKLERİ
    finishCorrect.textContent = correct;
    finishWrong.textContent   = wrong;
    finishTotal.textContent   = total;
    finishTime.textContent    = Number(durationInput.value);

    exercise_body.style.display = "none";
    finish_body.style.display   = "flex";

    currentAnswerIsEven = null;
}

});
