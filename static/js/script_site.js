const addToCartButtons = document.querySelectorAll('.add-to-cart');


addToCartButtons.forEach(button => {

    const cookVar = button.dataset.cookVar;

    const card = button.closest('.card');

    const selectionContainer = document.createElement('div');

    if (cookVar === '1') {
        selectionContainer.innerHTML = `
        <div class="radio">
            <label class="rad-label">
                <input type="radio" class="rad-input" data-dish-id= id="frying_${card.dataset.dishId}" name="cookVariant_${card.dataset.dishId}" value="Классик" checked>
                <div class="rad-design"></div>
                <label class="rad-text" for="frying_${card.dataset.dishId}">Классик</label>
            </label>
        
            <label class="rad-label">
                <input type="radio" class="rad-input" id="airGrill_${card.dataset.dishId}" name="cookVariant_${card.dataset.dishId}" value="Фитнес">
                <div class="rad-design"></div>
                <label class="rad-text" for="airGrill_${card.dataset.dishId}">Фитнес</label>
            </label>
        </div>
        
        `;
    }
    card.insertBefore(selectionContainer, button);
});





















document.addEventListener('DOMContentLoaded', function () {
    fetch('/get_cart_contents')
        .then(response => response.json())
        .then(data => {
            const cartQuantities = {};
            data.forEach(item => {
                cartQuantities[item.dish_name] = item.quantity;
            });

            const dishCards = document.querySelectorAll('.card');

            dishCards.forEach(card => {
                const dishName = card.querySelector('.dish-name').textContent;

                const addToCartButton = card.querySelector('.add-to-cart');

                const addButton = card.querySelector('.add-item');
                const removeButton = card.querySelector('.remove-item');

                const quantitySpan = card.querySelector('.cart-item-quantity');

                if (cartQuantities.hasOwnProperty(dishName)) {
                    quantitySpan.textContent = cartQuantities[dishName];

                    addToCartButton.style.display = 'none';
                    const cartControls = card.querySelector('.cart-controls');
                    cartControls.style.display = 'flex';
                } else {
                    addToCartButton.style.display = 'block';
                    const cartControls = card.querySelector('.cart-controls');
                    cartControls.style.display = 'none';

                    quantitySpan.textContent = '0';
                }
            });
        })
        .catch(error => console.error('Ошибка при получении содержимого корзины:', error));
});








document.addEventListener('DOMContentLoaded', function () {
    fetch('/get_cart_contents')
        .then(response => response.json())
        .then(data => {
            const cartQuantities = {};
            data.forEach(item => {
                cartQuantities[item.dish_name] = item.quantity;
            });

            const dishCards = document.querySelectorAll('.card');

            dishCards.forEach(card => {
                const dishName = card.querySelector('.dish-name').textContent;

                const addButton = card.querySelector('.add-item');
                const removeButton = card.querySelector('.remove-item');

                const quantitySpan = card.querySelector('.cart-item-quantity');

                if (cartQuantities.hasOwnProperty(dishName)) {
                    quantitySpan.textContent = cartQuantities[dishName];


                }
            });
        })
        .catch(error => console.error('Ошибка при получении содержимого корзины:', error));
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const dishId = button.getAttribute('data-dish-id');
            addToCart(dishId);
        });
    });
        
        

        document.getElementById('cart-toggle').addEventListener('click', function() {
            var cartDropdown = document.getElementById('cart-dropdown');
            var Check = document.getElementById('check');
            if (cartDropdown.classList.contains('active')) {
                cartDropdown.classList.remove('active');
                cartDropdown.style.display="none";
                Check.style.display="none";
            } else {
                cartDropdown.classList.add('active');
                cartDropdown.style.display="block";
                Check.style.display="block";
            }
        });

        document.querySelectorAll('.category-slide').forEach(slide => {
            slide.addEventListener('click', e => {
                e.preventDefault();
                const targetId = slide.getAttribute('data-target').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        var swiper = new Swiper('.swiper-container', {
            slidesPerView: 3.5,
            spaceBetween: 10,
            freeMode: true,
            allowTouchMove: true,
        });

        document.addEventListener('DOMContentLoaded', function () {
            const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
            addToCartButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const dishId = button.getAttribute('data-dish-id');
                    const dishCard = button.closest('.card');
                    const dishName = dishCard.querySelector('.dish-name').textContent;
                    const dishPrice = parseFloat(dishCard.querySelector('.dish-price').textContent);

                    const cartContent = document.querySelector('.cart-content');
                    const newCartItem = document.createElement('div');
                    newCartItem.classList.add('cart-item');
                    newCartItem.setAttribute('data-dish-id', dishId);
                    newCartItem.setAttribute('data-dish-name', dishName);
                    newCartItem.innerHTML = `
                        <span>${dishName}</span>
                        <span>Количество: </span><span class="cart-item-quantity">1</span>
                        <span>Цена за единицу: ${dishPrice}.00</span>
                    `;
                    cartContent.appendChild(newCartItem);
        
                    toggleCheckoutButtonVisibility();

                    button.style.display = 'none';
                    const cartControls = dishCard.querySelector('.cart-controls');
                    const quantitySpan = cartControls.querySelector('.cart-item-quantity');
                    quantitySpan.textContent = '1';
                    cartControls.style.display = 'flex';
                });
            });
            document.querySelectorAll('.add-item, .remove-item').forEach(button => {
                button.addEventListener('click', () => {
                    const cartItem = button.closest('.card');
                    if (cartItem) {
                        const dishId = cartItem.getAttribute('data-dish-id');
                        const dishName = cartItem.querySelector('.dish-name').textContent;
                        const quantityElement = cartItem.querySelector('.cart-item-quantity');
                        let quantity = parseInt(quantityElement.textContent);

                        const action = button.getAttribute('data-action');
            
                        if (action === 'add') {
                            console.log('Кнопка "+" нажата');
                            quantity++;
                            toggleCheckoutButtonVisibility();
                            addToCart(dishId);
                        } else if (action === 'remove' && quantity > 0) {
                            console.log('Кнопка "-" нажата');
                            quantity--;
                            toggleCheckoutButtonVisibility();
                            removeFromCart(dishId);
                        }
            
                        quantityElement.textContent = quantity;
                        updateCartOnServer(dishId, quantity);

            const addToCartButton = cartItem.querySelector('.add-to-cart');
            const cartControls = cartItem.querySelector('.cart-controls');
            if (quantity === 0) {
                addToCartButton.style.display = 'inline-block';
                cartControls.style.display = 'none';
            } else {
                addToCartButton.style.display = 'none';
                cartControls.style.display = 'flex';
            }
                    } else {
                        console.error('Кнопка удаления товара не находится в элементе .card.');
                    }
                    toggleCheckoutButtonVisibility();
                });
                toggleCheckoutButtonVisibility();
            });

            function removeFromSession(dishId) {
                console.log(dishId);
                return fetch('/get_dish_name', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ dishId: dishId }),
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Ошибка при получении названия блюда');
                })
            }
        });
        
        function toggleCheckoutButtonVisibility() {
            const cartDropdown = document.querySelector('.cart-dropdown');
            const checkoutButton = document.getElementById('check');

            if (cartDropdown.classList.contains('cart-item')) {
                checkoutButton.style.display = 'none';
            } else {
                checkoutButton.style.display = 'block';
            }
        }
        

 

        document.addEventListener('DOMContentLoaded', function() {
            const checkoutButton = document.getElementById('check');
            checkoutButton.addEventListener('click', function() {
                const cartItems = document.querySelectorAll('.cart-dropdown .card');
                const cart = {};
                cartItems.forEach(item => {
                    const dishId = item.dataset.dishId;
                    const quantityElement = item.querySelector('.cart-item-quantity');
                    if (quantityElement) {
                        const quantity = quantityElement.textContent;
                        cart[dishId] = parseInt(quantity);
                    }
                });

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

                            sessionStorage.setItem('totalDrinks', totalDrinks);
                            sessionStorage.setItem('totalSauces', totalSauces);

                            saveDishToSession(cart,data.total_drinks,data.total_sauces);
                        })
                        .catch(error => console.error('Ошибка при получении общего количества напитков:', error));
                        
                    }
        
                
            });

        });
        

        function saveDishToSession(dishData,total_drinks,total_sauces) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            const chatId = urlParams.get('chat_id');
            console.log('Chat ID:', chatId);

            fetch('/save_dish_to_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dish: dishData,  total_drinks: total_drinks, total_sauces:total_sauces})
            })
            .then(response => {
                if (response.ok) {
                    console.log('Содержимое корзины успешно добавлено в сессию');

                    window.location.href = '/additions?chat_id=' + chatId;
                } else {
                    console.error('Произошла ошибка при добавлении содержимого корзины в сессию');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        }

        function updateButtonsOnPageLoad() {
            fetch('/get_cart_contents')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных о корзине.');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    console.error('Данные о корзине ожидаются в виде объекта, а не массива.');
                    return;
                }

                const requests = [];
        
                for (const item of Object.values(data)) {
                    const dishName = item.dish_name;
                    const requestPromise = fetch('/get_dish_id', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ dish_name: dishName })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Ошибка при получении идентификатора блюда.');
                        }
                        return response.json();
                    });
                    
                    requests.push(requestPromise);
                }
                
                Promise.all(requests)
                .then(results => {
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        const item = Object.values(data)[i];
                        const dishId = result.dish_id;
                        if (dishId !== null) {
                            const quantity = item.quantity;
        
                            const addButton = document.querySelector(`.add-item[data-dish-id="${dishId}"]`);
                            const removeButton = document.querySelector(`.remove-item[data-dish-id="${dishId}"]`);
                            const quantityDisplay = document.querySelector(`.cart-item-quantity[data-dish-id="${dishId}"]`);
                            
                            if (quantity === 0) {
                                addButton.style.display = 'inline-block';
                                removeButton.style.display = 'none';
                                addButton.disabled = false;
                                removeButton.disabled = true;
                                quantityDisplay.textContent = '';
                                const cartItem = quantityDisplay.closest('.cart-item');
                                if (cartItem) {
                                    cartItem.remove();
                                } else {
                                    console.error('Элемент корзины для удаления не найден.');
                                }
                            } else {
                                addButton.disabled = false;
                                removeButton.disabled = false;
                                quantityDisplay.textContent = `${quantity}`; 
                            }
                        } else {
                            console.error(`Элементы для блюда с id ${dishId} не найдены.`);
                        }
                    }
                })
                .catch(error => console.error('Ошибка при получении идентификатора блюда:', error));
            })
            .catch(error => console.error('Ошибка при получении данных о корзине:', error));
            toggleCheckoutButtonVisibility();
        }
        document.addEventListener('DOMContentLoaded', function() {
            const addToCartButtons = document.querySelectorAll('.add-to-cart');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const dishName = button.closest('.card').querySelector('.dish-name').textContent;
                    const dishId = button.dataset.dishId;

                    fetch('/add_to_cart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            dish_name: dishName,
                            dishId: dishId,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message === 'Блюдо успешно добавлено в корзину') {
                            console.log('Блюдо успешно добавлено в корзину');
                            const cartItemElement = button.closest('.card').querySelector('.cart-item');
                        } else {
                            console.error('Произошла ошибка при добавлении блюда в корзину');
                        }
                    })
                    .catch(error => console.error('Ошибка:', error));
                });
            });
        });

        function updateCartUI(cartItems) {
            console.log('Обновление UI корзины:', cartItems);
        
            const cartItemsDiv = document.getElementById('cart-content');
            if (!cartItemsDiv) {
                console.error('Элемент для отображения корзины не найден');
                return;
            }
            cartItemsDiv.innerHTML = '';
            cartItems.forEach(item => {
                const dishName = item.dish_name;
                const quantity = item.quantity;
                const price = item.price;

                console.log('Название блюда:', dishName);
                console.log('Количество:', quantity);
                console.log('Цена:', price);
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <span class="dish-name">${dishName}</span>
                    <span class="quantity">Количество: ${quantity}</span>
                    <span class="price">Цена за единицу: ${price}</span>
                `;
                cartItemsDiv.appendChild(cartItemDiv);
            });
        }
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/get_cart_contents')
                .then(response => response.json())
                .then(data => {
                    const cartContentDiv = document.querySelector('.cart-content');
                    cartContentDiv.innerHTML = '';
                    data.forEach(item => {
                        const cartItemDiv = document.createElement('div');
                        cartItemDiv.classList.add('cart-item');
                        cartItemDiv.innerHTML = `
                            <span class="dish-name">${item.dish_name}</span>
                            <span class="quantity">Количество: ${item.quantity}</span>
                            <span class="price">Цена за единицу: ${item.price}</span>
                        `;
                        cartContentDiv.appendChild(cartItemDiv);
                    });
                })
                .catch(error => console.error('Ошибка при получении содержимого корзины:', error));
        });

        function updateCartOnPageLoad() {
            fetch('/get_cart_contents')
                .then(response => response.json())
                .then(data => {
                    console.log('Полученные данные о корзине:', data);

                    const cartContent = document.querySelector('.cart-content');
                    cartContent.innerHTML = '';

                    data.forEach(item => {
                        const dishName = item.dish_name;
                        const quantity = item.quantity;
                        const pricePerUnit = item.price;
                        const cartItem = document.createElement('div');
                        cartItem.classList.add('cart-item');
                        const itemName = document.createElement('span');
                        itemName.classList.add('dish-name');
                        itemName.textContent = `${dishName}` + ` `;

                        const itemQuantity = document.createElement('span');
                        itemQuantity.classList.add('cart-item-quantity');
                        itemQuantity.textContent = `Количество: ` + `${quantity}` + ` `;

                        const itemPricePerUnit = document.createElement('span');
                        itemPricePerUnit.classList.add('price-per-unit');
                        itemPricePerUnit.textContent = `Цена за единицу: ` + `${pricePerUnit}`;

                        cartItem.appendChild(itemName);
                        cartItem.appendChild(itemQuantity);
                        cartItem.appendChild(itemPricePerUnit);
                        cartContent.appendChild(cartItem);
                    });
                })
                .catch(error => console.error('Ошибка при получении данных о корзине:', error));
        }        

        function updateCartOnServer(dishId, newQuantity) {
            console.log('Updating cart on server with dishId:', dishId, 'and quantity:', newQuantity);
            const cartItem = { dishId: dishId, quantity: newQuantity };
            return fetch('/update_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartItem)
            })
            .then(response => {
                if (response.ok) {
                    console.log('Корзина успешно обновлена на сервере');
                    return response.json();
                } else {
                    console.error('Ошибка при обновлении корзины на сервере');
                    throw new Error('Ошибка при обновлении корзины на сервере');
                }
            })
            .then(data => {
                const quantitySpan = document.querySelector(`.cart-item-quantity[data-dish-id="${dishId}"]`);
                quantitySpan.textContent = newQuantity;
                updateCartOnPageLoad();
            })
            .catch(error => console.error('Ошибка при отправке запроса на сервер:', error));
        }
        function addToCart(dishId) {
            const data = {
                dishId: dishId,
            };
            fetch('/add_to_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Ошибка при добавлении товара в корзину');
            })
            .then(data => {
                console.log('Результат добавления товара в корзину:', data);
                if (data.message) {
                    updateCart();
                } else {
                    updateButtonsOnPageLoad();
                }
            })
            .catch(error => console.error('Ошибка:', error));
        }


        function removeFromCart(dishId) {
            fetch('/remove_from_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dishId: dishId }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Ошибка при удалении товара из корзины');
            })
            .then(data => {
                console.log('Результат удаления товара из корзины:', data);
                if (data.message) {
                    updateCart();
                } else {
                    console.error('Ошибка:', data.error);
                }
            })
            .catch(error => console.error('Ошибка:', error));
        }
        function updateCart() {
            fetch('/update_cart')
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                })
                .catch(error => console.error('Ошибка:', error));
        }

        



        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                const cartControls = card.querySelector('.cart-controls');
                const cartItem = card.querySelector('.cart-item');
                if (cartControls && cartItem) {
                    cartItem.appendChild(cartControls);
                }
            });
        });
