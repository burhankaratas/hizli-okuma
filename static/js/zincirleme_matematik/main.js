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

const exprContainer = document.getElementById("exprContainer");
const leftSideEl    = document.getElementById("leftSide");
const rightSideEl   = document.getElementById("rightSide");
const feedback      = document.getElementById("feedback");

const finishCorrect = document.getElementById("finishCorrect");
const finishWrong   = document.getElementById("finishWrong");
const finishTotal   = document.getElementById("finishTotal");
const finishTime    = document.getElementById("finishTime");

let correct = 0;
let wrong   = 0;
let total   = 0;
let speed   = 0;

let answered         = false;
let isFirstQuestion  = false;
let exerciseActive   = false;
let remainingSeconds = 0;

let prevActual       = 0;
let currentActual    = 0;
let shownValue       = 0;
let lastEquationText = "";
let selectedOp       = "mix";
let maxVal           = 10;

let responseTimer     = null;
let exerciseTimer     = null;
let countdownInterval = null;
let transitionTimer   = null;

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

// Normalize for duplicate detection: commutative ops treated same regardless of order
function normalizeText(a, op, b) {
    if (op === "+" || op === "×") return `${Math.min(a, b)} ${op} ${Math.max(a, b)}`;
    return `${a} ${op} ${b}`;
}

function buildEquation() {
    for (let i = 0; i < 100; i++) {
        const op = pickOp(selectedOp);
        let a = getRandomInt(0, maxVal);
        let b = getRandomInt(0, maxVal);
        if (op === "-" && b > a) [a, b] = [b, a];
        if (normalizeText(a, op, b) !== lastEquationText) {
            const result = computeResult(a, op, b);
            return { a, op, b, result, text: `${a} ${op} ${b}` };
        }
    }
    // Fallback: return anyway
    const op = pickOp(selectedOp);
    let a = getRandomInt(0, maxVal);
    let b = getRandomInt(0, maxVal);
    if (op === "-" && b > a) [a, b] = [b, a];
    return { a, op, b, result: computeResult(a, op, b), text: `${a} ${op} ${b}` };
}

// Returns a value ≠ prevActual, ≥ 0
function buildDecoy(prev, curr) {
    // ~50%: show currentActual as a trap (the user who forgot the rule would compute this)
    if (Math.random() < 0.5 && curr !== prev) return curr;
    // ~50%: a nearby number (prev ± 1..5)
    for (let i = 0; i < 50; i++) {
        const delta = getRandomInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
        const val   = prev + delta;
        if (val >= 0 && val !== prev) return val;
    }
    return curr !== prev ? curr : Math.max(0, prev + 1);
}

function start() {
    speed      = Number(speedSelect.value);
    maxVal     = Number(rangeSelect.value);
    selectedOp = opSelect.value;
    const raw  = Number(durationInput.value);
    const durationSeconds = (raw > 0 && isFinite(raw)) ? raw : 60;

    settings_body.style.display = "none";
    exercise_body.style.display = "block";
    finish_body.style.display   = "none";

    startExercise(durationSeconds);
}

function startExercise(durationSeconds) {
    correct = 0; wrong = 0; total = 0;
    lastEquationText = "";
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
    prevActual       = eq.result;
    lastEquationText = normalizeText(eq.a, eq.op, eq.b);

    exprContainer.style.opacity = "1";
    leftSideEl.textContent      = eq.text;
    rightSideEl.textContent     = `= ${eq.result}`;
    rightSideEl.style.color     = "#94a3b8";

    feedback.textContent = "Başlangıç";
    feedback.className   = "position-absolute text-muted fs-5 fw-semibold";
    feedback.classList.remove("d-none");

    isFirstQuestion = true;
    answered        = true;

    responseTimer = setTimeout(() => {
        if (exerciseActive) showNextQuestion();
    }, speed);
}

function showNextQuestion() {
    if (!exerciseActive) return;
    if (responseTimer)   clearTimeout(responseTimer);
    if (transitionTimer) clearTimeout(transitionTimer);

    exprContainer.style.opacity = "0";

    transitionTimer = setTimeout(() => {
        if (!exerciseActive) return;

        const eq         = buildEquation();
        currentActual    = eq.result;
        lastEquationText = normalizeText(eq.a, eq.op, eq.b);

        // 50% correct (shownValue = prevActual), 50% wrong (decoy ≠ prevActual)
        shownValue = Math.random() < 0.5 ? prevActual : buildDecoy(prevActual, currentActual);

        leftSideEl.textContent  = eq.text;
        rightSideEl.textContent = `= ${shownValue}`;
        rightSideEl.style.color = "#fbbf24";

        feedback.textContent = "";
        feedback.classList.add("d-none");

        exprContainer.style.opacity = "1";

        isFirstQuestion = false;
        answered        = false;

        responseTimer = setTimeout(() => {
            if (!answered && exerciseActive) handleTimeout();
        }, speed);
    }, 150);
}

function handleTimeout() {
    answered = true;
    wrong++;
    feedback.textContent = "Süre Doldu ✖";
    feedback.className   = "position-absolute text-warning fs-5 fw-bold";
    feedback.classList.remove("d-none");
    updateStats();
    prevActual    = currentActual;
    responseTimer = setTimeout(() => { if (exerciseActive) showNextQuestion(); }, 400);
}

document.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    if (!exerciseActive || isFirstQuestion || answered) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    checkAnswer(event.key === "ArrowRight");
});

function checkAnswer(userSaysCorrect) {
    answered = true;
    if (responseTimer) clearTimeout(responseTimer);
    feedback.classList.remove("d-none");

    // Correct = shownValue matches the previous equation's real result
    const isCorrect = (shownValue === prevActual);

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
    prevActual    = currentActual;
    responseTimer = setTimeout(() => { if (exerciseActive) showNextQuestion(); }, 400);
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
    if (transitionTimer)   clearTimeout(transitionTimer);

    finishCorrect.textContent = correct;
    finishWrong.textContent   = wrong;
    finishTotal.textContent   = total;
    finishTime.textContent    = Number(durationInput.value);

    exercise_body.style.display = "none";
    finish_body.style.display   = "flex";
}

// Console simulation: runSimulation(500) to verify logic
window.runSimulation = function(turns = 500) {
    console.log(`=== Zincirleme Matematik Simülasyonu (${turns} tur) ===`);

    const rInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const ops  = ["+", "-", "×"];
    const calc = (a, op, b) => op === "+" ? a + b : op === "-" ? a - b : a * b;
    const norm = (a, op, b) => (op === "+" || op === "×")
        ? `${Math.min(a,b)} ${op} ${Math.max(a,b)}`
        : `${a} ${op} ${b}`;

    function simBuild(lastText, maxV, opMode) {
        for (let i = 0; i < 100; i++) {
            const op = opMode === "mix" ? ops[rInt(0, 2)] : opMode;
            let a = rInt(0, maxV), b = rInt(0, maxV);
            if (op === "-" && b > a) [a, b] = [b, a];
            if (norm(a, op, b) !== lastText) return { a, op, b, result: calc(a, op, b) };
        }
        const op = ops[rInt(0, 2)];
        let a = rInt(0, maxV), b = rInt(0, maxV);
        if (op === "-" && b > a) [a, b] = [b, a];
        return { a, op, b, result: calc(a, op, b) };
    }

    function simDecoy(prev, curr) {
        if (Math.random() < 0.5 && curr !== prev) return curr;
        for (let i = 0; i < 50; i++) {
            const d = rInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
            const v = prev + d;
            if (v >= 0 && v !== prev) return v;
        }
        return curr !== prev ? curr : Math.max(0, prev + 1);
    }

    const configs = [
        { maxV: 10,  opMode: "mix" },
        { maxV: 20,  opMode: "+" },
        { maxV: 50,  opMode: "-" },
        { maxV: 100, opMode: "mix" },
    ];

    for (const cfg of configs) {
        let simPrev = 0, lastText = "", correctCnt = 0, wrongCnt = 0,
            dupeCnt = 0, scoringErr = 0;

        const first = simBuild("", cfg.maxV, cfg.opMode);
        simPrev  = first.result;
        lastText = norm(first.a, first.op, first.b);

        for (let i = 0; i < turns; i++) {
            const eq = simBuild(lastText, cfg.maxV, cfg.opMode);
            const currNorm = norm(eq.a, eq.op, eq.b);

            if (currNorm === lastText) dupeCnt++;

            const useCorrect = Math.random() < 0.5;
            const shown = useCorrect ? simPrev : simDecoy(simPrev, eq.result);

            // Verify scoring: shown === simPrev iff useCorrect
            if ((shown === simPrev) !== useCorrect) scoringErr++;

            if (useCorrect) correctCnt++; else wrongCnt++;

            lastText = currNorm;
            simPrev  = eq.result;
        }

        console.log(
            `maxVal=${cfg.maxV} op=${cfg.opMode}: ` +
            `Doğru %${(correctCnt/turns*100).toFixed(1)} | ` +
            `Yanlış %${(wrongCnt/turns*100).toFixed(1)} | ` +
            `Ardışık aynı: ${dupeCnt} | Puanlama hatası: ${scoringErr}`
        );
    }
};

});
