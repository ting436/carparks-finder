from dotenv import load_dotenv
import os
import telebot
from telebot import types
import time
import threading

load_dotenv()

BOT_TOKEN = os.environ.get('BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN environment variable is not set.")

bot = telebot.TeleBot(BOT_TOKEN)

user_locations = {}
EXPIRY_SECONDS = 600

@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    share_location_button = types.KeyboardButton("📍 Share Location", request_location=True)
    markup.add(share_location_button)
    bot.send_message(message.chat.id,
                    "Welcome to the Location & Carpark Bot!\n\n"
                    "Please share your location to obtain the availabilities of the nearest carparks around you.", 
                    reply_markup=markup)

@bot.message_handler(content_types=['location'])
def handle_location(message):
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)    
    carpark_button = types.KeyboardButton("🅿️ Carpark Availability")
    markup.add(carpark_button)

    user_id = message.from_user.id
    latitude = message.location.latitude
    longitude = message.location.longitude

    user_locations[user_id] = {
        'latitude': latitude,
        'longitude': longitude,
        'timestamp': time.time()
    }

    bot.send_message(message.chat.id,
                    "Thank you for sharing your location!\n\n" \
                    "Please select the carpark availability option below to check the nearest carparks around you.", 
                    reply_markup=markup)

@bot.message_handler(func=lambda message: message.text == "🅿️ Carpark Availability")
def show_carpark_availability(message):
    
    bot.send_message(message.chat.id, 
                    "yay")


def cleanup_locations():
    while True:
        current_time = time.time()
        expired_users = []

        for user_id, data in user_locations.items():
            if current_time - data['timestamp'] > EXPIRY_SECONDS:
                expired_users.append(user_id)

        for user_id in expired_users:
            del user_locations[user_id]
            print(f"Removed expired location for user {user_id}")

        time.sleep(60)

cleanup_thread = threading.Thread(target=cleanup_locations, daemon=True)
cleanup_thread.start()

bot.infinity_polling()