import os
import json
import telebot
from telebot import types
from dotenv import load_dotenv

# загружаем .env
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("Нет BOT_TOKEN в .env")

bot = telebot.TeleBot(BOT_TOKEN)

# URL твоего мини-аппа (дашборд с тестами)
MINI_APP_URL = "https://worldexx.github.io/tests-hub-bot/"

# Человеческие названия тестов по id (для оформления ответа)
TEST_TITLES = {
    "social_vibe_2025": "Социальный вайб 2025",
    # сюда будешь добавлять другие тесты: "brainrot_persona": "Какой ты brainrot-персонаж?"
}


# ----------------- КОМАНДЫ ----------------- #

@bot.message_handler(commands=["start"])
def handle_start(message: types.Message):
    """
    Приветствие + кнопка для открытия мини-аппа.
    """
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True)
    open_app_btn = types.KeyboardButton(
        "🚀 Открыть tests hub",
        web_app=types.WebAppInfo(url=MINI_APP_URL)
    )
    kb.add(open_app_btn)

    text = (
        "Привет! Я *tests hub bot*.\n\n"
        "Нажми кнопку ниже, чтобы открыть мини-приложение с тестами.\n"
        "Там выбери тест, пройди его, а результат вернётся сюда 👇"
    )

    bot.send_message(
        message.chat.id,
        text,
        parse_mode="Markdown",
        reply_markup=kb
    )


# Если хочешь отдельную команду для мини-аппа
@bot.message_handler(commands=["app"])
def handle_app(message: types.Message):
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True)
    open_app_btn = types.KeyboardButton(
        "🚀 Открыть tests hub",
        web_app=types.WebAppInfo(url=MINI_APP_URL)
    )
    kb.add(open_app_btn)

    bot.send_message(
        message.chat.id,
        "Жми кнопку, чтобы открыть мини-апп 👇",
        reply_markup=kb
    )


# ----------------- ПРИЁМ ДАННЫХ ИЗ MINI APP ----------------- #

@bot.message_handler(content_types=["web_app_data"])
def handle_web_app_data(message: types.Message):
    """
    Сюда прилетает payload из Telegram.WebApp.sendData(...)
    из твоего quiz.js.
    Ожидаем формат: { testId, score, result }
    """
    raw = message.web_app_data.data

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        bot.send_message(
            message.chat.id,
            f"Получил данные из мини-аппа, но не смог разобрать:\n`{raw}`",
            parse_mode="Markdown"
        )
        return

    test_id = data.get("testId") or data.get("quizId")
    score = data.get("score")
    result_title = data.get("result") or data.get("title")

    nice_test_name = TEST_TITLES.get(test_id, test_id or "Неизвестный тест")

    text_lines = [
        "✨ *Результат теста из mini app*",
        "",
        f"*Тест:* {nice_test_name}",
    ]

    if result_title:
        text_lines.append(f"*Тип:* {result_title}")
    if score is not None:
        text_lines.append(f"*Баллы:* {score}")

    bot.send_message(
        message.chat.id,
        "\n".join(text_lines),
        parse_mode="Markdown"
    )


# ----------------- ЗАПУСК ----------------- #

if __name__ == "__main__":
    print("tests hub bot is running...")
    bot.infinity_polling()
