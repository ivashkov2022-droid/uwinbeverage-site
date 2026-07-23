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

const trackingFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];

const fillTrackingFields = (form) => {
  if (!form) return;

  const pageParams = new URLSearchParams(window.location.search);
  if (form.elements.source_url) form.elements.source_url.value = window.location.href;
  if (form.elements.referrer) form.elements.referrer.value = document.referrer;
  trackingFields.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = pageParams.get(field) || '';
  });
};

const pilotForm = document.querySelector('#pilot-form');

if (pilotForm) {
  const status = document.querySelector('#form-status');
  const pageParams = new URLSearchParams(window.location.search);
  const contactErrors = {
    'contact-error': 'Проверьте заполнение полей и отправьте заявку ещё раз.',
    'contact-send-error': 'Не удалось отправить заявку. Позвоните нам по номеру в блоке контактов или попробуйте ещё раз.'
  };
  const formResult = pageParams.get('form');

  fillTrackingFields(pilotForm);

  if (status && formResult && Object.prototype.hasOwnProperty.call(contactErrors, formResult)) {
    status.textContent = contactErrors[formResult];
    status.classList.add('is-error');

    pageParams.delete('form');
    const cleanQuery = pageParams.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`);
  }

  pilotForm.addEventListener('submit', () => {
    const submitButton = pilotForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем заявку…';
    }
    if (status) {
      status.textContent = 'Передаём заявку. Пожалуйста, не закрывайте страницу.';
      status.classList.remove('is-error');
    }
  });
}

const setupLeadModal = ({ modalSelector, openerSelector, closeSelector, errorMessages }) => {
  const modal = document.querySelector(modalSelector);
  const openers = document.querySelectorAll(openerSelector);
  const form = modal?.querySelector('.pilot-modal__form');
  const status = modal?.querySelector('[aria-live]');

  if (!modal || !openers.length || !form || !status) return;

  let activeTrigger = null;
  let closeTimer = null;

  const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled])';

  const openModal = (trigger) => {
    if (closeTimer) window.clearTimeout(closeTimer);
    activeTrigger = trigger || activeTrigger;
    if (form.elements.lead_source) {
      form.elements.lead_source.value = trigger?.dataset.leadSource || '';
    }
    modal.hidden = false;
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
      modal.classList.add('is-open');
      modal.querySelector('input[name="name"]')?.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      activeTrigger?.focus();
    }, 260);
  };

  openers.forEach((opener) => {
    opener.addEventListener('click', () => openModal(opener));
  });

  modal.querySelectorAll(closeSelector).forEach((closer) => {
    closer.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll(focusableSelector)];
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

  fillTrackingFields(form);

  const formResult = pageParams.get('form');
  if (formResult && Object.prototype.hasOwnProperty.call(errorMessages, formResult)) {
    status.textContent = errorMessages[formResult];
    status.classList.add('is-error');
    openModal(openers[0]);

    pageParams.delete('form');
    const cleanQuery = pageParams.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`);
  }

  form.addEventListener('submit', () => {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем заявку…';
    }
    status.textContent = 'Передаём заявку. Пожалуйста, не закрывайте страницу.';
    status.classList.remove('is-error');
  });
};

setupLeadModal({
  modalSelector: '#pilot-modal',
  openerSelector: '.js-pilot-modal-open',
  closeSelector: '[data-pilot-modal-close]',
  errorMessages: {
    error: 'Проверьте заполнение полей и отправьте заявку ещё раз.',
    'send-error': 'Не удалось отправить заявку. Позвоните нам по номеру в шапке сайта или попробуйте ещё раз.'
  }
});

setupLeadModal({
  modalSelector: '#scheme-modal',
  openerSelector: '.js-scheme-modal-open',
  closeSelector: '[data-scheme-modal-close]',
  errorMessages: {
    'scheme-error': 'Проверьте заполнение полей и отправьте запрос ещё раз.',
    'scheme-send-error': 'Не удалось отправить запрос. Позвоните нам по номеру в шапке сайта или попробуйте ещё раз.'
  }
});

setupLeadModal({
  modalSelector: '#documents-modal',
  openerSelector: '.js-documents-modal-open',
  closeSelector: '[data-documents-modal-close]',
  errorMessages: {
    'documents-error': 'Проверьте заполнение полей и отправьте запрос ещё раз.',
    'documents-send-error': 'Не удалось отправить запрос. Позвоните нам по номеру в шапке сайта или попробуйте ещё раз.'
  }
});

setupLeadModal({
  modalSelector: '#service-modal',
  openerSelector: '.js-service-modal-open',
  closeSelector: '[data-service-modal-close]',
  errorMessages: {
    'service-error': 'Проверьте заполнение полей и отправьте задачу ещё раз.',
    'service-send-error': 'Не удалось отправить задачу. Позвоните нам по номеру в шапке сайта или попробуйте ещё раз.'
  }
});

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
