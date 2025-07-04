import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Shield, 
  Zap,
  FileText,
  Palette,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: FileText,
      title: 'Documentation Services',
      description: 'Comprehensive business plans, financial models, and KYC preparation for global markets.',
    },
    {
      icon: Palette,
      title: 'Digital Services',
      description: 'Professional branding, website design, and digital marketing solutions.',
    },
    {
      icon: TrendingUp,
      title: 'Trade Lead Sourcing',
      description: 'HSN code-based trade lead identification with compliance verification.',
    },
    {
      icon: Globe,
      title: 'Global Compliance',
      description: 'Multi-country tax and regulatory compliance for Singapore, Dubai, Malta, and Cayman Islands.',
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Bank-grade security with AML/CFT compliance and encrypted document storage.',
    },
    {
      icon: Zap,
      title: 'Fast Turnaround',
      description: 'Standard delivery in 7-14 days with rush options available for urgent needs.',
    },
  ];

  const benefits = [
    'Streamlined company formation process',
    'Professional documentation and branding',
    'Global trade opportunities',
    'Regulatory compliance assurance',
    'Dedicated support team',
    'Transparent pricing with no hidden fees',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VB</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                VBannaCorp GlobalSync
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your Global
              <span className="text-blue-600"> Business Formation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive documentation, digital services, and trade lead sourcing 
              for new company formations across key global jurisdictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="lg">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Global Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From documentation to digital presence, we provide comprehensive 
              solutions for your international business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose VBannaCorp GlobalSync?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We specialize in Singapore's trade-driven economy while supporting 
                global expansion with expert knowledge of international regulations 
                and compliance requirements.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Supported Jurisdictions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">Singapore</span>
                  <span className="text-sm text-blue-600">GST 9%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">Dubai</span>
                  <span className="text-sm text-green-600">VAT 5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-900">Malta</span>
                  <span className="text-sm text-purple-600">VAT 18%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-900">Cayman Islands</span>
                  <span className="text-sm text-orange-600">No Direct Tax</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Global Business Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful businesses that trust VBannaCorp GlobalSync 
            for their international expansion needs.
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VB</span>
                </div>
                <span className="ml-2 text-lg font-semibold">VBannaCorp</span>
              </div>
              <p className="text-gray-400">
                Streamlining global business formation with comprehensive 
                documentation and digital services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Business Plans</li>
                <li>KYC Preparation</li>
                <li>Logo Design</li>
                <li>Website Development</li>
                <li>Trade Lead Sourcing</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Jurisdictions</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Singapore</li>
                <li>Dubai</li>
                <li>Malta</li>
                <li>Cayman Islands</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>support@vbannacorp.com</li>
                <li>+65 1234 5678</li>
                <li>Singapore</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VBannaCorp GlobalSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};