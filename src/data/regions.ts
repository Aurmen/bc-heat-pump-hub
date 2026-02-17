import { Region } from '@/types/directory';

export const regions: Region[] = [
  {
    name: 'Lower Mainland',
    slug: 'lower-mainland',
    province: 'BC',
    description: 'The Lower Mainland is home to over half of British Columbia\'s population and features a temperate oceanic climate with mild, wet winters and warm, dry summers. Heat pump systems perform exceptionally well in this region due to moderate winter temperatures.',
    cities: ['vancouver', 'surrey', 'burnaby', 'richmond', 'coquitlam', 'langley', 'abbotsford'],
  },
  {
    name: 'Vancouver Island',
    slug: 'vancouver-island',
    province: 'BC',
    description: 'Vancouver Island enjoys one of Canada\'s mildest climates, with coastal areas rarely experiencing freezing temperatures. This makes it ideal for air-source heat pump installations, including air-to-water systems for hydronic heating.',
    cities: ['victoria', 'nanaimo', 'courtenay', 'campbell-river'],
  },
  {
    name: 'Interior',
    slug: 'interior',
    province: 'BC',
    description: 'BC\'s Interior experiences greater temperature extremes, with colder winters and warmer summers than coastal regions. Modern cold-climate heat pumps and hybrid systems combining heat pumps with backup boilers are common solutions here.',
    cities: ['kelowna', 'vernon', 'penticton', 'kamloops', 'prince-george'],
  },
];
