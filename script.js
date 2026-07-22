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
