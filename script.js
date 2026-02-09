'use strict';

const $ = (sel, root = document) => root.querySelector(sel);

/* =========================
   Año automático
========================= */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* =========================
   MENÚ MÓVIL (HAMBURGUESA) - FIX
   Usa: #menuBtn y #mobileNav (los tienes en HTML)
========================= */
(function hamburgerMenu(){
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  if (!menuBtn || !mobileNav) return;

  const open = () => {
    mobileNav.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  };

  const close = () => {
    mobileNav.hidden = true;
    menuBtn