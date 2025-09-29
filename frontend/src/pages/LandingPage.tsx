import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  MapPin, 
  Brain, 
  TrendingUp, 
  Leaf, 
  Award, 
  ChevronRight,
  Zap,
  Smartphone
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = "0ms" }) => (
  <div 
    className="feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-agricare-sage/20"
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 bg-agricare-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <div className="text-agricare-primary">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-3 text-agricare-primary">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);



const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-agricare-light via-white to-agricare-sage/30">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-agricare-sage/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-agricare-primary/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-agricare-primary" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-agricare-primary to-agricare-secondary bg-clip-text text-transparent">
                AgriCare
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-agricare-primary transition-colors">Features</a>
              <Link to="/login" className="text-gray-600 hover:text-agricare-primary transition-colors">Sign In</Link>
              <Link 
                to="/signup" 
                className="bg-agricare-primary text-white px-6 py-2 rounded-full hover:bg-agricare-secondary transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hero-content">
              <div className="inline-flex items-center bg-agricare-primary/10 rounded-full px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-agricare-primary mr-2" />
                <span className="text-agricare-primary font-medium">AI-Powered Agricultural Intelligence</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Revolutionizing 
                <span className="block text-agricare-primary">Agriculture</span>
                with Smart Technology
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Empower your farming with real-time crop monitoring, AI-driven insights, 
                and location-based recommendations. Join thousands of farmers and researchers 
                transforming agriculture worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/signup" 
                  className="cta-primary bg-agricare-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-agricare-secondary transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
                >
                  Start Monitoring
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/login"
                  className="cta-secondary border-2 border-agricare-primary text-agricare-primary px-8 py-4 rounded-xl font-semibold hover:bg-agricare-primary hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  Sign In
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>

            </div>
            
            <div className="hero-image relative">
              <div className="floating-card absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-xl border border-agricare-sage/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-agricare-primary">Live Monitoring</span>
                </div>
              </div>
              
              <div className="floating-card absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-xl border border-agricare-sage/20">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-agricare-primary">Crop Health</div>
                    <div className="text-xs text-gray-500">95% Excellent</div>
                  </div>
                </div>
              </div>
              
              <div className="main-hero-image bg-gradient-to-br from-agricare-primary/20 to-agricare-secondary/20 rounded-3xl p-8 backdrop-blur-sm">
                <div className="w-full h-96 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 text-center text-white">
                    <Leaf className="w-24 h-24 mx-auto mb-4 opacity-90" />
                    <p className="text-lg font-medium">Smart Agriculture</p>
                    <p className="text-sm opacity-75">Monitoring Dashboard</p>
                  </div>
                  <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full animate-ping"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/30 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Agricultural Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with agricultural expertise 
              to provide actionable insights for better crop management and higher yields.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Real-time Monitoring"
              description="Track crop health, soil moisture, and environmental conditions with live sensor data updating every 10 minutes."
              delay="100ms"
            />
            
            <FeatureCard
              icon={<MapPin className="w-8 h-8" />}
              title="Location Intelligence"
              description="GPS-based field mapping with location-aware crop recommendations tailored to your specific region."
              delay="200ms"
            />
            
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI-Powered Analysis"
              description="Advanced machine learning algorithms analyze hyperspectral imagery for precise crop health assessment."
              delay="300ms"
            />
            
            <FeatureCard
              icon={<Leaf className="w-8 h-8" />}
              title="State-specific Crop Recommendations"
              description="Personalized crop suggestions for your state with weather-aware suitability scores across multiple crops."
              delay="400ms"
            />
            
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Predictive Analytics"
              description="Forecast crop yields, identify potential issues early, and optimize resource allocation with predictive models."
              delay="500ms"
            />
            
            <FeatureCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Mobile-First Design"
              description="Access your agricultural data anywhere with our responsive design optimized for mobile and tablet devices."
              delay="600ms"
            />
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Agriculture?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of farmers and researchers using AgriCare to optimize 
            their agricultural practices and increase productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-agricare-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-agricare-secondary transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
            >
              <Zap className="mr-2 w-5 h-5" />
              Get Started Free
            </Link>
            <Link 
              to="/login"
              className="border-2 border-agricare-primary text-agricare-primary px-8 py-4 rounded-xl font-semibold hover:bg-agricare-primary hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-agricare-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl font-bold">AgriCare</div>
              </div>
              <p className="text-agricare-light mb-4">
                Empowering agriculture through intelligent technology and data-driven insights 
                for a sustainable future.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-xs">📱</span>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-xs">🌐</span>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-xs">📧</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-agricare-light">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crop Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-agricare-light">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-agricare-light">
            <p>&copy; 2024 AgriCare. All rights reserved. Built with 💚 for farmers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };
export default LandingPage;
