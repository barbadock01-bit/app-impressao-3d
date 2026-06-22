// Agent 3 - Price Calculator Agent Logic - Global Scope

window.calculatorAgent = {
    // Configurações padrão de mercado e máquinas
    defaults: {
        filamentSpoolCost: 120.00, // Preço do rolo de 1kg
        filamentSpoolWeight: 1000, // Peso em gramas
        energyConsumptionKw: 0.10, // Consumo aproximado da Bambu Lab A1 (100W)
        energyTariffKwh: 0.80,     // Tarifa média de energia elétrica no Brasil (R$/kWh)
        depreciationPerHour: 1.50,  // Desgaste de bico, correias, manutenção preventiva e amortização da A1
        extrasCost: 3.00           // Embalagem, fita adesiva, pós-processamento básico
    },

    // Dados de mercado médios por categoria para comparação
    marketAverages: {
        "Brinquedos": { min: 20.00, max: 95.00, avg: 50.00 },
        "Games": { min: 30.00, max: 80.00, avg: 45.00 },
        "Decoração": { min: 40.00, max: 120.00, avg: 75.00 },
        "Utilidades": { min: 15.00, max: 60.00, avg: 30.00 },
        "Outros": { min: 20.00, max: 70.00, avg: 40.00 }
    },

    calculateCosts({
        filamentSpoolCost,
        filamentSpoolWeight,
        printWeight,
        printTimeHours,
        energyConsumptionKw,
        energyTariffKwh,
        depreciationPerHour,
        extrasCost
    }) {
        // Garantindo valores corretos
        const fCost = parseFloat(filamentSpoolCost) || this.defaults.filamentSpoolCost;
        const fWeight = parseFloat(filamentSpoolWeight) || this.defaults.filamentSpoolWeight;
        const pWeight = parseFloat(printWeight) || 0;
        const pTime = parseFloat(printTimeHours) || 0;
        const eCons = parseFloat(energyConsumptionKw) || this.defaults.energyConsumptionKw;
        const eTariff = parseFloat(energyTariffKwh) || this.defaults.energyTariffKwh;
        const dep = parseFloat(depreciationPerHour) || this.defaults.depreciationPerHour;
        const ext = parseFloat(extrasCost) || 0;

        // Cálculos parciais
        const filamentCost = pWeight * (fCost / fWeight);
        const energyCost = pTime * eCons * eTariff;
        const depreciationCost = pTime * dep;
        const totalProductionCost = filamentCost + energyCost + depreciationCost + ext;

        return {
            filamentCost,
            energyCost,
            depreciationCost,
            extrasCost: ext,
            totalProductionCost
        };
    },

    // Sugere preços com base em margens comerciais padrão (40%, 50% e 60%)
    suggestPrices(totalCost) {
        const calculatePriceForMargin = (cost, marginPct) => {
            const marginDecimal = marginPct / 100;
            // Preço de Venda = Custo / (1 - Margem)
            const price = cost / (1 - marginDecimal);
            const profit = price - cost;
            return {
                margin: marginPct,
                price: parseFloat(price.toFixed(2)),
                profit: parseFloat(profit.toFixed(2))
            };
        };

        return {
            margin40: calculatePriceForMargin(totalCost, 40),
            margin50: calculatePriceForMargin(totalCost, 50),
            margin60: calculatePriceForMargin(totalCost, 60)
        };
    },

    // Retorna o preço de venda para uma margem customizada
    calculateCustomPrice(totalCost, marginPct) {
        const marginDecimal = marginPct / 100;
        if (marginDecimal >= 1) return { price: 9999.00, profit: 9999.00 - totalCost };
        const price = totalCost / (1 - marginDecimal);
        const profit = price - totalCost;
        return {
            price: parseFloat(price.toFixed(2)),
            profit: parseFloat(profit.toFixed(2))
        };
    },

    compareWithMarket(category, sellingPrice) {
        const data = this.marketAverages[category] || this.marketAverages["Outros"];
        const price = parseFloat(sellingPrice) || 0;

        let status = "equal";
        let message = "Preço competitivo (dentro da média do mercado)";
        
        if (price < data.min) {
            status = "below";
            message = `Abaixo do mercado (Média R$ ${data.avg.toFixed(2)}). Excelente atratividade para vendas rápidas!`;
        } else if (price > data.max) {
            status = "above";
            message = `Preço Premium (Média R$ ${data.avg.toFixed(2)}). Exige fotos impecáveis, embalagem de luxo ou filamentos diferenciados (como Silk ou Gradient) para justificar o valor.`;
        } else if (price < data.avg) {
            status = "below";
            message = `Excelente margem de competitividade (Média R$ ${data.avg.toFixed(2)}). Ótima chance de se destacar na Shopee!`;
        } else {
            status = "equal";
            message = `Preço Justo (Média R$ ${data.avg.toFixed(2)}). Alinhado com os principais concorrentes das plataformas.`;
        }

        return {
            status,
            message,
            min: data.min,
            max: data.max,
            avg: data.avg
        };
    }
};
