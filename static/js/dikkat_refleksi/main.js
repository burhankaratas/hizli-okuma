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
const centerToggle  = document.getElementById("centerToggle");
const startButton   = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const timeLeftEl   = document.getElementById("timeLeft");

const numberLeftEl  = document.getElementById("numberLeft");
const numberCenterEl = document.getElementById("numberCenter");
const numberRightEl = document.getElementById("numberRight");
const centerHint = document.getElementById("centerHint");
const feedback      = document.getElementById("feedback");

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

let currentBiggestDirection = null;

startButton.addEventListener("click", start);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function start() {
    speed = Number(speedSelect.value);
    const durationSeconds = Number(durationInput.value);
    const digitCount = Number(rangeSelect.value);
    const showCenter = centerToggle.checked;

    settings_body.style.display = "none";
    exercise_body.style.display = "block";
    finish_body.style.display   = "none";

    if (centerHint) {
        centerHint.style.display = showCenter ? "inline" : "none";
    }

    startExercise(durationSeconds, digitCount, showCenter);
}

function startExercise(durationSeconds, digitCount, showCenter) {
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

    showNextQuestion(digitCount, showCenter);
}

function getRangeForDigits(digitCount) {
    if (digitCount === 1) return { minValue: 0, maxValue: 9 };
    if (digitCount === 2) return { minValue: 10, maxValue: 99 };
    if (digitCount === 3) return { minValue: 100, maxValue: 999 };
    return { minValue: 1000, maxValue: 9999 };
}

function buildQuestion(digitCount, showCenter) {
    const { minValue, maxValue } = getRangeForDigits(digitCount);
    let left = 0;
    let center = 0;
    let right = 0;

    while (true) {
        left = getRandomInt(minValue, maxValue);
        right = getRandomInt(minValue, maxValue);

        if (!showCenter) {
            if (left === right) continue;
            if (left > right) return { left, center: null, right, biggest: "left" };
            if (right > left) return { left, center: null, right, biggest: "right" };
        }

        center = getRandomInt(minValue, maxValue);

        const allDistinct = left !== center && left !== right && center !== right;
        if (!allDistinct) continue;

        if (left > center && left > right) {
            return { left, center, right, biggest: "left" };
        }
        if (center > left && center > right) {
            return { left, center, right, biggest: "up" };
        }
        if (right > left && right > center) {
            return { left, center, right, biggest: "right" };
        }
    }
}

function showNextQuestion(digitCount, showCenter) {
    if (!exerciseActive) return;

    if (responseTimer) clearTimeout(responseTimer);

    answered = false;
    const question = buildQuestion(digitCount, showCenter);
    currentBiggestDirection = question.biggest;

    numberLeftEl.textContent = question.left;
    if (showCenter) {
        numberCenterEl.textContent = question.center;
        numberCenterEl.style.display = "block";
        restartFlash(numberCenterEl);
    } else {
        numberCenterEl.textContent = "";
        numberCenterEl.style.display = "none";
    }
    numberRightEl.textContent = question.right;
    restartFlash(numberLeftEl);
    restartFlash(numberRightEl);

    feedback.textContent = "";
    feedback.classList.add("d-none");

    responseTimer = setTimeout(() => {
        if (!answered && exerciseActive) {
            handleTimeout(digitCount, showCenter);
        }
    }, speed);
}

function restartFlash(el) {
    el.classList.remove("flash-once");
    void el.offsetWidth;
    el.classList.add("flash-once");
}

function handleTimeout(digitCount, showCenter) {
    answered = true;
    wrong++;

    feedback.textContent = "Süre Doldu ✖";
    feedback.className   = "position-absolute text-warning fs-5 fw-bold";
    feedback.classList.remove("d-none");

    updateStats();

    setTimeout(() => {
        nextQuestion(digitCount, showCenter);
    }, 400);
}

document.addEventListener("keydown", (event) => {
    if (!exerciseActive || answered || currentBiggestDirection === null) return;

    if (event.key === "ArrowRight") {
        checkAnswer("right");
    } else if (event.key === "ArrowLeft") {
        checkAnswer("left");
    } else if (event.key === "ArrowUp" && centerToggle.checked) {
        checkAnswer("up");
    }
});

function checkAnswer(answerDirection) {
    answered = true;
    if (responseTimer) clearTimeout(responseTimer);

    feedback.classList.remove("d-none");

    if (currentBiggestDirection === answerDirection) {
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
        nextQuestion(Number(rangeSelect.value), centerToggle.checked);
    }, 400);
}

function nextQuestion(digitCount, showCenter) {
    if (!exerciseActive) return;
    showNextQuestion(digitCount, showCenter);
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

    currentBiggestDirection = null;
}

});
