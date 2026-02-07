/* ======================================================
   AMAZON STORE – IMMUTABLE OUTPUT
====================================================== */

let AMAZON_STORE = null;

export function setAmazonStore(data) {
  AMAZON_STORE = Object.freeze(data);
}

export function getAmazonStore() {
  return AMAZON_STORE;
}
