"use strict";

const pageName = document.body.dataset.page || "home";

const navItems = [
  ["home", "Home", "index.html"],
  ["about", "About", "about.html"],
  ["events", "Events", "events.html"],
  ["members", "Members", "members.html"],
  ["notices", "Notices", "notices.html"],
  ["resources", "Resources", "resources.html"],
  ["gallery", "Gallery", "gallery.html"],
  ["contact", "Contact", "contact.html"],
];

const icon = (symbol) => `<span aria-hidden="true">${symbol}</span>`;

function renderHeader() {
  const mount = document.querySelector("[data-site-header]");
  if (!mount) return;

  const links = navItems
    .map(
      ([key, label, href]) =>
        `<a class="nav-link${pageName === key ? " is-active" : ""}" href="${href}"${
          pageName === key ? ' aria-current="page"' : ""
        }>${label}</a>`,
    )
    .join("");

  mount.innerHTML = `
    <header class="site-header" data-header>
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="Council of United Trade Alliance home">
          <img src="assets/images/cuta-logo-horizontal.png" alt="Council of United Trade Alliance">
        </a>
        <nav class="site-nav" id="site-navigation" aria-label="Primary navigation" data-nav>
          ${links}
        </nav>
        <a class="btn btn-orange btn-sm header-cta cta-pulse" href="members.html#apply">Join the Council</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation" data-menu-toggle>
          <span></span>
        </button>
      </div>
    </header>`;
}

function renderFooter() {
  const mount = document.querySelector("[data-site-footer]");
  if (!mount) return;

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-main">
        <div class="footer-brand">
          <img src="assets/images/cuta-logo-stacked.png" alt="Council of United Trade Alliance">
          <p>A collective platform advancing practical awareness, representation, networking, and enterprise development for MSMEs in West Bengal.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <ul class="footer-links">
            <li><a href="about.html">About the Council</a></li>
            <li><a href="events.html">Events & Programmes</a></li>
            <li><a href="members.html#membership">Membership</a></li>
            <li><a href="gallery.html">Gallery</a></li>
          </ul>
        </div>
        <div>
          <h3>Member Desk</h3>
          <ul class="footer-links">
            <li><a href="members.html">Members</a></li>
            <li><a href="notices.html">Notices</a></li>
            <li><a href="resources.html">Important Links</a></li>
            <li><a href="contact.html">Contact Secretariat</a></li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul class="footer-links">
            <li><a href="mailto:unitedtradealliance@gmail.com">unitedtradealliance@gmail.com</a></li>
            <li><a href="tel:+919903304633">+91 99033 04633</a></li>
            <li><a href="tel:+918017007817">+91 80170 07817</a></li>
            <li>Purbapara, P.O. Madarat, Baruipur, South 24 Parganas, West Bengal - 743610</li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>&copy; <span data-year></span> Council of United Trade Alliance. All rights reserved.</span>
        <div class="footer-bottom-links">
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </div>
      </div>
    </footer>`;
}

function initLoader() {
  const loader = document.querySelector(".site-loader");
  if (!loader) return;

  const dismiss = () => {
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 500);
  };

  if (document.readyState === "complete") {
    setTimeout(dismiss, 250);
  } else {
    window.addEventListener("load", () => setTimeout(dismiss, 250), { once: true });
    setTimeout(dismiss, 2200);
  }
}

function initNavigation() {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-menu-toggle]");
  if (!header || !nav || !toggle) return;

  let lastScroll = window.scrollY;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.scrollY;
      header.classList.toggle("is-scrolled", currentScroll > 12);

      if (currentScroll > 140 && currentScroll > lastScroll + 8 && !nav.classList.contains("is-open")) {
        header.classList.add("is-hidden");
      } else if (currentScroll < lastScroll - 8 || currentScroll < 80) {
        header.classList.remove("is-hidden");
      }

      lastScroll = currentScroll;
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeMenu();
  });
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" },
  );

  elements.forEach((element) => observer.observe(element));
}

function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll("[data-tab]");
    const panels = tabGroup.querySelectorAll("[data-panel]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tab;
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.panel !== target;
        });
      });
    });
  });
}

function initFilters() {
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const buttons = group.querySelectorAll("[data-filter]");
    const items = document.querySelectorAll(`[data-filter-item="${group.dataset.filterGroup}"]`);

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        items.forEach((item) => {
          item.hidden = filter !== "all" && item.dataset.category !== filter && item.dataset.category !== "all";
        });
      });
    });
  });
}

function initForms() {
  document.querySelectorAll("[data-email-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const subject = `${data.get("enquiryType") || "Website enquiry"} - ${data.get("name")}`;
      const lines = [];

      data.forEach((value, key) => {
        if (key !== "consent" && value) {
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
          lines.push(`${label}: ${value}`);
        }
      });

      const mailto = `mailto:unitedtradealliance@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        lines.join("\n"),
      )}`;
      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "Your email application is ready. Please send it from the mail window that opens.";
        status.classList.add("is-visible");
      }
      window.location.href = mailto;
    });
  });
}

function initLightbox() {
  const items = document.querySelectorAll("[data-lightbox]");
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;

  const image = lightbox.querySelector("img");
  const caption = lightbox.querySelector("figcaption");
  const count = lightbox.querySelector(".lightbox-count");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  let currentIndex = 0;

  const showItem = (index) => {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const source = item.querySelector("img");
    image.src = source.src;
    image.alt = source.alt;
    caption.textContent = item.dataset.caption || source.alt;
    if (count) count.textContent = `Photograph ${currentIndex + 1} of ${items.length}`;
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      showItem(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", close);
  if (previousButton) previousButton.addEventListener("click", () => showItem(currentIndex - 1));
  if (nextButton) nextButton.addEventListener("click", () => showItem(currentIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") showItem(currentIndex - 1);
    if (event.key === "ArrowRight") showItem(currentIndex + 1);
  });
}

function initPrintButtons() {
  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });
}

renderHeader();
renderFooter();
document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
initLoader();
initNavigation();
initReveal();
initTabs();
initFilters();
initForms();
initLightbox();
initPrintButtons();
