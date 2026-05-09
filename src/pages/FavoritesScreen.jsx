import { Star } from 'lucide-react';

export function FavoritesScreen({ options, favorites, toggleFavorite }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.28em] text-gold">Favorites</p>
        <h1 className="mt-2 font-display text-5xl">Teams & Leagues</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Object.entries(options).map(([sport, teams]) => (
          <section key={sport} className="glass rounded-[28px] p-5">
            <h2 className="mb-4 capitalize text-lg font-bold">{sport === 'f1' ? 'F1 Drivers' : sport}</h2>
            <div className="space-y-3">
              {teams.map(team => {
                const active = favorites.includes(team);
                return (
                  <button key={team} onClick={() => toggleFavorite(team)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-gold/40 active:scale-[.99]">
                    <div>
                      <p className="font-semibold">{team}</p>
                      <p className="text-xs capitalize text-zinc-500">{sport}</p>
                    </div>
                    <Star className={active ? 'fill-gold text-gold' : 'text-zinc-600'} size={20} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
