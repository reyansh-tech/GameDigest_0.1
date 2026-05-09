import { ChevronRight, Star } from 'lucide-react';
import { sportMeta } from '../services/gameDigestApi.js';

export function MatchCard({ match, onClick, compact = false }) {
  const accent = {
    cricket: 'border-emerald-500/40',
    football: 'border-blue-500/40',
    basketball: 'border-orange-500/40',
    f1: 'border-red-500/40'
  }[match.sport] || 'border-gold/40';

  return (
    <button onClick={() => onClick?.(match)} className={`group glass w-full overflow-hidden rounded-[24px] border-l-2 ${accent} p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-glow active:scale-[.99]`}>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg border border-white/10 bg-white/[.04] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">{match.leagueShort}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${match.status === 'live' ? 'text-live' : 'text-zinc-500'}`}>{match.statusText}</span>
      </div>

      <div className={`mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${compact ? 'text-sm' : ''}`}>
        <Team name={match.team1s} score={match.score1} detail={match.s1d} />
        <span className="text-xs text-zinc-600">vs</span>
        <Team name={match.team2s} score={match.score2 || match.kickoff || 'TBC'} detail={match.s2d} right />
      </div>

      {!compact && (
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-zinc-500">
          <span className="flex items-center gap-2"><Star size={13} className="text-gold" />{match.mvp !== '-' ? match.mvp : sportMeta[match.sport]?.label}</span>
          <span className="flex items-center gap-1 text-zinc-400 transition group-hover:text-gold">Details <ChevronRight size={14} /></span>
        </div>
      )}
    </button>
  );
}

function Team({ name, score, detail, right = false }) {
  return (
    <div className={right ? 'text-right' : ''}>
      <div className="text-sm text-zinc-400">{name}</div>
      <div className="mt-1 font-display text-4xl leading-none tracking-wide text-white">{score}</div>
      {detail && <div className="mt-1 text-[11px] text-zinc-500">{detail}</div>}
    </div>
  );
}
