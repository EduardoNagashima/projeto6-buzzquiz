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
let userQuizzIDs = [];
let newQuizNumberOfLevels;
let userCreatedQuiz = false;
const QUIZ_API_URL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/";
const LOCAL_STORAGE_KEY = "idList";

// FUNCTIONS
function getQuizzes() {
  loadScreen(true);
  let promisse = axios.get(`${QUIZ_API_URL}`);
  promisse.then(renderQuizzesPreview);
}

function renderQuizzesPreview(response) {
  userCreatedQuiz = false;
  const quizzesUL = document.querySelector(".all-quizzes-list ul");
  const userQuizzesUL = document.querySelector(".user-quizzes-list ul");
  quizzesUL.innerHTML = "";
  userQuizzesUL.innerHTML = "";
  quizzes = response.data;
  const idListJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
  const idList = JSON.parse(idListJSON);
  quizzes.forEach((element) => {
    if (idList !== null) {
      if (idList.find((id) => id === element.id)) {
        userCreatedQuiz = true;
        userQuizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})">
              <img src="${element.image}"/>
              <div class="quizz-preview__linear-gradient">
                <p>${element.title}
                </p>
              </div>
              <div class="quizz-preview__options">
                <ion-icon name="create-outline" onclick = "editQuiz(${element.id})"></ion-icon>
                <ion-icon name="trash-outline" onclick = "deleteQuiz(${element.id})"></ion-icon>
              <div>
            </li>`;
      } else {
        quizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})">
            <img src="${element.image}"/>
            <div class="quizz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
      }
    } else {
      quizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})">
            <img src="${element.image}"/>
            <div class="quizz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
    }
  });
  if (userCreatedQuiz) {
    document
      .querySelector(".user-quizzes-list__empty-list")
      .classList.add("hidden");
    document
      .querySelector(".user-quizzes-list__header")
      .classList.remove("hidden");
  } else {
    document
      .querySelector(".user-quizzes-list__empty-list")
      .classList.remove("hidden");
    document
      .querySelector(".user-quizzes-list__header")
      .classList.add("hidden");
  }
  loadScreen(false);
}

function answerQuiz(quizId) {
  loadScreen(true);
  quizzSelectedID = quizId;
  screenFocus(".answer-quizz");
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
  totalQuestions = quizz.questions.length;
  quizz.questions.forEach((questions) => {
    sectionHTML.innerHTML += `<div class='questions--${cont}'></div>`;
    const questionsInnerHTML = document.querySelector(`.questions--${cont}`);

    questionsInnerHTML.innerHTML += `
      <div class="answer-quizz__question-tittle--${cont}">
        <h4>${questions.title}</h4>
      </div>`;
    questionsInnerHTML.innerHTML += `<div class="answer-quizz__answers--${cont}"></div>`;
    const questionTextColor = document.querySelector(
      `.answer-quizz__question-tittle--${cont}`
    );
    questionTextColor.style.setProperty("--text-color", `${questions.color}`);
    let randomQuestions = questions.answers.sort(() => Math.random() - 0.5);
    randomQuestions.forEach((answer) => {
      if (answer.isCorrectAnswer) {
        let quizzAnswers = document.querySelector(
          `.answer-quizz__answers--${cont}`
        );
        quizzAnswers.innerHTML += `
        <div class="answers correct-answer" onclick="selectAnswer(this)">
          <img src="${answer.image}" alt="answer-img">
          <span>${answer.text}</span>
        </div>
        `;
      } else {
        let quizzAnswers = document.querySelector(
          `.answer-quizz__answers--${cont}`
        );
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
  loadScreen(false);
}

function selectAnswer(playerAnswer) {
  let answersSection = playerAnswer.parentNode;
  const answers = answersSection.querySelectorAll(".answers");
  answers.forEach((el) => {
    el.style.pointerEvents = "none";
    if (el !== playerAnswer) {
      el.classList.add("changeOpacity");
    }
    const correctAnswer = answersSection.querySelector(".correct-answer");
    answersSection
      .querySelectorAll(".answers")
      .forEach((wrongAnswer) => wrongAnswer.classList.add("wrongAnswer"));
    correctAnswer.classList.add("correctColor");
  });

  if (playerAnswer.classList.contains("correct-answer")) {
    correctsCount += 1;
  }

  setTimeout(nextQuestion, 2000);
  countPlayerAnswer++;
  setTimeout(isFinish, 1500);
}

function nextQuestion() {
  let tittleArray = document.querySelector(".questions--" + questionCount);
  if (tittleArray) {
    tittleArray.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
  questionCount++;
}

function isFinish() {
  if (quizzOn) {
    if (totalQuestions === countPlayerAnswer) {
      quizzOn = false;
      const promisse = axios.get(`${QUIZ_API_URL}` + quizzSelectedID);
      const section = document.querySelector(".answer-quizz");
      promisse.then((response) => {
        let quizzLevel = response.data.levels;
        let playerLv = playerLevel();
        let lvArray = [];
        let closest = 0;
        quizzLevel.forEach((a) => lvArray.push(a.minValue));
        lvArray.forEach((el) => {
          if (playerLv >= el) {
            if (el >= closest) {
              closest = el;
            }
          }
          console.log(closest);
        });
        quizzLevel.forEach((el) => {
          if (el.minValue === closest) {
            section.innerHTML += `
            <div class="quizz-result">
              <div class="quizz-result__header">
                <h4>${playerLv}% ${el.title}</h4>
              </div>
              <div class="quizz-result__level">
                <img src="${el.image}" alt="quizz-result-img">
                <span>${el.text}</span>
              </div>
            </div>`;
          }
        });
        section.innerHTML += `
        <div class="answer-quizz__buttons">
          <button class="answer-quizz__play-again-button" onclick="playagain()">
            Reiniciar Quizz
          </button>
          <button class="answer-quizz__home-button" onclick="homePage()">
            Voltar para home
          </button>
        </div>`;
      });
      setTimeout(() => {
        let result = document.querySelector(".quizz-result");
        result.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 500);
    }
  }
}

function loadScreen(condition) {
  const loadScreen = document.querySelector(".loader-div");
  if (condition) {
    loadScreen.classList.remove("hidden");
  } else {
    loadScreen.classList.add("hidden");
  }
}

function homePage() {
  quizzOn = true;
  correctsCount = 0;
  questionCount = 2;
  totalQuestions = 0;
  countPlayerAnswer = 0;
  document.querySelector(".answer-quizz").innerHTML = "";
  getQuizzes();
  screenFocus(".quiz-list");
  document.querySelector(".user-quizzes-list").scrollIntoView();
}

function playerLevel() {
  let playerLvl = (correctsCount / totalQuestions) * 100;
  playerLvl = Math.round(playerLvl);
  return playerLvl;
}

function playagain() {
  quizzOn = true;
  correctsCount = 0;
  questionCount = 2;
  totalQuestions = 0;
  countPlayerAnswer = 0;
  document.querySelector(".answer-quizz").innerHTML = "";
  answerQuiz(quizzSelectedID);
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
    let nextIncorrectAnswer;
    do {
      let testIncorrectAnswer = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}`
      ).value;
      if (testIncorrectAnswer === "") {
        alert("Erro na resposta incorreta");
        return;
      }
      let testIncorrectAnswerImage = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}-image-URL`
      ).value;
      if (!isValidUrl(testIncorrectAnswerImage)) {
        alert("Erro na imagem da resposta incorreta");
        return;
      }
      j++;
      if (j === newQuizNumberOfQuestions) break;
      nextIncorrectAnswer = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}`
      ).value;
    } while (nextIncorrectAnswer);
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
        `#question${i + 1}-incorrect-answer${j}`
      ).value;
      let newIncorrectAnswerImage = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}-image-URL`
      ).value;
      newQuestionAnswers.push({
        text: newIncorrectAnswer,
        image: newIncorrectAnswerImage,
        isCorrectAnswer: false,
      });
      j++;
    } while (
      document.querySelector(`#question${i + 1}-incorrect-answer${j}`).value !=
      ""
    );
    let newQuestion = {
      title: newQuestionTitle,
      color: newQuestionColor,
      answers: newQuestionAnswers,
    };
    newQuizQuestions.push(newQuestion);
  }
  renderNewQuizLevelsInputs();
  document.querySelector(".quiz-creation__questions").classList.add("hidden");
  document.querySelector(".quiz-creation__levels").classList.remove("hidden");
  console.log(newQuizQuestions);
}

function createQuizFinalStep() {
  let level0 = false;
  for (let i = 0; i < newQuizNumberOfLevels; i++) {
    let newlevelTitle = document.querySelector(`#level${i + 1}-title`).value;
    let newLevelPercent = parseInt(
      document.querySelector(`#level${i + 1}-min-percent`).value
    );
    let newLevelImage = document.querySelector(
      `#level${i + 1}-image-URL`
    ).value;
    let newLevelDescription = document.querySelector(
      `#level${i + 1}-description`
    ).value;
    if (newlevelTitle.length < 10) {
      alert("Erro no título");
      return;
    }
    if (newLevelPercent < 0 || newLevelPercent >= 100) {
      alert("Erro no nível");
      return;
    }
    if (!isValidUrl(newLevelImage)) {
      alert("Erro na imagem");
      return;
    }
    if (newLevelDescription.length < 30) {
      alert("Erro na descrição");
      return;
    }
    if (newLevelPercent == 0) {
      level0 = true;
    }
    let newLevel = {
      title: newlevelTitle,
      image: newLevelImage,
      text: newLevelDescription,
      minValue: newLevelPercent,
    };
    newQuizLevels.push(newLevel);
  }
  if (!level0) {
    newQuizLevels = [];
    alert("Pelo menos ums dos níveis precisa ser 0");
    return;
  }
  newQuiz = {
    title: newQuizTitle,
    image: newQuizImage,
    questions: newQuizQuestions,
    levels: newQuizLevels,
  };
  let promisse = axios.post(QUIZ_API_URL, newQuiz);
  loadScreen(true);
  promisse.then((response) => {
    console.log(response);
    getQuizzes();
    pushQuizIdToLocalStorage(response.data.id);
    document
      .querySelector(".quiz-creation__success .quiz-preview img")
      .setAttribute("src", newQuizImage);
    document.querySelector(
      ".quiz-creation__success .quiz-preview p"
    ).innerHTML = newQuizTitle;
    document
      .querySelector(".quiz-creation__success button")
      .setAttribute("onclick", `answerQuiz(${response.data.id})`);
    document.querySelector(".quiz-creation__levels").classList.add("hidden");
    document
      .querySelector(".quiz-creation__success")
      .classList.remove("hidden");
    loadScreen(false);
  });
  promisse.catch((response) => {
    console.log(response);
    loadScreen(false);
  });
}

function pushQuizIdToLocalStorage(quizID) {
  let stringToArray = localStorage.getItem(LOCAL_STORAGE_KEY);
  console.log(stringToArray);
  if (stringToArray) {
    userQuizzIDs = JSON.parse(stringToArray);
    userQuizzIDs.push(quizID);
    let arrayToString = JSON.stringify(userQuizzIDs);
    localStorage.setItem(LOCAL_STORAGE_KEY, arrayToString);
  } else {
    userQuizzIDs.push(quizID);
    let arrayToString = JSON.stringify(userQuizzIDs);
    localStorage.setItem(LOCAL_STORAGE_KEY, arrayToString);
  }
}

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
  for (let i = 0; i < newQuizNumberOfQuestions; i++) {
    div.innerHTML += `<form action="">
    <h2>Pergunta ${i + 1}</h2>
    <ion-icon name="create-outline"></ion-icon>
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
  div.innerHTML += `<button onclick="createQuizStep2()">
    Prosseguir para criar níveis
  </button>`;
  let form = div.querySelectorAll("form");
  for (let i = 1; i < form.length; i++) {
    form[i].classList.add("form--accordion");
    form[i].setAttribute(
      "onclick",
      `openAccordionForm("quiz-creation__questions", ${i})`
    );
  }
}

function openAccordionForm(div, formToOpen) {
  let form = document.querySelectorAll(`.${div} form`);
  for (let i = 0; i < form.length; i++) {
    if (!form[i].classList.contains("form--accordion")) {
      form[i].classList.add("form--accordion");
      form[i].setAttribute("onclick", `openAccordionForm("${div}" ,${i})`);
    }
  }
  form[formToOpen].classList.remove("form--accordion");
  form[formToOpen].setAttribute("onclick", "");
  setTimeout(
    () =>
      window.scrollTo({
        top: findPos(form[formToOpen]) - 65,
        behavior: "smooth",
      }),
    500
  );
}

function findPos(obj) {
  var curtop = 0;
  if (obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return [curtop];
  }
}

function renderNewQuizLevelsInputs() {
  const div = document.querySelector(".quiz-creation__levels");
  div.innerHTML = `<h2>Agora, decida os níveis</h2>`;
  for (let i = 0; i < newQuizNumberOfLevels; i++) {
    div.innerHTML += `<form>
    <h2>Nível ${i + 1}</h2>
    <ion-icon name="create-outline"></ion-icon>
    <input type="text" id="level${i + 1}-title" placeholder="Título do nível" />
    <input
      type="text"
      id="level${i + 1}-min-percent"
      placeholder="% de acerto mínima"
    />
    <input
      type="text"
      id="level${i + 1}-image-URL"
      placeholder="URL da imagem do nível"
    />
    <textarea wrap 
      id="level${i + 1}-description"
      placeholder="Descrição do nível"
    ></textarea>
  </form>`;
  }
  div.innerHTML += `<button onclick="createQuizFinalStep()">Finalizar Quizz</button>`;
  let form = div.querySelectorAll("form");
  for (let i = 1; i < form.length; i++) {
    form[i].classList.add("form--accordion");
    form[i].setAttribute(
      "onclick",
      `openAccordionForm("quiz-creation__levels" ,${i})`
    );
  }
}

function editQuiz(quizID) {}

function deleteQuiz(quizID) {}

getQuizzes();

function teste() {
  document.querySelector(
    ".user-quizzes-list__empty-list"
  ).innerHTML = `<ul><li class="quizz-preview" onclick="answerQuiz(10)">
  <img src="https://ciclovivo.com.br/wp-content/uploads/2020/09/tree-3822149_1280.jpg"/>
  <div class="quizz-preview__linear-gradient">
    <p>Teste oioi
    </p>
  </div>
  <div class = "quizz-preview__options">
    <ion-icon name="create-outline"></ion-icon>
    <ion-icon name="trash-outline"></ion-icon>
  <div>
</li></ul>`;
}

function teste2() {
  screenFocus(".quiz-creation");
  document.querySelector(".quiz-creation__basic-info").classList.add("hidden");
  document
    .querySelector(".quiz-creation__questions")
    .classList.remove("hidden");
  newQuizNumberOfQuestions = 3;
  renderNewQuizQuestionsInputs();
}

function teste3() {
  let valorSerializado = localStorage.getItem(LOCAL_STORAGE_KEY);
  let valor = JSON.parse(valorSerializado);
  let promisse = axios.get(QUIZ_API_URL + valor[0]);
  promisse.then((response) => console.log(response.data));
}

// DESCOMENTAR ESSA FUNÇÃO PARA TESTAR CRIAÇÃO DE QUIZZ
// function createQuizz(){
//   let promisse = axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes',{
//     title: "AGORA FOI!",
//     image: "https://http.cat/411.jpg",
//     questions: [
//       {
//         title: "Título da pergunta 1",
//         color: "#123456",
//         answers: [
//           {
//             text: "Texto da resposta 1",
//             image: "https://http.cat/411.jpg",
//             isCorrectAnswer: true
//           },
//           {
//             text: "Texto da resposta 2",
//             image: "https://http.cat/412.jpg",
//             isCorrectAnswer: false
//           }
//         ]
//       },
//       {
//         title: "Título da pergunta 2",
//         color: "#123456",
//         answers: [
//           {
//             text: "Texto da resposta 1",
//             image: "https://http.cat/411.jpg",
//             isCorrectAnswer: true
//           },
//           {
//             text: "Texto da resposta 2",
//             image: "https://http.cat/412.jpg",
//             isCorrectAnswer: false
//           }
//         ]
//       },
//       {
//         title: "Título da pergunta 3",
//         color: "#123456",
//         answers: [
//           {
//             text: "Texto da resposta 1",
//             image: "https://http.cat/411.jpg",
//             isCorrectAnswer: true
//           },
//           {
//             text: "Texto da resposta 2",
//             image: "https://http.cat/412.jpg",
//             isCorrectAnswer: false
//           }
//         ]
//       }
//     ],
//     levels: [
//       {
//         title: "Título do nível 1",
//         image: "https://http.cat/411.jpg",
//         text: "Descrição do nível 1",
//         minValue: 0
//       },
//       {
//         title: "Título do nível 2",
//         image: "https://http.cat/412.jpg",
//         text: "Descrição do nível 2",
//         minValue: 50
//       }
//     ]
//   });
//   promisse.then((response)=> pushQuizIdToLocalStorage(response.data.id));
// }
//createQuizz();

/*
function renderQuizzesPreview(response) {
  userCreatedQuiz = false;
  const quizzesUL = document.querySelector(".all-quizzes-list ul");
  const userQuizzesUL = document.querySelector(".user-quizzes-list ul");
  quizzesUL.innerHTML = "";
  userQuizzesUL.innerHTML = "";
  quizzes = response.data;
  const idListJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
  const idList = JSON.parse(idListJSON);
  quizzes.forEach((element) => {
    if (idList !== null) {
      if (idList.find((id) => id === element.id)) {
        userCreatedQuiz = true;
        userQuizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})">
              <img src="${element.image}"/>
              <div class="quizz-preview__linear-gradient">
                <p>${element.title}
                </p>
              </div>
              <div class="quizz-preview__options">
                <ion-icon name="create-outline" onclick = "editQuiz(${element.id})"></ion-icon>
                <ion-icon name="trash-outline" onclick = "deleteQuiz(${element.id})"></ion-icon>
              <div>
            </li>`;
      } else {
        quizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})">
            <img src="${element.image}"/>
            <div class="quizz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
      }
    } else {
      quizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})">
            <img src="${element.image}"/>
            <div class="quizz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
    }
  });
  if (userCreatedQuiz) {
    document
      .querySelector(".user-quizzes-list__empty-list")
      .classList.add("hidden");
    document
      .querySelector(".user-quizzes-list__header")
      .classList.remove("hidden");
  } else {
    document
      .querySelector(".user-quizzes-list__empty-list")
      .classList.remove("hidden");
    document
      .querySelector(".user-quizzes-list__header")
      .classList.add("hidden");
  }
  loadScreen(false);
}*/
