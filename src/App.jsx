import { useEffect, useMemo, useState } from 'react';
import { Bell, Grid2X2, Home, Newspaper, RefreshCw, Search, Star, Trophy, User } from 'lucide-react';
import { buildNews, favoriteOptions, fetchAllMatches, sortMatches, sportMeta, sports } from './services/gameDigestApi.js';
import { AppShell } from './components/AppShell.jsx';
import { HomeDashboard } from './pages/HomeDashboard.jsx';
import { MatchDetails } from './pages/MatchDetails.jsx';
import { NewsScreen } from './pages/NewsScreen.jsx';
import { FavoritesScreen } from './pages/FavoritesScreen.jsx';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'matches', label: 'Matches', icon: Grid2X2 },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'profile', label: 'Profile', icon: User }
];

export default function App() {
  const [page, setPage] = useState('home');
  const [matches, setMatches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gd_f') || '[]'); } catch { return []; }
  });

  async function load(force = false) {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const data = await fetchAllMatches({ force });
      setMatches(data);
      setLastUpdated(new Date());
      if (!selectedId && data[0]) setSelectedId(data[0].id);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(false); }, []);

  useEffect(() => {
    localStorage.setItem('gd_f', JSON.stringify(favorites));
  }, [favorites]);

  const sorted = useMemo(() => sortMatches(matches, filter, favorites), [matches, filter, favorites]);
  const live = sorted.filter(match => match.status === 'live' || match.status === 'ft').slice(0, 4);
  const upcoming = sorted.filter(match => match.status === 'upcoming').slice(0, 6);
  const selected = matches.find(match => match.id === selectedId) || sorted[0];
  const news = useMemo(() => buildNews(matches), [matches]);

  function openMatch(match) {
    setSelectedId(match.id);
    setPage('matches');
  }

  function toggleFavorite(team) {
    setFavorites(current => current.includes(team) ? current.filter(item => item !== team) : [...current, team]);
  }

  return (
    <AppShell
      navItems={navItems}
      page={page}
      setPage={setPage}
      lastUpdated={lastUpdated}
      actions={(
        <>
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-3 py-2 text-sm text-zinc-400 md:flex">
            <Search size={16} />
            <span>Search teams, matches, news...</span>
          </div>
          <button className="soft-pill !rounded-2xl !p-3" aria-label="Notifications"><Bell size={17} /></button>
          <button onClick={() => load(true)} className="gold-pill flex items-center gap-2 !rounded-2xl">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </>
      )}
    >
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {sports.map(sport => (
          <button
            key={sport}
            onClick={() => setFilter(sport)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition active:scale-95 ${filter === sport ? 'bg-gold text-black' : 'border border-white/10 bg-white/[.04] text-zinc-300 hover:border-gold/40'}`}
          >
            {sport !== 'all' && <span className={`mr-2 inline-block size-2 rounded-full ${sportMeta[sport].dot}`} />}
            {sportMeta[sport].label}
          </button>
        ))}
      </div>

      {page === 'home' && (
        <HomeDashboard
          loading={loading}
          live={live}
          upcoming={upcoming}
          news={news}
          onOpenMatch={openMatch}
        />
      )}

      {page === 'matches' && (
        <MatchDetails
          loading={loading}
          match={selected}
          matches={sorted}
          onSelect={setSelectedId}
        />
      )}

      {page === 'news' && <NewsScreen loading={loading} news={news} />}

      {page === 'favorites' && (
        <FavoritesScreen
          options={favoriteOptions}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      {page === 'profile' && (
        <div className="glass rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><Trophy /></div>
            <div>
              <h2 className="text-xl font-bold">GameDigest Profile</h2>
              <p className="text-sm text-zinc-400">This UI now uses secure backend proxy routes. Favorites are saved in this browser.</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
