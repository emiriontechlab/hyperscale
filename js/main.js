/* ==========================================================================
   Hyperscale.ae — Main JavaScript
   Handles: Sticky header, mobile menu, dropdown, scroll animations,
            counters, accordion, testimonial carousel
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------- DOM Cache -------------------- */
  const header      = document.getElementById('siteHeader');
  const menuToggle  = document.getElementById('menuToggle');
  const mainNav     = document.getElementById('mainNav');
  const faqAccordion = document.getElementById('faqAccordion');

  /* -------------------- Sticky Header -------------------- */
  let lastScroll = 0;

  function handleScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();


  /* -------------------- Mobile Menu Toggle -------------------- */
  if (menuToggle && mainNav) {
    const navMenu = mainNav.querySelector('.nav-menu');

    menuToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('nav-open');
      if (navMenu) navMenu.classList.toggle('open', isOpen);
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav on link click
    mainNav.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link, .dropdown-item').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('nav-open');
        if (navMenu) navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* -------------------- Dropdown Menu -------------------- */
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const parent = this.closest('.has-dropdown');
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      // Close other dropdowns
      dropdownToggles.forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
        t.closest('.has-dropdown').classList.remove('dropdown-open');
      });

      if (!isExpanded) {
        this.setAttribute('aria-expanded', 'true');
        parent.classList.add('dropdown-open');
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      dropdownToggles.forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
        t.closest('.has-dropdown').classList.remove('dropdown-open');
      });
    }
  });


  /* -------------------- Scroll Animations (Intersection Observer) -------------------- */
  const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

  if ('IntersectionObserver' in window && animatedElements.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* -------------------- Animated Counters -------------------- */
  const counterElements = document.querySelectorAll('.counter-number[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window && counterElements.length > 0) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }


  /* -------------------- FAQ Accordion -------------------- */
  if (faqAccordion) {
    const items = faqAccordion.querySelectorAll('.accordion-item');

    function closeAllFaqItems() {
      items.forEach(function (i) {
        i.classList.remove('active');
        const btn = i.querySelector('.accordion-header');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        const body = i.querySelector('.accordion-body');
        if (body) {
          body.style.maxHeight = null;
        }
      });
    }

    function openFaqItem(item, button, body) {
      item.classList.add('active');
      if (button) button.setAttribute('aria-expanded', 'true');
      if (body) {
        body.style.maxHeight = (body.scrollHeight + 40) + 'px';
      }
    }

    items.forEach(function (item) {
      const button = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');

      if (button) {
        button.addEventListener('click', function () {
          const isOpen = item.classList.contains('active');

          // Close all items
          closeAllFaqItems();

          // If this item was not already open, open it
          if (!isOpen) {
            openFaqItem(item, button, body);
          }
        });
      }
    });

    // Initialize the active item on page load if one is pre-marked as active
    const activeItem = faqAccordion.querySelector('.accordion-item.active');
    if (activeItem) {
      const activeBtn = activeItem.querySelector('.accordion-header');
      const activeBody = activeItem.querySelector('.accordion-body');
      openFaqItem(activeItem, activeBtn, activeBody);
    }
  }


  /* -------------------- Testimonial Carousel -------------------- */
  const track    = document.getElementById('testimonialTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const cards = track.querySelectorAll('.testimonial-card');
    const dots  = dotsWrap.querySelectorAll('.dot');
    let currentIndex = 0;
    let autoPlayInterval;

    function goToSlide(index) {
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
      currentIndex = index;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    prevBtn.addEventListener('click', function () {
      stopAutoPlay();
      goToSlide(currentIndex - 1);
      startAutoPlay();
    });

    nextBtn.addEventListener('click', function () {
      stopAutoPlay();
      goToSlide(currentIndex + 1);
      startAutoPlay();
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopAutoPlay();
        goToSlide(parseInt(this.getAttribute('data-index'), 10));
        startAutoPlay();
      });
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
      startAutoPlay();
    }, { passive: true });

    startAutoPlay();
  }


  /* -------------------- Smooth Scroll for Anchor Links -------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav if open
        if (mainNav && mainNav.classList.contains('nav-open')) {
          mainNav.classList.remove('nav-open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
    });
  });


  /* -------------------- Contact Form Basic Validation -------------------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fullName  = document.getElementById('fullName');
      const workEmail = document.getElementById('workEmail');
      let isValid = true;

      // Reset errors
      this.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function (el) {
        el.classList.remove('error');
      });

      if (!fullName.value.trim()) {
        fullName.classList.add('error');
        isValid = false;
      }

      if (!workEmail.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.value)) {
        workEmail.classList.add('error');
        isValid = false;
      }

      if (isValid) {
        // Replace with actual form submission logic
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        // Simulate submission (replace with fetch/AJAX)
        setTimeout(function () {
          btn.textContent = '✓ Message Sent!';
          btn.style.background = '#10B981';
          contactForm.reset();

          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        }, 1500);
      }
    });
  }

})();
