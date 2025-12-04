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

// ---- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
        <div class="quiz-question-text" id="qText"></div>

        <div class="quiz-layout">
          <div class="quiz-directions">
            <div class="dir dir-up" id="dirUp"></div>
            <div class="dir dir-left" id="dirLeft"></div>
            <div class="dir dir-right" id="dirRight"></div>
            <div class="dir dir-down" id="dirDown"></div>
          </div>

          <div class="card-wrapper">
            <div class="question-card" id="questionCard">
              <div class="q-label">свайп</div>
              <div class="hint">тянь карточку в сторону ответа</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => {
    const base = location.pathname.replace(/quiz\.html?$/, "");
    location.href = base;
  };

  // ---------- ОПРЕДЕЛЕНИЕ РЕЖИМОВ ТЕСТА ----------

  const firstQuestion = quiz.questions?.[0];
  const firstOption = firstQuestion?.options?.[0];

  const firstOptionScore = firstOption?.score;
  const hasCorrectId = !!firstQuestion?.correct_option_id;

  const isPersonaMode =
    typeof firstOptionScore === "object" && firstOptionScore !== null;

  const isSimpleScoreMode =
    !isPersonaMode && typeof firstOptionScore === "number";

  const isIqMode =
    !isPersonaMode &&
    (!isSimpleScoreMode &&
      (quiz.type === "iq" ||
        quiz.rules?.mode === "formula" ||
        hasCorrectId));

  // рандомизация вариантов (по умолчанию true, кроме явного shuffleOptions: false)
  const shuffleOptions = quiz.shuffleOptions !== false;

  let index = 0;

  // Старый режим: один общий балл
  let totalScore = 0;

  // Режим персонажей
  const personaScores = {};
  if (isPersonaMode && Array.isArray(quiz.characters)) {
    quiz.characters.forEach((id) => {
      personaScores[id] = 0;
    });
  }

  // IQ / formula режим
  let correctCount = 0;

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
      // >= 4 — берём первые 4
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

    const optionsForThisRun = shuffleOptions
      ? shuffleArray(question.options)
      : question.options;

    const dirs = mapDirections(optionsForThisRun);

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
      // ----- режимы подсчёта -----

      if (isPersonaMode) {
        const scoreObj = chosen.score || {};
        for (const key in scoreObj) {
          if (!Object.prototype.hasOwnProperty.call(scoreObj, key)) continue;
          if (personaScores[key] == null) personaScores[key] = 0;
          personaScores[key] += Number(scoreObj[key] || 0);
        }
      } else if (isIqMode) {
        if (question.correct_option_id && chosen.id === question.correct_option_id) {
          correctCount += 1;
        }
      } else if (isSimpleScoreMode) {
        totalScore += Number(chosen.score || 0);
      }

      index += 1;
      renderQuestion();
    });
  }

  function runFormula(expr, context, fallback) {
    if (!expr) return fallback;
    try {
      const argNames = Object.keys(context);
      const argValues = Object.values(context);
      // expr типа "correctCount" или "Math.round(correctCount / questionsCount * 100)"
      // eslint-disable-next-line no-new-func
      const fn = new Function(...argNames, `return ${expr};`);
      const val = fn(...argValues);
      return Number.isFinite(val) ? val : fallback;
    } catch (e) {
      console.warn("Formula eval error", e);
      return fallback;
    }
  }

  function renderResult() {
    // ---------- ВЫБОР РЕЗУЛЬТАТА ----------
    let result;
    let scoreInfoText = "";

    if (isPersonaMode) {
      // Ищем персонажа с максимальным количеством очков
      const entries = Object.entries(personaScores);
      const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
      const sorted = entries.sort((a, b) => b[1] - a[1]);

      const [bestId] = sorted[0];
      result = quiz.results.find((r) => r.id === bestId) || quiz.results[0];

      const mixTop = sorted.slice(0, 3).map(([id, value]) => {
        const pct = Math.round((value / total) * 100);
        const res = quiz.results.find((r) => r.id === id);
        return {
          title: res ? res.title : id,
          pct
        };
      });

      scoreInfoText = mixTop.map((m) => `${m.title}: ${m.pct}%`).join(" · ");
    } else if (isIqMode) {
      const questionsCount = quiz.questions.length;
      let score = correctCount;
      let maxScore = questionsCount;

      if (quiz.rules && quiz.rules.mode === "formula") {
        const ctx = { correctCount, questionsCount };
        score = runFormula(quiz.rules.scoreFormula || "correctCount", ctx, score);
        maxScore = runFormula(
          quiz.rules.maxScoreFormula || "questionsCount",
          ctx,
          maxScore
        );
      }

      scoreInfoText = `Очки: ${score} / ${maxScore}`;

      result =
        quiz.results.find(
          (r) =>
            Array.isArray(r.range) &&
            score >= r.range[0] &&
            score <= r.range[1]
        ) || quiz.results[quiz.results.length - 1];
    } else {
      // Старый режим по диапазонам (score на вариантах)

      const totalMax = quiz.questions.reduce((sum, q) => {
        if (!Array.isArray(q.options) || q.options.length === 0) return sum;
        const maxInQuestion = Math.max(
          ...q.options.map((o) => Number(o.score || 0))
        );
        return sum + (Number.isFinite(maxInQuestion) ? maxInQuestion : 0);
      }, 0);

      scoreInfoText = `Очки: ${totalScore} / ${totalMax}`;

      result =
        quiz.results.find(
          (r) =>
            Array.isArray(r.range) &&
            totalScore >= r.range[0] &&
            totalScore <= r.range[1]
        ) || quiz.results[quiz.results.length - 1];
    }

    // ---------- РЕНДЕР РЕЗУЛЬТАТА ----------

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
            <div class="result-score">${scoreInfoText}</div>
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

  // стартуем с первого вопроса
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

    const rotate = dx * 0.04;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;

    const dir = getDirection(dx, dy);
    highlightDirection(dir);
  }

  function handleEnd() {
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

    card.classList.add(`fly-${dir}`);
    setTimeout(() => {
      resetCard();
      onChosen(option);
    }, 200);
  }

  card.onmousedown = handleStart;
  card.onmousemove = handleMove;
  card.onmouseup = handleEnd;
  card.onmouseleave = handleEnd;

  card.ontouchstart = handleStart;
  card.ontouchmove = handleMove;
  card.ontouchend = handleEnd;
}

// ---- СТАРТ ПРИ ЗАГРУЗКЕ ----

loadTest();
