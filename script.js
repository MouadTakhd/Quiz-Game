// Variables
const screenFdiv = document.getElementById('start-screen');
const container = document.querySelector('#container');
const secondScreen = document.getElementById('quiz-screen');
const divListAnswers = document.getElementById('answers-container');
const buttonStart = screenFdiv.querySelector('button');
const question_screen = document.getElementById('quiz-screen');
const current_question = document.getElementById('current-question');
const nextQsButton = document.getElementById('next-qs');
const question = document.getElementById('question');
const count = document.getElementById('count');
const progressBar = document.getElementById('progress');

// Quiz state
let currentQuestionIndex = 0;
let questionsList = [];
let score = 0;

// Functions
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

function screenOrganizer() {
    screenFdiv.classList.remove('active');
    secondScreen.classList.add('active');
}

function updateProgress(currentIndex, totalQuestions) {
    const percent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
    progressBar.style.width = `${percent}%`;
}

const fillText = (questionText, answers = [], correctAnswer = null) => {
    question.textContent = questionText.text;
    divListAnswers.innerHTML = '';
    const allAnswers = [...answers, correctAnswer];

    // Shuffle answers (Fisher-Yates)
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    allAnswers.forEach(answer => {
        const div = document.createElement('div');
        div.classList.add('answer');
        div.textContent = answer;
        if (answer === correctAnswer){ div.classList.add('right-answer')};
        if (answer !== correctAnswer){ div.classList.add('incorrect-answer')};
        divListAnswers.appendChild(div);
    });
};

// Render question by index
const renderQuestion = (index) => {
    const q = questionsList[index];
    fillText(q.question, q.incorrectAnswers, q.correctAnswer);
    updateProgress(index, questionsList.length);
    current_question.textContent = index + 1;

    // Enable clicking on answers
    divListAnswers.querySelectorAll('.answer').forEach(ans => ans.style.pointerEvents = 'auto');
};

// Handle answer selection
divListAnswers.addEventListener('click', (e) => {
    if (!e.target.classList.contains('answer')) return;
    const selected = e.target;

    // Disable all answer clicks
    divListAnswers.querySelectorAll('.answer').forEach(ans => ans.style.pointerEvents = 'none');

    // Check if correct
    if (selected.classList.contains('right-answer')) {
        selected.classList.add('selected');
        score++;
        document.getElementById('score').textContent = score;
    } else {
        selected.classList.add('selected');
        const correct = divListAnswers.querySelector('.right-answer');
        if (correct) correct.style.backgroundColor = 'green';
    }
});

// Next question button
nextQsButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsList.length) {
        renderQuestion(currentQuestionIndex);
    } else {
        question_screen.style.display = 'none';
        const resultScreen = document.getElementById('result-screen');
        resultScreen.style.display = 'block';
        document.getElementById('final-result').textContent = score;
        document.getElementById('max-quiz').textContent = questionsList.length;
    }
});

// Start quiz
buttonStart.addEventListener('click', async () => {
    buttonStart.disabled = true;
    buttonStart.textContent = "Loading questions...";
    await new Promise(resolve => setTimeout(resolve, 1000));
    screenOrganizer();

    const fetchedList = await getData();
    if (fetchedList.length) {
        questionsList = fetchedList;
        count.textContent = questionsList.length;
        currentQuestionIndex = 0;
        score = 0;
        renderQuestion(currentQuestionIndex);
    }
});