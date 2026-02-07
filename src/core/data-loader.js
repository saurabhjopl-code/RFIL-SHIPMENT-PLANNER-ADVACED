/* ======================================================
   DATA LOADER – RAW DATA INGESTION ONLY
   No calculations
   No filtering
   No mutation
====================================================== */

const SOURCES = {
  SALES_30D:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=1268196089&single=true&output=csv",

  FC_STOCK:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=2046154602&single=true&output=csv",

  UNIWARE_STOCK:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=535319358&single=true&output=csv",

  COMPANY_REMARKS:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=998019043&single=true&output=csv",
};

/* ---------- CSV PARSER ---------- */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ? values[i].trim() : "";
    });
    return row;
  });
}

/* ---------- LOAD CSV ---------- */
async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseCSV(text);
}

/* ---------- PUBLIC LOADER ---------- */
export async function loadAllData() {
  const [
    rawSales,
    rawFcStock,
    rawUniwareStock,
    rawRemarks,
  ] = await Promise.all([
    loadCSV(SOURCES.SALES_30D),
    loadCSV(SOURCES.FC_STOCK),
    loadCSV(SOURCES.UNIWARE_STOCK),
    loadCSV(SOURCES.COMPANY_REMARKS),
  ]);

  return {
    sales: rawSales.map(r => ({
      mp: r["MP"],
      date: r["Date"],
      sku: r["SKU"],
      quantity: Number(r["Quantity"] || 0),
      warehouseId: r["Warehouse Id"],
      fulfillmentType: r["Fulfillment Type"],
      uniwareSku: r["Uniware SKU"],
      styleId: r["Style ID"],
      size: r["Size"],
    })),

    fcStock: rawFcStock.map(r => ({
      mp: r["MP"],
      warehouseId: r["Warehouse Id"],
      sku: r["SKU"],
      quantity: Number(r["Quantity"] || 0),
    })),

    uniwareStock: rawUniwareStock.map(r => ({
      uniwareSku: r["Uniware SKU"],
      quantity: Number(r["Quantity"] || 0),
    })),

    companyRemarks: rawRemarks.map(r => ({
      styleId: r["Style ID"],
      category: r["Category"],
      remark: r["Company Remark"],
    })),
  };
}
