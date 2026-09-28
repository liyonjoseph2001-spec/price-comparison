/**
 * Smart Price Comparison & Deal Finder - Machine Learning Engine
 * Implements mathematical models and time-series algorithms from scratch:
 * 1. Ordinary Least Squares (OLS) Linear Regression
 * 2. Polynomial Regression (Degree 1, 2, 3) using Gaussian Elimination matrix solvers
 * 3. Holt's Linear Exponential Smoothing (Double ES)
 * 4. E-Commerce Seasonality Ensemble forecasting model
 * 5. Analytical metrics calculation (R^2 Coefficient of Determination & MAPE Error)
 */

const MLEngine = (function() {

    // --- Core Linear Algebra Solvers ---

    /**
     * Solves a system of linear equations Ax = B using Gaussian Elimination with partial pivoting.
     * @param {Array<Array<number>>} A Coefficient matrix (size N x N)
     * @param {Array<number>} B Const vector (size N)
     * @returns {Array<number>} Solution vector x (size N)
     */
    function solveGaussianElimination(A, B) {
        const n = B.length;
        
        // Clone matrices to avoid side effects
        const M = A.map((row, i) => [...row, B[i]]);

        for (let i = 0; i < n; i++) {
            // Find pivot row
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
                    maxRow = k;
                }
            }

            // Swap maximum row with current row
            const temp = M[i];
            M[i] = M[maxRow];
            M[maxRow] = temp;

            // Check for singular matrix
            if (Math.abs(M[i][i]) < 1e-12) {
                throw new Error("Matrix is singular or near-singular. Cannot solve accurately.");
            }

            // Eliminate columns below
            for (let k = i + 1; k < n; k++) {
                const factor = M[k][i] / M[i][i];
                for (let j = i; j <= n; j++) {
                    M[k][j] -= factor * M[i][j];
                }
            }
        }

        // Back substitution
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = M[i][n];
            for (let j = i + 1; j < n; j++) {
                sum -= M[i][j] * x[j];
            }
            x[i] = sum / M[i][i];
        }

        return x;
    }

    // --- Regression Solvers ---

    /**
     * Fits a polynomial of specified degree to the x and y data.
     * Polynomial formula: y = a_d * x^d + ... + a_1 * x^1 + a_0
     * @param {Array<number>} x Explanatory values (e.g. time index 0, 1, 2...)
     * @param {Array<number>} y Dependent values (e.g. price history)
     * @param {number} degree Polynomial degree (e.g. 1, 2, or 3)
     * @returns {Object} { coefficients: [a_0, a_1, ...], fit(x_val) }
     */
    function fitPolynomialRegression(x, y, degree) {
        const N = x.length;
        const matrixSize = degree + 1;
        
        // 1. Initialize empty systems for Normal Equation X^T * X * A = X^T * Y
        const A = Array.from({ length: matrixSize }, () => new Array(matrixSize).fill(0));
        const B = new Array(matrixSize).fill(0);

        // 2. Compute powers of x sums
        const xSums = new Array(2 * degree + 1).fill(0);
        for (let power = 0; power <= 2 * degree; power++) {
            let sum = 0;
            for (let i = 0; i < N; i++) {
                sum += Math.pow(x[i], power);
            }
            xSums[power] = sum;
        }

        // 3. Populate matrix A
        for (let r = 0; r < matrixSize; r++) {
            for (let c = 0; c < matrixSize; c++) {
                A[r][c] = xSums[r + c];
            }
        }

        // 4. Populate B vector
        for (let r = 0; r < matrixSize; r++) {
            let sum = 0;
            for (let i = 0; i < N; i++) {
                sum += y[i] * Math.pow(x[i], r);
            }
            B[r] = sum;
        }

        // 5. Solve equations for coefficients [a_0, a_1, ... a_degree]
        let coefficients;
        try {
            coefficients = solveGaussianElimination(A, B);
        } catch (err) {
            // Fallback to Linear regression (degree 1) if degree 2/3 fails numerically
            if (degree > 1) {
                return fitPolynomialRegression(x, y, 1);
            }
            // If linear fails, construct horizontal line based on mean
            const meanY = y.reduce((s, v) => s + v, 0) / N;
            coefficients = [meanY, 0];
        }

        // 6. Define prediction equation evaluator
        const fit = function(xVal) {
            let predictedVal = 0;
            for (let power = 0; power < coefficients.length; power++) {
                predictedVal += coefficients[power] * Math.pow(xVal, power);
            }
            return predictedVal;
        };

        return {
            coefficients,
            fit
        };
    }

    // --- Holt's Linear Exponential Smoothing (Double ES) ---

    /**
     * Applies Holt's double exponential smoothing to model level and trend.
     * Ideal for capturing momentum and adaptive trends in price history.
     * @param {Array<number>} data Historical prices
     * @param {number} alpha Level smoothing coefficient (0 < alpha < 1)
     * @param {number} beta Trend smoothing coefficient (0 < beta < 1)
     * @returns {Object} { level[], trend[], forecast(horizon) }
     */
    function fitHoltsSmoothing(data, alpha = 0.2, beta = 0.1) {
        const N = data.length;
        if (N < 2) return { level: [data[0]], trend: [0], forecast: (h) => data[0] };

        const level = new Array(N).fill(0);
        const trend = new Array(N).fill(0);

        // Initialization
        level[0] = data[0];
        trend[0] = data[1] - data[0]; // Initial velocity

        for (let t = 1; t < N; t++) {
            level[t] = alpha * data[t] + (1 - alpha) * (level[t-1] + trend[t-1]);
            trend[t] = beta * (level[t] - level[t-1]) + (1 - beta) * trend[t-1];
        }

        const lastLevel = level[N - 1];
        const lastTrend = trend[N - 1];

        return {
            level,
            trend,
            forecast: function(h) {
                return lastLevel + (h * lastTrend);
            }
        };
    }

    // --- Performance Metrics ---

    /**
     * Computes R^2 (Coefficient of Determination) and MAPE (Mean Absolute Percentage Error)
     * @param {Array<number>} actual Actual prices
     * @param {Array<number>} predicted Predicted prices for same indices
     * @returns {Object} { r2, mape }
     */
    function calculateMetrics(actual, predicted) {
        const N = actual.length;
        const meanActual = actual.reduce((sum, v) => sum + v, 0) / N;

        let ssResiduals = 0;
        let ssTotal = 0;
        let sumAbsolutePercentageError = 0;

        for (let i = 0; i < N; i++) {
            const diff = actual[i] - predicted[i];
            ssResiduals += diff * diff;

            const meanDiff = actual[i] - meanActual;
            ssTotal += meanDiff * meanDiff;

            sumAbsolutePercentageError += Math.abs(diff / actual[i]);
        }

        // R^2 score: bounded by 1.0 (perfect fit). Cap bottom at 0 for poor fits
        const r2 = ssTotal === 0 ? 0 : Math.max(0, 1 - (ssResiduals / ssTotal));
        const mape = (sumAbsolutePercentageError / N) * 100;

        return {
            r2: parseFloat(r2.toFixed(4)),
            mape: parseFloat(mape.toFixed(2))
        };
    }

    // --- Ensemble Forecaster with Seasonality Multipliers ---

    /**
     * E-Commerce forecasting combining Polynomial Regression, Holt's ES, and simulated Sale Drops.
     */
    return {
        /**
         * Trains models and forecasts next N days.
         * @param {Array<number>} history Historical price data (e.g. 90 data points)
         * @param {Object} options Parameters { degree: 2, forecastDays: 30, useSaleSeason: true }
         * @returns {Object} Full prediction metrics, history fit, future forecasts
         */
        trainAndForecast: function(history, options = {}) {
            const startTime = performance.now();
            
            const degree = options.degree || 2;
            const forecastDays = options.forecastDays || 30;
            const useSaleSeason = options.hasOwnProperty('useSaleSeason') ? options.useSaleSeason : true;
            
            const N = history.length;
            
            // X-axes time indices: [0, 1, 2 ... N-1]
            const xIndices = Array.from({ length: N }, (_, i) => i);
            
            // 1. Train Polynomial Model
            const polyModel = fitPolynomialRegression(xIndices, history, degree);
            const polyFittedValues = xIndices.map(x => polyModel.fit(x));
            
            // 2. Train Holt's Double Smoothing
            const holtsModel = fitHoltsSmoothing(history, 0.25, 0.15);
            
            // 3. Compute training fit (ensemble of 70% Poly + 30% Holt's for in-sample)
            const fittedValues = xIndices.map((x, i) => {
                // Holt's smoothing represents current trends, poly represents overall cycle
                return Math.round((polyFittedValues[i] * 0.7) + (holtsModel.level[i] * 0.3));
            });

            // Calculate historical training metrics
            const metrics = calculateMetrics(history, fittedValues);
            
            // 4. Generate Future Forecasts (Day N to Day N + forecastDays - 1)
            const futureForecasts = [];
            
            for (let h = 1; h <= forecastDays; h++) {
                const futureX = (N - 1) + h;
                
                // Base prediction from ensemble: 60% Poly Trend + 40% Holt's Level momentum
                const polyPred = polyModel.fit(futureX);
                const holtPred = holtsModel.forecast(h);
                let ensemblePred = (polyPred * 0.6) + (holtPred * 0.4);
                
                // 5. Seasonality adjustments (Simulating an upcoming Indian festival sale!)
                // Let's assume a major e-commerce event is scheduled around 12 to 20 days in the future
                if (useSaleSeason) {
                    const saleStartDay = 12;
                    const salePeakDay = 16;
                    const saleEndDay = 21;
                    
                    if (h >= saleStartDay && h <= saleEndDay) {
                        // Apply deep bell-curve drop peaking at 12% off
                        let saleEffect = 0;
                        if (h <= salePeakDay) {
                            // Growing discount
                            const progress = (h - saleStartDay) / (salePeakDay - saleStartDay);
                            saleEffect = 0.12 * progress;
                        } else {
                            // Recovering price
                            const progress = (saleEndDay - h) / (saleEndDay - salePeakDay);
                            saleEffect = 0.12 * progress;
                        }
                        
                        // Apply discount drop to prediction
                        ensemblePred *= (1 - saleEffect);
                    }
                }
                
                // Clamp to reasonable boundaries (no negative prices, minimum 10% of base)
                const baseAvg = history.reduce((s, v) => s + v, 0) / N;
                const minPrice = baseAvg * 0.4;
                const maxPrice = baseAvg * 1.6;
                ensemblePred = Math.max(minPrice, Math.min(maxPrice, ensemblePred));
                
                futureForecasts.push(Math.round(ensemblePred / 10) * 10);
            }
            
            const trainingTime = parseFloat((performance.now() - startTime).toFixed(2));
            
            // Generate mathematical formula string for visual diagnostics
            let formulaHtml = "y = ";
            const coefs = polyModel.coefficients;
            for (let p = coefs.length - 1; p >= 0; p--) {
                const sign = coefs[p] >= 0 ? (p === coefs.length - 1 ? "" : " + ") : " - ";
                const val = Math.abs(coefs[p]).toFixed(p === 0 ? 1 : 4);
                
                if (p === 0) {
                    formulaHtml += `${sign}${val}`;
                } else if (p === 1) {
                    formulaHtml += `${sign}${val}t`;
                } else {
                    formulaHtml += `${sign}${val}t<sup>${p}</sup>`;
                }
            }
            
            return {
                fittedValues,
                futureForecasts,
                metrics,
                trainingTimeMs: trainingTime,
                coefficients: coefs,
                formulaHtml: formulaHtml
            };
        }
    };
})();

// Export for ES6 modules compatibility or attach to global scope
if (typeof window !== 'undefined') {
    window.MLEngine = MLEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLEngine;
}
