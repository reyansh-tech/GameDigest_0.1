const CACHE_PREFIX = 'gd_api_cache:';
const CACHE_TTL = {
  live: 45_000,
  today: 120_000,
  recent: 1_800_000,
  f1Results: 3_600_000,
  f1Next: 21_600_000
};

const BASE_URL = "https://gamedigest-backend.onrender.com";

export const sports = ['all', 'cricket', 'football', 'basketball', 'f1'];

export const sportMeta = {
  all: { label: 'All', dot: 'bg-gold' },
  cricket: { label: 'Cricket', dot: 'bg-emerald-500' },
  football: { label: 'Football', dot: 'bg-blue-500' },
  basketball: { label: 'Basketball', dot: 'bg-orange-500' },
  f1: { label: 'F1', dot: 'bg-red-500' }
};

export const favoriteOptions = {
  cricket: ['RCB', 'CSK', 'MI', 'KKR', 'India'],
  football: ['Barcelona', 'Real Madrid', 'Man City', 'Liverpool', 'Arsenal'],
  basketball: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bulls'],
  f1: ['Verstappen', 'Hamilton', 'Norris', 'Leclerc', 'Sainz']
};

function cacheRead(key, ttl) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const hit = JSON.parse(raw);
    if (!hit?.ts) return null;
    return { data: hit.data, stale: Date.now() - hit.ts > ttl };
  } catch {
    return null;
  }
}

function cacheWrite(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch (error) {
    console.warn('[Cache] write skipped', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url, { headers = {}, cacheKey = url, ttl = CACHE_TTL.today, retries = 2, timeout = 9000, force = false } = {}) {
  const cached = cacheRead(cacheKey, ttl);
  if (cached && !cached.stale && !force) return cached.data;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.retryable = [408, 429, 500, 502, 503, 504].includes(response.status);
        throw error;
      }
      const data = await response.json();
      cacheWrite(cacheKey, data);
      return data;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (error.retryable === false || attempt === retries) break;
      await sleep(350 * 2 ** attempt + Math.random() * 150);
    }
  }

  if (cached) {
    console.warn('[Cache] using stale data for', cacheKey, lastError?.message || lastError);
    return cached.data;
  }
  throw lastError || new Error('request failed');
}

function isoDate(offset = 0) {
  return new Date(Date.now() + offset * 86400000).toISOString().split('T')[0];
}

function fmtTime(value) {
  try {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'TBC';
  }
}

function defPlayers(sport) {
  const players = {
    cricket: [
      { name: 'Batsman', ini: 'B1', role: 'Batsman', stats: [{ l: 'Runs', v: '-' }, { l: 'Balls', v: '-' }, { l: 'SR', v: '-' }], bar: 50 },
      { name: 'Bowler', ini: 'BW', role: 'Bowler', stats: [{ l: 'Wkts', v: '-' }, { l: 'Econ', v: '-' }, { l: 'Ov', v: '-' }], bar: 40 }
    ],
    football: [
      { name: 'Player 1', ini: 'P1', role: 'Forward', stats: [{ l: 'Goals', v: '-' }, { l: 'Shots', v: '-' }, { l: 'Rtg', v: '-' }], bar: 50 },
      { name: 'Player 2', ini: 'P2', role: 'Midfielder', stats: [{ l: 'Assists', v: '-' }, { l: 'Passes', v: '-' }, { l: 'Rtg', v: '-' }], bar: 40 }
    ],
    basketball: [
      { name: 'Player 1', ini: 'P1', role: 'Guard', stats: [{ l: 'Pts', v: '-' }, { l: 'Ast', v: '-' }, { l: 'Reb', v: '-' }], bar: 50 },
      { name: 'Player 2', ini: 'P2', role: 'Forward', stats: [{ l: 'Pts', v: '-' }, { l: 'Reb', v: '-' }, { l: 'Blk', v: '-' }], bar: 40 }
    ],
    f1: [
      { name: 'Driver 1', ini: 'D1', role: 'Team 1', stats: [{ l: 'Pos', v: '-' }, { l: 'Pts', v: '-' }, { l: 'Gap', v: '-' }], bar: 50 },
      { name: 'Driver 2', ini: 'D2', role: 'Team 2', stats: [{ l: 'Pos', v: '-' }, { l: 'Pts', v: '-' }, { l: 'Gap', v: '-' }], bar: 40 }
    ]
  };
  return players[sport] || players.cricket;
}

function fallback(sport) {
  const data = {
    cricket: { t1: 'India', t2: 'Australia', s1: '283/7', s2: '241', lsh: 'INT', lg: 'International Cricket', mvp: 'Kohli 88' },
    football: { t1: 'Man City', t2: 'Arsenal', s1: '2', s2: '1', lsh: 'PL', lg: 'Premier League', mvp: 'Haaland' },
    basketball: { t1: 'LAL', t2: 'GSW', s1: '112', s2: '108', lsh: 'NBA', lg: 'NBA', mvp: 'LeBron 32pts' },
    f1: { t1: 'Verstappen', t2: 'Hamilton', s1: 'P1', s2: 'P3', lsh: 'F1', lg: 'Formula 1 2025', mvp: 'Verstappen (Win)' }
  }[sport];

  return {
    id: `${sport}-fb`,
    sport,
    featured: sport === 'f1',
    league: data.lg,
    leagueShort: data.lsh,
    team1: data.t1,
    team1s: data.t1,
    team2: data.t2,
    team2s: data.t2,
    score1: data.s1,
    s1d: '',
    score2: data.s2,
    s2d: '',
    status: 'ft',
    statusText: 'FT',
    mvp: data.mvp,
    players: defPlayers(sport),
    stats: [{ val: data.s1, lbl: data.t1 }, { val: data.s2, lbl: data.t2 }, { val: 'FT', lbl: 'Status' }],
    timeline: [],
    tlabels: [],
    hlTitle: `${data.t1} vs ${data.t2} Highlights`,
    source: 'Demo data'
  };
}

async function fetchCricket({ force = false } = {}) {
  try {
    const data = await fetchJSON(`${BASE_URL}/api/cricket`, {
      cacheKey: 'cricket:current',
      ttl: CACHE_TTL.live,
      force
    });
    if (data.status !== 'success' || !data.data?.length) throw new Error(data.info || 'no cricket data');
    return data.data.slice(0, 8).sort((a, b) => {
      const rank = match => match.matchStarted && !match.matchEnded ? 0 : !match.matchStarted ? 1 : 2;
      return rank(a) - rank(b);
    }).map((match, index) => {
      const t1 = match.teams?.[0] || 'Team 1';
      const t2 = match.teams?.[1] || 'Team 2';
      const sc1 = match.score?.[0];
      const sc2 = match.score?.[1];
      const s1 = sc1 ? `${sc1.r}/${sc1.w}` : '-';
      const s2 = sc2 ? `${sc2.r}/${sc2.w}` : '-';
      const s1d = sc1 ? `${sc1.o} ov` : '';
      const s2d = sc2 ? `${sc2.o} ov` : '';
      const live = match.matchStarted && !match.matchEnded;
      const done = match.matchEnded;
      const isUpcoming = !match.matchStarted && !match.matchEnded;
      const kickoffTime = match.dateTimeGMT ? fmtTime(match.dateTimeGMT) : match.date || 'TBC';
      return {
        id: `c-${match.id}`, sport: 'cricket', featured: index === 0 && !isUpcoming,
        league: (match.name || 'Cricket').split(',').pop().trim().slice(0, 28), leagueShort: 'CRIC',
        team1: t1, team1s: t1.split(' ').pop().slice(0, 12),
        team2: t2, team2s: t2.split(' ').pop().slice(0, 12),
        score1: isUpcoming ? 'vs' : s1, s1d, score2: isUpcoming ? '' : s2, s2d,
        kickoff: isUpcoming ? kickoffTime : null,
        kickoffTs: isUpcoming && match.dateTimeGMT ? new Date(match.dateTimeGMT).getTime() : null,
        status: live ? 'live' : done ? 'ft' : 'upcoming',
        statusText: live ? `Live - ${s1d || 'ongoing'}` : done ? 'FT' : kickoffTime,
        mvp: '-', players: defPlayers('cricket'),
        stats: isUpcoming ? [{ val: kickoffTime, lbl: 'Starts' }, { val: match.matchType?.toUpperCase() || 'CRIC', lbl: 'Format' }, { val: '-', lbl: 'Venue' }] : [{ val: s1, lbl: t1.split(' ').pop() }, { val: s2, lbl: t2.split(' ').pop() }, { val: live ? 'Live' : done ? 'FT' : 'Soon', lbl: 'Status' }],
        timeline: [], tlabels: [], hlTitle: `${t1} vs ${t2} Highlights`, source: 'CricAPI'
      };
    });
  } catch (error) {
    console.warn('[Cricket]', error.message);
    return [fallback('cricket')];
  }
}

async function getFootballDay(date, { force = false, ttl = CACHE_TTL.today } = {}) {
  const data = await fetchJSON(`${BASE_URL}/api/football?date=${encodeURIComponent(date)}`, {
    cacheKey: `football:${date}`,
    ttl,
    force
  });
  if (data.errors && Object.keys(data.errors).length) throw new Error(JSON.stringify(data.errors));
  return data.response || [];
}

async function fetchFootball({ force = false } = {}) {
  try {
    const [todayFixtures, yestFixtures] = await Promise.all([
      getFootballDay(isoDate(0), { force, ttl: CACHE_TTL.today }),
      getFootballDay(isoDate(-1), { force: false, ttl: CACHE_TTL.recent })
    ]);
    const todayIds = new Set(todayFixtures.map(f => f.fixture?.id));
    const fixtures = [...todayFixtures, ...yestFixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short || '') && !todayIds.has(f.fixture?.id))];
    if (!fixtures.length) throw new Error('no fixtures found');
    const liveSet = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
    const doneSet = ['FT', 'AET', 'PEN'];
    fixtures.sort((a, b) => {
      const rank = s => liveSet.includes(s) ? 0 : doneSet.includes(s) ? 2 : 1;
      const sa = a.fixture?.status?.short || '';
      const sb = b.fixture?.status?.short || '';
      return rank(sa) !== rank(sb) ? rank(sa) - rank(sb) : new Date(a.fixture?.date || 0) - new Date(b.fixture?.date || 0);
    });
    return fixtures.slice(0, 8).map(f => {
      const t1 = f.teams?.home?.name || 'Home';
      const t2 = f.teams?.away?.name || 'Away';
      const short = f.fixture?.status?.short || '';
      const isLive = liveSet.includes(short);
      const isDone = doneSet.includes(short);
      const isUpcoming = !isLive && !isDone;
      const t1s = t1.replace('Manchester', 'Man').replace('Tottenham Hotspur', 'Spurs').slice(0, 14);
      const t2s = t2.replace('Manchester', 'Man').replace('Tottenham Hotspur', 'Spurs').slice(0, 14);
      const s1 = f.goals?.home != null ? String(f.goals.home) : '-';
      const s2 = f.goals?.away != null ? String(f.goals.away) : '-';
      const elapsed = f.fixture?.status?.elapsed;
      const kickoff = fmtTime(f.fixture?.date);
      const comp = f.league?.name || 'Football';
      const events = f.events || [];
      const goals = events.filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty');
      const timeline = goals.slice(0, 5).map(e => ({ pct: Math.min(95, Math.round((e.time?.elapsed || 1) / 90 * 100)), type: 'goal', label: `${e.player?.name?.split(' ').pop() || 'Goal'} ${e.time?.elapsed}'` }));
      const scorers = [...new Set(goals.map(e => e.player?.name?.split(' ').pop()).filter(Boolean))];
      return {
        id: `f-${f.fixture?.id}`, sport: 'football', featured: ['Premier League', 'La Liga', 'UEFA Champions League'].includes(comp),
        league: comp, leagueShort: f.league?.country === 'World' ? 'Intl' : f.league?.country?.slice(0, 3) || 'INT',
        team1: t1, team1s: t1s, team2: t2, team2s: t2s,
        score1: isUpcoming ? 'vs' : s1, score2: isUpcoming ? '' : s2, s1d: short === 'HT' ? 'HT' : '', s2d: '',
        kickoff: isUpcoming ? kickoff : null, kickoffTs: isUpcoming ? new Date(f.fixture?.date).getTime() : null,
        status: isLive ? 'live' : isDone ? 'ft' : 'upcoming',
        statusText: isLive ? `Live - ${elapsed || ''}'` : isDone ? 'FT' : kickoff,
        mvp: isUpcoming ? '-' : scorers[0] ? `${scorers[0]} (goal)` : '-',
        players: defPlayers('football'),
        stats: isUpcoming ? [{ val: kickoff, lbl: 'Kick-off' }, { val: comp.split(' ')[0], lbl: 'League' }, { val: f.fixture?.venue?.name?.split(' ')[0] || 'TBC', lbl: 'Venue' }] : [{ val: s1, lbl: `${t1s} goals` }, { val: s2, lbl: `${t2s} goals` }, { val: elapsed ? `${elapsed}'` : isDone ? 'FT' : 'League', lbl: isLive ? 'Elapsed' : 'Result' }],
        timeline, tlabels: ["0'", "22'", "45'", "67'", "90'"], hlTitle: `${t1s} vs ${t2s} - ${comp} Highlights`, source: 'API-Football'
      };
    });
  } catch (error) {
    console.warn('[Football]', error.message);
    return [fallback('football')];
  }
}

async function getBasketballDay(date, { force = false, ttl = CACHE_TTL.today } = {}) {
  const data = await fetchJSON(`${BASE_URL}/api/basketball?date=${encodeURIComponent(date)}`, {
    cacheKey: `basketball:${date}`,
    ttl,
    force
  });
  return data.data || [];
}

async function fetchBasketball({ force = false } = {}) {
  try {
    const [todayGames, yestGames] = await Promise.all([
      getBasketballDay(isoDate(0), { force, ttl: CACHE_TTL.today }),
      getBasketballDay(isoDate(-1), { force: false, ttl: CACHE_TTL.recent })
    ]);
    const todayIds = new Set(todayGames.map(g => g.id));
    let games = [...todayGames, ...yestGames.filter(g => g.status === 'Final' && !todayIds.has(g.id))];
    if (!games.length) games = await getBasketballDay(isoDate(-2), { force: false, ttl: CACHE_TTL.recent });
    if (!games.length) throw new Error('no games');
    games.sort((a, b) => {
      const live = g => /Q[1-4]|OT/.test(g.status || '');
      const done = g => g.status === 'Final';
      const rank = g => live(g) ? 0 : done(g) ? 2 : 1;
      return rank(a) !== rank(b) ? rank(a) - rank(b) : new Date(a.date) - new Date(b.date);
    });
    return games.slice(0, 6).map(g => {
      const t1 = g.home_team?.abbreviation || 'HOM';
      const t2 = g.visitor_team?.abbreviation || 'VIS';
      const s1 = g.home_team_score > 0 ? String(g.home_team_score) : '-';
      const s2 = g.visitor_team_score > 0 ? String(g.visitor_team_score) : '-';
      const isLive = g.status && g.status !== 'Final' && /Q[1-4]|OT/.test(g.status);
      const isDone = g.status === 'Final';
      const isUpcoming = !isLive && !isDone;
      const kickoff = g.status && !isLive && !isDone ? fmtTime(g.date) : 'TBC';
      return {
        id: `b-${g.id}`, sport: 'basketball', featured: false,
        league: `NBA ${g.season || new Date().getFullYear()}`, leagueShort: 'NBA',
        team1: g.home_team?.full_name || t1, team1s: t1, team2: g.visitor_team?.full_name || t2, team2s: t2,
        score1: isUpcoming ? 'vs' : s1, score2: isUpcoming ? '' : s2, s1d: isLive ? g.status : '', s2d: '',
        kickoff: isUpcoming ? kickoff : null, kickoffTs: isUpcoming ? new Date(g.date).getTime() : null,
        status: isLive ? 'live' : isDone ? 'ft' : 'upcoming', statusText: isLive ? `Live - ${g.status}` : isDone ? 'Final' : kickoff,
        mvp: '-', players: defPlayers('basketball'),
        stats: isUpcoming ? [{ val: kickoff, lbl: 'Tip-off' }, { val: 'NBA', lbl: 'League' }, { val: g.season || '2025', lbl: 'Season' }] : [{ val: s1, lbl: `${t1} pts` }, { val: s2, lbl: `${t2} pts` }, { val: g.season || '2025', lbl: 'Season' }],
        timeline: [], tlabels: [], hlTitle: `${t1} vs ${t2} - NBA Highlights`, source: 'BallDontLie'
      };
    });
  } catch (error) {
    console.warn('[Basketball]', error.message);
    return [fallback('basketball')];
  }
}

async function fetchF1({ force = false } = {}) {
  try {
    const year = new Date().getFullYear();
    const data = await fetchJSON(`${BASE_URL}/api/f1?year=${year}`, { cacheKey: `f1:${year}:results`, ttl: CACHE_TTL.f1Results, force });
    const races = data?.MRData?.RaceTable?.Races;
    if (!races?.length) throw new Error('no races');
    const last = races[races.length - 1];
    const top4 = last.Results?.slice(0, 4) || [];
    const p1 = top4[0];
    const p2 = top4[1];
    const matches = [{
      id: `f1-${last.round}`, sport: 'f1', featured: true,
      league: `Formula 1 ${year}`, leagueShort: 'F1',
      team1: p1 ? `${p1.Driver.givenName} ${p1.Driver.familyName}` : 'P1', team1s: p1?.Driver?.familyName || 'P1',
      team2: p2 ? `${p2.Driver.givenName} ${p2.Driver.familyName}` : 'P2', team2s: p2?.Driver?.familyName || 'P2',
      score1: 'P1', score2: 'P2', s1d: p1?.Constructor?.name || '', s2d: p2?.Constructor?.name || '',
      status: 'ft', statusText: `Race Over - ${last.raceName}`, mvp: `${p1?.Driver?.familyName || '-'} (Winner)`,
      players: top4.map((r, i) => ({ name: `${r.Driver.givenName} ${r.Driver.familyName}`, ini: r.Driver.familyName.slice(0, 2).toUpperCase(), role: r.Constructor.name, stats: [{ l: 'Position', v: `P${r.position}` }, { l: 'Points', v: `+${r.points}` }, { l: 'Gap', v: i === 0 ? (r.Time?.time || r.status) : (r.Time?.time || '-') }], bar: Math.max(10, 100 - (Number(r.position) - 1) * 15) })),
      stats: [{ val: p1?.Driver?.familyName || '-', lbl: 'Winner' }, { val: p1?.points || '-', lbl: 'Pts' }, { val: last.Circuit?.Location?.country || '-', lbl: 'Country' }],
      timeline: top4.map((r, i) => ({ pct: 8 + i * 26, type: 'lap', label: `P${r.position} ${r.Driver.familyName}` })),
      tlabels: ['Start', 'Lap 15', 'Lap 30', 'Lap 45', 'Finish'], hlTitle: `${last.raceName} ${year} - Full Race Highlights`, source: 'Jolpica F1'
    }];
    try {
      const next = await fetchJSON(`${BASE_URL}/api/f1?year=${year}&kind=next`, { cacheKey: `f1:${year}:next`, ttl: CACHE_TTL.f1Next, force });
      const nx = next?.MRData?.RaceTable?.Races?.[0];
      if (nx) matches.push({
        id: 'f1-next', sport: 'f1', featured: false,
        league: `Formula 1 ${year}`, leagueShort: 'F1', team1: 'Next Race', team1s: 'NEXT',
        team2: nx.Circuit?.circuitName?.split(' ')[0] || 'TBC', team2s: 'TBC',
        score1: '-', s1d: 'Upcoming', score2: '-', s2d: nx.Circuit?.Location?.country || '',
        status: 'upcoming', statusText: new Date(nx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), mvp: '-',
        players: defPlayers('f1'), stats: [{ val: nx.round, lbl: 'Round' }, { val: nx.Circuit?.Location?.country || '-', lbl: 'Country' }, { val: new Date(nx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), lbl: 'Date' }],
        timeline: [], tlabels: [], hlTitle: `${nx.raceName} ${year} - Preview`, source: 'Jolpica F1'
      });
    } catch {}
    return matches;
  } catch (error) {
    console.warn('[F1]', error.message);
    return [fallback('f1')];
  }
}

export async function fetchAllMatches({ force = false } = {}) {
  const groups = await Promise.all([
    fetchCricket({ force }),
    fetchFootball({ force }),
    fetchBasketball({ force }),
    fetchF1({ force })
  ]);
  return groups.flat();
}

export function sortMatches(matches, filter = 'all', favorites = []) {
  return matches.filter(match => filter === 'all' || match.sport === filter).sort((a, b) => {
    const fa = isFavorite(a, favorites);
    const fb = isFavorite(b, favorites);
    if (fa !== fb) return Number(fb) - Number(fa);
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return ({ live: 0, ft: 1, upcoming: 2 }[a.status] || 1) - ({ live: 0, ft: 1, upcoming: 2 }[b.status] || 1);
  });
}

export function isFavorite(match, favorites = []) {
  return favorites.some(team => [match.team1, match.team2, match.team1s, match.team2s].some(value => String(value).includes(team)));
}

export function buildFallbackSummary(match) {
  const text = {
    cricket: `${match.team1s} are scoring at ${match.score1} against ${match.team2s} (${match.score2}). ${match.status === 'live' ? 'The match is in full swing and every ball matters.' : match.status === 'ft' ? 'The match has concluded. Check highlights for the key moments.' : 'Both sides are preparing for a big contest.'}`,
    football: `${match.team1s} ${match.score1} - ${match.score2} ${match.team2s}. ${match.status === 'live' ? 'Both sides are battling hard and this one could swing late.' : match.status === 'ft' ? 'Full time has settled an exciting fixture.' : 'Kick-off is coming up. Watch this space for live updates.'}`,
    basketball: `${match.team1s} ${match.score1} - ${match.score2} ${match.team2s}. ${match.status === 'live' ? 'It is fast-paced with both teams trading buckets.' : match.status === 'ft' ? 'The final buzzer has sounded on another NBA clash.' : 'Tip-off is incoming with both rosters ready.'}`,
    f1: `${match.team1s} finished ${match.score1} with ${match.team2s} in ${match.score2}. ${match.status === 'ft' ? 'The chequered flag has fallen on a dramatic race weekend.' : 'The next race is approaching as teams prepare strategy.'}`
  };
  return text[match.sport] || `${match.team1s} ${match.score1} vs ${match.team2s} ${match.score2} - ${match.statusText}.`;
}

export function buildNews(matches) {
  const base = sortMatches(matches).slice(0, 5);
  return base.map((match, index) => ({
    id: `news-${match.id}`,
    title: index === 0 ? `${match.mvp !== '-' ? match.mvp : match.team1s} powers ${match.team1s} story` : `${match.team1s} vs ${match.team2s}: ${match.statusText}`,
    meta: index === 0 ? 'Top story' : `${index + 1}h ago`,
    sport: match.sport,
    image: `linear-gradient(135deg, rgba(242,194,48,.28), rgba(255,255,255,.03)), radial-gradient(circle at 70% 20%, rgba(255,255,255,.16), transparent 9rem)`
  }));
}
