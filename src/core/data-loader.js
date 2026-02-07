const SOURCES = [
  {
    key: "sales",
    label: "Loading Sales (30D)",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=1268196089&single=true&output=csv",
  },
  {
    key: "fcStock",
    label: "Loading FC Stock",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=2046154602&single=true&output=csv",
  },
  {
    key: "uniwareStock",
    label: "Loading Uniware Stock",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=535319358&single=true&output=csv",
  },
  {
    key: "companyRemarks",
    label: "Loading Company Remarks",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=998019043&single=true&output=csv",
  },
];

/* ---------- CSV PARSER ---------- */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i]?.trim() ?? "";
    });
    return row;
  });
}

async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

/* ---------- PUBLIC LOADER WITH PROGRESS ---------- */
export async function loadAllData(onProgress) {
  const result = {};
  const total = SOURCES.length;

  for (let i = 0; i < total; i++) {
    const source = SOURCES[i];

    const percent = Math.round((i / total) * 100);
    onProgress?.(percent, source.label);

    const raw = await loadCSV(source.url);
    result[source.key] = raw;

    onProgress?.(
      Math.round(((i + 1) / total) * 100),
      `${source.label} ✓`
    );
  }

  return {
    sales: result.sales.map(r => ({
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

    fcStock: result.fcStock.map(r => ({
      mp: r["MP"],
      warehouseId: r["Warehouse Id"],
      sku: r["SKU"],
      quantity: Number(r["Quantity"] || 0),
    })),

    uniwareStock: result.uniwareStock.map(r => ({
      uniwareSku: r["Uniware SKU"],
      quantity: Number(r["Quantity"] || 0),
    })),

    companyRemarks: result.companyRemarks.map(r => ({
      styleId: r["Style ID"],
      category: r["Category"],
      remark: r["Company Remark"],
    })),
  };
}
