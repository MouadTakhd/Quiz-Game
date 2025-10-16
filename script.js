// Variables
const screenFdiv = document.getElementById('start-screen');
const container = document.querySelector('#container');
const secondScreen = document.getElementById('quiz-screen');
const divListAnswers = document.getElementById('answers-container');
const buttonStart = screenFdiv.querySelector('button');
const question_screen = document.getElementById('quiz-screen');
const current_question = document.getElementById('current-question');
const nextQsButton = document.getElementById('next-qs');
const skipQsButton = document.getElementById('skip-qs');
const question = document.getElementById('question');
const count = document.getElementById('count');
const progressBar = document.getElementById('progress');
const restartButton = document.getElementById('restart-quiz');

// Quiz state
let currentQuestionIndex = 0;
let questionsList = [];
let score = 0;

// Fetch quiz data
async function getData() {
    const url = "https://the-trivia-api.com/v2/questions";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Show quiz screen
function screenOrganizer() {
    screenFdiv.classList.remove('active');
    secondScreen.classList.add('active');
}

// Update progress bar
function updateProgress(currentIndex, totalQuestions) {
    const percent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('data-percent', percent);
}

// Fill question and answers
const fillText = (questionText, answers = [], correctAnswer = null) => {
    question.textContent = questionText.text || questionText;
    divListAnswers.innerHTML = '';
    const allAnswers = [...answers, correctAnswer];

    // Shuffle answers
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    allAnswers.forEach(answer => {
        const div = document.createElement('div');
        div.classList.add('answer');
        div.textContent = answer;
        if (answer === correctAnswer) div.classList.add('right-answer');
        else div.classList.add('incorrect-answer');
        divListAnswers.appendChild(div);
    });
};

// Render question by index
const renderQuestion = (index) => {
    const q = questionsList[index];
    fillText(q.question, q.incorrectAnswers, q.correctAnswer);
    updateProgress(index, questionsList.length);
    current_question.textContent = index + 1;

    // Enable clicks on answers
    divListAnswers.querySelectorAll('.answer').forEach(ans => ans.style.pointerEvents = 'auto');
};

// Handle answer selection
divListAnswers.addEventListener('click', (e) => {
    if (!e.target.classList.contains('answer')) return;
    const selected = e.target;

    // Disable all answers after click
    divListAnswers.querySelectorAll('.answer').forEach(ans => ans.style.pointerEvents = 'none');

    if (selected.classList.contains('right-answer')) {
        selected.classList.add('selected');
        selected.style.backgroundColor = 'green';
        selected.style.border = '2px solid green';
        score++;
    } else {
        selected.classList.add('selected');
        selected.style.backgroundColor = 'red';
        selected.style.border = '2px solid red';
        const correct = divListAnswers.querySelector('.right-answer');
        if (correct) {
            correct.style.backgroundColor = 'green';
            correct.style.border = '2px solid green';
        }
    }
});

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsList.length) {
        renderQuestion(currentQuestionIndex);
    } else {
        showResultScreen();
    }
}

// Show result screen
function showResultScreen() {
    question_screen.classList.remove('active');
    const resultScreen = document.getElementById('result-screen');
    resultScreen.classList.add('active');
    document.getElementById('final-result').textContent = score;
    document.getElementById('max-quiz').textContent = questionsList.length;
}

// Next and skip button events
nextQsButton.addEventListener('click', nextQuestion);
skipQsButton.addEventListener('click', nextQuestion);

// Start quiz
buttonStart.addEventListener('click', async () => {
    buttonStart.disabled = true;
    buttonStart.textContent = "Loading questions...";
   
    const fetchedList = await getData();
    if (fetchedList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        screenOrganizer();
        questionsList = fetchedList;
        count.textContent = questionsList.length;
        currentQuestionIndex = 0;
        score = 0;
        renderQuestion(currentQuestionIndex);
    }
});

// Restart quiz
restartButton.addEventListener('click', () => {
    document.getElementById('result-screen').classList.remove('active');
    screenFdiv.classList.add('active');
    buttonStart.disabled = false;
    buttonStart.textContent = "Start Quiz";
    score = 0;
    currentQuestionIndex = 0;
    progressBar.style.width = '0%';
    progressBar.setAttribute('data-percent', '0');
});
