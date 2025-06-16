const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

class DataService {
    constructor() {
        this.dataset = [];
        this.processedData = [];
    }

    async loadDataset() {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(path.join(__dirname, '../../Diseases_and_Symptoms.csv'))
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    this.dataset = results;
                    console.log(`Loaded ${results.length} records from dataset`);
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error('Error loading dataset:', error);
                    reject(error);
                });
        });
    }

    processData() {
        console.log('Processing dataset for training...');
        
        this.processedData = this.dataset.map(record => {
            // Create input-output pairs for training
            const inputs = [
                `What are the symptoms of ${record.Disease}?`,
                `How to treat ${record.Disease}?`,
                `What causes ${record.Disease}?`,
                `What are the risk factors for ${record.Disease}?`,
                `How to prevent ${record.Disease}?`
            ];

            const outputs = [
                `📋 Symptoms of ${record.Disease}:\n${record.Symptoms.split(',').map(s => `• ${s.trim()}`).join('\n')}`,
                `💊 Treatment for ${record.Disease}:\n${record.Treatment.split(',').map(t => `• ${t.trim()}`).join('\n')}`,
                `❗ Causes of ${record.Disease}:\n${record.Causes.split(',').map(c => `• ${c.trim()}`).join('\n')}`,
                `⚠️ Risk factors for ${record.Disease}:\n${record.Risk_Factors.split(',').map(r => `• ${r.trim()}`).join('\n')}`,
                `🛡️ Prevention of ${record.Disease}:\n${record.Prevention.split(',').map(p => `• ${p.trim()}`).join('\n')}`
            ];

            return inputs.map((input, index) => ({
                input,
                output: outputs[index]
            }));
        }).flat();

        console.log(`Processed ${this.processedData.length} training examples`);
        return this.processedData;
    }

    getTrainingData() {
        return this.processedData;
    }

    getRandomExample() {
        const randomIndex = Math.floor(Math.random() * this.processedData.length);
        return this.processedData[randomIndex];
    }

    getDiseaseInfo(diseaseName) {
        const disease = this.dataset.find(d => 
            d.Disease.toLowerCase() === diseaseName.toLowerCase()
        );
        
        if (!disease) {
            return null;
        }

        return {
            disease: disease.Disease,
            symptoms: disease.Symptoms.split(',').map(s => s.trim()),
            treatment: disease.Treatment.split(',').map(t => t.trim()),
            causes: disease.Causes.split(',').map(c => c.trim()),
            riskFactors: disease.Risk_Factors.split(',').map(r => r.trim()),
            prevention: disease.Prevention.split(',').map(p => p.trim())
        };
    }

    getAllDiseases() {
        return this.dataset.map(d => d.Disease);
    }
}

module.exports = new DataService(); 