let initialSaucesCount; // Определение переменной в области видимости скрипта

function increment(id) {
    const element = document.getElementById(id);
    let count = parseInt(element.innerText);
    console.log(count);
    let totalSaucesCount = 0;
    
    // Получаем все элементы span с классом 'sauce'
    const sauceElements = document.querySelectorAll('.sauce span');
    
    // Проходим по каждому элементу и добавляем его значение к общей сумме
    sauceElements.forEach(sauceElement => {
        totalSaucesCount += parseInt(sauceElement.innerText);
    });
    
    // Проверяем, что добавление не превысит общее количество соусов
    if (totalSaucesCount < initialSaucesCount) {
        count++;
        element.innerText = count;
    }
}

function decrement(id) {
    const element = document.getElementById(id);
    let count = parseInt(element.innerText);
    if (count > 0) {
        count--;
        element.innerText = count;
    }
}






function incrementdr(id) {
    const element = document.getElementById(id);
    let count = parseInt(element.innerText);
    let totalDrinksCount = 0;
    
    // Получаем все элементы span с классом 'sauce'
    const drinkElements = document.querySelectorAll('.drink span');
    
    // Проходим по каждому элементу и добавляем его значение к общей сумме
    drinkElements.forEach(drinkElements => {
        totalDrinksCount += parseInt(drinkElements.innerText);
    });
    
    // Проверяем, что добавление не превысит общее количество соусов
    if (totalDrinksCount < initialDrinksCount) {
        count++;
        element.innerText = count;
    }
}

function decrementdr(id) {
    const element = document.getElementById(id);
    let count = parseInt(element.innerText);
    if (count > 0) {
        count--;
        element.innerText = count;
    }
}














document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_cart_contents')
        .then(response => response.json())
        .then(data => {
            const dishNames = data.map(item => item.dish_name);
            const counts = data.map(item => item.quantity);
            fetchSauces(dishNames, counts);
        })
        .catch(error => console.error('Ошибка при получении данных корзины:', error));

        function fetchSauces(dishNames, counts) {        
            fetch('/get_sauces_drinks_count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dishNames: dishNames, counts: counts })
            })
            .then(response => response.json())
            .then(data => {
                // Обработка полученного общего количества напитков
                const totalDrinks = data.total_drinks;
                const totalSauces = data.total_sauces;

                initialDrinksCount = totalDrinks; // Присвоение значения initialSaucesCount
                initialSaucesCount = totalSauces; // Присвоение значения initialSaucesCount

                console.log(initialDrinksCount);
                console.log(initialSaucesCount);

                sessionStorage.setItem('totalDrinks', totalDrinks);
                sessionStorage.setItem('totalSauces', totalSauces);

                
            })
            .catch(error => console.error('Ошибка при получении общего количества напитков:', error));
    }
});

















function saveDishToSession() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Получение значения параметра 'chat_id'
    const chatId = urlParams.get('chat_id');
    console.log('Chat ID:', chatId);

    let dishData = []; // Инициализируем dishData как пустой массив

    // Добавляем данные о соусах в массив dishData
    const sauces = document.querySelectorAll('.sauce span');
    sauces.forEach(sauce => {
        const sauceName = sauce.id;
        const sauceCount = parseInt(sauce.innerText);
        console.log(sauceName);
        console.log(sauceCount);
        console.log('----------------------------');
        if (sauceCount > 0) {
            // Создаем новый элемент и добавляем его в массив dishData
            dishData.push({
                name: sauceName,
                count: sauceCount
            });
        }
    });
    
    // Добавляем данные о напитках в массив dishData
    const drinks = document.querySelectorAll('.drink span');
    drinks.forEach(drink => {
        let drinkName = drink.id;
        const drinkCount = parseInt(drink.innerText);
        if (drinkName=='soda'){
            drinkName='Газировка 330 мл.';
        }
        else if (drinkName=='juice'){
            drinkName='Сок 200 мл.';
        }
        console.log(drinkName);
        console.log(drinkCount);
        console.log('----------------------------');
        if (drinkCount > 0) {
            // Создаем новый элемент и добавляем его в массив dishData
            dishData.push({
                name: drinkName,
                count: drinkCount
            });
        }
    });

    fetch('/save_selected_dish', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dish: dishData })
    })
    .then(response => {
        if (response.ok) {
            console.log('Содержимое корзины успешно добавлено в сессию');
            // Переходим на страницу с содержимым корзины, передавая chat_id
            window.location.href = '/page1?chat_id=' + chatId;
        } else {
            console.error('Произошла ошибка при добавлении содержимого корзины в сессию');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}