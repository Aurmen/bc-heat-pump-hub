import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Heat Pump & Boiler FAQ - British Columbia',
  description: 'Frequently asked questions about heat pumps, boilers, costs, rebates, and installation in British Columbia. Get honest answers about ROI and efficiency.',
};

const faqs = [
  {
    question: "How much does a heat pump cost in BC?",
    answer: "Heat pump costs in BC vary significantly by type and home size. Air-source heat pumps (ductless mini-splits) typically cost $3,000-$7,000 per zone. Central ducted systems range from $8,000-$15,000. Air-to-water heat pumps for hydronic heating are $15,000-$30,000 installed. These costs are BEFORE rebates, which can reduce your out-of-pocket by $3,000-$16,000 depending on your situation."
  },
  {
    question: "What rebates are available for heat pumps in BC?",
    answer: "BC homeowners can access multiple rebate programs. CleanBC offers up to $6,000 for air-source heat pumps (income-qualified households can get up to $16,000). The federal Canada Greener Homes Grant provides up to $5,000. FortisBC customers may qualify for additional utility rebates. However, many rebate programs have ended or reduced funding as of 2025, so verify current availability before planning your budget."
  },
  {
    question: "Should I get a heat pump or keep my boiler in BC?",
    answer: "It depends on your specific situation. Heat pumps offer lower operating costs (COP of 3.0-4.0 means 300-400% efficiency) compared to gas boilers (85-95% efficiency). In mild coastal climates like Vancouver or Victoria, heat pumps often provide better ROI. In colder Interior regions, a hybrid system (heat pump + existing boiler) may be more cost-effective. Calculate your payback period based on your current heating costs and available rebates."
  },
  {
    question: "Do heat pumps work in cold BC winters?",
    answer: "Modern cold-climate heat pumps work effectively down to -25°C to -30°C. However, efficiency drops as temperature decreases. In Lower Mainland and Vancouver Island (mild winters), heat pumps work excellently year-round. In Interior BC (Kamloops, Prince George), a backup heat source (existing boiler, electric resistance) or a hybrid system is recommended for the coldest days to maintain comfort and efficiency."
  },
  {
    question: "How much can I save on heating costs with a heat pump?",
    answer: "Savings depend on what you're replacing. Switching from electric baseboard heating can save 50-60% on heating costs. Replacing an oil or propane system can save 30-50%. Replacing a natural gas boiler may save 20-40%, but ROI is longer because gas is relatively cheap in BC. Calculate your specific savings using your current annual heating costs and the heat pump's estimated COP for your climate zone."
  },
  {
    question: "What's the payback period for a heat pump in BC?",
    answer: "Payback periods vary widely. With maximum rebates and replacing expensive heating (oil, propane, electric resistance), payback can be 3-7 years. Replacing natural gas with no rebates can take 12-20+ years. The key factors: upfront cost after rebates, current fuel costs, heat pump efficiency in your climate, and annual heating usage. Always calculate your specific ROI before committing."
  },
  {
    question: "How long do heat pumps last?",
    answer: "Quality heat pumps typically last 15-20 years with proper maintenance. Ductless mini-splits often last 15-18 years. Central systems may last 15-20 years. Air-to-water systems can last 20+ years since they run at lower pressures. Compare this to gas boilers (15-25 years) and furnaces (15-20 years). Annual maintenance is critical for longevity."
  },
  {
    question: "What maintenance do heat pumps require?",
    answer: "Heat pumps need regular maintenance: clean or replace filters monthly, annual professional servicing ($150-$300), keep outdoor units clear of debris and snow, and ensure adequate airflow. Ductless systems require cleaning the indoor unit filters and coils. Hydronic heat pumps need the water-side system maintained just like a boiler. Neglecting maintenance reduces efficiency and shortens lifespan."
  },
  {
    question: "Can I install a heat pump myself?",
    answer: "No. Heat pump installation requires refrigerant handling licenses, electrical permits, and Technical Safety BC certification. DIY installation voids warranties, may be illegal, and can result in inefficient or dangerous systems. Professional installation costs $1,500-$5,000 depending on complexity but ensures proper sizing, placement, refrigerant charging, and compliance with building codes."
  },
  {
    question: "What size heat pump do I need?",
    answer: "Sizing requires a proper heat load calculation considering your home's square footage, insulation, windows, air sealing, and climate zone. Oversizing wastes money and reduces efficiency. Undersizing means inadequate heating. A qualified HVAC contractor (preferably HPCN-certified) should perform a Manual J calculation. As a rough estimate: 1,000-1,500 sq ft might need 18,000-24,000 BTU, but always get a professional assessment."
  },
  {
    question: "Should I get a ductless mini-split or central heat pump?",
    answer: "If you have existing ductwork in good condition, a central heat pump is often more cost-effective. If you don't have ducts (or they're poorly designed), ductless mini-splits avoid the $8,000-$15,000 cost of installing ductwork. Mini-splits also offer zone control, which can reduce energy waste. For hydronic systems (radiators or radiant floors), consider an air-to-water heat pump instead."
  },
  {
    question: "What's an air-to-water heat pump? Is it different?",
    answer: "Air-to-water heat pumps heat water instead of air. They're ideal for homes with hydronic heating systems (radiators, radiant floors, or baseboard hot water). They integrate with existing boiler systems, making them perfect for hybrid setups. Air-to-water systems are more common in Europe and newer to BC, so ensure your installer has experience with them."
  },
  {
    question: "Should I replace my boiler with a heat pump?",
    answer: "It depends. If your boiler is 15+ years old, nearing end of life, and you qualify for maximum rebates, replacement may offer good ROI. If your gas boiler is only 5-10 years old and working well, keeping it and adding a heat pump for a hybrid system may be more economical. Calculate the cost to replace vs. adding a heat pump alongside your existing system."
  },
  {
    question: "What's a hybrid heat pump system?",
    answer: "A hybrid system combines a heat pump with an existing furnace or boiler. The heat pump handles moderate temperatures (above -5°C to 0°C depending on setup), and the boiler/furnace takes over in extreme cold. This maximizes efficiency while ensuring comfort. Hybrids are popular in BC's Interior where winters get very cold but most days are moderate."
  },
  {
    question: "How do I choose a heat pump installer in BC?",
    answer: "Look for: Technical Safety BC gas and refrigeration licenses, HPCN (Heat Pump Contractors Network) certification, manufacturer certifications, local references, detailed written quotes with equipment specs, proper sizing calculations (Manual J), experience with your specific system type, and warranty information. Get 3 quotes and verify licensing. Avoid the lowest quote without understanding why it's lower."
  },
  {
    question: "Are heat pumps better for the environment?",
    answer: "Heat pumps powered by BC's mostly-hydro electric grid produce fewer emissions than fossil fuel heating. However, this site focuses on financial ROI, not environmental claims. Heat pumps offer lower operating costs in most scenarios, and environmental benefits are a side effect of efficient operation, not the primary reason to install one."
  },
  {
    question: "Can a heat pump provide hot water too?",
    answer: "Most air-source heat pumps only provide space heating. Some systems offer integrated hot water options. Alternatively, heat pump water heaters (separate units) can replace electric or gas water heaters with 200-300% efficiency. Some air-to-water hydronic systems can provide both space heating and domestic hot water with appropriate setup."
  },
  {
    question: "Do I need to upgrade my electrical panel for a heat pump?",
    answer: "Possibly. Heat pumps require dedicated electrical circuits. Ductless mini-splits typically need 15-30 amp circuits. Central systems may need 40-60 amps. If your panel is nearly full or outdated (60-100 amp service), you may need a panel upgrade ($1,500-$3,000). Your installer or electrician will assess during the quote process."
  },
  {
    question: "What's the difference between SEER, HSPF, and COP?",
    answer: "SEER (Seasonal Energy Efficiency Ratio) measures cooling efficiency. HSPF (Heating Seasonal Performance Factor) measures heating efficiency in moderate climates. COP (Coefficient of Performance) measures heating efficiency at specific temperatures. For BC, focus on HSPF (higher is better, 8-12 is good) and COP at outdoor temperatures typical for your region (COP 2.5-4.0 at -15°C is excellent for cold climate units)."
  },
  {
    question: "Can I get financing for a heat pump in BC?",
    answer: "Yes. The Canada Greener Homes Loan offers interest-free loans up to $40,000 for energy upgrades including heat pumps. Some manufacturers and contractors offer financing. Credit unions and banks may offer home improvement loans. FortisBC occasionally offers on-bill financing. Compare rates and terms carefully, and factor financing costs into your ROI calculation."
  }
];

// FAQ Schema for SEO
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>FAQ</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get honest answers about heat pumps, boilers, costs, and ROI in British Columbia.
        </p>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {faq.question}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border-l-4 border-primary-500 p-6">
          <p className="text-sm text-gray-700">
            <strong>Still have questions?</strong> Email us at{' '}
            <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 hover:text-primary-700">
              contact@canadianheatpumphub.ca
            </a>
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/guides/heat-pump-vs-boiler-bc"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Heat Pumps vs. Boilers in BC
              </h3>
              <p className="text-gray-600 text-sm">
                Detailed comparison of costs, efficiency, and ROI.
              </p>
            </Link>

            <Link
              href="/guides/cost-heat-pump-installation-bc"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Heat Pump Installation Costs
              </h3>
              <p className="text-gray-600 text-sm">
                Complete cost breakdown and rebate information.
              </p>
            </Link>

            <Link
              href="/directory"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Find an Installer
              </h3>
              <p className="text-gray-600 text-sm">
                Browse verified heat pump and boiler installers in BC.
              </p>
            </Link>

            <Link
              href="/bc"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                City-Specific Information
              </h3>
              <p className="text-gray-600 text-sm">
                Climate notes and installers for your BC city.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
