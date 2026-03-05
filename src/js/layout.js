const page = document.body?.dataset.page || 'home';
const isHome = page === 'home';
const hasHeroHeader = page === 'home' || page === 'team';

const navLinks = [
  { href: '/index.html#about', key: 'nav_about', label: 'About' },
  { href: '/services.html', key: 'nav_services', label: 'Services' },
  { href: '/locations.html', key: 'nav_purchase', label: 'Locations' },
  { href: '/team.html', key: 'nav_barbers', label: 'Barbers' },
  { href: '/locations.html#contact', key: 'nav_contact', label: 'Contact' }
];

const normalizePath = (href) => href.split('#')[0] || '/index.html';
const normalizeHash = (href) => {
  const [, hash] = href.split('#');
  return hash ? `#${hash}` : '';
};

const isActiveLink = (href) => {
  const linkPath = normalizePath(href);
  const linkHash = normalizeHash(href);
  const pageName = page.toLowerCase();
  const currentHash = window.location.hash || '';

  if (pageName === 'home') {
    if (linkPath !== '/index.html') return false;
    if (currentHash) return linkHash === currentHash;
    return linkHash === '#about';
  }

  if (pageName === 'services') return linkPath === '/services.html';
  if (pageName === 'team') return linkPath === '/team.html';
  if (pageName === 'locations') {
    if (currentHash === '#contact') return href === '/locations.html#contact';
    return href === '/locations.html';
  }

  return window.location.pathname.endsWith(linkPath.replace('/', '')) || window.location.pathname === linkPath;
};

const renderLinks = () =>
  navLinks
    .map((link) => {
      const i18n = link.key ? ` data-i18n="${link.key}"` : '';
      const active = isActiveLink(link.href) ? ' header__link--active' : '';
      return `<a href="${link.href}" class="header__link${active}"${i18n}>${link.label}</a>`;
    })
    .join('');

const renderLinksByIndexes = (indexes) =>
  indexes
    .map((index) => navLinks[index])
    .filter(Boolean)
    .map((link) => {
      const i18n = link.key ? ` data-i18n="${link.key}"` : '';
      const active = isActiveLink(link.href) ? ' header__link--active' : '';
      return `<a href="${link.href}" class="header__link${active}"${i18n}>${link.label}</a>`;
    })
    .join('');

const headerHTML = `
<header class="header${hasHeroHeader ? '' : ' header--scrolled'}">
  <div class="header__inner container">
    <div class="header__logo">
      <a href="${isHome ? '#home' : '/index.html'}" aria-label="Lucky Throats home">
        <span class="header__wordmark">Lucky's</span>
        <span class="header__wordsub">Throats</span>
      </a>
    </div>

    <nav class="header__nav header__nav--desktop">
      ${renderLinks()}
    </nav>

    <div class="header__controls">
      <div class="header__tools">
        <a href="/locations.html" class="header__district">Belem</a>
        <a href="/locations.html" class="header__district">Principe Real</a>
        <div class="lang-switch" role="group" aria-label="Language switcher">
          <button class="lang-switch__btn is-active" data-lang="pt">PT</button>
          <button class="lang-switch__btn" data-lang="en">EN</button>
        </div>
        <button class="btn btn--main header__book-btn js-booking-open" data-i18n="book_now">Book now</button>
      </div>
    </div>

    <button class="header__burger" id="burgerToggle" aria-label="Open menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>

  <nav class="header__nav header__nav--mobile" id="mobileNav" aria-label="Mobile navigation">
    <div class="header__mobile-panel" role="dialog" aria-modal="true" aria-label="Site menu">
      <div class="header__mobile-head">
        <span class="header__mobile-title">Menu</span>
        <button class="header__mobile-close" type="button" aria-label="Close menu" data-mobile-close="true">
          <span></span>
          <span></span>
        </button>
      </div>
      <div class="header__mobile-links">
        ${renderLinksByIndexes([0, 1, 2, 3, 4])}
      </div>
      <div class="header__mobile-tools">
        <div class="header__mobile-districts">
          <a href="/locations.html" class="header__district">Belem</a>
          <a href="/locations.html" class="header__district">Principe Real</a>
        </div>
        <div class="lang-switch" role="group" aria-label="Language switcher mobile">
          <button class="lang-switch__btn is-active" data-lang="pt" type="button">PT</button>
          <button class="lang-switch__btn" data-lang="en" type="button">EN</button>
        </div>
        <button class="btn btn--main header__book-btn js-booking-open" data-i18n="book_now" type="button">Book now</button>
        <div class="header__mobile-contact">
          <a href="tel:+351968914130" class="header__mobile-phone">+351 968 914 130</a>
          <p class="header__mobile-hours" data-i18n="contact_hours">Tue-Sat 10:00-14:00 / 15:00-19:00 (Sun-Mon closed)</p>
          <a href="/locations.html" class="header__mobile-address" data-i18n="location_one_address">Rua do Embaixador 164, 1300-218 Lisboa</a>
          <a href="/locations.html" class="header__mobile-address" data-i18n="location_two_address">Rua dos Prazeres 66A, 1200-356 Lisboa</a>
        </div>
      </div>
    </div>
  </nav>
</header>
`;

const footerHTML = `
<footer class="footer">
  <div class="container footer__inner">
    <p data-i18n="footer_copy">&copy; 2026 Lucky Throats. Todos os direitos reservados.</p>
    <a href="/policy.html">Privacy policy</a>
  </div>
</footer>
`;

document.querySelectorAll('[data-site-header]').forEach((node) => {
  node.outerHTML = headerHTML;
});

document.querySelectorAll('[data-site-footer]').forEach((node) => {
  node.outerHTML = footerHTML;
});
