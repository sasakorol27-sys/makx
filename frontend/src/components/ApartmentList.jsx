import { MapPin, CurrencyEur, Ruler, Bed, ArrowSquareOut, Buildings, MagnifyingGlass } from '@phosphor-icons/react';

export default function ApartmentList({ apartments, loading, view }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-muted border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Wird geladen…</p>
        </div>
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 p-6">
        <div className="text-center max-w-sm" data-testid="no-apartments-message">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlass weight="bold" size={26} className="text-muted-foreground" />
          </div>
          <p className="font-heading text-lg font-semibold mb-2">Keine Wohnungen gefunden</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {view === 'new'
              ? 'Keine neuen Wohnungen in den letzten 24 Stunden. Der Scanner läuft automatisch alle 3 Minuten.'
              : 'Noch keine Wohnungen im Archiv (älter als 24 Stunden).'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          {view === 'new' ? 'Neue Wohnungen' : 'Archiv'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1" data-testid="apartment-count">
          {apartments.length} {apartments.length === 1 ? 'Wohnung' : 'Wohnungen'} {view === 'new' && 'in den letzten 24 Stunden'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {(Array.isArray(apartments) ? apartments : []).map((apt, index) => {
          const ageMs = Date.now() - new Date(apt.found_at).getTime();
          const isNew = ageMs < 24 * 60 * 60 * 1000;
          return (
            <div
              key={apt.id}
              className="group bg-card border border-border/60 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 overflow-hidden animate-enter"
              style={{ animationDelay: `${Math.min(index * 45, 400)}ms` }}
              data-testid={`apartment-card-${index}`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                {apt.image_url && (
                  <div className="sm:w-56 h-48 sm:h-auto overflow-hidden flex-shrink-0 bg-secondary">
                    <img
                      src={apt.image_url}
                      alt={apt.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      data-testid={`apartment-image-${index}`}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="font-heading text-lg font-semibold leading-snug" data-testid={`apartment-title-${index}`}>
                      {apt.title}
                    </h3>
                    {isNew && (
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold whitespace-nowrap" data-testid={`apartment-status-${index}`}>
                        Neu
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-4">
                    {apt.price != null && (
                      <div className="flex items-center gap-1.5">
                        <CurrencyEur weight="bold" size={16} className="text-primary" />
                        <span className="text-sm font-semibold" data-testid={`apartment-price-${index}`}>€{apt.price.toFixed(2)}</span>
                      </div>
                    )}
                    {apt.rooms != null && (
                      <div className="flex items-center gap-1.5">
                        <Bed weight="bold" size={16} className="text-muted-foreground" />
                        <span className="text-sm" data-testid={`apartment-rooms-${index}`}>{apt.rooms} Zimmer</span>
                      </div>
                    )}
                    {apt.area != null && (
                      <div className="flex items-center gap-1.5">
                        <Ruler weight="bold" size={16} className="text-muted-foreground" />
                        <span className="text-sm" data-testid={`apartment-area-${index}`}>{apt.area}m²</span>
                      </div>
                    )}
                    {apt.district && (
                      <div className="flex items-center gap-1.5">
                        <MapPin weight="bold" size={16} className="text-muted-foreground" />
                        <span className="text-sm" data-testid={`apartment-district-${index}`}>{apt.district}</span>
                      </div>
                    )}
                  </div>

                  {apt.address && (
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5 mb-1.5" data-testid={`apartment-address-${index}`}>
                      <MapPin weight="regular" size={15} className="mt-0.5 flex-shrink-0" />
                      {apt.address}
                    </p>
                  )}
                  {apt.landlord && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3" data-testid={`apartment-landlord-${index}`}>
                      <Buildings weight="regular" size={15} />
                      {apt.landlord}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                    <span className="text-xs text-muted-foreground" data-testid={`apartment-found-at-${index}`}>
                      Gefunden: {new Date(apt.found_at).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <a
                      href={apt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 shadow-sm"
                      data-testid={`apartment-view-link-${index}`}
                    >
                      <ArrowSquareOut weight="bold" size={16} />
                      Zur Anzeige
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
