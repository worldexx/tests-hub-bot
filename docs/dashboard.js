// ---- TELEGRAM WEBAPP И АНТИ-СВАЙП ДЛЯ ДАШБОРДА ----

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

    // Блокируем скролл (чтобы не смахнуть мини-апп)
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

    if (isMobile() && tg.requestFullscreen) {
      setTimeout(() => tg.requestFullscreen(), 500);
    }
  }
} catch (e) {
  console.warn("Telegram WebApp init error (dashboard)", e);
}


// подставляем ник из Telegram, если есть
(function setUserInfo() {
  const initData = tg?.initDataUnsafe;
  const usernameEl = document.getElementById("username");
  const accountEl = document.getElementById("accountType");

  if (initData?.user) {
    const u = initData.user;
    const name =
      u.username || `${u.first_name || ""} ${u.last_name || ""}`.trim();
    if (name) usernameEl.textContent = name;
    accountEl.textContent = "basic account";
  }
})();

// грузим список тестов
async function loadTests() {
  try {
    const resp = await fetch("tests/index.json");
    if (!resp.ok) throw new Error("fetch failed");
    const tests = await resp.json();
    renderTests(tests);
  } catch (e) {
    console.error(e);
    document.getElementById("testsGrid").innerHTML =
      "<div style='font-size:13px;color:#9ca3af'>не удалось загрузить тесты</div>";
  }
}

function renderTests(tests) {
  const grid = document.getElementById("testsGrid");
  grid.innerHTML = "";

  tests.forEach((t) => {
    const card = document.createElement("div");
    card.className = "test-card";

    card.onclick = () => openTest(t.id);

    card.innerHTML = `
      <div>
        <div class="test-header">
          <div class="test-emoji">${t.emoji || "🧩"}</div>
          <div class="test-pill">test</div>
        </div>
        <div class="test-title">${t.title}</div>
        <div class="test-tagline">${t.tagline || ""}</div>
      </div>
      
    `;
    grid.appendChild(card);
  });
}

function openTest(testId) {
  const base = location.pathname.replace(/index\.html?$/, "");
  const url = `${base}quiz.html?test=${encodeURIComponent(testId)}`;
  window.location.href = url;
}

loadTests();
