%% Demo Script: RGB to Hyperspectral Conversion and Crop Health Analysis
% This script demonstrates how to use the advanced hyperspectral deep learning model
% to convert normal RGB crop images to hyperspectral analysis and get health insights
%
% Usage Examples:
% 1. Train model: demo_rgb_to_hyperspectral('train')
% 2. Convert RGB image: demo_rgb_to_hyperspectral('convert', 'path/to/crop_image.jpg')
% 3. Predict health for location: demo_rgb_to_hyperspectral('predict', 'Anand')

function results = demo_rgb_to_hyperspectral(mode, varargin)
    if nargin < 1
        mode = 'demo';
    end
    
    % Add the deep learning model to path
    addpath('deep_learning');
    
    fprintf('=== RGB to Hyperspectral Conversion Demo ===\n');
    fprintf('Mode: %s\n', mode);
    
    try
        switch lower(mode)
            case 'train'
                % Train the hyperspectral deep learning model
                fprintf('\n--- Training Hyperspectral Deep Learning Model ---\n');
                results = advanced_hyperspectral_dl_model('mode', 'train');
                
                if strcmp(results.status, 'success')
                    fprintf('\nTraining completed successfully!\n');
                    fprintf('Model accuracy: %.2f%%\n', results.accuracy * 100);
                    fprintf('Model saved to: %s\n', results.model_path);
                else
                    fprintf('Training failed: %s\n', results.message);
                end
                
            case 'convert'
                % Convert RGB image to hyperspectral analysis
                if nargin >= 2
                    image_path = varargin{1};
                else
                    % Use default demo image path
                    image_path = create_demo_image();
                end
                
                fprintf('\n--- Converting RGB Image to Hyperspectral Analysis ---\n');
                results = advanced_hyperspectral_dl_model('mode', 'convert_image', ...
                    'input_image', image_path);
                
                if strcmp(results.status, 'success')
                    fprintf('\nConversion completed successfully!\n');
                    display_conversion_results(results);
                else
                    fprintf('Conversion failed: %s\n', results.message);
                end
                
            case 'predict'
                % Predict crop health for a specific Indian location
                if nargin >= 2
                    location = varargin{1};
                else
                    location = 'Anand'; % Default location
                end
                
                fprintf('\n--- Predicting Crop Health for Location: %s ---\n', location);
                results = advanced_hyperspectral_dl_model('mode', 'predict', ...
                    'location', location);
                
                if strcmp(results.status, 'success')
                    fprintf('\nPrediction completed successfully!\n');
                    display_prediction_results(results);
                else
                    fprintf('Prediction failed: %s\n', results.message);
                end
                
            case 'demo'
                % Run complete demonstration
                fprintf('\n--- Running Complete Demonstration ---\n');
                results = run_complete_demo();
                
            otherwise
                error('Unknown mode: %s. Valid modes: train, convert, predict, demo', mode);
        end
        
    catch ME
        fprintf('Error in demo: %s\n', ME.message);
        results = struct('status', 'error', 'message', ME.message);
    end
end

function results = run_complete_demo()
    fprintf('\n=== Complete RGB to Hyperspectral Demo ===\n');
    
    demo_results = struct();
    
    % Step 1: Create a demo RGB crop image
    fprintf('\n1. Creating demo crop image...\n');
    demo_image_path = create_demo_image();
    demo_results.demo_image = demo_image_path;
    
    % Step 2: Convert RGB to hyperspectral and analyze
    fprintf('\n2. Converting RGB to hyperspectral analysis...\n');
    conversion_results = advanced_hyperspectral_dl_model('mode', 'convert_image', ...
        'input_image', demo_image_path);
    demo_results.conversion = conversion_results;
    
    if strcmp(conversion_results.status, 'success')
        display_conversion_results(conversion_results);
    end
    
    % Step 3: Predict health for all Indian locations
    fprintf('\n3. Predicting crop health for Indian locations...\n');
    locations = {'Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala'};
    location_results = {};
    
    for i = 1:length(locations)
        location = locations{i};
        fprintf('\n   Analyzing %s...\n', location);
        
        pred_result = advanced_hyperspectral_dl_model('mode', 'predict', ...
            'location', location);
        
        location_results{i} = pred_result;
        
        if strcmp(pred_result.status, 'success')
            fprintf('   %s: Health Score = %.3f (%s)\n', ...
                location, pred_result.health_metrics.overall_health_score, ...
                pred_result.health_metrics.dominant_class);
        end
    end
    
    demo_results.location_predictions = location_results;
    
    % Step 4: Generate summary report
    fprintf('\n4. Generating summary report...\n');
    generate_demo_summary_report(demo_results);
    
    results = demo_results;
    results.status = 'success';
    
    fprintf('\n=== Demo completed successfully! ===\n');
    fprintf('Check the output_visualizations folder for generated images and reports.\n');
end

function demo_image_path = create_demo_image()
    % Create a synthetic crop image for demonstration
    output_dir = '../demo_images';
    if ~exist(output_dir, 'dir')
        mkdir(output_dir);
    end
    
    demo_image_path = fullfile(output_dir, 'demo_crop_field.jpg');
    
    if exist(demo_image_path, 'file')
        fprintf('Using existing demo image: %s\n', demo_image_path);
        return;
    end
    
    fprintf('Creating synthetic crop field image...\n');
    
    % Create a synthetic crop field image (400x300 pixels)
    height = 300;
    width = 400;
    
    % Create base soil background (brown color)
    soil_color = [0.6, 0.4, 0.2]; % RGB values for soil
    img = repmat(reshape(soil_color, 1, 1, 3), height, width, 1);
    
    % Add crop rows (green vegetation)
    crop_rows = 5;
    row_width = 30;
    row_spacing = width / crop_rows;
    
    for i = 1:crop_rows
        row_center = round(i * row_spacing - row_spacing/2);
        row_start = max(1, row_center - row_width/2);
        row_end = min(width, row_center + row_width/2);
        
        % Create vegetation color with some variation
        veg_intensity = 0.8 + 0.2 * rand(); % Random vegetation vigor
        green_color = [0.2, veg_intensity, 0.3]; % Healthy vegetation color
        
        % Apply to crop row with some height variation
        for y = 1:height
            height_factor = 0.7 + 0.3 * sin(y/height * pi); % Vary crop height
            crop_color = green_color * height_factor + soil_color * (1 - height_factor);
            
            img(y, row_start:row_end, :) = repmat(reshape(crop_color, 1, 1, 3), 1, row_end-row_start+1, 1);
        end
    end
    
    % Add some noise and texture
    noise = 0.05 * randn(height, width, 3);
    img = img + noise;
    
    % Ensure valid RGB range
    img = max(0, min(1, img));
    
    % Save the image
    imwrite(img, demo_image_path);
    fprintf('Demo crop field image created: %s\n', demo_image_path);
end

function display_conversion_results(results)
    fprintf('\n--- Conversion Results ---\n');
    fprintf('Input image: %s\n', results.input_image);
    fprintf('Hyperspectral bands generated: %d\n', results.hyperspectral_bands);
    fprintf('Wavelength range: %.1f - %.1f nm\n', results.wavelength_range(1), results.wavelength_range(2));
    
    % Health analysis
    health = results.health_analysis;
    fprintf('\n--- Health Analysis ---\n');
    fprintf('Overall health score: %.3f\n', health.overall_health_score);
    fprintf('Dominant health status: %s\n', health.dominant_health_status);
    fprintf('Confidence: %.1f%%\n', health.confidence * 100);
    fprintf('Pixels analyzed: %d\n', health.pixels_analyzed);
    
    % Class distribution
    fprintf('\nHealth distribution:\n');
    fprintf('  Excellent: %.1f%%\n', health.excellent_percent);
    fprintf('  Good: %.1f%%\n', health.good_percent);
    fprintf('  Fair: %.1f%%\n', health.fair_percent);
    fprintf('  Poor: %.1f%%\n', health.poor_percent);
    
    % Vegetation indices
    veg_indices = results.vegetation_indices;
    fprintf('\n--- Vegetation Indices ---\n');
    fprintf('NDVI: %.3f (±%.3f)\n', veg_indices.ndvi.mean, veg_indices.ndvi.std);
    fprintf('SAVI: %.3f (±%.3f)\n', veg_indices.savi.mean, veg_indices.savi.std);
    fprintf('EVI: %.3f (±%.3f)\n', veg_indices.evi.mean, veg_indices.evi.std);
    fprintf('GNDVI: %.3f (±%.3f)\n', veg_indices.gndvi.mean, veg_indices.gndvi.std);
    
    fprintf('\nVegetation coverage: %.1f%%\n', veg_indices.vegetation_coverage);
    fprintf('Healthy vegetation: %.1f%%\n', veg_indices.healthy_vegetation_percent);
    
    % Recommendations
    fprintf('\n--- Recommendations ---\n');
    recommendations = results.recommendations;
    for i = 1:length(recommendations)
        fprintf('%d. %s\n', i, recommendations{i});
    end
    
    if isfield(results, 'visualization_path')
        fprintf('\nVisualization saved to: %s\n', results.visualization_path);
    end
end

function display_prediction_results(results)
    fprintf('\n--- Prediction Results for %s ---\n', results.location);
    fprintf('Coordinates: [%.4f, %.4f]\n', results.coordinates(1), results.coordinates(2));
    
    % Health metrics
    health = results.health_metrics;
    fprintf('\n--- Health Metrics ---\n');
    fprintf('Overall health score: %.3f\n', health.overall_health_score);
    fprintf('Dominant class: %s\n', health.dominant_class);
    fprintf('Average NDVI: %.3f\n', health.average_ndvi);
    fprintf('Samples analyzed: %d\n', health.samples_analyzed);
    
    % Recommendations
    fprintf('\n--- Location-Specific Recommendations ---\n');
    recommendations = results.recommendations;
    for i = 1:length(recommendations)
        fprintf('%d. %s\n', i, recommendations{i});
    end
end

function generate_demo_summary_report(demo_results)
    % Generate a comprehensive summary report
    output_dir = '../output_visualizations';
    if ~exist(output_dir, 'dir')
        mkdir(output_dir);
    end
    
    report_path = fullfile(output_dir, 'hyperspectral_demo_report.txt');
    
    fid = fopen(report_path, 'w');
    if fid == -1
        fprintf('Warning: Could not create summary report file\n');
        return;
    end
    
    fprintf(fid, '=== RGB to Hyperspectral Conversion Demo Report ===\n');
    fprintf(fid, 'Generated on: %s\n\n', datestr(now));
    
    % Image conversion results
    if isfield(demo_results, 'conversion') && strcmp(demo_results.conversion.status, 'success')
        conv = demo_results.conversion;
        fprintf(fid, '--- RGB Image Analysis Results ---\n');
        fprintf(fid, 'Input image: %s\n', conv.input_image);
        fprintf(fid, 'Overall health score: %.3f\n', conv.health_analysis.overall_health_score);
        fprintf(fid, 'Dominant health status: %s\n', conv.health_analysis.dominant_health_status);
        fprintf(fid, 'NDVI: %.3f\n', conv.vegetation_indices.ndvi.mean);
        fprintf(fid, 'Vegetation coverage: %.1f%%\n\n', conv.vegetation_indices.vegetation_coverage);
    end
    
    % Location predictions
    if isfield(demo_results, 'location_predictions')
        fprintf(fid, '--- Indian Agricultural Locations Analysis ---\n');
        locations = {'Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala'};
        
        for i = 1:length(demo_results.location_predictions)
            pred = demo_results.location_predictions{i};
            if strcmp(pred.status, 'success')
                fprintf(fid, '%s (%.4f, %.4f):\n', pred.location, pred.coordinates(1), pred.coordinates(2));
                fprintf(fid, '  Health Score: %.3f (%s)\n', ...
                    pred.health_metrics.overall_health_score, pred.health_metrics.dominant_class);
                fprintf(fid, '  Average NDVI: %.3f\n', pred.health_metrics.average_ndvi);
                fprintf(fid, '  Key Recommendation: %s\n\n', pred.recommendations{1});
            end
        end
    end
    
    fprintf(fid, '--- Technology Summary ---\n');
    fprintf(fid, 'This demonstration showcases:\n');
    fprintf(fid, '1. RGB to hyperspectral conversion using deep learning\n');
    fprintf(fid, '2. Automated crop health assessment\n');
    fprintf(fid, '3. Vegetation index calculation (NDVI, SAVI, EVI, GNDVI)\n');
    fprintf(fid, '4. Location-specific agricultural recommendations\n');
    fprintf(fid, '5. Multi-spectral analysis for precision agriculture\n\n');
    
    fprintf(fid, 'Indian Agricultural Locations Covered:\n');
    fprintf(fid, '- Anand, Gujarat (Semi-arid climate)\n');
    fprintf(fid, '- Jhagdia, Gujarat (Humid climate)\n');
    fprintf(fid, '- Kota, Rajasthan (Arid climate)\n');
    fprintf(fid, '- Maddur, Karnataka (Tropical climate)\n');
    fprintf(fid, '- Talala, Gujarat (Coastal climate)\n\n');
    
    fprintf(fid, 'Applications:\n');
    fprintf(fid, '- Precision agriculture and crop monitoring\n');
    fprintf(fid, '- Early stress and disease detection\n');
    fprintf(fid, '- Yield prediction and optimization\n');
    fprintf(fid, '- Resource management (water, fertilizer)\n');
    fprintf(fid, '- Climate-specific agricultural recommendations\n');
    
    fclose(fid);
    
    fprintf('Summary report saved to: %s\n', report_path);
end

function show_usage()
    fprintf('\n=== Usage Examples ===\n');
    fprintf('1. Train the hyperspectral model:\n');
    fprintf('   demo_rgb_to_hyperspectral(''train'')\n\n');
    
    fprintf('2. Convert RGB image to hyperspectral analysis:\n');
    fprintf('   demo_rgb_to_hyperspectral(''convert'', ''path/to/crop_image.jpg'')\n\n');
    
    fprintf('3. Predict crop health for specific location:\n');
    fprintf('   demo_rgb_to_hyperspectral(''predict'', ''Anand'')\n\n');
    
    fprintf('4. Run complete demonstration:\n');
    fprintf('   demo_rgb_to_hyperspectral(''demo'')\n\n');
    
    fprintf('5. Available Indian locations:\n');
    fprintf('   Anand, Jhagdia, Kota, Maddur, Talala\n\n');
end

% Display usage if run without arguments
if nargin == 0 && nargout == 0
    show_usage();
end
