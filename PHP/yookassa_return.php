<?php
/**
 * Страница возврата после оплаты YooKassa
 * Пользователь попадает сюда после оплаты на странице YooKassa
 */

require_once __DIR__ . '/yookassa_config.php';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Обработка платежа...</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 50px 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #5865F2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 30px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: #4CAF50;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: scaleIn 0.5s ease-out;
        }
        
        .success-icon::before {
            content: '✓';
            font-size: 48px;
            color: white;
            font-weight: bold;
        }
        
        .error-icon {
            width: 80px;
            height: 80px;
            background: #f44336;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: scaleIn 0.5s ease-out;
        }
        
        .error-icon::before {
            content: '✕';
            font-size: 48px;
            color: white;
            font-weight: bold;
        }
        
        @keyframes scaleIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        h1 {
            color: #333;
            margin-bottom: 15px;
            font-size: 24px;
        }
        
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 25px;
        }
        
        .payment-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .payment-info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .payment-info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .label {
            color: #888;
            font-size: 14px;
        }
        
        .value {
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }
        
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            margin-top: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        #loading {
            display: block;
        }
        
        #success, #error {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Состояние загрузки -->
        <div id="loading">
            <div class="spinner"></div>
            <h1>Проверяем статус платежа...</h1>
            <p>Пожалуйста, подождите</p>
        </div>
        
        <!-- Состояние успеха -->
        <div id="success">
            <div class="success-icon"></div>
            <h1>Платеж успешно выполнен!</h1>
            <p>Спасибо за покупку! Товар будет отправлен на указанный email в ближайшее время.</p>
            <div class="payment-info" id="payment-info"></div>
            <a href="/" class="btn">Вернуться на главную</a>
        </div>
        
        <!-- Состояние ошибки -->
        <div id="error">
            <div class="error-icon"></div>
            <h1>Платеж не выполнен</h1>
            <p id="error-message">Произошла ошибка при обработке платежа.</p>
            <a href="/" class="btn">Вернуться на главную</a>
        </div>
    </div>
    
    <script>
        // Проверяем статус платежа
        const urlParams = new URLSearchParams(window.location.search);
        
        // Даем время YooKassa обработать платеж
        setTimeout(function() {
            checkPaymentStatus();
        }, 2000);
        
        function checkPaymentStatus() {
            // Отправляем запрос на проверку последнего платежа
            fetch('yookassa_check_payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('loading').style.display = 'none';
                
                if (data.status === 'succeeded') {
                    // Платеж успешен
                    document.getElementById('success').style.display = 'block';
                    document.querySelector('.success-icon').style.display = 'flex';
                    
                    // Отображаем информацию о платеже
                    if (data.payment_info) {
                        const info = data.payment_info;
                        const infoHtml = `
                            <div class="payment-info-item">
                                <span class="label">ID платежа:</span>
                                <span class="value">${info.id}</span>
                            </div>
                            <div class="payment-info-item">
                                <span class="label">Сумма:</span>
                                <span class="value">${info.amount} ₽</span>
                            </div>
                            <div class="payment-info-item">
                                <span class="label">Email:</span>
                                <span class="value">${info.email}</span>
                            </div>
                        `;
                        document.getElementById('payment-info').innerHTML = infoHtml;
                    }
                } else if (data.status === 'pending') {
                    // Платеж в обработке - ждем еще
                    setTimeout(checkPaymentStatus, 3000);
                    document.getElementById('loading').style.display = 'block';
                } else {
                    // Платеж отменен или ошибка
                    document.getElementById('error').style.display = 'block';
                    document.querySelector('.error-icon').style.display = 'flex';
                    
                    if (data.message) {
                        document.getElementById('error-message').textContent = data.message;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                document.querySelector('.error-icon').style.display = 'flex';
            });
        }
    </script>
</body>
</html>

