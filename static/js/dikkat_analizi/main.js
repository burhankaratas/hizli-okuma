document.addEventListener('DOMContentLoaded', () => {

const settings_body = document.getElementById("settings");
const exercise_body = document.getElementById("exercise");
const finish_body   = document.getElementById("finish");

settings_body.style.display = "block";
exercise_body.style.display = "none";
finish_body.style.display   = "none";

const speedSelect   = document.getElementById("speedSelect");
const lengthInput   = document.getElementById("lengthInput");
const roundSelect   = document.getElementById("roundSelect");
const startButton   = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount   = document.getElementById("wrongCount");
const totalCount   = document.getElementById("totalCount");
const roundLeftEl  = document.getElementById("roundLeft");

const sequenceRow  = document.getElementById("sequenceRow");
const questionArea = document.getElementById("questionArea");
const questionText = document.getElementById("questionText");
const answerInput  = document.getElementById("answerInput");
const answerButton = document.getElementById("answerButton");
const answerHelp   = document.getElementById("answerHelp");
const feedback     = document.getElementById("feedback");

const finishCorrect = document.getElementById("finishCorrect");
const finishWrong   = document.getElementById("finishWrong");
const finishTotal   = document.getElementById("finishTotal");
const finishRounds  = document.getElementById("finishRounds");

let correct = 0;
let wrong   = 0;
let total   = 0;

let flashMs = 0;
let sequenceLength = 5;
let sequenceType = "letters";
let sequence = [];

let questions = [];
let currentQuestionIndex = 0;

let exerciseActive = false;
let isFlashing = false;
let roundsTotal = 0;
let roundsCompleted = 0;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const digits  = "0123456789".split("");

startButton.addEventListener("click", start);
answerButton.addEventListener("click", submitAnswer);
answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        submitAnswer();
    }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toUpperCase();
}

function start() {
    flashMs = Number(speedSelect.value);
    sequenceLength = clamp(Number(lengthInput.value), 5, 15);
    roundsTotal = Number(roundSelect.value);

    lengthInput.value = sequenceLength;

    settings_body.style.display = "none";
    exercise_body.style.display = "block";
    finish_body.style.display   = "none";

    startExercise();
}

function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

function startExercise() {
    correct = 0;
    wrong   = 0;
    total   = 0;
    updateStats();

    exerciseActive = true;
    roundsCompleted = 0;
    updateRoundsLeft();

    startRound();
}

function startRound() {
    if (!exerciseActive) return;

    sequenceType = Math.random() < 0.5 ? "letters" : "digits";
    sequence = buildSequence(sequenceType, sequenceLength);
    buildQuestions();
    currentQuestionIndex = 0;

    prepareSequenceSlots(sequenceLength);
    showSequence();
}

function buildSequence(type, length) {
    const pool = type === "letters" ? letters : digits;
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(pool[getRandomInt(0, pool.length - 1)]);
    }
    return arr;
}

function prepareSequenceSlots(length) {
    sequenceRow.innerHTML = "";
    const maxWidth = Math.min(144, Math.floor(1200 / length));
    for (let i = 0; i < length; i++) {
        const slot = document.createElement("div");
        slot.className = "sequence-slot";
        slot.style.width = `${maxWidth}px`;
        slot.style.height = `${Math.max(170, Math.floor(maxWidth * 1.4))}px`;
        slot.style.fontSize = `${Math.max(70, Math.floor(maxWidth * 0.7))}px`;
        sequenceRow.appendChild(slot);
    }
}

function showSequence() {
    isFlashing = true;
    questionArea.style.display = "none";
    feedback.classList.add("d-none");

    const slots = Array.from(sequenceRow.children);
    let index = 0;

    const onMs = Math.floor(flashMs * 0.6);
    const offMs = Math.max(60, flashMs - onMs);

    function flashNext() {
        if (!exerciseActive) return;

        if (index > 0) {
            slots[index - 1].classList.remove("active");
            slots[index - 1].textContent = "";
        }

        if (index >= sequence.length) {
            isFlashing = false;
            showQuestion();
            return;
        }

        slots[index].textContent = sequence[index];
        slots[index].classList.add("active");

        setTimeout(() => {
            slots[index].classList.remove("active");
            slots[index].textContent = "";
            index += 1;
            setTimeout(flashNext, offMs);
        }, onMs);
    }

    flashNext();
}

function buildQuestions() {
    const length = sequence.length;
    const index = getRandomInt(1, length);
    const targetChar = sequenceType === "letters"
        ? letters[getRandomInt(0, letters.length - 1)]
        : digits[getRandomInt(0, digits.length - 1)];
    const targetCharYesNo = sequenceType === "letters"
        ? letters[getRandomInt(0, letters.length - 1)]
        : digits[getRandomInt(0, digits.length - 1)];

    const charAtIndex = sequence[index - 1];
    const countTarget = sequence.filter(ch => ch === targetChar).length;
    const hasTarget = sequence.includes(targetCharYesNo);

    questions = [
        {
            type: "index",
            prompt: `${index}. karakter neydi?`,
            answer: charAtIndex,
            help: "Tek karakter yazın. Örn: A veya 7"
        },
        {
            type: "count",
            prompt: `${targetChar} karakterinden kaç tane vardı?`,
            answer: String(countTarget),
            help: "Sadece sayı yazın. Örn: 0, 2, 5"
        },
        {
            type: "yesno",
            prompt: `Dizide ${targetCharYesNo} karakteri var mıydı?`,
            answer: hasTarget ? "EVET" : "HAYIR",
            help: "Evet / Hayır yazın. Örn: evet, hayır, e, h"
        }
    ];
}

function showQuestion() {
    if (!exerciseActive) return;

    questionArea.style.display = "block";
    feedback.classList.add("d-none");

    const question = questions[currentQuestionIndex];
    questionText.textContent = question.prompt;
    answerHelp.textContent = question.help;
    answerInput.value = "";
    answerInput.focus();
}

function submitAnswer() {
    if (!exerciseActive || isFlashing) return;

    const question = questions[currentQuestionIndex];
    const userAnswer = normalizeText(answerInput.value);

    let isCorrect = false;
    if (question.type === "index") {
        isCorrect = userAnswer === normalizeText(question.answer);
    } else if (question.type === "count") {
        isCorrect = userAnswer === normalizeText(question.answer);
    } else if (question.type === "yesno") {
        const norm = normalizeYesNo(userAnswer);
        isCorrect = norm === question.answer;
    }

    feedback.classList.remove("d-none");
    if (isCorrect) {
        correct++;
        feedback.textContent = "Doğru ✔";
        feedback.className   = "position-absolute text-success fs-5 fw-bold";
    } else {
        wrong++;
        feedback.textContent = "Yanlış ✖";
        feedback.className   = "position-absolute text-danger fs-5 fw-bold";
    }

    updateStats();

    currentQuestionIndex += 1;
    if (currentQuestionIndex >= questions.length) {
        roundsCompleted += 1;
        updateRoundsLeft();
        if (roundsCompleted >= roundsTotal) {
            finishExercise();
            return;
        }
        if (exerciseActive) setTimeout(startRound, 500);
    } else {
        setTimeout(showQuestion, 350);
    }
}

function normalizeYesNo(value) {
    if (value === "E" || value === "EVET" || value === "YES") return "EVET";
    if (value === "H" || value === "HAYIR" || value === "HAYR" || value === "NO") return "HAYIR";
    return value;
}

function updateStats() {
    total = correct + wrong;
    correctCount.textContent = correct;
    wrongCount.textContent   = wrong;
    totalCount.textContent   = total;
}

function updateRoundsLeft() {
    const left = Math.max(0, roundsTotal - roundsCompleted);
    roundLeftEl.textContent = left;
}

function finishExercise() {
    exerciseActive = false;

    finishCorrect.textContent = correct;
    finishWrong.textContent   = wrong;
    finishTotal.textContent   = total;
    finishRounds.textContent  = roundsCompleted;

    exercise_body.style.display = "none";
    finish_body.style.display   = "flex";
}

});
