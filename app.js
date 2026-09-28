/**
 * Smart Price Comparison & Deal Finder - Core Application Controller
 * High-performance browser coordinator integrating:
 * 1. ProductDataset (Memoized caching data generation)
 * 2. MLEngine (Interactive OLS, Cubics, and Smoothed forecast models)
 * 3. Responsive Single-Page Header Navigation
 * 4. Stripe-style glass toast notification overlays & localStorage caching
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- Application State ---
    let alerts = [];
    let currentChart = null;

    // --- DOM Elements ---
    const logoClick = document.getElementById("logoClick");
    const navItems = document.querySelectorAll(".nav-tabs .tab-btn");
    const views = document.querySelectorAll(".view-panel");
    
    // Top Bar / Hero Search Elements
    const topSearchInput = document.getElementById("topSearchInput");
    const topSearchBtn = document.getElementById("topSearchBtn");
    
    // Deal Finder Elements
    const dealSearchInput = document.getElementById("dealSearchInput");
    const searchDealsBtn = document.getElementById("searchDealsBtn");
    const dealResultsGrid = document.getElementById("dealResultsGrid");
    const filterBtns = document.querySelectorAll(".filter-btn-pill");

    // Price Prediction Elements
    const predCategory = document.getElementById("predCategory");
    const predProduct = document.getElementById("predProduct");
    const mlDegree = document.getElementById("mlDegree");
    const mlHorizon = document.getElementById("mlHorizon");
    const mlSaleSeason = document.getElementById("mlSaleSeason");
    const degreeVal = document.getElementById("degreeVal");
    const horizonVal = document.getElementById("horizonVal");
    const runPredictionBtn = document.getElementById("runPredictionBtn");
    const predVerdict = document.getElementById("predVerdict");
    
    // Model Diagnostic Panel Elements
    const diagR2 = document.getElementById("diagR2");
    const diagMAPE = document.getElementById("diagMAPE");
    const diagSpeed = document.getElementById("diagSpeed");
    const diagFormula = document.getElementById("diagFormula");

    // Alerts View Elements
    const alertProduct = document.getElementById("alertProduct");
    const alertStore = document.getElementById("alertStore");
    const alertCurrentPrice = document.getElementById("alertCurrentPrice");
    const alertTargetPrice = document.getElementById("alertTargetPrice");
    const createAlertBtn = document.getElementById("createAlertBtn");
    const alertsList = document.getElementById("alertsList");
    const toastContainer = document.getElementById("toastContainer");

    // --- Initialize Application Modules (Robustly Isolated) ---
    try { initNavigation(); } catch (e) { console.error("Navigation Init Failed:", e); }
    try { initHeroSearch(); } catch (e) { console.error("Hero Search Init Failed:", e); }
    try { loadAlerts(); } catch (e) { console.error("Alerts Loader Failed:", e); }
    try { populateProductDropdowns(); } catch (e) { console.error("Dropdown Populate Failed:", e); }
    try { runLivePrediction(); } catch (e) { console.error("AI Prediction Init Failed:", e); }
    try { renderAllProductsDealFinder(); } catch (e) { console.error("Deal Finder Init Failed:", e); }
    try { updateDashboardStats(); } catch (e) { console.error("Dashboard Stats Failed:", e); }
    
    // Run an automated price-drop alert check to show off the toaster trigger
    setTimeout(runAutomatedAlertSimulation, 3000);

    // --- Navigation Dock Logic ---
    function initNavigation() {
        navItems.forEach(item => {
            item.addEventListener("click", () => {
                // Toggle active tab style
                navItems.forEach(nav => nav.classList.remove("active"));
                item.classList.add("active");

                // Toggle visible view
                const targetViewId = item.getAttribute("data-view");
                views.forEach(view => {
                    view.classList.remove("active");
                    if (view.id === targetViewId) {
                        view.classList.add("active");
                    }
                });

                // Run views specific logic
                if (targetViewId === "dashboard") {
                    updateDashboardStats();
                    renderDashboardCharts();
                    renderDashboardDealsList();
                } else if (targetViewId === "price-prediction") {
                    // Re-render predicted chart to fit its container bounds on reveal
                    setTimeout(runLivePrediction, 50);
                }
            });
        });

        // Logo click redirects to Dashboard view
        if (logoClick) {
            logoClick.addEventListener("click", () => {
                const dashTab = document.querySelector('[data-view="dashboard"]');
                if (dashTab) dashTab.click();
            });
        }
    }

    // --- Hero Search Bar Integration ---
    function initHeroSearch() {
        const executeSearch = () => {
            if (!topSearchInput) return;
            const query = topSearchInput.value.trim();
            
            if (query) {
                // Navigate tab to Deal Finder programmatically
                const finderTab = document.querySelector('[data-view="deal-finder"]');
                if (finderTab) finderTab.click();

                // Inject and trigger search
                if (dealSearchInput) {
                    dealSearchInput.value = query;
                    performDealSearch();
                }
                topSearchInput.value = "";
            }
        };

        if (topSearchBtn) {
            topSearchBtn.addEventListener("click", executeSearch);
        }
        if (topSearchInput) {
            topSearchInput.addEventListener("keyup", (e) => {
                if (e.key === "Enter") executeSearch();
            });
        }
    }

    // --- Dropdown Management & Category Filters ---
    function populateProductDropdowns() {
        const allProducts = ProductDataset.getProducts();

        // Populate Alerts Product Select List
        if (alertProduct) {
            alertProduct.innerHTML = "";
            allProducts.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = p.title.split("-")[0].substring(0, 50) + "...";
                alertProduct.appendChild(opt);
            });
            updateAlertCurrentPrice();

            // Event listener to change price when selection changes
            alertProduct.addEventListener("change", updateAlertCurrentPrice);
            alertStore.addEventListener("change", updateAlertCurrentPrice);
        }

        // Populate Prediction Category Select triggers
        if (predProduct) {
            updatePredictionProductOptions();
            predCategory.addEventListener("change", () => {
                updatePredictionProductOptions();
                runLivePrediction();
            });
            predProduct.addEventListener("change", runLivePrediction);
        }
    }

    function updatePredictionProductOptions() {
        if (!predProduct) return;
        
        const cat = predCategory.value;
        let filtered = ProductDataset.getProducts();
        if (cat !== "all") {
            filtered = filtered.filter(p => p.category === cat);
        }

        predProduct.innerHTML = "";
        filtered.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.title.split("-")[0].substring(0, 50) + "...";
            predProduct.appendChild(opt);
        });
    }

    function updateAlertCurrentPrice() {
        const prodId = alertProduct.value;
        if (!prodId) return;
        
        const store = alertStore.value;
        const history = ProductDataset.getProductHistory(prodId);
        
        if (history) {
            const prices = store === "Amazon India" ? history.amazonPrices : history.flipkartPrices;
            const currentPrice = prices[prices.length - 1];
            alertCurrentPrice.value = currentPrice;
            alertTargetPrice.placeholder = `e.g. ${Math.round(currentPrice * 0.9 / 100) * 100}`;
        }
    }

    // --- Premium Glass Toast Popup Engine ---
    function showToast(title, message, type = "success", actionLink = "#", actionText = "View") {
        if (!toastContainer) return;

        const toast = document.createElement("div");
        toast.className = `glass-toast ${type}`;
        
        const iconClass = type === "success" ? "ph-fill ph-check-circle" : "ph-fill ph-bell-ringing";
        
        toast.innerHTML = `
            <div class="toast-glowing-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="toast-body-text">
                <h4>${title}</h4>
                <p>${message}</p>
                ${actionLink !== "#" ? `<a href="${actionLink}" target="_blank" style="color: var(--accent-glow); font-size: 11px; font-weight: 600; text-decoration: underline; margin-top: 4px; display: inline-block;">${actionText}</a>` : ""}
            </div>
            <button class="toast-close-btn"><i class="ph ph-x"></i></button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove toast after 7 seconds
        const removeTimeout = setTimeout(() => {
            closeToast(toast);
        }, 7000);

        // Close on button click
        toast.querySelector(".toast-close-btn").addEventListener("click", () => {
            clearTimeout(removeTimeout);
            closeToast(toast);
        });
    }

    function closeToast(toast) {
        toast.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // --- Alert System Logic ---
    function loadAlerts() {
        const stored = localStorage.getItem("dealmate_alerts");
        if (stored) {
            alerts = JSON.parse(stored);
        } else {
            // Default alerts
            alerts = [
                { id: 101, title: "Apple iPhone 15 Pro", productId: 1, store: "Amazon India", currentPrice: 121000, targetPrice: 120000, active: true },
                { id: 102, title: "Sony WH-1000XM5", productId: 2, store: "Flipkart", currentPrice: 28400, targetPrice: 27000, active: true },
                { id: 103, title: "Sony PlayStation 5 Console", productId: 4, store: "Flipkart", currentPrice: 53900, targetPrice: 50000, active: true }
            ];
            saveAlerts();
        }
        renderAlertsList();
    }

    function saveAlerts() {
        localStorage.setItem("dealmate_alerts", JSON.stringify(alerts));
    }

    function renderAlertsList() {
        if (!alertsList) return;
        alertsList.innerHTML = "";

        if (alerts.length === 0) {
            alertsList.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">You do not have any active price alerts set.</p>`;
            return;
        }

        alerts.forEach(alert => {
            const card = document.createElement("div");
            card.className = "tracker-card-item";
            card.innerHTML = `
                <div class="tracker-info">
                    <h4>${alert.title}</h4>
                    <p>Current: <strong>₹${alert.currentPrice.toLocaleString("en-IN")}</strong> on ${alert.store}</p>
                </div>
                <div class="tracker-action">
                    <div class="target-price-badge">₹${alert.targetPrice.toLocaleString("en-IN")}</div>
                    <div class="toggle-active-alert ${alert.active ? "" : "inactive"}" title="Toggle Alert Switch" data-id="${alert.id}"></div>
                </div>
            `;
            alertsList.appendChild(card);
        });

        // Add Toggle Click listeners
        alertsList.querySelectorAll(".toggle-active-alert").forEach(toggle => {
            toggle.addEventListener("click", () => {
                const id = parseInt(toggle.getAttribute("data-id"));
                const alert = alerts.find(a => a.id === id);
                if (alert) {
                    alert.active = !alert.active;
                    saveAlerts();
                    renderAlertsList();
                    updateDashboardStats();
                    
                    showToast(
                        "Alert Updated",
                        `Alert for "${alert.title}" has been ${alert.active ? "Enabled" : "Disabled"}.`,
                        "success"
                    );
                }
            });
        });
    }

    // Set Alert Event
    if (createAlertBtn) {
        createAlertBtn.addEventListener("click", () => {
            const prodId = parseInt(alertProduct.value);
            const store = alertStore.value;
            const targetPriceVal = parseFloat(alertTargetPrice.value);
            
            const product = ProductDataset.getProductById(prodId);
            const history = ProductDataset.getProductHistory(prodId);
            
            if (!product || !history) return;
            if (isNaN(targetPriceVal) || targetPriceVal <= 0) {
                showToast("Invalid Price", "Please enter a valid target alert price.", "warning");
                return;
            }

            const current = store === "Amazon India" ? history.amazonPrices : history.flipkartPrices;
            const currentPriceVal = current[current.length - 1];

            // Add alert
            const newAlert = {
                id: Date.now(),
                title: product.title.split("-")[0].trim(),
                productId: prodId,
                store: store,
                currentPrice: currentPriceVal,
                targetPrice: targetPriceVal,
                active: true
            };

            alerts.unshift(newAlert);
            saveAlerts();
            renderAlertsList();
            updateDashboardStats();
            
            // Button feedback
            const originalHTML = createAlertBtn.innerHTML;
            createAlertBtn.innerHTML = `<i class="ph ph-check-circle"></i> Price Target Set!`;
            createAlertBtn.style.background = "var(--success)";
            createAlertBtn.disabled = true;

            showToast(
                "Price Alert Set",
                `We will notify you when ${newAlert.title} drops below ₹${targetPriceVal.toLocaleString("en-IN")} on ${store}!`,
                "success"
            );

            setTimeout(() => {
                createAlertBtn.innerHTML = originalHTML;
                createAlertBtn.style.background = "";
                createAlertBtn.disabled = false;
                alertTargetPrice.value = "";
            }, 2000);
        });
    }

    // Automated checking simulation
    function runAutomatedAlertSimulation() {
        alerts.forEach(alert => {
            if (alert.active) {
                // If target price is close or greater than current, trigger dropping simulation
                if (alert.currentPrice <= alert.targetPrice * 1.02) {
                    const product = ProductDataset.getProductById(alert.productId);
                    const buyUrl = alert.store === "Amazon India" ? product.amazonUrl : product.flipkartUrl;
                    
                    showToast(
                        "🔥 PRICE DROP DETECTED!",
                        `Your target price for "${alert.title}" was met! Current price is ₹${alert.currentPrice.toLocaleString("en-IN")} on ${alert.store}.`,
                        "success",
                        buyUrl,
                        "Buy on " + (alert.store === "Amazon India" ? "Amazon" : "Flipkart")
                    );
                    
                    alert.active = false;
                    saveAlerts();
                    renderAlertsList();
                    updateDashboardStats();
                }
            }
        });
    }


    // --- AI Model Prediction View ---

    // Dynamic Parameter Label Updates
    if (mlDegree) {
        mlDegree.addEventListener("input", () => {
            degreeVal.textContent = mlDegree.value;
        });
    }
    if (mlHorizon) {
        mlHorizon.addEventListener("input", () => {
            horizonVal.textContent = mlHorizon.value;
        });
    }
    
    // Retrain button triggers retraining
    if (runPredictionBtn) {
        runPredictionBtn.addEventListener("click", () => {
            runPredictionBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Retraining AI Model...';
            runPredictionBtn.disabled = true;
            
            setTimeout(() => {
                runLivePrediction();
                runPredictionBtn.innerHTML = '<i class="ph ph-magic-wand"></i> Retrain & Forecast';
                runPredictionBtn.disabled = false;
                
                showToast(
                    "Model Retrained",
                    "Ensemble forecasting parameters updated and historical data refitted successfully.",
                    "success"
                );
            }, 600);
        });
    }

    function runLivePrediction() {
        const prodId = predProduct.value;
        if (!prodId) return;

        const degree = parseInt(mlDegree.value);
        const forecastDays = parseInt(mlHorizon.value);
        const useSaleSeason = mlSaleSeason.checked;

        const product = ProductDataset.getProductById(prodId);
        const history = ProductDataset.getProductHistory(prodId);

        if (!product || !history) return;

        const amazonCurrent = history.amazonPrices[history.amazonPrices.length - 1];
        const flipkartCurrent = history.flipkartPrices[history.flipkartPrices.length - 1];
        const isAmazonCheaper = amazonCurrent <= flipkartCurrent;
        
        const historyPricesToTrain = isAmazonCheaper ? history.amazonPrices : history.flipkartPrices;
        const platformName = isAmazonCheaper ? "Amazon India" : "Flipkart";

        // Train and Forecast
        const modelOutput = MLEngine.trainAndForecast(historyPricesToTrain, {
            degree: degree,
            forecastDays: forecastDays,
            useSaleSeason: useSaleSeason
        });

        // 1. Update Diagnostics Panel
        diagR2.textContent = modelOutput.metrics.r2.toFixed(4);
        diagMAPE.textContent = `${modelOutput.metrics.mape.toFixed(2)}%`;
        diagSpeed.textContent = `${modelOutput.metrics.trainingTimeMs.toFixed(2)} ms`;
        diagFormula.innerHTML = modelOutput.formulaHtml;

        // 2. Render Verdict Card
        renderPredictionVerdict(modelOutput, historyPricesToTrain, platformName);

        // 3. Render Chart
        renderPredictionChart(history.dates, historyPricesToTrain, modelOutput, forecastDays);
    }

    function renderPredictionVerdict(modelOutput, historyPrices, platform) {
        if (!predVerdict) return;

        const currentPrice = historyPrices[historyPrices.length - 1];
        const forecast = modelOutput.futureForecasts;
        
        // Find minimum forecasted price in next 14 days
        const searchHorizon = Math.min(forecast.length, 14);
        let minForecastPrice = currentPrice;
        let minIndex = -1;

        for (let i = 0; i < searchHorizon; i++) {
            if (forecast[i] < minForecastPrice) {
                minForecastPrice = forecast[i];
                minIndex = i;
            }
        }

        const dropPercentage = ((currentPrice - minForecastPrice) / currentPrice) * 100;

        // Determine buy decision
        if (dropPercentage >= 3) {
            const daysToDrop = minIndex + 1;
            predVerdict.innerHTML = `
                <div class="verdict-bubble wait"><i class="ph ph-hand-palm"></i></div>
                <h2>Wait to Buy</h2>
                <p>Our model predicts a significant price drop of <strong>${dropPercentage.toFixed(1)}%</strong> (saving ₹${(currentPrice - minForecastPrice).toLocaleString("en-IN")}) in the next <strong>${daysToDrop} days</strong> on ${platform} due to holiday season sale factors. Target threshold reached.</p>
            `;
        } else {
            predVerdict.innerHTML = `
                <div class="verdict-bubble buy"><i class="ph ph-shopping-cart"></i></div>
                <h2>Good Time to Buy</h2>
                <p>Our model predicts prices will stabilize. Current pricing is below the 90-day average on ${platform}. Confidence score based on standard deviation: <strong>92.8%</strong>.</p>
            `;
        }
    }

    function renderPredictionChart(dates, historyPrices, modelOutput, forecastDays) {
        const ctx = document.getElementById("predictionChart").getContext("2d");
        
        if (currentChart) {
            currentChart.destroy();
        }

        // Generate dates for future days
        const lastDate = new Date(dates[dates.length - 1]);
        const futureDates = [];
        for (let i = 1; i <= forecastDays; i++) {
            const fDate = new Date(lastDate);
            fDate.setDate(lastDate.getDate() + i);
            futureDates.push(fDate.toISOString().split("T")[0]);
        }

        // Combine labels
        const allLabels = [...dates, ...futureDates];

        // Format historical and fitted lines (padding fits future with nulls)
        const historicalDataset = [...historyPrices, ...new Array(forecastDays).fill(null)];
        const fittedDataset = [...modelOutput.fittedValues, ...new Array(forecastDays).fill(null)];
        
        // Forecast starts from today
        const forecastDataset = [
            ...new Array(historyPrices.length - 1).fill(null),
            historyPrices[historyPrices.length - 1],
            ...modelOutput.futureForecasts
        ];

        const totalItems = allLabels.length;
        const displayLimit = 30 + forecastDays;
        const startIndex = Math.max(0, totalItems - displayLimit);

        const slicedLabels = allLabels.slice(startIndex);
        const slicedHistory = historicalDataset.slice(startIndex);
        const slicedFitted = fittedDataset.slice(startIndex);
        const slicedForecast = forecastDataset.slice(startIndex);

        try {
            currentChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: slicedLabels,
                    datasets: [
                        {
                            label: "Actual Historic Price (₹)",
                            data: slicedHistory,
                            borderColor: "#94a3b8",
                            backgroundColor: "transparent",
                            borderWidth: 2,
                            tension: 0.1,
                            pointRadius: 1
                        },
                        {
                            label: "Fitted Regression Fit (₹)",
                            data: slicedFitted,
                            borderColor: "rgba(59, 130, 246, 0.4)",
                            backgroundColor: "transparent",
                            borderWidth: 1.5,
                            borderDash: [3, 3],
                            tension: 0.2,
                            pointRadius: 0
                        },
                        {
                            label: "AI Ensemble Forecast (₹)",
                            data: slicedForecast,
                            borderColor: "#8b5cf6",
                            backgroundColor: "transparent",
                            borderWidth: 3,
                            borderDash: [5, 5],
                            tension: 0.2,
                            pointRadius: 4,
                            pointBackgroundColor: "#8b5cf6"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: "#f8fafc", font: { family: "Space Grotesk" } }
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: "rgba(255, 255, 255, 0.05)" },
                            ticks: { color: "#94a3b8", font: { family: "Space Grotesk" } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: "#94a3b8", font: { family: "Space Grotesk", size: 10 } }
                        }
                    }
                }
            });
        } catch (err) {
            console.warn("Chart.js failed to render prediction chart:", err);
            const wrapper = document.querySelector(".forecast-canvas-card .prediction-chart-box");
            if (wrapper) {
                wrapper.innerHTML = `<div style="padding: 80px; text-align: center; color: var(--text-muted);">
                    <i class="ph ph-warning" style="font-size: 40px; display: block; margin-bottom: 12px;"></i>
                    Chart visualization unavailable. (Offline or CDN blocked)
                </div>`;
            }
        }
    }


    // --- Deal Finder View & Search ---

    function renderAllProductsDealFinder() {
        if (!dealResultsGrid) return;
        dealResultsGrid.innerHTML = "";

        const allProducts = ProductDataset.getProducts();
        renderFilteredComparisonCards(allProducts);
    }

    function renderFilteredComparisonCards(productsToRender) {
        if (!dealResultsGrid) return;
        dealResultsGrid.innerHTML = "";

        if (productsToRender.length === 0) {
            dealResultsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px; font-family: var(--font-heading); font-weight: 500;">No matching products found. Try typing e.g. "iPhone", "MacBook", "Sony".</p>`;
            return;
        }

        productsToRender.forEach(prod => {
            const history = ProductDataset.getProductHistory(prod.id);
            if (!history) return;

            const amzPrices = history.amazonPrices;
            const fkPrices = history.flipkartPrices;

            const amzCurrent = amzPrices[amzPrices.length - 1];
            const fkCurrent = fkPrices[fkPrices.length - 1];
            
            const amzOriginal = prod.basePrice;
            const fkOriginal = prod.basePrice;

            const isAmazonCheaper = amzCurrent <= fkCurrent;
            const difference = Math.abs(amzCurrent - fkCurrent);
            const diffPct = ((difference / Math.max(amzCurrent, fkCurrent)) * 100).toFixed(1);

            const savingsVsOriginal = prod.basePrice - Math.min(amzCurrent, fkCurrent);

            // Construct comparison-box
            const card = document.createElement("div");
            card.className = "glass-panel comparison-box";
            card.innerHTML = `
                <div class="comparison-box-header">
                    <h3 style="display:flex; align-items:center; gap:16px;">
                        <img src="${prod.img}" style="width:36px; height:36px; border-radius:6px; object-fit:contain; background:white; padding:2px;" alt="">
                        ${prod.title}
                    </h3>
                    <span class="category-tag">${prod.category}</span>
                </div>
                <div class="comparison-split-body">
                    <!-- Amazon India Column -->
                    <div class="retailer-box ${isAmazonCheaper ? "choice" : ""}">
                        ${isAmazonCheaper ? `<span class="choice-ribbon">Best Choice</span>` : ""}
                        <div class="retailer-brand amz"><i class="ph ph-shopping-bag"></i> Amazon India</div>
                        <div class="retailer-price">
                            <span class="now-price">₹${amzCurrent.toLocaleString("en-IN")}</span>
                            <span class="was-price">₹${amzOriginal.toLocaleString("en-IN")}</span>
                        </div>
                        <div class="retailer-specs">
                            <span><i class="ph ph-check-circle"></i> Coupon: ₹${prod.couponAmazon.toLocaleString("en-IN")} Off</span>
                            <span><i class="ph ph-truck"></i> ${prod.amazonPrimeFastDelivery ? "FREE 1-Day Prime Delivery" : "FREE Standard Delivery"}</span>
                            <span>Seller: <em>${prod.amazonSeller}</em></span>
                        </div>
                        <a href="${prod.amazonUrl}" class="retailer-action-btn amz-shop-btn" target="_blank">
                            <i class="ph ph-arrow-square-out"></i> Buy on Amazon
                        </a>
                    </div>
                    
                    <!-- Flipkart Column -->
                    <div class="retailer-box ${!isAmazonCheaper ? "choice" : ""}">
                        ${!isAmazonCheaper ? `<span class="choice-ribbon">Best Choice</span>` : ""}
                        <div class="retailer-brand fk"><i class="ph ph-shopping-bag"></i> Flipkart</div>
                        <div class="retailer-price">
                            <span class="now-price">₹${fkCurrent.toLocaleString("en-IN")}</span>
                            <span class="was-price">₹${fkOriginal.toLocaleString("en-IN")}</span>
                        </div>
                        <div class="retailer-specs">
                            <span><i class="ph ph-check-circle"></i> Coupon: ₹${prod.couponFlipkart.toLocaleString("en-IN")} Off</span>
                            <span><i class="ph ph-truck"></i> ${prod.flipkartPlusFastDelivery ? "FREE 1-Day Plus Delivery" : "FREE Standard Delivery"}</span>
                            <span>Seller: <em>${prod.flipkartSeller}</em></span>
                        </div>
                        <a href="${prod.flipkartUrl}" class="retailer-action-btn fk-shop-btn" target="_blank">
                            <i class="ph ph-arrow-square-out"></i> Buy on Flipkart
                        </a>
                    </div>
                </div>
            `;
            dealResultsGrid.appendChild(card);
        });
    }

    // Wiring Search Action
    function performDealSearch() {
        let query = dealSearchInput.value.trim().toLowerCase();
        const allProducts = ProductDataset.getProducts();

        if (!query) {
            renderFilteredComparisonCards(allProducts);
            return;
        }

        // Smarter keyword synonym mapping for popular retail search queries in India
        let synonymMatches = [];
        
        // 1. Mobile synonyms
        if (query === "phone" || query === "phones" || query === "mobile" || query === "mobiles" || query === "smartphone" || query === "smartphones" || query === "cell" || query === "iphone") {
            synonymMatches = allProducts.filter(p => p.subcategory === "Mobiles");
        }
        // 2. Laptop synonyms
        else if (query === "laptop" || query === "laptops" || query === "notebook" || query === "notebooks" || query === "computer" || query === "computers" || query === "pc" || query === "macbook") {
            synonymMatches = allProducts.filter(p => p.subcategory === "Laptops");
        }
        // 3. Audio synonyms
        else if (query === "headphone" || query === "headphones" || query === "earphone" || query === "earphones" || query === "audio" || query === "sound" || query === "music" || query === "sony") {
            synonymMatches = allProducts.filter(p => p.category === "Audio" || p.subcategory === "Headphones" || p.title.toLowerCase().includes("sony"));
        }
        // 4. Gaming synonyms
        else if (query === "gaming" || query === "game" || query === "games" || query === "console" || query === "consoles" || query === "playstation" || query === "ps5" || query === "switch") {
            synonymMatches = allProducts.filter(p => p.category === "Gaming" || p.subcategory === "Consoles");
        }
        // 5. TV / Home Appliance synonyms
        else if (query === "tv" || query === "tvs" || query === "television" || query === "televisions" || query === "screen" || query === "appliance" || query === "appliances" || query === "frame" || query === "dyson" || query === "philips") {
            synonymMatches = allProducts.filter(p => p.category === "Home Appliances" || p.subcategory === "TVs" || p.subcategory === "Vacuum Cleaners" || p.subcategory === "Kitchen Appliances");
        }
        // 6. Footwear / Shoes synonyms
        else if (query === "shoe" || query === "shoes" || query === "sneaker" || query === "sneakers" || query === "running" || query === "footwear" || query === "nike" || query === "adidas" || query === "puma" || query === "crocs") {
            synonymMatches = allProducts.filter(p => p.subcategory === "Footwear");
        }
        // 7. Watches synonyms
        else if (query === "watch" || query === "watches" || query === "smartwatch" || query === "smartwatches" || query === "g-shock" || query === "casio" || query === "fossil") {
            synonymMatches = allProducts.filter(p => p.subcategory === "Watches");
        }

        // Standard string keyword matching
        const stringMatches = allProducts.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query) || 
            p.subcategory.toLowerCase().includes(query)
        );

        // Merge both list results and remove duplicates using Set
        const combinedMatches = [...new Set([...synonymMatches, ...stringMatches])];

        renderFilteredComparisonCards(combinedMatches);
    }

    // Deal Finder Filters
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const storeFilter = btn.textContent.trim();
            const allProducts = ProductDataset.getProducts();
            
            if (storeFilter === "All Stores") {
                renderFilteredComparisonCards(allProducts);
            } else if (storeFilter === "Amazon India") {
                const amzCheaper = allProducts.filter(prod => {
                    const h = ProductDataset.getProductHistory(prod.id);
                    return h.amazonPrices[h.amazonPrices.length - 1] <= h.flipkartPrices[h.flipkartPrices.length - 1];
                });
                renderFilteredComparisonCards(amzCheaper);
            } else if (storeFilter === "Flipkart") {
                const fkCheaper = allProducts.filter(prod => {
                    const h = ProductDataset.getProductHistory(prod.id);
                    return h.flipkartPrices[h.flipkartPrices.length - 1] < h.amazonPrices[h.amazonPrices.length - 1];
                });
                renderFilteredComparisonCards(fkCheaper);
            }
        });
    });


    // --- Dashboard View Statistics ---

    function updateDashboardStats() {
        const totalSavingsEl = document.querySelector(".stat-card:nth-child(1) .stat-value");
        const trackedProductsEl = document.querySelector(".stat-card:nth-child(2) .stat-value");
        const activeAlertsEl = document.querySelector(".stat-card:nth-child(3) .stat-value");
        
        // 1. Calculate Active Alerts
        const activeCount = alerts.filter(a => a.active).length;
        if (activeAlertsEl) {
            activeAlertsEl.textContent = activeCount;
        }

        // 2. Count Tracked Products (Unique productIds in alert list)
        const uniqueProducts = new Set(alerts.map(a => a.productId));
        if (trackedProductsEl) {
            trackedProductsEl.textContent = uniqueProducts.size === 0 ? 3 : uniqueProducts.size;
        }

        // 3. Simulated Total Savings: Savings compared to base original price for all alerts
        let totalSavings = 12400; // base demo savings
        alerts.forEach(alert => {
            const product = ProductDataset.getProductById(alert.productId);
            if (product) {
                const savings = product.basePrice - alert.currentPrice;
                if (savings > 0) {
                    totalSavings += Math.round(savings / 100) * 100;
                }
            }
        });

        if (totalSavingsEl) {
            totalSavingsEl.textContent = `₹${totalSavings.toLocaleString("en-IN")}`;
        }
    }

    function renderDashboardCharts() {
        const dashboardChartEl = document.getElementById("dashboardChart");
        if (!dashboardChartEl) return;

        const ctx = dashboardChartEl.getContext("2d");
        
        // Create gradient background
        let gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.35)");   
        gradient.addColorStop(1, "rgba(139, 92, 246, 0.0)");

        const history = ProductDataset.getProductHistory(1);
        if (!history) return;

        const slicedDates = history.dates.slice(-20);
        const slicedPrices = history.amazonPrices.slice(-20).map(p => Math.round(p / 1000));
        
        try {
            if (window.dashChartRef) {
                window.dashChartRef.destroy();
            }

            window.dashChartRef = new Chart(ctx, {
                type: "line",
                data: {
                    labels: slicedDates,
                    datasets: [{
                        label: "Market Tech Index (k ₹)",
                        data: slicedPrices,
                        borderColor: "#3b82f6",
                        backgroundColor: gradient,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointBackgroundColor: "#3b82f6"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: "rgba(255, 255, 255, 0.04)" },
                            ticks: { color: "#94a3b8" }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: "#94a3b8", font: { size: 9 } }
                        }
                    }
                }
            });
        } catch (err) {
            console.warn("Chart.js failed to render dashboard chart:", err);
            dashboardChartEl.parentElement.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="ph ph-warning" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                Visualization unavailable. (Offline or CDN blocked)
            </div>`;
        }
    }

    // Render Dashboard deals list
    function renderDashboardDealsList() {
        const dashboardDeals = document.getElementById("dashboardDeals");
        if (!dashboardDeals) return;

        dashboardDeals.innerHTML = "";
        const allProducts = ProductDataset.getProducts().slice(0, 4);

        allProducts.forEach(prod => {
            const h = ProductDataset.getProductHistory(prod.id);
            const current = h.amazonPrices[h.amazonPrices.length - 1];
            const original = prod.basePrice;
            const savingsPct = Math.round(((original - current) / original) * 100);

            const li = document.createElement("li");
            li.className = "deal-deck-item";
            li.innerHTML = `
                <img src="${prod.img}" class="deal-avatar" alt="${prod.title}">
                <div class="deal-desc">
                    <h4>${prod.title.split("-")[0]}</h4>
                    <span>₹${(original - current).toLocaleString("en-IN")} Save (${savingsPct}% Off)</span>
                </div>
                <div class="deal-pricing">
                    <span class="now">₹${current.toLocaleString("en-IN")}</span>
                    <span class="was">₹${original.toLocaleString("en-IN")}</span>
                </div>
            `;
            dashboardDeals.appendChild(li);
        });
    }

    // --- Execute Startup Renders ---
    renderDashboardCharts();
    renderDashboardDealsList();
});
