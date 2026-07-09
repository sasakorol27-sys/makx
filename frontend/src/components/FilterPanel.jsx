import { Funnel, ClockCounterClockwise, Lightning, ArrowClockwise } from '@phosphor-icons/react';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function FilterPanel({ filters, setFilters, view, setView }) {
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const viewBtn = (active) =>
    `w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-[transform,background-color,color] duration-200 flex items-center gap-2.5 ${
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'bg-secondary text-secondary-foreground hover:bg-muted hover:-translate-y-0.5'
    }`;

  return (
    <div className="p-6 lg:sticky lg:top-[89px]">
      {/* View Toggle */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">
          Ansicht
        </h2>
        <div className="flex flex-col gap-2">
          <button onClick={() => setView('new')} className={viewBtn(view === 'new')} data-testid="view-new-button">
            <Lightning weight="bold" size={18} />
            Neue Wohnungen
          </button>
          <button onClick={() => setView('history')} className={viewBtn(view === 'history')} data-testid="view-history-button">
            <ClockCounterClockwise weight="bold" size={18} />
            Archiv
          </button>
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Funnel weight="bold" size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold">Filter</h2>
        </div>

        {/* Price Filter */}
        <div className="mb-5">
          <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
            Preis (€)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number" placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="filter-price-min"
            />
            <Input
              type="number" placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="filter-price-max"
            />
          </div>
        </div>

        {/* Rooms Filter */}
        <div className="mb-6">
          <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
            Zimmer
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number" placeholder="Min"
              value={filters.minRooms}
              onChange={(e) => handleFilterChange('minRooms', e.target.value)}
              className="rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="filter-rooms-min"
            />
            <Input
              type="number" placeholder="Max"
              value={filters.maxRooms}
              onChange={(e) => handleFilterChange('maxRooms', e.target.value)}
              className="rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary"
              data-testid="filter-rooms-max"
            />
          </div>
        </div>

        <button
          onClick={() => setFilters({ minPrice: '', maxPrice: '', minRooms: '', maxRooms: '' })}
          className="w-full px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors duration-200 flex items-center justify-center gap-2"
          data-testid="clear-filters-button"
        >
          <ArrowClockwise weight="bold" size={15} />
          Filter zurücksetzen
        </button>
      </div>
    </div>
  );
}
