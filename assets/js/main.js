import { SITE_CONFIG } from "./config.js";

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
  // so show a friendly note instead of trying to send.
  const STATIC_HOST = /\.github\.io$/i.test(location.hostname);
  const showPreviewNote = () => {
    status.className = "form-status is-info";
    const email = SITE_CONFIG.contactEmail;
    status.innerHTML =
      `<strong>Thanks for your interest!</strong> This is a preview of the website, so the form isn't connected yet. ` +
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
