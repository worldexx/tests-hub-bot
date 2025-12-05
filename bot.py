import os
import telebot
from dotenv import load_dotenv

# Загружаем токен
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("Нет BOT_TOKEN в .env")

bot = telebot.TeleBot(BOT_TOKEN)


# ----------------- /START ----------------- #

@bot.message_handler(commands=["start"])
def handle_start(message):
    text = (
        "Привет! 👋\n\n"
        "Это tests hub bot.\n"
        "Нажми кнопку **Open** ниже, чтобы открыть приложение."
    )

    bot.send_message(
        message.chat.id,
        text,
        parse_mode="Markdown"
    )


# ----------------- ЗАПУСК ----------------- #

if __name__ == "__main__":
    print("Bot is running...")
    bot.infinity_polling()
