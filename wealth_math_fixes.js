// calculations.js - Extracted mathematical utilities

/**
 * Calculate actual redistributable excess wealth above threshold
 * @param {Array} data - Array of wealth data points
 * @param {number} threshold - Wealth threshold (plateau level)
 * @returns {number} - Excess wealth in trillions
 */
export function calculateExcessWealth(data, threshold) {
  if (!data || data.length === 0 || threshold <= 0) return 0;
  
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
  
  // Use threshold as normalizing factor
  const utility = Math.log1p(wealth) / Math.log1p(threshold);
  
  // Cap at 1.0 for wealth above threshold (plateau effect)
  return Math.min(utility, 1.0);
}

/**
 * Calculate Gini coefficient for wealth distribution
 * @param {Array} wealthData - Sorted array of wealth values
 * @returns {number} - Gini coefficient between 0 and 1
 */
export function calculateGiniCoefficient(wealthData) {
  if (!wealthData || wealthData.length === 0) return 0;
  
  const sortedWealth = [...wealthData].sort((a, b) => a - b);
  const n = sortedWealth.length;
  const totalWealth = sortedWealth.reduce((sum, w) => sum + w, 0);
  
  if (totalWealth === 0) return 0;
  
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sortedWealth[i];
  }
  
  return numerator / (n * totalWealth);
}

/**
 * Calculate Palma ratio (top 10% share / bottom 40% share)
 * @param {Array} wealthData - Sorted array of wealth values
 * @returns {number} - Palma ratio
 */
export function calculatePalmaRatio(wealthData) {
  if (!wealthData || wealthData.length === 0) return 0;
  
  const sortedWealth = [...wealthData].sort((a, b) => a - b);
  const n = sortedWealth.length;
  const totalWealth = sortedWealth.reduce((sum, w) => sum + w, 0);
  
  if (totalWealth === 0) return 0;
  
  // Bottom 40%
  const bottom40Count = Math.floor(n * 0.4);
  const bottom40Wealth = sortedWealth.slice(0, bottom40Count).reduce((sum, w) => sum + w, 0);
  
  // Top 10%
  const top10Count = Math.floor(n * 0.1);
  const top10Wealth = sortedWealth.slice(-top10Count).reduce((sum, w) => sum + w, 0);
  
  const bottom40Share = bottom40Wealth / totalWealth;
  const top10Share = top10Wealth / totalWealth;
  
  return bottom40Share > 0 ? top10Share / bottom40Share : Infinity;
}

/**
 * Enhanced data processing with corrected calculations
 * @param {Array} rawWealthData - Raw wealth data points
 * @param {number} threshold - Selected threshold
 * @returns {Object} - Processed data with metrics
 */
export function processWealthData(rawWealthData, threshold) {
  // Process each data point with corrected utility calculation
  const processedData = rawWealthData.map(point => ({
    wealth: point.wealth,
    utility: calculateUtility(point.wealth, threshold),
    wealthPct: point.wealth
  }));
  
  // Calculate metrics
  const wealthValues = rawWealthData.map(p => p.wealth);
  const excess = calculateExcessWealth(rawWealthData, threshold);
  const gini = calculateGiniCoefficient(wealthValues);
  const palma = calculatePalmaRatio(wealthValues);
  
  return {
    data: processedData,
    metrics: {
      excess,
      gini,
      palma,
      totalDataPoints: rawWealthData.length,
      thresholdIndex: rawWealthData.findIndex(p => p.wealth >= threshold)
    }
  };
}