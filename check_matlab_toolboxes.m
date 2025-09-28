%% MATLAB Toolbox Verification Script
% This script checks which toolboxes are installed and identifies missing ones
% needed for the hyperspectral processing system

fprintf('=== MATLAB Toolbox Verification ===\n\n');

% Get all installed toolboxes
installed_toolboxes = ver;

% Required toolboxes for hyperspectral processing
required_toolboxes = {
    'Deep Learning Toolbox', 'deepLearning_toolbox';
    'Image Processing Toolbox', 'image_toolbox';
    'Statistics and Machine Learning Toolbox', 'statistics_toolbox';
    'Computer Vision Toolbox', 'vision_toolbox';
    'Signal Processing Toolbox', 'signal_toolbox';
    'Mapping Toolbox', 'map_toolbox';
    'Hyperspectral Imaging Library', 'hyperspectral_toolbox'
};

fprintf('Checking required toolboxes:\n');
fprintf('%-40s %s\n', 'Toolbox Name', 'Status');
fprintf('%s\n', repmat('-', 1, 55));

missing_critical = {};
missing_optional = {};

for i = 1:size(required_toolboxes, 1)
    toolbox_name = required_toolboxes{i, 1};
    
    % Check if toolbox is installed
    is_installed = false;
    for j = 1:length(installed_toolboxes)
        if contains(installed_toolboxes(j).Name, toolbox_name, 'IgnoreCase', true)
            is_installed = true;
            break;
        end
    end
    
    % Determine if toolbox is critical or optional
    is_critical = i <= 3; % First 3 are critical
    
    if is_installed
        fprintf('%-40s ✓ INSTALLED\n', toolbox_name);
    else
        if is_critical
            fprintf('%-40s ✗ MISSING (CRITICAL)\n', toolbox_name);
            missing_critical{end+1} = toolbox_name;
        else
            fprintf('%-40s ✗ MISSING (OPTIONAL)\n', toolbox_name);
            missing_optional{end+1} = toolbox_name;
        end
    end
end

fprintf('\n=== Summary ===\n');
if isempty(missing_critical)
    fprintf('✓ All critical toolboxes are installed!\n');
else
    fprintf('✗ Missing %d critical toolbox(es):\n', length(missing_critical));
    for i = 1:length(missing_critical)
        fprintf('  - %s\n', missing_critical{i});
    end
end

if ~isempty(missing_optional)
    fprintf('⚠ Missing %d optional toolbox(es):\n', length(missing_optional));
    for i = 1:length(missing_optional)
        fprintf('  - %s\n', missing_optional{i});
    end
end

fprintf('\n=== Function Availability Tests ===\n');

% Test critical functions
function_tests = {
    'trainNetwork', 'Deep Learning Toolbox';
    'sequenceInputLayer', 'Deep Learning Toolbox';
    'convolution1dLayer', 'Deep Learning Toolbox';
    'imread', 'Image Processing Toolbox';
    'imshow', 'Image Processing Toolbox';
    'prctile', 'Statistics and Machine Learning Toolbox';
    'smoothdata', 'Signal Processing Toolbox';
    'hypercube', 'Hyperspectral Imaging Library'
};

fprintf('Testing key functions:\n');
fprintf('%-25s %-30s %s\n', 'Function', 'Required Toolbox', 'Status');
fprintf('%s\n', repmat('-', 1, 65));

for i = 1:size(function_tests, 1)
    func_name = function_tests{i, 1};
    toolbox_name = function_tests{i, 2};
    
    try
        if exist(func_name, 'builtin') || exist(func_name, 'file')
            fprintf('%-25s %-30s ✓ AVAILABLE\n', func_name, toolbox_name);
        else
            fprintf('%-25s %-30s ✗ NOT FOUND\n', func_name, toolbox_name);
        end
    catch
        fprintf('%-25s %-30s ✗ ERROR\n', func_name, toolbox_name);
    end
end

fprintf('\n=== Installation Recommendations ===\n');

if ~isempty(missing_critical)
    fprintf('CRITICAL: Install these toolboxes immediately:\n');
    for i = 1:length(missing_critical)
        fprintf('  1. %s\n', missing_critical{i});
        switch missing_critical{i}
            case 'Deep Learning Toolbox'
                fprintf('     - Required for CNN training and inference\n');
                fprintf('     - Fixes "predict" and "trainNetwork" errors\n');
            case 'Image Processing Toolbox'
                fprintf('     - Required for image loading and processing\n');
                fprintf('     - Fixes image manipulation errors\n');
            case 'Statistics and Machine Learning Toolbox'
                fprintf('     - Required for statistical analysis\n');
                fprintf('     - Fixes percentile calculation errors\n');
        end
        fprintf('\n');
    end
end

fprintf('To install missing toolboxes:\n');
fprintf('1. Open MATLAB\n');
fprintf('2. Go to Home > Add-Ons > Get Add-Ons\n');
fprintf('3. Search for the toolbox name\n');
fprintf('4. Click Install\n');
fprintf('5. Restart MATLAB\n\n');

fprintf('Alternative: Use MATLAB Add-On Manager command:\n');
fprintf('>> addon.install.toolbox\n\n');

fprintf('=== Verification Complete ===\n');
fprintf('Re-run the hyperspectral test after installing missing toolboxes:\n');
fprintf('>> python test_hyperspectral_pipeline.py\n');
