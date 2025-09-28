%% Compatibility Layer for MATLAB Deep Learning Functions
% This script resolves function conflicts and version compatibility issues

% Main execution
fprintf('Setting up MATLAB compatibility layer...\n');

% Add necessary paths
current_dir = fileparts(mfilename('fullpath'));
parent_dir = fileparts(current_dir);
addpath(genpath(parent_dir));

% Check MATLAB version
matlab_version = version('-release');
year = str2double(matlab_version(1:4));

fprintf('MATLAB Version: %s\n', matlab_version);

if year < 2019
    warning('MATLAB version older than 2019b detected. Some functions may not work as expected.');
end

% Test critical functions
test_deep_learning_functions();

function test_deep_learning_functions()
    fprintf('Testing Deep Learning Toolbox functions...\n');
    
    try
        % Test basic layer creation
        input_layer = sequenceInputLayer(10);
        fprintf('✓ sequenceInputLayer working\n');
        
        % Test convolution layer
        conv_layer = convolution1dLayer(3, 16);
        fprintf('✓ convolution1dLayer working\n');
        
        % Test network creation (simple)
        layers = [
            sequenceInputLayer(10)
            fullyConnectedLayer(4)
            softmaxLayer
            classificationLayer
        ];
        
        % Test if we can create a network (don't train it)
        fprintf('✓ Layer array creation working\n');
        
        % Test predict function disambiguation
        test_predict_function();
        
    catch ME
        fprintf('✗ Error in deep learning functions: %s\n', ME.message);
        suggest_fixes(ME);
    end
end

function test_predict_function()
    % Test which predict function is being called
    
    try
        % Create simple test data
        test_data = randn(1, 10);
        
        % Try to determine which predict function is active
        help_text = help('predict');
        
        if contains(help_text, 'Deep Learning', 'IgnoreCase', true)
            fprintf('✓ Deep Learning Toolbox predict function is active\n');
        elseif contains(help_text, 'Statistics', 'IgnoreCase', true)
            fprintf('⚠ Statistics Toolbox predict function is active (may cause conflicts)\n');
        else
            fprintf('? Unknown predict function variant detected\n');
        end
        
    catch ME
        fprintf('✗ Error testing predict function: %s\n', ME.message);
    end
end

function suggest_fixes(ME)
    fprintf('\n=== Suggested Fixes ===\n');
    
    error_msg = ME.message;
    
    if contains(error_msg, 'predict', 'IgnoreCase', true)
        fprintf('PREDICT FUNCTION CONFLICT:\n');
        fprintf('1. Try: net_predict = @(net, X) net.predict(X);\n');
        fprintf('2. Or use full qualification: deeplearning.predict(net, X)\n');
        fprintf('3. Check function precedence with: which predict -all\n');
    end
    
    if contains(error_msg, 'Invalid network', 'IgnoreCase', true)
        fprintf('NETWORK CREATION ISSUE:\n');
        fprintf('1. Check layer compatibility\n');
        fprintf('2. Verify input/output dimensions match\n');
        fprintf('3. Try creating network with: net = assembleNetwork(layers)\n');
    end
    
    if contains(error_msg, 'trainNetwork', 'IgnoreCase', true)
        fprintf('TRAINING ISSUE:\n');
        fprintf('1. Check training data format\n');
        fprintf('2. Verify labels are categorical or one-hot encoded\n');
        fprintf('3. Check training options compatibility\n');
    end
end

