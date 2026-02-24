'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DirectoryListing, ServiceType, AudienceType, SpecialtyKey } from '@/types/directory';
import { cities } from '@/data/cities';
import { formatServiceName, filterByAudience } from '@/lib/utils';
import CompanyCard from './CompanyCard';

interface DirectoryFiltersProps {
  listings: DirectoryListing[];
  initialAudience?: string;
}

const serviceTypes: ServiceType[] = ['heat_pumps', 'air_to_water', 'boilers', 'hybrid'];

const specialtyOptions: { key: SpecialtyKey; label: string; description: string }[] = [
  { key: 'ems_certified', label: 'EMS / Load Management', description: 'DCC-9/DCC-12 experience for 100A panels' },
  { key: 'strata_approved', label: 'Strata & Condo', description: 'History of strata/condo installations' },
  { key: 'cold_climate_pro', label: 'Cold Climate (-15°C+)', description: 'Specializes in Interior sub -15°C installs' },
];

export default function DirectoryFilters({ listings, initialAudience }: DirectoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const [selectedAudience, setSelectedAudience] = useState<string>(initialAudience || '');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || '');
  const [selectedService, setSelectedService] = useState<ServiceType | ''>((searchParams.get('service') as ServiceType) || '');
  const [selectedSpecialties, setSelectedSpecialties] = useState<SpecialtyKey[]>(
    (searchParams.get('specialties')?.split(',').filter(Boolean) as SpecialtyKey[]) || []
  );

  // Update URL when filters change
  const updateURL = (audience: string, city: string, service: string, specialties: SpecialtyKey[]) => {
    const params = new URLSearchParams();
    if (audience) params.set('audience', audience);
    if (city) params.set('city', city);
    if (service) params.set('service', service);
    if (specialties.length > 0) params.set('specialties', specialties.join(','));

    const queryString = params.toString();
    router.push(`/directory${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleAudienceChange = (audience: string) => {
    setSelectedAudience(audience);
    updateURL(audience, selectedCity, selectedService, selectedSpecialties);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    updateURL(selectedAudience, city, selectedService, selectedSpecialties);
  };

  const handleServiceChange = (service: string) => {
    setSelectedService(service as ServiceType | '');
    updateURL(selectedAudience, selectedCity, service, selectedSpecialties);
  };

  const handleSpecialtyToggle = (key: SpecialtyKey) => {
    const updated = selectedSpecialties.includes(key)
      ? selectedSpecialties.filter(s => s !== key)
      : [...selectedSpecialties, key];
    setSelectedSpecialties(updated);
    updateURL(selectedAudience, selectedCity, selectedService, updated);
  };

  const filteredListings = useMemo(() => {
    let results = listings;

    // Apply audience filter
    results = filterByAudience(results, selectedAudience);

    // Apply city filter
    if (selectedCity) {
      results = results.filter(listing => listing.city === selectedCity);
    }

    // Apply service filter
    if (selectedService) {
      results = results.filter(listing => listing.services.includes(selectedService));
    }

    // Apply specialty filters (AND logic — all selected must match)
    if (selectedSpecialties.length > 0) {
      results = results.filter(listing =>
        selectedSpecialties.every(s => listing.specialties?.[s] === true)
      );
    }

    return results;
  }, [listings, selectedAudience, selectedCity, selectedService, selectedSpecialties]);

  const clearAllFilters = () => {
    setSelectedAudience('');
    setSelectedCity('');
    setSelectedService('');
    setSelectedSpecialties([]);
    router.push('/directory', { scroll: false });
  };

  const hasActiveFilters = selectedAudience || selectedCity || selectedService || selectedSpecialties.length > 0;

  return (
    <div>
      {/* Audience Quick Selector - Prominent at top */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">I'm looking for installers as a:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleAudienceChange('residential')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-left ${
              selectedAudience === 'residential'
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <div>
                <div className="font-bold">Homeowner</div>
                <div className="text-xs opacity-80">Residential projects</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAudienceChange('commercial')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-left ${
              selectedAudience === 'commercial'
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🏢</span>
              <div>
                <div className="font-bold">Facilities Manager</div>
                <div className="text-xs opacity-80">Commercial projects</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAudienceChange('')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-left ${
              !selectedAudience
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🔍</span>
              <div>
                <div className="font-bold">Show All</div>
                <div className="text-xs opacity-80">All contractors</div>
              </div>
            </div>
          </button>
        </div>

        {selectedAudience && (
          <div className="mt-3 text-sm text-gray-600 bg-white rounded p-3">
            {selectedAudience === 'residential' && (
              <p>Showing contractors that serve homeowners. We emphasize emergency service availability, approachability, and local presence.</p>
            )}
            {selectedAudience === 'commercial' && (
              <p>Showing contractors with commercial capabilities. We emphasize professional licensing, capacity, and technical credentials.</p>
            )}
          </div>
        )}
      </div>

      {/* Traditional Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city.slug} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              id="service"
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Services</option>
              {serviceTypes.map(service => (
                <option key={service} value={service}>
                  {formatServiceName(service)}
                </option>
              ))}
            </select>
          </div>
        </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Specialties</p>
            <div className="space-y-2">
              {specialtyOptions.map(({ key, label, description }) => (
                <label key={key} className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(key)}
                    onChange={() => handleSpecialtyToggle(key)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                    <span className="text-xs text-gray-400">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredListings.length}</span> installer
          {filteredListings.length !== 1 ? 's' : ''}
          {selectedAudience && (
            <span className="text-primary-600 font-medium">
              {' '}for {selectedAudience === 'residential' ? 'homeowners' : 'commercial projects'}
            </span>
          )}
        </p>
      </div>

      {/* Results Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No installers found matching your criteria.</p>
          <button
            onClick={clearAllFilters}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <CompanyCard
              key={listing.slug}
              listing={listing}
              audienceContext={selectedAudience as AudienceType | undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
