console.log("Portfolio loaded!");

const themeToggle = document.getElementById("themeToggle");
const themeStorageKey = "portfolio-theme-v2";
// Light and dark mode toggle with a circular reveal animation
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    console.warn("Could not save the selected theme.", error);
  }
}

// Load the visitor's last choice (dark by default)
let savedTheme = null;
try {
  savedTheme = localStorage.getItem(themeStorageKey);
} catch (error) {
  console.warn("Could not load the saved theme; using dark mode.", error);
}
applyTheme(savedTheme === "light" ? "light" : "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", function (event) {
    const current = document.documentElement.getAttribute("data-bs-theme");
    const next = current === "dark" ? "light" : "dark";

    // Spin the icon
    themeToggle.classList.toggle("spin");

    // Older browsers, or users who turned off animations: switch instantly
    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      saveTheme(next);
      return;
    }

    // Grow a circle from where the user clicked
    const x = event.clientX;
    const y = event.clientY;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(function () {
      applyTheme(next);
    });

    transition.ready.then(function () {
      document.documentElement.animate(
        {
          clipPath: [
            "circle(0px at " + x + "px " + y + "px)",
            "circle(" + radius + "px at " + x + "px " + y + "px)"
          ]
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    });

    saveTheme(next);
  });
}
// Highlight the navbar link of the section you are viewing
const navLinks = document.querySelectorAll('.navbar .nav-link[href^="#"]:not([href="#"]), .navbar .dropdown-item[href^="#"]');
const menu = document.getElementById("menu");
const sections = Array.from(navLinks)
  .map(function (link) { return document.querySelector(link.getAttribute("href")); })
  .filter(function (section) { return section !== null; });

let clickedId = null; // the link the user just clicked

function setActive(id) {
  navLinks.forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("href") === "#" + id);
  });
}

function updateActiveOnScroll() {
  if (clickedId) return; // keep the clicked link until the user scrolls by hand

  // At the very bottom of the page, choose the last section
  const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  if (atBottom) {
    setActive(sections[sections.length - 1].id);
    return;
  }

  // Otherwise, choose the last section whose top has passed the navbar
  let currentId = sections[0].id;
  sections.forEach(function (section) {
    if (section.getBoundingClientRect().top <= 120) currentId = section.id;
  });
  setActive(currentId);
}

window.addEventListener("scroll", function () {
  window.requestAnimationFrame(updateActiveOnScroll);
});

// When the user scrolls by hand, stop holding the clicked link
["wheel", "touchmove", "keydown"].forEach(function (eventName) {
  window.addEventListener(eventName, function () { clickedId = null; }, { passive: true });
});

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    clickedId = link.getAttribute("href").slice(1);
    setActive(clickedId);
    // On phones, close the ☰ menu after choosing a link
    if (menu && menu.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});

updateActiveOnScroll();
