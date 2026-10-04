import { SITE_CONFIG } from "./config.js";

window.__littleArrows = true; // tells assets/js/motion.js that scripts loaded

// Gentle reveal-on-scroll (only when <html class="motion">; see motion.js + styles.css).
// Each element animates once; afterwards its data-reveal attribute is removed so
// normal hover effects and transitions take over again.
const root = document.documentElement;
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
const settle = (el) => {
  if (el.classList.contains("is-in")) return;
  el.classList.add("is-in");
  const delay = parseInt(getComputedStyle(el).getPropertyValue("--d"), 10) || 0;
  setTimeout(() => { el.removeAttribute("data-reveal"); el.classList.remove("is-in"); }, delay + 1200);
};
if (root.classList.contains("motion") && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  revealEls.forEach((el) => {
    io.observe(el);
    // Keyboard users: anything focused inside is shown immediately.
    el.addEventListener("focusin", () => { settle(el); io.unobserve(el); }, { once: true });
  });
  // Photos hidden on small screens can't be observed; if the window is resized
  // (e.g. a tablet rotated), simply show anything still waiting.
  matchMedia("(min-width: 861px)").addEventListener("change", () =>
    revealEls.forEach((el) => el.hasAttribute("data-reveal") && settle(el)), { once: true });
} else {
  root.classList.remove("motion");
}

// Fill every [data-email] element from the single config value.
document.querySelectorAll("[data-email]").forEach((el) => {
  el.textContent = SITE_CONFIG.contactEmail;
  if (el.tagName === "A") el.href = `mailto:${SITE_CONFIG.contactEmail}`;
});

// Footer year
const y = document.querySelector("[data-year]");
if (y) y.textContent = new Date().getFullYear();

// Mobile navigation
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  const close = () => { toggle.setAttribute("aria-expanded", "false"); header.classList.remove("nav-open"); };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("nav-open", open);
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// Header shadow once scrolled
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Contact form (progressive enhancement: works without JS via POST → /thanks.html on Cloudflare Pages)
const form = document.getElementById("contact-form");
if (form) {
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type=submit]");
  // Static hosts (e.g. the GitHub Pages demo) can't run functions/api/contact.js,
  // and until an email service is configured the function can't deliver either.
  // In both cases show a friendly "please email instead" note, never an error.
  const STATIC_HOST = /\.github\.io$/i.test(location.hostname);
  const showPreviewNote = () => {
    status.className = "form-status is-info";
    const email = SITE_CONFIG.contactEmail;
    status.innerHTML =
      `<strong>Thanks for your interest!</strong> The online form isn't connected yet, so your message wasn't sent. ` +
      `For now, please email Stephanie at <a href="mailto:${email}">${email}</a>.`;
    status.focus();
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (STATIC_HOST) { showPreviewNote(); return; }
    button.disabled = true;
    const label = button.textContent;
    button.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      if (!isJson && [404, 405, 501].includes(res.status)) { showPreviewNote(); return; } // no form handler on this host
      const data = await res.json().catch(() => ({}));
      if (data.notConfigured) { showPreviewNote(); return; } // email service not set up yet
      if (!res.ok || data.ok === false) throw new Error(data.error || "Something went wrong.");
      form.reset();
      form.classList.add("is-sent");
      status.classList.add("is-success");
      status.innerHTML =
        "<strong>Thank you!</strong> Your note is on its way. Stephanie will reply personally, usually within one business day.";
      status.focus();
    } catch (err) {
      status.classList.add("is-error");
      status.textContent = `Sorry, your message didn't send (${err.message}). Please try again, or email ${SITE_CONFIG.contactEmail}.`;
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
}
