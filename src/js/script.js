import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import translationsData from '../data/translations.json';
import siteContentData from '../data/site-content.json';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const siteLoader = document.getElementById('siteLoader');
  const header = document.querySelector('.header');
  const burgerToggle = document.getElementById('burgerToggle');
  const mobileNav = document.getElementById('mobileNav');
  const bookingFrame = document.getElementById('bookingFrame');
  const bookingClose = document.getElementById('bookingClose');
  const bookingIframe = document.getElementById('bookingIframe');
  const bookingFallback = document.getElementById('bookingFallback');
  const mapFrame = document.getElementById('mapFrame');
  const mapClose = document.getElementById('mapClose');
  const mapIframe = document.getElementById('mapIframe');
  const mapTitle = document.getElementById('mapTitle');
  const mapTriggers = document.querySelectorAll('[data-map-open="true"]');
  const mapCards = document.querySelectorAll('.purchase__location');
  const langButtons = document.querySelectorAll('.lang-switch__btn');
  const mapLinks = document.querySelectorAll('.purchase__map-link');
  const galleryItems = document.querySelectorAll('.js-gallery-item');
  const teamSlider = document.querySelector('[data-team-slider]');
  const teamPrev = document.querySelector('[data-team-prev]');
  const teamNext = document.querySelector('[data-team-next]');
  const galleryLightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const cinemaVideo = document.querySelector('.cinema__video');
  const bookingContent = bookingFrame?.querySelector('.booking-frame__content') || null;
  const mapContent = mapFrame?.querySelector('.map-frame__content') || null;
  const lightboxContent = galleryLightbox?.querySelector('.gallery-lightbox__content') || null;

  const BOOKING_URL = 'https://buk.pt/luckythroats';
  const LOADER_SESSION_KEY = 'site_loader_seen_v2';
  const LOADER_MIN_DURATION_MS = 1050;
  const DEFAULT_MAP_TITLE = 'Lucky Throats location';
  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), iframe, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let frozenScrollY = 0;
  let isScrollFrozen = false;
  let activeModalKey = null;
  let lastFocusedElement = null;

  let currentImageIndex = 0;
  const scrollLocks = new Set();

  const flattenTranslationBlocks = (blocks) => {
    const flat = {};
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      Object.entries(node).forEach(([key, value]) => {
        if (typeof value === 'string') {
          flat[key] = value;
          return;
        }
        if (value && typeof value === 'object') walk(value);
      });
    };
    walk(blocks);
    return flat;
  };

  const translations = {
    pt: flattenTranslationBlocks(translationsData.pt),
    en: flattenTranslationBlocks(translationsData.en)
  };
  const siteContent = siteContentData;



  const pushEvent = (eventName) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName });
  };

  const initDialogA11y = () => {
    if (bookingContent) {
      bookingContent.setAttribute('tabindex', '-1');
      const bookingTitle = bookingFrame?.querySelector('.booking-frame__title');
      if (bookingTitle) {
        if (!bookingTitle.id) bookingTitle.id = 'bookingTitle';
        bookingContent.setAttribute('aria-labelledby', bookingTitle.id);
        bookingContent.removeAttribute('aria-label');
      }
    }

    if (mapContent) {
      mapContent.setAttribute('tabindex', '-1');
      if (mapTitle) {
        if (!mapTitle.id) mapTitle.id = 'mapTitle';
        mapContent.setAttribute('aria-labelledby', mapTitle.id);
        mapContent.removeAttribute('aria-label');
      }
    }

    if (lightboxContent) {
      lightboxContent.setAttribute('tabindex', '-1');
    }
  };

  const getActiveModal = () => {
    if (activeModalKey === 'booking' && bookingFrame?.classList.contains('active') && bookingContent) {
      return { frame: bookingFrame, content: bookingContent };
    }

    if (activeModalKey === 'map' && mapFrame?.classList.contains('active') && mapContent) {
      return { frame: mapFrame, content: mapContent };
    }

    if (activeModalKey === 'lightbox' && galleryLightbox?.classList.contains('active') && lightboxContent) {
      return { frame: galleryLightbox, content: lightboxContent };
    }

    return null;
  };

  const activateModalFocus = (key, focusTarget) => {
    const current = document.activeElement;
    lastFocusedElement = current instanceof HTMLElement ? current : null;
    activeModalKey = key;

    window.requestAnimationFrame(() => {
      if (focusTarget instanceof HTMLElement) focusTarget.focus();
    });
  };

  const releaseModalFocus = (key) => {
    if (activeModalKey !== key) return;
    activeModalKey = null;

    const restoreTarget = lastFocusedElement;
    lastFocusedElement = null;
    if (restoreTarget && document.contains(restoreTarget)) {
      window.requestAnimationFrame(() => {
        restoreTarget.focus();
      });
    }
  };

  const trapFocusInActiveModal = (event) => {
    if (event.key !== 'Tab') return;

    const modal = getActiveModal();
    if (!modal) return;

    const focusable = Array.from(modal.content.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (node) => node instanceof HTMLElement && !node.hasAttribute('disabled')
    );

    if (focusable.length === 0) {
      event.preventDefault();
      modal.content.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const initMotion = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
      .from('.promo__eyebrow', { y: 18, autoAlpha: 0, duration: 0.55 })
      .from('.promo__title', { y: 26, autoAlpha: 0, duration: 0.75 }, '-=0.22')
      .from('.promo__subtitle', { y: 16, autoAlpha: 0, duration: 0.55 }, '-=0.38')
      .from('.promo__cta .btn', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.45 }, '-=0.28')
      .from('.promo__meta li', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.4 }, '-=0.2');

    gsap.utils.toArray('.reveal').forEach((element) => {
      gsap.fromTo(
        element,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.72,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 84%'
          },
          onStart: () => {
            if (element instanceof HTMLElement) element.classList.add('is-visible');
          }
        }
      );
    });

    gsap.utils.toArray('[data-parallax]').forEach((element) => {
      const node = element instanceof HTMLElement ? element : null;
      if (!node) return;
      if (node.matches('.cinema__media')) {
        gsap.set(node, { clearProps: 'transform' });
        return;
      }
      if (node.closest('.locations-hero')) {
        gsap.set(node, { clearProps: 'transform' });
        return;
      }
      if (node.matches('.team-page__hero-media, .treatments-hero__bg, .locations-hero__bg')) {
        gsap.set(node, { y: 0 });
        return;
      }
      const speed = Number(node.dataset.parallaxSpeed || '0.1');
      const baseDistance = Math.round(window.innerHeight * speed);
      const isMobileViewport = window.innerWidth <= 760;
      const moveDistance = isMobileViewport ? Math.min(Math.round(baseDistance * 0.32), 30) : baseDistance;
      gsap.to(node, {
        y: moveDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  };

  const initCinemaVideo = () => {
    if (!(cinemaVideo instanceof HTMLVideoElement)) return;

    cinemaVideo.muted = true;
    cinemaVideo.defaultMuted = true;
    cinemaVideo.loop = true;
    cinemaVideo.playsInline = true;
    cinemaVideo.setAttribute('muted', '');
    cinemaVideo.setAttribute('playsinline', '');

    const sourceNodes = Array.from(cinemaVideo.querySelectorAll('source'));
    if (sourceNodes.length > 0) {
      const hasPlayableSource = sourceNodes.some((source) => {
        const type = source.getAttribute('type');
        if (!type) return true;
        return cinemaVideo.canPlayType(type) !== '';
      });
      if (!hasPlayableSource) {
        cinemaVideo.classList.add('cinema__video--unsupported');
        return;
      }
    }

    const tryPlay = () => {
      const playPromise = cinemaVideo.play();
      if (!playPromise || typeof playPromise.then !== 'function') return;
      playPromise.catch(() => {
        cinemaVideo.classList.add('cinema__video--paused');
      });
    };

    if (cinemaVideo.readyState >= 2) {
      tryPlay();
    } else {
      cinemaVideo.addEventListener('loadeddata', tryPlay, { once: true });
    }

    cinemaVideo.addEventListener(
      'error',
      () => {
        cinemaVideo.classList.add('cinema__video--unsupported');
      },
      { once: true }
    );

    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState !== 'visible') return;
        if (cinemaVideo.paused) {
          const resumed = cinemaVideo.play();
          if (resumed && typeof resumed.catch === 'function') resumed.catch(() => {});
        }
      },
      { passive: true }
    );
  };

  const getTranslationText = (key, locale = 'pt') => {
    const localeDict = translations[locale] || translations.pt || {};
    return localeDict[key] || '';
  };

  const getActiveLocale = () => (document.documentElement.lang === 'en' ? 'en' : 'pt');

  const getLocalizedValue = (value, locale = 'pt') => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    return value[locale] || value.pt || value.en || '';
  };

  const getTeamLocationsMap = () => {
    const list = Array.isArray(siteContent.team?.locations) ? siteContent.team.locations : [];
    return new Map(list.map((location) => [location.key, location]));
  };

  const renderHomeServices = (locale = 'pt') => {
    const wrapper = document.querySelector('#services .services__wrapper');
    if (!(wrapper instanceof HTMLElement)) return;

    wrapper.innerHTML = '';
    const services = Array.isArray(siteContent.services?.items) ? siteContent.services.items : [];

    services.forEach((service) => {
      const card = document.createElement('article');
      card.className = 'services__card card reveal';

      const category = document.createElement('p');
      category.className = 'services__time';
      category.dataset.pt = getLocalizedValue(service.category, 'pt');
      category.dataset.en = getLocalizedValue(service.category, 'en');
      category.textContent = getLocalizedValue(service.category, locale);

      const title = document.createElement('h3');
      if (service.titleKey) {
        title.setAttribute('data-i18n', service.titleKey);
        title.textContent = getTranslationText(service.titleKey, locale);
      }

      const description = document.createElement('p');
      if (service.descKey) {
        description.setAttribute('data-i18n', service.descKey);
        description.textContent = getTranslationText(service.descKey, locale);
      }

      const footer = document.createElement('div');
      footer.className = 'services__footer';

      const price = document.createElement('strong');
      price.textContent = `${service.price || ''} EUR`;

      const button = document.createElement('button');
      button.className = 'btn btn--outline js-booking-open';
      button.setAttribute('data-i18n', 'book_slot');
      button.textContent = getTranslationText('book_slot', locale) || 'Reservar';

      footer.append(price, button);
      card.append(category, title, description, footer);
      wrapper.appendChild(card);
    });
  };

  const renderServicesPageList = (locale = 'pt') => {
    const services = Array.isArray(siteContent.services?.items) ? siteContent.services.items : [];
    const lists = document.querySelectorAll('[data-services-list]');
    if (lists.length === 0) return;

    lists.forEach((list) => {
      if (!(list instanceof HTMLElement)) return;
      const group = list.dataset.servicesList || '';
      const scoped = services.filter((service) => service.group === group);
      list.innerHTML = '';

      scoped.forEach((service) => {
        const item = document.createElement('li');

        const content = document.createElement('div');
        const title = document.createElement('h3');
        const description = document.createElement('p');

        if (service.titleKey) {
          title.setAttribute('data-i18n', service.titleKey);
          title.textContent = getTranslationText(service.titleKey, locale);
        }

        if (service.descKey) {
          description.setAttribute('data-i18n', service.descKey);
          description.textContent = getTranslationText(service.descKey, locale);
        }

        const price = document.createElement('strong');
        price.textContent = `€${service.price || ''}`;

        content.append(title, description);
        item.append(content, price);
        list.appendChild(item);
      });
    });
  };

  const renderTeamLocations = (locale = 'pt') => {
    const sections = document.querySelectorAll('[data-barber-section][data-location-key]');
    if (sections.length === 0) return;
    const locationsMap = getTeamLocationsMap();

    sections.forEach((section) => {
      if (!(section instanceof HTMLElement)) return;
      const locationKey = section.dataset.locationKey || '';
      const locationData = locationsMap.get(locationKey);
      if (!locationData || !Array.isArray(locationData.barbers) || locationData.barbers.length === 0) return;

      const tabs = section.querySelector('[data-barber-tabs]');
      if (!(tabs instanceof HTMLElement)) return;

      tabs.innerHTML = '';
      const defaultBarberId = locationData.defaultBarberId || locationData.barbers[0].id;

      locationData.barbers.forEach((barber) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        const isActive = barber.id === defaultBarberId;

        button.type = 'button';
        button.className = `barber-location__name${isActive ? ' is-active' : ''}`;
        button.dataset.id = barber.id || '';
        button.dataset.name = barber.name || '';
        button.dataset.rolePt = getLocalizedValue(barber.role, 'pt');
        button.dataset.roleEn = getLocalizedValue(barber.role, 'en');
        button.dataset.descriptionPt = getLocalizedValue(barber.description, 'pt');
        button.dataset.descriptionEn = getLocalizedValue(barber.description, 'en');
        button.dataset.image = barber.image || '';
        button.dataset.position = barber.position || 'center';
        button.dataset.skill1Pt = barber.skills?.pt?.[0] || '';
        button.dataset.skill2Pt = barber.skills?.pt?.[1] || '';
        button.dataset.skill3Pt = barber.skills?.pt?.[2] || '';
        button.dataset.skill1En = barber.skills?.en?.[0] || '';
        button.dataset.skill2En = barber.skills?.en?.[1] || '';
        button.dataset.skill3En = barber.skills?.en?.[2] || '';
        button.textContent = barber.name || '';

        li.appendChild(button);
        tabs.appendChild(li);
      });
    });
  };

  const renderDynamicContent = (locale = 'pt') => {
    renderHomeServices(locale);
    renderServicesPageList(locale);
    renderTeamLocations(locale);
  };

  const applyServiceCategoryLocale = (locale = 'pt') => {
    document.querySelectorAll('.services__time').forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const localized = locale === 'en' ? node.dataset.en : node.dataset.pt;
      if (localized) node.textContent = localized;
    });
  };

  const initTeamSlider = () => {
    if (!teamSlider) return;

    const getSlideWidth = () => {
      const firstSlide = teamSlider.querySelector('.team__profile');
      if (!(firstSlide instanceof HTMLElement)) return teamSlider.clientWidth;
      const styles = window.getComputedStyle(teamSlider);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return firstSlide.offsetWidth + gap;
    };

    const updateButtons = () => {
      if (!teamPrev || !teamNext) return;
      const maxScrollLeft = teamSlider.scrollWidth - teamSlider.clientWidth;
      teamPrev.disabled = teamSlider.scrollLeft <= 2;
      teamNext.disabled = teamSlider.scrollLeft >= maxScrollLeft - 2;
    };

    teamPrev?.addEventListener('click', () => {
      teamSlider.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
    });

    teamNext?.addEventListener('click', () => {
      teamSlider.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
    });

    teamSlider.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  };

  const initBarberSwitcher = () => {
    const sections = document.querySelectorAll('[data-barber-section]');
    if (sections.length === 0) return;

    sections.forEach((section) => {
      const photo = section.querySelector('[data-barber-photo]');
      const nameNode = section.querySelector('[data-barber-name]');
      const roleNode = section.querySelector('[data-barber-role]');
      const descriptionNode = section.querySelector('[data-barber-description]');
      const skillsNode = section.querySelector('[data-barber-skills]');
      const buttons = section.querySelectorAll('.barber-location__name');

      if (!(photo instanceof HTMLImageElement) || !nameNode || !roleNode || !skillsNode || buttons.length === 0) return;

      const applyBarber = (button, locale = getActiveLocale()) => {
        const data = button.dataset;
        nameNode.textContent = data.name || '';
        roleNode.textContent = locale === 'en' ? data.roleEn || data.rolePt || '' : data.rolePt || data.roleEn || '';
        if (descriptionNode) {
          descriptionNode.textContent =
            locale === 'en'
              ? data.descriptionEn || data.descriptionPt || ''
              : data.descriptionPt || data.descriptionEn || '';
        }
        photo.src = data.image || photo.src;
        photo.style.objectPosition = data.position || 'center';
        photo.alt = data.name ? `${data.name} portrait` : photo.alt;

        const nextSkills =
          locale === 'en'
            ? [data.skill1En, data.skill2En, data.skill3En]
            : [data.skill1Pt, data.skill2Pt, data.skill3Pt];
        const filteredSkills = nextSkills.filter(Boolean);
        if (filteredSkills.length > 0) {
          skillsNode.innerHTML = filteredSkills.map((skill) => `<li>${skill}</li>`).join('');
        } else {
          skillsNode.innerHTML = '';
        }

        buttons.forEach((item) => {
          item.classList.toggle('is-active', item === button);
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
          const parent = item.closest('li');
          if (parent) parent.hidden = item === button;
        });
      };

      buttons.forEach((button) => {
        button.addEventListener('click', () => applyBarber(button, getActiveLocale()));
      });

      const initialActive = Array.from(buttons).find((button) => button.classList.contains('is-active')) || buttons[0];
      if (initialActive) applyBarber(initialActive, getActiveLocale());
    });
  };

  const applyTeamLocale = (locale = 'pt') => {
    document.querySelectorAll('[data-barber-section]').forEach((section) => {
      if (!(section instanceof HTMLElement)) return;
      const activeButton = section.querySelector('.barber-location__name.is-active');
      if (!(activeButton instanceof HTMLButtonElement)) return;

      const nameNode = section.querySelector('[data-barber-name]');
      const roleNode = section.querySelector('[data-barber-role]');
      const descriptionNode = section.querySelector('[data-barber-description]');
      const skillsNode = section.querySelector('[data-barber-skills]');

      if (!nameNode || !roleNode || !skillsNode) return;

      const data = activeButton.dataset;
      nameNode.textContent = data.name || '';
      roleNode.textContent = locale === 'en' ? data.roleEn || data.rolePt || '' : data.rolePt || data.roleEn || '';
      if (descriptionNode) {
        descriptionNode.textContent =
          locale === 'en'
            ? data.descriptionEn || data.descriptionPt || ''
            : data.descriptionPt || data.descriptionEn || '';
      }

      const skills = locale === 'en' ? [data.skill1En, data.skill2En, data.skill3En] : [data.skill1Pt, data.skill2Pt, data.skill3Pt];
      const filteredSkills = skills.filter(Boolean);
      skillsNode.innerHTML = filteredSkills.map((skill) => `<li>${skill}</li>`).join('');
    });
  };

  const updateBodyLock = () => {
    const locked = scrollLocks.size > 0;
    document.documentElement.classList.toggle('booking-open', locked);
    document.body.classList.toggle('booking-open', locked);
  };

  const freezeScroll = () => {
    if (isScrollFrozen) return;
    frozenScrollY = window.scrollY || window.pageYOffset || 0;
    isScrollFrozen = true;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${frozenScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const unfreezeScroll = () => {
    if (!isScrollFrozen) return;
    const lockedTop = Number.parseInt(document.body.style.top || '0', 10);
    const restoreY = Number.isNaN(lockedTop) ? frozenScrollY : Math.abs(lockedTop);
    isScrollFrozen = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.requestAnimationFrame(() => {
      window.scrollTo(0, restoreY);
    });
  };

  const lockScroll = (key) => {
    const wasUnlocked = scrollLocks.size === 0;
    scrollLocks.add(key);
    if (wasUnlocked) freezeScroll();
    updateBodyLock();
  };

  const unlockScroll = (key) => {
    scrollLocks.delete(key);
    if (scrollLocks.size === 0) unfreezeScroll();
    updateBodyLock();
  };

  const releaseAllLocks = () => {
    scrollLocks.clear();
    unfreezeScroll();
    updateBodyLock();
  };

  const hideSessionLoader = () => {
    if (!siteLoader) return;
    siteLoader.classList.add('is-hidden');
    window.setTimeout(() => {
      siteLoader.remove();
      unlockScroll('loader');
      sessionStorage.setItem(LOADER_SESSION_KEY, '1');
    }, 420);
  };

  const initSessionLoader = () => {
    if (!siteLoader) return;
    const seen = sessionStorage.getItem(LOADER_SESSION_KEY) === '1';
    if (seen) {
      siteLoader.remove();
      unlockScroll('loader');
      return;
    }

    lockScroll('loader');
    const startTime = Date.now();
    let finalized = false;

    const run = () => {
      if (finalized) return;
      finalized = true;
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, LOADER_MIN_DURATION_MS - elapsed);
      window.setTimeout(hideSessionLoader, delay);
    };

    if (document.readyState === 'complete') {
      run();
      return;
    }

    window.addEventListener('load', run, { once: true });
    window.setTimeout(run, 2600);
  };

  const openBooking = () => {
    if (!bookingFrame) return;
    bookingFrame.classList.add('active');
    bookingFrame.classList.remove('booking-frame--loaded', 'booking-frame--fallback');
    bookingFrame.classList.add('booking-frame--loading');
    bookingFrame.setAttribute('aria-hidden', 'false');
    lockScroll('booking');
    activateModalFocus('booking', bookingClose || bookingContent);

    if (bookingIframe) bookingIframe.src = BOOKING_URL;
    if (bookingFallback) bookingFallback.href = BOOKING_URL;

    window.setTimeout(() => {
      if (bookingFrame.classList.contains('active') && !bookingFrame.classList.contains('booking-frame--loaded')) {
        bookingFrame.classList.add('booking-frame--fallback');
      }
    }, 6500);

    pushEvent('open_booking');
  };

  const closeBooking = () => {
    if (!bookingFrame) return;
    bookingFrame.classList.remove('active');
    bookingFrame.classList.remove('booking-frame--loading');
    bookingFrame.setAttribute('aria-hidden', 'true');
    unlockScroll('booking');
    releaseModalFocus('booking');
  };

  const toEmbedMapUrl = (rawUrl) => {
    if (!rawUrl) return '';
    return rawUrl.includes('output=embed') ? rawUrl : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}output=embed`;
  };

  const openMap = (embedUrl, title) => {
    if (!mapFrame || !mapIframe) return;
    mapFrame.classList.add('active');
    mapFrame.setAttribute('aria-hidden', 'false');
    mapIframe.src = toEmbedMapUrl(embedUrl);
    if (mapTitle) mapTitle.textContent = title || DEFAULT_MAP_TITLE;
    lockScroll('map');
    activateModalFocus('map', mapClose || mapContent);
  };

  const closeMap = () => {
    if (!mapFrame) return;
    mapFrame.classList.remove('active');
    mapFrame.setAttribute('aria-hidden', 'true');
    if (mapIframe) mapIframe.src = '';
    unlockScroll('map');
    releaseModalFocus('map');
  };

  const bindBookingTriggers = () => {
    document.querySelectorAll('.js-booking-open').forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      if (button.dataset.bookingBound === 'true') return;
      button.dataset.bookingBound = 'true';
      button.addEventListener('click', openBooking);
    });
  };

  const applyLanguage = (lang) => {
    const locale = translations[lang] ? lang : 'pt';
    document.documentElement.lang = locale;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const text = translations[locale][key];
      if (text) node.textContent = text;
    });

    langButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.lang === locale);
    });

    applyServiceCategoryLocale(locale);
    applyTeamLocale(locale);

    localStorage.setItem('site_lang', locale);
  };

  const initHomeNavActiveState = () => {
    if (document.body.dataset.page !== 'home') return;
    const navLinks = Array.from(document.querySelectorAll('.header__link'));
    const sectionIds = ['about'];
    const sectionNodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node) => node);

    const setActiveById = (id) => {
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `/index.html#${id}`;
        link.classList.toggle('header__link--active', active);
      });
    };

    if (window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (sectionIds.includes(hashId)) setActiveById(hashId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        setActiveById(visible.target.id);
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: '-22% 0px -55% 0px' }
    );

    sectionNodes.forEach((section) => observer.observe(section));
  };

  const openLightboxAt = (index) => {
    if (!galleryLightbox || !lightboxImage || !lightboxCaption || galleryItems.length === 0) return;
    currentImageIndex = (index + galleryItems.length) % galleryItems.length;
    const activeItem = galleryItems[currentImageIndex];
    const src = activeItem.getAttribute('href');
    const thumb = activeItem.querySelector('img');
    const caption = activeItem.querySelector('span');
    if (!src) return;
    lightboxImage.src = src;
    lightboxImage.alt = thumb ? thumb.alt : 'Gallery image';
    lightboxCaption.textContent = caption ? caption.textContent || '' : '';
    galleryLightbox.classList.add('active');
    galleryLightbox.setAttribute('aria-hidden', 'false');
    lockScroll('lightbox');
    activateModalFocus('lightbox', lightboxClose || lightboxContent);
    pushEvent('open_gallery_lightbox');
  };

  const closeLightbox = () => {
    if (!galleryLightbox) return;
    galleryLightbox.classList.remove('active');
    galleryLightbox.setAttribute('aria-hidden', 'true');
    unlockScroll('lightbox');
    releaseModalFocus('lightbox');
  };

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 24);
    });
  }

  if (burgerToggle && mobileNav) {
    const mobileNavClose = mobileNav.querySelector('[data-mobile-close="true"]');

    const closeMobileNav = () => {
      burgerToggle.classList.remove('open');
      mobileNav.classList.remove('open');
      burgerToggle.setAttribute('aria-expanded', 'false');
      unlockScroll('mobile-nav');
    };

    burgerToggle.addEventListener('click', () => {
      const isOpen = burgerToggle.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      burgerToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) lockScroll('mobile-nav');
      else unlockScroll('mobile-nav');
    });

    mobileNav.addEventListener('click', (event) => {
      if (event.target === mobileNav) closeMobileNav();
    });

    if (mobileNavClose instanceof HTMLElement) {
      mobileNavClose.addEventListener('click', () => {
        closeMobileNav();
      });
    }

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    mobileNav.querySelectorAll('.js-booking-open').forEach((button) => {
      button.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && mobileNav.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  mapTriggers.forEach((card) => {
    card.addEventListener('click', () => {
      const mapUrl = card.getAttribute('data-map-embed') || '';
      const title = card.getAttribute('data-map-title') || DEFAULT_MAP_TITLE;
      openMap(mapUrl, title);
    });
  });

  mapCards.forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    const trigger = card.querySelector('[data-map-open="true"]');
    if (!(trigger instanceof HTMLElement)) return;

    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', trigger.getAttribute('data-map-title') || DEFAULT_MAP_TITLE);

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a, button')) return;
      const mapUrl = trigger.getAttribute('data-map-embed') || '';
      const title = trigger.getAttribute('data-map-title') || DEFAULT_MAP_TITLE;
      openMap(mapUrl, title);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target;
      if (target instanceof Element && target.closest('a, button') && target !== card) return;
      event.preventDefault();
      const mapUrl = trigger.getAttribute('data-map-embed') || '';
      const title = trigger.getAttribute('data-map-title') || DEFAULT_MAP_TITLE;
      openMap(mapUrl, title);
    });
  });

  mapLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMap(link.getAttribute('href') || '', link.textContent?.trim() || DEFAULT_MAP_TITLE);
    });
  });

  if (bookingClose) bookingClose.addEventListener('click', closeBooking);
  if (mapClose) mapClose.addEventListener('click', closeMap);

  if (bookingFrame) {
    bookingFrame.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeBooking === 'true') {
        closeBooking();
      }
    });
  }

  if (mapFrame) {
    mapFrame.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeMap === 'true') closeMap();
    });
  }

  if (bookingIframe) {
    bookingIframe.addEventListener('load', () => {
      if (!bookingFrame) return;
      bookingFrame.classList.add('booking-frame--loaded');
      bookingFrame.classList.remove('booking-frame--loading');
      pushEvent('booking_iframe_loaded');
    });
  }

  if (bookingFallback) {
    bookingFallback.addEventListener('click', () => {
      pushEvent('click_booking_fallback');
    });
  }

  langButtons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang || 'pt'));
  });

  renderDynamicContent();
  bindBookingTriggers();
  applyLanguage(localStorage.getItem('site_lang') || 'en');
  initHomeNavActiveState();
  initDialogA11y();

  initMotion();
  initCinemaVideo();
  initTeamSlider();
  initBarberSwitcher();


  galleryItems.forEach((item, index) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      openLightboxAt(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => openLightboxAt(currentImageIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => openLightboxAt(currentImageIndex + 1));

  if (galleryLightbox) {
    galleryLightbox.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeLightbox === 'true') closeLightbox();
    });
  }

  document.addEventListener('keydown', (event) => {
    trapFocusInActiveModal(event);

    if (event.key === 'Escape') {
      if (galleryLightbox && galleryLightbox.classList.contains('active')) {
        closeLightbox();
        return;
      }

      if (bookingFrame && bookingFrame.classList.contains('active')) {
        closeBooking();
        return;
      }

      if (mapFrame && mapFrame.classList.contains('active')) {
        closeMap();
        return;
      }

      if (mobileNav && burgerToggle && mobileNav.classList.contains('open')) {
        burgerToggle.classList.remove('open');
        mobileNav.classList.remove('open');
        burgerToggle.setAttribute('aria-expanded', 'false');
        unlockScroll('mobile-nav');
      }
      return;
    }

    if (galleryLightbox && galleryLightbox.classList.contains('active')) {
      if (event.key === 'ArrowRight') openLightboxAt(currentImageIndex + 1);
      if (event.key === 'ArrowLeft') openLightboxAt(currentImageIndex - 1);
    }
  });

  window.addEventListener('pagehide', releaseAllLocks);
  window.addEventListener('pageshow', () => {
    if (
      !bookingFrame?.classList.contains('active') &&
      !mapFrame?.classList.contains('active') &&
      !galleryLightbox?.classList.contains('active') &&
      !mobileNav?.classList.contains('open')
    ) {
      releaseAllLocks();
    }
  });

  initSessionLoader();
});





