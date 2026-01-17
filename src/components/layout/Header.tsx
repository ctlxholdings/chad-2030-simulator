/**
 * Application header with branding
 */

export function Header() {
  return (
    <header className="bg-brand-burgundy text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Chad 2030</h1>
            <p className="text-sm opacity-90">Pipeline Simulator</p>
          </div>
          <div className="text-right text-sm opacity-90">
            <div>Vision 2030</div>
            <div>Decision Support Tool</div>
          </div>
        </div>
      </div>
    </header>
  );
}
