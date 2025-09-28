/**
 * API Service Layer
 * Centralized API client for communicating with the Flask backend
 */

export interface DashboardSummary {
  crop_health: {
    status: string;
    ndvi: number;
    confidence: number;
  };
  soil_moisture: {
    value: number;
    unit: string;
    status: string;
    last_updated: string;
  };
  pest_risk: {
    level: string;
    confidence: number;
    detected_pests: string[];
  };
  irrigation_advice: {
    recommendation: string;
    status: string;
    reason: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    last_updated: string;
  };
  field_info: {
    id: number;
    name: string;
    crop_type: string;
    area_hectares: number;
  };
}

export interface Alert {
  id: number;
  field_id: number;
  field_name: string;
  level: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export interface TrendData {
  field_id: number;
  trends: {
    soil_moisture: Array<{ timestamp: string; value: number }>;
    air_temperature: Array<{ timestamp: string; value: number }>;
    humidity: Array<{ timestamp: string; value: number }>;
    ndvi: Array<{ timestamp: string; value: number }>;
  };
}

export interface SensorData {
  id: number;
  sensor_type: string;
  value: number;
  unit: string;
  location_lat?: number;
  location_lng?: number;
  timestamp: string;
  device_id?: string;
  quality_score: number;
}

export interface SensorDataResponse {
  field_id: number;
  field_name: string;
  data: SensorData[];
  count: number;
  filters: {
    sensor_type?: string;
    hours: number;
    limit: number;
  };
}

// ==================== HYPERSPECTRAL ANALYSIS INTERFACES ====================

export interface HealthMetrics {
  overall_health_score: number;
  ndvi: number;
  savi: number;
  evi: number;
  water_stress_index: number;
  chlorophyll_content: number;
  predicted_yield: number;
  pest_risk_score: number;
  disease_risk_score: number;
  recommendations: string[];
}

export interface LocationPrediction {
  location: string;
  coordinates: [number, number];
  state: string;
  climate: string;
  major_crops: string[];
  health_metrics: HealthMetrics;
  analysis_timestamp: string;
}

export interface HyperspectralPredictionsResponse {
  status: string;
  predictions: Record<string, LocationPrediction>;
  model_info: {
    wavelengths: number[];
    num_bands: number;
    locations_analyzed: string[];
  };
  analysis_timestamp: string;
  note?: string;
}

export interface HyperspectralTrainingResult {
  status: string;
  model_path: string;
  accuracy: number;
  num_samples: number;
  num_locations: number;
  wavelength_range: [number, number];
  training_completed: string;
  note?: string;
}

export interface HyperspectralModelInfo {
  model_type: string;
  supported_locations: string[];
  wavelength_range: [number, number];
  num_bands: number;
  health_classes: string[];
  last_updated: string;
  matlab_available: boolean;
}

export interface VegetationIndices {
  ndvi: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  savi: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  evi: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  gndvi: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
  vegetation_coverage: number;
}

export interface HyperspectralHealthAnalysis {
  overall_health_score: number;
  dominant_health_status: string;
  confidence: number;
  excellent_percent: number;
  good_percent: number;
  fair_percent: number;
  poor_percent: number;
  pixels_analyzed: number;
}

export interface HyperspectralProcessingResult {
  status: string;
  input_image: string;
  conversion_method: string;
  health_analysis: HyperspectralHealthAnalysis;
  vegetation_indices: VegetationIndices;
  hyperspectral_bands: number;
  wavelength_range: [number, number];
  visualization_path?: string;
  analysis_timestamp: string;
  recommendations: string[];
  original_filename?: string;
  file_size_mb?: number;
}

// ==================== AGRICULTURAL IMAGE ANALYSIS INTERFACES ====================

export interface DiseaseDetection {
  disease: string;
  confidence: number;
  description: string;
  recommended_actions: string[];
}

export interface ImageFeatures {
  color_distribution: {
    green_percentage: number;
    brown_percentage: number;
    yellow_percentage: number;
    red_percentage: number;
  };
  texture_analysis: {
    smoothness: number;
    roughness: number;
    uniformity: number;
  };
  shape_analysis: {
    leaf_area_coverage: number;
    edge_detection_score: number;
    symmetry_score: number;
  };
  statistical_measures: {
    mean_intensity: number;
    standard_deviation: number;
    contrast_ratio: number;
  };
}

export interface ImageAnalysisSummary {
  primary_detection: DiseaseDetection;
  all_detections: DiseaseDetection[];
  overall_health_score: number;
  health_status: string;
  confidence: number;
}

export interface ImageAnalysisResult {
  status: string;
  crop_type: string;
  analysis_summary: ImageAnalysisSummary;
  image_properties: {
    format: string;
    resolution: string;
    file_size_kb: number;
    quality_score: number;
  };
  recommendations: {
    immediate_actions: string[];
    monitoring_advice: string[];
    preventive_measures: string[];
  };
  analysis_metadata: {
    model_version: string;
    processing_time_ms: number;
    analysis_timestamp: string;
    accuracy_estimate: number;
  };
  input_file?: {
    filename: string;
    size_bytes: number;
    crop_type_specified: string;
    upload_timestamp: string;
  };
  image_features?: ImageFeatures;
}

export interface BatchAnalysisResult {
  status: string;
  batch_summary: {
    total_images: number;
    successful_analyses: number;
    failed_analyses: number;
    crop_type: string;
    batch_timestamp: string;
    overall_statistics?: {
      average_health_score: number;
      min_health_score: number;
      max_health_score: number;
      healthy_count: number;
      at_risk_count: number;
    };
  };
  individual_results: Array<{
    image_index: number;
    filename: string;
    analysis: ImageAnalysisResult;
    file_size_bytes: number;
  }>;
}

export interface CropType {
  common_diseases: string[];
  season: string;
}

export interface DiseaseInfo {
  description: string;
  confidence_threshold: number;
  recommended_actions: string[];
}

export interface CropTypesResponse {
  status: string;
  supported_crops: Record<string, CropType>;
  total_crops: number;
  detectable_diseases: Record<string, DiseaseInfo>;
  total_diseases: number;
  timestamp: string;
}

export interface DiseaseInfoResponse {
  status: string;
  disease_name: string;
  disease_info: DiseaseInfo;
  commonly_affected_crops: string[];
  prevention_tips: string[];
  timestamp: string;
}

export interface ImageAnalysisHealthResponse {
  status: string;
  service: string;
  model_available: boolean;
  simulation_mode: boolean;
  supported_formats: string[];
  max_file_size: string;
  supported_crops: string[];
  detectable_conditions: string[];
  processing_capabilities: string[];
  timestamp: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Prefer environment override; otherwise default to same-origin API
    // This avoids localhost references in production (Render)
    const envBase = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
    if (envBase) {
      this.baseURL = envBase;
    } else if (typeof window !== 'undefined') {
      this.baseURL = `${window.location.origin}/api`;
    } else {
      this.baseURL = '/api';
    }

    this.token = localStorage.getItem('auth_token');
    
    // Clean up old backend switching preferences
    localStorage.removeItem('backend_preference');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, remove it
          this.clearToken();
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // ==================== HYPERSPECTRAL PROCESSING METHODS ====================
  
  async processHyperspectralImage(formData: FormData): Promise<any> {
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };
    
    // Remove Content-Type header to let browser set it with boundary for FormData
    return this.request('/hyperspectral/process-image', config);
  }
  
  async getHyperspectralHealth(): Promise<any> {
    return this.request('/hyperspectral/health');
  }
  
  async getSupportedLocations(): Promise<any> {
    return this.request('/hyperspectral/locations');
  }
  
  async predictLocationHealth(location: string): Promise<LocationPrediction> {
    return this.request(`/hyperspectral/predict-location/${encodeURIComponent(location)}`);
  }
  
  async trainHyperspectralModel(): Promise<HyperspectralTrainingResult> {
    return this.request('/hyperspectral/train', {
      method: 'POST',
    });
  }
  
  async getHyperspectralPredictionsAll(): Promise<HyperspectralPredictionsResponse> {
    return this.request('/hyperspectral/predict-all');
  }
  
  async batchProcessImages(formData: FormData): Promise<any> {
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };
    
    return this.request('/hyperspectral/batch-process', config);
  }
  
  async getHyperspectralDemo(): Promise<any> {
    return this.request('/hyperspectral/demo');
  }

  // ==================== KARNATAKA CROP RECOMMENDATION METHODS ====================
  
  async getKarnatakaLocations(): Promise<any> {
    return this.request('/karnataka/locations');
  }
  
  async getLocationWeather(location: string): Promise<any> {
    return this.request(`/karnataka/weather/${encodeURIComponent(location)}`);
  }
  
  async getCropRecommendations(location: string, count: number = 3): Promise<any> {
    return this.request(`/karnataka/crop-recommendations/${encodeURIComponent(location)}?count=${count}`);
  }
  
  async getComprehensiveAnalysis(location: string): Promise<any> {
    return this.request(`/karnataka/comprehensive-analysis/${encodeURIComponent(location)}`);
  }
  
  async getCropGrowthPlan(cropName: string): Promise<any> {
    return this.request(`/crop/growth-plan/${encodeURIComponent(cropName)}`);
  }
  
  async getCropDatabase(): Promise<any> {
    return this.request('/crop/database');
  }

  async login(username: string, password: string): Promise<{ access_token: string; user: any }> {
    // For now, use mock authentication since our backend auth might not be fully set up
    if (username === 'admin' && password === 'admin123') {
      const mockToken = 'mock_jwt_token_' + Date.now();
      this.setToken(mockToken);
      return {
        access_token: mockToken,
        user: { id: 1, username: 'admin', name: 'Administrator' }
      };
    }
    
    // Try actual backend login as fallback
    try {
      return this.request<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    } catch (error) {
      throw new Error('Invalid username or password');
    }
  }

  async register(userData: {
    username: string;
    password: string;
    email: string;
    full_name?: string;
  }): Promise<{ message: string; user: any }> {
    return this.request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard APIs
  async getDashboardSummary(): Promise<DashboardSummary> {
    // Dashboard summary doesn't require auth in our current backend
    return this.requestWithoutAuth<DashboardSummary>('/dashboard/summary');
  }

  async getAlerts(): Promise<{ alerts: Alert[] }> {
    // Backend exposes alerts at /api/alerts
    return this.requestWithoutAuth<{ alerts: Alert[] }>('/alerts');
  }

  async getTrends(fieldId: number = 1): Promise<TrendData> {
    // Trends available at /api/trends (optionally /api/trends/:field_id)
    return this.requestWithoutAuth<TrendData>('/trends');
  }

  // Request method without authentication headers
  private async requestWithoutAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Sensor APIs
  async getSensorData(
    fieldId: number,
    sensorType?: string,
    hours: number = 24,
    limit: number = 100
  ): Promise<SensorDataResponse> {
    const params = new URLSearchParams({
      ...(sensorType && { sensor_type: sensorType }),
      hours: hours.toString(),
      limit: limit.toString(),
    });
    
    return this.request<SensorDataResponse>(`/sensors/data/${fieldId}?${params}`);
  }

  async addSensorData(data: {
    field_id: number;
    sensor_type: string;
    value: number;
    unit?: string;
    location_lat?: number;
    location_lng?: number;
    device_id?: string;
    quality_score?: number;
    timestamp?: string;
  }): Promise<{ message: string; data: any }> {
    return this.request<{ message: string; data: any }>('/sensors/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSensorTypes(): Promise<{ sensor_types: Array<{
    type: string;
    description: string;
    unit: string;
  }> }> {
    return this.request<{ sensor_types: Array<{
      type: string;
      description: string;
      unit: string;
    }> }>('/sensors/types');
  }

  // Image Processing APIs
  async uploadImage(formData: FormData): Promise<{ 
    message: string; 
    job_id: string; 
    estimated_processing_time: number;
  }> {
    return this.request<{ 
      message: string; 
      job_id: string; 
      estimated_processing_time: number;
    }>('/images/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });
  }

  async getImageStatus(jobId: string): Promise<{
    job_id: string;
    status: string;
    progress: number;
    result?: any;
    error?: string;
  }> {
    return this.request<{
      job_id: string;
      status: string;
      progress: number;
      result?: any;
      error?: string;
    }>(`/images/status/${jobId}`);
  }

  async getSpectralIndices(imageId: number): Promise<{
    image_id: number;
    indices: {
      ndvi: number[][];
      savi: number[][];
      evi: number[][];
      mcari: number[][];
    };
    metadata: any;
  }> {
    return this.request<{
      image_id: number;
      indices: {
        ndvi: number[][];
        savi: number[][];
        evi: number[][];
        mcari: number[][];
      };
      metadata: any;
    }>(`/images/indices/${imageId}`);
  }

  // Prediction APIs
  async predictCropHealth(fieldId: number): Promise<{
    field_id: number;
    predictions: {
      health_score: number;
      disease_risk: string;
      pest_risk: string;
      yield_prediction: number;
      recommendations: string[];
    };
  }> {
    return this.request<{
      field_id: number;
      predictions: {
        health_score: number;
        disease_risk: string;
        pest_risk: string;
        yield_prediction: number;
        recommendations: string[];
      };
    }>(`/predictions/crop-health/${fieldId}`, {
      method: 'POST',
    });
  }

  async predictPests(fieldId: number): Promise<{
    field_id: number;
    predictions: {
      pest_types: string[];
      risk_level: string;
      confidence: number;
      treatment_recommendations: string[];
    };
  }> {
    return this.request<{
      field_id: number;
      predictions: {
        pest_types: string[];
        risk_level: string;
        confidence: number;
        treatment_recommendations: string[];
      };
    }>(`/predictions/pests/${fieldId}`, {
      method: 'POST',
    });
  }

  // ==================== HYPERSPECTRAL ANALYSIS APIS (Legacy) ====================

  async getHyperspectralPredictions(): Promise<HyperspectralPredictionsResponse> {
    return this.requestWithoutAuth<HyperspectralPredictionsResponse>('/hyperspectral/predictions');
  }

  async getLocationPrediction(locationName: string): Promise<LocationPrediction> {
    return this.requestWithoutAuth<LocationPrediction>(`/hyperspectral/predictions/${locationName}`);
  }

  async getHyperspectralModelInfo(): Promise<HyperspectralModelInfo> {
    return this.requestWithoutAuth<HyperspectralModelInfo>('/hyperspectral/model-info');
  }

  // ==================== AGRICULTURAL IMAGE ANALYSIS METHODS ====================
  
  async getImageAnalysisHealth(): Promise<ImageAnalysisHealthResponse> {
    return this.requestWithoutAuth<ImageAnalysisHealthResponse>('/image-analysis/health');
  }

  async analyzeAgricultureImage(formData: FormData): Promise<ImageAnalysisResult> {
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };
    
    // Remove Content-Type header to let browser set it with boundary for FormData
    return this.request('/image-analysis/analyze', config);
  }

  async batchAnalyzeImages(formData: FormData): Promise<BatchAnalysisResult> {
    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };
    
    return this.request('/image-analysis/batch-analyze', config);
  }

  async getSupportedCropTypes(): Promise<CropTypesResponse> {
    return this.requestWithoutAuth<CropTypesResponse>('/image-analysis/crop-types');
  }

  async getDiseaseInformation(diseaseName: string): Promise<DiseaseInfoResponse> {
    return this.requestWithoutAuth<DiseaseInfoResponse>(`/image-analysis/disease-info/${encodeURIComponent(diseaseName)}`);
  }

  async getImageAnalysisDemo(): Promise<any> {
    return this.requestWithoutAuth('/image-analysis/demo');
  }
}

export const apiService = new ApiService();
export default apiService;
