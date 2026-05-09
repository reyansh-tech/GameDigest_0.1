import { Play } from 'lucide-react';
import { CardSkeleton } from '../components/Skeletons.jsx';

export function NewsScreen({ loading, news }) {
  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><CardSkeleton count={6} /></div>;
  const [top, ...rest] = news;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.28em] text-gold">News</p>
        <h1 className="mt-2 font-display text-5xl">Top Stories</h1>
      </div>
      {top && (
        <article className="glass min-h-[330px] overflow-hidden rounded-[30px]">
          <div className="flex min-h-[330px] items-end bg-cover p-6" style={{ backgroundImage: top.image }}>
            <div>
              <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-black">Top Story</span>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold">{top.title}</h2>
              <p className="mt-2 text-sm text-zinc-300">{top.meta}</p>
            </div>
          </div>
        </article>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rest.map(item => (
          <article key={item.id} className="glass overflow-hidden rounded-[24px] transition hover:-translate-y-1 hover:shadow-glow">
            <div className="h-36 bg-cover" style={{ backgroundImage: item.image }} />
            <div className="p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>{item.meta}</span>
                <span className="flex items-center gap-1 text-gold"><Play size={12} /> Digest</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
