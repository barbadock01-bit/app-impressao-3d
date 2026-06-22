// Agent 1 - Product Consultant Logic & Knowledge Base - Global Scope

window.consultantDatabase = [
    {
        id: "c-dragao",
        name: "Dragão Articulado de Cristal (Flexi)",
        category: "Brinquedos",
        filamentType: "PLA",
        weight: 180,
        printTime: 5.5,
        demand: "high",
        profitability: "high",
        reason: "Brinquedos articulados (fidgets) têm enorme apelo visual nas redes sociais. Modelos com filamentos Silk (seda) ou Dual-Color chamam muito a atenção e são comprados por impulso.",
        bambuA1Specs: "Ideal para a Bambu Lab A1 devido à excelente adesão de mesa PEI e controle dinâmico de vibrações, evitando falhas nas pequenas articulações da peça durante impressões rápidas.",
        marketMin: 70.00,
        marketMax: 120.00,
        difficulty: "Fácil (Print-in-place)"
    },
    {
        id: "c-suporteps5",
        name: "Suporte de Parede Duplo para Controles PS5/Xbox",
        category: "Games",
        filamentType: "PETG",
        weight: 95,
        printTime: 2.2,
        demand: "high",
        profitability: "medium",
        reason: "Público gamer investe constantemente na organização do setup. É um item funcional com baixa concorrência em lojas físicas.",
        bambuA1Specs: "O PETG imprime perfeitamente na A1 com temperaturas de bico a 255°C. Como a peça exige resistência estrutural para segurar controles caros, a A1 entrega excelente fusão de camadas.",
        marketMin: 35.00,
        marketMax: 60.00,
        difficulty: "Fácil"
    },
    {
        id: "c-vasogeo",
        name: "Vaso Geométrico Minimalista",
        category: "Decoração",
        filamentType: "PLA",
        weight: 120,
        printTime: 2.5,
        demand: "medium",
        profitability: "high",
        reason: "Peças decorativas com design escandinavo são muito valorizadas no Mercado Livre e Shopee. Rápido de imprimir no modo vaso (spiralize).",
        bambuA1Specs: "A A1 gerencia acelerações extremas de forma suave, permitindo rodar em modo vaso de alta velocidade sem criar linhas horizontais ou marcas de oscilação na casca do vaso.",
        marketMin: 49.00,
        marketMax: 89.00,
        difficulty: "Fácil (Modo Vaso)"
    },
    {
        id: "c-organizador",
        name: "Organizador Modular de Gavetas",
        category: "Utilidades",
        filamentType: "PLA",
        weight: 85,
        printTime: 1.8,
        demand: "high",
        profitability: "medium",
        reason: "Vendido em kits (3 a 5 unidades). Clientes que buscam organização residencial ou de escritório costumam comprar múltiplos no mesmo frete.",
        bambuA1Specs: "A velocidade volumétrica de até 15 mm³/s da A1 reduz drasticamente o tempo de impressão de paredes retas, aumentando a margem de lucro por hora de máquina ligada.",
        marketMin: 25.00,
        marketMax: 45.00,
        difficulty: "Fácil"
    },
    {
        id: "c-clipssacos",
        name: "Clips Herméticos com Rosca para Embalagens",
        category: "Utilidades",
        filamentType: "PETG",
        weight: 35,
        printTime: 0.9,
        demand: "high",
        profitability: "high",
        reason: "Item super útil e barato. Excelente para vender como brinde para compras grandes ou em pacotes de 6 a 12 unidades por R$ 30,00.",
        bambuA1Specs: "A mecânica precisa da A1 garante roscas perfeitas que encaixam de primeira sem folgas. O uso do PETG garante flexibilidade para o clip travar sem quebrar.",
        marketMin: 5.00,
        marketMax: 10.00,
        difficulty: "Média (Exige tolerâncias de rosca)"
    },
    {
        id: "c-suportenotebook",
        name: "Suporte Ergonômico para Notebook (Portátil)",
        category: "Utilidades",
        filamentType: "PETG",
        weight: 140,
        printTime: 3.2,
        demand: "high",
        profitability: "high",
        reason: "Item essencial para home office. Peça ergonômica muito buscada para evitar dores no pescoço. Tem excelente valor percebido.",
        bambuA1Specs: "A mesa da Bambu A1 suporta o tamanho necessário para imprimir os braços de apoio deitados. Recomenda-se PETG para resistir ao calor dissipado pelo próprio notebook na base.",
        marketMin: 45.00,
        marketMax: 79.00,
        difficulty: "Fácil"
    },
    {
        id: "c-suportealexa",
        name: "Suporte Divertido Alexa Echo Dot 4/5",
        category: "Decoração",
        filamentType: "PLA",
        weight: 130,
        printTime: 4.0,
        demand: "medium",
        profitability: "high",
        reason: "Suportes em formato de robô ou personagens agregam muito valor ao dispositivo Alexa. Excelente apelo de presente de aniversário.",
        bambuA1Specs: "Excelente uso do AMS Lite para fazer detalhes coloridos nos olhos/detalhes do robô sem necessitar de colagens ou pinturas manuais demoradas.",
        marketMin: 55.00,
        marketMax: 99.00,
        difficulty: "Média (Pode exigir suportes simples)"
    },
    {
        id: "c-fidgetslug",
        name: "Lesma Articulada Sensorial (Fidget Toy)",
        category: "Brinquedos",
        filamentType: "PLA",
        weight: 60,
        printTime: 1.5,
        demand: "high",
        profitability: "high",
        reason: "Brinquedo de alívio de estresse muito viral. Vende muito em feiras de artesanato, shoppings e anúncios de Shopee para crianças e adultos.",
        bambuA1Specs: "Impressão multi-colorida em degradê (com filamento arco-íris) na mesa lisa PEI da A1 cria um brilho impecável nas juntas da lesma.",
        marketMin: 20.00,
        marketMax: 35.00,
        difficulty: "Fácil"
    }
];

window.consultantAgent = {
    // Retorna uma resposta amigável e recomendações de acordo com os filtros selecionados
    getRecommendations(filterCategory = 'all', goal = 'all') {
        let filtered = [...window.consultantDatabase];

        if (filterCategory !== 'all') {
            filtered = filtered.filter(p => p.category === filterCategory);
        }

        if (goal === 'fast') {
            filtered = filtered.filter(p => p.printTime <= 2.5);
        } else if (goal === 'high-profit') {
            filtered = filtered.filter(p => p.profitability === 'high');
        } else if (goal === 'bambu-special') {
            filtered = filtered.filter(p => p.bambuA1Specs.includes('AMS Lite') || p.id === 'c-dragao');
        }

        // Gera comentários simulados do Agente com base nos resultados
        let agentCommentary = "";
        if (filtered.length === 0) {
            agentCommentary = "Hmm, não encontrei nenhum item com esses filtros exatos. Que tal tentarmos uma categoria diferente?";
        } else if (goal === 'fast') {
            agentCommentary = "⚡ **Foco em Giro Rápido:** Selecionei peças pequenas e utilitárias que levam menos de 2.5 horas para imprimir. Perfeitas para manter sua Bambu Lab A1 rodando sem parar e faturar no atacado!";
        } else if (goal === 'high-profit') {
            agentCommentary = "💰 **Foco em Alta Margem:** Estas peças possuem alto valor percebido no mercado de decoração e colecionáveis. Clientes pagam com prazer margens de mais de 60% por elas devido ao design exclusivo.";
        } else if (goal === 'bambu-special') {
            agentCommentary = "🐼 **Especialistas Bambu A1:** Estes modelos se beneficiam muito da altíssima velocidade, do nivelamento ativo ultra-preciso ou do sistema de multi-cores AMS Lite da sua Bambu A1.";
        } else {
            agentCommentary = "Olá! Analisei o mercado brasileiro de impressão 3D (especialmente Shopee e Mercado Livre) e compilei os produtos que estão vendendo mais rápido no momento, ideais para filamentos PLA e PETG na sua Bambu Lab A1. Escolha um abaixo:";
        }

        return {
            commentary: agentCommentary,
            products: filtered
        };
    }
};
