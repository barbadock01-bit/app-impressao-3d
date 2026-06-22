// Initial mock data for the 3D Printing Sales application - Global Scope
window.initialProducts = [
    {
        id: "prod-1",
        name: "Vaso Geométrico Espiral",
        category: "Decoração",
        filamentType: "PLA",
        weight: 150, // em gramas
        printTime: 3.5, // em horas
        filamentCost: 18.00, // R$ 120/kg
        energyCost: 0.28,    // 0.1 kW * 3.5h * R$ 0.80
        depreciationCost: 5.25, // R$ 1.50 * 3.5h
        extrasCost: 2.00, // fita, cola, caixa
        totalCost: 25.53,
        sellingPrice: 65.00,
        profit: 39.47,
        margin: 60.7,
        demand: "high",
        bambuA1Optimized: true,
        marketMin: 50.00,
        marketMax: 85.00
    },
    {
        id: "prod-2",
        name: "Dragão Flexi Articulado",
        category: "Brinquedos",
        filamentType: "PLA",
        weight: 220,
        printTime: 6.0,
        filamentCost: 26.40,
        energyCost: 0.48,
        depreciationCost: 9.00,
        extrasCost: 3.00,
        totalCost: 38.88,
        sellingPrice: 95.00,
        profit: 56.12,
        margin: 59.1,
        demand: "high",
        bambuA1Optimized: true,
        marketMin: 80.00,
        marketMax: 130.00
    },
    {
        id: "prod-3",
        name: "Suporte de Mesa para Headset",
        category: "Utilidades",
        filamentType: "PETG",
        weight: 120,
        printTime: 2.8,
        filamentCost: 15.60, // R$ 130/kg para PETG
        energyCost: 0.22,
        depreciationCost: 4.20,
        extrasCost: 4.00,
        totalCost: 24.02,
        sellingPrice: 55.00,
        profit: 30.98,
        margin: 56.3,
        demand: "medium",
        bambuA1Optimized: false,
        marketMin: 45.00,
        marketMax: 70.00
    },
    {
        id: "prod-4",
        name: "Suporte de Parede Controle PS5",
        category: "Games",
        filamentType: "PETG",
        weight: 80,
        printTime: 2.0,
        filamentCost: 10.40,
        energyCost: 0.16,
        depreciationCost: 3.00,
        extrasCost: 3.00,
        totalCost: 16.56,
        sellingPrice: 39.90,
        profit: 23.34,
        margin: 58.5,
        demand: "high",
        bambuA1Optimized: true,
        marketMin: 30.00,
        marketMax: 50.00
    },
    {
        id: "prod-5",
        name: "Chaveiro Polvo Articulado",
        category: "Brinquedos",
        filamentType: "PLA",
        weight: 25,
        printTime: 0.8,
        filamentCost: 3.00,
        energyCost: 0.06,
        depreciationCost: 1.20,
        extrasCost: 1.50,
        totalCost: 5.76,
        sellingPrice: 15.00,
        profit: 9.24,
        margin: 61.6,
        demand: "high",
        bambuA1Optimized: true,
        marketMin: 10.00,
        marketMax: 20.00
    }
];

window.initialSales = [
    {
        id: "sale-1",
        productId: "prod-1",
        productName: "Vaso Geométrico Espiral",
        quantity: 2,
        totalPrice: 130.00,
        totalCost: 51.06,
        profit: 78.94,
        date: "2026-05-10"
    },
    {
        id: "sale-2",
        productId: "prod-2",
        productName: "Dragão Flexi Articulado",
        quantity: 1,
        totalPrice: 95.00,
        totalCost: 38.88,
        profit: 56.12,
        date: "2026-05-12"
    },
    {
        id: "sale-3",
        productId: "prod-5",
        productName: "Chaveiro Polvo Articulado",
        quantity: 5,
        totalPrice: 75.00,
        totalCost: 28.80,
        profit: 46.20,
        date: "2026-05-15"
    },
    {
        id: "sale-4",
        productId: "prod-3",
        productName: "Suporte de Mesa para Headset",
        quantity: 2,
        totalPrice: 110.00,
        totalCost: 48.04,
        profit: 61.96,
        date: "2026-05-20"
    },
    {
        id: "sale-5",
        productId: "prod-4",
        productName: "Suporte de Parede Controle PS5",
        quantity: 3,
        totalPrice: 119.70,
        totalCost: 49.68,
        profit: 70.02,
        date: "2026-05-25"
    },
    {
        id: "sale-6",
        productId: "prod-2",
        productName: "Dragão Flexi Articulado",
        quantity: 2,
        totalPrice: 190.00,
        totalCost: 77.76,
        profit: 112.24,
        date: "2026-05-28"
    },
    {
        id: "sale-7",
        productId: "prod-1",
        productName: "Vaso Geométrico Espiral",
        quantity: 1,
        totalPrice: 65.00,
        totalCost: 25.53,
        profit: 39.47,
        date: "2026-06-01"
    },
    {
        id: "sale-8",
        productId: "prod-2",
        productName: "Dragão Flexi Articulado",
        quantity: 1,
        totalPrice: 95.00,
        totalCost: 38.88,
        profit: 56.12,
        date: "2026-06-01"
    },
    {
        id: "sale-9",
        productId: "prod-5",
        productName: "Chaveiro Polvo Articulado",
        quantity: 3,
        totalPrice: 45.00,
        totalCost: 17.28,
        profit: 27.72,
        date: "2026-06-01"
    }
];

window.initialGoal = 1500.00;
