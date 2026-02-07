# Shipment Planner – VA4.3 (MP-Isolated Architecture)

This repository implements the Shipment Planner using a strict MP-isolated architecture.

Universal rules (Uniware 60–40, Closed Style, DW MP→SKU) are shared and immutable.
Each MP (Amazon, Flipkart, Myntra, Seller) has its own calculation engine, store, UI, filters, and exports.

Once an MP engine is completed, it must never be modified.
