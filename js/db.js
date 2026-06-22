// Database manager supporting LocalStorage fallback and Firebase Firestore compat integration
// Loaded globally - no imports

let dbType = 'local'; // 'local' or 'firebase'
let firestoreDb = null;
let currentUserId = null; // Guardará o UID do usuário conectado

// Configuração fixa fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyBDTHuYMpYCZGnHOA5X3OPQ-jVz1D8QO9A",
  authDomain: "calculadora-3d-660f6.firebaseapp.com",
  projectId: "calculadora-3d-660f6",
  storageBucket: "calculadora-3d-660f6.firebasestorage.app",
  messagingSenderId: "684004790953",
  appId: "1:684004790953:web:55c68545219f6de195cfb8",
  measurementId: "G-3B437QQR7T"
};

window.db = {
    async init() {
        if (typeof firebase !== 'undefined') {
            try {
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(firebaseConfig);
                }
                firestoreDb = firebase.firestore();
                dbType = 'firebase';
                console.log("Firebase inicializado com sucesso via Compat SDK!");
                return 'firebase';
            } catch (e) {
                console.warn("Falha ao inicializar o Firebase. Usando LocalStorage.", e);
                dbType = 'local';
                this.initLocalStorage();
                return 'local';
            }
        } else {
            dbType = 'local';
            this.initLocalStorage();
            return 'local';
        }
    },

    setUserId(uid) {
        currentUserId = uid;
        console.log(`Banco de dados chaveado para o usuário UID: ${uid}`);
        if (dbType === 'firebase') {
            this.syncInitialDataIfEmpty();
        }
    },

    getUserId() {
        return currentUserId;
    },

    getDbType() {
        return dbType;
    },

    initLocalStorage() {
        if (!localStorage.getItem('3d_products')) {
            localStorage.setItem('3d_products', JSON.stringify(window.initialProducts));
        }
        if (!localStorage.getItem('3d_sales')) {
            localStorage.setItem('3d_sales', JSON.stringify(window.initialSales));
        }
        if (!localStorage.getItem('3d_goal')) {
            localStorage.setItem('3d_goal', JSON.stringify(window.initialGoal));
        }
    },

    async syncInitialDataIfEmpty() {
        if (dbType !== 'firebase' || !firestoreDb || !currentUserId) return;
        
        try {
            // Referência raiz do documento do usuário
            const userDocRef = firestoreDb.collection('users').doc(currentUserId);
            
            // Check products
            const prodSnap = await userDocRef.collection('products').get();
            if (prodSnap.empty) {
                console.log("Nuvem vazia! Copiando produtos mockados iniciais para o Firestore do usuário...");
                for (const p of window.initialProducts) {
                    await userDocRef.collection('products').doc(p.id).set(p);
                }
            }
            
            // Check sales
            const salesSnap = await userDocRef.collection('sales').get();
            if (salesSnap.empty) {
                console.log("Nuvem vazia! Copiando vendas mockadas iniciais para o Firestore do usuário...");
                for (const s of window.initialSales) {
                    await userDocRef.collection('sales').doc(s.id).set(s);
                }
            }

            // Check goal
            const goalSnap = await userDocRef.collection('settings').doc('monthly_goal').get();
            if (!goalSnap.exists) {
                await userDocRef.collection('settings').doc('monthly_goal').set({ value: window.initialGoal });
            }
        } catch (e) {
            console.error("Erro ao sincronizar dados iniciais no Firebase do usuário", e);
        }
    },

    getFirebaseConfig() {
        return firebaseConfig;
    },

    // --- PRODUCTS API ---
    async getProducts() {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                const querySnapshot = await firestoreDb.collection('users').doc(currentUserId).collection('products').get();
                const products = [];
                querySnapshot.forEach((doc) => {
                    products.push({ ...doc.data(), id: doc.id });
                });
                return products;
            } catch (e) {
                console.error("Erro ao ler produtos do Firebase, caindo para local", e);
            }
        }
        return JSON.parse(localStorage.getItem('3d_products') || '[]');
    },

    async saveProduct(product) {
        if (!product.id) {
            product.id = 'prod-' + Date.now();
        }

        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('products').doc(product.id).set(product);
                return product;
            } catch (e) {
                console.error("Erro ao salvar produto no Firebase", e);
            }
        }
        
        const products = JSON.parse(localStorage.getItem('3d_products') || '[]');
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
        } else {
            products.push(product);
        }
        localStorage.setItem('3d_products', JSON.stringify(products));
        return product;
    },

    async deleteProduct(id) {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('products').doc(id).delete();
                return true;
            } catch (e) {
                console.error("Erro ao deletar produto no Firebase", e);
            }
        }
        
        let products = JSON.parse(localStorage.getItem('3d_products') || '[]');
        products = products.filter(p => p.id !== id);
        localStorage.setItem('3d_products', JSON.stringify(products));
        return true;
    },

    // --- SALES API ---
    async getSales() {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                const querySnapshot = await firestoreDb.collection('users').doc(currentUserId).collection('sales').get();
                const sales = [];
                querySnapshot.forEach((doc) => {
                    sales.push({ ...doc.data(), id: doc.id });
                });
                sales.sort((a, b) => new Date(b.date) - new Date(a.date));
                return sales;
            } catch (e) {
                console.error("Erro ao obter vendas do Firebase", e);
            }
        }
        
        const sales = JSON.parse(localStorage.getItem('3d_sales') || '[]');
        sales.sort((a, b) => new Date(b.date) - new Date(a.date));
        return sales;
    },

    async addSale(sale) {
        if (!sale.id) {
            sale.id = 'sale-' + Date.now();
        }
        
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('sales').doc(sale.id).set(sale);
                return sale;
            } catch (e) {
                console.error("Erro ao salvar venda no Firebase", e);
            }
        }
        
        const sales = JSON.parse(localStorage.getItem('3d_sales') || '[]');
        sales.push(sale);
        localStorage.setItem('3d_sales', JSON.stringify(sales));
        return sale;
    },

    async deleteSale(id) {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('sales').doc(id).delete();
                return true;
            } catch (e) {
                console.error("Erro ao deletar venda no Firebase", e);
            }
        }
        
        let sales = JSON.parse(localStorage.getItem('3d_sales') || '[]');
        sales = sales.filter(s => s.id !== id);
        localStorage.setItem('3d_sales', JSON.stringify(sales));
        return true;
    },

    // --- GOAL API ---
    async getGoal() {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                const docSnap = await firestoreDb.collection('users').doc(currentUserId).collection('settings').doc('monthly_goal').get();
                if (docSnap.exists) {
                    return docSnap.data().value;
                }
            } catch (e) {
                console.error("Erro ao ler meta do Firebase", e);
            }
        }
        
        return parseFloat(localStorage.getItem('3d_goal') || '1500');
    },

    async setGoal(value) {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('settings').doc('monthly_goal').set({ value: parseFloat(value) });
                return value;
            } catch (e) {
                console.error("Erro ao salvar meta no Firebase", e);
            }
        }
        
        localStorage.setItem('3d_goal', value.toString());
        return value;
    },

    // --- SEO HISTORY API ---
    async getSeoHistory() {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                const querySnapshot = await firestoreDb.collection('users').doc(currentUserId).collection('seo_history').get();
                const history = [];
                querySnapshot.forEach((doc) => {
                    history.push({ ...doc.data(), id: doc.id });
                });
                history.sort((a, b) => b.timestamp - a.timestamp);
                return history;
            } catch (e) {
                console.error("Erro ao obter histórico de SEO do Firebase", e);
            }
        }
        const history = JSON.parse(localStorage.getItem('3d_seo_history') || '[]');
        history.sort((a, b) => b.timestamp - a.timestamp);
        return history;
    },

    async saveSeoHistoryEntry(entry) {
        if (!entry.id) {
            entry.id = 'seo-' + Date.now();
        }
        if (!entry.timestamp) {
            entry.timestamp = Date.now();
        }
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('seo_history').doc(entry.id).set(entry);
                return entry;
            } catch (e) {
                console.error("Erro ao salvar entrada de SEO no Firebase", e);
            }
        }
        const history = JSON.parse(localStorage.getItem('3d_seo_history') || '[]');
        history.push(entry);
        localStorage.setItem('3d_seo_history', JSON.stringify(history));
        return entry;
    },

    async updateSeoHistoryFeedback(id, feedback) {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('seo_history').doc(id).update({ feedback: feedback });
                return true;
            } catch (e) {
                console.error("Erro ao atualizar feedback de SEO no Firebase", e);
            }
        }
        const history = JSON.parse(localStorage.getItem('3d_seo_history') || '[]');
        const index = history.findIndex(e => e.id === id);
        if (index !== -1) {
            history[index].feedback = feedback;
            localStorage.setItem('3d_seo_history', JSON.stringify(history));
            return true;
        }
        return false;
    },

    async getGeminiKey() {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                const docSnap = await firestoreDb.collection('users').doc(currentUserId).collection('settings').doc('gemini_key').get();
                if (docSnap.exists) {
                    return docSnap.data().value || '';
                }
            } catch (e) {
                console.error("Erro ao obter chave do Gemini do Firebase", e);
            }
        }
        return localStorage.getItem('3d_gemini_key') || '';
    },

    async setGeminiKey(key) {
        if (dbType === 'firebase' && firestoreDb && currentUserId) {
            try {
                await firestoreDb.collection('users').doc(currentUserId).collection('settings').doc('gemini_key').set({ value: key });
                return key;
            } catch (e) {
                console.error("Erro ao salvar chave do Gemini no Firebase", e);
            }
        }
        localStorage.setItem('3d_gemini_key', key);
        return key;
    }
};
