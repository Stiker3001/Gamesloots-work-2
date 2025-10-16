<?php
/**
 * Обработчик вебхуков YooKassa
 * 
 * Настройте в личном кабинете YooKassa:
 * URL: https://ваш-домен.com/PHP/yookassa_webhook.php
 * 
 * События:
 * - payment.succeeded
 * - payment.canceled
 * - payment.waiting_for_capture
 */

require_once __DIR__ . '/yookassa_config.php';

// Получаем тело запроса
$body = file_get_contents('php://input');
$event = json_decode($body, true);

// Логируем все входящие вебхуки
yookassaLog('Webhook received', $event);

// Проверяем структуру события
if (!$event || !isset($event['event']) || !isset($event['object'])) {
    http_response_code(400);
    exit('Invalid event structure');
}

$eventType = $event['event'];
$payment = $event['object'];

// Обрабатываем разные типы событий
switch ($eventType) {
    case 'payment.succeeded':
        handlePaymentSucceeded($payment);
        break;
        
    case 'payment.canceled':
        handlePaymentCanceled($payment);
        break;
        
    case 'payment.waiting_for_capture':
        handlePaymentWaitingForCapture($payment);
        break;
        
    default:
        yookassaLog('Unknown event type: ' . $eventType);
}

// Сохраняем ID платежа в сессию для страницы возврата
session_start();
$_SESSION['last_payment_id'] = $payment['id'];

// Отправляем успешный ответ
http_response_code(200);
exit('OK');

/**
 * Обработка успешного платежа
 */
function handlePaymentSucceeded($payment) {
    $paymentId = $payment['id'];
    $amount = $payment['amount']['value'];
    $currency = $payment['amount']['currency'];
    $email = $payment['metadata']['email'] ?? '';
    $productId = $payment['metadata']['product_id'] ?? '';
    $count = $payment['metadata']['count'] ?? 1;
    
    yookassaLog('Payment succeeded', [
        'payment_id' => $paymentId,
        'amount' => $amount,
        'email' => $email,
        'product_id' => $productId
    ]);
    
    // TODO: Ваша бизнес-логика
    // 1. Сохранить платеж в базу данных
    // 2. Отправить ключи товара на email
    // 3. Обновить статус заказа
    // 4. Отправить уведомление администратору
    
    // Пример отправки email (раскомментируйте и настройте)
    /*
    $to = $email;
    $subject = 'Ваш заказ успешно оплачен';
    $message = "Здравствуйте!\n\nВаш платеж на сумму {$amount} {$currency} успешно выполнен.\n\nСпасибо за покупку!";
    $headers = 'From: noreply@' . $_SERVER['HTTP_HOST'];
    
    mail($to, $subject, $message, $headers);
    */
}

/**
 * Обработка отмены платежа
 */
function handlePaymentCanceled($payment) {
    $paymentId = $payment['id'];
    $cancellationReason = $payment['cancellation_details']['reason'] ?? 'unknown';
    
    yookassaLog('Payment canceled', [
        'payment_id' => $paymentId,
        'reason' => $cancellationReason
    ]);
    
    // TODO: Ваша бизнес-логика
    // 1. Обновить статус заказа
    // 2. Отправить уведомление пользователю
}

/**
 * Обработка платежа в ожидании подтверждения
 */
function handlePaymentWaitingForCapture($payment) {
    $paymentId = $payment['id'];
    
    yookassaLog('Payment waiting for capture', [
        'payment_id' => $paymentId
    ]);
    
    // Если нужно автоматически подтвердить платеж:
    // $captured = yookassaApiRequest("/payments/{$paymentId}/capture", 'POST', [
    //     'amount' => $payment['amount']
    // ]);
}

