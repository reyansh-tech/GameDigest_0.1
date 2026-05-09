export function AppShell({ children, navItems, page, setPage, actions, lastUpdated }) {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="mx-auto flex max-w-[1480px]">
        <aside className="sticky top-0 hidden h-screen w-56 border-r border-white/10 bg-black/30 p-5 lg:block">
          <Logo />
          <nav className="mt-10 space-y-2">
            {navItems.slice(0, 4).map(item => <NavButton key={item.id} item={item} active={page === item.id} onClick={() => setPage(item.id)} />)}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-white/10 bg-ink/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="lg:hidden"><Logo compact /></div>
              <div className="hidden text-xs text-zinc-500 sm:block">
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading feed'}
              </div>
              <div className="flex items-center gap-2">{actions}</div>
            </div>
          </header>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[26px] border border-white/10 bg-panel/95 p-2 shadow-premium backdrop-blur-xl lg:hidden">
        {navItems.map(item => <MobileNavButton key={item.id} item={item} active={page === item.id} onClick={() => setPage(item.id)} />)}
      </nav>
    </div>
  );
}

function Logo({ compact = false }) {
  return (
    <div>
      <div className={`font-display tracking-wide ${compact ? 'text-3xl' : 'text-4xl'}`}>
        GAME<span className="text-gold">DIGEST</span>
      </div>
      {!compact && <p className="mt-3 text-sm leading-6 text-zinc-400">All Sports. All Scores. One Digest.</p>}
    </div>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={`nav-item w-full ${active ? 'nav-item-active' : ''}`}>
      <Icon size={17} />
      <span>{item.label}</span>
    </button>
  );
}

function MobileNavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[10px] transition active:scale-95 ${active ? 'bg-gold/15 text-gold' : 'text-zinc-500'}`}>
      <Icon size={18} />
      <span className="mt-1">{item.label}</span>
    </button>
  );
}
