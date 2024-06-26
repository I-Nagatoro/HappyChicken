const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const chat_id = urlParams.get('chat_id');
if(chat_id=="null"){
    document.getElementById('phone').style.display='block';                    
}
else{
    document.getElementById('phone').style.display='none';  
}

















ymaps.ready(init);

function init() {
    var map_pickup = new ymaps.Map('map_pickup', {
        center: [59.9, 30.3], // Центр карты
        zoom: 9, // Уровень масштабирования
        controls: ['searchControl', 'geolocationControl']
    });

    ymaps.geocode('Санкт-Петербург, Шоссе в Лаврики, 85').then(function (res) {
        var coords = res.geoObjects.get(0).geometry.getCoordinates();
        // Создаем метку с указанием свойства address
        var placemark = new ymaps.Placemark(coords, {});
        placemark.properties.set('address', 'Санкт-Петербург, Шоссе в Лаврики, 85');
        map_pickup.geoObjects.add(placemark);
        // Перемещаем карту к этой точке
        map_pickup.setCenter(coords, 9); // Установка масштаба 9
    
        // Обработчик события click на метке
        placemark.events.add('click', function (e) {
            // Получаем адрес из свойства метки
            var address = placemark.properties.get('address');
            // Записываем адрес в строку с id address
            document.getElementById('address').value = address;
        });
    });
    
    

    var map_delivery = new ymaps.Map('map_delivery', {
        center: [59.9, 30.3], // Центр карты
        zoom: 9, // Уровень масштабирования
        controls: ['searchControl', 'geolocationControl']
    });

    map_delivery.events.add('click', function (e) {
            // Получаем координаты точки, по которой кликнули
            var coords = e.get('coords');
            // Передаем координаты для обработки
            handleUserInput(coords,map_delivery);
        });

        // Границы области (примерные координаты)
        var areaBounds = [
            [60.069283, 30.455648], // Вершина A
            [60.067806, 30.457178], // Вершина B
            [60.068264, 30.460942],
            [60.066045, 30.466317],
            [60.064315, 30.466343],
            [60.063815, 30.466249],
            [60.063815, 30.466249],
            [60.063815, 30.466249],
            [60.061262, 30.466742],
            [60.060152, 30.467218],
            [60.060152, 30.467218],
            [60.058871, 30.466768],
            [60.058871, 30.466768],
            [60.058871, 30.466768],
            [60.058871, 30.466768],
            [60.054807, 30.458884],
            [60.054526, 30.457603],
            [60.057638, 30.452553],
            [60.056119, 30.446926], // Вершина C
            [60.069283, 30.455648] // Замыкающая вершина (точка A)
        ];

        function isInAreaBounds(coords, map) {
            // Создаем многоугольник на основе переданных координат.
            var polygonGeometry = new ymaps.geometry.Polygon([coords]);
        
            // Создаем многоугольник на карте.
            var polygon = new ymaps.Polygon([coords], {}, {
                fillOpacity: 0,
                strokeWidth: 0
            });
        
            // Добавляем многоугольник на карту.
            map.geoObjects.add(polygon);
        
            // Создаем точку на карте.
            var point = new ymaps.GeoObject({
                geometry: {
                    type: "Point",
                    coordinates: coords
                }
            });
        
            // Проверяем, содержится ли точка внутри многоугольника.
            var isInside = polygonGeometry.contains(point.geometry.getCoordinates());
        
            // Удаляем многоугольник с карты, так как он больше не нужен.
            map.geoObjects.remove(polygon);
        
            return isInside;
        }
        

        // После получения координат от пользователя вызываем эту функцию
        function handleUserInput(coords,map_delivery) {
            if (isInAreaBounds(coords,map_delivery)) {
                console.log('пиздец')
            } else {
                // Координаты находятся за пределами области, выдайте сообщение об ошибке или предпримите другие действия
                alert('Указанные координаты находятся за пределами области.');
            }
        }

    // Обработчик смены режима доставки
    var deliveryRadio = document.getElementById('delivery');
    var pickupRadio = document.getElementById('pickup');
    deliveryRadio.addEventListener('change', function () {
        if (deliveryRadio.checked) {
            // Если выбран режим доставки, скрываем карту самовывоза и показываем карту доставки
            document.getElementById('map_pickup').style.display = 'none';
            document.getElementById('map_delivery').style.display = 'block';
            document.getElementById('pod').style.display = 'block';
            document.getElementById('etaj').style.display = 'block';
            document.getElementById('kv').style.display = 'block';
            adr=document.getElementById('address');
            adr.placeholder="Введите или укажите адрес на карте";
            adr.disabled="";
            adr.value='';
        }
    });
    pickupRadio.addEventListener('change', function () {
        if (pickupRadio.checked) {
            // Если выбран режим самовывоза, скрываем карту доставки и показываем карту самовывоза
            document.getElementById('map_delivery').style.display = 'none';
            document.getElementById('map_pickup').style.display = 'block';
            document.getElementById('pod').style.display = 'none';
            document.getElementById('etaj').style.display = 'none';
            document.getElementById('kv').style.display = 'none';
            adr=document.getElementById('address');
            adr.placeholder="Выберете точку самовывоза на карте";
            adr.disabled="disabled";
            adr.value='';
        }
    });
};





document.addEventListener('DOMContentLoaded', async function() {
    const button = document.querySelector('.btn1');
    button.addEventListener('click', async function() {
        var phone = document.getElementById('phone').value;
        if (phone.charAt(0)=='+'){
            phone=phone.replace('+','');
            console.log(phone);
        }
        else{
            console.log('-');
        }
    });
});








document.addEventListener('DOMContentLoaded', async function() {
    const button = document.querySelector('.btn');
    const addressInput = document.getElementById('address');
    const deliveryRadio = document.getElementById('delivery');
    const pickupRadio = document.getElementById('pickup');

    if (button && addressInput && deliveryRadio && pickupRadio) {
        button.addEventListener('click', async function() {
            try {
                // Получение user_id из адресной строки
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                const chat_id = urlParams.get('chat_id');


                // Получение содержимого корзины
                const cartItems = document.getElementById('cart-items').innerText.trim();

                // Получение адреса из текстового поля
                const address = addressInput.value.trim();

                // Получение выбранного варианта доставки
                const deliveryOption = deliveryRadio.checked ? 'Доставка' : 'Самовывоз';

                // Отправка заказа на сервер
                const orderResponse = await fetch('/submit_order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: chat_id, // Передаем полученный user_id
                        dishes: cartItems,
                        address: address, // Передаем адрес
                        delivery: deliveryOption // Передаем вариант доставки
                    })
                });

                if (orderResponse.ok) {
                    const orderResult = await orderResponse.json();
                    if (orderResult.success) {
                        alert('Заказ успешно сохранен!');
                    } else {
                        alert('Ошибка при сохранении заказа: ' + orderResult.error);
                    }
                } else {
                    console.error('Ошибка при сохранении заказа:', orderResponse.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        });
    } else {
        document.getElementById('address').style="border-color: red";
    }
});






document.addEventListener('DOMContentLoaded', function() {
    
    fetch('/get_cart_contents')
        .then(response => response.json())
        .then(data => {
            const cartItemsDiv = document.getElementById('cart-items');
            let totalPrice = 0;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    let dishName, quantity, price;
                    // Проверяем, является ли текущий элемент объектом (для первого формата записи)
                    if (typeof data[key] === 'object') {
                        dishName = data[key].dish_name;
                        quantity = data[key].quantity;
                        price = data[key].price * data[key].quantity;
                    } else { // Если текущий элемент - строка (для второго формата записи)
                        const parts = data[key].split(' ');
                        dishName = parts.slice(1, -4).join(' '); // Получаем название блюда (первое слово - число)
                        quantity = parseInt(parts[0]); // Получаем количество
                        price = parseFloat(parts[parts.length - 1]); // Получаем цену за единицу
                    }
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
                    const totalPriceForItem = price;
                    cartItemDiv.innerHTML = `<span>${dishName}, Количество: ${quantity}<br> <strong>${totalPriceForItem.toFixed(2)} руб.</strong></span>`;
                    totalPrice += totalPriceForItem;
                    cartItemsDiv.appendChild(cartItemDiv);
                }
            }
            fetch('/get_s_d_data', {
                method: 'POST', // Используем метод POST вместо GET
                // Другие параметры fetch, если необходимо
            })
            .then(response => response.json())
            .then(data => {
                for (const key in data){
                    if (typeof data[key] === 'object') {
                        dishName=data[key].name;
                        quantity=data[key].count;
                    }
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
                    cartItemDiv.innerHTML = `<span>${dishName}, Количество: ${quantity}<br> <strong>Бесплатно</strong></span>`;
                    cartItemsDiv.appendChild(cartItemDiv);
                }
            });
            const totalPriceDiv = document.getElementById('total-price');
            totalPriceDiv.textContent = `Сумма заказа: ${totalPrice.toFixed(2)}`;
        })
        .catch(error => console.error('Ошибка при получении содержимого корзины:', error));
});