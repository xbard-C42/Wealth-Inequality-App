![Project Banner](./banner.jpg)

# Wealth Inequality App

An interactive React application for exploring wealth distribution, the concept of a utility plateau, and the theoretical redistributable excess above a chosen threshold. This tool allows you to visualize diminishing marginal utility, compute inequality metrics, and estimate funding potential for various social interventions.

---

## 🚀 Features

* **Dynamic Utility Curve**: Visualize how marginal utility changes with wealth using a log‑based function that scales to your selected plateau.
* **Corrected Excess-Wealth Calculation**: Accurately computes the sum of `(individual_wealth − threshold)` for all wealth above the plateau, reported in trillions.
* **Inequality Metrics**: Real‑time Gini coefficient and Palma ratio calculations provide context on distribution skew.
* **Intervention Estimates**: Toggle predefined social interventions (homelessness relief, healthcare, poverty alleviation, education) to see how many people/programs could be funded with the redistributable surplus.
* **Modular Calculations**: All core math lives in `calculations.js`, making it easy to test, maintain, and swap in alternative models (e.g., logistic curves, custom exponents).

---

## 🛠️ Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-org/wealth-inequality-app.git
   cd wealth-inequality-app
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm start
   ```
4. Open your browser to [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Usage

1. **Select Plateau**: Drag the slider at the bottom to set your utility plateau (e.g., €10 M, €50 M, €100 M).
2. **View Utility Curve**: The line chart shows `utility = log1p(wealth) / log1p(threshold)`, capped at 1.0.
3. **Check Interventions**: Toggle cost models to estimate how many units of each intervention the redistributable excess could cover.
4. **Read Metrics**: Gini coefficient and Palma ratio update instantly to reflect inequality at your chosen threshold.

---

## 📐 Mathematical Module

All calculations are encapsulated in **`calculations.js`**:

* **`calculateExcessWealth(data, threshold)`**: Returns Σ(wealth − threshold)/1e12.
* **`calculateUtility(wealth, threshold)`**: Returns `min(log1p(wealth)/log1p(threshold), 1)`.
* **`calculateGiniCoefficient(wealthArray)`**: Standard Gini computation.
* **`calculatePalmaRatio(wealthArray)`**: Ratio of top 10% share to bottom 40% share.
* **`processWealthData(rawData, threshold)`**: Returns processed data points and metrics bundle.

Unit tests for these functions live in `calculation_tests.js` and can be run with:

```bash
npm test
```

---

## 🌱 Development

* **Add Real Data**: Populate `wealth-percentiles.json` with real‐world percentile data (OECD, Credit Suisse, WID).
* **Parameter Controls**: Extend UI to include sliders for diminishing‑returns rate or logistic steepness.
* **Visualization Enhancements**: Implement log‑scale x‑axis, histogram overlay, and annotated tooltips.
* **Performance**: Memoize heavy computations and consider lazy loading large datasets.

---

## 🤝 Contributing

1. Fork the repo and create your branch:

   ```bash
   git checkout -b feature/YourFeatureName
   ```
2. Commit your changes and push:

   ```bash
   git commit -m "Add feature: YourFeatureName"
   git push origin feature/YourFeatureName
   ```
3. Open a pull request. We’ll review and merge!

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) and ensure all new features include unit tests.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

*Built with ❤️ by the Wealth Inequality App team*

