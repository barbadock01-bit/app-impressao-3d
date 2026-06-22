// Agent 2 - Automatic SEO Optimizer Logic - AI-Powered by Gemini API
// Supports Multimodal analysis of 3D print photos and feedback loop memory

window.seoAgent = {
    // -------------------------------------------------------------------------
    // Local Fallback Heuristics (Used if Gemini API Key is missing)
    // -------------------------------------------------------------------------
    cleanKeywords(wordsArray) {
        const stopWords = ['de', 'para', 'com', 'o', 'a', 'os', 'as', 'em', 'um', 'uma', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'e'];
        return wordsArray
            .filter(word => word && word.trim() !== '')
            .map(word => word.trim())
            .filter(word => !stopWords.includes(word.toLowerCase()));
    },

    removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },

    generateTitles(baseName, material, finish, highlights) {
        const wordsBase = baseName.split(' ');
        const wordsHighlights = highlights ? highlights.split(',') : [];
        const rawKeywords = [
            ...wordsBase,
            material || '',
            finish || '',
            ...wordsHighlights,
            '3D',
            'Impressao'
        ];

        const cleanWords = this.cleanKeywords(rawKeywords);
        
        // Mercado Livre title
        let mlTitleWords = [];
        let mlLength = 0;
        for (const word of cleanWords) {
            const cleanWord = this.removeAccents(word);
            if (mlTitleWords.map(w => w.toLowerCase()).includes(cleanWord.toLowerCase())) continue;
            if (mlLength + cleanWord.length + (mlTitleWords.length > 0 ? 1 : 0) <= 60) {
                mlTitleWords.push(cleanWord);
                mlLength += cleanWord.length + (mlTitleWords.length > 1 ? 1 : 0);
            }
        }
        const mlTitle = mlTitleWords.join(' ').substring(0, 60);

        // Shopee title
        const shopeePre = ['Lindo', 'Exclusivo', 'Promo'];
        let shopeeTitleWords = [];
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
    },

    // -------------------------------------------------------------------------
    // Gemini API Integration (Advanced Mode)
    // -------------------------------------------------------------------------
    async generateSeoWithAi({
        baseName,
        material,
        finish,
        highlights,
        extraInfo,
        imageData,
        historyContext,
        apiKey
    }) {
        const MODEL_NAME = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

        const systemInstruction = `Você é um Especialista em E-commerce (Shopee e Mercado Livre) altamente experiente e focado em produtos de Impressão 3D.
Sua missão é ajudar o usuário a faturar alto vendendo peças 3D (especialmente feitas na Bambu Lab A1 com filamentos PLA/PETG).

Suas diretrizes:
1. Se uma imagem for enviada, analise a foto com precisão. Extraia os pontos fortes (ex: acabamento estético, textura, detalhes finos, se aceita personalização de nomes, robustez ou utilidade prática).
2. Títulos para Mercado Livre e Shopee:
   - Gere 1 título otimizado para Mercado Livre e 1 para Shopee.
   - Os títulos DEVEM ter no MÁXIMO 60 caracteres.
   - Use palavras-chave de alto volume de busca, removendo preposições e termos desnecessários.
3. Roteiro para vídeo curto:
   - Crie um roteiro dinâmico e magnético de 15 a 30 segundos (estilo Reels/TikTok/Shorts) focado no público comprador.
   - O roteiro deve incluir ganchos de atenção iniciais, demonstração de uso do produto (ou apelo estético) e uma chamada para ação (CTA) clara de compra.
4. Ficha técnica detalhada com cuidados específicos do material da peça (PLA ou PETG) e sugestões de categorias apropriadas para as duas plataformas.

Sua resposta deve ser estruturada em formato JSON válido para que a interface possa renderizar de forma organizada. Retorne exatamente este formato JSON (sem marcações de markdown como \`\`\`json):
{
  "mercadoLivreTitle": "Título ML aqui (max 60 carac)",
  "shopeeTitle": "Título Shopee aqui (max 60 carac)",
  "mercadoLivreCategory": "Categoria recomendada no ML",
  "shopeeCategory": "Categoria recomendada na Shopee",
  "tags": ["tag1", "tag2", "tag3"],
  "pointsAnalysis": "Breve análise dos pontos fortes identificados na foto/dados (ex: textura, personalização de nomes, utilidade)",
  "description": "Descrição detalhada do anúncio contendo diferenciais, ficha técnica/cuidados com o filamento e detalhes adicionais",
  "videoScript": "Roteiro de vídeo curto (Reels/TikTok) com Gancho, Demonstração e Call To Action"
}`;

        // Prompt content setup
        let promptText = `Crie um anúncio de alta conversão para o seguinte produto de Impressão 3D:
- Nome Base: ${baseName}
- Material: ${material} (PLA ou PETG)
- Cor/Acabamento: ${finish || "Não especificado"}
- Destaques: ${highlights || "Nenhum"}
- Detalhes extras: ${extraInfo || "Nenhum"}\n`;

        if (imageData) {
            promptText += `\n[IMPORTANTE] Uma imagem real do produto impresso foi enviada. Analise a foto para identificar o nível de detalhes, textura, cores e pontos fortes visuais, e incorpore isso na ficha técnica e na descrição.`;
        }

        if (historyContext && historyContext.length > 0) {
            promptText += `\nUse os aprendizados e feedbacks dos posts anteriores fornecidos abaixo para guiar sua geração de tom, estilo e palavras-chave. Evite erros do passado e replique pontos positivos:\n`;
            historyContext.forEach((h, index) => {
                promptText += `Histórico ${index + 1}:
- Produto anterior: ${h.baseName}
- Feedback do usuário: ${h.feedback || "Sem feedback específico. Post aprovado."}
- Título gerado anteriormente: ${h.mercadoLivreTitle} / ${h.shopeeTitle}\n`;
            });
        }

        promptText += `\nPor favor, retorne os dados estritamente estruturados no formato JSON esperado.`;

        const parts = [{ text: promptText }];
        if (imageData) {
            parts.push({
                inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.data
                }
            });
        }

        const requestBody = {
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [{
                role: "user",
                parts: parts
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Erro HTTP ${response.status} na API do Gemini`);
        }

        const resJson = await response.json();
        const outputText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!outputText) {
            throw new Error("Nenhuma resposta válida recebida da API do Gemini.");
        }

        return JSON.parse(outputText.trim());
    }
};
