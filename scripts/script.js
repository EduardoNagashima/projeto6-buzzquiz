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
let quizToEdit = null;
let quizToDelete = null;
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
      if (idList.find((id) => id.id === element.id)) {
        userCreatedQuiz = true;
        userQuizzesUL.innerHTML += `<li class="quizz-preview" data-identifier="quizz-card">
              <img src="${element.image}"/>
              <div class="quizz-preview__linear-gradient" onclick="answerQuiz(${element.id})">
                <p >${element.title}
                </p>
              </div>
              <div class="quizz-preview__options">
                <ion-icon name="create-outline" onclick = "editQuiz(${element.id})"></ion-icon>
                <ion-icon name="trash-outline" onclick = "deleteQuiz(${element.id})"></ion-icon>
              <div>
            </li>`;
      } else {
        quizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})" data-identifier="quizz-card">
            <img src="${element.image}"/>
            <div class="quizz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
      }
    } else {
      quizzesUL.innerHTML += `<li class="quizz-preview" onclick="answerQuiz(${element.id})" data-identifier="quizz-card">
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
  document
    .querySelector(".quiz-creation__basic-info")
    .classList.remove("hidden");
  document.querySelector(".quiz-creation__success").classList.add("hidden");
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
      <div class="answer-quizz__question-tittle--${cont}" data-identifier="question">
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
        <div class="answers correct-answer" onclick="selectAnswer(this)" data-identifier="answer">
          <img src="${answer.image}" alt="answer-img">
          <span>${answer.text}</span>
        </div>
        `;
      } else {
        let quizzAnswers = document.querySelector(
          `.answer-quizz__answers--${cont}`
        );
        quizzAnswers.innerHTML += `
        <div class="answers" onclick="selectAnswer(this)" data-identifier="answer">
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
  const allQuestion = document.querySelectorAll(".answers");
  for (let i = 0; i < allQuestion.length; i++) {
    if (
      allQuestion[i].classList.contains("wrongAnswer") ||
      allQuestion[i].classList.contains("correctColor")
    ) {
    } else {
      const questionTittle = allQuestion[i].parentNode.parentNode;
      questionTittle.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      break;
    }
  }
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
        });
        quizzLevel.forEach((el) => {
          if (el.minValue === closest) {
            section.innerHTML += `
            <div class="quizz-result" data-identifier="quizz-result">
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

  let validationError = false;

  if (newQuizTitle.length < 20 || newQuizTitle.length > 65) {
    validationError = true;
    document
      .querySelector("#quiz-title")
      .classList.add("quiz-creation__input--validation-error");
    document
      .querySelector("#quiz-title")
      .nextElementSibling.classList.remove("hidden");
  }
  if (!isValidUrl(newQuizImage)) {
    validationError = true;
    document
      .querySelector("#quiz-URL")
      .classList.add("quiz-creation__input--validation-error");
    document
      .querySelector("#quiz-URL")
      .nextElementSibling.classList.remove("hidden");
  }
  if (newQuizNumberOfQuestions < 3) {
    validationError = true;
    document
      .querySelector("#quiz-questions")
      .classList.add("quiz-creation__input--validation-error");
    document
      .querySelector("#quiz-questions")
      .nextElementSibling.classList.remove("hidden");
  }
  if (newQuizNumberOfLevels < 2) {
    validationError = true;
    document
      .querySelector("#quiz-levels")
      .classList.add("quiz-creation__input--validation-error");
    document
      .querySelector("#quiz-levels")
      .nextElementSibling.classList.remove("hidden");
  }

  if (validationError) {
    return;
  }

  renderNewQuizQuestionsInputs();
  document.querySelector(".quiz-creation__basic-info").classList.add("hidden");
  document
    .querySelector(".quiz-creation__questions")
    .classList.remove("hidden");
}

function createQuizStep2() {
  let validationError = false;
  for (let i = 0; i < newQuizNumberOfQuestions; i++) {
    let testQuestion = document.querySelector(`#question${i + 1}`);
    if (testQuestion.value.length < 20) {
      validationError = true;
      testQuestion.classList.add("quiz-creation__input--validation-error");
      testQuestion.nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-question${i + 1}`)
        .classList.remove("form--accordion");
    }
    let testQuestionColor = document.querySelector(`#question${i + 1}-color`);
    if (!isValidHexColor(testQuestionColor.value)) {
      validationError = true;
      testQuestionColor.classList.add("quiz-creation__input--validation-error");
      testQuestionColor.nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-question${i + 1}`)
        .classList.remove("form--accordion");
    }
    let testCorrectAnswer = document.querySelector(
      `#question${i + 1}-correct-answer`
    );
    if (testCorrectAnswer.value.length === "") {
      validationError = true;
      testCorrectAnswer.classList.add("quiz-creation__input--validation-error");
      testCorrectAnswer.nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-question${i + 1}`)
        .classList.remove("form--accordion");
    }
    let testCorrectAnswerImage = document.querySelector(
      `#question${i + 1}-correct-answer-image-URL`
    );
    if (!isValidUrl(testCorrectAnswerImage.value)) {
      validationError = true;
      testCorrectAnswerImage.classList.add(
        "quiz-creation__input--validation-error"
      );
      testCorrectAnswerImage.nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-question${i + 1}`)
        .classList.remove("form--accordion");
    }
    let j = 1;
    let nextIncorrectAnswer;
    do {
      let testIncorrectAnswer = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}`
      );
      if (testIncorrectAnswer.value === "") {
        validationError = true;
        testIncorrectAnswer.classList.add(
          "quiz-creation__input--validation-error"
        );
        testIncorrectAnswer.nextElementSibling.classList.remove("hidden");
        document
          .querySelector(`#form-question${i + 1}`)
          .classList.remove("form--accordion");
      }
      let testIncorrectAnswerImage = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}-image-URL`
      );
      if (!isValidUrl(testIncorrectAnswerImage.value)) {
        validationError = true;
        testIncorrectAnswerImage.classList.add(
          "quiz-creation__input--validation-error"
        );
        testIncorrectAnswerImage.nextElementSibling.classList.remove("hidden");
        document
          .querySelector(`#form-question${i + 1}`)
          .classList.remove("form--accordion");
      }
      j++;
      if (j === newQuizNumberOfQuestions) break;
      nextIncorrectAnswer = document.querySelector(
        `#question${i + 1}-incorrect-answer${j}`
      ).value;
    } while (nextIncorrectAnswer);
  }
  if (validationError) {
    return;
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
}

function createQuizFinalStep() {
  let level0 = false;
  let validationError = false;
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
      validationError = true;
      document
        .querySelector(`#level${i + 1}-title`)
        .classList.add("quiz-creation__input--validation-error");
      document
        .querySelector(`#level${i + 1}-title`)
        .nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-level${i + 1}`)
        .classList.remove("form--accordion");
    }
    if (newLevelPercent < 0 || newLevelPercent > 100) {
      validationError = true;
      document
        .querySelector(`#level${i + 1}-min-percent`)
        .classList.add("quiz-creation__input--validation-error");
      document
        .querySelector(`#level${i + 1}-min-percent`)
        .nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-level${i + 1}`)
        .classList.remove("form--accordion");
    }
    if (!isValidUrl(newLevelImage)) {
      validationError = true;
      document
        .querySelector(`#level${i + 1}-image-URL`)
        .classList.add("quiz-creation__input--validation-error");
      document
        .querySelector(`#level${i + 1}-image-URL`)
        .nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-level${i + 1}`)
        .classList.remove("form--accordion");
    }
    if (newLevelDescription.length < 30) {
      validationError = true;
      document
        .querySelector(`#level${i + 1}-description`)
        .classList.add("quiz-creation__input--validation-error");
      document
        .querySelector(`#level${i + 1}-description`)
        .nextElementSibling.classList.remove("hidden");
      document
        .querySelector(`#form-level${i + 1}`)
        .classList.remove("form--accordion");
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
  if (validationError) {
    newQuizLevels = [];
    return;
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
  if (quizToEdit) {
    let stringToArray = localStorage.getItem(LOCAL_STORAGE_KEY);
    let userQuizzIDs = JSON.parse(stringToArray);
    let quizToEditSecretKey;
    for (let i = 0; i < userQuizzIDs.length; i++) {
      if (quizToEdit.id === userQuizzIDs[i].id) {
        quizToEditSecretKey = userQuizzIDs[i].key;
        break;
      }
    }
    let config = {
      headers: {
        "Secret-Key": quizToEditSecretKey,
      },
    };
    let promisse = axios.put(QUIZ_API_URL + quizToEdit.id, newQuiz, config);
    loadScreen(true);
    promisse.then(() => {
      getQuizzes();
      document
        .querySelector(".quiz-creation__success .quizz-preview img")
        .setAttribute("src", newQuizImage);
      document.querySelector(
        ".quiz-creation__success .quizz-preview p"
      ).innerHTML = newQuizTitle;
      document
        .querySelector(".quiz-creation__success button")
        .setAttribute("onclick", `answerQuiz(${quizToEdit.id})`);
      document.querySelector(".quiz-creation__levels").classList.add("hidden");
      document
        .querySelector(".quiz-creation__success")
        .classList.remove("hidden");
      loadScreen(false);
      quizToEdit = null;
      newQuizLevels = [];
      newQuizQuestions = [];
    });
    return;
  }
  let promisse = axios.post(QUIZ_API_URL, newQuiz);
  loadScreen(true);
  promisse.then((response) => {
    getQuizzes();
    pushQuizIdToLocalStorage(response.data.id, response.data.key);
    document
      .querySelector(".quiz-creation__success .quizz-preview img")
      .setAttribute("src", newQuizImage);
    document.querySelector(
      ".quiz-creation__success .quizz-preview p"
    ).innerHTML = newQuizTitle;
    document
      .querySelector(".quiz-creation__success button")
      .setAttribute("onclick", `answerQuiz(${response.data.id})`);
    document.querySelector(".quiz-creation__levels").classList.add("hidden");
    document
      .querySelector(".quiz-creation__success")
      .classList.remove("hidden");
    loadScreen(false);
    newQuizLevels = [];
    newQuizQuestions = [];
  });
  promisse.catch((response) => {
    loadScreen(false);
    newQuizLevels = [];
    newQuizQuestions = [];
  });
}

function removeValidationError(element, validationFunction) {
  if (validationFunction(element.value)) {
    element.classList.remove("quiz-creation__input--validation-error");
    element.nextElementSibling.classList.add("hidden");
  }
}

function validateQuizTitle(title) {
  if (title.length >= 20 && title.length <= 65) {
    return true;
  }
  return false;
}

function validateQuizImage(image) {
  if (isValidUrl(image)) {
    return true;
  }
  return false;
}

function validateQuizNumberOfQuestions(number) {
  if (number >= 3) {
    return true;
  }
  return false;
}

function validateQuizNumberOfLevels(number) {
  if (number >= 2) {
    return true;
  }
  return false;
}

function validateColor(color) {
  if (isValidHexColor(color)) {
    return true;
  }
  return false;
}

function validateQuestionTitle(title) {
  if (title.length >= 20) {
    return true;
  }
  return false;
}

function validateLevelTitle(title) {
  if (title.length >= 10) {
    return true;
  }
  return false;
}

function validateLevelPercent(percent) {
  if (percent >= 0 && percent <= 100) {
    return true;
  }
  return false;
}

function validateLevelDescription(description) {
  if (description.length >= 30) {
    return true;
  }
  return false;
}

function pushQuizIdToLocalStorage(quizID, quizKey) {
  let stringToArray = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stringToArray) {
    userQuizzIDs = JSON.parse(stringToArray);
    userQuizzIDs.push({ id: quizID, key: quizKey });
    let arrayToString = JSON.stringify(userQuizzIDs);
    localStorage.setItem(LOCAL_STORAGE_KEY, arrayToString);
  } else {
    userQuizzIDs.push({ id: quizID, key: quizKey });
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
    div.innerHTML += `<form action="" data-identifier="question" id="form-question${
      i + 1
    }">
    <h2>Pergunta ${i + 1}</h2>
    <ion-icon name="create-outline" data-identifier="expand"></ion-icon>
    <input type="text" id="question${
      i + 1
    }" placeholder="Texto da pergunta" oninput="removeValidationError(this, validateQuestionTitle)">
    <p class="quiz-creation__p--validation-error hidden">
      A pergunta deve ter no mínimo 20 caracteres
    </p>
    <input type="text" id="question${
      i + 1
    }-color" placeholder="Cor de fundo da pergunta" class="quiz-creation__questions--large-margin-bottom" oninput="removeValidationError(this, validateColor)">
    <p class="quiz-creation__p--validation-error hidden">
      A cor de fundo deve ser uma cor em hexadecimal
    </p>
    <h2>Resposta correta</h2>
    <input type="text" id="question${
      i + 1
    }-correct-answer" placeholder="Resposta correta">
    <p class="quiz-creation__p--validation-error hidden">
      A resposta não pode estar vazia
    </p>
    <input type="text" id="question${
      i + 1
    }-correct-answer-image-URL" placeholder="URL da imagem" class="quiz-creation__questions--large-margin-bottom" oninput="removeValidationError(this, validateQuizImage)">
    <p class="quiz-creation__p--validation-error hidden">
      O valor informado não é uma URL válida
    </p>
    <h2>Respostas incorretas</h2>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer1" placeholder="Resposta incorreta 1">
    <p class="quiz-creation__p--validation-error hidden">
      A resposta não pode estar vazia
    </p>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer1-image-URL" placeholder="URL da imagem 1" class="quiz-creation__questions--large-margin-bottom" oninput="removeValidationError(this, validateQuizImage)">
    <p class="quiz-creation__p--validation-error hidden">
      O valor informado não é uma URL válida
    </p>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer2" placeholder="Resposta incorreta 2">
    <p class="quiz-creation__p--validation-error hidden">
      A resposta não pode estar vazia
    </p>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer2-image-URL" placeholder="URL da imagem 2" class="quiz-creation__questions--large-margin-bottom" oninput="removeValidationError(this, validateQuizImage)">
    <p class="quiz-creation__p--validation-error hidden">
      O valor informado não é uma URL válida
    </p>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer3" placeholder="Resposta incorreta 3">
    <p class="quiz-creation__p--validation-error hidden">
      A resposta não pode estar vazia
    </p>
    <input type="text" id="question${
      i + 1
    }-incorrect-answer3-image-URL" placeholder="URL da imagem 3" oninput="removeValidationError(this, validateQuizImage)">
    <p class="quiz-creation__p--validation-error hidden">
      O valor informado não é uma URL válida
    </p>
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
  if (quizToEdit) {
    for (let i = 0; i < newQuizNumberOfQuestions; i++) {
      if (!quizToEdit.questions[i]) {
        break;
      }
      document.querySelector(
        `.quiz-creation__questions #question${i + 1}`
      ).value = quizToEdit.questions[i].title;
      document.querySelector(
        `.quiz-creation__questions #question${i + 1}-color`
      ).value = quizToEdit.questions[i].color;
      document.querySelector(
        `.quiz-creation__questions #question${i + 1}-correct-answer`
      ).value = quizToEdit.questions[i].answers[0].text;
      document.querySelector(
        `.quiz-creation__questions #question${i + 1}-correct-answer-image-URL`
      ).value = quizToEdit.questions[i].answers[0].image;
      document.querySelector(
        `.quiz-creation__questions #question${i + 1}-incorrect-answer1`
      ).value = quizToEdit.questions[i].answers[1].text;
      document.querySelector(
        `.quiz-creation__questions #question${
          i + 1
        }-incorrect-answer1-image-URL`
      ).value = quizToEdit.questions[i].answers[1].image;
      if (quizToEdit.questions[i].answers[2]) {
        document.querySelector(
          `.quiz-creation__questions #question${i + 1}-incorrect-answer2`
        ).value = quizToEdit.questions[i].answers[2].text;
        document.querySelector(
          `.quiz-creation__questions #question${
            i + 1
          }-incorrect-answer2-image-URL`
        ).value = quizToEdit.questions[i].answers[2].image;
      }
      if (quizToEdit.questions[i].answers[3]) {
        document.querySelector(
          `.quiz-creation__questions #question${i + 1}-incorrect-answer3`
        ).value = quizToEdit.questions[i].answers[3].text;
        document.querySelector(
          `.quiz-creation__questions #question${
            i + 1
          }-incorrect-answer3-image-URL`
        ).value = quizToEdit.questions[i].answers[3].image;
      }
    }
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
    div.innerHTML += `<form data-identifier="level" id="form-level${i + 1}">
    <h2>Nível ${i + 1}</h2>
    <ion-icon name="create-outline" data-identifier="expand"></ion-icon>
    <input type="text" id="level${
      i + 1
    }-title" placeholder="Título do nível" oninput="removeValidationError(this, validateLevelTitle)" />
    <p class="quiz-creation__p--validation-error hidden">
      O título deve ter no mínimo 10 caracteres
    </p>
    <input
      type="text"
      id="level${i + 1}-min-percent"
      placeholder="% de acerto mínima"
      oninput="removeValidationError(this, validateLevelPercent)"
    />
    <p class="quiz-creation__p--validation-error hidden">
      O nível deve ser um número entre 0 e 100
    </p>
    <input
      type="text"
      id="level${i + 1}-image-URL"
      placeholder="URL da imagem do nível"
      oninput="removeValidationError(this, validateQuizImage)"
    />
    <p class="quiz-creation__p--validation-error hidden">
      O valor informado não é uma URL válida
    </p>
    <textarea wrap 
      id="level${i + 1}-description"
      placeholder="Descrição do nível"
      oninput="removeValidationError(this, validateLevelDescription)"
    ></textarea>
    <p class="quiz-creation__p--validation-error hidden">
      Mínimo de 30 caracteres
    </p>
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
  if (quizToEdit) {
    for (let i = 0; i < newQuizNumberOfLevels; i++) {
      if (!quizToEdit.levels[i]) {
        break;
      }
      document.querySelector(
        `.quiz-creation__levels #level${i + 1}-title`
      ).value = quizToEdit.levels[i].title;
      document.querySelector(
        `.quiz-creation__levels #level${i + 1}-min-percent`
      ).value = quizToEdit.levels[i].minValue;
      document.querySelector(
        `.quiz-creation__levels #level${i + 1}-image-URL`
      ).value = quizToEdit.levels[i].image;
      document.querySelector(
        `.quiz-creation__levels #level${i + 1}-description`
      ).value = quizToEdit.levels[i].text;
    }
  }
}

function editQuiz(quizID) {
  let promisse = axios.get(QUIZ_API_URL + quizID);
  promisse.then((response) => {
    let quiz = response.data;
    quizToEdit = quiz;
    document.querySelector(".quiz-creation__basic-info #quiz-title").value =
      quiz.title;
    document.querySelector(".quiz-creation__basic-info #quiz-URL").value =
      quiz.image;
    document.querySelector(".quiz-creation__basic-info #quiz-questions").value =
      quiz.questions.length;
    document.querySelector(".quiz-creation__basic-info #quiz-levels").value =
      quiz.levels.length;
    screenFocus(".quiz-creation");
  });
}

function goHomeEditQuiz() {
  screenFocus(".quiz-list");
  document.querySelector(".quiz-creation__success").classList.add("hidden");
  document
    .querySelector(".quiz-creation__basic-info")
    .classList.remove("hidden");
  getQuizzes();
}

function deleteQuiz(quizID) {
  const result = window.confirm("Deseja excluir esse Quizz?");
  if (result) {
    quizToDeleteID = quizID;
    let stringToArray = localStorage.getItem(LOCAL_STORAGE_KEY);
    let userQuizzIDs = JSON.parse(stringToArray);
    let quizToDeleteSecretKey;
    for (let i = 0; i < userQuizzIDs.length; i++) {
      if (quizToDeleteID === userQuizzIDs[i].id) {
        quizToDeleteSecretKey = userQuizzIDs[i].key;
        break;
      }
    }
    let config = {
      headers: {
        "Secret-Key": quizToDeleteSecretKey,
      },
    };
    loadScreen(true);
    let promisse = axios.delete(QUIZ_API_URL + quizToDeleteID, config);
    promisse.then(() => getQuizzes());
  } else {
    getQuizzes();
  }
}

getQuizzes();

// function createQuizz() {
//   let promisse = axios.post(
//     "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes",
//     {
//       title: "AGORA FOI! com Secret Key ahlakjdhasdjk",
//       image: "https://http.cat/411.jpg",
//       questions: [
//         {
//           title: "Título da pergunta 1",
//           color: "#123456",
//           answers: [
//             {
//               text: "Texto da resposta 1",
//               image: "https://http.cat/411.jpg",
//               isCorrectAnswer: true,
//             },
//             {
//               text: "Texto da resposta 2",
//               image: "https://http.cat/412.jpg",
//               isCorrectAnswer: false,
//             },
//           ],
//         },
//         {
//           title: "Título da pergunta 2",
//           color: "#123456",
//           answers: [
//             {
//               text: "Texto da resposta 1",
//               image: "https://http.cat/411.jpg",
//               isCorrectAnswer: true,
//             },
//             {
//               text: "Texto da resposta 2",
//               image: "https://http.cat/412.jpg",
//               isCorrectAnswer: false,
//             },
//           ],
//         },
//         {
//           title: "Título da pergunta 3",
//           color: "#123456",
//           answers: [
//             {
//               text: "Texto da resposta 1",
//               image: "https://http.cat/411.jpg",
//               isCorrectAnswer: true,
//             },
//             {
//               text: "Texto da resposta 2",
//               image: "https://http.cat/412.jpg",
//               isCorrectAnswer: false,
//             },
//           ],
//         },
//       ],
//       levels: [
//         {
//           title: "Título do nível 1",
//           image: "https://http.cat/411.jpg",
//           text: "Descrição do nível 1fhgfhgfhfghfghfghfhfghfgf",
//           minValue: 0,
//         },
//         {
//           title: "Título do nível 2",
//           image: "https://http.cat/412.jpg",
//           text: "Descrição do nível 2ghfghfghfghfhfghfhghfgfhghf",
//           minValue: 50,
//         },
//       ],
//     }
//   );
//   promisse.then((response) => {
//     pushQuizIdToLocalStorage(response.data.id, response.data.key);
//   });
// }
// createQuizz();
