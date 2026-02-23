import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform">
              Canadian Heat Pump Hub
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/guides" className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group">
              Guides
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/brands" className="text-gray-700 hover:text-purple-600 font-medium transition-colors relative group">
              Brands
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/rebates" className="text-gray-700 hover:text-accent-600 font-medium transition-colors relative group">
              Rebates
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/calculator" className="text-gray-700 hover:text-success-600 font-medium transition-colors relative group">
              Calculator
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-success-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group">
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/service" className="text-gray-700 hover:text-red-600 font-medium transition-colors relative group">
              Service
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/bc" className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group">
              BC Cities
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/supply-houses" className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group">
              Supply Houses
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/directory" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105">
              Directory
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
