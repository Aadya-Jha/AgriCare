import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Activity,
  Clock,
  Filter,
  Printer,
  Mail
} from 'lucide-react';
import { useRealTimeDashboard } from '../hooks/useApi';

interface ReportData {
  id: string;
  title: string;
  date: string;
  type: 'monthly' | 'weekly' | 'custom';
  status: 'completed' | 'generating' | 'scheduled';
}

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [selectedDateRange, setSelectedDateRange] = useState('last-month');
  const [reportType, setReportType] = useState('comprehensive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports] = useState<ReportData[]>([
    {
      id: '1',
      title: 'Monthly Crop Health Report - November 2024',
      date: '2024-11-01',
      type: 'monthly',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Weekly Analysis Report - Week 45',
      date: '2024-11-10',
      type: 'weekly',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Custom Field Analysis - Karnataka Region',
      date: '2024-11-15',
      type: 'custom',
      status: 'generating'
    }
  ]);

  const { data: summary } = useRealTimeDashboard(60000);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Agricultural Report - ${new Date().toLocaleDateString()}`,
    onAfterPrint: () => {
      console.log('Report printed successfully');
    }
  });

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully! Check the History tab.');
    }, 3000);
  };

  const downloadPDF = async (reportId: string) => {
    // In a real application, this would call an API to generate and download the PDF
    const element = document.createElement('a');
    element.href = '#'; // This would be the PDF blob URL
    element.download = `agricultural-report-${reportId}.pdf`;
    element.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-agricare-light-gradient">
          <div>
            <h1 className="text-2xl font-heading font-semibold" style={{color: 'var(--agricare-primary)'}}>
              Agricultural Reports
            </h1>
            <p className="text-gray-600 mt-1">Generate and manage comprehensive farm reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{backgroundColor: 'var(--agricare-sage)', color: 'white'}}
            >
              <Printer className="h-4 w-4" />
              <span>Print Current View</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-8 px-6" aria-label="Report tabs">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'generate'
                ? 'text-green-700 hover:text-green-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              borderBottomColor: activeTab === 'generate' ? 'var(--agricare-primary)' : 'transparent'
            }}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Generate Report</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'text-green-700 hover:text-green-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              borderBottomColor: activeTab === 'history' ? 'var(--agricare-secondary)' : 'transparent'
            }}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Report History</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Report Configuration</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{borderColor: 'var(--agricare-primary)'}}
                  >
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="crop-health">Crop Health Only</option>
                    <option value="soil-analysis">Soil Analysis</option>
                    <option value="pest-management">Pest Management</option>
                    <option value="irrigation">Irrigation Report</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{borderColor: 'var(--agricare-primary)'}}
                  >
                    <option value="last-week">Last Week</option>
                    <option value="last-month">Last Month</option>
                    <option value="last-quarter">Last Quarter</option>
                    <option value="last-year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isGenerating ? 'var(--agricare-sage)' : 'var(--agricare-primary)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Generate & Download Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Monthly Reports Schedule */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Automated Monthly Reports</span>
              </h3>
              
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{color: 'var(--agricare-primary)'}}>
                      Monthly Comprehensive Report
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically generated on the 1st of each month
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next report: December 1st, 2024
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Email delivery enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Report Type:</span>
                  <span className="font-medium capitalize">{reportType.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium capitalize">{selectedDateRange.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">PDF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Size:</span>
                  <span className="font-medium">2.5 MB</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Current Farm Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Crop Health</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {summary?.crop_health?.status || 'Good'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Soil Moisture</span>
                  </div>
                  <span className="text-sm font-medium">
                    {summary?.soil_moisture?.value || 65}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Active Fields</span>
                  </div>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Reports List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Generated Reports</h3>
              <div className="text-sm text-gray-500">
                {generatedReports.length} reports available
              </div>
            </div>

            <div className="space-y-4">
              {generatedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {report.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : report.status === 'generating'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.status === 'completed' && (
                      <button
                        onClick={() => downloadPDF(report.id)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--agricare-light)',
                          color: 'var(--agricare-primary)',
                          border: '1px solid var(--agricare-sage)'
                        }}
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        <span>Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable content */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Agricultural Monitoring Report</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Crop Health Status</h3>
              <p>Status: {summary?.crop_health?.status || 'Good'}</p>
              <p>NDVI: {summary?.crop_health?.ndvi || 0.75}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soil Analysis</h3>
              <p>Moisture: {summary?.soil_moisture?.value || 65}%</p>
              <p>Status: {summary?.soil_moisture?.status || 'Optimal'}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Pest Risk Assessment</h3>
            <p>Risk Level: {summary?.pest_risk?.level || 'Low'}</p>
            <p>Detected Pests: {summary?.pest_risk?.detected_pests?.join(', ') || 'None'}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Irrigation Recommendations</h3>
            <p>Recommendation: {summary?.irrigation_advice?.recommendation || 'Maintain current schedule'}</p>
            <p>Reason: {summary?.irrigation_advice?.reason || 'Soil moisture levels are optimal'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
