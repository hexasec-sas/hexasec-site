const $ = (s) => document.querySelector(s);

/* Año */
$('#year').textContent = new Date().getFullYear();

/* MENU */
const btn = $('#menuBtn');
const nav = $('#mobileNav');

btn.onclick = () => {
  nav.hidden = !nav.hidden;
};

/* MODAL */
const modal = $('#gapModal');

$('#openGapModalBtn').onclick = () => {
  modal.classList.add('is-open');
};

modal.onclick = (e) => {
  if (e.target.dataset.close) {
    modal.classList.remove('is-open');
  }
};

/* GAP */
$('#gapFormModal').onsubmit = (e) => {
  e.preventDefault();

  const val = Number(e.target.q1.value || 0);
  $('#gapScoreModal').textContent = val;
  $('#gapPreviewModal').hidden = false;

  $('#gap_score').value = val;
};

/* FORM */
$('#contactForm').onsubmit = async (e) => {
  e.preventDefault();

  const res = await fetch(e.target.action, {
    method: "POST",
    body: new FormData(e.target),
    headers: {Accept: "application/json"}
  });

  $('#formStatus').textContent = res.ok
    ? "Sent successfully"
    : "Error sending";
};