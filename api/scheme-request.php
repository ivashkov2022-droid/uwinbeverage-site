<?php
declare(strict_types=1);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method Not Allowed');
}

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

$name = form_value('name', 80);
$phone = form_value('phone', 40);
$email = form_value('email', 120);
$lineDetails = form_value('line_details', 240);
$consent = form_value('consent', 10);
$phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';

if (
    $name === ''
    || strlen($phoneDigits) < 7
    || strlen($phoneDigits) > 15
    || filter_var($email, FILTER_VALIDATE_EMAIL) === false
    || $consent !== 'yes'
) {
    redirect_to('../?form=scheme-error#implementation');
}

$trackingLabels = [
    'utm_source' => 'UTM source',
    'utm_medium' => 'UTM medium',
    'utm_campaign' => 'UTM campaign',
    'utm_content' => 'UTM content',
    'utm_term' => 'UTM term',
    'yclid' => 'YCLID',
];

$message = [
    'Новый запрос на подбор схемы внедрения SILVER Ag+',
    '',
    'Имя: ' . $name,
    'Телефон: ' . $phone,
    'Почта: ' . $email,
    'Параметры линии и форматы тары: ' . ($lineDetails ?: 'не указаны'),
    'Согласие на обработку персональных данных: получено',
    '',
    'Страница: ' . (form_value('source_url', 700) ?: '—'),
    'Источник перехода: ' . (form_value('referrer', 700) ?: '—'),
];

foreach ($trackingLabels as $field => $label) {
    $value = form_value($field, 240);
    if ($value !== '') {
        $message[] = $label . ': ' . $value;
    }
}

$message[] = '';
$message[] = 'Дата запроса: ' . date('d.m.Y H:i:s T');

$recipient = 'service@uwingroup.ru';
$subject = 'Новый запрос на подбор схемы внедрения SILVER Ag+';
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$headers = [
    'From: SILVER Ag+ <no-reply@uwinbeverage.ru>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Auto-Response-Suppress: All',
];

$sent = mail(
    $recipient,
    $encodedSubject,
    implode("\r\n", $message),
    implode("\r\n", $headers)
);

if (!$sent) {
    redirect_to('../?form=scheme-send-error#implementation');
}

redirect_to('../thanks-scheme.html');
