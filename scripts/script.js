// GLOBAL VARIABLES
let quizzes;
let newQuizTitle = null;
let newQuizImage = null;
let newQuizQuestions = [];
let newQuizNumberOfQuestions;
let newQuizLevels = [];
let newQuizNumberOfLevels;
const QUIZ_API_URL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/";

// FUNCTIONS
function getQuizzes() {
  let promisse = axios.get(`${QUIZ_API_URL}`);
  promisse.then(renderQuizzesPreview);
}

function renderQuizzesPreview(response) {
  const quizzesUL = document.querySelector(".all-quizzes-list ul");
  quizzes = response.data;
  console.log(quizzes);
  quizzes.forEach((element) => {
    quizzesUL.innerHTML += `
    <li class="quizz-preview" onclick="answerQuiz(${element.id})">
            <img src=${element.image}/>
            <div class="quizz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
  });
}

function answerQuiz(quizId) {
  screenFocus(document.querySelector(".answer-quizz"));
  const promisse = axios.get(`${QUIZ_API_URL}` + quizId);
  promisse.then((response) => printSelectedAnswer(response.data));
}

function printSelectedAnswer(quizz) {
  const sectionHTML = document.querySelector(".answer-quizz");
  sectionHTML.innerHTML += `
  <div class="answer-quizz__header">
    <img src="${quizz.image}" alt="quizz-image">
    <h3>${quizz.title}</h3>
  </div>`;
  let cont = 1;

  quizz.questions.forEach((questions) => {
    sectionHTML.innerHTML += `<div class='questions--${cont}'></div>`;
    const questionsInnerHTML = document.querySelector(`.questions--${cont}`);
    questionsInnerHTML.innerHTML += `
      <div class="answer-quizz__question-tittle">
        <h4>${questions.title}</h4>
      </div>`;
    questionsInnerHTML.innerHTML += `<div class="answer-quizz__answers--${cont}"></div>`;

    questions.answers.forEach((answer) => {
      let quizzAnswers = document.querySelector(
        `.answer-quizz__answers--${cont}`
      );
      quizzAnswers.innerHTML += `
      <div class="answers" onclick="selectAnswer(this)">
        <img src="${answer.image}" alt="answer-img">
        <span>${answer.text}</span>
      </div>
      `;
    });
    cont++;
  });
}

function selectAnswer(playerAnswer) {
  let answersSection = playerAnswer.parentNode;
  const answers = answersSection.querySelectorAll(".answers");
  answers.forEach((el) => {
    el.onclick = "";
    if (el !== playerAnswer) {
      el.classList.add("changeOpacity");
    }
  });
  setTimeout(nextQuestion, 2000);
}

function nextQuestion() {
  let tittleArray = document.querySelectorAll(".answer-quizz__question-tittle");
  tittleArray[1].scrollIntoView();
}

function screenFocus(sectionToFocus) {
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => section.classList.add("hidden"));
  sectionToFocus.classList.remove("hidden");
}

getQuizzes();

function createQuizStep1() {
  newQuizTitle = document.querySelector("#quiz-title").value;
  newQuizImage = document.querySelector("#quiz-URL").value;
  newQuizNumberOfQuestions = document.querySelector("#quiz-questions").value;
  newQuizNumberOfLevels = document.querySelector("#quiz-levels").value;

  if (newQuizTitle.lenght < 20 || newQuizTitle.lenght > 65) {
    alert("Erro no título");
    return;
  }
  if (!isValidUrl(newQuizImage)) {
    alert("Erro na imagem");
    return;
  }
  if (newQuizNumberOfQuestions < 3) {
    alert("Erro nas perguntas");
    return;
  }
  if (newQuizNumberOfLevels < 2) {
    alert("Erro nos níveis");
    return;
  }
  renderNewQuizQuestionsInputs();
  document.querySelector(".quiz-creation__basic-info").classList.add("hidden");
  document
    .querySelector(".quiz-creation__questions")
    .classList.remove("hidden");
}

function createQuizStep2() {}

function createQuizFinalStep() {}

function isValidUrl(_string) {
  const matchpattern =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
  return matchpattern.test(_string);
}

function isUrlAnImage(url) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

function renderNewQuizQuestionsInputs() {
  const div = document.querySelector(".quiz-creation__questions");
  div.innerHTML = `<h2>Crie suas perguntas</h2>`;
  for (let i = 1; i < newQuizNumberOfQuestions + 1; i++) {
    div.innerHTML += `<form action="">
    <h2>Pergunta ${i}</h2>
    <input type="text" id="question${i}" placeholder="Texto da pergunta">
    <input type="text" id="question${i}-color" placeholder="Cor de fundo da pergunta" class="quiz-creation__questions--large-margin-bottom">
    <h2>Resposta correta</h2>
    <input type="text" id="question${i}-correct-answer" placeholder="Resposta correta">
    <input type="text" id="question${i}-correct-answer-image-URL" placeholder="URL da imagem" class="quiz-creation__questions--large-margin-bottom">
    <h2>Respostas incorretas</h2>
    <input type="text" id="question${i}-incorrect-answer1" placeholder="Resposta incorreta 1">
    <input type="text" id="question${i}-incorrect-answer1-image-URL" placeholder="URL da imagem 1" class="quiz-creation__questions--large-margin-bottom">
    <input type="text" id="question${i}-incorrect-answer2" placeholder="Resposta incorreta 2">
    <input type="text" id="question${i}-incorrect-answer2-image-URL" placeholder="URL da imagem 2" class="quiz-creation__questions--large-margin-bottom">
    <input type="text" id="question${i}-incorrect-answer3" placeholder="Resposta incorreta 3">
    <input type="text" id="question${i}-incorrect-answer3-image-URL" placeholder="URL da imagem 3">
  </form>`;
  }
}
