<?php
declare(strict_types=1);

date_default_timezone_set('Europe/Moscow');

function lead_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name('uwin_lead_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function reject_cross_site_submission(): void
{
    $siteHost = strtolower((string) preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));

    if ($siteHost === '') {
        return;
    }

    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $headerName) {
        $headerValue = trim((string) ($_SERVER[$headerName] ?? ''));

        if ($headerValue === '') {
            continue;
        }

        $requestHost = parse_url($headerValue, PHP_URL_HOST);

        if (!is_string($requestHost) || !hash_equals($siteHost, strtolower($requestHost))) {
            http_response_code(403);
            exit('Forbidden');
        }
    }
}

function enforce_submission_rate_limit(
    string $formKey,
    int $maximumSubmissions = 4,
    int $windowSeconds = 600
): void {
    lead_session_start();

    $now = time();
    $history = $_SESSION['uwin_form_rate'][$formKey] ?? [];
    $history = is_array($history)
        ? array_values(array_filter(
            $history,
            static fn ($timestamp): bool => is_int($timestamp) && ($now - $timestamp) < $windowSeconds
        ))
        : [];

    if (count($history) >= $maximumSubmissions) {
        session_write_close();
        header('Retry-After: ' . $windowSeconds, true);
        http_response_code(429);
        exit('Too Many Requests');
    }

    $history[] = $now;
    $_SESSION['uwin_form_rate'][$formKey] = $history;
    session_write_close();
}

function grant_thank_you_access(string $conversion): void
{
    lead_session_start();
    session_regenerate_id(true);
    $_SESSION['uwin_conversions'][$conversion] = time();
    session_write_close();
}

function require_thank_you_access(
    string $conversion,
    string $fallback = './',
    int $lifetime = 1800
): void {
    header('X-Robots-Tag: noindex, nofollow, noarchive', true);
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0', true);
    header('Pragma: no-cache', true);
    header('Referrer-Policy: strict-origin-when-cross-origin', true);

    lead_session_start();
    $issuedAt = (int) ($_SESSION['uwin_conversions'][$conversion] ?? 0);
    $hasAccess = $issuedAt > 0 && (time() - $issuedAt) <= $lifetime;
    session_write_close();

    if (!$hasAccess) {
        header('Location: ' . $fallback, true, 303);
        exit;
    }
}
