export type CostTier = 'lower-mainland' | 'island' | 'interior';
export type ClimateType = 'coastal-rain' | 'coastal-mild' | 'interior-cold';

export interface RepairCity {
  name: string;
  slug: string;
  region: string;
  regionSlug: string;
  designTemp: number;
  climateType: ClimateType;
  climateHeadline: string;
  climateRepairNote: string;
  topRepairIssues: string[];
  costTier: CostTier;
}

export interface RepairCostRow {
  repair: string;
  lowerMainland: string;
  island: string;
  interior: string;
  notes: string;
}

export const repairCosts: RepairCostRow[] = [
  {
    repair: 'Diagnostic visit',
    lowerMainland: '$100–$200',
    island: '$90–$185',
    interior: '$85–$175',
    notes: 'After-hours: add $150–$250. Some contractors waive if repair proceeds.',
  },
  {
    repair: 'Capacitor replacement',
    lowerMainland: '$250–$450',
    island: '$230–$420',
    interior: '$220–$400',
    notes: 'Most common repair at 5–8 year mark. Fast job (~1 hour).',
  },
  {
    repair: 'Fan motor (indoor or outdoor)',
    lowerMainland: '$700–$1,200',
    island: '$650–$1,100',
    interior: '$620–$1,050',
    notes: 'Part cost varies significantly by brand. Mitsubishi/Daikin parts higher.',
  },
  {
    repair: 'Refrigerant leak — detect & repair',
    lowerMainland: '$900–$2,500',
    island: '$850–$2,300',
    interior: '$800–$2,200',
    notes: 'Cost depends on leak location. Includes recharge. Requires licensed refrigeration mechanic.',
  },
  {
    repair: 'Defrost board or sensor',
    lowerMainland: '$350–$650',
    island: '$320–$600',
    interior: '$300–$575',
    notes: 'Critical for BC winters. Usually covered under manufacturer warranty.',
  },
  {
    repair: 'Control board replacement',
    lowerMainland: '$900–$1,800',
    island: '$850–$1,700',
    interior: '$800–$1,600',
    notes: 'High variation by brand. Get OEM board — aftermarket boards cause reliability issues.',
  },
  {
    repair: 'Condensate drain service',
    lowerMainland: '$150–$350',
    island: '$140–$325',
    interior: '$125–$300',
    notes: 'DIY possible: flush with diluted vinegar. Call if fully blocked or frozen.',
  },
  {
    repair: 'Reversing valve',
    lowerMainland: '$600–$1,200',
    island: '$570–$1,100',
    interior: '$550–$1,050',
    notes: 'Stuck valve = won\'t switch between heating and cooling. Labor-intensive.',
  },
  {
    repair: 'Compressor replacement',
    lowerMainland: '$2,500–$4,500',
    island: '$2,300–$4,200',
    interior: '$2,200–$4,000',
    notes: 'Get a replacement quote too — at 10+ years, new unit often makes more sense.',
  },
  {
    repair: 'Annual tune-up',
    lowerMainland: '$150–$300',
    island: '$140–$275',
    interior: '$135–$265',
    notes: 'Prevents most emergency calls. Includes refrigerant check, coil clean, electrical inspection.',
  },
];

export const preCallChecklist = [
  {
    step: 'Check the breaker',
    detail: 'Find the dedicated heat pump breaker in your panel. Flip it fully OFF, then ON. If it trips immediately again, stop — call an electrician.',
  },
  {
    step: 'Check thermostat settings',
    detail: 'Confirm it\'s set to HEAT (not COOL or FAN), the set temperature is above room temperature, and batteries are fresh. Many "no heat" calls are thermostat mode errors.',
  },
  {
    step: 'Check the filter',
    detail: 'Ductless: pop open the indoor unit cover and check the filter. Ducted: find your air handler filter. A fully clogged filter causes safety shutdown. Replace or wash it.',
  },
  {
    step: 'Clear the outdoor unit',
    detail: 'Remove snow, leaves, or debris within 30cm on the sides and 60cm at the front (discharge direction). Check that the unit isn\'t buried in snow.',
  },
  {
    step: 'Check for error codes',
    detail: 'Most modern units display error codes on the indoor unit display or blink a fault pattern. Note the code before calling — it tells the technician what to bring.',
  },
  {
    step: 'For an iced outdoor unit',
    detail: 'Switch to FAN-ONLY mode for 20–30 minutes to let it defrost. If it re-ices within an hour of defrosting, you have a defrost system issue.',
  },
  {
    step: 'Check for recent power outages',
    detail: 'Some units require a manual reset after a power interruption. Turn the unit off at the thermostat or remote, wait 30 seconds, turn back on.',
  },
];

export const symptomTable = [
  {
    symptom: 'Blowing cold air in heat mode',
    likelyCause: 'Active defrost cycle (normal), stuck reversing valve, or low refrigerant',
    urgency: 'medium' as const,
    diyStep: 'Wait 5–10 minutes — defrost cycles are normal and temporary',
    callIf: 'Cold air continues after 10 min, or happens repeatedly throughout the day',
  },
  {
    symptom: 'Outdoor unit heavily iced over',
    likelyCause: 'Defrost board/sensor failure, blocked airflow, or low refrigerant',
    urgency: 'high' as const,
    diyStep: 'Switch to fan-only for 20–30 min to defrost. Clear debris around unit.',
    callIf: 'Unit re-ices within an hour, or ice covers the entire coil and fan',
  },
  {
    symptom: 'Mini split dripping water indoors',
    likelyCause: 'Clogged condensate drain — common in humid BC climates',
    urgency: 'medium' as const,
    diyStep: 'Flush condensate drain line with diluted vinegar. Check for blockage at drain outlet.',
    callIf: 'Water is pooling, not just dripping. Mold visible in the unit.',
  },
  {
    symptom: 'Unit not turning on at all',
    likelyCause: 'Tripped breaker, failed capacitor, communication fault, or burned contactor',
    urgency: 'high' as const,
    diyStep: 'Reset breaker once. Check thermostat batteries. Try unplugging remote and re-pairing.',
    callIf: 'Breaker trips again, or unit still won\'t start after breaker reset',
  },
  {
    symptom: 'Grinding or squealing noise',
    likelyCause: 'Fan motor bearing wear, loose fan blade, or debris in outdoor unit',
    urgency: 'medium' as const,
    diyStep: 'Inspect outdoor unit for sticks, leaves, or debris caught in the fan. Turn unit off first.',
    callIf: 'Noise persists after clearing debris, or you hear grinding from the compressor area',
  },
  {
    symptom: 'Short cycling (frequent on/off)',
    likelyCause: 'Oversized unit, low refrigerant, dirty filter, or refrigerant metering issue',
    urgency: 'medium' as const,
    diyStep: 'Check and clean the filter. Ensure all registers and vents are open.',
    callIf: 'More than 4-6 short cycles per hour after filter is clean',
  },
  {
    symptom: 'Runs constantly but can\'t reach set temperature',
    likelyCause: 'Below unit\'s rated operating temperature, low refrigerant, poor insulation, or undersized system',
    urgency: 'low' as const,
    diyStep: 'Check outdoor temp vs unit\'s rated minimum. Seal obvious drafts. Check filter.',
    callIf: 'Outdoor temp is within unit\'s range but performance is still poor',
  },
  {
    symptom: 'Musty or mold smell',
    likelyCause: 'Dirty evaporator coil, mold in condensate pan, or clogged drain',
    urgency: 'low' as const,
    diyStep: 'Clean the indoor unit filter. Run unit on cooling mode to flush condensate.',
    callIf: 'Smell persists after filter cleaning. Visible mold on the indoor unit.',
  },
  {
    symptom: 'Backup heat not activating (hybrid system)',
    likelyCause: 'Thermostat changeover threshold setting, failed gas valve, or communication fault',
    urgency: 'high' as const,
    diyStep: 'Check thermostat for manual override to backup heat mode.',
    callIf: 'Cannot manually switch to backup heat — this is an emergency in cold weather',
  },
];

export const repairCities: RepairCity[] = [
  {
    name: 'Vancouver',
    slug: 'vancouver',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -8,
    climateType: 'coastal-rain',
    climateHeadline: 'Coastal humidity and freeze-thaw cycles drive most Vancouver heat pump service calls.',
    climateRepairNote: "Vancouver's marine climate creates distinct repair patterns. Freeze-thaw cycling at 0°C to -5°C causes more outdoor unit icing than deep-cold Interior climates — the unit hits defrost mode repeatedly rather than running in steady cold. Year-round high humidity means condensate drain clogs and evaporator coil mold are more common than in drier BC regions. Most Vancouver heat pump repairs are preventable with annual servicing before the rainy season starts.",
    topRepairIssues: [
      'Outdoor unit icing in freeze-thaw conditions (Oct–Mar)',
      'Condensate drain clog causing indoor water and mold',
      'Capacitor or fan motor failure (common at 5–8 year mark)',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Surrey',
    slug: 'surrey',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -9,
    climateType: 'coastal-rain',
    climateHeadline: "Surrey's spread-out geography means service response times vary — knowing your contractor before you need them matters.",
    climateRepairNote: "Surrey spans a large area from coastal flats to the Langley border. Coastal freeze-thaw icing is the dominant outdoor unit issue, and the city's wave of mid-2010s installations means many systems are entering the 8-10 year mark — prime age for capacitor and fan motor failures. Rural Surrey properties may face longer emergency response times; having a pre-established relationship with a local contractor is worth the effort before winter.",
    topRepairIssues: [
      'Outdoor unit icing (coastal freeze-thaw, Oct–Mar)',
      'Capacitor and fan motor failure (8-10 year installs)',
      'Condensate drain blockage',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Burnaby',
    slug: 'burnaby',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -8,
    climateType: 'coastal-rain',
    climateHeadline: "Burnaby's dense condo and townhouse stock makes strata-specific service experience essential.",
    climateRepairNote: "A significant portion of Burnaby's heat pump stock is in strata buildings — condos and townhouses where outdoor unit access requires coordination and noise-related service calls are common. Condo mini-split units in humid coastal conditions develop condensate drain issues frequently. For strata repairs, confirm your contractor is familiar with strata access procedures and building bylaw requirements around service windows.",
    topRepairIssues: [
      'Condensate drain clog (indoor water leak in condos)',
      'Strata access and noise-related service complications',
      'Fan motor failure causing noise complaints',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Richmond',
    slug: 'richmond',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -7,
    climateType: 'coastal-rain',
    climateHeadline: "Richmond's low-lying geography means outdoor units need proper drainage — water infiltration is a real concern.",
    climateRepairNote: "Richmond sits at or near sea level with a mild but wet climate. Outdoor unit drainage is a more common concern here than in elevated Lower Mainland cities — units installed close to ground level can develop water infiltration into wiring and connections during heavy rain events. The mild winters mean Richmond heat pumps run efficiently nearly year-round, but the high humidity keeps condensate drain maintenance as a recurring necessity every 6-12 months.",
    topRepairIssues: [
      'Outdoor unit water infiltration during heavy rain',
      'Condensate drain maintenance (year-round humidity)',
      'Defrost sensor issues (mild freeze events)',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Coquitlam',
    slug: 'coquitlam',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -10,
    climateType: 'coastal-rain',
    climateHeadline: "Coquitlam's higher elevation means colder winters than coastal Vancouver — defrost performance matters more here.",
    climateRepairNote: "Coquitlam and Port Coquitlam sit at slightly higher elevation than the Fraser River lowlands, resulting in colder winter temperatures. Design temperatures approach -10°C, meaning heat pumps see more stress during cold snaps than in coastal Vancouver. Defrost system issues are more frequent, and undersized systems — a legacy of earlier installations before cold-climate models were standard — are a recurring problem in hillside and upper Coquitlam properties.",
    topRepairIssues: [
      'Defrost system failure during cold snaps',
      'Undersized legacy systems hitting their limit below -8°C',
      'Outdoor unit icing (more severe than coastal cities)',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'North Vancouver',
    slug: 'north-vancouver',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -10,
    climateType: 'coastal-rain',
    climateHeadline: "North Vancouver's mountain proximity brings heavier snowfall — outdoor unit clearance is an actual winter maintenance task here.",
    climateRepairNote: "North Shore properties see heavier snowfall than the Lower Mainland floor, making outdoor unit snow clearance a genuine winter task rather than a rare event. Units buried in snow lose airflow efficiency rapidly and can overheat or shut down. North Vancouver also has many steep-lot properties with complex outdoor unit siting — refrigerant lines are longer and service access can be challenging for contractors unfamiliar with the area.",
    topRepairIssues: [
      'Snow accumulation on and around outdoor unit',
      'Reduced performance from airflow restriction in cold weather',
      'Access challenges for service on steep-lot properties',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Langley',
    slug: 'langley',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -12,
    climateType: 'coastal-rain',
    climateHeadline: "Langley's Fraser Valley interior location is colder than coastal cities — cold-climate rating is essential, not optional.",
    climateRepairNote: "Langley sits inland in the Fraser Valley where winter temperatures regularly reach -10°C to -12°C during Arctic outflow events. Heat pumps in Langley should be cold-climate rated to at least -25°C; units installed without cold-climate certification will struggle or shut down during cold snaps. Service calls in Langley frequently involve systems underperforming in cold weather — the first diagnostic question is whether the installed model is rated for the local design temperature.",
    topRepairIssues: [
      'Cold-weather underperformance (non-cold-climate rated units)',
      'Defrost failure during prolonged below -8°C weather',
      'Backup heat not activating when heat pump locks out',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Abbotsford',
    slug: 'abbotsford',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -14,
    climateType: 'coastal-rain',
    climateHeadline: "Abbotsford regularly hits -10°C to -14°C during Arctic outflows — cold-climate rated equipment is critical.",
    climateRepairNote: "Abbotsford is at the eastern end of the Fraser Valley where cold Arctic outflows can push temperatures below -10°C for days at a time. This is the most common root cause of winter service calls: a heat pump not rated for these temperatures loses capacity rapidly and may lock out entirely. When troubleshooting an Abbotsford heat pump in winter, verify the unit's rated minimum operating temperature versus current outdoor conditions before assuming a mechanical failure.",
    topRepairIssues: [
      'Cold-weather capacity loss or lockout during Arctic outflows',
      'Backup heat failure when main system locks out',
      'Defrost system failure during prolonged cold',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Delta',
    slug: 'delta',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -7,
    climateType: 'coastal-rain',
    climateHeadline: "Delta's flat, low-lying coastal location means mild winters but drainage and humidity are the primary maintenance concerns.",
    climateRepairNote: "Delta shares Richmond's very mild coastal climate — design temperatures rarely exceed -7°C, making heat pump cold-weather failures uncommon. The primary service drivers are humidity-related: condensate drain maintenance, outdoor unit drainage, and coil corrosion from proximity to water. Tsawwassen properties near the coast may experience more outdoor coil corrosion than other Lower Mainland cities.",
    topRepairIssues: [
      'Condensate drain maintenance (coastal humidity)',
      'Outdoor unit drainage during heavy rain',
      'Coastal salt air corrosion on outdoor coil',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Chilliwack',
    slug: 'chilliwack',
    region: 'Lower Mainland',
    regionSlug: 'lower-mainland',
    designTemp: -13,
    climateType: 'coastal-rain',
    climateHeadline: "Chilliwack sits at the end of the Fraser Valley where cold snaps hit harder than coastal cities.",
    climateRepairNote: "Chilliwack's position at the head of the Fraser Valley means it experiences colder and more sustained cold snaps than Metro Vancouver — similar to Abbotsford and Langley. Arctic outflow events push temperatures below -10°C multiple times each winter. Cold-climate rated equipment is essential, and annual pre-winter service should verify backup heat activation. Defrost system performance is the key variable that separates comfortable winters from service calls.",
    topRepairIssues: [
      'Cold-weather lockout during Fraser Valley outflows',
      'Defrost system failure in sustained cold',
      'Backup heat not activating',
    ],
    costTier: 'lower-mainland',
  },
  {
    name: 'Victoria',
    slug: 'victoria',
    region: 'Vancouver Island',
    regionSlug: 'vancouver-island',
    designTemp: -8,
    climateType: 'coastal-mild',
    climateHeadline: "Victoria's mild climate means fewer cold-weather failures, but humidity and aging installations drive consistent service demand.",
    climateRepairNote: "Victoria has the mildest winter climate of any major BC city — temperatures rarely drop below -5°C and heat pumps run at high efficiency nearly year-round. Cold-weather emergency failures are uncommon. The dominant service issues are condensate drain management (year-round humidity), outdoor coil corrosion from coastal salt air, and age-related component failures as the city's large stock of early mini-split installations from 2012-2016 reaches the 10-12 year mark.",
    topRepairIssues: [
      'Condensate drain clog (year-round humidity)',
      'Outdoor coil corrosion (proximity to ocean)',
      'Capacitor and fan motor aging (10-12 year installs)',
    ],
    costTier: 'island',
  },
  {
    name: 'Nanaimo',
    slug: 'nanaimo',
    region: 'Vancouver Island',
    regionSlug: 'vancouver-island',
    designTemp: -9,
    climateType: 'coastal-mild',
    climateHeadline: "Nanaimo's marine climate is forgiving for heat pumps, but older residential stock means mechanical aging is the primary service driver.",
    climateRepairNote: "Nanaimo's climate is similar to Victoria — mild winters, high humidity, and minimal cold-weather stress on heat pump systems. Service calls here tend to be mechanical rather than climate-driven: capacitor failures, fan motor wear, and control board issues in units reaching end of operational life. Coastal humidity accelerates outdoor unit corrosion, making annual service and protective coatings particularly worthwhile for units over 8 years old.",
    topRepairIssues: [
      'Fan motor and capacitor aging',
      'Outdoor coil and cabinet corrosion',
      'Condensate drain maintenance',
    ],
    costTier: 'island',
  },
  {
    name: 'Kelowna',
    slug: 'kelowna',
    region: 'Interior',
    regionSlug: 'interior',
    designTemp: -22,
    climateType: 'interior-cold',
    climateHeadline: "Kelowna's -22°C design temperature makes cold-climate rating and defrost performance the critical factors in winter service.",
    climateRepairNote: "Kelowna experiences genuine Interior BC winters with design temperatures reaching -22°C. During prolonged cold snaps, a heat pump's ability to maintain output — and its defrost cycle to keep the outdoor coil clear — is tested seriously. Service calls in Kelowna in January and February are often urgent. The most important pre-winter check is verifying backup heat is operational. Unlike coastal BC, Kelowna's dry climate means condensate and mold issues are rare; cold-weather performance is the primary concern. Cottonwood seed plugging of outdoor coils in late May is a uniquely Okanagan spring maintenance issue.",
    topRepairIssues: [
      'Cold-weather performance failure or lockout',
      'Defrost system failure in prolonged cold',
      'Outdoor coil clogging (cottonwood season, May)',
    ],
    costTier: 'interior',
  },
  {
    name: 'Kamloops',
    slug: 'kamloops',
    region: 'Interior',
    regionSlug: 'interior',
    designTemp: -22,
    climateType: 'interior-cold',
    climateHeadline: "Kamloops combines cold winters with hot summers — heat pumps are tested at both ends of the performance envelope.",
    climateRepairNote: "Kamloops has one of BC's widest temperature ranges — from -22°C in winter to +38°C in summer. This means heat pumps are tested in both heating and cooling modes regularly. Summer service calls involve refrigerant performance under high load and dirty outdoor coils from dust. Winter calls involve defrost and cold-weather performance. Cottonwood seed clogging of outdoor coils in late spring is a particularly significant Kamloops issue — outdoor coils can become fully blocked within days during peak cottonwood season in May-June.",
    topRepairIssues: [
      'Outdoor coil clogging from cottonwood or dust',
      'Cold-weather defrost failure',
      'Refrigerant issues under peak summer cooling load',
    ],
    costTier: 'interior',
  },
  {
    name: 'Prince George',
    slug: 'prince-george',
    region: 'Interior',
    regionSlug: 'interior',
    designTemp: -31,
    climateType: 'interior-cold',
    climateHeadline: "Prince George's -31°C design temperature is among BC's coldest — backup heat is not optional and must be tested before winter.",
    climateRepairNote: "Prince George has the most demanding winter climate of any major BC city. At design temperatures of -31°C, even the best cold-climate heat pumps operate at reduced capacity, and backup heat (electric resistance or gas) is essential — not a suggestion. Service calls here in deep winter are often backup heat failures rather than heat pump failures. The backup system that was never serviced is what leaves homeowners without heat at -25°C. Pre-season service in September/October must include testing backup heat activation under load.",
    topRepairIssues: [
      'Backup heat failure during extreme cold (most dangerous)',
      'Heat pump lockout below rated operating range',
      'Defrost system failure in sustained severe cold',
    ],
    costTier: 'interior',
  },
  {
    name: 'Vernon',
    slug: 'vernon',
    region: 'Interior',
    regionSlug: 'interior',
    designTemp: -22,
    climateType: 'interior-cold',
    climateHeadline: "Vernon's Interior climate requires cold-climate equipment — and service coverage is thinner than in Kelowna.",
    climateRepairNote: "Vernon sits in the North Okanagan with similar climate to Kelowna — cold winters requiring -25°C-rated equipment and hot dry summers. Service coverage in Vernon is thinner than in Kelowna; emergency response times can be longer, and some contractors won't cover the area. Having a confirmed service relationship with a local contractor before you need emergency service is particularly important in Vernon. Annual pre-winter service in September is a higher priority here than in coastal BC.",
    topRepairIssues: [
      'Cold-weather performance and lockout',
      'Limited emergency service availability',
      'Defrost system failure during prolonged cold',
    ],
    costTier: 'interior',
  },
];

export function getRepairCityBySlug(slug: string): RepairCity | undefined {
  return repairCities.find(c => c.slug === slug);
}
