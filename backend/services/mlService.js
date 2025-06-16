const { spawn } = require('child_process');
const path = require('path');

class MLService {
    constructor() {
        this.modelPath = path.join(__dirname, '../ml/model.pkl');
        this.isTraining = false;
    }

    async trainModel(dataset) {
        try {
            if (this.isTraining) {
                return { status: 'training', message: 'Model is already being trained' };
            }

            this.isTraining = true;
            console.log('Training model with Python...');
            
            return new Promise((resolve, reject) => {
                const pythonProcess = spawn('python', [
                    path.join(__dirname, '../ml/train_model.py')
                ]);

                let output = '';

                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                    console.log(data.toString());
                });

                pythonProcess.stderr.on('data', (data) => {
                    console.error(data.toString());
                });

                pythonProcess.on('close', (code) => {
                    this.isTraining = false;
                    if (code === 0) {
                        console.log('Model training completed');
                        resolve({ status: 'success', message: 'Model training completed', output });
                    } else {
                        reject(new Error(`Python process exited with code ${code}`));
                    }
                });
            });
        } catch (error) {
            this.isTraining = false;
            console.error('Error training model:', error);
            throw error;
        }
    }

    async generateResponse(input) {
        try {
            if (this.isTraining) {
                throw new Error('Model is currently being trained. Please try again later.');
            }

            return new Promise((resolve, reject) => {
                const pythonProcess = spawn('python', [
                    path.join(__dirname, '../ml/generate_response.py'),
                    input
                ]);

                let response = '';

                pythonProcess.stdout.on('data', (data) => {
                    response += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    console.error(data.toString());
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve(response.trim());
                    } else {
                        reject(new Error(`Python process exited with code ${code}`));
                    }
                });
            });
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    async saveModel(path) {
        // Model is already saved by Python script
        return true;
    }

    async loadModel(path) {
        // Model is loaded by Python script when needed
        return true;
    }
}

module.exports = new MLService(); 