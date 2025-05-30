// calculations.js - Extracted mathematical utilities with corrected logic

/**
 * Calculate actual redistributable excess wealth above threshold
 * @param {Array} data - Array of wealth data points
 * @param {number} threshold - Wealth threshold (plateau level)
 * @returns {number} - Excess wealth in trillions
 */
export function calculateExcessWealth(data, threshold) {
  if (!Array.isArray(data) || data.length === 0 || threshold <= 0) return 0;
  try {
    // Sum only the excess above threshold for each individual
    const totalExcess = data
      .filter(point => point.wealth > threshold)
      .reduce((sum, point) => sum + (point.wealth - threshold), 0);
    // Convert to trillions for easier reading
    return totalExcess / 1e12;
  } catch (error) {
    console.error('Error calculating excess wealth:', error);
    return 0;
  }
}

/**
 * Calculate dynamic utility based on selected threshold
 * @param {number} wealth - Individual wealth amount
 * @param {number} threshold - Selected plateau threshold
 * @returns {number} - Utility value between 0 and 1
 */
export function calculateUtility(wealth, threshold) {
  if (wealth <= 0) return 0;
  if (threshold <= 0) return 1; // Avoid division by zero
  const utility = Math.log1p(wealth) / Math.log1p(threshold);
  // Cap at 1.0 for wealth above threshold (plateau effect)
  return Math.min(utility, 1.0);
}

/**
 * Calculate Gini coefficient for wealth distribution
 * @param {Array<number>} wealthData - Sorted array of wealth values
 * @returns {number} - Gini coefficient between 0 and 1
 */
export function calculateGiniCoefficient(wealthData) {
  if (!Array.isArray(wealthData) || wealthData.length === 0) return 0;
  const sorted = [...wealthData].sort((a, b) => a - b);
  const n = sorted.length;
  const total = sorted.reduce((sum, w) => sum + w, 0);
  if (total === 0) return 0;
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i];
  }
  return numerator / (n * total);
}

/**
 * Calculate Palma ratio (top 10% share / bottom 40% share)
 * @param {Array<number>} wealthData - Sorted array of wealth values
 * @returns {number} - Palma ratio
 */
export function calculatePalmaRatio(wealthData) {
  if (!Array.isArray(wealthData) || wealthData.length === 0) return 0;
  const sorted = [...wealthData].sort((a, b) => a - b);
  const n = sorted.length;
  const total = sorted.reduce((sum, w) => sum + w, 0);
  if (total === 0) return 0;
  const bottomCount = Math.floor(n * 0.4);
  const topCount = Math.floor(n * 0.1);
  const bottomSum = sorted.slice(0, bottomCount).reduce((sum, w) => sum + w, 0);
  const topSum = sorted.slice(-topCount).reduce((sum, w) => sum + w, 0);
  const bottomShare = bottomSum / total;
  const topShare = topSum / total;
  return bottomShare > 0 ? topShare / bottomShare : Infinity;
}

/**
 * Enhanced data processing with corrected calculations
 * @param {Array<Object>} rawWealthData - Raw wealth data points
 * @param {number} threshold - Selected threshold
 * @returns {Object} - Processed data with metrics
 */
export function processWealthData(rawWealthData, threshold) {
  // Map each data point with updated utility
  const processedData = rawWealthData.map(point => ({
    wealth: point.wealth,
    utility: calculateUtility(point.wealth, threshold),
    wealthPct: point.wealth
  }));

  // Extract raw values for metric calculations
  const wealthValues = rawWealthData.map(p => p.wealth);
  const excess = calculateExcessWealth(rawWealthData, threshold);
  const gini = calculateGiniCoefficient(wealthValues);
  const palma = calculatePalmaRatio(wealthValues);
  const thresholdIndex = rawWealthData.findIndex(p => p.wealth >= threshold);

  return {
    data: processedData,
    metrics: { excess, gini, palma, totalDataPoints: rawWealthData.length, thresholdIndex }
  };
}
