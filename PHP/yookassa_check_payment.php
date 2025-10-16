<?php
/**
 * Проверка статуса платежа YooKassa
 */

require_once __DIR__ . '/yookassa_config.php';

header('Content-Type: application/json; charset=utf-8');

// Получаем ID платежа из запроса или используем последний из сессии
session_start();
$paymentId = $_POST['payment_id'] ?? $_SESSION['last_payment_id'] ?? '';

if (empty($paymentId)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID платежа не указан'
    ]);
    exit;
}

// Запрашиваем информацию о платеже
$payment = yookassaApiRequest('/payments/' . $paymentId, 'GET');

if (!$payment) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Не удалось получить информацию о платеже'
    ]);
    exit;
}

yookassaLog('Payment status checked', [
    'payment_id' => $paymentId,
    'status' => $payment['status']
]);

// Возвращаем статус
$response = [
    'status' => $payment['status'],
    'payment_info' => [
        'id' => $payment['id'],
        'amount' => $payment['amount']['value'],
        'currency' => $payment['amount']['currency'],
        'email' => $payment['metadata']['email'] ?? '',
        'description' => $payment['description'] ?? ''
    ]
];

// Если платеж успешен, можно выполнить дополнительные действия
if ($payment['status'] === 'succeeded') {
    // TODO: Отправить товар на email
    // TODO: Обновить базу данных
    // TODO: Отправить уведомление администратору
    
    $response['message'] = 'Платеж успешно выполнен';
}

echo json_encode($response);

