# Shipment Planner – VA4.3 (Locked)

## Purpose
Shipment Planner is an internal planning tool designed to calculate
shipment and recall quantities for Amazon, Flipkart, Myntra, and Seller
channels using demand-driven logic and strict business rules.

This tool focuses on **decision accuracy**, not UI or automation.

---

## Platforms Covered
- Amazon IN
- Flipkart
- Myntra
- Seller (Non-MP fulfillment)

Each platform is calculated independently to ensure isolation and safety.

---

## Input Data Sources

### 1. Sales Data (Last 30 Days)
Used to calculate demand and DRR.

Fields:
- MP (AMAZON IN / FLIPKART / MYNTRA)
- Date
- SKU
- Warehouse Id
- Quantity
- Uniware SKU
- Style ID

Special Rule:
- Rows where `Warehouse Id = SELLER` are treated as **Seller sales**
  even if MP column shows Amazon / Flipkart / Myntra.

---

### 2. FC Stock Data
Represents inventory currently placed at MP Fulfillment Centers.

Fields:
- MP
- Warehouse Id (FC)
- SKU
- Quantity

---

### 3. Uniware Stock Data
Represents central warehouse inventory.

Fields:
- Uniware SKU
- Quantity

---

### 4. Company Remarks
Used for lifecycle control.

Fields:
- Style ID
- Company Remark

Special Value:
- `Closed` → Style is discontinued

---

## Core Definitions

### Daily Run Rate (DRR)

DRR is rounded to **2 decimals**.

---

### Target & Recall Days
- Target Stock Days = **45**
- Recall Threshold Days = **60**

---

### Stock Cover


---

## Global Hard Rules (Non-Negotiable)

1. **Closed Style Rule**
   - Shipment Qty = 0
   - Recall entire FC stock
   - Action = RECALL
   - Overrides all other logic

2. **Uniware 60–40 Rule**
   - Only 40% of total Uniware stock is usable
   - 60% is always locked
   - This 40% is shared across all MPs + Seller

3. **Shipment Ceiling**
   - Shipment Qty ≤ Actual Shipment Qty

4. **Minimum Demand Rule**
   - If calculated demand > 0 and < 1 → round up to 1

---

## MP Logic (Amazon / Flipkart / Myntra)

Each MP is calculated **independently**.

### Steps:
1. Calculate SKU DRR from MP sales
2. Calculate Actual Shipment Qty:

3. Allocate Uniware stock using demand weight
4. Apply shipment ceiling
5. Apply recall logic if Stock Cover > 60 days

Outputs:
- FC Summary
- Shipment & Recall Summary
- Shipment & Recall Report

---

## Seller Logic (VA-SELLER – Locked)

Seller represents demand not fulfilled by MP FCs.

### Key Characteristics
- Seller has **no FC stock**
- Seller has **no recall**
- Seller consumes Uniware stock **after MPs**

---

### Seller Shipment Logic
1. Calculate Seller DRR from Seller sales
2. Actual Shipment Qty = 45 × Seller DRR
3. Allocate from remaining Uniware 40%
4. Shipment Qty is capped by Uniware availability

---

### Seller FC Assignment
- Seller uses **historical MP FC demand**
- If no FC demand exists:
- Mark as `DEFAULT_FC`
- These rows are **non-executable**

---

### Seller Summary Rules
- Only rows with valid FC & MP are included
- `DEFAULT_FC` rows are excluded
- Summary is grouped by:
- Replenishment MP
- Replenishment FC
- Grand Total is provided

---

## Filtering Rule (Critical)
- Filters & search apply **only to report tables**
- Summaries are always calculated from **full data**
- Summaries never depend on filtered rows

---

## Export Rules

### Export Format
- One Excel file
- Separate sheet for each:
- AMAZON
- FLIPKART
- MYNTRA
- SELLER

### Seller Export Rules
- Rows with `DEFAULT_FC` are excluded
- Rows with Shipment Qty = 0 are excluded

---

## Version Lock

- Current Version: **VA4.3**
- Seller Logic Version: **VA-SELLER**
- This version is **locked**
- Any change must be released as a new version

---

## Notes
This system prioritizes:
- Accuracy over automation
- Explainability over optimization
- Stability over feature expansion

