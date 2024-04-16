from flask import Flask, render_template, session, jsonify, request
import mysql.connector
import telebot



TOKEN = '7040842460:AAEVVtwpVDmuP8cXoMBI9-wcRPaXifJ4ag8'
bot = telebot.TeleBot(TOKEN)
application = Flask(__name__)
application.secret_key = 'my_secret_key_123'

# Параметры подключения к базе данных MySQL
host = 'localhost'
user = 'root'
password = 'vertrigo'
database = 'delivery'




@application.route('/get_sauces_drinks_count', methods=['POST'])
def get_sauces_for_cart_contents():
    try:
        # Получаем данные из запроса
        data = request.json
        dishNames = data.get('dishNames')
        counts = data.get('counts')

        # Открываем соединение с базой данных
        connection = connect_to_database()
        cursor = connection.cursor()

        total_sauces = 0
        total_drinks = 0

        # Перебираем элементы корзины
        for i, dish_name in enumerate(dishNames):
            # Выполняем запрос к базе данных для получения sauces для данного блюда
            cursor.execute("SELECT sauces FROM dishes WHERE dish_name = %s", (dish_name,))
            sauces_count = cursor.fetchone()
            
            cursor.execute("SELECT drink_des FROM dishes WHERE dish_name = %s", (dish_name,))
            drinks_count = cursor.fetchone()

            # Если sauces_count не равно None, добавляем его к общей сумме
            if sauces_count is not None:
                total_sauces += sauces_count[0] * counts[i]
                
            if drinks_count is not None:
                total_drinks += drinks_count[0] * counts[i]

        # Закрываем курсор и соединение+

        cursor.close()
        connection.close()
        session['total_sauces'] = total_sauces
        session['total_drinks'] = total_drinks

        return jsonify({'total_sauces': total_sauces, 'total_drinks': total_drinks}), 200

    except mysql.connector.Error as error:
        print("Произошла ошибка при получении sauces из базы данных:", error)
        return jsonify({'error': str(error)}), 500

@application.route('/get_sauces')
def get_sauces():
    try:
        # Устанавливаем соединение с базой данных
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = connection.cursor()
        # Выполняем запрос к базе данных для получения списка соусов
        query = "SELECT id, dish_name FROM dishes WHERE category_id = 5"
        cursor.execute(query)
        result = cursor.fetchall()
        # Закрываем соединение с базой данных
        cursor.close()
        connection.close()
        # Создаем список соусов
        sauces = [{'id': row[0], 'name': row[1]} for row in result]

        return render_template('additions.html', sauces=sauces)
    except mysql.connector.Error as error:
        return jsonify({'error': str(error)}), 500


@application.route('/additions')
def show_additions():
    # Получение данных о соусах из базы данных
    total_sauces = session.get('totalSauces', 0)
    total_drink = session.get('totalDrink', 0)
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT dish_name FROM dishes WHERE category_id = 4")
    sauces = cursor.fetchall()

    # Отображение веб-страницы и передача данных о соусах в шаблон
    return render_template('additions.html', sauces=sauces, total_sauces=total_sauces, total_drink=total_drink)

def get_db_connection():
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

@application.before_request
def initialize_session():
    # Проверяем, инициализирована ли уже сессия
    if 'cart' not in session:
        session['cart'] = {}
    if 'dish' not in session:
        session['dish']={}
    
def connect_to_database():
# Замените параметры подключения на ваши
    connection = mysql.connector.connect(
    host='localhost',
    user='root',
    password='vertrigo',
    database='delivery'
)
    return connection


@application.route('/submit_order', methods=['POST'])
def submit_order():
    try:
        # Получаем данные из запроса в виде JSON
        data = request.get_json()
        # Извлекаем данные из JSON
        user_id = data.get('user_id')
        dishes = data.get('dishes')
        address = data.get('address')
        delivery = data.get('delivery')

        # Подключаемся к базе данных
        connection = connect_to_database()
        cursor = connection.cursor()
        cursor.execute("SELECT phone_number FROM users WHERE id = "+user_id)
        phone = cursor.fetchone()[0]  # Получаем одну запись (должен быть только один номер телефона)
        # Выполняем операцию добавления записи
        cursor.execute("INSERT INTO orders (user_id, phone, dishes, address, delivery) VALUES (%s, %s, %s, %s, %s)", (user_id, phone, dishes, address, delivery))
        connection.commit()

        # Закрываем соединение с базой данных
        cursor.close()
        connection.close()

        # Возвращаем успешный результат
        return jsonify({'success': True})
    except Exception as e:
        # В случае ошибки откатываем изменения и возвращаем ошибку
        return jsonify({'success': False, 'error': str(e)})

@application.route('/')
def index():
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        if connection.is_connected():
            cursor = connection.cursor()
            # Получаем категории
            cursor.execute("SELECT * FROM category")
            categories = cursor.fetchall()
            # Создаем словарь для хранения блюд по категориям
            dishes_by_category = {category[0]: [] for category in categories}
            # Получаем блюда и добавляем их в словарь по соответствующей категории
            cursor.execute("SELECT * FROM dishes")
            dishes = cursor.fetchall()
            for dish in dishes:
                category_id = dish[2]
                dishes_by_category[category_id].append(dish)
            cursor.close()
            connection.close()
            # Отображаем шаблон HTML, передавая данные о категориях и блюдах
            return render_template('site.html', categories=categories, dishes_by_category=dishes_by_category, cart=session.get('cart', {}))
    except mysql.connector.Error as error:
        print('Ошибка при подключении к базе данных:', error)


@application.route('/save_dish_to_session', methods=['POST'])
def save_dish_to_session():
    dish_data = request.json.get('dish')  # Получаем данные о блюде из запроса
    total_sauces=request.json.get('total_sauces')
    total_drinks=request.json.get('total_drinks')
    # Ваш код для сохранения данных о блюде в сессии или базе данных
    session['dish'] = dish_data  # Пример сохранения данных в сессии
    session['total_sauces']=total_sauces
    session['total_drinks']=total_drinks
    
    return jsonify({'success': True}), 200

@application.route('/save_selected_dish', methods=['POST'])
def save_selected_dish():
    dish_data = request.json.get('dish')  # Получаем данные о блюде из запроса
    # Ваш код для сохранения данных о блюде в сессии или базе данных
    if 'dish' not in session:
        session['dish'] = {}  # Инициализируем пустой словарь, если данных еще нет
    
    # Обновляем данные в сессии, добавляя новые данные к уже существующим
    session['dish']=dish_data
    
    return jsonify({'success': True}), 200


    
@application.route('/page1')
def page1():
    # Выводим содержимое корзины на странице page1
    return render_template('page1.html', cart=session.get('cart', {}), s_d_data=session.get('dish',{}))



@application.route('/get_cart_contents')
def get_cart_contents():
    try:
        # Открываем соединение с базой данных
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        # Открываем курсор для выполнения SQL-запросов
        cursor = connection.cursor()
        # Получаем данные о содержимом корзины из сессии
        cart_contents = session.get('cart', {})
        # Создаем список для хранения данных о содержимом корзины с названиями блюд и вариантами приготовления
        cart_items = []
        # Перебираем элементы корзины и получаем названия блюд из базы данных
        for dish_id, item_data in cart_contents.items():
            # Выполняем запрос к базе данных для получения информации о блюде по его ID
            cursor.execute("SELECT dish_name, price FROM delivery.dishes WHERE id = %s", (dish_id,))
            result = cursor.fetchone()
            if result:
                dish_name = result[0]
                price = result[1]
                # Добавляем данные о блюде с его названием, количеством, ценой и вариантом приготовления в список
                cart_items.append({'dish_name': dish_name, 'quantity': item_data['quantity'], 'price': price})
        # Закрываем курсор и соединение
        cursor.close()
        connection.close()
        # Возвращаем данные о содержимом корзины в формате JSON
        return jsonify(cart_items)
    except mysql.connector.Error as error:
        return jsonify({'error': str(error)})
    
@application.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    data = request.json
    dish_id = data.get('dishId')
    # Получаем текущую корзину из сессии
    cart = session.get('cart', {})
    # Проверяем, существует ли указанное блюдо в корзине
    if dish_id in cart:
        # Если блюдо уже есть в корзине, увеличиваем его количество на 1
        cart[dish_id]['quantity'] += 1
    else:
        # Если блюдо отсутствует в корзине, добавляем его с начальным количеством 1 и информацией о выбранном варианте приготовления
        cart[dish_id] = {'quantity': 1}
    # Обновляем корзину в сессии
    session['cart'] = cart
    # Помечаем сессию как модифицированную
    session.modified = True
    # Возвращаем информацию о добавленном блюде в корзину, включая выбранный вариант приготовления
    return jsonify({'message': 'Блюдо успешно добавлено в корзину'})

@application.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    try:
        data = request.json
        dish_id = data.get('dishId')
        if dish_id:
            cart = session.get('cart', {})
            if dish_id in cart:
                if cart[dish_id]['quantity'] > 1:
                    cart[dish_id]['quantity'] -= 1
                else:
                    del cart[dish_id]
                session['cart'] = cart
                session.modified = True
                return jsonify({'message': 'Товар успешно удален из корзины'}), 200
            else:
                return jsonify({'error': 'Товар с указанным ID не найден в корзине'}), 404
        else:
            return jsonify({'error': 'Не указан ID товара для удаления из корзины'}), 400
    except Exception as e:
        return jsonify({'error': 'Ошибка при удалении товара из корзины: ' + str(e)}), 500
    
@application.route('/remove_from_session', methods=['POST'])
def remove_from_session():
    try:
        data = request.json
        dish_id = data.get('dishName')
        if dish_id:
            if 'cart' in session and dish_id in session['cart']:
                del session['cart'][dish_id]
                session.modified = True
                return jsonify({'message': 'Блюдо успешно удалено из сессии'}), 200
            else:
                return jsonify({'error': 'Блюдо с указанным идентификатором не найдено в сессии'}), 404
        else:
            return jsonify({'error': 'Не указан идентификатор блюда'}), 400
    except Exception as e:
        print('Ошибка при удалении блюда из сессии:', e)  # Добавим вывод для отладки
        return jsonify({'error': 'Ошибка при удалении блюда из сессии: ' + str(e)}), 500
    
@application.route('/get_dish_id', methods=['POST'])
def get_dish_id():
    # Получаем название блюда из запроса
    data = request.get_json()
    dish_name = data['dish_name']
    try:
        # Открываем соединение с базой данных
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = connection.cursor()
        # Выполняем запрос к базе данных для поиска id блюда по его названию
        query = "SELECT id FROM dishes WHERE dish_name = %s"
        cursor.execute(query, (dish_name,))
        result = cursor.fetchone()
        # Закрываем соединение с базой данных
        cursor.close()
        connection.close()
        if result:
            # Если блюдо найдено, возвращаем его id
            print('ID блюда:', result[0])  # Добавим эту строку для отладочного вывода
            return jsonify({'dish_id': result[0]})
        else:
            # Если блюдо не найдено, возвращаем пустой ответ
            print('Блюдо не найдено')  # Добавим эту строку для отладочного вывода
            return jsonify({'dish_id': None})
    except mysql.connector.Error as error:
        print('Ошибка при выполнении запроса к базе данных:', error)  # Добавим эту строку для отладочного вывода
        return jsonify({'error': str(error)})
    
@application.route('/get_dish_name', methods=['POST'])
def get_dish_name():
    data = request.json
    dish_id = data.get('dishId')
    try:
        # Устанавливаем соединение с базой данных
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = connection.cursor()
        # Выполняем запрос к базе данных для получения названия блюда по его ID
        query = "SELECT dish_name FROM dishes WHERE id = %s"
        cursor.execute(query, (dish_id,))
        result = cursor.fetchone()
        if result:
            dish_name = result[0]
            return jsonify({'dishName': dish_name}), 200
        else:
            return jsonify({'error': 'Блюдо с указанным ID не найдено'}), 404
    except mysql.connector.Error as error:
        return jsonify({'error': str(error)}), 500
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            
@application.route('/update_cart', methods=['GET', 'POST'])
def update_cart():
    if request.method == 'GET':
        # Обработка GET запроса
        # Например, возвращаем данные о корзине в формате JSON
        return jsonify({'message': 'GET запрос для обновления корзины'})
    elif request.method == 'POST':
        # Обработка POST запроса
        # Например, обновление корзины на сервере
        return jsonify({'message': 'POST запрос для обновления корзины'})
    
@application.route('/get_s_d_data', methods=['POST'])
def get_s_d_data():
    dish_data=session['dish']
    return(dish_data)
    
    
    

    
    
    
    
    
    
    
    
    
if __name__ == '__main__':
    # Путь к файлу сертификата и закрытому ключу
    ssl_cert = 'cert.pem'
    ssl_key = 'key.pem'
    # Запуск приложения с использованием SSL
    application.run(debug=True,port=80)
    #  ssl_context=(ssl_cert, ssl_key), 