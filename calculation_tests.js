// calculations.test.js - Unit tests for mathematical functions

import { 
  calculateExcessWealth, 
  calculateUtility, 
  calculateGiniCoefficient, 
  calculatePalmaRatio,
  processWealthData 
} from './calculations';

// Test data
const testWealthData = [
  { wealth: 0 },
  { wealth: 50000 },
  { wealth: 100000 },
  { wealth: 200000 },
  { wealth: 500000 },
  { wealth: 1000000 },
  { wealth: 5000000 }
];

describe('calculateExcessWealth', () => {
  test('should calculate correct excess above threshold', () => {
    const threshold = 200000;
    const excess = calculateExcessWealth(testWealthData, threshold);
    
    // Expected: (500000-200000) + (1000000-200000) + (5000000-200000) = 300000 + 800000 + 4800000 = 5900000
    // In trillions: 5900000 / 1e12 = 0.0000059
    expect(excess).toBeCloseTo(0.0000059, 7);
  });

  test('should return 0 for threshold above all wealth', () => {
    const threshold = 10000000;
    const excess = calculateExcessWealth(testWealthData, threshold);
    expect(excess).toBe(0);
  });

  test('should handle edge cases', () => {
    expect(calculateExcessWealth([], 100000)).toBe(0);
    expect(calculateExcessWealth(testWealthData, 0)).toBeGreaterThan(0);
    expect(calculateExcessWealth(testWealthData, -1000)).toBe(0);
  });
});

describe('calculateUtility', () => {
  test('should scale utility based on threshold', () => {
    const wealth = 100000;
    const threshold = 200000;
    
    const utility = calculateUtility(wealth, threshold);
    const expectedUtility = Math.log1p(wealth) / Math.log1p(threshold);
    
    expect(utility).toBeCloseTo(expectedUtility, 6);
    expect(utility).toBeLessThan(1);
  });

  test('should cap utility at 1.0 for wealth above threshold', () => {
    const wealth = 500000;
    const threshold = 200000;
    
    const utility = calculateUtility(wealth, threshold);
    expect(utility).toBeLessThanOrEqual(1.0);
  });

  test('should handle edge cases', () => {
    expect(calculateUtility(0, 100000)).toBe(0);
    expect(calculateUtility(100000, 0)).toBe(1);
    expect(calculateUtility(-1000, 100000)).toBe(0);
  });
});

describe('calculateGiniCoefficient', () => {
  test('should calculate Gini for simple wealth distribution', () => {
    const simpleWealth = [1, 2, 3, 4, 5]; // Low inequality
    const gini = calculateGiniCoefficient(simpleWealth);
    
    expect(gini).toBeGreaterThan(0);
    expect(gini).toBeLessThan(1);
    expect(gini).toBeCloseTo(0.267, 2); // Expected Gini for this distribution
  });

  test('should return 0 for perfectly equal distribution', () => {
    const equalWealth = [100, 100, 100, 100];
    const gini = calculateGiniCoefficient(equalWealth);
    expect(gini).toBeCloseTo(0, 6);
  });

  test('should handle edge cases', () => {
    expect(calculateGiniCoefficient([])).toBe(0);
    expect(calculateGiniCoefficient([0, 0, 0])).toBe(0);
    expect(calculateGiniCoefficient([100])).toBe(0);
  });
});

describe('calculatePalmaRatio', () => {
  test('should calculate Palma ratio correctly', () => {
    // Test with 10 people: wealth from 1 to 10
    const wealthData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const palma = calculatePalmaRatio(wealthData);
    
    // Bottom 40% (4 people): 1+2+3+4 = 10, share = 10/55 ≈ 0.182
    // Top 10% (1 person): 10, share = 10/55 ≈ 0.182
    // Palma = 0.182/0.182 = 1.0
    expect(palma).toBeCloseTo(1.0, 1);
  });

  test('should handle edge cases', () => {
    expect(calculatePalmaRatio([])).toBe(0);
    expect(calculatePalmaRatio([0, 0, 0, 0, 0])).toBe(0);
  });
});

describe('processWealthData', () => {
  test('should process data with all metrics', () => {
    const threshold = 200000;
    const result = processWealthData(testWealthData, threshold);
    
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('metrics');
    expect(result.data).toHaveLength(testWealthData.length);
    
    // Check that each data point has required properties
    result.data.forEach(point => {
      expect(point).toHaveProperty('wealth');
      expect(point).toHaveProperty('utility');
      expect(point).toHaveProperty('wealthPct');
      expect(point.utility).toBeGreaterThanOrEqual(0);
      expect(point.utility).toBeLessThanOrEqual(1);
    });
    
    // Check metrics
    expect(result.metrics.excess).toBeGreaterThanOrEqual(0);
    expect(result.metrics.gini).toBeGreaterThanOrEqual(0);
    expect(result.metrics.gini).toBeLessThanOrEqual(1);
    expect(result.metrics.palma).toBeGreaterThanOrEqual(0);
    expect(result.metrics.thresholdIndex).toBeGreaterThanOrEqual(-1);
  });

  test('should handle dynamic utility scaling', () => {
    const lowThreshold = 100000;
    const highThreshold = 1000000;
    
    const resultLow = processWealthData(testWealthData, lowThreshold);
    const resultHigh = processWealthData(testWealthData, highThreshold);
    
    // Same wealth point should have different utility values with different thresholds
    const wealthPoint = 500000;
    const dataPointLow = resultLow.data.find(d => d.wealth === wealthPoint);
    const dataPointHigh = resultHigh.data.find(d => d.wealth === wealthPoint);
    
    expect(dataPointLow.utility).not.toEqual(dataPointHigh.utility);
  });
});

// Integration test comparing old vs new calculation
describe('Integration: Old vs New Calculation Logic', () => {
  test('new excess calculation should be more conservative than old flawed method', () => {
    const threshold = 200000;
    
    // New correct method
    const correctExcess = calculateExcessWealth(testWealthData, threshold);
    
    // Old flawed method (for comparison)
    const plateauIndex = testWealthData.findIndex(d => d.wealth >= threshold);
    const oldFlawedExcess = (() => {
      const cumWealth = testWealthData.slice(plateauIndex).reduce((sum, d) => sum + d.wealth, 0) / 1e12;
      const costPlateau = threshold * testWealthData.filter(d => d.wealth <= threshold).length / 1e12;
      return Math.max(0, cumWealth - costPlateau);
    })();
    
    // New method should be more conservative (smaller excess)
    expect(correctExcess).toBeLessThan(oldFlawedExcess);
    expect(correctExcess).toBeGreaterThan(0);
  });
});

// Performance test
describe('Performance', () => {
  test('should handle large datasets efficiently', () => {
    // Generate larger test dataset
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      wealth: Math.pow(i + 1, 2) * 1000 // Exponential wealth distribution
    }));
    
    const startTime = performance.now();
    const result = processWealthData(largeDataset, 500000);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
    expect(result.data).toHaveLength(10000);
    expect(result.metrics.excess).toBeGreaterThan(0);
  });
});

// Example test runner (if not using Jest)
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    testWealthData,
    // Add test functions here if needed
  };
} else {
  // Browser environment - you could run these manually
  console.log('Mathematical calculation tests defined. Use a test runner like Jest to execute them.');
}