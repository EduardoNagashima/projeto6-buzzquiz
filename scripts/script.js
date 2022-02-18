// GLOBAL VARIABLES
let quizzes;
let correctsCount = 0;
let questionCount = 2;
let quizzSelectedID;
let totalQuestions = 0;
let countPlayerAnswer = 0;
let quizzOn = true;
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
  quizzSelectedID = quizId;
  screenFocus(".answer-quizz");
  const promisse = axios.get(`${QUIZ_API_URL}` + quizId);
  promisse.then((response) => printSelectedAnswer(response.data));
}

function printSelectedAnswer(quizz) {
  // organizar o quizz aleatoriamente
  const sectionHTML = document.querySelector(".answer-quizz");
  sectionHTML.innerHTML += `
  <div class="answer-quizz__header">
    <img src="${quizz.image}" alt="quizz-image">
    <h3>${quizz.title}</h3>
  </div>`;
  let cont = 1;
  totalQuestions = quizz.questions.length;
  quizz.questions.forEach((questions) => {
    sectionHTML.innerHTML += `<div class='questions--${cont}'></div>`;
    const questionsInnerHTML = document.querySelector(`.questions--${cont}`);

    questionsInnerHTML.innerHTML += `
      <div class="answer-quizz__question-tittle--${cont}">
        <h4>${questions.title}</h4>
      </div>`;
    questionsInnerHTML.innerHTML += `<div class="answer-quizz__answers--${cont}"></div>`;
    const questionTextColor = document.querySelector(`.answer-quizz__question-tittle--${cont}`);
    questionTextColor.style.setProperty("--text-color", `${questions.color}`);
    let randomQuestions = questions.answers.sort(() => Math.random() - 0.5);
    randomQuestions.forEach((answer) => {
      if (answer.isCorrectAnswer){
        let quizzAnswers = document.querySelector(`.answer-quizz__answers--${cont}`);
        quizzAnswers.innerHTML += `
        <div class="answers correct-answer" onclick="selectAnswer(this)">
          <img src="${answer.image}" alt="answer-img">
          <span>${answer.text}</span>
        </div>
        `;
      }else{
        let quizzAnswers = document.querySelector(`.answer-quizz__answers--${cont}`);
        quizzAnswers.innerHTML += `
        <div class="answers" onclick="selectAnswer(this)">
          <img src="${answer.image}" alt="answer-img">
          <span>${answer.text}</span>
        </div>
        `;
      }
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
  if (playerAnswer.classList.contains('.correct-answer')){
    correctsCount += 1;
  }
  const correctAnswer = answersSection.querySelector('.correct-answer');
  answersSection.querySelectorAll('.answers').forEach((wrongAnswer)=> wrongAnswer.classList.add('wrongAnswer'))
  correctAnswer.classList.add('correctColor');
});
  setTimeout(nextQuestion, 2000);
  countPlayerAnswer++;
  setTimeout(isFinish, 2000);
}

function nextQuestion() {
  let tittleArray = document.querySelector(".questions--"+ questionCount);
  if (tittleArray){
    tittleArray.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
  }
  questionCount++;
}

function isFinish(){
  if (quizzOn){
    if (totalQuestions === countPlayerAnswer){
      quizzOn = false;
      //focar ma tela final de resposta
      //ver o porque de estar bugando na ordem que é respondida
      //se clicar várias vezes ele buga
      const promisse = axios.get(`${QUIZ_API_URL}` + quizzSelectedID);
      promisse.then((response) => {
      let quizzLevel = response.data.levels;
      const section = document.querySelector('.answer-quizz');
      quizzLevel.forEach((lv) =>{
        section.innerHTML += `
        <div class="quizz-result">
          <div class="quizz-result__header">
            <h4>${lv.title}</h4>
          </div>
          <div class="quizz-result__level">
            <img src="${lv.image}" alt="quizz-result-img">
            <span>${lv.text}</span>
          </div>
        </div>`
      });
      section.innerHTML+= `
      <div class="answer-quizz__buttons">
        <button class="answer-quizz__play-again-button" onclick="playagain()">
          Reiniciar Quizz
        </button>
        <button class="answer-quizz__home-button" onclick="screenFocus('.quiz-list')">
          Voltar para home
        </button>
      </div>`
    });
    
    }
  }
}

function playagain(){
  quizzOn = true;
  correctsCount = 0;
  questionCount = 2;
  totalQuestions = 0;
  countPlayerAnswer = 0;
  document.querySelector('.answer-quizz').innerHTML = '';
  setTimeout(()=>{answerQuiz(quizzSelectedID)},2000);
}

function screenFocus(sectionToFocus) {
  let section = document.querySelector(sectionToFocus);
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => section.classList.add("hidden"));
  section.classList.remove("hidden");
}

function createQuizStep1() {
  newQuizTitle = document.querySelector("#quiz-title").value;
  newQuizImage = document.querySelector("#quiz-URL").value;
  newQuizNumberOfQuestions = document.querySelector("#quiz-questions").value;
  newQuizNumberOfLevels = document.querySelector("#quiz-levels").value;

  if (newQuizTitle.length < 20 || newQuizTitle.length > 65) {
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

function createQuizStep2() {
  for (let i = 0; i < newQuizNumberOfQuestions; i++) {
    let testQuestion = document.querySelector(`#question${i + 1}`).value;
    if (testQuestion.length < 20) {
      alert("Erro no título da pergunta");
      return;
    }
    let testQuestionColor = document.querySelector(
      `#question${i + 1}-color`
    ).value;
    if (!isValidHexColor(testQuestionColor)) {
      alert("Erro na cor da pergunta");
      return;
    }
    let testCorrectAnswer = document.querySelector(
      `#question${i + 1}-correct-answer`
    ).value;
    if (testCorrectAnswer.length === "") {
      alert("Erro na respota correta");
      return;
    }
    let testCorrectAnswerImage = document.querySelector(
      `#question${i + 1}-correct-answer-image-URL`
    ).value;
    if (!isValidUrl(testCorrectAnswerImage)) {
      alert("Erro na imagem da resposta correta");
      return;
    }
    let j = 1;
    do {
      let testIncorrectAnswer = document.querySelector(
        `question${i + 1}-incorrect-answer${j}`
      ).value;
      if (testIncorrectAnswer === "") {
        alert("Erro na resposta incorreta");
        return;
      }
      let testIncorrectAnswerImage = document.querySelector(
        `question${i + 1}-incorrect-answer${j}-image-URL`
      ).value;
      if (!isValidUrl(testIncorrectAnswerImage)) {
        alert("Erro na imagem da resposta incorreta");
        return;
      }
      j++;
      break;
    } while (true);
  }
  for (let i = 0; i < newQuizNumberOfQuestions; i++) {
    let newQuestionTitle = document.querySelector(`#question${i + 1}`).value;
    let newQuestionColor = document.querySelector(
      `#question${i + 1}-color`
    ).value;
    let newCorrectAnswer = document.querySelector(
      `#question${i + 1}-correct-answer`
    ).value;
    let newCorrectAnswerImage = document.querySelector(
      `#question${i + 1}-correct-answer-image-URL`
    ).value;
    let newQuestionAnswers = [];
    newQuestionAnswers.push({
      text: newCorrectAnswer,
      image: newCorrectAnswerImage,
      isCorrectAnswer: true,
    });
    let j = 1;
    do {
      let newIncorrectAnswer = document.querySelector(
        `question${i + 1}-incorrect-answer${j}`
      ).value;
      let newIncorrectAnswerImage = document.querySelector(
        `question${i + 1}-incorrect-answer${j}-image-URL`
      ).value;
      newQuestionAnswers.push({
        text: newIncorrectAnswer,
        image: newIncorrectAnswerImage,
        isCorrectAnswer: false,
      });
      j++;
    } while (
      document.querySelector(`question${i + 1}-incorrect-answer${j}`).value !=
      ""
    );
    let newQuestion = {
      title: newQuestionTitle,
      color: newQuestionColor,
      answers: newQuestionAnswers,
    };
    newQuizQuestions.push(newQuestion);
  }
}

function createQuizFinalStep() {}

function isValidUrl(_string) {
  const matchpattern =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
  return matchpattern.test(_string);
}

function isUrlAnImage(url) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

function isValidHexColor(str) {
  if (str[0] !== "#") {
    return false;
  }
  if (str.length !== 7) {
    return false;
  }
  var a = parseInt(str.slice(1), 16);
  return a.toString(16) === str.slice(1).toLowerCase();
}

function renderNewQuizQuestionsInputs() {
  const div = document.querySelector(".quiz-creation__questions");
  div.innerHTML = `<h2>Crie suas perguntas</h2>`;
  console.log(newQuizNumberOfQuestions);
  for (let i = 0; i < newQuizNumberOfQuestions; i++) {
    div.innerHTML += `<form action="">
    <h2>Pergunta ${i + 1}</h2>
    <input type="text" id="question${i + 1}" placeholder="Texto da pergunta">
    <input type="text" id="question${
      i + 1
    }-color" placeholder="Cor de fundo da pergunta" class="quiz-creation__questions--large-margin-bottom">
    <h2>Resposta correta</h2>
    <input type="text" id="question${
      i + 1
    }-correct-answer" placeholder="Resposta correta">
    <input type="text" id="question${
      i + 1
    }-correct-answer-image-URL" placeholder="URL da imagem" class="quiz-creation__questions--large-margin-bottom">
    <h2>Respostas incorretas</h2>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer1" placeholder="Resposta incorreta 1">
    <input type="text" id="question${
      i + 1
    }-incorrect-answer1-image-URL" placeholder="URL da imagem 1" class="quiz-creation__questions--large-margin-bottom">
    <input type="text" id="question${
      i + 1
    }-incorrect-answer2" placeholder="Resposta incorreta 2">
    <input type="text" id="question${
      i + 1
    }-incorrect-answer2-image-URL" placeholder="URL da imagem 2" class="quiz-creation__questions--large-margin-bottom">
    <input type="text" id="question${
      i + 1
    }-incorrect-answer3" placeholder="Resposta incorreta 3">
    <input type="text" id="question${
      i + 1
    }-incorrect-answer3-image-URL" placeholder="URL da imagem 3">
  </form>`;
  }
}

getQuizzes();