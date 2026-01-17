/**
 * Application header with branding
 */

export function Header() {
  return (
    <header className="bg-brand-burgundy text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">Chad 2030</h1>
            <p className="text-xs sm:text-sm opacity-90 truncate">Pipeline Simulator</p>
          </div>
          <div className="text-right text-xs sm:text-sm opacity-90 flex-shrink-0">
            <div>Vision 2030</div>
            <div className="hidden sm:block">Decision Support Tool</div>
          </div>
        </div>
      </div>
    </header>
  );
}
