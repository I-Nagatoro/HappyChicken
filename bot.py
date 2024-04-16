import telebot
from telebot import types
import requests
import mysql.connector
import urllib3
import json



TOKEN='7040842460:AAEVVtwpVDmuP8cXoMBI9-wcRPaXifJ4ag8'
bot = telebot.TeleBot(TOKEN)
bot_thread = None  # Объявляем переменную bot_thread как глобальную

from flask import Flask

bot_app = Flask(__name__)

chat_id = None

# def write_id():
#     print('asdasdasd')
#     print(chat_id)
#     requests.post('https://127.0.0.1:80/update_chat_id', json={'chat_id': chat_id}, verify=False)

@bot.message_handler(commands=['start'])
def start(message):
    # Обработка команды /start
    global chat_id
    chat_id=message.chat.id
    bot.send_message(message.chat.id, 'Кур-кур привет!')
    # write_id()
    send_contact_request(message)

def send_contact_request(message):
    # Отправляем запрос на отправку контакта
    keyboard = types.ReplyKeyboardMarkup(one_time_keyboard=True)
    reg_button = types.KeyboardButton(text="Отправить номер телефона", request_contact=True)
    keyboard.add(reg_button)
    nomer = bot.send_message(message.chat.id, 'Оставьте Ваш контактный номер для верификации.', reply_markup=keyboard)
    # Устанавливаем обработчик следующего шага
    bot.register_next_step_handler(nomer, check_contact)

def check_contact(message):
    # Проверяем, что пользователь отправил контакт
    if message.content_type == 'contact':
        # Если контакт отправлен, вызываем функцию для сохранения номера телефона
        save(message)
    else:
        # Если контакт не отправлен, отправляем сообщение с просьбой отправить номер телефона
        send_contact_request(message)  # Повторно отправляем запрос на отправку контакта

def save(message):
    phone_number = message.contact.phone_number
    user_id = message.from_user.id
    user_name = message.from_user.username
    print(phone_number)
    if phone_number[0]=="+":
        phone_number[1:]
    print(phone_number)
    reg=check_phone_number(phone_number)
    if reg==1:
        try:
            connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='vertrigo',
                database='delivery'
            )
            if connection.is_connected():
                cursor = connection.cursor()
        
                # Выполняем SQL-запрос для вставки данных в таблицу users
                sql = "INSERT INTO users (id, name, phone_number) VALUES (%s, %s, %s)"
                values = (user_id, user_name, phone_number)
                cursor.execute(sql, values)

                # Подтверждаем изменения в базе данных
                connection.commit()

                # Закрываем курсор и соединение
                cursor.close()
                connection.close()
                bot.send_message(message.chat.id, 'Спасибо. Данные обновлены.', reply_markup=types.ReplyKeyboardRemove())
            else:
                 bot.send_message(message.chat.id, 'Ошибка подключения к базе данных.')
        except mysql.connector.Error as error:
            bot.send_message(message.chat.id, 'Ошибка при работе с базой данных: {}'.format(error))
            
    elif reg==2:
        with open('client.txt', 'a') as doc:
            doc.write("Phone number {telephon}, User ID {user_id}, User Name {user_name}\n".format(telephon=phone_number, user_id=user_id, user_name=user_name))
            bot.send_message(message.chat.id, 'Спасибо. Данные обновлены.', reply_markup=types.ReplyKeyboardRemove())
    elif reg==3:
        with open('client.txt', 'a') as doc:
            doc.write("Phone number {telephon}, User ID {user_id}, User Name {user_name}\n".format(telephon=phone_number, user_id=user_id, user_name=user_name))
            try:
                connection = mysql.connector.connect(
                    host='localhost',
                    user='root',
                    password='vertrigo',
                    database='delivery'
                )
                if connection.is_connected():
                    cursor = connection.cursor()

                    # Выполняем SQL-запрос для вставки данных в таблицу users
                    sql = "INSERT INTO users (id, name, phone_number) VALUES (%s, %s, %s)"
                    values = (user_id, user_name, phone_number)
                    cursor.execute(sql, values)

                    # Подтверждаем изменения в базе данных
                    connection.commit()

                    # Закрываем курсор и соединение
                    cursor.close()
                    connection.close()

                    # Отправляем сообщение о успешной регистрации
                    bot.send_message(message.chat.id, 'Спасибо. Теперь вы можете заказывать.', reply_markup=types.ReplyKeyboardRemove())
                else:
                    bot.send_message(message.chat.id, 'Ошибка подключения к базе данных.')
            except mysql.connector.Error as error:
                bot.send_message(message.chat.id, 'Ошибка при работе с базой данных: {}'.format(error))
    else:
        bot.send_message(message.chat.id, 'Ваш номер телефона уже зарегистрирован.', reply_markup=types.ReplyKeyboardRemove())
        
    send_menu(message)    

def check_phone_number(phone_number):
    # Проверяем наличие номера телефона в текстовом файле
    text_file_exists = False
    with open('client.txt', 'r') as doc:
        for line in doc:
            if phone_number in line:
                text_file_exists = True
                break
    
    # Проверяем наличие номера телефона в базе данных
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='vertrigo',
            database='delivery'
        )
        cursor = connection.cursor()

        sql = "SELECT * FROM users WHERE phone_number = %s"
        cursor.execute(sql, (phone_number,))

        db_exists = bool(cursor.fetchone())

        cursor.close()
        connection.close()

        # Возвращаем результат проверки
        if text_file_exists and db_exists:
            return 0  # Номер присутствует и в текстовом файле, и в базе данных
        elif text_file_exists:
            return 1  # Номер присутствует только в текстовом файле
        elif db_exists:
            return 2  # Номер присутствует только в базе данных
        else:
            return 3  # Номер не найден ни в текстовом файле, ни в базе данных
    except mysql.connector.Error as error:
        bot.send_message('Ошибка при работе с базой данных: {}'.format(error))
    
def send_menu(message):
    markup = types.InlineKeyboardMarkup()  # Создаем клавиатуру
    web_info = types.WebAppInfo('https://127.0.0.1:80?chat_id=' + str(message.chat.id))
    button1 = types.InlineKeyboardButton("Заказать", web_app=web_info)  # Создаем кнопку "Заказать" с ссылкой на веб-приложение
    markup.add(button1)  # Добавляем кнопку на клавиатуру
    bot.send_message(message.chat.id, "Вот наше меню", reply_markup=markup)  # Отправляем сообщение со встроенной кнопкой
    
    
def run_bot():
    bot.polling() 

if __name__ == "__main__":
    run_bot()