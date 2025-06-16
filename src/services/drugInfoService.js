import API_CONFIG from '../config/apiConfig';

class DrugInfoService {
    constructor() {
        this.baseUrl = API_CONFIG.OPENFDA.BASE_URL;
        this.apiKey = API_CONFIG.OPENFDA.API_KEY;
    }

    async searchDrugs(query) {
        try {
            const response = await fetch(
                `${this.baseUrl}/label.json?api_key=${this.apiKey}&search=brand_name:${encodeURIComponent(query)}&limit=10`
            );
            return await response.json();
        } catch (error) {
            console.error('Error searching drugs:', error);
            throw error;
        }
    }

    async getDrugDetails(ndc) {
        try {
            const response = await fetch(
                `${this.baseUrl}/label.json?api_key=${this.apiKey}&search=openfda.product_ndc:${ndc}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error getting drug details:', error);
            throw error;
        }
    }

    async getDrugInteractions(drugName) {
        try {
            const response = await fetch(
                `${this.baseUrl}/label.json?api_key=${this.apiKey}&search=openfda.brand_name:${encodeURIComponent(drugName)}&limit=1`
            );
            return await response.json();
        } catch (error) {
            console.error('Error getting drug interactions:', error);
            throw error;
        }
    }
}

export default new DrugInfoService(); 