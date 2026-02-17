'use client';

import { useState, useMemo } from 'react';
import { DirectoryListing, ServiceType } from '@/types/directory';
import { cities } from '@/data/cities';
import { formatServiceName } from '@/lib/utils';
import CompanyCard from './CompanyCard';

interface DirectoryFiltersProps {
  listings: DirectoryListing[];
}

const serviceTypes: ServiceType[] = ['heat_pumps', 'air_to_water', 'boilers', 'hybrid'];

export default function DirectoryFilters({ listings }: DirectoryFiltersProps) {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceType | ''>('');

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const cityMatch = !selectedCity || listing.city === selectedCity;
      const serviceMatch = !selectedService || listing.services.includes(selectedService);
      return cityMatch && serviceMatch;
    });
  }, [listings, selectedCity, selectedService]);

  return (
    <div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Installers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
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
              onChange={(e) => setSelectedService(e.target.value as ServiceType | '')}
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

        {(selectedCity || selectedService) && (
          <button
            onClick={() => {
              setSelectedCity('');
              setSelectedService('');
            }}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredListings.length}</span> installer
          {filteredListings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No installers found matching your criteria.</p>
          <button
            onClick={() => {
              setSelectedCity('');
              setSelectedService('');
            }}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <CompanyCard key={listing.slug} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
