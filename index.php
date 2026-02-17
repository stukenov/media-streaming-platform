<?php
// Включаем обработку ошибок
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Устанавливаем CORS заголовки
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Если это preflight OPTIONS запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Получаем целевой URL из параметра запроса
$targetUrl = $_GET['url'] ?? '';

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode(['error' => 'URL parameter is required']);
    exit();
}

// Базовый URL для S3
$baseS3Url = 'https://sprs-bucket.object.pscloud.io';

// Проверяем, что запрашиваемый URL относится к разрешенному домену
if (strpos($targetUrl, $baseS3Url) !== 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Access to this domain is not allowed']);
    exit();
}

try {
    // Инициализируем cURL
    $ch = curl_init();
    
    // Настраиваем параметры cURL
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    // Копируем заголовки запроса
    $headers = getallheaders();
    $curlHeaders = [];
    foreach ($headers as $key => $value) {
        if (!in_array(strtolower($key), ['host', 'connection'])) {
            $curlHeaders[] = "$key: $value";
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);

    // Выполняем запрос
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Получаем заголовки ответа
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    
    if ($response === false) {
        throw new Exception(curl_error($ch));
    }
    
    // Закрываем cURL
    curl_close($ch);
    
    // Отправляем тот же Content-Type
    header("Content-Type: $contentType");
    http_response_code($httpCode);
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
