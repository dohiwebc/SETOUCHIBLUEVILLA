/**
 * SETOUCHI BLUE VILLA — Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initScrollAnimations();
  initFaqAccordion();
  initBookingForm();
  initGalleryLightbox();
  setActiveNav();
});

/* Hamburger menu */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header-nav');
  if (!hamburger || !nav) return;

  let scrollPosition = 0;

  const setMenuOpen = (open) => {
    hamburger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');

    if (open) {
      scrollPosition = window.scrollY;
      document.body.classList.add('is-nav-open');
      document.body.style.top = `-${scrollPosition}px`;
    } else {
      document.body.classList.remove('is-nav-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollPosition);
    }
  };

  hamburger.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('is-open'));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenuOpen(false);
    }
  });
}

/* Scroll fade-in animations */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.04, rootMargin: '80px 0px -20px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* FAQ accordion */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach(other => {
        other.classList.remove('is-open');
        const otherQuestion = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* Gallery lightbox */
function initGalleryLightbox() {
  const galleryImages = Array.from(document.querySelectorAll('.gallery__item img'));
  if (!galleryImages.length) return;

  const items = galleryImages.map(img => ({
    src: img.currentSrc || img.src,
    alt: img.alt || 'SETOUCHI BLUE VILLA'
  }));

  let activeIndex = 0;
  let lastFocused = null;

  const lightbox = document.createElement('div');
  lightbox.className = 'photo-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '写真ギャラリー');
  lightbox.innerHTML = `
    <button type="button" class="photo-lightbox__close" aria-label="ギャラリーを閉じる">×</button>
    <button type="button" class="photo-lightbox__nav photo-lightbox__nav--prev" aria-label="前の写真へ">&#8249;</button>
    <figure class="photo-lightbox__figure">
      <img class="photo-lightbox__image" src="" alt="">
      <figcaption class="photo-lightbox__caption"></figcaption>
    </figure>
    <button type="button" class="photo-lightbox__nav photo-lightbox__nav--next" aria-label="次の写真へ">&#8250;</button>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.photo-lightbox__image');
  const lightboxCaption = lightbox.querySelector('.photo-lightbox__caption');
  const closeButton = lightbox.querySelector('.photo-lightbox__close');
  const prevButton = lightbox.querySelector('.photo-lightbox__nav--prev');
  const nextButton = lightbox.querySelector('.photo-lightbox__nav--next');

  const updateLightbox = () => {
    const item = items[activeIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = `${activeIndex + 1} / ${items.length}  ${item.alt}`;
  };

  const openLightbox = (index) => {
    activeIndex = index;
    lastFocused = document.activeElement;
    updateLightbox();
    lightbox.classList.add('is-open');
    document.body.classList.add('is-lightbox-open');
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('is-lightbox-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  const moveLightbox = (amount) => {
    activeIndex = (activeIndex + amount + items.length) % items.length;
    updateLightbox();
  };

  galleryImages.forEach((img, index) => {
    const trigger = img.closest('.gallery__item') || img;
    trigger.classList.add('is-gallery-enabled');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-label', `${img.alt || '写真'}を拡大表示`);

    trigger.addEventListener('click', () => openLightbox(index));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => moveLightbox(-1));
  nextButton.addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}

/* Booking form & price calculator */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const basePrice = 150000;
  const bbqPrice = 5000;

  const checkinInput = form.querySelector('#checkin');
  const checkoutInput = form.querySelector('#checkout');
  const bbqCheckbox = form.querySelector('#bbq-request');
  const bbqFields = form.querySelector('#bbq-fields');
  const bbqSchedule = document.getElementById('bbq-schedule');
  const bbqScheduleEmpty = document.getElementById('bbq-schedule-empty');
  const guestsInput = form.querySelector('#guests');
  const optionCheckboxes = form.querySelectorAll('.stay-option');
  const requestFields = form.querySelectorAll('.stay-request-field');

  initBookingConditionals(form);

  const elBase = document.getElementById('price-base');
  const elBbq = document.getElementById('price-bbq');
  const elBbqRow = document.getElementById('price-bbq-row');
  const elBbqDetail = document.getElementById('price-bbq-detail');
  const elOptions = document.getElementById('price-options');
  const elOptionsRow = document.getElementById('price-options-row');
  const elOptionsDetail = document.getElementById('price-options-detail');
  const elTotal = document.getElementById('price-total');
  const elNights = document.getElementById('price-nights');
  const formMessage = document.getElementById('form-message');

  const today = new Date().toISOString().split('T')[0];
  if (checkinInput) checkinInput.min = today;
  if (checkoutInput) checkoutInput.min = today;

  function calcNights() {
    if (!checkinInput.value || !checkoutInput.value) return 1;
    const start = parseLocalDate(checkinInput.value);
    const end = parseLocalDate(checkoutInput.value);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }

  function parseLocalDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateJP(date) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
  }

  function getDefaultGuestCount() {
    return parseInt(guestsInput?.value, 10) || 2;
  }

  function buildBbqSchedule() {
    if (!bbqSchedule) return;

    const nights = calcNights();
    const hasDates = checkinInput.value && checkoutInput.value && nights > 0;

    if (!hasDates) {
      bbqSchedule.innerHTML = '';
      if (bbqScheduleEmpty) bbqScheduleEmpty.style.display = 'block';
      return;
    }

    if (bbqScheduleEmpty) bbqScheduleEmpty.style.display = 'none';

    const previous = {};
    bbqSchedule.querySelectorAll('.bbq-night-row').forEach((row, i) => {
      const check = row.querySelector('.bbq-night-check');
      const count = row.querySelector('.bbq-night-count');
      previous[i] = {
        checked: check?.checked ?? true,
        count: count?.value ?? String(getDefaultGuestCount())
      };
    });

    bbqSchedule.innerHTML = '';
    const start = parseLocalDate(checkinInput.value);
    const defaultCount = getDefaultGuestCount();

    for (let i = 0; i < nights; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const saved = previous[i];
      const isChecked = saved ? saved.checked : true;
      const countVal = saved ? saved.count : String(defaultCount);

      const row = document.createElement('div');
      row.className = 'bbq-night-row';
      row.innerHTML = `
        <label class="bbq-night-row__check">
          <input type="checkbox" class="bbq-night-check" data-night="${i}" ${isChecked ? 'checked' : ''}>
          <span class="bbq-night-row__date">${i + 1}泊目 <span class="bbq-night-row__date-sub">${formatDateJP(date)}</span></span>
        </label>
        <div class="bbq-night-row__count">
          <label>人数</label>
          <select class="bbq-night-count">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(n =>
              `<option value="${n}"${String(n) === countVal ? ' selected' : ''}>${n}名</option>`
            ).join('')}
          </select>
        </div>
      `;
      bbqSchedule.appendChild(row);

      row.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', updatePrice);
      });
    }
  }

  function calcBbqTotal() {
    let total = 0;
    let meals = 0;
    let persons = 0;

    document.querySelectorAll('.bbq-night-row').forEach(row => {
      const check = row.querySelector('.bbq-night-check');
      if (check?.checked) {
        const count = parseInt(row.querySelector('.bbq-night-count')?.value, 10) || 0;
        total += count * bbqPrice;
        meals += 1;
        persons += count;
      }
    });

    return { total, meals, persons };
  }

  function collectRequestLabels() {
    const labels = [];
    const anniversaryEl = form.querySelector('#anniversary');

    optionCheckboxes.forEach(option => {
      if (!option.checked) return;

      if (option.value === 'anniversary-extra' && !anniversaryEl?.checked) return;

      labels.push(option.dataset.label || option.value);
    });

    const arrival = form.querySelector('#arrival-time');
    if (arrival?.value) {
      labels.push(arrival.options[arrival.selectedIndex].dataset.label || `到着${arrival.value}`);
    }

    const breakfastTime = form.querySelector('#breakfast-time');
    if (breakfastTime?.value && breakfastTime.value !== '08:00') {
      labels.push(breakfastTime.options[breakfastTime.selectedIndex].dataset.label || `朝食${breakfastTime.value}`);
    }

    const breakfastPlace = form.querySelector('#breakfast-place');
    if (breakfastPlace?.value && breakfastPlace.value !== 'omakase') {
      labels.push(breakfastPlace.options[breakfastPlace.selectedIndex].dataset.label || breakfastPlace.value);
    }

    const contact = form.querySelector('#contact-method');
    if (contact?.value && contact.value !== 'email') {
      labels.push(contact.options[contact.selectedIndex].dataset.label || contact.value);
    }

    const ciSauna = form.querySelector('#sauna-after-checkin');
    if (ciSauna?.checked) {
      const time = form.querySelector('#sauna-after-time');
      const timeLabel = time?.options[time.selectedIndex]?.dataset.label;
      labels.push(timeLabel || 'CI後サウナ');
    }

    const morningSauna = form.querySelector('#sauna-morning');
    if (morningSauna?.checked) {
      const time = form.querySelector('#sauna-morning-time');
      const timeLabel = time?.options[time.selectedIndex]?.dataset.label;
      labels.push(timeLabel || '朝サウナ');
    }

    if (anniversaryEl?.checked) {
      const type = form.querySelector('#anniversary-type');
      if (type?.value) {
        labels.push(type.options[type.selectedIndex].dataset.label || type.value);
      }

      const message = form.querySelector('#anniversary-message');
      if (message?.value.trim()) {
        labels.push(`メッセージ：${message.value.trim()}`);
      }
    }

    const childrenEl = form.querySelector('#with-children');
    if (childrenEl?.checked) {
      const info = form.querySelector('#children-info');
      if (info?.value.trim()) {
        labels.push(`お子様：${info.value.trim()}`);
      }
    }

    const cycle = form.querySelector('#rental-cycle');
    if (cycle?.checked) {
      const count = form.querySelector('#cycle-count');
      if (count?.value) {
        labels.push(count.options[count.selectedIndex].dataset.label || `サイクル${count.value}台`);
      }
    }

    return labels;
  }

  function calcOptionsTotal() {
    let total = 0;
    const labels = collectRequestLabels();
    const guests = getDefaultGuestCount();

    optionCheckboxes.forEach(option => {
      if (!option.checked) return;

      const price = parseInt(option.dataset.price, 10) || 0;
      const priceType = option.dataset.priceType || 'fixed';
      if (price <= 0) return;

      total += priceType === 'perGuest' ? price * guests : price;
    });

    return { total, labels };
  }

  function updatePrice() {
    const nights = calcNights();
    const base = basePrice * nights;
    let bbqTotal = 0;
    let bbqMeals = 0;
    let bbqPersons = 0;
    const options = calcOptionsTotal();

    if (bbqCheckbox?.checked) {
      if (bbqFields) bbqFields.classList.add('is-visible');
      buildBbqSchedule();
      const bbq = calcBbqTotal();
      bbqTotal = bbq.total;
      bbqMeals = bbq.meals;
      bbqPersons = bbq.persons;
      if (elBbqRow) elBbqRow.style.display = bbqMeals > 0 ? 'flex' : 'none';
    } else {
      if (bbqFields) bbqFields.classList.remove('is-visible');
      if (elBbqRow) elBbqRow.style.display = 'none';
    }

    if (elOptionsRow) {
      elOptionsRow.style.display = options.labels.length > 0 ? 'flex' : 'none';
    }

    const total = base + bbqTotal + options.total;

    if (elBase) elBase.textContent = '¥' + base.toLocaleString();
    if (elBbq) elBbq.textContent = '¥' + bbqTotal.toLocaleString();
    if (elBbqDetail) {
      elBbqDetail.textContent = bbqMeals > 0
        ? `（${bbqMeals}食・計${bbqPersons}名分）`
        : '';
    }
    if (elOptions) {
      elOptions.textContent = options.total > 0
        ? '¥' + options.total.toLocaleString()
        : 'すべて無料';
      elOptions.classList.toggle('price-row__value--included', options.total <= 0);
    }
    if (elOptionsDetail) {
      elOptionsDetail.textContent = options.labels.length > 0
        ? `（${options.labels.join('・')}）`
        : '';
    }
    if (elTotal) elTotal.textContent = '¥' + total.toLocaleString();
    if (elNights) elNights.textContent = nights + '泊';
  }

  [checkinInput, checkoutInput, bbqCheckbox, guestsInput, ...optionCheckboxes, ...requestFields].forEach(el => {
    if (el) el.addEventListener('change', updatePrice);
    if (el) el.addEventListener('input', updatePrice);
  });

  if (checkinInput) {
    checkinInput.addEventListener('change', () => {
      if (checkoutInput) {
        const next = parseLocalDate(checkinInput.value);
        next.setDate(next.getDate() + 1);
        checkoutInput.min = formatISODate(next);
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = formatISODate(next);
        }
      }
      updatePrice();
    });
  }

  if (checkoutInput) {
    checkoutInput.addEventListener('change', updatePrice);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (formMessage) {
      formMessage.classList.add('is-visible');
      formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();
    resetBookingConditionals(form);
    if (bbqFields) bbqFields.classList.remove('is-visible');
    if (bbqSchedule) bbqSchedule.innerHTML = '';
    if (bbqScheduleEmpty) bbqScheduleEmpty.style.display = 'block';
    if (formMessage) {
      setTimeout(() => formMessage.classList.remove('is-visible'), 6000);
    }
    updatePrice();
  });

  updatePrice();
}

function initBookingConditionals(form) {
  const toggles = form.querySelectorAll('.request-toggle');

  const syncPanel = (toggle) => {
    const targetId = toggle.dataset.target;
    if (!targetId) return;
    const panel = form.querySelector(`#${targetId}`);
    if (!panel) return;
    panel.classList.toggle('is-visible', toggle.checked);
  };

  toggles.forEach(toggle => {
    syncPanel(toggle);
    toggle.addEventListener('change', () => syncPanel(toggle));
  });
}

function resetBookingConditionals(form) {
  form.querySelectorAll('.option-subfields').forEach(panel => {
    panel.classList.remove('is-visible');
  });
}

function formatISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* Active navigation highlight */
function setActiveNav() {
  let current = window.location.pathname.split('/').pop();
  if (!current || current === '') current = 'index.html';
  document.querySelectorAll('.nav-list a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('is-active');
  });
}
