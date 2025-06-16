import axios from 'axios';

const OPENFDA_API_BASE_URL = 'https://api.fda.gov/drug';

const drugInfoService = {
  async searchDrugs(query) {
    try {
      const response = await axios.get(`${OPENFDA_API_BASE_URL}/label.json`, {
        params: {
          search: query,
          limit: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching drugs:', error);
      throw error;
    }
  },

  async getDrugDetails(applicationNumber) {
    try {
      const response = await axios.get(`${OPENFDA_API_BASE_URL}/label.json`, {
        params: {
          search: `application_number:${applicationNumber}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting drug details:', error);
      throw error;
    }
  },

  async getDrugAdverseEvents(drugName) {
    try {
      const response = await axios.get(`${OPENFDA_API_BASE_URL}/event.json`, {
        params: {
          search: `patient.drug.medicinalproduct:${drugName}`,
          limit: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting adverse events:', error);
      throw error;
    }
  }
};

export default drugInfoService; 