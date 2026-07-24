<?php
declare(strict_types=1);

require_once __DIR__ . '/api/form-session.php';
require_thank_you_access('service', './#service');
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Спасибо — сервисная задача принята</title>
  <meta name="description" content="Сервисная задача для команды ГК «Ювин» принята.">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="theme-color" content="#061b3d">
  <link rel="icon" href="assets/uwin-group-logo-white.png" type="image/png">
  <link rel="stylesheet" href="styles.css?v=20260724-01">
  <script src="cookie-consent.js?v=20260724-02" defer></script>
</head>
<body class="thank-you-page">
  <header class="thank-you-header">
    <a class="brand" href="./" aria-label="Группа компаний Ювин — вернуться на главную">
      <img src="assets/uwin-group-logo-white.png" alt="">
      <span class="brand__company">Группа компаний<br><strong>Ювин</strong></span>
      <span class="brand__product">SILVER <b>Ag<sup>+</sup></b></span>
    </a>
    <a class="thank-you-header__phone" href="tel:+79230017816">
      <span>Обсудить сервисную задачу</span>
      <strong>+7 923 001-78-16</strong>
    </a>
  </header>

  <main class="thank-you-main">
    <section class="thank-you-card" aria-labelledby="thank-you-title">
      <div class="thank-you-card__signal" aria-hidden="true"><span>✓</span></div>
      <p>ЗАПРОС ПРИНЯТ · СЕРВИСНАЯ КОМАНДА «ЮВИН»</p>
      <h1 id="thank-you-title">Спасибо!</h1>
      <h2>Сервисная задача принята</h2>
      <p class="thank-you-card__lead">Специалист сервисной команды свяжется с вами, чтобы уточнить задачу по линии и предложить подходящий формат работ.</p>
      <div class="thank-you-card__actions">
        <a class="button button--primary" href="./">Вернуться на сайт</a>
        <a class="thank-you-card__phone" href="tel:+79230017816">Позвонить: +7 923 001-78-16</a>
      </div>
    </section>
  </main>

  <footer class="thank-you-footer">
    <span>© ООО ГК «Ювин»</span>
    <a href="mailto:service@uwingroup.ru">service@uwingroup.ru</a>
  </footer>
</body>
</html>
