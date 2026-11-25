import { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  Check,
  Clock,
  Coins,
  Compass,
  Download,
  Fish,
  Languages,
  MapPin,
  Moon,
  Package,
  RotateCcw,
  ScrollText,
  Search,
  Sparkles,
  Sun,
  Upload,
  Wrench,
  X,
} from 'lucide-react';
import fishData from './data/fish.json';
import { TRANSLATIONS } from './i18n/translations';

const CAUGHT_STORAGE_KEY = 'dreadmoor_caught_v1';
const LANG_STORAGE_KEY = 'dreadmoor_lang_v1';

const CATEGORY_STYLES = {
  Peaceful: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Predator: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

const RARITY_STYLES = {
  Common: 'border-slate-600/50 bg-slate-800/70 text-slate-300',
  Rare: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  Unique: 'border-violet-500/40 bg-violet-500/15 text-violet-300',
  Legendary: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
  Unknown: 'border-slate-700 bg-slate-800/60 text-slate-400',
};

const TIME_STYLES = {
  Night: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300',
  Day: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  Both: 'border-slate-700/80 bg-slate-800/60 text-slate-300',
};

function loadCaughtIds() {
  try {
    const raw = localStorage.getItem(CAUGHT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // Ignore storage errors
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function FishThumbnail({ src, name, pendingLabel }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 text-slate-600">
        <Fish className="h-9 w-9" />
        <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500">
          {pendingLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain mix-blend-lighten"
    />
  );
}

export default function App() {
  const [lang, setLang] = useState(loadInitialLang);
  const [caughtIds, setCaughtIds] = useState(loadCaughtIds);
  const [search, setSearch] = useState('');
  const [selectedBait, setSelectedBait] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedLineReq, setSelectedLineReq] = useState('');
  const [onlyUncaught, setOnlyUncaught] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      localStorage.setItem(CAUGHT_STORAGE_KEY, JSON.stringify(caughtIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [caughtIds]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timer = setTimeout(() => setStatusMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const allBaits = useMemo(() => {
    const set = new Set();
    fishData.forEach((f) => f.baits.forEach((b) => set.add(b)));
    return Array.from(set).sort();
  }, []);

  const allLocations = useMemo(() => {
    const set = new Set();
    fishData.forEach((f) => f.locations.forEach((loc) => set.add(loc)));
    return Array.from(set).sort();
  }, []);

  const allCategories = useMemo(() => {
    return Array.from(new Set(fishData.map((f) => f.category))).sort();
  }, []);

  const allTimes = useMemo(() => {
    return Array.from(new Set(fishData.map((f) => f.timeOfDay))).sort();
  }, []);

  const allRarities = useMemo(() => {
    const order = ['Common', 'Rare', 'Unique', 'Legendary', 'Unknown'];
    const present = new Set(fishData.map((f) => f.rarity));
    return order.filter((r) => present.has(r));
  }, []);

  const allLineReqs = useMemo(() => {
    return Array.from(new Set(fishData.map((f) => f.lineRequirement))).sort();
  }, []);

  const caughtSet = useMemo(() => new Set(caughtIds), [caughtIds]);

  const filteredFish = useMemo(() => {
    const query = search.trim().toLowerCase();
    return fishData.filter((fish) => {
      if (query && !fish.name.toLowerCase().includes(query)) return false;
      if (selectedBait && !fish.baits.includes(selectedBait)) return false;
      if (selectedLocation && !fish.locations.includes(selectedLocation)) return false;
      if (selectedCategory && fish.category !== selectedCategory) return false;
      if (selectedTime && fish.timeOfDay !== selectedTime) return false;
      if (selectedRarity && fish.rarity !== selectedRarity) return false;
      if (selectedLineReq && fish.lineRequirement !== selectedLineReq) return false;
      if (onlyUncaught && caughtSet.has(fish.id)) return false;
      return true;
    });
  }, [
    search,
    selectedBait,
    selectedLocation,
    selectedCategory,
    selectedTime,
    selectedRarity,
    selectedLineReq,
    onlyUncaught,
    caughtSet,
  ]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedBait) ||
    Boolean(selectedLocation) ||
    Boolean(selectedCategory) ||
    Boolean(selectedTime) ||
    Boolean(selectedRarity) ||
    Boolean(selectedLineReq) ||
    onlyUncaught;

  const totalCount = fishData.length;
  const caughtCount = fishData.filter((f) => caughtSet.has(f.id)).length;
  const progressPct = totalCount > 0 ? Math.round((caughtCount / totalCount) * 100) : 0;

  function toggleCaught(id) {
    setCaughtIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setSearch('');
    setSelectedBait('');
    setSelectedLocation('');
    setSelectedCategory('');
    setSelectedTime('');
    setSelectedRarity('');
    setSelectedLineReq('');
    setOnlyUncaught(false);
  }

  const translateBait = (bait) => t.baits?.[bait] ?? bait;
  const translateLocation = (loc) => t.locations?.[loc] ?? loc;
  const translateHabitat = (hab) => t.habitats?.[hab] ?? hab;
  const translateLineReq = (req) => t.lineRequirements?.[req] ?? req;
  const translateRecyclingItem = (item) => t.recyclingItems?.[item] ?? item;

  async function handleExport() {
    const payload = JSON.stringify(caughtIds);
    try {
      await navigator.clipboard.writeText(payload);
      setStatusMessage(t.exportedMsg);
    } catch {
      window.prompt(t.exportBtn, payload);
    }
  }

  function handleImport() {
    const raw = window.prompt(t.importPrompt);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Invalid');
      const validIds = new Set(fishData.map((f) => f.id));
      const cleaned = Array.from(new Set(parsed.filter((id) => validIds.has(id))));
      setCaughtIds(cleaned);
      setStatusMessage(t.importSuccess);
    } catch {
      setStatusMessage(t.importError);
    }
  }

  function handleReset() {
    if (window.confirm(t.resetConfirm)) {
      setCaughtIds([]);
    }
  }

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Anchor className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
                  DREADMOOR <span className="text-emerald-400">Tracker</span>
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  {t.earlyAccessBadge}
                </span>
              </div>
              <p className="text-sm text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Languages className="h-4 w-4 text-slate-400" />
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/90 p-1">
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  lang === 'es'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  lang === 'en'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Progress & Backup Bar */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.progressLabel}
              </span>
              <p className="text-base font-semibold text-slate-100">
                {t.caughtCount
                  .replace('{caught}', String(caughtCount))
                  .replace('{total}', String(totalCount))}{' '}
                <span className="text-sm font-normal text-emerald-400">({progressPct}%)</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                {t.exportBtn}
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <Upload className="h-3.5 w-3.5" />
                {t.importBtn}
              </button>
              {caughtCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.resetBtn}
                </button>
              )}
            </div>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {statusMessage && (
            <p className="mt-2 text-xs font-medium text-emerald-300">{statusMessage}</p>
          )}
        </section>

        {/* Search & Filters */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
            />
          </div>

          <select
            value={selectedBait}
            onChange={(e) => setSelectedBait(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500/60 focus:outline-none"
          >
            <option value="">{t.allBaits}</option>
            {allBaits.map((bait) => (
              <option key={bait} value={bait}>
                {translateBait(bait)}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500/60 focus:outline-none"
          >
            <option value="">{t.allLocations}</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>
                {translateLocation(loc)}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500/60 focus:outline-none"
          >
            <option value="">{t.allCategories}</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {t.categories[cat] ?? cat}
              </option>
            ))}
          </select>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500/60 focus:outline-none"
          >
            <option value="">{t.allTimes}</option>
            {allTimes.map((time) => (
              <option key={time} value={time}>
                {t.times[time] ?? time}
              </option>
            ))}
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500/60 focus:outline-none"
          >
            <option value="">{t.allRarities}</option>
            {allRarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {t.rarities[rarity] ?? rarity}
              </option>
            ))}
          </select>

          <select
            value={selectedLineReq}
            onChange={(e) => setSelectedLineReq(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500/60 focus:outline-none"
          >
            <option value="">{t.allLineReqs}</option>
            {allLineReqs.map((req) => (
              <option key={req} value={req}>
                {translateLineReq(req)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyUncaught((prev) => !prev)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                onlyUncaught
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                  : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
              }`}
            >
              {t.onlyUncaught}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                title={t.clearFilters}
                className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Fish Grid */}
        {filteredFish.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
            <Fish className="mx-auto mb-3 h-8 w-8 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-200">{t.noResultsTitle}</h2>
            <p className="mt-1 text-sm text-slate-400">{t.noResultsDesc}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        ) : (
          <main className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFish.map((fish) => {
              const isCaught = caughtSet.has(fish.id);
              const categoryStyle =
                CATEGORY_STYLES[fish.category] ??
                'border-slate-700 bg-slate-800 text-slate-300';
              const rarityStyle = RARITY_STYLES[fish.rarity] ?? RARITY_STYLES.Unknown;
              const timeStyle = TIME_STYLES[fish.timeOfDay] ?? TIME_STYLES.Both;

              return (
                <article
                  key={fish.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isCaught
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/80 p-2">
                      <FishThumbnail
                        src={fish.image}
                        name={fish.name}
                        pendingLabel={t.imagePending}
                      />
                    </div>

                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-slate-50">{fish.name}</h2>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyle}`}
                      >
                        {t.categories[fish.category] ?? fish.category}
                      </span>
                    </div>

                    {/* Rarity, Mutant & Time badges */}
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${rarityStyle}`}
                      >
                        {t.rarities[fish.rarity] ?? fish.rarity}
                      </span>

                      {fish.isMutant && (
                        <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-0.5 text-[11px] font-medium text-fuchsia-300">
                          {t.mutantBadge}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${timeStyle}`}
                      >
                        {fish.timeOfDay === 'Night' ? (
                          <Moon className="h-3 w-3" />
                        ) : fish.timeOfDay === 'Day' ? (
                          <Sun className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {t.times[fish.timeOfDay] ?? fish.timeOfDay}
                      </span>
                    </div>

                    <dl className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Fish className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <div>
                          <dt className="text-xs text-slate-400">{t.baitLabel}</dt>
                          <dd className="font-medium text-slate-200">
                            {fish.baits.map(translateBait).join(' / ')}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                        <div>
                          <dt className="text-xs text-slate-400">{t.locationLabel}</dt>
                          <dd className="font-medium text-slate-200">
                            {fish.locations.map(translateLocation).join(', ')}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Compass className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                        <div>
                          <dt className="text-xs text-slate-400">{t.habitatLabel}</dt>
                          <dd className="text-slate-300">{translateHabitat(fish.habitat)}</dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                        <div>
                          <dt className="text-xs text-slate-400">{t.lineLabel}</dt>
                          <dd className="text-slate-300">
                            {translateLineReq(fish.lineRequirement)}
                          </dd>
                        </div>
                      </div>

                      {(fish.sellPrice || (fish.recycling && fish.recycling.length > 0)) && (
                        <div className="flex items-start gap-2">
                          <Coins className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                          <div className="space-y-0.5">
                            {fish.sellPrice && (
                              <div>
                                <dt className="inline text-xs text-slate-400">
                                  {t.sellPriceLabel}:{' '}
                                </dt>
                                <dd className="inline text-xs font-medium text-slate-200">
                                  {fish.sellPrice}
                                </dd>
                              </div>
                            )}
                            {fish.recycling && fish.recycling.length > 0 && (
                              <div className="flex items-start gap-1">
                                <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <dd className="text-xs text-slate-300">
                                  {fish.recycling
                                    .map((r) => `${r.qty}x ${translateRecyclingItem(r.item)}`)
                                    .join(', ')}
                                </dd>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div>
                          <dt className="text-xs text-slate-400">{t.contractLabel}</dt>
                          <dd className="text-slate-300">{fish.contractUse[lang]}</dd>
                        </div>
                      </div>
                    </dl>

                    <p className="mt-3 rounded-lg bg-slate-950/60 p-2.5 text-xs leading-relaxed text-slate-400">
                      {fish.notes[lang]}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCaught(fish.id)}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      isCaught
                        ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                        : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300'
                    }`}
                  >
                    <Check className={`h-4 w-4 ${isCaught ? 'opacity-100' : 'opacity-40'}`} />
                    {isCaught ? t.caughtBtn : t.markCaughtBtn}
                  </button>
                </article>
              );
            })}
          </main>
        )}

        <footer className="mt-10 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-500">
          {t.footerNote}
        </footer>
      </div>
    </div>
  );
}
