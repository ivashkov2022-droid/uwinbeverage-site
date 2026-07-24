<?php
declare(strict_types=1);

require_once __DIR__ . '/form-session.php';
require_once __DIR__ . '/mail-delivery.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method Not Allowed');
}

reject_cross_site_submission();

function form_value(string $key, int $maxLength = 500): string
{
    $value = trim((string) ($_POST[$key] ?? ''));
    $value = str_replace("\0", '', $value);

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function redirect_to(string $location): void
{
    header('Location: ' . $location, true, 303);
    exit;
}

if (form_value('website', 200) !== '') {
    http_response_code(204);
    exit;
}

enforce_submission_rate_limit('service');

$name = form_value('name', 80);
$phone = form_value('phone', 40);
$email = form_value('email', 120);
$serviceTask = form_value('service_task', 600);
$consent = form_value('consent', 10);
$phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';

if (
    $name === ''
    || strlen($phoneDigits) < 7
    || strlen($phoneDigits) > 15
    || filter_var($email, FILTER_VALIDATE_EMAIL) === false
    || $consent !== 'yes'
) {
    redirect_to('../?form=service-error#service');
}

$message = [
    'Новая сервисная задача для ГК «Ювин»',
    '',
    'Имя: ' . $name,
    'Телефон: ' . $phone,
    'Почта: ' . $email,
    'Сервисная задача: ' . ($serviceTask ?: 'не указана'),
    'Согласие на обработку персональных данных: получено',
];

$subject = 'Новая сервисная задача — ГК «Ювин»';
$sent = uwin_send_notification($subject, $message, $email, 'Сервисная команда ГК «Ювин»');

if (!$sent) {
    redirect_to('../?form=service-send-error#service');
}

grant_thank_you_access('service');
redirect_to('../thanks-service.php');
