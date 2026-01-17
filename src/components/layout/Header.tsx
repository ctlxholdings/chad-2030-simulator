/**
 * Application header with branding
 */

export function Header() {
  return (
    <header className="bg-brand-burgundy text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">Chad Connection 2030</h1>
            <p className="text-xs sm:text-sm opacity-90 truncate">Project Pipeline Simulator</p>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/chad-2030/catalyx-logo.svg"
              alt="Catalyx"
              className="h-12 sm:h-14 w-auto"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
