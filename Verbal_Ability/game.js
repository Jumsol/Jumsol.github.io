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

// Load questions from the JSON file
fetch('/Verbal_Ability/questions.json')
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

//CONSTANTS
const CORRECT_BONUS = 1;
const MAX_QUESTIONS = 50;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');

    // Inside the startGame function, create variables for the audio elements
correctSound = document.getElementById('correctSound');
wrongSound = document.getElementById('wrongSound');
};

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
      localStorage.setItem('mostRecentScore', score);
      //go to the end page
      return window.location.assign('/end.html');
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
  
    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerHTML = currentQuestion.question;
  
    // Remove highlighting from previous question's answer choices
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

    // Unhide the choice containers
    const choiceContainers = document.querySelectorAll('.choice-container');
    choiceContainers.forEach((container) => {
      container.style.display = 'flex'; // Change display style to 'flex' or 'block', as needed
    });

    // Remove the current explanation element
    if (currentExplanationElement) {
        currentExplanationElement.remove();
        currentExplanationElement = null; // Reset the reference
    }

    getNewQuestion();
});

const quitGame = () => {
    if (confirm("Are you sure you want to quit the game?")) {
        // If user confirms, finish the game
        localStorage.setItem('mostRecentScore', score);
        window.location.assign('/end.html');
    }
};

// Add a click event listener to the quit button
document.getElementById('quitBtn').addEventListener('click', quitGame);

// Add an event listener to the "Explain" button
document.getElementById('explainBtn').addEventListener('click', () => {
    // Show the explanation
    showExplanation();
  });

  let currentExplanationElement = null;

  showExplanation = () => {
 // Remove any previous explanation element, if exists
 if (currentExplanationElement) {
  currentExplanationElement.remove();
}

// Get the explanation from the currentQuestion object
const explanation = currentQuestion.explanation;

// Create a new h3 element to hold the explanation
const explanationElement = document.createElement('h3');
explanationElement.textContent = explanation; // Use textContent to set the content
explanationElement.style.display = 'block'; // Set the display to its default value

// Set an ID to the explanation element for easy removal
explanationElement.id = 'explanationElement';

// Append the explanation element below the question
const questionContainer = document.getElementById('question').parentElement;
questionContainer.insertBefore(explanationElement, document.getElementById('nextBtn'));

// Hide the choice containers
const choiceContainers = document.querySelectorAll('.choice-container');
choiceContainers.forEach((container) => {
  container.style.display = 'none';
});

// Hide the "Explain" button
document.getElementById('explainBtn').classList.add('hidden');

// Store the reference to the current explanation element
currentExplanationElement = explanationElement;

setTimeout(() => {
  document.getElementById('nextBtn').classList.remove('hidden');
}, 1000); // Adjust the delay (in milliseconds) as needed
};
  