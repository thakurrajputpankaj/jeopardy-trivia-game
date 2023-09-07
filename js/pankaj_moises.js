let base_url = 'https://jservice.io/api/';
let nOfCategories = 5
let nOfQuestions = 5
let random_url = `random?count=1`;
const totalCategories = 100;
let category_url = `categories?count=${totalCategories}`;
let revealQuestionContainer = document.getElementById('revealQuestion');
let revealAnswerContainer = document.getElementById('revealAnswer');

class question {
  constructor(title, category, answer, prize) {
    this.title = title
    this.category = category
    this.answer = answer
    this.prize = prize
  }
}

let categories_list = [];
let question_list = [];
let randomCategories = [];

async function store_values() {
  try {
    await delay(1000);
    let categories = await fetchCategories(category_url);
  
    //console.log(categories)
    categories_list = [];
    question_list = [];
    randomCategories = [];

    for (let i = 0; i < nOfCategories; i++) {
      const randomIndex = Math.floor(Math.random() * 50)
      if (!randomCategories.includes(categories[randomIndex])) {
        randomCategories.push(categories[randomIndex])
      }
      const category = randomCategories[i]
      await delay(1000);
      await fetchQuestions(category.id)
    }
    console.log(question_list)
    loadingScreen.style.display = 'none';
  } catch (error) {
    console.error("Error occurred:", error)
    loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
  }
}

function fetchCategories(sub_url) {
  return new Promise((resolve, reject) => {
    let full_url = base_url + sub_url
    var X = new XMLHttpRequest()
    X.open("GET", full_url, true)

    X.onload = () => {
      if (X.status == 200) {
        console.log("Connection Established");
        var response = JSON.parse(X.responseText);
        let categories = response.filter(category => category.clues_count > 5);
        //console.log(categories)
        resolve(categories);
      } else {
        loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
        reject(new Error(`HTTP status ${X.status}: ${X.statusText}`));
      }
    };

    X.onerror = () => {
      loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
      reject(new Error("Network Error"));
    };

    X.send();
  });
}


function fetchQuestions(categoryId) {
  let category_question = `category?id=${categoryId}`
  return new Promise((resolve, reject) => {
    let full_url = base_url + category_question;
    var X = new XMLHttpRequest()
    X.open("GET", full_url, true)

    X.onload = () => {
      if (X.status == 404) {
        loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
        reject(new Error("Not Found!"))
      }
      else if (X.status == 200) {
        console.log("Connection Established")
        var response = JSON.parse(X.responseText)

        if (!response.clues || !Array.isArray(response.clues)) {
          loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
          reject(new Error("Invalid response format"))
          return;
        }

        for (let i = 0; i < nOfQuestions; i++) {
          try {
            var _question = new question(
              response.clues[i].question,
              response.title,
              response.clues[i].answer,
              response.clues[i].value
            );
        
            if (_question.prize === null) {
              const randomPrize = [100, 200, 300, 400, 500][Math.floor(Math.random() * 5)];
              _question.prize = randomPrize;
            }
        
            question_list.push(_question);
          } catch (error) {
            loadingScreen.innerHTML = `<p>Failed Please Retry !</p>`;
          }
        }
        resolve();
      }else{
        loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
      }
    };

    X.onerror = () => {
      loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
      reject(new Error("Connection Error!"))
    };

    X.send();
  })
}

function createBoard() {
  let boardContainer = document.getElementById('board');

  try {
    for (let i = 0; i < nOfCategories; i++) {
      let categoryDiv = document.createElement('div');
      categoryDiv.className = 'categories'
      categoryDiv.textContent = randomCategories[i].title;
      boardContainer.appendChild(categoryDiv)
    }

    for (let j = 0; j < nOfQuestions; j++) {
      for (let i = 0; i < nOfCategories; i++) {
        let prizeDiv = document.createElement('div')
        prizeDiv.className = 'tile'
        
          prizeDiv.textContent = `$${question_list[i * nOfQuestions + j].prize}`

        boardContainer.appendChild(prizeDiv)

        prizeDiv.addEventListener('click', () => {
          showQuestion(question_list[i * nOfQuestions + j]);
          prizeDiv.className = 'highlighted'
        })
      }
    }
  } catch (error) {
    loadingScreen.innerHTML = '<p>Failed Please Retry !</p>';
    console.error("Error occurred in createBoard:", error);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  store_values().then(() => createBoard())
})

function showQuestion(question) {
  let questionRow = document.createElement("div")
  questionRow.id = "questionRow"
  revealQuestionContainer.innerHTML = ""
  revealAnswerContainer.innerHTML = ""
  questionRow.innerHTML = `<div class="answerRow">Category: ${question.category}</div>`
  questionRow.innerHTML += `<div class="answerRow">Question: ${question.title}</div`
  questionRow.innerHTML += `<div class="answerRow">Prize: $${question.prize}`
  questionRow.innerHTML += `<input id="userAnswer"></input>`
  questionRow.innerHTML += `<button id="submitBtn">Submit answer!!</button>`
  revealQuestionContainer.append(questionRow)

  let submitBtn = document.getElementById("submitBtn")
  submitBtn.addEventListener('click', () => {
    let userAnswer = document.getElementById("userAnswer").value
    showAnswer(question, userAnswer)
  })
}

function showAnswer(question, userAnswer) {
  let answerRow = document.createElement("div")
  answerRow.id = "answerRow"
  revealAnswerContainer.innerHTML = ""

  if (userAnswer.toLowerCase() === question.answer.toLowerCase()) {
    answerRow.innerHTML = `<div>Correct!!!</div>`
  } else {
    answerRow.innerHTML = `<div>Wrong! The correct answer is: ${question.answer}</div>`
  }

  revealAnswerContainer.append(answerRow)
}

document.getElementById('resetBtn').addEventListener('click', () => {
  loadingScreen.style.display = 'block'
  loadingScreen.innerHTML = 'Loading Please Wait...';
  const boardContainer = document.getElementById('board')
  boardContainer.innerHTML = ''
  store_values().then(() => createBoard())
  revealQuestionContainer.innerHTML = ""
  revealAnswerContainer.innerHTML = ""
})

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}