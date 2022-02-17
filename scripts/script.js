// GLOBAL VARIABLES
let quizzes;
const QUIZ_API_URL = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/';

// FUNCTIONS
function getQuizzes() {
  let promisse = axios.get(`${QUIZ_API_URL}`);
  promisse.then(renderQuizzesPreview);
}

function renderQuizzesPreview(response) {
  const quizzesUL = document.querySelector(".all-quizzes-list ul");
  quizzes = response.data;
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
  screenFocus(document.querySelector('.answer-quizz'));
  const promisse = axios.get(`${QUIZ_API_URL}` + quizId);
  promisse.then((response)=>printSelectedAnswer(response.data));
}

function printSelectedAnswer(quizz){
  const sectionHTML = document.querySelector('.answer-quizz');
  sectionHTML.innerHTML += `
  <div class="answer-quizz__header">
    <img src="${quizz.image}" alt="quizz-image">
    <h3>${quizz.title}</h3>
  </div>`
  let cont = 1;

  quizz.questions.forEach((questions)=>{
    sectionHTML.innerHTML += `<div class='questions--${cont}'></div>`;
    const questionsInnerHTML = document.querySelector(`.questions--${cont}`);
    questionsInnerHTML.innerHTML += `
      <div class="answer-quizz__question-tittle">
        <h4>${questions.title}</h4>
      </div>`
    questionsInnerHTML.innerHTML += `<div class="answer-quizz__answers--${cont}"></div>`;
    
    questions.answers.forEach((answer)=>{
      let quizzAnswers = document.querySelector(`.answer-quizz__answers--${cont}`);
      quizzAnswers.innerHTML += `
      <div class="answers" onclick="selectAnswer(this)">
        <img src="${answer.image}" alt="answer-img">
        <span>${answer.text}</span>
      </div>
      `
    });
    cont++;
  });
}

function selectAnswer(playerAnswer){
  let answersSection = playerAnswer.parentNode;
  const answers = answersSection.querySelectorAll('.answers');
  answers.forEach((el)=> {
    el.onclick = '';
    if (el !== playerAnswer){
      el.classList.add('changeOpacity');
    }
  });
  setTimeout(nextQuestion,2000);
}

function nextQuestion(){
  let tittleArray = document.querySelectorAll('.answer-quizz__question-tittle');
  tittleArray[1].scrollIntoView();
}

function screenFocus(sectionToFocus){
  const sections = document.querySelectorAll('section');
  sections.forEach((section)=> section.classList.add('hidden'));
  sectionToFocus.classList.remove('hidden');
}

getQuizzes();
