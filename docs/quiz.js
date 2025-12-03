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

    // Блокируем скролл
    document.addEventListener(
      "touchmove",
      (e) => e.preventDefault(),
      { passive: false }
    );

    // Блокируем "назад"
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      window.history.pushState(null, "", window.location.href);
    });

    if (isMobile() && tg.requestFullscreen) {
      setTimeout(() => tg.requestFullscreen(), 500);
    }
  }
} catch (e) {
  console.warn("Telegram WebApp init error", e);
}

// ---- ЗАГРУЗКА ТЕСТА ----

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
            <div class="q-label">ВОПРОС</div>
            <div class="q-text" id="qText"></div>
            <div class="hint">свайпай карточку в сторону ответа</div>
          </div>
        </div>
      </main>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => {
    const base = location.pathname.replace(/quiz\.html?$/, "");
    location.href = base;
  };

  let index = 0;
  let score = 0;

  function updateProgress() {
    const total = quiz.questions.length;
    const current = Math.min(index + 1, total);
    const percent = Math.round(((current - 1) / total) * 100);
    document.getElementById(
      "progressText"
    ).textContent = `Вопрос ${current}/${total} · ${percent}%`;
    document.getElementById("progressFill").style.width = `${percent}%`;
  }

  function mapDirections(options) {
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
      dirs.left = options[0];
      dirs.right = options[1];
      dirs.up = options[2];
      dirs.down = options[3];
    }

    return dirs;
  }

  function renderQuestion() {
    const question = quiz.questions[index];
    if (!question) return renderResult();

    updateProgress();

    const qTextEl = document.getElementById("qText");
    const dirUpEl = document.getElementById("dirUp");
    const dirLeftEl = document.getElementById("dirLeft");
    const dirRightEl = document.getElementById("dirRight");
    const dirDownEl = document.getElementById("dirDown");

    qTextEl.textContent = question.text;

    const dirs = mapDirections(question.options);

    dirUpEl.textContent = dirs.up ? dirs.up.text : "";
    dirLeftEl.textContent = dirs.left ? dirs.left.text : "";
    dirRightEl.textContent = dirs.right ? dirs.right.text : "";
    dirDownEl.textContent = dirs.down ? dirs.down.text : "";

    [dirUpEl, dirLeftEl, dirRightEl, dirDownEl].forEach((el) => {
      if (el.textContent) el.classList.add("visible");
      else el.classList.remove("visible");
      el.classList.remove("active");
    });

    const card = document.getElementById("questionCard");
    setupSwipe(card, dirs, (chosen) => {
      score += Number(chosen.score || 0);
      index += 1;
      renderQuestion();
    });
  }

  function renderResult() {
    const totalMax = quiz.questions.length * 3;
    const result =
      quiz.results.find(
        (r) => score >= r.range[0] && score <= r.range[1]
      ) || {
        title: "Неопознанный вайб",
        description: "Ты вне шкалы, отдельная экспериментальная сущность."
      };

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

    document.getElementById("backBtn2").onclick =
      document.getElementById("backToTests").onclick =
        () => {
          const base = location.pathname.replace(/quiz\.html?$/, "");
          location.href = base;
        };
    document.getElementById("retryBtn").onclick = () => renderQuiz(quiz);
  }

  renderQuestion();
}

// ---- ТИНДЕР-СТАЙЛ СВАЙП ----

function setupSwipe(card, directionsMap, onChosen) {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let dragging = false;

  const dirEls = {
    left: document.getElementById("dirLeft"),
    right: document.getElementById("dirRight"),
    up: document.getElementById("dirUp"),
    down: document.getElementById("dirDown")
  };

  function resetCard() {
    card.style.transform = "";
    card.classList.remove(
      "fly-left",
      "fly-right",
      "fly-up",
      "fly-down",
      "snap-back"
    );
  }

  function highlightDirection(dir) {
    Object.entries(dirEls).forEach(([name, el]) => {
      if (!el) return;
      if (name === dir) el.classList.add("active");
      else el.classList.remove("active");
    });
  }

  function getDirection(dx, dy) {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX < 10 && absY < 10) return null;
    if (absX > absY) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  }

  function handleStart(e) {
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    currentX = startX;
    currentY = startY;
    dragging = true;
    card.style.transition = "none";
  }

  function handleMove(e) {
    if (!dragging) return;
    const touch = e.touches ? e.touches[0] : e;
    currentX = touch.clientX;
    currentY = touch.clientY;

    const dx = currentX - startX;
    const dy = currentY - startY;

    const rotate = dx * 0.04; // лёгкий наклон
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;

    const dir = getDirection(dx, dy);
    highlightDirection(dir);
  }

  function handleEnd(e) {
    if (!dragging) return;
    dragging = false;
    card.style.transition = "";

    const dx = currentX - startX;
    const dy = currentY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const dir = getDirection(dx, dy);
    highlightDirection(null);

    const threshold = 80;

    if (!dir || dist < threshold) {
      // недотянули — возвращаем карточку назад
      resetCard();
      card.classList.add("snap-back");
      setTimeout(() => card.classList.remove("snap-back"), 180);
      return;
    }

    const option =
      dir === "left"
        ? directionsMap.left
        : dir === "right"
        ? directionsMap.right
        : dir === "up"
        ? directionsMap.up
        : directionsMap.down;

    if (!option) {
      resetCard();
      card.classList.add("snap-back");
      setTimeout(() => card.classList.remove("snap-back"), 180);
      return;
    }

    // улетает в выбранную сторону
    card.classList.add(`fly-${dir}`);
    setTimeout(() => {
      resetCard();
      onChosen(option);
    }, 200);
  }

  // навешиваем свежие обработчики (перезаписываем старые)
  card.onmousedown = handleStart;
  card.onmousemove = handleMove;
  card.onmouseup = handleEnd;
  card.onmouseleave = handleEnd;

  card.ontouchstart = handleStart;
  card.ontouchmove = handleMove;
  card.ontouchend = handleEnd;
}

loadTest();
