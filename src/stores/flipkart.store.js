/* ======================================================
   FLIPKART STORE – VA-FLIPKART
   Holds Flipkart calculation output only
====================================================== */

let _rows = [];

/* ------------------------------------------------------
   SET ROWS (called after engine runs)
------------------------------------------------------ */
export function setFlipkartRows(rows) {
  _rows = Array.isArray(rows) ? rows : [];
}

/* ------------------------------------------------------
   GET ROWS (used by UI)
------------------------------------------------------ */
export function getFlipkartRows() {
  return _rows;
}

/* ------------------------------------------------------
   RESET STORE (safety / tab switch)
------------------------------------------------------ */
export function resetFlipkartStore() {
  _rows = [];
}
