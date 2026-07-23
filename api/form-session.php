<?php
declare(strict_types=1);

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
