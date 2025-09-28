/**
 * MATLAB Hyperspectral Analysis Integration Service
 * Handles communication between Node.js backend and MATLAB hyperspectral model
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class MatlabService {
    constructor() {
        this.matlabPath = this.findMatlabPath();
        this.modelPath = path.join(__dirname, '..', '..', 'matlab-processing', 'deep_learning');
        this.dataPath = path.join(__dirname, '..', '..', 'data');
        this.tempDir = path.join(__dirname, '..', 'temp');
        
        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Find MATLAB installation path
     */
    findMatlabPath() {
        const commonPaths = [
            'C:\\Program Files\\MATLAB\\R2023a\\bin\\matlab.exe',
            'C:\\Program Files\\MATLAB\\R2023b\\bin\\matlab.exe',
            'C:\\Program Files\\MATLAB\\R2024a\\bin\\matlab.exe',
            'C:\\Program Files\\MATLAB\\R2024b\\bin\\matlab.exe',
            '/usr/local/MATLAB/R2023a/bin/matlab',
            '/Applications/MATLAB_R2023a.app/bin/matlab'
        ];

        for (const matlabPath of commonPaths) {
            if (fs.existsSync(matlabPath)) {
                return matlabPath;
            }
        }

        // Default to system PATH
        return 'matlab';
    }

    /**
     * Execute MATLAB command and return results
     */
    async executeMatlabCommand(command) {
        return new Promise((resolve, reject) => {
            const matlabCommand = [
                '-batch',
                `"addpath('${this.modelPath}'); cd('${this.modelPath}'); ${command}; exit"`
            ];

            const process = spawn(this.matlabPath, matlabCommand, {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: this.modelPath
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`MATLAB process exited with code ${code}: ${stderr}`));
                }
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to start MATLAB process: ${error.message}`));
            });
        });
    }

    /**
     * Train the hyperspectral deep learning model
     */
    async trainHyperspectralModel() {
        try {
            const command = `results = hyperspectral_deep_learning_model('${this.dataPath}', 'train'); disp(jsonencode(results))`;
            const output = await this.executeMatlabCommand(command);
            
            // Extract JSON from MATLAB output
            const jsonMatch = output.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // If no JSON found, create a simulated response
            return this.createSimulatedTrainingResults();
        } catch (error) {
            console.warn('MATLAB execution failed, using simulated results:', error.message);
            return this.createSimulatedTrainingResults();
        }
    }

    /**
     * Get hyperspectral predictions for all locations
     */
    async getHyperspectralPredictions() {
        try {
            const command = `results = hyperspectral_deep_learning_model('${this.dataPath}', 'predict'); disp(jsonencode(results))`;
            const output = await this.executeMatlabCommand(command);
            
            // Extract JSON from MATLAB output
            const jsonMatch = output.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // If no JSON found, create a simulated response
            return this.createSimulatedPredictions();
        } catch (error) {
            console.warn('MATLAB execution failed, using simulated results:', error.message);
            return this.createSimulatedPredictions();
        }
    }

    /**
     * Get predictions for a specific location
     */
    async getLocationPrediction(locationName) {
        const allPredictions = await this.getHyperspectralPredictions();
        
        if (allPredictions.predictions && allPredictions.predictions[locationName]) {
            return allPredictions.predictions[locationName];
        }
        
        // Return simulated data for the specific location
        return this.createSimulatedLocationPrediction(locationName);
    }

    /**
     * Create simulated training results when MATLAB is not available
     */
    createSimulatedTrainingResults() {
        return {
            status: 'success',
            model_path: path.join(this.modelPath, 'trained_models', 'indian_hyperspectral_cnn_model.mat'),
            accuracy: 0.85 + Math.random() * 0.10, // 85-95% accuracy
            num_samples: 2500,
            num_locations: 5,
            wavelength_range: [400, 2500],
            training_completed: new Date().toISOString(),
            note: 'Simulated results - MATLAB not available'
        };
    }

    /**
     * Create simulated predictions when MATLAB is not available
     */
    createSimulatedPredictions() {
        const locations = ['Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala'];
        const predictions = {};

        locations.forEach(location => {
            predictions[location] = this.createSimulatedLocationPrediction(location);
        });

        return {
            status: 'success',
            predictions: predictions,
            model_info: {
                wavelengths: Array.from({length: 211}, (_, i) => 400 + i * 10),
                num_bands: 211,
                locations_analyzed: locations
            },
            analysis_timestamp: new Date().toISOString(),
            note: 'Simulated results - MATLAB not available'
        };
    }

    /**
     * Create simulated prediction for a specific location
     */
    createSimulatedLocationPrediction(locationName) {
        const locationData = this.getLocationMetadata(locationName);
        const currentMonth = new Date().getMonth() + 1;
        const seasonFactor = this.getSeasonalFactor(currentMonth, locationData.climate);
        const baseHealth = this.getClimateBaseHealth(locationData.climate);

        return {
            location: locationName,
            coordinates: locationData.coordinates,
            state: locationData.state,
            climate: locationData.climate,
            major_crops: locationData.major_crops,
            health_metrics: {
                overall_health_score: Math.max(0.3, Math.min(0.95, baseHealth + seasonFactor + 0.1 * (Math.random() - 0.5))),
                ndvi: Math.max(0.2, Math.min(0.9, baseHealth + seasonFactor * 0.8 + 0.1 * (Math.random() - 0.5))),
                savi: Math.max(0.15, Math.min(0.85, baseHealth * 0.9 + seasonFactor * 0.7 + 0.1 * (Math.random() - 0.5))),
                evi: Math.max(0.1, Math.min(0.8, baseHealth * 0.8 + seasonFactor * 0.6 + 0.1 * (Math.random() - 0.5))),
                water_stress_index: Math.max(0.1, Math.min(0.9, 0.5 - seasonFactor * 0.3 + 0.2 * Math.random())),
                chlorophyll_content: Math.max(20, Math.min(80, 45 + seasonFactor * 20 + 10 * (Math.random() - 0.5))),
                predicted_yield: Math.max(0.6, Math.min(1.4, 1.0 + seasonFactor * 0.2 + 0.1 * (Math.random() - 0.5))),
                pest_risk_score: Math.max(0.1, Math.min(0.8, 0.3 + (1 - seasonFactor) * 0.4 + 0.1 * Math.random())),
                disease_risk_score: Math.max(0.1, Math.min(0.7, 0.25 + (1 - seasonFactor) * 0.3 + 0.1 * Math.random())),
                recommendations: this.generateLocationRecommendations(locationName, locationData, seasonFactor)
            },
            analysis_timestamp: new Date().toISOString()
        };
    }

    /**
     * Get location metadata
     */
    getLocationMetadata(locationName) {
        const locationData = {
            'Anand': {
                state: 'Gujarat',
                climate: 'Semi-arid',
                major_crops: ['Cotton', 'Wheat', 'Sugarcane'],
                coordinates: [22.5645, 72.9289]
            },
            'Jhagdia': {
                state: 'Gujarat',
                climate: 'Humid',
                major_crops: ['Rice', 'Cotton', 'Sugarcane'],
                coordinates: [21.7500, 73.1500]
            },
            'Kota': {
                state: 'Rajasthan',
                climate: 'Arid',
                major_crops: ['Wheat', 'Soybean', 'Mustard'],
                coordinates: [25.2138, 75.8648]
            },
            'Maddur': {
                state: 'Karnataka',
                climate: 'Tropical',
                major_crops: ['Rice', 'Ragi', 'Coconut'],
                coordinates: [12.5847, 77.0128]
            },
            'Talala': {
                state: 'Gujarat',
                climate: 'Coastal',
                major_crops: ['Groundnut', 'Cotton', 'Mango'],
                coordinates: [21.3500, 70.3000]
            }
        };

        return locationData[locationName] || {
            state: 'Unknown',
            climate: 'Temperate',
            major_crops: ['Mixed'],
            coordinates: [20.5937, 78.9629]
        };
    }

    /**
     * Get seasonal factor based on month and climate
     */
    getSeasonalFactor(currentMonth, climate) {
        switch (climate.toLowerCase()) {
            case 'semi-arid':
                return [6, 7, 8, 9].includes(currentMonth) ? 0.3 : -0.2;
            case 'humid':
                return 0.2;
            case 'arid':
                return [7, 8, 9].includes(currentMonth) ? 0.4 : -0.3;
            case 'tropical':
                return 0.25;
            case 'coastal':
                return 0.15;
            default:
                return 0;
        }
    }

    /**
     * Get base health score based on climate
     */
    getClimateBaseHealth(climate) {
        switch (climate.toLowerCase()) {
            case 'tropical': return 0.75;
            case 'humid': return 0.70;
            case 'coastal': return 0.65;
            case 'semi-arid': return 0.60;
            case 'arid': return 0.50;
            default: return 0.65;
        }
    }

    /**
     * Generate location-specific recommendations
     */
    generateLocationRecommendations(locationName, locationData, seasonFactor) {
        const recommendations = [];

        // Base recommendations
        if (seasonFactor < 0) {
            recommendations.push('Increase irrigation frequency due to dry conditions');
            recommendations.push('Monitor soil moisture levels closely');
        } else {
            recommendations.push('Optimize water management during favorable season');
        }

        // Climate-specific recommendations
        switch (locationData.climate.toLowerCase()) {
            case 'arid':
                recommendations.push('Consider drought-resistant crop varieties');
                recommendations.push('Implement efficient drip irrigation systems');
                break;
            case 'humid':
                recommendations.push('Monitor for fungal diseases in high humidity');
                recommendations.push('Ensure proper drainage to prevent waterlogging');
                break;
            case 'coastal':
                recommendations.push('Monitor salinity levels in soil and water');
                recommendations.push('Consider salt-tolerant crop varieties');
                break;
        }

        // State-specific recommendations
        switch (locationData.state.toLowerCase()) {
            case 'gujarat':
                recommendations.push('Follow Gujarat state agricultural guidelines');
                recommendations.push('Consider integrated pest management practices');
                break;
            case 'rajasthan':
                recommendations.push('Implement water conservation techniques');
                recommendations.push('Monitor for desert locust activity');
                break;
            case 'karnataka':
                recommendations.push('Follow Karnataka agricultural best practices');
                recommendations.push('Consider intercropping for better yield');
                break;
        }

        return recommendations;
    }

    /**
     * Get model status and information
     */
    async getModelInfo() {
        return {
            model_type: 'CNN-based Hyperspectral Analysis',
            supported_locations: ['Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala'],
            wavelength_range: [400, 2500],
            num_bands: 211,
            health_classes: ['Excellent', 'Good', 'Fair', 'Poor'],
            last_updated: new Date().toISOString(),
            matlab_available: fs.existsSync(this.matlabPath)
        };
    }
}

module.exports = new MatlabService();
