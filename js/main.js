/**
 * SETOUCHI BLUE VILLA — Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHamburger();
  initScrollAnimations();
  initFaqAccordion();
  initBookingForm();
  setActiveNav();
});

/* Header scroll behavior */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const isHome = document.body.classList.contains('page-home');

  if (isHome) {
    header.classList.add('is-transparent');
  } else {
    header.classList.add('is-scrolled');
  }

  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('is-scrolled');
      header.classList.remove('is-transparent');
    } else if (isHome) {
      header.classList.remove('is-scrolled');
      header.classList.add('is-transparent');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Hamburger menu */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header-nav');
  if (!hamburger || !nav) return;

  let scrollPosition = 0;

  const setMenuOpen = (open) => {
    hamburger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);

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
}

/* Scroll fade-in animations */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* FAQ accordion */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach(other => {
        other.classList.remove('is-open');
        const otherAnswer = other.querySelector('.faq-answer');
        otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
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

  const elBase = document.getElementById('price-base');
  const elBbq = document.getElementById('price-bbq');
  const elBbqRow = document.getElementById('price-bbq-row');
  const elBbqDetail = document.getElementById('price-bbq-detail');
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

  function updatePrice() {
    const nights = calcNights();
    const base = basePrice * nights;
    let bbqTotal = 0;
    let bbqMeals = 0;
    let bbqPersons = 0;

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

    const total = base + bbqTotal;

    if (elBase) elBase.textContent = '¥' + base.toLocaleString();
    if (elBbq) elBbq.textContent = '¥' + bbqTotal.toLocaleString();
    if (elBbqDetail) {
      elBbqDetail.textContent = bbqMeals > 0
        ? `（${bbqMeals}食・計${bbqPersons}名分）`
        : '';
    }
    if (elTotal) elTotal.textContent = '¥' + total.toLocaleString();
    if (elNights) elNights.textContent = nights + '泊';
  }

  [checkinInput, checkoutInput, bbqCheckbox, guestsInput].forEach(el => {
    if (el) el.addEventListener('change', updatePrice);
    if (el) el.addEventListener('input', updatePrice);
  });

  if (checkinInput) {
    checkinInput.addEventListener('change', () => {
      if (checkoutInput) {
        checkoutInput.min = checkinInput.value;
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          const next = parseLocalDate(checkinInput.value);
          next.setDate(next.getDate() + 1);
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
