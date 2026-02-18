import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Canadian Heat Pump Hub</h3>
            <p className="text-gray-600 text-sm">
              Educational resource for homeowners making heat pump and boiler replacement decisions in Canada. Currently serving British Columbia.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guides" className="text-gray-600 hover:text-primary-600">
                  Educational Guides
                </Link>
              </li>
              <li>
                <Link href="/bc" className="text-gray-600 hover:text-primary-600">
                  BC Regions
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-gray-600 hover:text-primary-600">
                  Installer Directory
                </Link>
              </li>
              <li>
                <Link href="/rebates" className="text-gray-600 hover:text-primary-600">
                  2026 Rebates
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contact@canadianheatpumphub.ca"
                  className="text-gray-600 hover:text-primary-600 flex items-center gap-2"
                >
                  <span>✉️</span>
                  <span>contact@canadianheatpumphub.ca</span>
                </a>
              </li>
              <li>
                <Link href="/directory/submit" className="text-gray-600 hover:text-primary-600">
                  Submit Your Business
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Disclaimer</h4>
            <p className="text-gray-600 text-sm">
              This website provides informational content only. It is not engineering advice. Always verify contractor licensing and suitability for your specific needs.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Canadian Heat Pump Hub. For informational purposes only.
        </div>
      </div>
    </footer>
  );
}
