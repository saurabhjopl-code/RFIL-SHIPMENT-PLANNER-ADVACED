/* ======================================================
   MYNTRA STORE – VA-MYNTRA
   Holds Myntra calculation output only
====================================================== */

let _rows = [];

/* ------------------------------------------------------
   SET ROWS (called after engine runs)
------------------------------------------------------ */
export function setMyntraRows(rows) {
  _rows = Array.isArray(rows) ? rows : [];
}

/* ------------------------------------------------------
   GET ROWS (used by UI)
------------------------------------------------------ */
export function getMyntraRows() {
  return _rows;
}

/* ------------------------------------------------------
   RESET STORE (safety / tab switch)
------------------------------------------------------ */
export function resetMyntraStore() {
  _rows = [];
}
