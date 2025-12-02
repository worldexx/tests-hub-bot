const tg = window.Telegram?.WebApp;

// Чуть адаптируемся под тёмную тему Telegram
try {
  tg?.expand();
  tg?.setBackgroundColor("#020617");
} catch (e) {
  // локальный запуск в браузере – ок
}

// --- ДАННЫЕ ТЕСТА ---

const quiz = {
  id: "social_vibe_2025",
  title: "Какой у тебя социальный вайб в 2025?",
  questions: [
    {
      id: 1,
      text: "Как ты реагируешь, когда тебе звонят?",
      options: [
        { id: "A", text: "Паника. Смотрю на звонок 10 секунд.", score: 2 },
        { id: "B", text: "Сбрасываю и пишу «а что?»", score: 3 },
        { id: "C", text: "Беру трубку, будто это важный договор.", score: 1 },
        { id: "D", text: "Игнорирую, но потом стыдно.", score: 0 }
      ]
    },
    {
      id: 2,
      text: "Какой у тебя режим переписки?",
      options: [
        { id: "A", text: "Отвечаю через 0,2 секунды.", score: 3 },
        { id: "B", text: "Через 2 часа.", score: 1 },
        { id: "C", text: "Через 2 дня, но будто ничего не было.", score: 2 },
        { id: "D", text: "Через 2 недели, но очень тепло.", score: 0 }
      ]
    },
    {
      id: 3,
      text: "Какой звук — твой внутренний процессор?",
      options: [
        { id: "A", text: "пинг-пинг-пинг уведомления", score: 3 },
        { id: "B", text: "ммм… ладно…", score: 0 },
        { id: "C", text: "кринж-трус-трус", score: 1 },
        { id: "D", text: "бааам — идея!", score: 2 }
      ]
    },
    {
      id: 4,
      text: "Что ты делаешь, когда кто-то лайкнул старую фотку?",
      options: [
        { id: "A", text: "Думаю, что он следит.", score: 3 },
        { id: "B", text: "Думаю, что это ошибка.", score: 0 },
        { id: "C", text: "Думаю, что это судьба.", score: 2 },
        { id: "D", text: "Думаю, что это ловушка.", score: 1 }
      ]
    },
    {
      id: 5,
      text: "Как ты ведёшь себя на вечеринке?",
      options: [
        { id: "A", text: "Наблюдаю, но улыбаюсь.", score: 0 },
        { id: "B", text: "Становлюсь душой компании.", score: 3 },
        { id: "C", text: "Убегаю на кухню и говорю с котом.", score: 1 },
        { id: "D", text: "Делаю неожиданный мув, и все обсуждают.", score: 2 }
      ]
    },
    {
      id: 6,
      text: "Что ты заказываешь в кофейне, когда не знаешь, чего хочешь?",
      options: [
        { id: "A", text: "Капучино — универсальный солдат.", score: 1 },
        { id: "B", text: "Латте, потому что безопасно.", score: 0 },
        { id: "C", text: "Флэт уайт — будто ты из Берлина.", score: 2 },
        { id: "D", text: "Чай. Против системы.", score: 3 }
      ]
    },
    {
      id: 7,
      text: "Как ты флиртуешь?",
      options: [
        { id: "A", text: "Я НЕ флиртую. Я — ошибка системы.", score: 0 },
        { id: "B", text: "Могу, но случайно.", score: 1 },
        { id: "C", text: "Через мемы.", score: 2 },
        { id: "D", text: "Уверенно, но странно.", score: 3 }
      ]
    },
    {
      id: 8,
      text: "Как ты ведёшь себя в новой компании?",
      options: [
        { id: "A", text: "Молчу, пока не почувствую вайб.", score: 0 },
        { id: "B", text: "Вхожу и начинаю рофлить.", score: 3 },
        { id: "C", text: "Разговариваю мягко.", score: 1 },
        { id: "D", text: "Говорю странный комментарий и запоминаюсь.", score: 2 }
      ]
    },
    {
      id: 9,
      text: "Какой твой стиль общения?",
      options: [
        { id: "A", text: "Короткие фразы.", score: 0 },
        { id: "B", text: "Голосовые на 2 минуты.", score: 2 },
        { id: "C", text: "Мемные картинки.", score: 3 },
        { id: "D", text: "Глубокие мысли в 3 утра.", score: 1 }
      ]
    },
    {
      id: 10,
      text: "Что ты чаще всего говоришь друзьям?",
      options: [
        { id: "A", text: "Пошли домой.", score: 0 },
        { id: "B", text: "Я нормальный, просто устал.", score: 1 },
        { id: "C", text: "Смотри какой мем.", score: 3 },
        { id: "D", text: "Короче… есть идея.", score: 2 }
      ]
    }
  ],
  results: [
    {
      range: [0, 8],
      title: "Тихий Наблюдатель",
      description:
        "Спокойный, мягкий, социально точный. В компании — человек-уют."
    },
    {
      range: [9, 14],
      title: "Социальный Хаос-Гений",
      description:
        "Появляешься неожиданно, меняешь вайб комнаты, исчезаешь. Странно харизматичный и непредсказуемый."
    },
    {
      range: [15, 20],
      title: "Мемный Коммуникатор",
      description:
        "Разговариваешь мемами, думаешь мемами и флиртуешь мемами. Человек-вайб современности."
    },
    {
      range: [21, 30],
      title: "Уверенный Интроверт",
      description:
        "Не любишь лишние контакты, но умеешь включать харизму в нужный момент. Точный, редкий тип."
    }
  ]
};

// --- СОСТОЯНИЕ ---

let currentIndex = 0;
let currentScore = 0;
let selectedOptionId = null;

// --- ЭЛЕМЕНТЫ ---

const questionEl = document.getElementById("question-text");
const optionsEl = document.getElementById("options");
const progressBarEl = document.getElementById("progress-bar");
const nextBtn = document.getElementById("next-btn");

// --- РЕНДЕР ВОПРОСА ---

function renderQuestion() {
  const total = quiz.questions.length;
  if (currentIndex >= total) {
    renderResult();
    return;
  }

  const q = quiz.questions[currentIndex];
  questionEl.textContent = q.text;

  optionsEl.innerHTML = "";
  selectedOptionId = null;
  nextBtn.disabled = true;

  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.text;
    btn.dataset.id = opt.id;

    btn.addEventListener("click", () => {
      // сбрасываем выделение
      document
        .querySelectorAll(".option-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedOptionId = opt.id;
      nextBtn.disabled = false;
    });

    optionsEl.appendChild(btn);
  });

  const progress = ((currentIndex) / total) * 100;
  progressBarEl.style.width = `${progress}%`;
}

// --- ПОИСК РЕЗУЛЬТАТА ПО БАЛЛАМ ---

function getResult(score) {
  return (
    quiz.results.find(
      (res) => score >= res.range[0] && score <= res.range[1]
    ) || {
      title: "Неопознанный вайб",
      description: "Ты вне шкалы. Уникальный эксперимент реальности."
    }
  );
}

// --- ФИНАЛЬНЫЙ ЭКРАН ---

function renderResult() {
  const total = quiz.questions.length;
  progressBarEl.style.width = "100%";

  const result = getResult(currentScore);

  questionEl.innerHTML = `
    <div class="result-title">${result.title}</div>
    <div class="result-score">Очки: ${currentScore} / ${total * 3}</div>
    <div class="result-desc">${result.description}</div>
  `;

  optionsEl.innerHTML = `
    <div class="result-actions">
      <button id="send-tg" class="btn btn-secondary">Отправить результат в Telegram</button>
      <button id="retry" class="btn btn-outline">Пройти ещё раз</button>
      <p class="small">Если ты открыл это не из Telegram, кнопка отправки может ничего не делать 🙂</p>
    </div>
  `;

  nextBtn.style.display = "none";

  document.getElementById("retry").onclick = () => {
    currentIndex = 0;
    currentScore = 0;
    nextBtn.style.display = "";
    renderQuestion();
  };

  document.getElementById("send-tg").onclick = () => {
    const payload = {
      quizId: quiz.id,
      score: currentScore,
      title: result.title
    };

    if (tg && typeof tg.sendData === "function") {
      tg.sendData(JSON.stringify(payload));
      tg.close();
    } else {
      alert("Эту кнопку нужно нажимать внутри Telegram 😊");
    }
  };
}

// --- ОБРАБОТЧИК КНОПКИ "ДАЛЕЕ" ---

nextBtn.addEventListener("click", () => {
  if (selectedOptionId == null) return;

  const q = quiz.questions[currentIndex];
  const opt = q.options.find((o) => o.id === selectedOptionId);
  if (opt) {
    currentScore += opt.score;
  }
  currentIndex += 1;
  renderQuestion();
});

// старт
renderQuestion();
