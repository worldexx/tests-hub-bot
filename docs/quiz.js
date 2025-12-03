// ---- TELEGRAM WEBAPP И АНТИ-СВАЙП ----

const tg = window.Telegram?.WebApp;

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

try {
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setClosingBehavior) {
      tg.setClosingBehavior("none");
    }

    // Блокируем скролл (чтобы не смахнуть случайно)
    document.addEventListener(
      "touchmove",
      (e) => e.preventDefault(),
      { passive: false }
    );

    // Блокируем кнопку "назад"
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      window.history.pushState(null, "", window.location.href);
    });

    // На мобилках пробуем fullscreen
    if (isMobile() && tg.requestFullscreen) {
      setTimeout(() => tg.requestFullscreen(), 500);
    }
  }
} catch (e) {
  console.warn("Telegram WebApp init error", e);
}

// ---- ЗАГРУЗКА ТЕСТА ПО ID ----

const params = new URLSearchParams(location.search);
const testId = params.get("test");

async function loadTest() {
  const root = document.getElementById("quiz-root");

  if (!testId) {
    root.textContent = "Ошибка: не указан testId в URL";
    return;
  }

  try {
    const res = await fetch(`tests/${testId}.json`);
    if (!res.ok) throw new Error("Тест не найден");
    const data = await res.json();
    renderQuiz(data);
  } catch (e) {
    console.error(e);
    root.textContent = "Ошибка загрузки теста";
  }
}

// ---- РЕНДЕР ТЕСТА ----

function renderQuiz(quiz) {
  const root = document.getElementById("quiz-root");

  root.innerHTML = `
    <div class="quiz-shell">
      <header class="quiz-header">
        <button class="back-btn" id="backBtn">← tests</button>
        <div class="quiz-title-block">
          <div class="quiz-title-main">${quiz.title}</div>
          <div class="quiz-progress-text" id="progressText"></div>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" id="progressFill"></div>
          </div>
        </div>
      </header>

      <main class="quiz-main">
        <div class="quiz-directions">
          <div class="dir dir-up" id="dirUp"></div>
          <div class="dir dir-left" id="dirLeft"></div>
          <div class="dir dir-right" id="dirRight"></div>
          <div class="dir dir-down" id="dirDown"></div>
        </div>

        <div class="card-wrapper">
          <div class="question-card" id="questionCard">
            <div class="q-label">вопрос</div>
            <div class="q-text" id="qText"></div>
            <div class="hint">свайпай в сторону ответа</div>
          </div>
        </div>
      </main>
    </div>
  `;

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    // Возврат на index / дашборд
    const base = location.pathname.replace(/quiz\.html?$/, "");
    location.href = base;
  });

  let index = 0;
  let score = 0;

  function updateProgress() {
    const total = quiz.questions.length;
    const current = Math.min(index + 1, total);
    const percent = Math.round((current - 1) / total * 100);
    const textEl = document.getElementById("progressText");
    const fillEl = document.getElementById("progressFill");

    textEl.textContent = `Вопрос ${current}/${total} · ${percent}%`;
    fillEl.style.width = `${percent}%`;
  }

  function mapDirections(options) {
    // Возвращает объект {left, right, up, down} = option или null
    const dirs = { left: null, right: null, up: null, down: null };

    if (options.length === 1) {
      dirs.down = options[0];
    } else if (options.length === 2) {
      dirs.left = options[0];
      dirs.right = options[1];
    } else if (options.length === 3) {
      dirs.left = options[0];
      dirs.right = options[1];
      dirs.down = options[2];
    } else {
      // 4 и больше — берем первые 4
      dirs.left = options[0];
      dirs.right = options[1];
      dirs.up = options[2];
      dirs.down = options[3];
    }

    return dirs;
  }

  function renderQuestion() {
    const question = quiz.questions[index];
    if (!question) {
      return renderResult();
    }

    updateProgress();

    const qTextEl = document.getElementById("qText");
    const dirUpEl = document.getElementById("dirUp");
    const dirLeftEl = document.getElementById("dirLeft");
    const dirRightEl = document.getElementById("dirRight");
    const dirDownEl = document.getElementById("dirDown");

    qTextEl.textContent = question.text;

    const dirs = mapDirections(question.options);

    // подписываем подсказки по сторонам
    dirUpEl.textContent = dirs.up ? dirs.up.text : "";
    dirLeftEl.textContent = dirs.left ? dirs.left.text : "";
    dirRightEl.textContent = dirs.right ? dirs.right.text : "";
    dirDownEl.textContent = dirs.down ? dirs.down.text : "";

    [dirUpEl, dirLeftEl, dirRightEl, dirDownEl].forEach((el) => {
      if (el.textContent) el.classList.add("visible");
      else el.classList.remove("visible");
    });

    // навешиваем свайпы
    setupSwipe(dirs, (chosenOption) => {
      score += Number(chosenOption.score || 0);
      index += 1;
      renderQuestion();
    });
  }

  function renderResult() {
    const totalMax = quiz.questions.length * 3;
    const result = quiz.results.find(
      (r) => score >= r.range[0] && score <= r.range[1]
    ) || {
      title: "Неопознанный вайб",
      description: "Ты вне шкалы, отдельная экспериментальная сущность."
    };

    const root = document.getElementById("quiz-root");
    root.innerHTML = `
      <div class="quiz-shell result-shell">
        <header class="quiz-header">
          <button class="back-btn" id="backBtn2">← tests</button>
          <div class="quiz-title-block">
            <div class="quiz-title-main">${quiz.title}</div>
          </div>
        </header>

        <main class="quiz-main result-main">
          <div class="result-card">
            <div class="result-label">твой результат</div>
            <div class="result-title">${result.title}</div>
            <div class="result-score">Очки: ${score} / ${totalMax}</div>
            <div class="result-desc">${result.description}</div>

            <div class="result-actions">
              <button class="primary-btn" id="retryBtn">Пройти ещё раз</button>
              <button class="ghost-btn" id="backToTests">Вернуться к тестам</button>
            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById("backBtn2").onclick = () => {
      const base = location.pathname.replace(/quiz\.html?$/, "");
      location.href = base;
    };
    document.getElementById("backToTests").onclick = () => {
      const base = location.pathname.replace(/quiz\.html?$/, "");
      location.href = base;
    };
    document.getElementById("retryBtn").onclick = () => {
      // Перезапускаем тест
      index = 0;
      score = 0;
      renderQuiz(quiz);
    };
  }

  renderQuestion();
}

// ---- ЛОГИКА СВАЙПОВ ----

let swipeHandlerAttached = false;

function setupSwipe(directionsMap, onChosen) {
  const card = document.getElementById("questionCard");
  if (!card) return;

  // Чтобы не навешивать миллион раз — сначала снимаем старые
  if (swipeHandlerAttached) {
    card.replaceWith(card.cloneNode(true));
  }
  const newCard = document.getElementById("questionCard");
  swipeHandlerAttached = true;

  let startX = 0;
  let startY = 0;
  let isTouch = false;

  function onStart(e) {
    isTouch = true;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function onEnd(e) {
    if (!isTouch) return;
    isTouch = false;

    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const threshold = 40; // минимальный свайп

    if (dist < threshold) {
      // слишком короткий свайп
      newCard.classList.add("shake");
      setTimeout(() => newCard.classList.remove("shake"), 200);
      return;
    }

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    let direction = null;

    if (absX > absY) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    const option =
      direction === "left"
        ? directionsMap.left
        : direction === "right"
        ? directionsMap.right
        : direction === "up"
        ? directionsMap.up
        : directionsMap.down;

    if (!option) {
      newCard.classList.add("shake");
      setTimeout(() => newCard.classList.remove("shake"), 200);
      return;
    }

    // небольшая анимация «вылета» карточки
    newCard.classList.add(`fly-${direction}`);
    setTimeout(() => {
      onChosen(option);
    }, 180);
  }

  newCard.addEventListener("touchstart", onStart, { passive: true });
  newCard.addEventListener("touchend", onEnd);
  // Для десктопа мышью
  newCard.addEventListener("mousedown", onStart);
  newCard.addEventListener("mouseup", onEnd);
}

loadTest();
