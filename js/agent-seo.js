// Agent 2 - Automatic SEO Optimizer Logic - Global Scope

window.seoAgent = {
    // Limpa texto para SEO (remove preposições e conectores comuns para poupar caracteres no título)
    cleanKeywords(wordsArray) {
        const stopWords = ['de', 'para', 'com', 'o', 'a', 'os', 'as', 'em', 'um', 'uma', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'e'];
        return wordsArray
            .filter(word => word && word.trim() !== '')
            .map(word => word.trim())
            .filter(word => !stopWords.includes(word.toLowerCase()));
    },

    // Remove acentos para títulos de busca do ML/Shopee (comumente otimiza indexação direta)
    removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },

    generateTitles(baseName, material, finish, highlights) {
        // Coleta de palavras-chave primárias
        const wordsBase = baseName.split(' ');
        
        // Highlights adicionais
        const wordsHighlights = highlights ? highlights.split(',') : [];
        
        // Lista consolidada de palavras-chave brutas
        const rawKeywords = [
            ...wordsBase,
            material || '',
            finish || '',
            ...wordsHighlights,
            '3D',
            'Impressao'
        ];

        // Limpa e remove conectores
        const cleanWords = this.cleanKeywords(rawKeywords);
        
        // TÍTULO MERCADO LIVRE: Focado em buscas diretas e objetivas
        let mlTitleWords = [];
        let mlLength = 0;
        
        for (const word of cleanWords) {
            const cleanWord = this.removeAccents(word);
            if (mlTitleWords.map(w => w.toLowerCase()).includes(cleanWord.toLowerCase())) continue; // evita duplicatas
            
            if (mlLength + cleanWord.length + (mlTitleWords.length > 0 ? 1 : 0) <= 60) {
                mlTitleWords.push(cleanWord);
                mlLength += cleanWord.length + (mlTitleWords.length > 1 ? 1 : 0);
            }
        }
        
        const mlTitle = mlTitleWords.join(' ').substring(0, 60);

        // TÍTULO SHOPEE: Focado em apelo emocional/comercial (geralmente adiciona termos como "Presente", "Promoção" ou "Lindo")
        const shopeePre = ['Lindo', 'Exclusivo', 'Promo'];
        let shopeeTitleWords = [];
        
        // Adiciona um termo de apelo comercial no início se couber
        let shopeeLength = 0;
        for (const prefix of shopeePre) {
            if (prefix.length + 1 <= 60) {
                shopeeTitleWords.push(prefix);
                shopeeLength += prefix.length + 1;
                break;
            }
        }

        for (const word of cleanWords) {
            if (shopeeTitleWords.map(w => w.toLowerCase()).includes(word.toLowerCase())) continue;
            
            if (shopeeLength + word.length + (shopeeTitleWords.length > 0 ? 1 : 0) <= 60) {
                shopeeTitleWords.push(word);
                shopeeLength += word.length + (shopeeTitleWords.length > 1 ? 1 : 0);
            }
        }
        
        const shopeeTitle = shopeeTitleWords.join(' ').substring(0, 60);

        return {
            mercadoLivre: mlTitle,
            shopee: shopeeTitle
        };
    },

    generateDescription(baseName, material, finish, highlights, details = "") {
        const matFull = material === 'PLA' ? 'PLA (Ácido Polilático - Termoplástico Biodegradável e Ecológico)' : 'PETG (Polietileno Tereftalato de Glicol - Super Resistente)';
        
        let desc = `✨ ${baseName.toUpperCase()} - ACABAMENTO PREMIUM ✨\n\n`;
        desc += `Adicione estilo e funcionalidade ao seu ambiente com o nosso ${baseName}. Esta peça foi produzida através de tecnologia de ponta em Impressão 3D FDM (Bambu Lab A1), garantindo um nível de detalhes impressionante e excelente acabamento.\n\n`;
        
        if (finish) {
            desc += `🎨 Acabamento / Cor: ${finish}\n`;
        }
        desc += `🧱 Material: ${matFull}\n`;
        
        if (highlights) {
            desc += `🚀 Diferenciais: ${highlights.split(',').join(', ')}\n`;
        }
        
        desc += `\n📋 FICHA TÉCNICA E CUIDADOS:\n`;
        desc += `- Tecnologia: FDM (Modelagem por Fusão Depositada)\n`;
        if (material === 'PLA') {
            desc += `- Cuidados: Não expor diretamente ao sol forte ou temperaturas acima de 50°C para evitar deformações.\n`;
            desc += `- Limpeza: Limpar apenas com pano levemente umedecido (não usar produtos abrasivos).\n`;
        } else {
            desc += `- Resistência: Suporta temperaturas de até 75°C e possui excelente resistência ao impacto e raios UV.\n`;
            desc += `- Limpeza: Limpar com pano úmido ou detergente neutro se necessário.\n`;
        }
        
        if (details) {
            desc += `\n📝 INFORMAÇÕES ADICIONAIS:\n${details}\n`;
        }

        desc += `\n📦 CONTEÚDO DA EMBALAGEM:\n- 01x ${baseName}\n\n`;
        desc += `⚠️ IMPORTANTE: A impressão 3D possui características próprias, como linhas de camada visíveis que são normais do processo de fabricação FDM e não afetam a beleza ou resistência do produto.\n\n`;
        desc += `--- Tags de busca (Ignore) ---\n`;
        desc += `impressão 3d, impressora 3d, ${baseName.toLowerCase()}, suporte 3d, ${material.toLowerCase()}, bambu lab, colecionavel, decoracao 3d, venda shopee, venda mercado livre`;
        
        return desc;
    },

    suggestCategories(baseName) {
        const nameLower = baseName.toLowerCase();
        let mlCat = "Mais Vendidos > Novidades";
        let shopeeCat = "Casa e Decoração > Outros";
        let tags = ["decoracao", "impressao3d", "artesanato"];

        if (nameLower.includes("suporte") || nameLower.includes("organizador") || nameLower.includes("porta")) {
            mlCat = "Acessórios para Casa > Organizadores > Suportes";
            shopeeCat = "Casa e Decoração > Armazenamento e Organização";
            tags = ["organizador", "suporte", "utilidades", "organizacao"];
        } else if (nameLower.includes("dragao") || nameLower.includes("brinquedo") || nameLower.includes("lesma") || nameLower.includes("fidget") || nameLower.includes("articulado")) {
            mlCat = "Brinquedos e Hobbies > Bonecos e Bonecas > Articulados";
            shopeeCat = "Brinquedos e Hobbies > Fidget Toys";
            tags = ["brinquedo", "fidget", "articulado", "colecionavel", "flexi"];
        } else if (nameLower.includes("vaso") || nameLower.includes("planta") || nameLower.includes("decor") || nameLower.includes("quadro")) {
            mlCat = "Casa, Móveis e Decoração > Enfeites e Decoração da Casa > Vasos";
            shopeeCat = "Casa e Decoração > Decoração > Vasos";
            tags = ["vaso", "decoracao", "design", "arquitetura", "plantas"];
        } else if (nameLower.includes("headset") || nameLower.includes("game") || nameLower.includes("ps5") || nameLower.includes("xbox") || nameLower.includes("controle")) {
            mlCat = "Consoles e Games > Acessórios > Suportes";
            shopeeCat = "Consoles e Jogos > Acessórios de Console > Suportes";
            tags = ["gamer", "setupgamer", "playstation", "xbox", "ps5"];
        }

        return {
            mercadoLivre: mlCat,
            shopee: shopeeCat,
            tags: tags
        };
    }
};
