ARCHITECTURE OVERVIEW

Layers:
1. core/            → Universal, read-only logic
2. engines/         → MP-specific calculation engines
3. stores/          → Frozen calculation outputs
4. ui/              → UI rendering, filters, exports (no logic)

Demand Weight is defined strictly as MP → SKU.
Filters apply only to report tables and never affect summaries.
