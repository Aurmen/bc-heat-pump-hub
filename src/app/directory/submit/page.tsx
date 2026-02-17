'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DirectorySubmitPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    region: '',
    services: [] as string[],
    emergency_service: '',
    brands_supported: '',
    fsr_license: '',
    gas_fitter_license: '',
    hpcn_certified: '',
    years_experience: '',
    service_areas: '',
    notes: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const serviceOptions = [
    { value: 'heat_pumps', label: 'Air-Source Heat Pumps' },
    { value: 'air_to_water', label: 'Air-to-Water Heat Pumps' },
    { value: 'boilers', label: 'Boilers' },
    { value: 'hybrid', label: 'Hybrid Systems' },
    { value: 'service', label: 'Service & Repair' },
    { value: 'maintenance', label: 'Maintenance Contracts' },
  ];

  const regionOptions = [
    'Lower Mainland',
    'Vancouver Island',
    'Interior',
    'Northern BC',
  ];

  const handleServiceChange = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Using Web3Forms (free email service for static sites)
      // Get your access key at: https://web3forms.com
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY', // Replace with actual key
          subject: `New Directory Submission: ${formData.company_name}`,
          from_name: formData.company_name,
          ...formData,
          services: formData.services.join(', '),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          website: '',
          address: '',
          city: '',
          region: '',
          services: [],
          emergency_service: '',
          brands_supported: '',
          fsr_license: '',
          gas_fitter_license: '',
          hpcn_certified: '',
          years_experience: '',
          service_areas: '',
          notes: '',
        });
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit. Please email us directly.');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/directory" className="hover:text-primary-600">Directory</Link>
        <span className="mx-2">/</span>
        <span>Submit Your Company</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Add Your Company to Our Directory
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Join BC's trusted heat pump and boiler installer directory. Get found by homeowners searching for qualified contractors.
      </p>

      {/* Benefits */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Why List Your Company?</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-success-600 mt-1">✓</span>
            <span><strong>Free basic listing</strong> - No cost to get started</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success-600 mt-1">✓</span>
            <span><strong>Quality leads</strong> - Homeowners actively researching heat pumps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success-600 mt-1">✓</span>
            <span><strong>BC-specific</strong> - Targeted to your service areas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success-600 mt-1">✓</span>
            <span><strong>Verified credentials</strong> - We check licensing to build trust</span>
          </li>
        </ul>
      </div>

      {/* Submission Form */}
      {status === 'success' ? (
        <div className="bg-success-50 border-2 border-success-500 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Received!</h2>
          <p className="text-gray-700 mb-6">
            Thank you for submitting your company. We'll verify your licensing with Technical Safety BC and add you to the directory within 2-3 business days.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            You'll receive a confirmation email at <strong>{formData.email}</strong> once your listing is live.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Submit Another Company
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="ABC Heat Pump Services Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => updateField('contact_name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="info@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="604-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="https://www.yourcompany.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="123 Main St, Vancouver, BC V6B 1A1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Primary City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="Vancouver"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Region *
                </label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="">Select region...</option>
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Services Offered</h2>

            <div className="space-y-3 mb-6">
              {serviceOptions.map(service => (
                <label key={service.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service.value)}
                    onChange={() => handleServiceChange(service.value)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-900">{service.label}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  24/7 Emergency Service?
                </label>
                <select
                  value={formData.emergency_service}
                  onChange={(e) => updateField('emergency_service', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Years in Business
                </label>
                <input
                  type="number"
                  value={formData.years_experience}
                  onChange={(e) => updateField('years_experience', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="15"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Brands Supported (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.brands_supported}
                  onChange={(e) => updateField('brands_supported', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="Mitsubishi, Daikin, Fujitsu, Carrier"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Service Areas (cities/regions you serve)
                </label>
                <textarea
                  value={formData.service_areas}
                  onChange={(e) => updateField('service_areas', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  rows={3}
                  placeholder="Vancouver, Burnaby, Richmond, North Vancouver, West Vancouver..."
                />
              </div>
            </div>
          </div>

          {/* Licensing & Certifications */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Licensing & Certifications</h2>
            <p className="text-sm text-gray-600 mb-6">
              We verify all licenses with Technical Safety BC before adding to directory
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  FSR License # (Refrigeration) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fsr_license}
                  onChange={(e) => updateField('fsr_license', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="FSR-XXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for heat pump installation
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Gas Fitter License # (if applicable)
                </label>
                <input
                  type="text"
                  value={formData.gas_fitter_license}
                  onChange={(e) => updateField('gas_fitter_license', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="GF-XXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for boiler work
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  HPCN Certified?
                </label>
                <select
                  value={formData.hpcn_certified}
                  onChange={(e) => updateField('hpcn_certified', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Heat Pump Contractors Network certification
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notes (specialties, unique services, etc.)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                rows={4}
                placeholder="Tell us about your company's specialties, experience with specific systems (air-to-water, cold climate), or any unique services you offer..."
              />
            </div>
          </div>

          {/* Submit */}
          {status === 'error' && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
              <p className="text-red-800 font-semibold">Submission Error</p>
              <p className="text-red-700 text-sm">{errorMessage || 'Please try again or email us directly at contact@canadianheatpumphub.ca'}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-gradient-accent text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit for Review'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            By submitting, you confirm that all information is accurate and you hold valid BC licensing for services listed.
          </p>
        </form>
      )}

      {/* What Happens Next */}
      <div className="mt-12 bg-blue-50 border-l-4 border-primary-500 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">What Happens Next?</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary-600">1.</span>
            <span>We verify your FSR license with Technical Safety BC</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary-600">2.</span>
            <span>Your listing is added to the directory (2-3 business days)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary-600">3.</span>
            <span>You receive a confirmation email when live</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary-600">4.</span>
            <span>Homeowners can find you when searching for qualified installers</span>
          </li>
        </ol>
        <p className="text-sm text-gray-700 mt-4">
          <strong>Questions?</strong> Email us at{' '}
          <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 underline">
            contact@canadianheatpumphub.ca
          </a>
        </p>
      </div>
    </div>
  );
}
