<?php
/**
 * Создание платежа YooKassa
 * Согласно документации: https://yookassa.ru/developers/payment-acceptance/getting-started/quick-start
 */

require_once __DIR__ . '/yookassa_config.php';

header('Content-Type: application/json; charset=utf-8');

// Получаем данные из POST
$email = $_POST['email'] ?? '';
$amount = floatval($_POST['amount'] ?? 0);
$count = intval($_POST['count'] ?? 1);
$productId = $_POST['type'] ?? '';
$coupon = $_POST['copupon'] ?? '';
$description = $_POST['description'] ?? "Заказ №" . uniqid();

// Валидация
if (empty($email)) {
    echo json_encode([
        'ok' => 'FALSE',
        'error' => 'Email не указан'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'ok' => 'FALSE',
        'error' => 'Некорректный email адрес'
    ]);
    exit;
}

if ($amount <= 0) {
    echo json_encode([
        'ok' => 'FALSE',
        'error' => 'Неверная сумма платежа'
    ]);
    exit;
}

// Минимальная сумма для YooKassa
if ($amount < 10) {
    echo json_encode([
        'ok' => 'FALSE',
        'error' => 'Минимальная сумма платежа 10 рублей'
    ]);
    exit;
}

// Формируем данные для платежа
$paymentData = [
    'amount' => [
        'value' => number_format($amount, 2, '.', ''),
        'currency' => 'RUB'
    ],
    'capture' => true, // Автоматическое списание
    'confirmation' => [
        'type' => 'redirect',
        'return_url' => RETURN_URL
    ],
    'description' => mb_substr($description, 0, 128), // Максимум 128 символов
    'metadata' => [
        'email' => $email,
        'product_id' => $productId,
        'count' => $count,
        'coupon' => $coupon,
        'order_time' => date('Y-m-d H:i:s')
    ]
];

// Добавляем чек для налоговой (54-ФЗ)
$paymentData['receipt'] = [
    'customer' => [
        'email' => $email
    ],
    'items' => [
        [
            'description' => mb_substr($description, 0, 128),
            'quantity' => '1',
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'RUB'
            ],
            'vat_code' => 1, // НДС не облагается
            'payment_mode' => 'full_payment',
            'payment_subject' => 'commodity'
        ]
    ]
];

// Логируем создание платежа
yookassaLog('Creating payment', [
    'amount' => $amount,
    'email' => $email,
    'product_id' => $productId
]);

// Создаем платеж через API
$payment = yookassaApiRequest('/payments', 'POST', $paymentData);

if (!$payment) {
    yookassaLog('Payment creation failed');
    echo json_encode([
        'ok' => 'FALSE',
        'error' => 'Не удалось создать платеж. Попробуйте позже.'
    ]);
    exit;
}

// Проверяем наличие URL подтверждения
if (!isset($payment['confirmation']['confirmation_url'])) {
    yookassaLog('No confirmation URL in response', $payment);
    echo json_encode([
        'ok' => 'FALSE',
        'error' => 'Ошибка получения ссылки на оплату'
    ]);
    exit;
}

// Сохраняем платеж (опционально - можно сохранить в БД)
// TODO: Сохранить данные платежа в базу данных
// $payment['id'], $payment['status'], $email, $amount, $productId

yookassaLog('Payment created successfully', [
    'payment_id' => $payment['id'],
    'status' => $payment['status']
]);

// Возвращаем результат
echo json_encode([
    'ok' => 'TRUE',
    'redirect' => 'yes',
    'url' => $payment['confirmation']['confirmation_url'],
    'payment_id' => $payment['id']
]);

