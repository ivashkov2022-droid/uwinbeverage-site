(() => {
  const consentKey = 'uwin_cookie_consent_v1';
  const analyticsConsent = 'analytics';
  const necessaryConsent = 'necessary';

  const readConsent = () => {
    try {
      const savedValue = window.localStorage.getItem(consentKey);
      if (savedValue) return savedValue;
    } catch (error) {
      // Cookie fallback is checked below.
    }

    const cookieValue = document.cookie
      .split('; ')
      .find((item) => item.startsWith(`${consentKey}=`));
    return cookieValue ? cookieValue.split('=')[1] : null;
  };

  const saveConsent = (value) => {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (error) {
      document.cookie = `${consentKey}=${value}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    }
  };

  const loadMetrika = () => {
    if (window.__uwinMetrikaLoaded) return;
    window.__uwinMetrikaLoaded = true;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    script.onload = () => {
      window.ym(109726006, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    };
    document.head.appendChild(script);
  };

  const closeBanner = (banner) => {
    banner.classList.add('is-closing');
    window.setTimeout(() => banner.remove(), 180);
  };

  const showBanner = () => {
    if (document.querySelector('.cookie-banner')) return;

    const banner = document.createElement('aside');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Настройки cookie');
    banner.innerHTML = `
      <p>Мы используем cookie для работы сайта, а Яндекс Метрику — только с вашего согласия. <a href="privacy.html#cookie">Подробнее</a></p>
      <div class="cookie-banner__actions">
        <button class="cookie-banner__button cookie-banner__button--secondary" type="button" data-cookie-choice="necessary">Только необходимые</button>
        <button class="cookie-banner__button" type="button" data-cookie-choice="analytics">Разрешить</button>
      </div>
    `;

    banner.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cookie-choice]');
      if (!button) return;

      const choice = button.dataset.cookieChoice;
      saveConsent(choice);
      if (choice === analyticsConsent) loadMetrika();
      closeBanner(banner);
    });

    document.body.appendChild(banner);
    window.requestAnimationFrame(() => banner.classList.add('is-visible'));
  };

  const consent = readConsent();
  if (consent === analyticsConsent) {
    loadMetrika();
  } else if (consent !== necessaryConsent) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner, { once: true });
    } else {
      showBanner();
    }
  }
})();
