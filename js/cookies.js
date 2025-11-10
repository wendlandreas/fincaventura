/* ===========================
   FincAventura Cookie Consent
   =========================== */

const GA_ID  = 'G-5VT0Q0Y8FF';            // p.ej. 'G-XXXXXXXXXX'  (déjalo '' si usas GTM)
const GTM_ID = '';            // p.ej. 'GTM-XXXXXXX'   (recomendado; gestiona GA en GTM)

const LS_KEY = 'faConsentV1'; // versióna si cambias estructura
const defaultConsent = { analytics: false, marketing: false, ts: null };

function getConsent() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || { ...defaultConsent };
  } catch(e) {
    return { ...defaultConsent };
  }
}
function setConsent(c) {
  const payload = { ...c, ts: Date.now() };
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
  return payload;
}

/* ---- UI helpers ---- */
// tiny helper with a non-conflicting name
const qs = (sel) => document.querySelector(sel);
const banner     = qs('#fa-cookie-banner');
const modal      = qs('#fa-cookie-modal');
const tAnalytics = qs('#fa-toggle-analytics');
const tMarketing = qs('#fa-toggle-marketing');

function openBanner()  { banner.style.display = 'block'; }
function closeBanner() { banner.style.display = 'none'; }
function openModal()   { modal.style.display  = 'block'; }
function closeModal()  { modal.style.display  = 'none'; }

/* ---- Loader: GA4 directo ---- */
function loadGA4() {
  if (!GA_ID) return;
  // Carga gtag.js
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode por defecto (denied)
  gtag('consent', 'default', {
    ad_user_data:        'denied',
    ad_personalization:  'denied',
    ad_storage:          'denied',
    analytics_storage:   'denied',
    functionality_storage: 'granted',
    security_storage:      'granted'
  });

  // Init
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
}

function updateGA4Consent(consent) {
  if (typeof gtag !== 'function') return;
  gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage:        consent.marketing ? 'granted' : 'denied',
    ad_user_data:      consent.marketing ? 'granted' : 'denied',
    ad_personalization:consent.marketing ? 'granted' : 'denied'
  });
}

/* ---- Loader: GTM ---- */
function loadGTM(consent) {
  if (!GTM_ID) return;
  // Asegura dataLayer y comunica (similar a Consent Mode)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'fa_consent_default',
    'analytics_storage':  'denied',
    'ad_storage':         'denied',
    'ad_user_data':       'denied',
    'ad_personalization': 'denied',
    'functionality_storage': 'granted',
    'security_storage':      'granted'
  });
  window.dataLayer.push({
    'event': 'fa_consent_update',
    'analytics_storage':  consent.analytics ? 'granted' : 'denied',
    'ad_storage':         consent.marketing ? 'granted' : 'denied',
    'ad_user_data':       consent.marketing ? 'granted' : 'denied',
    'ad_personalization': consent.marketing ? 'granted' : 'denied'
  });

  // Inyecta el contenedor GTM
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
    j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',GTM_ID);
}

/* ---- Decide qué cargar según tu configuración ---- */
function applyLoading(consent) {
  // Si usas GTM, carga GTM y gestiona GA dentro de GTM
  if (GTM_ID) {
    if (consent.analytics || consent.marketing) loadGTM(consent);
    return;
  }
  // Si NO usas GTM, pero sí GA4 directo
  if (GA_ID) {
    // Asegura que GA4 esté cargado (una sola vez)
    if (!window.gtag) loadGA4();
    updateGA4Consent(consent);
  }
}

/* ---- Botones / eventos ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Enlace footer "Gestionar cookies"
  const manage = qs('#fa-manage-cookies');
  if (manage) manage.addEventListener('click', e => { e.preventDefault(); const c = getConsent(); tAnalytics.checked = !!c.analytics; tMarketing.checked = !!c.marketing; openModal(); });

  // Banner botones
  qs('#fa-accept-all').addEventListener('click', () => {
    const c = setConsent({ analytics:true, marketing:true });
    closeBanner(); applyLoading(c);
  });
  qs('#fa-reject-all').addEventListener('click', () => {
    const c = setConsent({ analytics:false, marketing:false });
    closeBanner(); /* No se carga nada */
  });
  qs('#fa-open-settings').addEventListener('click', () => {
    const c = getConsent(); tAnalytics.checked = !!c.analytics; tMarketing.checked = !!c.marketing; openModal();
  });
  const cfgOpenBtn = document.getElementById('fa-cfg-open');
  if (cfgOpenBtn) cfgOpenBtn.addEventListener('click', () => {
    const c = getConsent(); tAnalytics.checked = !!c.analytics; tMarketing.checked = !!c.marketing; openModal();
  });

  // Modal botones
  qs('#fa-cfg-cancel').addEventListener('click', closeModal);
  qs('#fa-cfg-save').addEventListener('click', () => {
    const c = setConsent({ analytics: !!tAnalytics.checked, marketing: !!tMarketing.checked });
    closeModal(); closeBanner(); applyLoading(c);
  });

  // Estado inicial
  const c = getConsent();
  if (c.ts === null) {
    openBanner();
  } else {
    // Preferencia ya guardada previamente
    applyLoading(c);
  }
});