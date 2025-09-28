import React, { useState, useEffect } from 'react';

const ApiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  
  useEffect(() => {
    const runTests = async () => {
      const tests = {
        health: 'http://localhost:3001/api/health',
        hyperspectralHealth: 'http://localhost:3001/api/hyperspectral/health',
        locations: 'http://localhost:3001/api/hyperspectral/locations'
      };
      
      const results: any = {};
      
      for (const [key, url] of Object.entries(tests)) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          results[key] = { success: true, status: response.status, data };
        } catch (error) {
          results[key] = { success: false, error: (error as Error).message };
        }
      }
      
      setTestResults(results);
    };
    
    runTests();
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 API Connection Test</h2>
      {Object.entries(testResults).map(([test, result]: [string, any]) => (
        <div key={test} style={{ 
          margin: '10px 0', 
          padding: '10px', 
          background: result.success ? '#d4edda' : '#f8d7da',
          borderRadius: '5px'
        }}>
          <h4>{test}: {result.success ? '✅ SUCCESS' : '❌ FAILED'}</h4>
          <pre style={{ fontSize: '12px' }}>
            {result.success 
              ? JSON.stringify(result.data, null, 2)
              : result.error
            }
          </pre>
        </div>
      ))}
    </div>
  );
};

export default ApiTestComponent;
