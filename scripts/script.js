// GLOBAL VARIABLES
let quizzes;

// FUNCTIONS
function getQuizzes() {
  let promisse = axios.get(
    "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes"
  );
  promisse.then(renderQuizzesPreview);
}

function renderQuizzesPreview(response) {
  const quizzesUL = document.querySelector(".all-quizzes-list ul");
  quizzes = response.data;
  console.log(quizzes);
  quizzes.forEach((element) => {
    quizzesUL.innerHTML += `
    <li class="quiz-preview" onclick="answerQuiz(${element.id})">
            <img src=${element.image}/>
            <div class="quiz-preview__linear-gradient">
              <p>${element.title}
              </p>
            </div>
          </li>`;
  });
}

function answerQuiz(quiz) {
  //teu cógigo aqui
  console.log("A ID da quiz é: " + quiz);
}

getQuizzes();
