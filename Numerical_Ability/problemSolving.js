const question = document.getElementById('question');
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

fetch('/Numerical_Ability/problemSolving.js')
  .then((res) => res.json())
  .then((loadedQuestions) => {
    questions = loadedQuestions.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
        explanation: loadedQuestion.explanation,
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

const CORRECT_BONUS = 1;
const MAX_QUESTIONS = 25;

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

getNewQuestion = () => {
  if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem('mostRecentScore', score);
    return window.location.assign('/end.html');
  }
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuesions.length);
  currentQuestion = availableQuesions[questionIndex];
  question.innerHTML = currentQuestion.question;

  choices.forEach((choice) => {
    choice.parentElement.classList.remove('correct', 'incorrect');
  });

  choices.forEach((choice) => {
    const number = choice.dataset['number'];
    choice.innerHTML = currentQuestion['choice' + number];
  });

  availableQuesions.splice(questionIndex, 1);
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
      correctSound.play();
    } else {
      wrongSound.play();
      const correctChoice = choices.find(
        (choice) => choice.dataset['number'] == currentQuestion.answer
      );
      correctChoice.parentElement.classList.add('correct');
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      const elements = document.querySelectorAll('#nextBtn, #explainBtn');
      elements.forEach(element => element.classList.remove('hidden'));
    }, 1000);
  });
});

incrementScore = (num) => {
  score += num;
  scoreText.innerText = score;
};

document.getElementById('nextBtn').addEventListener('click', () => {
  const elements = document.querySelectorAll('#nextBtn, #explainBtn');
  elements.forEach(element => element.classList.add('hidden'));

  const choiceContainers = document.querySelectorAll('.choice-container');
  choiceContainers.forEach((container) => {
    container.style.display = 'flex';
  });

  if (currentExplanationElement) {
    currentExplanationElement.remove();
    currentExplanationElement = null;
  }

  getNewQuestion();
});

const quitGame = () => {
  if (confirm("Are you sure you want to quit the game?")) {
    localStorage.setItem('mostRecentScore', score);
    window.location.assign('/end.html');
  }
};

document.getElementById('quitBtn').addEventListener('click', quitGame);

document.getElementById('explainBtn').addEventListener('click', () => {
  showExplanation();
});

let currentExplanationElement = null;

showExplanation = () => {
  if (currentExplanationElement) {
    currentExplanationElement.remove();
  }

  const explanation = currentQuestion.explanation;

  const explanationElement = document.createElement('h3');
  explanationElement.textContent = explanation;
  explanationElement.style.display = 'block';

  explanationElement.id = 'explanationElement';

  const questionContainer = document.getElementById('question').parentElement;
  questionContainer.insertBefore(explanationElement, document.getElementById('nextBtn'));

  const choiceContainers = document.querySelectorAll('.choice-container');
  choiceContainers.forEach((container) => {
    container.style.display = 'none';
  });

  document.getElementById('explainBtn').classList.add('hidden');

  currentExplanationElement = explanationElement;

  setTimeout(() => {
    document.getElementById('nextBtn').classList.remove('hidden');
  }, 1000);
};
