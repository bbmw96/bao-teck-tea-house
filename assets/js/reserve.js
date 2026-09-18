/* ==========================================================================
   BAO TECK TEA HOUSE — RESERVE A TABLE

   This page offers two ways to reserve: a straight WhatsApp message, or the
   form further down. Whichever the visitor picks, a member of staff still
   confirms it personally; nothing here books a table on its own.

   THE FORM'S SUBMIT BUTTON DOES TWO THINGS AT ONCE:
     1. It opens WhatsApp in a new tab with the visitor's details already
        typed in. The visitor still has to press Send there themselves;
        no website can press that button on their behalf, on any site.
     2. If the owner has switched it on (see content/shared.js,
        "reservationFormEndpoint"), it also emails a copy of the same
        details to the shop, silently, in the background.
     If the owner has not switched step 2 on yet, step 1 still happens on
     its own: nothing here ever depends on the email leg to work.

   WHY THE WHATSAPP WINDOW OPENS BEFORE THE EMAIL IS SENT:
   browsers only allow a script to open a new tab in direct response to the
   visitor's own click. If this waited for the email to finish first, the
   click would already be "over" by the time it tried, and most browsers
   would silently block the new tab as a pop-up. Opening it first, then
   sending the email underneath, keeps both working reliably.
   ========================================================================== */

'use strict';

(function reservePage() {

  const form = document.querySelector('[data-reservation-form]');
  if (!form) return; // only the Reserve page carries this markup

  const submitBtn  = form.querySelector('[data-reserve-submit]');
  const errorText  = form.querySelector('[data-reserve-error]');
  const statusText = form.querySelector('[data-reserve-status]');

  const FIELDS = ['name', 'phone', 'party', 'date', 'time', 'notes'];
  const REQUIRED = ['name', 'phone', 'party', 'date', 'time'];

  function field(name) { return form.querySelector('[name="' + name + '"]'); }

  /* ----------------------------------------------------------------------
     THE DIRECT WHATSAPP CARD
     Gives the "message us on WhatsApp" card a sensible opening line already
     typed in, rather than a blank chat window, so a visitor who taps it
     does not have to think of what to say first. Rebuilt whenever the
     language changes, like everything else translated on this page.
     ---------------------------------------------------------------------- */
  function buildDirectLink() {
    const shared = (typeof I18N !== 'undefined' && I18N.shared) || {};
    const c = shared.contact;
    const a = document.querySelector('[data-reserve-whatsapp-link]');
    if (!a || !c || !c.whatsappLink) return;
    const message = (typeof I18N !== 'undefined')
      ? I18N.t('reserve.choice.whatsapp.message')
      : '';
    const url = 'https://wa.me/' + c.whatsappLink +
      (message ? '?text=' + encodeURIComponent(message) : '');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  }

  /* ----------------------------------------------------------------------
     VALIDATION
     Light-touch on purpose: this is a request, not a legal form, so it only
     checks that the fields a member of staff would actually need to call
     back are filled in. Notes stay optional.
     ---------------------------------------------------------------------- */
  function validate() {
    let firstInvalid = null;
    REQUIRED.forEach(name => {
      const el = field(name);
      if (!el) return;
      const bad = !el.value || !String(el.value).trim();
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !firstInvalid) firstInvalid = el;
    });
    return firstInvalid;
  }

  form.querySelectorAll('.input, .textarea').forEach(el => {
    el.addEventListener('input', () => el.setAttribute('aria-invalid', 'false'));
  });

  /* ----------------------------------------------------------------------
     THE MESSAGE
     Built from the same field labels shown on the form, in whatever
     language the visitor is reading it in, so the message that reaches
     WhatsApp and the copy that reaches the shop's email both read
     naturally rather than as a raw list of field names.
     ---------------------------------------------------------------------- */
  function buildMessage(values) {
    const t = (typeof I18N !== 'undefined') ? I18N.t : (k => k);
    const lines = [t('reserve.form.title') + ':', ''];
    lines.push(t('reserve.form.name') + ': ' + values.name);
    lines.push(t('reserve.form.phone') + ': ' + values.phone);
    lines.push(t('reserve.form.party') + ': ' + values.party);
    lines.push(t('reserve.form.date') + ': ' + values.date);
    lines.push(t('reserve.form.time') + ': ' + values.time);
    if (values.notes) lines.push(t('reserve.form.notes') + ': ' + values.notes);
    return lines.join('\n');
  }

  function setStatus(key, isError) {
    if (!statusText) return;
    statusText.textContent = (typeof I18N !== 'undefined') ? I18N.t(key) : '';
    statusText.classList.toggle('error-text', !!isError);
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.classList.toggle('is-loading', on);
    submitBtn.disabled = on;
  }

  /* ----------------------------------------------------------------------
     SUBMIT
     ---------------------------------------------------------------------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (errorText) errorText.hidden = true;

    const bad = validate();
    if (bad) {
      if (errorText) {
        errorText.textContent = (typeof I18N !== 'undefined') ? I18N.t('reserve.form.errorRequired') : '';
        errorText.hidden = false;
      }
      bad.focus();
      return;
    }

    const values = {};
    FIELDS.forEach(name => { const el = field(name); values[name] = el ? el.value.trim() : ''; });

    const shared = (typeof I18N !== 'undefined' && I18N.shared) || {};
    const c = shared.contact || {};
    const message = buildMessage(values);
    const waUrl = 'https://wa.me/' + (c.whatsappLink || '') +
      '?text=' + encodeURIComponent(message);

    /* Opened straight away, inside the same click, so no browser mistakes
       it for a pop-up (see the file header for why the order matters). */
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    const endpoint = typeof c.reservationFormEndpoint === 'string' ? c.reservationFormEndpoint.trim() : '';
    const hasEndpoint = /^https?:\/\//i.test(endpoint);

    if (!hasEndpoint) {
      setStatus('reserve.form.successWhatsapp', false);
      return;
    }

    setLoading(true);
    setStatus('reserve.form.sending', false);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: values.name, phone: values.phone, party: values.party,
        date: values.date, time: values.time, notes: values.notes,
        message: message,
        _subject: 'Reservation request - ' + values.name
      })
    })
      .then(res => { setStatus(res.ok ? 'reserve.form.successBoth' : 'reserve.form.successWhatsapp', false); })
      .catch(() => { setStatus('reserve.form.successWhatsapp', false); })
      .finally(() => { setLoading(false); });
  });

  /* ---------------------------------------------------------------------- */
  function init() {
    buildDirectLink();
    document.addEventListener('i18n:changed', buildDirectLink);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
