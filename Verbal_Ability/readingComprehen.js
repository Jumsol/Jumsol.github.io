const question = document.getElementById('question');
const question2 = document.getElementById('question2');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];

// Load questions from the JSON file
fetch('/Verbal_Ability/readingcomp.json')
    .then((res) => res.json())
    .then((loadedQuestions) => {
        questions = loadedQuestions.map((loadedQuestion) => {
            const formattedQuestion = {
                question: loadedQuestion.question,
                question2: loadedQuestion.question2,
            };

            const answerChoices = Object.values(loadedQuestion.choices);
            formattedQuestion.answer = loadedQuestion.answer;

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });

        startGame();
    })
    .catch((err) => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_BONUS = 1;
const MAX_QUESTIONS = 12;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
    correctSound = document.getElementById('correctSound');
    wrongSound = document.getElementById('wrongSound');
};

let currentQuestionIndex = 0;

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        // Go to the end page
        return window.location.assign('/end.html');
    }

    currentQuestion = availableQuesions[currentQuestionIndex];
    currentQuestionIndex++;

    // Restarts the question index when all questions have been shown
    if (currentQuestionIndex >= availableQuesions.length) {
        currentQuestionIndex = 0;
    }

    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

    // Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    // Clear previous answer choices highlighting
    choices.forEach((choice) => {
        choice.parentElement.classList.remove('correct', 'incorrect');
    });

    // Update question texts
    question.innerHTML = currentQuestion.question;
    question2.innerHTML = currentQuestion.question2;

    // Update answer choices
    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerHTML = currentQuestion['choice' + number];
    });

    // Rest of the function remains the same
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
            // Play the correct sound
            correctSound.play();
        } else {
            // Play the wrong sound
            wrongSound.play();
            // Highlight the correct answer if the selected answer is wrong
            const correctChoice = choices.find(
                (choice) => choice.dataset['number'] == currentQuestion.answer
            );
            correctChoice.parentElement.classList.add('correct');
        }

        selectedChoice.parentElement.classList.add(classToApply);

        // Show the "Next Question" button after a short delay
        setTimeout(() => {
            document.getElementById('nextBtn').classList.remove('hidden');
        }, 1000);
    });
});

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score;
};

document.getElementById('nextBtn').addEventListener('click', () => {
    document.getElementById('nextBtn').classList.add('hidden');
    getNewQuestion();
});

const quitGame = () => {
    localStorage.setItem('mostRecentScore', score);
    window.location.assign('/end.html');
};

// Add a click event listener to the quit button
document.getElementById('quitBtn').addEventListener('click', function () {
    Swal.fire({
        title: 'Are you sure you want to quit?',
        text: "Your progress will be lost!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, quit!',
        cancelButtonText: 'No, stay'
    }).then((result) => {
        if (result.isConfirmed) {
            quitGame();
        }
    });
});