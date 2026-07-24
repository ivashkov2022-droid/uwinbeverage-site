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

$name = form_value('name', 80);
$company = form_value('company', 160);
$phone = form_value('phone', 40);
$email = form_value('email', 120);
$task = form_value('task', 800);
$consent = form_value('consent', 10);
$leadSource = form_value('lead_source', 40);
$phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';
$leadSources = [
    'hero' => 'Первый экран',
    'pilot-section' => 'Блок пилота',
    'contact-section' => 'Открытая форма перед подвалом',
];
$leadSourceLabel = $leadSources[$leadSource] ?? 'Не определён';
$isContactForm = $leadSource === 'contact-section';
$errorAnchor = $isContactForm ? '../?form=contact-error#contact' : '../?form=error#top';
$sendErrorAnchor = $isContactForm ? '../?form=contact-send-error#contact' : '../?form=send-error#top';

enforce_submission_rate_limit($isContactForm ? 'contact' : 'pilot');

if (
    $name === ''
    || strlen($phoneDigits) < 7
    || strlen($phoneDigits) > 15
    || filter_var($email, FILTER_VALIDATE_EMAIL) === false
    || $consent !== 'yes'
) {
    redirect_to($errorAnchor);
}

$message = [
    'Новая заявка на бесплатный пилот SILVER Ag+',
    '',
    'Имя: ' . $name,
    'Компания: ' . ($company ?: 'не указана'),
    'Телефон: ' . $phone,
    'Почта: ' . $email,
    'Задача: ' . ($task ?: 'не указана'),
    'Источник заявки: ' . $leadSourceLabel,
    'Согласие на обработку персональных данных: получено',
];

$subject = 'Новая заявка на бесплатный пилот SILVER Ag+';
$sent = uwin_send_notification($subject, $message, $email);

if (!$sent) {
    redirect_to($sendErrorAnchor);
}

if ($isContactForm) {
    grant_thank_you_access('contact');
    redirect_to('../thanks-contact.php');
}

$thanksSource = array_key_exists($leadSource, $leadSources) ? $leadSource : 'unknown';
grant_thank_you_access('pilot');
redirect_to('../thanks-pilot.php?source=' . rawurlencode($thanksSource));
