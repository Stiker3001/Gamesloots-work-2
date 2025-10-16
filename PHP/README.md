# Интеграция YooKassa - Документация

## 📋 Содержание

- [Обзор](#обзор)
- [Файлы системы](#файлы-системы)
- [Установка](#установка)
- [Настройка](#настройка)
- [Как это работает](#как-это-работает)
- [Тестирование](#тестирование)
- [Настройка вебхуков](#настройка-вебхуков)

---

## Обзор

Полноценная интеграция YooKassa согласно [официальной документации](https://yookassa.ru/developers/payment-acceptance/getting-started/quick-start).

### Учетные данные

```
Shop ID: 1079742
Secret Key: live_ABjYUAVrlNi9ve3nVOPvyU_r9T7tv6raW5Jm4qc0ySU
```

### Параметры

- **Комиссия**: 2.8%
- **Минимальная сумма**: 10 рублей
- **ID платежной системы**: 30 (pay="30")

---

## Файлы системы

### PHP файлы (папка `PHP/`)

1. **yookassa_config.php** - Конфигурация и общие функции
   - Учетные данные YooKassa
   - Функция API запросов
   - Логирование

2. **yookassa_create_payment.php** - Создание платежа
   - Валидация данных
   - Создание платежа через API
   - Возврат URL для редиректа

3. **yookassa_return.php** - Страница возврата после оплаты
   - Красивая страница с анимацией
   - Автоматическая проверка статуса
   - Отображение результата

4. **yookassa_check_payment.php** - Проверка статуса платежа
   - API endpoint для AJAX запросов
   - Получение информации о платеже

5. **yookassa_webhook.php** - Обработчик вебхуков
   - Получение уведомлений от YooKassa
   - Обработка событий (succeeded, canceled)
   - Бизнес-логика после оплаты

### Frontend файлы

1. **assets/js/app.js** - JavaScript обработка
   - Функция `handleYooKassaPayment()`
   - AJAX запрос к create_payment.php
   - Редирект на страницу оплаты

2. **source/custom/css/imperiumkey/img/icons/payments/yookassa.svg** - Иконка YooKassa

3. **index.html** и другие HTML страницы - Кнопки оплаты

---

## Установка

### Шаг 1: Файлы уже на месте ✅

Все необходимые файлы уже созданы в папке `PHP/`.

### Шаг 2: Проверьте права доступа

```bash
chmod 755 PHP/
chmod 644 PHP/*.php
```

### Шаг 3: Проверьте PHP расширения

Необходимы:
- ✅ cURL
- ✅ JSON
- ✅ mbstring

Проверка:
```bash
php -m | grep -E "curl|json|mbstring"
```

---

## Настройка

### 1. Проверьте конфигурацию

Откройте `PHP/yookassa_config.php` и убедитесь, что учетные данные корректны:

```php
define('YOOKASSA_SHOP_ID', '1079742');
define('YOOKASSA_SECRET_KEY', 'live_ABjYUAVrlNi9ve3nVOPvyU_r9T7tv6raW5Jm4qc0ySU');
```

### 2. Настройте URL возврата

URL возврата формируется автоматически на основе текущего домена:
```php
define('RETURN_URL', $base_url . '/PHP/yookassa_return.php');
```

Если ваш сайт в подпапке, измените вручную:
```php
define('RETURN_URL', 'https://ваш-домен.com/папка/PHP/yookassa_return.php');
```

---

## Как это работает

### Процесс оплаты

```
1. Пользователь нажимает кнопку "YooKassa" (pay="30")
   ↓
2. JavaScript вызывает handleYooKassaPayment()
   ↓
3. AJAX запрос к PHP/yookassa_create_payment.php
   ↓
4. PHP создает платеж через YooKassa API
   ↓
5. YooKassa возвращает confirmation_url
   ↓
6. Пользователь редиректится на страницу оплаты YooKassa
   ↓
7. Пользователь оплачивает
   ↓
8. YooKassa возвращает пользователя на PHP/yookassa_return.php
   ↓
9. Страница автоматически проверяет статус через yookassa_check_payment.php
   ↓
10. YooKassa отправляет вебхук на yookassa_webhook.php
   ↓
11. Система обрабатывает успешный платеж
```

### Диаграмма последовательности

```
Пользователь       Frontend        PHP               YooKassa API
    |                 |              |                      |
    |--Нажал кнопку-->|              |                      |
    |                 |--AJAX------->|                      |
    |                 |              |--Create Payment----->|
    |                 |              |<--confirmation_url---|
    |                 |<--URL--------|                      |
    |<--Redirect------|              |                      |
    |-------------------------------->|                      |
    |                          (Страница оплаты)            |
    |<--------------------------------|                      |
    |                                 |                      |
    |--Оплата------------------------->|                      |
    |<--return_url--------------------|                      |
    |                                 |                      |
    |                 |<--return.php--|                      |
    |                 |--Check status->|                      |
    |                 |              |--Get Payment-------->|
    |                 |              |<--Status: succeeded--|
    |                 |<--Success----|                      |
    |                                 |                      |
    |                                 |<--Webhook (async)---|
    |                                 |(обработка заказа)   |
```

---

## Тестирование

### Локальное тестирование

1. **Откройте сайт в браузере**
2. **Выберите товар** и нажмите "Купить"
3. **Введите email** (любой валидный)
4. **Нажмите кнопку YooKassa**
5. **Вы должны попасть** на страницу оплаты YooKassa

### Тестовые карты YooKassa

Для тестирования используйте:

**Успешная оплата:**
```
Номер карты: 5555 5555 5555 4444
Срок: любая дата в будущем (например, 12/24)
CVC: 123
```

**Отклонение платежа:**
```
Номер карты: 4111 1111 1111 1111
```

### Переключение на тестовый режим

Для тестирования замените в `PHP/yookassa_config.php`:

```php
// Было:
define('YOOKASSA_SECRET_KEY', 'live_ABjYUAVrlNi9ve3nVOPvyU_r9T7tv6raW5Jm4qc0ySU');

// Стало:
define('YOOKASSA_SECRET_KEY', 'test_ABjYUAVrlNi9ve3nVOPvyU_r9T7tv6raW5Jm4qc0ySU');
```

---

## Настройка вебхуков

### 1. Зайдите в личный кабинет YooKassa

https://yookassa.ru/my/

### 2. Перейдите в раздел "Настройки" → "Уведомления"

### 3. Добавьте URL вебхука

```
https://ваш-домен.com/PHP/yookassa_webhook.php
```

### 4. Выберите события

- ✅ `payment.succeeded` - Успешная оплата
- ✅ `payment.canceled` - Отмена платежа
- ✅ `payment.waiting_for_capture` - Ожидание подтверждения

### 5. Сохраните настройки

---

## Бизнес-логика после оплаты

Откройте `PHP/yookassa_webhook.php` и найдите функцию `handlePaymentSucceeded()`:

```php
function handlePaymentSucceeded($payment) {
    $paymentId = $payment['id'];
    $amount = $payment['amount']['value'];
    $email = $payment['metadata']['email'] ?? '';
    $productId = $payment['metadata']['product_id'] ?? '';
    
    // TODO: Ваша бизнес-логика
    
    // 1. Сохранить платеж в базу данных
    // $db->query("INSERT INTO payments ...");
    
    // 2. Отправить ключи товара на email
    // sendProductKeys($email, $productId);
    
    // 3. Обновить статус заказа
    // updateOrderStatus($orderId, 'paid');
    
    // 4. Отправить уведомление
    // sendNotification($email, $amount);
}
```

---

## Логирование

Все события логируются в error_log PHP. Для просмотра логов:

```bash
tail -f /var/log/apache2/error_log
# или
tail -f /var/log/php_errors.log
```

События, которые логируются:
- ✅ Создание платежа
- ✅ Ошибки API
- ✅ Входящие вебхуки
- ✅ Успешные платежи
- ✅ Отмены платежей

---

## Безопасность

### ⚠️ Важные рекомендации:

1. **Не коммитьте секретный ключ** в Git
2. **Используйте HTTPS** для всех запросов
3. **Проверяйте IP вебхуков** (опционально)
4. **Валидируйте все входные данные**
5. **Логируйте все операции**

### Проверка IP вебхуков (опционально)

Добавьте в `yookassa_webhook.php`:

```php
$allowed_ips = [
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128/25'
];

$client_ip = $_SERVER['REMOTE_ADDR'];
// Проверка IP...
```

---

## Устранение неполадок

### Ошибка 404 при создании платежа

**Причина:** PHP файлы не найдены  
**Решение:** Проверьте путь к `PHP/yookassa_create_payment.php`

### Ошибка 500

**Причина:** Ошибка в PHP коде  
**Решение:** Проверьте логи PHP

### Не приходят вебхуки

**Причина:** Неправильный URL или сервер недоступен  
**Решение:** 
- Проверьте URL в настройках YooKassa
- Убедитесь, что файл доступен извне
- Проверьте SSL сертификат

### Платеж создается, но статус не обновляется

**Причина:** Вебхуки не настроены  
**Решение:** Настройте вебхуки в личном кабинете

---

## Полезные ссылки

- Официальная документация: https://yookassa.ru/developers/api
- Быстрый старт: https://yookassa.ru/developers/payment-acceptance/getting-started/quick-start
- Личный кабинет: https://yookassa.ru/my/
- Тестовые данные: https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing
- Поддержка: support@yookassa.ru

---

## Лицензия

© 2025 Ваш проект

**Интеграция YooKassa готова к использованию!** 🎉

