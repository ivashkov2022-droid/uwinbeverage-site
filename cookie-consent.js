(() => {
  const consentKey = 'uwin_cookie_consent_v1';
  const analyticsConsent = 'analytics';
  const necessaryConsent = 'necessary';
  const googleMeasurementId = 'G-B44L8N4EFB';

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

  const trackGoogleEvent = (eventName, eventParameters = {}) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, eventParameters);
  };

  const setupGoogleEvents = () => {
    if (window.__uwinGoogleEventsReady) return;
    window.__uwinGoogleEventsReady = true;

    document.addEventListener('click', (event) => {
      const target = event.target.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const commonParameters = {
        link_text: target.textContent.trim().replace(/\s+/g, ' ').slice(0, 120),
        page_location: window.location.href
      };

      if (href.startsWith('tel:')) {
        trackGoogleEvent('phone_click', {
          ...commonParameters,
          link_url: href
        });
        return;
      }

      if (href.startsWith('mailto:')) {
        trackGoogleEvent('email_click', {
          ...commonParameters,
          link_url: href
        });
        return;
      }

      if (href.includes('presentation.html') || href.toLowerCase().endsWith('.pdf')) {
        trackGoogleEvent('presentation_open', {
          ...commonParameters,
          link_url: href
        });
        return;
      }

      const formOpeners = [
        ['js-pilot-modal-open', 'pilot'],
        ['js-scheme-modal-open', 'scheme'],
        ['js-documents-modal-open', 'documents'],
        ['js-service-modal-open', 'service']
      ];
      const matchedOpener = formOpeners.find(([className]) => target.classList.contains(className));
      if (matchedOpener) {
        trackGoogleEvent('lead_form_open', {
          form_type: matchedOpener[1],
          lead_source: target.dataset.leadSource || matchedOpener[1]
        });
      }
    });

    document.addEventListener('submit', (event) => {
      const form = event.target.closest('form');
      if (!form) return;

      const action = form.getAttribute('action') || '';
      const formTypes = {
        'pilot-request.php': 'pilot',
        'scheme-request.php': 'scheme',
        'documents-request.php': 'documents',
        'service-request.php': 'service'
      };
      const matchedType = Object.entries(formTypes).find(([endpoint]) => action.includes(endpoint));
      if (matchedType) {
        trackGoogleEvent('lead_form_submit', {
          form_type: matchedType[1]
        });
      }
    });
  };

  const trackThankYouPage = () => {
    const leadTypes = {
      '/thanks-pilot.php': 'pilot',
      '/thanks-scheme.php': 'scheme',
      '/thanks-documents.php': 'documents',
      '/thanks-service.php': 'service',
      '/thanks-contact.php': 'contact'
    };
    const leadType = leadTypes[window.location.pathname];
    if (!leadType) return;

    trackGoogleEvent(`lead_${leadType}`, {
      lead_type: leadType
    });
  };

  const loadGoogleAnalytics = () => {
    if (window.__uwinGoogleAnalyticsLoaded) return;
    window.__uwinGoogleAnalyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', googleMeasurementId);

    setupGoogleEvents();
    trackThankYouPage();

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleMeasurementId}`;
    document.head.appendChild(script);
  };

  const loadAnalytics = () => {
    loadMetrika();
    loadGoogleAnalytics();
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
      <p>Мы используем cookie для корректной работы сайта и улучшения сервиса. <a href="privacy.html#cookie">Подробнее</a></p>
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
      if (choice === analyticsConsent) loadAnalytics();
      closeBanner(banner);
    });

    document.body.appendChild(banner);
    window.requestAnimationFrame(() => banner.classList.add('is-visible'));
  };

  const consent = readConsent();
  if (consent === analyticsConsent) {
    loadAnalytics();
  } else if (consent !== necessaryConsent) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner, { once: true });
    } else {
      showBanner();
    }
  }
})();
