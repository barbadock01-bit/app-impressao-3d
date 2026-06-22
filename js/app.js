// Main Controller for the 3D Printing Sales App - Loaded Globally (No modules)

// State variables
let productsList = [];
let salesList = [];
let monthlyGoal = 1500.00;
let salesChart = null;

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialise database (Firebase or LocalStorage)
    const dbStatus = await window.db.init();
    updateDbStatusUI(dbStatus);

    // 2. Setup Firebase Authentication Listeners
    setupFirebaseAuthState();

    // 3. Setup Navigation & Core Events
    setupNavigation();
    setupThemeToggle();
    setupFirebaseSettings();
    setupGoalSettings();

    // 4. Setup Agent Tabs Logic
    initConsultantTab();
    initSeoTab();
    initCalculatorTab();
    initInventoryTab();

    // Initialize lucide icons if available
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

// Refresh all local lists from the active DB
async function reloadData() {
    productsList = await window.db.getProducts();
    salesList = await window.db.getSales();
    monthlyGoal = await window.db.getGoal();
}

function updateDbStatusUI(status) {
    const statusEl = document.getElementById('db-status-badge');
    if (!statusEl) return;
    
    if (status === 'firebase') {
        statusEl.className = 'db-status firebase';
        statusEl.innerHTML = '<i class="lucide-cloud"></i> Firebase Nuvem';
    } else {
        statusEl.className = 'db-status local';
        statusEl.innerHTML = '<i class="lucide-database"></i> LocalStorage (Offline)';
    }
    if (window.lucide) window.lucide.createIcons();
}

// ----------------------------------------------------
// Firebase Auth Integration (Google Login)
// ----------------------------------------------------
function setupFirebaseAuthState() {
    const loginScreen = document.getElementById('login-screen');
    const googleLoginBtn = document.getElementById('btn-google-login');
    const userProfileSidebar = document.getElementById('user-profile-sidebar');
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('btn-logout');

    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK não carregado. Pulando fluxo de autenticação.");
        if (loginScreen) loginScreen.style.display = 'none';
        reloadData().then(() => {
            updateDashboard();
        });
        return;
    }

    // Ouvinte do estado de autenticação do Firebase
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log("Usuário autenticado:", user.displayName, user.email);
            
            // Set user UID in database
            window.db.setUserId(user.uid);
            
            // Hide login screen
            if (loginScreen) loginScreen.style.display = 'none';
            
            // Show user profile in sidebar
            if (userProfileSidebar) userProfileSidebar.style.display = 'flex';
            if (userNameEl) userNameEl.textContent = user.displayName || user.email.split('@')[0];
            if (userAvatarEl) {
                userAvatarEl.src = user.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c';
            }

            // Load user data and render UI
            await reloadData();
            updateDashboard();
            renderInventoryTables();
            
            // Pre-fill goal value in settings
            const goalInput = document.getElementById('settings-goal-val');
            if (goalInput) goalInput.value = monthlyGoal.toFixed(2);
            
        } else {
            console.log("Nenhum usuário conectado.");
            
            // Set DB state to local or prompt login
            window.db.setUserId(null);
            
            // Show login screen
            if (loginScreen) loginScreen.style.display = 'flex';
            
            // Hide user profile in sidebar
            if (userProfileSidebar) userProfileSidebar.style.display = 'none';
        }
    });

    // Evento de clique para Login com Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            // Tenta abrir pop-up de autenticação
            firebase.auth().signInWithPopup(provider).catch(error => {
                console.error("Erro no pop-up de login do Google, tentando redirecionamento:", error);
                // Fallback para login via redirecionamento caso bloqueado
                firebase.auth().signInWithRedirect(provider);
            });
        });
    }

    // Evento de clique para Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Deseja realmente sair da sua conta?")) {
                firebase.auth().signOut().then(() => {
                    console.log("Sessão encerrada.");
                }).catch(err => {
                    console.error("Erro ao encerrar sessão:", err);
                });
            }
        });
    }
}

// ----------------------------------------------------
// Navigation & Theme
// ----------------------------------------------------
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitleEl = document.getElementById('page-title-text');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            if (!targetTab) return;

            // Update navigation UI
            navItems.forEach(nav => nav.classList.remove('active'));
            // Seleciona tanto item da sidebar quanto do mobile nav correspondente
            document.querySelectorAll(`[data-tab="${targetTab}"]`).forEach(el => el.classList.add('active'));

            // Show target panel
            tabPanes.forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');

            // Update Header Title
            const tabNames = {
                'dashboard': 'Painel de Métricas',
                'consultor': 'Agente 1 - Consultor de Produtos',
                'seo': 'Agente 2 - Otimizador SEO Automático',
                'calculadora': 'Agente 3 - Calculadora de Preços',
                'produtos': 'Inventário & Vendas',
                'configuracoes': 'Configurações do Sistema'
            };
            if (pageTitleEl) pageTitleEl.textContent = tabNames[targetTab] || 'Gestão 3D';

            // Refresh specific charts/components when switching tabs
            if (targetTab === 'dashboard') {
                updateDashboard();
            } else if (targetTab === 'produtos') {
                renderInventoryTables();
            }
        });
    });
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const isDark = localStorage.getItem('theme_dark') === 'true';

    if (isDark) {
        document.body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="lucide-sun"></i> Mudar para Claro';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentlyDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme_dark', currentlyDark);
            toggleBtn.innerHTML = currentlyDark 
                ? '<i class="lucide-sun"></i> Mudar para Claro' 
                : '<i class="lucide-moon"></i> Mudar para Escuro';
            if (window.lucide) window.lucide.createIcons();
            
            // Re-render chart to adjust colors in dark mode if active
            if (document.getElementById('dashboard').classList.contains('active')) {
                renderSalesChart();
            }
        });
    }
}

// ----------------------------------------------------
// Dashboard Rendering
// ----------------------------------------------------
function updateDashboard() {
    // Determine current month in YYYY-MM
    const today = new Date();
    const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Filter current month sales
    const currentMonthSales = salesList.filter(sale => sale.date.startsWith(currentMonthPrefix));

    // Calculate revenue & profit
    const monthlyRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const monthlyProfit = currentMonthSales.reduce((sum, sale) => sum + sale.profit, 0);

    // Update numbers
    document.getElementById('dash-revenue').textContent = formatCurrency(monthlyRevenue);
    document.getElementById('dash-profit').textContent = formatCurrency(monthlyProfit);
    document.getElementById('dash-products-count').textContent = productsList.length;

    // Update Sales Goal
    document.getElementById('dash-goal-text').textContent = formatCurrency(monthlyGoal);
    const goalPct = Math.min((monthlyRevenue / monthlyGoal) * 100, 100);
    const progressBar = document.getElementById('dash-goal-fill');
    if (progressBar) {
        progressBar.style.width = `${goalPct.toFixed(1)}%`;
    }
    document.getElementById('dash-goal-pct').textContent = `${goalPct.toFixed(0)}%`;

    // Render/Update Chart
    renderSalesChart();
}

function renderSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Group sales by month
    const monthlyData = {};
    
    // Assegura que Maio e Junho apareçam mesmo vazios
    const monthsToShow = [];
    const today = new Date();
    for (let i = 2; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthsToShow.push(k);
        monthlyData[k] = { revenue: 0, profit: 0 };
    }

    salesList.forEach(sale => {
        const key = sale.date.substring(0, 7); // "YYYY-MM"
        if (monthlyData[key] !== undefined) {
            monthlyData[key].revenue += sale.totalPrice;
            monthlyData[key].profit += sale.profit;
        } else {
            // Se for de outro mês anterior
            monthlyData[key] = { revenue: sale.totalPrice, profit: sale.profit };
            if (!monthsToShow.includes(key)) monthsToShow.push(key);
        }
    });

    const sortedMonths = monthsToShow.sort();
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: '2-digit' });
    });

    const revenues = sortedMonths.map(m => monthlyData[m].revenue);
    const profits = sortedMonths.map(m => monthlyData[m].profit);

    if (salesChart) {
        salesChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textThemeColor = isDark ? '#94a3b8' : '#64748b';
    const gridThemeColor = isDark ? '#334155' : '#e2e8f0';

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Faturamento Bruto (R$)',
                    data: revenues,
                    backgroundColor: '#2563eb',
                    borderColor: '#1d4ed8',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Lucro Líquido (R$)',
                    data: profits,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: gridThemeColor },
                    ticks: { color: textThemeColor }
                },
                y: {
                    grid: { color: gridThemeColor },
                    ticks: { 
                        color: textThemeColor,
                        callback: function(value) { return 'R$ ' + value; }
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: { color: textThemeColor }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: R$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// ----------------------------------------------------
// Agent 1: Product Consultant Tab
// ----------------------------------------------------
function initConsultantTab() {
    const chipsCat = document.querySelectorAll('#consultant-cats .filter-chip');
    const chipsGoal = document.querySelectorAll('#consultant-goals .filter-chip');
    
    let activeCat = 'all';
    let activeGoal = 'all';

    const renderRecommendations = () => {
        const { commentary, products } = window.consultantAgent.getRecommendations(activeCat, activeGoal);
        
        // Render commentary
        document.getElementById('consultant-comment').innerHTML = commentary;

        // Render product cards
        const container = document.getElementById('consultant-products-container');
        container.innerHTML = '';

        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const badgeClass = p.filamentType.toLowerCase();
            const demandText = p.demand === 'high' ? 'Alta' : p.demand === 'medium' ? 'Média' : 'Nicho';
            const demandDot = p.demand === 'high' ? 'high' : p.demand === 'medium' ? 'medium' : 'low';
            
            card.innerHTML = `
                <div class="product-card-header">
                    <div>
                        <h4 class="product-title">${p.name}</h4>
                        <span class="product-category">${p.category}</span>
                    </div>
                    <span class="tag-badge ${badgeClass}">${p.filamentType}</span>
                </div>
                <div class="product-card-body">
                    <div class="metric-row">
                        <span class="metric-label">Peso Estimado:</span>
                        <span class="metric-val">${p.weight}g</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Tempo na A1:</span>
                        <span class="metric-val">${p.printTime}h</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Dificuldade:</span>
                        <span class="metric-val">${p.difficulty}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Preço Sugerido:</span>
                        <span class="metric-val">${formatCurrency(p.marketMin)} - ${formatCurrency(p.marketMax)}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Demanda Geral:</span>
                        <span class="demand-indicator">
                            <span class="demand-dot ${demandDot}"></span>
                            ${demandText}
                        </span>
                    </div>
                    <div class="bambu-info-tag">
                        <i class="lucide-zap"></i>
                        <span>${p.bambuA1Specs}</span>
                    </div>
                </div>
                <div class="product-card-footer">
                    <button class="btn btn-primary btn-calc-from-sug" style="flex-grow:1; font-size:0.8rem; padding:8px;">
                        <i class="lucide-calculator"></i> Precificar Peça
                    </button>
                    <button class="btn btn-outline btn-seo-from-sug" style="font-size:0.8rem; padding:8px;" title="Gerar SEO">
                        <i class="lucide-search"></i> SEO
                    </button>
                </div>
            `;

            // Bind click to start pricing calculator
            card.querySelector('.btn-calc-from-sug').addEventListener('click', () => {
                goToCalculatorTab(p);
            });

            // Bind click to start SEO optimizer
            card.querySelector('.btn-seo-from-sug').addEventListener('click', () => {
                goToSeoTab(p);
            });

            container.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    };

    // Category filtering
    chipsCat.forEach(chip => {
        chip.addEventListener('click', () => {
            chipsCat.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCat = chip.getAttribute('data-cat');
            renderRecommendations();
        });
    });

    // Strategy filtering
    chipsGoal.forEach(chip => {
        chip.addEventListener('click', () => {
            chipsGoal.forEach(g => g.classList.remove('active'));
            chip.classList.add('active');
            activeGoal = chip.getAttribute('data-goal');
            renderRecommendations();
        });
    });

    // Initial render
    renderRecommendations();
}

function goToCalculatorTab(productData) {
    // Pre-fill inputs
    document.getElementById('calc-product-name').value = productData.name;
    document.getElementById('calc-category').value = productData.category;
    document.getElementById('calc-filament-type').value = productData.filamentType;
    document.getElementById('calc-weight').value = productData.weight;
    
    // Converte horas decimais para horas/minutos
    const decHours = productData.printTime;
    const hours = Math.floor(decHours);
    const minutes = Math.round((decHours - hours) * 60);
    document.getElementById('calc-time-h').value = hours;
    document.getElementById('calc-time-m').value = minutes;

    // Trigger update logic
    triggerCalculatorRecalculate();

    // Click navigation tab
    document.querySelector('[data-tab="calculadora"]').click();
}

function goToSeoTab(productData) {
    document.getElementById('seo-base-name').value = productData.name;
    document.getElementById('seo-material').value = productData.filamentType;
    document.getElementById('seo-color').value = 'Silk Metálico';
    document.getElementById('seo-highlights').value = 'Brinquedo Articulado, Anti Estresse, Enfeite';

    // Auto-generate
    document.getElementById('btn-generate-seo').click();

    // Navigate tab
    document.querySelector('[data-tab="seo"]').click();
}

// ----------------------------------------------------
// Agent 2: SEO Optimizer Tab
// ----------------------------------------------------
function initSeoTab() {
    const btnGenerate = document.getElementById('btn-generate-seo');
    if (!btnGenerate) return;

    btnGenerate.addEventListener('click', () => {
        const baseName = document.getElementById('seo-base-name').value.trim();
        const material = document.getElementById('seo-material').value;
        const color = document.getElementById('seo-color').value.trim();
        const highlights = document.getElementById('seo-highlights').value.trim();
        const extraInfo = document.getElementById('seo-extra-info').value.trim();

        if (!baseName) {
            alert('Por favor, informe o nome base do produto!');
            return;
        }

        // Call SEO calculations
        const titles = window.seoAgent.generateTitles(baseName, material, color, highlights);
        const description = window.seoAgent.generateDescription(baseName, material, color, highlights, extraInfo);
        const details = window.seoAgent.suggestCategories(baseName);

        // Update UI Results
        document.getElementById('seo-ml-title').textContent = titles.mercadoLivre;
        document.getElementById('seo-ml-count').textContent = `${titles.mercadoLivre.length}/60 carac.`;
        
        document.getElementById('seo-shopee-title').textContent = titles.shopee;
        document.getElementById('seo-shopee-count').textContent = `${titles.shopee.length}/60 carac.`;

        document.getElementById('seo-desc').textContent = description;
        document.getElementById('seo-ml-cat').textContent = details.mercadoLivre;
        document.getElementById('seo-shopee-cat').textContent = details.shopee;

        // Render Tags
        const tagsContainer = document.getElementById('seo-tags-container');
        tagsContainer.innerHTML = '';
        details.tags.forEach(t => {
            const span = document.createElement('span');
            span.className = 'tag-item';
            span.textContent = `#${t}`;
            tagsContainer.appendChild(span);
        });

        // Show result box
        document.getElementById('seo-results-wrapper').style.display = 'block';

        // Setup Copy buttons
        setupCopyButton('btn-copy-ml-title', titles.mercadoLivre);
        setupCopyButton('btn-copy-shopee-title', titles.shopee);
        setupCopyButton('btn-copy-desc', description);
    });
}

function setupCopyButton(btnId, textToCopy) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    // Remove old listeners to avoid multiple fires
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHtml = newBtn.innerHTML;
            newBtn.className = 'btn btn-success';
            newBtn.innerHTML = '<i class="lucide-check"></i> Copiado!';
            setTimeout(() => {
                newBtn.className = 'btn btn-outline';
                newBtn.innerHTML = originalHtml;
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error("Falha ao copiar", err);
        });
    });
    if (window.lucide) window.lucide.createIcons();
}

// ----------------------------------------------------
// Agent 3: Price Calculator Tab
// ----------------------------------------------------
function initCalculatorTab() {
    const calcInputs = [
        'calc-spool-cost', 'calc-spool-weight', 'calc-weight',
        'calc-time-h', 'calc-time-m', 'calc-energy-consumption',
        'calc-energy-tariff', 'calc-depreciation', 'calc-extras'
    ];

    calcInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', triggerCalculatorRecalculate);
        }
    });

    const categorySelect = document.getElementById('calc-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', triggerCalculatorRecalculate);
    }

    // Custom margin slider binding
    const slider = document.getElementById('calc-margin-slider');
    const sliderVal = document.getElementById('calc-margin-slider-value');
    if (slider) {
        slider.addEventListener('input', () => {
            const val = slider.value;
            if (sliderVal) sliderVal.textContent = `${val}%`;
            triggerCalculatorRecalculate();
        });
    }

    // Save product action button
    const btnSave = document.getElementById('btn-save-calc-product');
    if (btnSave) {
        btnSave.addEventListener('click', handleSaveCalculatedProduct);
    }

    // Initial load
    triggerCalculatorRecalculate();
}

function triggerCalculatorRecalculate() {
    const spoolCost = parseFloat(document.getElementById('calc-spool-cost').value) || 120.00;
    const spoolWeight = parseFloat(document.getElementById('calc-spool-weight').value) || 1000;
    const printWeight = parseFloat(document.getElementById('calc-weight').value) || 0;
    
    const timeH = parseInt(document.getElementById('calc-time-h').value) || 0;
    const timeM = parseInt(document.getElementById('calc-time-m').value) || 0;
    const totalTimeHours = timeH + (timeM / 60);

    const energyConsumption = parseFloat(document.getElementById('calc-energy-consumption').value) || 0.1;
    const energyTariff = parseFloat(document.getElementById('calc-energy-tariff').value) || 0.8;
    const depreciation = parseFloat(document.getElementById('calc-depreciation').value) || 1.5;
    const extras = parseFloat(document.getElementById('calc-extras').value) || 0;

    // Calculate Costs
    const costResults = window.calculatorAgent.calculateCosts({
        filamentSpoolCost: spoolCost,
        filamentSpoolWeight: spoolWeight,
        printWeight: printWeight,
        printTimeHours: totalTimeHours,
        energyConsumptionKw: energyConsumption,
        energyTariffKwh: energyTariff,
        depreciationPerHour: depreciation,
        extrasCost: extras
    });

    // Update Cost Breakdowns
    document.getElementById('cost-breakdown-filament').textContent = formatCurrency(costResults.filamentCost);
    document.getElementById('cost-breakdown-energy').textContent = formatCurrency(costResults.energyCost);
    document.getElementById('cost-breakdown-depreciation').textContent = formatCurrency(costResults.depreciationCost);
    document.getElementById('cost-breakdown-extras').textContent = formatCurrency(costResults.extrasCost);
    document.getElementById('cost-breakdown-total').textContent = formatCurrency(costResults.totalProductionCost);

    // Sugestão Rápida (40%, 50%, 60%)
    const suggestions = window.calculatorAgent.suggestPrices(costResults.totalProductionCost);
    
    document.getElementById('sug-price-40').textContent = formatCurrency(suggestions.margin40.price);
    document.getElementById('sug-profit-40').textContent = `Lucro: ${formatCurrency(suggestions.margin40.profit)}`;

    document.getElementById('sug-price-50').textContent = formatCurrency(suggestions.margin50.price);
    document.getElementById('sug-profit-50').textContent = `Lucro: ${formatCurrency(suggestions.margin50.profit)}`;

    document.getElementById('sug-price-60').textContent = formatCurrency(suggestions.margin60.price);
    document.getElementById('sug-profit-60').textContent = `Lucro: ${formatCurrency(suggestions.margin60.profit)}`;

    // Set margin click event to quick pre-populate custom slider
    setupQuickMarginCard('card-sug-40', 40);
    setupQuickMarginCard('card-sug-50', 50);
    setupQuickMarginCard('card-sug-60', 60);

    // Custom pricing calculation based on slider
    const currentSliderVal = parseInt(document.getElementById('calc-margin-slider').value) || 50;
    const customPriceResult = window.calculatorAgent.calculateCustomPrice(costResults.totalProductionCost, currentSliderVal);

    // Update Output Selling Price
    document.getElementById('calc-selling-price-out').textContent = formatCurrency(customPriceResult.price);
    document.getElementById('calc-profit-out').textContent = formatCurrency(customPriceResult.profit);

    // Market Comparison
    const category = document.getElementById('calc-category').value;
    const marketComp = window.calculatorAgent.compareWithMarket(category, customPriceResult.price);

    const compStatusBadge = document.getElementById('calc-comp-status');
    const compMsg = document.getElementById('calc-comp-message');
    const compRange = document.getElementById('calc-comp-range');

    compStatusBadge.className = `comp-status ${marketComp.status}`;
    
    const statusTitles = {
        'below': 'Atrativo',
        'equal': 'Competitivo',
        'above': 'Premium'
    };
    compStatusBadge.textContent = statusTitles[marketComp.status];
    compMsg.textContent = marketComp.message;
    compRange.textContent = `Faixa de mercado: ${formatCurrency(marketComp.min)} a ${formatCurrency(marketComp.max)}`;
}

function setupQuickMarginCard(cardId, marginPct) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    
    newCard.addEventListener('click', () => {
        document.getElementById('calc-margin-slider').value = marginPct;
        document.getElementById('calc-margin-slider-value').textContent = `${marginPct}%`;
        triggerCalculatorRecalculate();
    });
}

async function handleSaveCalculatedProduct() {
    const name = document.getElementById('calc-product-name').value.trim();
    if (!name) {
        alert('Por favor, defina um nome para o produto antes de salvar!');
        return;
    }

    const category = document.getElementById('calc-category').value;
    const filamentType = document.getElementById('calc-filament-type').value;
    const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
    
    const timeH = parseInt(document.getElementById('calc-time-h').value) || 0;
    const timeM = parseInt(document.getElementById('calc-time-m').value) || 0;
    const printTime = timeH + (timeM / 60);

    const filamentCost = parseFloat(document.getElementById('cost-breakdown-filament').textContent.replace('R$', '').replace(',', '.').trim());
    const energyCost = parseFloat(document.getElementById('cost-breakdown-energy').textContent.replace('R$', '').replace(',', '.').trim());
    const depreciationCost = parseFloat(document.getElementById('cost-breakdown-depreciation').textContent.replace('R$', '').replace(',', '.').trim());
    const extrasCost = parseFloat(document.getElementById('cost-breakdown-extras').textContent.replace('R$', '').replace(',', '.').trim());
    const totalCost = parseFloat(document.getElementById('cost-breakdown-total').textContent.replace('R$', '').replace(',', '.').trim());

    const sellingPrice = parseFloat(document.getElementById('calc-selling-price-out').textContent.replace('R$', '').replace(',', '.').trim());
    const profit = parseFloat(document.getElementById('calc-profit-out').textContent.replace('R$', '').replace(',', '.').trim());
    
    const margin = parseInt(document.getElementById('calc-margin-slider').value) || 50;

    const product = {
        name,
        category,
        filamentType,
        weight,
        printTime,
        filamentCost,
        energyCost,
        depreciationCost,
        extrasCost,
        totalCost,
        sellingPrice,
        profit,
        margin
    };

    // Save to Database
    await window.db.saveProduct(product);
    await reloadData();
    
    // Clear product name input and reload lists
    document.getElementById('calc-product-name').value = '';
    alert(`Produto "${name}" cadastrado com sucesso no inventário!`);

    // Redirect to Inventory
    document.querySelector('[data-tab="produtos"]').click();
}

// ----------------------------------------------------
// Inventory & Sales Tab
// ----------------------------------------------------
function initInventoryTab() {
    const saleProductSelect = document.getElementById('sale-product-select');
    const saleQtyInput = document.getElementById('sale-quantity');
    const salePriceInput = document.getElementById('sale-price');
    const btnRegisterSale = document.getElementById('btn-register-sale');

    // Auto-update price when product selection changes
    if (saleProductSelect) {
        saleProductSelect.addEventListener('change', () => {
            const selectedProdId = saleProductSelect.value;
            const product = productsList.find(p => p.id === selectedProdId);
            if (product && salePriceInput) {
                salePriceInput.value = product.sellingPrice.toFixed(2);
            }
        });
    }

    // Auto-multiply or guide user
    if (btnRegisterSale) {
        btnRegisterSale.addEventListener('click', handleRegisterSale);
    }

    // Load standard today's date in form
    const saleDateInput = document.getElementById('sale-date');
    if (saleDateInput) {
        const todayStr = new Date().toISOString().substring(0, 10);
        saleDateInput.value = todayStr;
    }
}

async function handleRegisterSale() {
    const select = document.getElementById('sale-product-select');
    const productId = select.value;
    const quantity = parseInt(document.getElementById('sale-quantity').value) || 1;
    const salePriceEach = parseFloat(document.getElementById('sale-price').value) || 0;
    const saleDate = document.getElementById('sale-date').value;

    if (!productId) {
        alert('Selecione um produto para registrar a venda!');
        return;
    }

    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    // Calculate total price and total costs based on quantity sold
    const totalPrice = salePriceEach * quantity;
    const totalCost = product.totalCost * quantity;
    const profit = totalPrice - totalCost;

    const sale = {
        productId,
        productName: product.name,
        quantity,
        totalPrice,
        totalCost,
        profit,
        date: saleDate
    };

    // Save Sale to Database
    await window.db.addSale(sale);
    await reloadData();

    // Reset inputs
    document.getElementById('sale-quantity').value = 1;
    alert('Venda registrada com sucesso!');

    // Refresh UI
    renderInventoryTables();
}

async function renderInventoryTables() {
    // 1. Populate Sale Product Selection dropdown
    const select = document.getElementById('sale-product-select');
    if (select) {
        select.innerHTML = '<option value="">-- Selecione o Produto --</option>';
        productsList.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.filamentType} - ${formatCurrency(p.sellingPrice)})`;
            select.appendChild(opt);
        });
    }

    // 2. Render Products Table
    const prodTableBody = document.querySelector('#table-products tbody');
    if (prodTableBody) {
        prodTableBody.innerHTML = '';
        if (productsList.length === 0) {
            prodTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum produto cadastrado no momento. Use a Calculadora para cadastrar.</td></tr>';
        } else {
            productsList.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td><span class="tag-badge ${p.filamentType.toLowerCase()}">${p.filamentType}</span></td>
                    <td>${p.weight}g</td>
                    <td>${formatHours(p.printTime)}</td>
                    <td><strong>${formatCurrency(p.sellingPrice)}</strong> <span style="font-size:0.75rem; color:var(--success);">(${p.margin}%)</span></td>
                    <td>
                        <button class="btn btn-danger btn-delete-product" data-id="${p.id}" style="padding:6px 10px; font-size:0.75rem;">
                            <i class="lucide-trash"></i>
                        </button>
                    </td>
                `;

                tr.querySelector('.btn-delete-product').addEventListener('click', async () => {
                    if (confirm(`Deseja realmente remover o produto "${p.name}"? As vendas associadas não serão deletadas.`)) {
                        await window.db.deleteProduct(p.id);
                        await reloadData();
                        renderInventoryTables();
                    }
                });

                prodTableBody.appendChild(tr);
            });
        }
    }

    // 3. Render Sales Table
    const salesTableBody = document.querySelector('#table-sales tbody');
    if (salesTableBody) {
        salesTableBody.innerHTML = '';
        if (salesList.length === 0) {
            salesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma venda registrada até o momento.</td></tr>';
        } else {
            salesList.forEach(s => {
                const tr = document.createElement('tr');
                // Formata data brasileira dd/mm/aaaa
                const dateArr = s.date.split('-');
                const formattedDate = dateArr.length === 3 ? `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}` : s.date;

                tr.innerHTML = `
                    <td>${formattedDate}</td>
                    <td><strong>${s.productName}</strong></td>
                    <td style="text-align:center;">${s.quantity}</td>
                    <td>${formatCurrency(s.totalPrice)}</td>
                    <td style="color: var(--success); font-weight:600;">+${formatCurrency(s.profit)}</td>
                    <td>
                        <button class="btn btn-danger btn-delete-sale" data-id="${s.id}" style="padding:6px 10px; font-size:0.75rem;">
                            <i class="lucide-trash"></i>
                        </button>
                    </td>
                `;

                tr.querySelector('.btn-delete-sale').addEventListener('click', async () => {
                    if (confirm(`Remover o registro desta venda?`)) {
                        await window.db.deleteSale(s.id);
                        await reloadData();
                        renderInventoryTables();
                    }
                });

                salesTableBody.appendChild(tr);
            });
        }
    }

    if (window.lucide) window.lucide.createIcons();
}

// ----------------------------------------------------
// System Settings Tab & Config display
// ----------------------------------------------------
function setupFirebaseSettings() {
    const config = window.db.getFirebaseConfig();
    if (!config) return;

    // Fill form and lock/disable since it is now hardcoded and connected automatically
    const apikeyEl = document.getElementById('fb-apikey');
    const authdomainEl = document.getElementById('fb-authdomain');
    const projectidEl = document.getElementById('fb-projectid');
    const storagebucketEl = document.getElementById('fb-storagebucket');
    const messagingsenderidEl = document.getElementById('fb-messagingsenderid');
    const appidEl = document.getElementById('fb-appid');

    if (apikeyEl) {
        apikeyEl.value = config.apiKey || '';
        apikeyEl.disabled = true;
    }
    if (authdomainEl) {
        authdomainEl.value = config.authDomain || '';
        authdomainEl.disabled = true;
    }
    if (projectidEl) {
        projectidEl.value = config.projectId || '';
        projectidEl.disabled = true;
    }
    if (storagebucketEl) {
        storagebucketEl.value = config.storageBucket || '';
        storagebucketEl.disabled = true;
    }
    if (messagingsenderidEl) {
        messagingsenderidEl.value = config.messagingSenderId || '';
        messagingsenderidEl.disabled = true;
    }
    if (appidEl) {
        appidEl.value = config.appId || '';
        appidEl.disabled = true;
    }

    // Hide connection submit and clear buttons to show success note instead
    const submitBtn = document.querySelector('#firebase-config-form button[type="submit"]');
    const clearBtn = document.getElementById('btn-clear-firebase');

    if (submitBtn) {
        submitBtn.style.display = 'none';
    }
    if (clearBtn) {
        // Modifica para indicar conexão automática integrada
        clearBtn.outerHTML = '<div class="db-status firebase" style="width:100%; justify-content:center; padding:12px; font-weight:bold; font-size:0.9rem;"><i class="lucide-check-circle"></i> Conectado Dinamicamente ao Firebase</div>';
    }
}

// ----------------------------------------------------
// Goal Auto-Saving
// ----------------------------------------------------
function setupGoalSettings() {
    const goalInput = document.getElementById('settings-goal-val');
    const statusEl = document.getElementById('goal-save-status');
    let goalSaveTimeout = null;

    if (goalInput) {
        // Pre-fill goal
        window.db.getGoal().then(goal => {
            goalInput.value = goal.toFixed(2);
        });

        // Auto-save logic on input (debounced)
        goalInput.addEventListener('input', () => {
            if (!statusEl) return;

            // Show "Salvando..."
            statusEl.style.display = 'inline-flex';
            statusEl.style.color = 'var(--warning)';
            statusEl.innerHTML = '<i class="lucide-refresh-cw animate-spin" style="font-size:0.8rem; margin-right:3px;"></i> Salvando...';
            if (window.lucide) window.lucide.createIcons();

            clearTimeout(goalSaveTimeout);
            goalSaveTimeout = setTimeout(async () => {
                const val = parseFloat(goalInput.value);
                if (!isNaN(val) && val > 0) {
                    await window.db.setGoal(val);
                    await reloadData();
                    updateDashboard();

                    // Show "Salvo!"
                    statusEl.style.color = 'var(--success)';
                    statusEl.innerHTML = '<i class="lucide-check-circle" style="font-size:0.8rem; margin-right:3px;"></i> Salvo!';
                    if (window.lucide) window.lucide.createIcons();

                    // Hide status after a short delay
                    setTimeout(() => {
                        statusEl.style.display = 'none';
                    }, 2000);
                } else {
                    statusEl.style.color = 'var(--danger)';
                    statusEl.innerHTML = 'Valor inválido';
                }
            }, 800); // 800ms debounce
        });
    }
}

// ----------------------------------------------------
// Utility Functions
// ----------------------------------------------------
function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatHours(hoursDec) {
    const h = Math.floor(hoursDec);
    const m = Math.round((hoursDec - h) * 60);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}
