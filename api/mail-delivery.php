<?php
declare(strict_types=1);

const UWIN_NOTIFICATION_RECIPIENTS = [
    'service@uwingroup.ru',
    'ivv2@mail.ru',
];

function uwin_post_value(string $key, int $maxLength = 700): string
{
    $value = trim((string) ($_POST[$key] ?? ''));
    $value = str_replace(["\0", "\r", "\n"], ['', ' ', ' '], $value);

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function uwin_server_value(string $key, int $maxLength = 1000): string
{
    $value = trim((string) ($_SERVER[$key] ?? ''));
    $value = str_replace(["\0", "\r", "\n"], ['', ' ', ' '], $value);

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function uwin_append_request_context(array $message): array
{
    $trackingLabels = [
        'utm_source' => 'UTM source',
        'utm_medium' => 'UTM medium',
        'utm_campaign' => 'UTM campaign',
        'utm_content' => 'UTM content',
        'utm_term' => 'UTM term',
        'utm_id' => 'UTM ID',
        'yclid' => 'YCLID',
        'gclid' => 'GCLID',
        'wbraid' => 'WBRAID',
        'gbraid' => 'GBRAID',
        '_openstat' => 'Openstat',
    ];

    $message[] = '';
    $message[] = '— Источник и аналитика —';
    $message[] = 'Дата и время (Москва): ' . date('d.m.Y H:i:s');
    $message[] = 'Страница отправки: ' . (uwin_post_value('source_url') ?: '—');
    $message[] = 'Источник перехода: ' . (uwin_post_value('referrer') ?: 'прямой переход / не передан');

    foreach ($trackingLabels as $field => $label) {
        $value = uwin_post_value($field, 300);
        if ($value !== '') {
            $message[] = $label . ': ' . $value;
        }
    }

    $message[] = '';
    $message[] = '— Технические сведения —';
    $message[] = 'IP соединения: ' . (uwin_server_value('REMOTE_ADDR', 80) ?: '—');
    $message[] = 'Браузер и устройство: ' . (uwin_server_value('HTTP_USER_AGENT') ?: '—');
    $message[] = 'Язык браузера: ' . (uwin_server_value('HTTP_ACCEPT_LANGUAGE', 300) ?: '—');
    $message[] = 'Домен: ' . (uwin_server_value('HTTP_HOST', 200) ?: 'uwinbeverage.ru');

    try {
        $requestId = bin2hex(random_bytes(8));
    } catch (Throwable $exception) {
        $requestId = uniqid('lead-', true);
    }

    $message[] = 'ID заявки: ' . $requestId;

    return $message;
}

function uwin_send_notification(
    string $subject,
    array $message,
    string $replyTo,
    string $fromName = 'SILVER Ag+'
): bool {
    $safeReplyTo = str_replace(["\r", "\n"], '', $replyTo);
    $safeFromName = str_replace(["\r", "\n"], '', $fromName);
    $encodedSubject = '=?UTF-8?B?' . base64_encode('[uwinbeverage.ru] ' . $subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($safeFromName) . '?=';
    $headers = [
        'From: ' . $encodedFromName . ' <service@uwingroup.ru>',
        'Reply-To: ' . $safeReplyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Auto-Response-Suppress: All',
        'X-Entity-Ref-ID: ' . hash('sha256', implode('|', $message) . microtime(true)),
    ];
    $body = implode("\r\n", uwin_append_request_context($message));
    $allSent = true;

    foreach (UWIN_NOTIFICATION_RECIPIENTS as $recipient) {
        $sent = mail(
            $recipient,
            $encodedSubject,
            $body,
            implode("\r\n", $headers),
            '-fservice@uwingroup.ru'
        );

        if (!$sent) {
            $allSent = false;
            error_log('UWIN lead notification delivery failed for ' . $recipient);
        }
    }

    return $allSent;
}
