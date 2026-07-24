<?php
declare(strict_types=1);

require_once __DIR__ . '/api/form-session.php';
require_thank_you_access('contact', './#contact');
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Спасибо — заявка с сайта SILVER Ag+ принята</title>
  <meta name="description" content="Заявка с сайта SILVER Ag+ принята.">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="theme-color" content="#061b3d">
  <link rel="icon" href="assets/uwin-group-logo-white.png" type="image/png">
  <link rel="stylesheet" href="styles.css?v=20260724-03">
  <script src="cookie-consent.js?v=20260724-05" defer></script>
</head>
<body class="thank-you-page">
  <header class="thank-you-header">
    <a class="brand" href="./" aria-label="SILVER Ag+ — вернуться на главную">
      <img src="assets/uwin-group-logo-white.png" alt="">
      <span class="brand__company">Группа компаний<br><strong>Ювин</strong></span>
      <span class="brand__product">SILVER <b>Ag<sup>+</sup></b></span>
    </a>
    <a class="thank-you-header__phone" href="tel:+79230017816">
      <span>Обсудить применение</span>
      <strong>+7 923 001-78-16</strong>
    </a>
  </header>

  <main class="thank-you-main">
    <section class="thank-you-card" aria-labelledby="thank-you-title">
      <div class="thank-you-card__signal" aria-hidden="true"><span>✓</span></div>
      <p>ЗАЯВКА ПРИНЯТА · КОНТАКТНАЯ ФОРМА</p>
      <h1 id="thank-you-title">Спасибо!</h1>
      <h2>Заявка на пилот принята</h2>
      <p class="thank-you-card__lead">Свяжемся с вами, чтобы уточнить параметры продукта, линии и условия проведения теста.</p>
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
