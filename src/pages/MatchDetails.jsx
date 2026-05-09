import { Share2 } from 'lucide-react';
import { MatchCard } from '../components/MatchCard.jsx';
import { CardSkeleton } from '../components/Skeletons.jsx';
import { buildFallbackSummary } from '../services/gameDigestApi.js';

export function MatchDetails({ loading, match, matches, onSelect }) {
  if (loading) return <div className="grid gap-5 lg:grid-cols-[260px_1fr]"><CardSkeleton count={4} /><CardSkeleton count={2} /></div>;
  if (!match) return <div className="glass rounded-[28px] p-8 text-zinc-400">No match selected.</div>;

  return (
    <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)_270px]">
      <aside className="hidden space-y-3 xl:block">
        <h2 className="px-2 text-sm font-bold uppercase tracking-[.2em] text-zinc-500">Match Center</h2>
        {matches.slice(0, 7).map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full rounded-2xl border p-3 text-left text-sm transition ${item.id === match.id ? 'border-gold/40 bg-gold/15 text-gold' : 'border-white/10 bg-white/[.03] text-zinc-300 hover:border-white/20'}`}>
            {item.team1s} vs {item.team2s}
          </button>
        ))}
      </aside>

      <section className="space-y-5">
        <div className="glass rounded-[28px] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.24em] text-gold">{match.league}</p>
              <h1 className="mt-2 text-2xl font-bold">{match.team1s} vs {match.team2s}</h1>
            </div>
            <button className="soft-pill flex items-center gap-2"><Share2 size={15} />Share</button>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-[24px] border border-white/10 bg-black/20 p-5">
            <Score label={match.team1} score={match.score1} sub={match.s1d} />
            <div className="rounded-full bg-live px-3 py-1 text-xs font-bold">LIVE</div>
            <Score label={match.team2} score={match.score2 || match.kickoff || 'TBC'} sub={match.s2d} right />
          </div>
        </div>

        <div className="glass rounded-[28px] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-zinc-500">Live Win Probability</h2>
          <div className="flex justify-between text-sm text-zinc-300"><span>{match.team1s} 62%</span><span>{match.team2s} 38%</span></div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-blue-500 to-gold" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {match.stats?.map(stat => (
            <div key={`${stat.lbl}-${stat.val}`} className="glass rounded-[22px] p-4 text-center">
              <p className="font-display text-3xl text-gold">{stat.val}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{stat.lbl}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-[28px] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-zinc-500">AI Summary</h2>
          <p className="leading-7 text-zinc-300">{buildFallbackSummary(match)}</p>
        </div>
      </section>

      <aside className="glass rounded-[28px] p-4">
        <h2 className="mb-4 font-bold">Key Moments</h2>
        <div className="space-y-3">
          {(match.timeline?.length ? match.timeline : [{ label: match.statusText, pct: 50, type: 'moment' }]).map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-start gap-3 rounded-2xl bg-white/[.03] p-3">
              <div className="mt-1 size-2 rounded-full bg-gold" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-zinc-500">{match.tlabels?.[index] || `${Math.round(item.pct)}%`}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Score({ label, score, sub, right }) {
  return (
    <div className={right ? 'text-right' : ''}>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 font-display text-6xl leading-none">{score}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}
