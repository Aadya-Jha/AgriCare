import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error, resetError: () => void}>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                The dashboard encountered an error. This might be due to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Backend server not running</li>
                <li>API connectivity issues</li>
                <li>Data format problems</li>
              </ul>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
              <p className="text-xs text-red-600 font-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p><strong>Troubleshooting:</strong></p>
              <p>1. Make sure backend is running: <code>npm start</code></p>
              <p>2. Check if backend is accessible at: <code>http://localhost:3001</code></p>
              <p>3. Verify API endpoints are responding</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple functional error fallback
export const SimpleErrorFallback: React.FC<{error: Error, resetError: () => void}> = ({
  error,
  resetError,
}) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center mb-3">
      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
      <h3 className="text-red-800 font-medium">Component Error</h3>
    </div>
    <p className="text-red-700 text-sm mb-3">{error.message}</p>
    <button
      onClick={resetError}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
    >
      Try Again
    </button>
  </div>
);
