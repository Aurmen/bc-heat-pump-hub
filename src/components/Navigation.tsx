import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center text-xl font-bold text-primary-600">
              Canadian Heat Pump Hub
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Home
            </Link>
            <Link href="/guides" className="text-gray-700 hover:text-primary-600 font-medium">
              Guides
            </Link>
            <Link href="/bc" className="text-gray-700 hover:text-primary-600 font-medium">
              BC Cities
            </Link>
            <Link href="/directory" className="text-gray-700 hover:text-primary-600 font-medium">
              Directory
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
