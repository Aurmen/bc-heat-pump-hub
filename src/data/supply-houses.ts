export interface SupplyHouseLocation {
  city: string;
  address?: string;
  phone?: string;
  region: 'Lower Mainland' | 'Vancouver Island' | 'Interior' | 'Northern BC';
  label?: string; // e.g. "Burnaby South", "Surrey DC"
}

/**
 * wholesale     – Counter walk-in; sells to licensed contractors
 * direct        – Manufacturer-owned distribution center (no middleman)
 * commercial_rep – Commercial/applied equipment rep; no counter walk-in
 * limited       – Primarily other products; limited HP equipment stock
 */
export type DistributorType = 'wholesale' | 'direct' | 'commercial_rep' | 'limited';

export interface SupplyHouseData {
  slug: string;
  name: string;
  shortName?: string;
  website: string;
  description: string;
  distributorType: DistributorType;
  /** Optional clarifying note shown on detail page */
  typeNote?: string;
  /** Brand names carried — must match brands.ts name values for cross-linking */
  brands: string[];
  locations: SupplyHouseLocation[];
}

export const DISTRIBUTOR_TYPE_LABEL: Record<DistributorType, string> = {
  wholesale: 'Wholesale Counter',
  direct: 'Direct to Contractor',
  commercial_rep: 'Commercial Rep',
  limited: 'Limited HP Stock',
};

export const supplyHouses: SupplyHouseData[] = [

  // ── Full-service wholesale counters ──────────────────────────────────

  {
    slug: 'rsl',
    name: 'Refrigerative Supply Limited',
    shortName: 'RSL',
    website: 'https://www.rsl.ca',
    distributorType: 'wholesale',
    description:
      "BC's largest wholesale HVAC/R distributor. RSL stocks heat pumps, ductless mini-splits, VRF systems, refrigerants, parts, and accessories across 22 BC branches — from the Lower Mainland to the Interior. Primary wholesale source for the majority of BC's heat pump and refrigeration contractors.",
    brands: [
      'Daikin',
      'Samsung',
      'AirEase',
      'Ducane',
      'Allied Commercial',
      'Rheem',
      'Hisense',
      'ClimateMaster',
      'Friedrich',
      'Olimpia Splendid',
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
      // TODO: 12 additional RSL locations to be added (22 total BC branches)
    ],
  },

  {
    slug: 'andrew-sheret',
    name: 'Andrew Sheret',
    website: 'https://www.sheret.com',
    distributorType: 'wholesale',
    typeNote: 'Primarily a plumbing and hydronics supply house. Heat pump equipment is limited and varies by branch — confirm availability by calling before sourcing HP equipment.',
    description:
      'Plumbing and hydronics supply house with BC Interior locations. Andrew Sheret primarily serves the plumbing contractor market and is not a primary source for heat pump equipment. Useful for hydronics-related components (piping, manifolds, controls) for air-to-water HP systems.',
    brands: [],
    locations: [
      {
        city: 'Kamloops',
        region: 'Interior',
      },
      {
        city: 'Penticton',
        region: 'Interior',
      },
      {
        city: 'Castlegar',
        region: 'Interior',
      },
      {
        city: 'Prince George',
        region: 'Northern BC',
      },
    ],
  },

  {
    slug: 'ecco-supply',
    name: 'ECCO Supply',
    website: 'https://www.eccosupply.ca',
    distributorType: 'wholesale',
    description:
      'HVAC/R wholesale distributor with BC branches serving the Interior and Vancouver Island. ECCO carries Armstrong Air, Napoleon, Samsung, Bosch, and LG — making them a strong source for ducted and ductless residential heat pumps in Kelowna and Victoria markets.',
    brands: [
      'Armstrong Air',
      'Napoleon',
      'Samsung',
      'Bosch',
      'LG',
    ],
    locations: [
      {
        city: 'Kelowna',
        region: 'Interior',
      },
      {
        city: 'Victoria',
        region: 'Vancouver Island',
      },
    ],
  },

  {
    slug: 'wolseley-canada',
    name: 'Wolseley Canada',
    website: 'https://www.wolseleyinc.ca',
    distributorType: 'wholesale',
    description:
      'National wholesale distributor of plumbing, HVAC, and industrial products with strong BC Interior and Northern BC presence. Wolseley carries GE, LG, KeepRite, and International Comfort Products for residential and light commercial heat pumps. Good source for Interior and Northern BC contractors.',
    brands: [
      'GE',
      'LG',
      'KeepRite',
    ],
    locations: [
      {
        city: 'Vancouver',
        region: 'Lower Mainland',
      },
      {
        city: 'Kelowna',
        region: 'Interior',
      },
      {
        city: 'Kamloops',
        region: 'Interior',
      },
      {
        city: 'Cranbrook',
        region: 'Interior',
      },
      {
        city: 'Prince George',
        region: 'Northern BC',
      },
    ],
  },

  {
    slug: 'johnstone-supply',
    name: 'Johnstone Supply',
    website: 'https://www.johnstonesupply.com',
    distributorType: 'wholesale',
    description:
      'Franchise-based HVAC/R wholesale counter with multiple BC locations. Johnstone carries Daikin, Fujitsu, Goodman, Bosch, and Coleman — a strong mix for residential ductless and ducted installs. Franchise model means stock and service levels vary by branch.',
    brands: [
      'Daikin',
      'Fujitsu',
      'Goodman',
      'Bosch',
      'Coleman',
    ],
    locations: [
      // Multiple BC franchise locations — contact johnstonesupply.com to find your nearest branch
      {
        city: 'Vancouver',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'surrey-hvac-supply',
    name: 'Surrey HVAC Supply',
    website: 'https://www.surreyhvac.ca',
    distributorType: 'wholesale',
    description:
      'Lower Mainland HVAC supply counter serving Surrey and surrounding communities. Surrey HVAC Supply is the authorized BC distributor for Maytag residential heat pumps. Good local option for contractors working in the Fraser Valley and South Surrey/White Rock.',
    brands: [
      'Maytag',
    ],
    locations: [
      {
        city: 'Surrey',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'pacaire',
    name: 'Pacaire HVAC Supply',
    shortName: 'Pacaire',
    website: 'https://www.pacaire.ca',
    distributorType: 'limited',
    typeNote: 'Primarily sheet metal, ducting, and accessories. Heat pump equipment lines vary by branch — call to confirm availability before sourcing.',
    description:
      'BC HVAC supply house primarily serving the sheet metal, ducting, and accessory market. Multiple BC locations. Heat pump equipment stock varies — best used for ductwork, grilles, fittings, and HVAC accessories rather than as a primary HP equipment source.',
    brands: [],
    locations: [
      {
        city: 'Vancouver',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'sinclair-supply',
    name: 'Sinclair Supply',
    website: 'https://www.sinclairsupply.ca',
    distributorType: 'wholesale',
    description:
      "Western Canada's exclusive wholesale distributor for ICP brands — KeepRite, Tempstar, and affiliated residential and light commercial heat pump lines. In operation for over 75 years with 7 BC branches from Surrey to Terrace, Sinclair carries one of the largest HVAC/R inventories in Canada: ducted heat pumps, ductless mini-splits, controls, refrigerants, sheet metal, and accessories. Contractor accounts required; not open to the public.",
    brands: [
      'KeepRite',
      'Tempstar',
    ],
    locations: [
      {
        city: 'Surrey',
        address: '13155 82A Ave, Surrey, BC V3W 9Y6',
        phone: '604-543-6310',
        region: 'Lower Mainland',
      },
      {
        city: 'Nanaimo',
        address: '2254 McGarrigle Road, Nanaimo, BC V9S 4M6',
        phone: '250-756-0741',
        region: 'Vancouver Island',
      },
      {
        city: 'Victoria',
        address: '585 Bay Street, Victoria, BC V8T 1P5',
        region: 'Vancouver Island',
      },
      {
        city: 'Kelowna',
        address: '1820 Kirschner Road, Kelowna, BC V1Y 4N6',
        phone: '250-862-3577',
        region: 'Interior',
      },
      {
        city: 'Kamloops',
        address: '961 Laval Crescent, Kamloops, BC V2C 5P4',
        phone: '250-372-8898',
        region: 'Interior',
      },
      {
        city: 'Prince George',
        address: '749 3rd Avenue, Prince George, BC V2L 3C6',
        phone: '250-563-2404',
        region: 'Northern BC',
      },
      {
        city: 'Terrace',
        address: '4931 Keith Avenue, Terrace, BC V8G 1K7',
        region: 'Northern BC',
      },
    ],
  },

  // ── Manufacturer direct-to-contractor ────────────────────────────────

  {
    slug: 'carrier-enterprise',
    name: 'Carrier Enterprise Canada',
    shortName: 'Carrier Enterprise',
    website: 'https://www.carrierenterprise.ca',
    distributorType: 'direct',
    typeNote: 'Carrier Enterprise is the factory-owned distribution arm of Carrier Global — selling Carrier, Bryant, and Payne equipment directly to authorized dealers with no third-party markup.',
    description:
      "Carrier Global's factory-owned distribution centers for BC, selling the full Carrier, Bryant, and Payne heat pump lineup directly to authorized contractors. Lower Mainland (Burnaby), Interior (Kelowna), and Langley distribution centre provide province-wide coverage.",
    brands: [
      'Carrier',
      'Bryant',
      'Payne',
    ],
    locations: [
      {
        city: 'Burnaby',
        region: 'Lower Mainland',
      },
      {
        city: 'Langley',
        label: 'Langley Distribution Centre',
        region: 'Lower Mainland',
      },
      {
        city: 'Kelowna',
        region: 'Interior',
      },
    ],
  },

  {
    slug: 'mitsubishi-electric',
    name: 'Mitsubishi Electric Sales Canada',
    shortName: 'MESCA',
    website: 'https://www.mitsubishielectric.ca',
    distributorType: 'direct',
    typeNote: "MESCA is Mitsubishi Electric's Canadian factory sales office — direct to authorized contractor, not a public walk-in counter. Mitsubishi dealers order equipment and parts through their Diamond Dealer account.",
    description:
      "Mitsubishi Electric's Canadian factory distribution office for BC, operating from Burnaby. MESCA sells the full Mitsubishi line (Zuba-Central ducted, Mr. Slim ductless, City Multi VRF, P-Series commercial) directly to authorized Diamond Dealers — no third-party distributor markup.",
    brands: [
      'Mitsubishi',
    ],
    locations: [
      {
        city: 'Burnaby',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'lennox-parts-plus',
    name: 'Lennox PartsPlus',
    website: 'https://www.lennoxpros.com',
    distributorType: 'direct',
    typeNote: "Lennox's factory-owned dealer stores operate on a direct-to-dealer model — no third-party distributor between Lennox and the installing contractor.",
    description:
      "Lennox International's factory-owned dealer store in Burnaby (2962 Lake City Way). Sells the full Lennox residential heat pump lineup (XP25, XP21, XP20, Merit series; ductless mini-splits powered by Samsung) directly to Lennox Premier and Elite dealers. Direct model means lower contractor pricing with no middleman.",
    brands: [
      'Lennox',
    ],
    locations: [
      {
        city: 'Burnaby',
        address: '2962 Lake City Way, Burnaby, BC',
        region: 'Lower Mainland',
      },
    ],
  },

  // ── Commercial / applied equipment reps ──────────────────────────────

  {
    slug: 'olympic-international',
    name: 'Olympic International',
    website: 'https://www.olympicinternational.com',
    distributorType: 'commercial_rep',
    typeNote: "Olympic operates as a manufacturer's representative for commercial and applied HVAC equipment — not a counter walk-in supply house. Commercial contractors and mechanical engineers contact Olympic directly for project-specific pricing and support.",
    description:
      "BC's primary commercial/applied heat pump equipment representative. Olympic International distributes Daikin VRF/applied systems, Aermec air-to-water and water-to-water HP chillers, WaterFurnace commercial water-source HPs, and other applied systems for institutional and commercial projects. HQ in North Vancouver with a Kelowna office.",
    brands: [
      'Daikin',
      'Aermec',
      'WaterFurnace',
    ],
    locations: [
      {
        label: 'Head Office',
        city: 'North Vancouver',
        region: 'Lower Mainland',
      },
      {
        city: 'Kelowna',
        region: 'Interior',
      },
    ],
  },

  {
    slug: 'the-master-group',
    name: 'The Master Group',
    shortName: 'Master Group',
    website: 'https://www.master.ca',
    distributorType: 'wholesale',
    description:
      "Canada's exclusive Western distributor for Fujitsu HVAC. The Master Group distributes the full Fujitsu Halcyon ductless and Airstage commercial VRF lineup across BC, plus Hitachi commercial VRF and York/Johnson Controls applied systems. The single most important distributor for Fujitsu installers in BC.",
    brands: [
      'Fujitsu',
      'Hitachi',
      'York',
      'Gree',
    ],
    locations: [
      // BC branch locations — see master.ca for your nearest branch
      {
        city: 'Vancouver',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'riada-sales',
    name: 'Riada Sales',
    website: 'https://riada.ca',
    distributorType: 'commercial_rep',
    typeNote: "Riada operates as a manufacturer's representative serving engineers, mechanical contractors, and building owners on commercial and institutional projects — not a walk-in counter. Contact them directly for project-specific pricing and commissioning support.",
    description:
      "Commercial and institutional manufacturer's rep specializing in electrification-focused HVAC and plumbing equipment for BC, Alberta, and the Yukon. In operation since 1995, Riada represents Galletti cold-climate air-to-water heat pumps (rated to −20°C, up to 65°C output), Lync CO₂/R744 commercial heat pump water heaters, Hubbell air-source and water-source HPWHs, SHARC wastewater heat recovery systems, and OSO Hotwater heat pump DHW units — making them a key channel for all-electric and heat-pump-primary mechanical system design in BC.",
    brands: [
      'Galletti',
      'Lync',
      'Hubbell',
      'SHARC',
      'OSO Hotwater',
    ],
    locations: [
      {
        label: 'Head Office',
        city: 'Burnaby',
        address: '8505 Eastlake Dr, Burnaby, BC V5A 4T7',
        phone: '604-299-3499',
        region: 'Lower Mainland',
      },
      {
        label: 'Vancouver Island',
        city: 'Nanaimo',
        address: '#116 - 99 Chapel Street, Nanaimo, BC V9R 5H3',
        region: 'Vancouver Island',
      },
    ],
  },

  {
    slug: 'climachange-solutions',
    name: 'ClimaChange Solutions',
    website: 'https://climachangesolutions.com',
    distributorType: 'commercial_rep',
    typeNote: "ClimaChange operates as a manufacturer's representative serving mechanical engineers, contractors, and building owners on commercial, institutional, and industrial projects across BC and Alberta. No walk-in counter; contact them for project specifications and engineering support.",
    description:
      "BC and Alberta manufacturer's representative firm led by P.Eng. mechanical engineers (ASHRAE Past Presidents) with deep expertise in high-efficiency and electrification-focused HVAC for commercial and institutional buildings. Represents 28+ manufacturers including Bulldog Heat Pump (hybrid and reversible HPs), Multistack (modular heat recovery chillers), AE Aire (water-source HP fan coils), Haakon Industries (custom AHUs), Desert Aire (DOAS and dehumidification), and VTS Group (modular AHUs and HRVs). Strong specification support for teams targeting ZCSC EL-3/EL-4 compliance on commercial projects.",
    brands: [
      'Bulldog Heat Pump',
      'Multistack',
      'AE Aire',
      'Haakon Industries',
      'Desert Aire',
    ],
    locations: [
      {
        label: 'BC Region',
        city: 'Vancouver',
        phone: '604-365-4044',
        region: 'Lower Mainland',
      },
    ],
  },

  // ── Trane distribution channels ──────────────────────────────────────

  {
    slug: 'nee',
    name: 'National Energy Equipment',
    shortName: 'NEE',
    website: 'https://www.nee.ca',
    distributorType: 'direct',
    typeNote: 'NEE has been the exclusive Trane residential and light commercial distributor for BC since 2001 — the only channel for new Trane residential equipment in the province.',
    description:
      "BC's exclusive Trane residential and light commercial heat pump distributor since 2001. If you are installing Trane residential equipment in BC, National Energy Equipment is your source — separate from Trane Supply (parts counter) and Trane Canada West (commercial applied). Full Trane XR, XV, and XL heat pump series available.",
    brands: [
      'Trane',
    ],
    locations: [
      {
        city: 'Vancouver',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'trane-supply',
    name: 'Trane Supply',
    website: 'https://www.tranesupply.com',
    distributorType: 'wholesale',
    typeNote: 'Trane Supply is the OEM parts counter and replacement equipment channel — separate from NEE (new residential equipment) and Trane Canada West (commercial applied).',
    description:
      'Trane contractor wholesale counter in Burnaby stocking Trane OEM replacement parts, national wholesale brands, and light commercial unitary heat pumps. The go-to source for Trane replacement parts and service components across BC.',
    brands: [
      'Trane',
    ],
    locations: [
      {
        city: 'Burnaby',
        address: '3264 Beta Ave, Burnaby, BC',
        region: 'Lower Mainland',
      },
    ],
  },

  {
    slug: 'trane-canada-west',
    name: 'Trane Canada West',
    website: 'https://www.tranecanadawest.com',
    distributorType: 'commercial_rep',
    typeNote: 'Trane Canada West handles commercial applied projects only — not a counter supply house. Commercial contractors and mechanical engineers contact them for project-specific pricing on chillers, applied rooftop HPs, and water-source systems.',
    description:
      'Commercial applied sales offices for Trane in BC, covering chillers, rooftop heat pumps, applied water-source heat pumps, and affiliated product lines for institutional and commercial projects. Separate sales channel from the residential and parts distribution.',
    brands: [
      'Trane',
    ],
    locations: [
      {
        city: 'Burnaby',
        region: 'Lower Mainland',
      },
      {
        city: 'Victoria',
        region: 'Vancouver Island',
      },
      {
        city: 'Kelowna',
        region: 'Interior',
      },
    ],
  },

  // ── Panasonic distribution channels ──────────────────────────────────

  {
    slug: 'emco-hvac',
    name: 'Emco HVAC',
    shortName: 'Emco',
    website: 'https://www.emco.ca',
    distributorType: 'wholesale',
    description:
      'National plumbing and HVAC wholesaler with 40+ BC locations from Burnaby to Kamloops and throughout the province. Following a national partnership announced March 2025, Emco is now a major Panasonic distribution channel in BC, stocking ductless and ducted Panasonic heat pumps alongside their traditional plumbing and HVAC accessory lines.',
    brands: [
      'Panasonic',
    ],
    locations: [
      {
        city: 'Burnaby',
        region: 'Lower Mainland',
      },
      {
        city: 'Kamloops',
        region: 'Interior',
      },
      // 40+ BC locations — see emco.ca for your nearest branch
    ],
  },

  {
    slug: 'diamond-ice-systems',
    name: 'Diamond Ice Systems',
    website: 'https://www.diamondicesystems.com',
    distributorType: 'commercial_rep',
    typeNote: 'Diamond Ice Systems operates as a commercial-focused Panasonic distributor for Western Canada. Commercial contractors and mechanical engineers sourcing Panasonic VRF or cold-climate commercial systems contact them directly.',
    description:
      'Western Canada distributor for Panasonic commercial HVAC, specializing in cold-climate ductless mini-splits and VRF systems for commercial applications. The Panasonic EZKU cold-climate series (rated to -30°C) is a specialty. BC coverage with commercial focus.',
    brands: [
      'Panasonic',
    ],
    locations: [
      {
        city: 'Vancouver',
        region: 'Lower Mainland',
      },
    ],
  },

  // ── LG commercial channel ─────────────────────────────────────────────

  {
    slug: 'climacool-solutions',
    name: 'Climacool Solutions',
    website: 'https://www.climacool.ca',
    distributorType: 'commercial_rep',
    typeNote: "Climacool is LG's exclusive VRF and split system rep for BC and Alberta — the commercial/developer channel for LG. Residential LG also flows through Wolseley and ECCO Supply.",
    description:
      "LG's exclusive VRF and split system representative for BC and Alberta, based in Coquitlam. The primary commercial and developer channel for LG Multi V VRF, ductless, and residential split systems in BC. Supports mechanical engineers, developers, and commercial contractors specifying LG equipment.",
    brands: [
      'LG',
    ],
    locations: [
      {
        city: 'Coquitlam',
        address: '9 Burbidge St, Coquitlam, BC',
        region: 'Lower Mainland',
      },
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
