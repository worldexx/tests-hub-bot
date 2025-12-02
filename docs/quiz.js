// Получаем id теста из URL
const params = new URLSearchParams(location.search);
const testId = params.get("test");

async function loadTest() {
  const root = document.getElementById("quiz-root");

  if (!testId) {
    root.textContent = "Ошибка: testId не указан";
    return;
  }

  try {
    const res = await fetch(`tests/${testId}.json`);
    if (!res.ok) throw new Error("Тест не найден");
    const data = await res.json();
    renderQuiz(data);
  } catch (e) {
    root.textContent = "Ошибка загрузки теста";
  }
}

function renderQuiz(quiz) {
  const root = document.getElementById("quiz-root");

  root.innerHTML = `
    <h1 class="quiz-title">${quiz.title}</h1>
    <div id="questionBox"></div>
  `;

  let index = 0;
  let score = 0;

  function renderQuestion() {
    const question = quiz.questions[index];
    if (!question) return renderResult();

    const box = document.getElementById("questionBox");
    box.innerHTML = `
      <p class="q-text">${question.text}</p>
      <div class="q-opts">
        ${question.options
          .map(
            (o) => `
          <button class="q-btn" data-score="${o.score}">
            ${o.text}
          </button>`
          )
          .join("")}
      </div>
    `;

    document.querySelectorAll(".q-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        score += Number(btn.dataset.score);
        index++;
        renderQuestion();
      });
    });
  }

  function renderResult() {
    const res = quiz.results.find(r => score >= r.range[0] && score <= r.range[1]);

    root.innerHTML = `
      <h2>${res.title}</h2>
      <p>${res.description}</p>
      <button id="sendTG">Отправить в Telegram</button>
    `;

    document.getElementById("sendTG").onclick = () => {
      if (window.Telegram?.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
          testId: quiz.id,
          score,
          result: res.title
        }));
        Telegram.WebApp.close();
      } else {
        alert("Открой через Telegram");
      }
    };
  }

  renderQuestion();
}

loadTest();
