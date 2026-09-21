const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(
  ".main-nav a[href^='#'], .sidebar-nav a[href^='#']",
);
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navClose = document.querySelector(".nav-close");
const navLinks = document.querySelectorAll(".nav-list a");
const sidebar = document.querySelector(".sidebar");
const sidebarBackdrop = document.querySelector(".sidebar-backdrop");
let lastMenuFocus = menuToggle;
const contactForm = document.querySelector(".contact-form");

function setActiveSection(sectionId) {
  navigationLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${sectionId}`;

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if (!reduceMotion) {
  document.documentElement.classList.add("js-enabled");

  const revealItems = document.querySelectorAll(
    ".section-heading, .about-grid > div, .project-card, .skill-card, .education-card, .contact-info, .contact-form",
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveSection(entry.target.id);
    });
  },
  { rootMargin: "-25% 0px -60%", threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

setActiveSection("home");

function closeMobileMenu() {
  if (!mainNav || !menuToggle) return;
  mainNav.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && mainNav) {
  if (sidebar) sidebar.inert = true;

  function syncNavigationMode() {
    const isMobile = window.innerWidth <= 620;
    mainNav.inert = isMobile;
    mainNav.setAttribute("aria-hidden", String(isMobile));

    if (isMobile) {
      closeMobileMenu();
    } else if (sidebar && sidebar.classList.contains("is-open")) {
      closeSidebar();
    }
  }

  function openSidebar() {
    if (!sidebar || !sidebarBackdrop) return;
    lastMenuFocus = document.activeElement || menuToggle;
    sidebar.inert = false;
    sidebar.setAttribute("aria-hidden", "false");
    sidebar.classList.add("is-open");
    sidebarBackdrop.classList.add("is-active");
    menuToggle.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    const firstLink = sidebar.querySelector("a, button");
    if (firstLink) firstLink.focus();
  }

  function closeSidebar() {
    if (!sidebar || !sidebarBackdrop) return;
    sidebar.inert = true;
    sidebar.setAttribute("aria-hidden", "true");
    sidebar.classList.remove("is-open");
    sidebarBackdrop.classList.remove("is-active");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (lastMenuFocus) lastMenuFocus.focus();
  }

  menuToggle.addEventListener("click", () => {
    if (window.innerWidth <= 620 && sidebar) {
      if (sidebar.classList.contains("is-open")) closeSidebar();
      else openSidebar();
      return;
    }

    if (mainNav.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      mainNav.classList.add("is-open");
      menuToggle.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
    }
  });

  if (navClose) navClose.addEventListener("click", closeMobileMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 620) {
        if (sidebar && sidebar.classList.contains("is-open")) closeSidebar();
        else closeMobileMenu();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 620) return;

    if (
      sidebar &&
      sidebar.classList.contains("is-open") &&
      !sidebar.contains(event.target) &&
      !menuToggle.contains(event.target) &&
      (!sidebarBackdrop || !sidebarBackdrop.contains(event.target))
    ) {
      closeSidebar();
    }

    if (
      mainNav.classList.contains("is-open") &&
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (sidebar && sidebar.classList.contains("is-open")) closeSidebar();
    else if (mainNav.classList.contains("is-open")) closeMobileMenu();
  });

  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);
  const sidebarCloseButton = document.querySelector(".sidebar-close");
  if (sidebarCloseButton) {
    sidebarCloseButton.addEventListener("click", closeSidebar);
  }

  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.dataset.target || link.getAttribute("href");
      const targetElement = document.querySelector(targetSelector);

      if (window.innerWidth <= 620 && targetElement) {
        event.preventDefault();
        closeSidebar();
        window.setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
      }
    });
  });

  syncNavigationMode();
  window.addEventListener("resize", syncNavigationMode);
}

const typingTarget = document.querySelector("[data-typing-text]");

if (typingTarget && !reduceMotion) {
  const typingText = typingTarget.dataset.typingText;
  let characterIndex = 0;
  let typingDirection = 1;

  typingTarget.textContent = "";
  typingTarget.classList.add("typing-caret");

  const animateTyping = () => {
    typingTarget.textContent = typingText.slice(0, characterIndex);

    if (characterIndex === typingText.length) {
      typingDirection = -1;
    } else if (characterIndex === 0) {
      typingDirection = 1;
    }

    const isPausePoint =
      characterIndex === typingText.length || characterIndex === 0;
    const delay = isPausePoint ? (typingDirection === -1 ? 1300 : 500) : 95;

    characterIndex += typingDirection;
    window.setTimeout(animateTyping, delay);
  };

  window.setTimeout(animateTyping, 350);
}

if (contactForm) {
  const formStatus = contactForm.querySelector(".form-status");
  const submitButton = contactForm.querySelector("button[type='submit']");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");
    const subject = `Portfolio message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoUrl = `mailto:itshamza449@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formStatus) {
      formStatus.textContent = "Opening your email app...";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Opening...";
    }

    window.location.href = mailtoUrl;

    window.setTimeout(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }, 1200);
  });
}
