const servicePanel = document.querySelector('#service');

if (window.location.hash === '#service' && servicePanel) {
  servicePanel.open = true;
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#service' && servicePanel) {
    servicePanel.open = true;
  }
});

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
