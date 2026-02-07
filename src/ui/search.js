/* ======================================================
   UNIVERSAL TABLE SEARCH
   - Filters REPORT rows only
   - Summary unaffected
====================================================== */

export function bindTableSearch(inputId, tableBodyId) {
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tableBodyId);

  if (!input || !tbody) return;

  input.onkeyup = () => {
    const q = input.value.toLowerCase();

    Array.from(tbody.querySelectorAll("tr")).forEach(tr => {
      const text = tr.innerText.toLowerCase();
      tr.style.display = text.includes(q) ? "" : "none";
    });
  };
}
