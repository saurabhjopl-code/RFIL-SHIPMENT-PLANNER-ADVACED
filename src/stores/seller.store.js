/* ======================================================
   SELLER STORE – VA-SELLER
   Holds Seller calculation output only
====================================================== */

let _rows = [];

/* ------------------------------------------------------
   SET ROWS (called after engine runs)
------------------------------------------------------ */
export function setSellerRows(rows) {
  _rows = Array.isArray(rows) ? rows : [];
}

/* ------------------------------------------------------
   GET ROWS (used by UI)
------------------------------------------------------ */
export function getSellerRows() {
  return _rows;
}

/* ------------------------------------------------------
   RESET STORE (safety / tab switch)
------------------------------------------------------ */
export function resetSellerStore() {
  _rows = [];
}
