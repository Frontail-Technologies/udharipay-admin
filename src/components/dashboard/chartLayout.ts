/**
 * Shared height rhythm for the dashboard grid.
 *
 * Only the analytics row (charts) is height-locked — charts need real plot
 * space, so a controlled panel height is intentional there. The
 * attention/activity row is deliberately NOT locked: it uses plain CSS Grid
 * `items-stretch` so the row sizes to its tallest natural child, and the
 * shorter sibling stretches to match — equal outer height without an
 * arbitrary fixed number that leaves one card mostly empty.
 */
export const ANALYTICS_ROW_HEIGHT_CLASS = "lg:h-[370px]";

/**
 * Chart drawing area: a safe fixed height below `lg` (so charts never
 * collapse in an auto-height flex column), then `flex-1` to fill the
 * panel's real height once the row height lock is active. Relies on
 * ChartCard's content region being `display:flex` — see ChartCard.tsx.
 */
export const CHART_AREA_HEIGHT_CLASS =
  "h-[280px] sm:h-[300px] lg:h-auto lg:min-h-0 lg:flex-1";
