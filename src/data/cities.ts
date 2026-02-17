import { City } from '@/types/directory';

export const cities: City[] = [
  // Lower Mainland
  {
    name: 'Vancouver',
    slug: 'vancouver',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Vancouver\'s mild coastal climate (average winter lows around 1°C / 34°F) makes it ideal for heat pump systems. Air-to-water heat pumps work efficiently year-round, and many homeowners are replacing gas boilers with heat pump systems.',
    population: '~675,000',
  },
  {
    name: 'Surrey',
    slug: 'surrey',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Surrey shares Vancouver\'s temperate climate, with winter temperatures typically staying above freezing. Heat pumps are highly efficient here, and hybrid systems are rare except in larger homes with high heating loads.',
    population: '~600,000',
  },
  {
    name: 'Burnaby',
    slug: 'burnaby',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Burnaby\'s climate is nearly identical to Vancouver. Modern heat pumps operate efficiently throughout winter, making them a cost-effective alternative to gas or electric boilers.',
    population: '~250,000',
  },
  {
    name: 'Richmond',
    slug: 'richmond',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Richmond\'s low elevation and proximity to the ocean provide extremely mild winters. Heat pumps can operate as the sole heating source in most homes, with backup resistance heating for the rare cold snap.',
    population: '~210,000',
  },
  {
    name: 'Coquitlam',
    slug: 'coquitlam',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Coquitlam experiences slightly more precipitation than Vancouver but similar temperatures. Heat pumps are well-suited to this climate, including air-to-water systems for in-floor heating.',
    population: '~150,000',
  },
  {
    name: 'Langley',
    slug: 'langley',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Langley can see occasional winter temperatures below -5°C (23°F), making cold-climate heat pumps advisable. Many newer developments use heat pumps integrated with hydronic heating systems.',
    population: '~150,000',
  },
  {
    name: 'Abbotsford',
    slug: 'abbotsford',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    province: 'BC',
    climateNotes: 'Abbotsford is slightly cooler in winter than coastal cities, with occasional sub-zero temperatures. Heat pumps rated for -25°C (-13°F) operation are recommended, and hybrid systems are sometimes used in rural properties.',
    population: '~155,000',
  },

  // Vancouver Island
  {
    name: 'Victoria',
    slug: 'victoria',
    region: 'Vancouver Island',
    regionSlug: 'vancouver-island',
    province: 'BC',
    climateNotes: 'Victoria has Canada\'s mildest climate, with winter lows rarely below 0°C (32°F). Heat pumps are extremely efficient here and are increasingly replacing older oil and electric heating systems.',
    population: '~92,000',
  },
  {
    name: 'Nanaimo',
    slug: 'nanaimo',
    region: 'Vancouver Island',
    regionSlug: 'vancouver-island',
    province: 'BC',
    climateNotes: 'Nanaimo\'s climate is similar to Victoria, with mild, wet winters. Heat pumps work exceptionally well, and air-to-water systems are popular for homes with hydronic heating.',
    population: '~100,000',
  },
  {
    name: 'Courtenay',
    slug: 'courtenay',
    region: 'Vancouver Island',
    regionSlug: 'vancouver-island',
    province: 'BC',
    climateNotes: 'Courtenay experiences slightly cooler winters than southern Vancouver Island, but temperatures remain moderate. Heat pumps are a reliable primary heating source in this region.',
    population: '~28,000',
  },
  {
    name: 'Campbell River',
    slug: 'campbell-river',
    region: 'Vancouver Island',
    regionSlug: 'vancouver-island',
    province: 'BC',
    climateNotes: 'Campbell River has a mild coastal climate with wet winters. Heat pumps perform well, and many homeowners use them to replace electric baseboard or oil heating systems.',
    population: '~36,000',
  },

  // Interior
  {
    name: 'Kelowna',
    slug: 'kelowna',
    region: 'Interior',
    regionSlug: 'interior',
    province: 'BC',
    climateNotes: 'Kelowna experiences colder winters (average lows around -5°C / 23°F) and hot, dry summers. Cold-climate heat pumps rated for -25°C (-13°F) are essential, and hybrid systems with gas or propane backup are common.',
    population: '~145,000',
  },
  {
    name: 'Vernon',
    slug: 'vernon',
    region: 'Interior',
    regionSlug: 'interior',
    province: 'BC',
    climateNotes: 'Vernon\'s climate is similar to Kelowna, with cold winters and warm summers. Modern heat pumps can handle most heating needs, but backup heating may be beneficial during extreme cold events.',
    population: '~44,000',
  },
  {
    name: 'Penticton',
    slug: 'penticton',
    region: 'Interior',
    regionSlug: 'interior',
    province: 'BC',
    climateNotes: 'Penticton has one of BC\'s sunniest climates, with cold winters and hot summers. Heat pumps work well but should be cold-climate rated. Some homeowners choose hybrid systems for added reliability.',
    population: '~36,000',
  },
  {
    name: 'Kamloops',
    slug: 'kamloops',
    region: 'Interior',
    regionSlug: 'interior',
    province: 'BC',
    climateNotes: 'Kamloops has a semi-arid climate with temperatures ranging from -15°C (5°F) in winter to 35°C (95°F) in summer. Cold-climate heat pumps are necessary, and hybrid systems are popular for larger homes.',
    population: '~98,000',
  },
  {
    name: 'Prince George',
    slug: 'prince-george',
    region: 'Interior',
    regionSlug: 'interior',
    province: 'BC',
    climateNotes: 'Prince George experiences cold winters (average lows around -15°C / 5°F) and requires cold-climate heat pumps rated to -30°C (-22°F) or lower. Hybrid systems are common to ensure reliable heating during extreme cold.',
    population: '~78,000',
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find(city => city.slug === slug);
}

export function getCitiesByRegion(regionSlug: string): City[] {
  return cities.filter(city => city.regionSlug === regionSlug);
}
