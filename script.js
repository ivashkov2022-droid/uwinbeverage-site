const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const pilotForm = document.querySelector('#pilot-form');

if (pilotForm) {
  pilotForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(pilotForm);
    const subject = `Заявка на пилот SILVER Ag+ — ${data.get('company') || data.get('name')}`;
    const body = [
      `Имя: ${data.get('name') || '—'}`,
      `Компания: ${data.get('company') || '—'}`,
      `Телефон: ${data.get('phone') || '—'}`,
      `Почта: ${data.get('email') || '—'}`,
      '',
      'Задача:',
      data.get('task') || '—'
    ].join('\n');

    const status = document.querySelector('#form-status');
    if (status) status.textContent = 'Заявка подготовлена. Открываем почтовое приложение…';

    window.location.href = `mailto:service@uwingroup.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const pilotModal = document.querySelector('#pilot-modal');
const pilotModalOpeners = document.querySelectorAll('.js-pilot-modal-open');
const pilotModalForm = pilotModal?.querySelector('.pilot-modal__form');
const pilotModalStatus = document.querySelector('#pilot-modal-status');

if (pilotModal && pilotModalOpeners.length && pilotModalForm) {
  let activeTrigger = null;
  let closeTimer = null;

  const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])';

  const openPilotModal = (trigger) => {
    if (closeTimer) window.clearTimeout(closeTimer);
    activeTrigger = trigger || activeTrigger;
    pilotModal.hidden = false;
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
      pilotModal.classList.add('is-open');
      pilotModal.querySelector('input[name="name"]')?.focus();
    });
  };

  const closePilotModal = () => {
    pilotModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    closeTimer = window.setTimeout(() => {
      pilotModal.hidden = true;
      activeTrigger?.focus();
    }, 260);
  };

  pilotModalOpeners.forEach((opener) => {
    opener.addEventListener('click', () => openPilotModal(opener));
  });

  pilotModal.querySelectorAll('[data-pilot-modal-close]').forEach((closer) => {
    closer.addEventListener('click', closePilotModal);
  });

  document.addEventListener('keydown', (event) => {
    if (pilotModal.hidden) return;

    if (event.key === 'Escape') {
      closePilotModal();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [...pilotModal.querySelectorAll(focusableSelector)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const pageParams = new URLSearchParams(window.location.search);
  const trackingFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];

  pilotModalForm.elements.source_url.value = window.location.href;
  pilotModalForm.elements.referrer.value = document.referrer;
  trackingFields.forEach((field) => {
    pilotModalForm.elements[field].value = pageParams.get(field) || '';
  });

  const formResult = pageParams.get('form');
  if (formResult === 'error' || formResult === 'send-error') {
    pilotModalStatus.textContent = formResult === 'error'
      ? 'Проверьте заполнение полей и отправьте заявку ещё раз.'
      : 'Не удалось отправить заявку. Позвоните нам по номеру в шапке сайта или попробуйте ещё раз.';
    pilotModalStatus.classList.add('is-error');
    openPilotModal(pilotModalOpeners[0]);

    pageParams.delete('form');
    const cleanQuery = pageParams.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`);
  }

  pilotModalForm.addEventListener('submit', () => {
    const submitButton = pilotModalForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем заявку…';
    }
    pilotModalStatus.textContent = 'Передаём заявку. Пожалуйста, не закрывайте страницу.';
    pilotModalStatus.classList.remove('is-error');
  });
}

const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

if (siteHeader && menuToggle && siteNav) {
  const setMenuState = (isOpen) => {
    siteHeader.classList.toggle('is-menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  };

  menuToggle.addEventListener('click', () => {
    setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  window.matchMedia('(min-width: 1181px)').addEventListener('change', (event) => {
    if (event.matches) setMenuState(false);
  });
}
