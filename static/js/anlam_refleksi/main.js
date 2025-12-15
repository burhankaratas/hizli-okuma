const settings_body = document.getElementById("settings");
const exercise_body = document.getElementById("exercise");

settings_body.style.display = "block";
exercise_body.style.display = "none";

const speedSelect = document.getElementById("speedSelect");
const startButton = document.getElementById("startButton");

const correctCount = document.getElementById("correctCount");
const wrongCount = document.getElementById("wrongCount");
const totalCount = document.getElementById("totalCount");

const wordLeft = document.getElementById("wordLeft");
const wordRight = document.getElementById("wordRight");
const feedback = document.getElementById("feedback");

const finish_body = document.getElementById("finish");
const goHome = document.getElementById("goHome");

let correct = 0;
let wrong = 0;
let total = 0;

let word_datas = [];
let currentIndex = 0;
let hideTimer = null;
let speed = 0;
let currentQuestion = null;
let answered = false;

startButton.addEventListener("click", start);

// 🔀 Fisher–Yates Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function start() {
    speed = Number(speedSelect.value);

    settings_body.style.display = "none";
    exercise_body.style.display = "block";

    fetch("/static/data/anlam_refleksi.json")
        .then(response => response.json())
        .then(data => {
            word_datas = data;
            shuffleArray(word_datas); // 👈 her seferinde karışık
            currentIndex = 0;
            startExercise();
        });
}

function startExercise() {
    correct = 0;
    wrong = 0;
    total = 0;
    updateStats();
    showNextQuestion();
}

function showNextQuestion() {
    if (hideTimer) clearTimeout(hideTimer);

    answered = false;

    currentQuestion = word_datas[currentIndex];

    wordLeft.textContent = currentQuestion.word1;
    wordRight.textContent = currentQuestion.word2;

    feedback.textContent = "";

    hideTimer = setTimeout(() => {
        wordLeft.textContent = "";
        wordRight.textContent = "";
    }, speed);
}

document.addEventListener("keydown", function (event) {
    if (!currentQuestion) return;

    if (event.key === "ArrowRight") {
        checkAnswer("es");
    }

    if (event.key === "ArrowLeft") {
        checkAnswer("zit");
    }

    if (event.key === "Enter") {
        if (!answered) return;
        nextQuestion();
    }
});

function normalize(value) {
    return value
        .toLowerCase()
        .replaceAll("ş", "s")
        .replaceAll("ı", "i")
        .replaceAll("ğ", "g")
        .replaceAll("ü", "u")
        .replaceAll("ö", "o")
        .replaceAll("ç", "c");
}

function checkAnswer(answer) {
    if (answered) return;
    answered = true;

    const correctRelation = normalize(currentQuestion.relation);
    const userAnswer = normalize(answer);

    if (correctRelation === userAnswer) {
        correct++;
        feedback.textContent = "Doğru ✔";
        feedback.className = "text-success";
    } else {
        wrong++;
        feedback.textContent = "Yanlış ✖";
        feedback.className = "text-danger";
    }

    updateStats();
}

function nextQuestion() {
    currentIndex++;

    if (currentIndex >= word_datas.length) {
        finishExercise();
        return;
    }

    showNextQuestion();
}

function updateStats() {
    total = correct + wrong;
    correctCount.textContent = correct;
    wrongCount.textContent = wrong;
    totalCount.textContent = total;
}

function finishExercise() {
    exercise_body.style.display = "none";
    finish_body.style.display = "block";
    currentQuestion = null;
}
