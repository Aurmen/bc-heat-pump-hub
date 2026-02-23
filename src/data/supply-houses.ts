export interface SupplyHouseLocation {
  city: string;
  address: string;
  phone: string;
  region: 'Lower Mainland' | 'Vancouver Island' | 'Interior' | 'Northern BC';
  label?: string; // e.g. "Burnaby South", "Surrey DC"
}

export interface SupplyHouseData {
  slug: string;
  name: string;
  shortName?: string;
  website: string;
  description: string;
  /** Brand names carried — must match brands.ts name values for cross-linking */
  brands: string[];
  locations: SupplyHouseLocation[];
}

export const supplyHouses: SupplyHouseData[] = [
  {
    slug: 'rsl',
    name: 'Refrigerative Supply Limited',
    shortName: 'RSL',
    website: 'https://www.rsl.ca',
    description:
      "BC's largest wholesale HVAC/R distributor. RSL stocks heat pumps, mini-splits, refrigerants, parts, and accessories across 22 BC branches — from the Lower Mainland to the Interior. Primary wholesale source for many of BC's heat pump and refrigeration contractors.",
    brands: [
      'Mitsubishi',
      'Daikin',
      'LG',
      'Samsung',
      'Bosch',
      'Carrier',
      'Lennox',
    ],
    locations: [
      {
        label: 'Burnaby South',
        city: 'Burnaby',
        address: '8028 North Fraser Way, Burnaby, BC',
        phone: '604-454-5075',
        region: 'Lower Mainland',
      },
      {
        label: 'Burnaby North',
        city: 'Burnaby',
        address: '3958 Myrtle St, Burnaby, BC',
        phone: '604-435-1313',
        region: 'Lower Mainland',
      },
      {
        city: 'Coquitlam',
        address: '108-2440 Canoe Ave, Coquitlam, BC',
        phone: '604-944-0441',
        region: 'Lower Mainland',
      },
      {
        city: 'Vancouver',
        address: '132 2nd Ave W, Vancouver, BC',
        phone: '604-872-7521',
        region: 'Lower Mainland',
      },
      {
        city: 'Langley',
        address: '20392 65 Ave, Langley, BC',
        phone: '604-539-2290',
        region: 'Lower Mainland',
      },
      {
        label: 'Surrey DC',
        city: 'Surrey',
        address: '110-19225 32nd Ave, Surrey, BC',
        phone: '604-670-9041',
        region: 'Lower Mainland',
      },
      {
        city: 'Abbotsford',
        address: '101-2480 Mt. Lehman Road, Abbotsford, BC',
        phone: '778-856-0580',
        region: 'Lower Mainland',
      },
      {
        city: 'Nanaimo',
        address: '2262 Dorman Rd, Nanaimo, BC',
        phone: '250-758-7751',
        region: 'Vancouver Island',
      },
      {
        city: 'Victoria',
        address: '2885 Quesnel St, Victoria, BC',
        phone: '250-475-6055',
        region: 'Vancouver Island',
      },
      {
        city: 'Kelowna',
        address: '1885 Baron Rd, Kelowna, BC',
        phone: '250-763-3114',
        region: 'Interior',
      },
      // TODO: Add remaining 12 RSL locations (11–22)
    ],
  },
];

export function getSupplyHouseBySlug(slug: string): SupplyHouseData | undefined {
  return supplyHouses.find(s => s.slug === slug);
}

/** Returns all supply houses that carry a given brand (case-insensitive match) */
export function getSupplyHousesByBrand(brandName: string): SupplyHouseData[] {
  const lower = brandName.toLowerCase();
  return supplyHouses.filter(s =>
    s.brands.some(b => b.toLowerCase() === lower)
  );
}

/** Returns all supply houses with a location in a given city */
export function getSupplyHousesByCity(city: string): SupplyHouseData[] {
  const lower = city.toLowerCase();
  return supplyHouses.filter(s =>
    s.locations.some(l => l.city.toLowerCase() === lower)
  );
}

/** Returns all unique cities covered by a supply house */
export function getUniqueCities(house: SupplyHouseData): string[] {
  return [...new Set(house.locations.map(l => l.city))];
}
