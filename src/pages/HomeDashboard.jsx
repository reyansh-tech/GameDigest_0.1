import { ArrowUpRight } from 'lucide-react';
import { MatchCard } from '../components/MatchCard.jsx';
import { CardSkeleton } from '../components/Skeletons.jsx';

export function HomeDashboard({ loading, live, upcoming, news, onOpenMatch }) {
  const hero = live[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.28em] text-gold">Live now</p>
            <h1 className="mt-2 font-display text-5xl tracking-wide text-white sm:text-6xl">Today in Sports</h1>
          </div>
          <button className="hidden text-sm font-semibold text-gold sm:block">View all</button>
        </div>

        {loading ? (
          <CardSkeleton count={1} />
        ) : hero ? (
          <button onClick={() => onOpenMatch(hero)} className="glass group relative min-h-[270px] w-full overflow-hidden rounded-[30px] p-5 text-left transition hover:-translate-y-1 hover:shadow-glow active:scale-[.99]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(242,194,48,.22),transparent_14rem)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-950/45 to-transparent" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-live px-3 py-1 text-xs font-bold text-white">LIVE</span>
                <span className="text-xs text-zinc-400">{hero.league}</span>
              </div>
              <div className="mt-14 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <ScoreBlock label={hero.team1s} score={hero.score1} sub={hero.s1d} />
                <span className="text-zinc-500">vs</span>
                <ScoreBlock label={hero.team2s} score={hero.score2 || hero.kickoff || 'TBC'} sub={hero.s2d} right />
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="text-zinc-400">{hero.statusText}</span>
                <span className="flex items-center gap-1 font-semibold text-gold">Match center <ArrowUpRight size={16} /></span>
              </div>
            </div>
          </button>
        ) : null}

        <SectionTitle title="Upcoming Matches" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? <CardSkeleton count={3} /> : upcoming.map(match => <MatchCard key={match.id} match={match} compact onClick={onOpenMatch} />)}
        </div>
      </section>

      <aside className="space-y-5">
        <SectionTitle title="Top News" small />
        <div className="glass rounded-[26px] p-3">
          {news.map((item, index) => (
            <div key={item.id} className={`flex gap-3 p-3 ${index !== news.length - 1 ? 'border-b border-white/10' : ''}`}>
              <div className="h-16 w-20 shrink-0 rounded-2xl bg-cover" style={{ backgroundImage: item.image }} />
              <div>
                <h3 className="line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function ScoreBlock({ label, score, sub, right }) {
  return (
    <div className={right ? 'text-right' : ''}>
      <p className="text-sm font-semibold text-zinc-300">{label}</p>
      <p className="mt-2 font-display text-6xl leading-none tracking-wide">{score}</p>
      {sub && <p className="mt-1 text-sm text-zinc-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ title, small = false }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className={`font-bold ${small ? 'text-lg' : 'text-xl'}`}>{title}</h2>
      <button className="text-xs font-semibold text-gold">View all</button>
    </div>
  );
}
