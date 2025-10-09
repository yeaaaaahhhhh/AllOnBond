import { Calculator } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">All On Bond</h1>
              <p className="text-xs text-gray-500">채권 투자, 이제 쉽게 계산하세요</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername/AllOnBond"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 text-sm text-gray-600 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
