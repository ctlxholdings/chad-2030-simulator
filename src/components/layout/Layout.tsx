/**
 * Main layout component with responsive structure
 */

import { Header } from './Header';
import { HeroMetrics } from './HeroMetrics';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed header + hero metrics container */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
        <HeroMetrics />
      </div>
      {/* Spacer to push content below fixed header */}
      <div className="h-[120px] sm:h-[130px]" />
      <main className="flex-1 bg-gray-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">{children}</div>
      </main>
      <footer className="bg-gray-800 text-gray-300 text-center py-4 text-sm">
        <p>Chad Connection 2030 - Project Pipeline Simulator</p>
        <p className="text-xs mt-1 opacity-75">
          All outputs are illustrative projections based on model assumptions
        </p>
      </footer>
    </div>
  );
}
