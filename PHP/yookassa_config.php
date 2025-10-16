<?php
/**
 * Конфигурация YooKassa
 */

// Учетные данные YooKassa
define('YOOKASSA_SHOP_ID', '1079742');
define('YOOKASSA_SECRET_KEY', 'live_ABjYUAVrlNi9ve3nVOPvyU_r9T7tv6raW5Jm4qc0ySU');

// URL API YooKassa
define('YOOKASSA_API_URL', 'https://api.yookassa.ru/v3');

// Настройки сайта
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$base_url = $protocol . '://' . $host;

define('SITE_URL', $base_url);
define('RETURN_URL', $base_url . '/PHP/yookassa_return.php');

/**
 * Выполнить запрос к API YooKassa
 */
function yookassaApiRequest($endpoint, $method = 'GET', $data = null) {
    $url = YOOKASSA_API_URL . $endpoint;
    
    $ch = curl_init($url);
    
    $headers = [
        'Content-Type: application/json'
    ];
    
    // Добавляем ключ идемпотентности для POST/DELETE запросов
    if ($method !== 'GET') {
        $headers[] = 'Idempotence-Key: ' . uniqid('yookassa_', true);
    }
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_USERPWD => YOOKASSA_SHOP_ID . ':' . YOOKASSA_SECRET_KEY,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        error_log("YooKassa API error: $error");
        return false;
    }
    
    if ($httpCode !== 200 && $httpCode !== 201) {
        error_log("YooKassa API HTTP $httpCode: $response");
        return false;
    }
    
    return json_decode($response, true);
}

/**
 * Логирование событий
 */
function yookassaLog($message, $data = null) {
    $logMessage = date('[Y-m-d H:i:s] ') . $message;
    if ($data) {
        $logMessage .= ' | ' . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    error_log($logMessage);
}

