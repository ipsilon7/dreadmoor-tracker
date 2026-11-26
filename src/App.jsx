import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Compass,
  Download,
  ExternalLink,
  Fish,
  HelpCircle,
  Languages,
  LayoutGrid,
  Map,
  MapPin,
  Moon,
  Package,
  RotateCcw,
  ScrollText,
  Search,
  Sparkles,
  Sun,
  Table,
  Upload,
  Wrench,
  X,
} from 'lucide-react';
import fishData from './data/fish.json';
import baitsData from './data/baits.json';
import zonesData from './data/zones.json';
import faqData from './data/faq.json';
import { TRANSLATIONS } from './i18n/translations';

const CAUGHT_STORAGE_KEY = 'dreadmoor_caught_v1';
const LANG_STORAGE_KEY = 'dreadmoor_lang_v1';
const SPOILER_STORAGE_KEY = 'dreadmoor_spoiler_accepted_v1';
const VIEW_STORAGE_KEY = 'dreadmoor_view_v1';

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

function loadSpoilerAccepted() {
  try {
    return localStorage.getItem(SPOILER_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadInitialView() {
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === 'grid' || saved === 'table') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'grid';
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
  const [activeTab, setActiveTab] = useState('tracker');
  const [faqFilter, setFaqFilter] = useState('all');
  const [viewMode, setViewMode] = useState(loadInitialView);
  const [spoilerAccepted, setSpoilerAccepted] = useState(loadSpoilerAccepted);
  const [caughtIds, setCaughtIds] = useState(loadCaughtIds);
  const [search, setSearch] = useState('');
  const [selectedBait, setSelectedBait] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedLineReq, setSelectedLineReq] = useState('');
  const [onlyUncaught, setOnlyUncaught] = useState(false);
  const [showBaitGuide, setShowBaitGuide] = useState(false);
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
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {
      // Ignore storage errors
    }
  }, [viewMode]);

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
      if (query) {
        const searchable = [
          fish.name,
          fish.contractUse?.[lang],
          fish.contractUse?.en,
          fish.notes?.[lang],
          fish.habitat,
          t.habitats?.[fish.habitat],
          ...fish.locations.flatMap((loc) => [loc, t.locations?.[loc]]),
          ...fish.baits.flatMap((bait) => [bait, t.baits?.[bait]]),
          ...(fish.recycling ?? []).flatMap((r) => [r.item, t.recyclingItems?.[r.item]]),
        ];
        const matchesQuery = searchable.some(
          (text) => typeof text === 'string' && text.toLowerCase().includes(query),
        );
        if (!matchesQuery) return false;
      }
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
    lang,
    t,
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

  function handleAcceptSpoilers() {
    setSpoilerAccepted(true);
    try {
      localStorage.setItem(SPOILER_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }

  function handleLeaveSite() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://store.steampowered.com/';
    }
  }

  function handleFilterFromZone(queryText) {
    clearFilters();
    setSearch(queryText);
    setActiveTab('tracker');
  }

  function handleReset() {
    if (window.confirm(t.resetConfirm)) {
      setCaughtIds([]);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#060b14] text-slate-100">
      {!spoilerAccepted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="spoiler-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060b14]/75 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-black/60">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 id="spoiler-modal-title" className="text-lg font-bold text-slate-50">
                  {t.spoilerTitle}
                </h2>
              </div>

              <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
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
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                    lang === 'en'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-300">{t.spoilerDesc}</p>
            <p className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-400">
              {t.spoilerNote}
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleLeaveSite}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                {t.spoilerBackBtn}
              </button>
              <button
                type="button"
                onClick={handleAcceptSpoilers}
                className="rounded-xl border border-emerald-500/50 bg-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
              >
                {t.spoilerAcceptBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        aria-hidden={!spoilerAccepted}
        className={`mx-auto max-w-6xl px-4 py-6 transition duration-300 sm:px-6 lg:px-8 ${
          !spoilerAccepted ? 'pointer-events-none select-none blur-md' : ''
        }`}
      >
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

        {/* Tab Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'tracker'
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Fish className="h-4 w-4" />
            {t.tabTracker}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('zones')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'zones'
                ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Map className="h-4 w-4" />
            {t.tabZones}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'faq'
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            {t.tabFaq}
          </button>
        </nav>

        {activeTab === 'tracker' && (
          <>
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

        {/* Results Bar & View Switcher */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-400">
            {t.showingCount
              .replace('{count}', String(filteredFish.length))
              .replace('{total}', String(totalCount))}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBaitGuide((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                showBaitGuide
                  ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                  : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t.baitGuideBtn}
              {showBaitGuide ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/90 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                {t.viewGrid}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === 'table'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                {t.viewTable}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Quick Bait Reference */}
        {showBaitGuide && (
          <section className="mb-6 rounded-2xl border border-sky-500/25 bg-slate-900/75 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-100 sm:text-base">
                <BookOpen className="h-4 w-4 text-sky-400" />
                {t.baitGuideTitle}
              </h2>
              <button
                type="button"
                onClick={() => setShowBaitGuide(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {baitsData.map((bait) => {
                const isSelected = selectedBait === bait.id;
                const categoryStyle =
                  CATEGORY_STYLES[bait.category] ??
                  'border-slate-700 bg-slate-800 text-slate-300';

                return (
                  <div
                    key={bait.id}
                    className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                      isSelected
                        ? 'border-sky-500/50 bg-sky-950/25'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-100">{translateBait(bait.id)}</h3>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryStyle}`}
                        >
                          {t.categories[bait.category] ?? bait.category}
                        </span>
                      </div>

                      <dl className="space-y-1.5 text-xs">
                        <div>
                          <dt className="text-slate-400">{t.baitUnlockLabel}:</dt>
                          <dd className="font-medium text-slate-200">{bait.unlock[lang]}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">{t.baitRecipeLabel}:</dt>
                          <dd className="text-emerald-300/90">{bait.recipe[lang]}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                        {bait.tip[lang]}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBait((prev) => (prev === bait.id ? '' : bait.id))
                      }
                      className={`mt-3 w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? 'border-sky-500/60 bg-sky-500/20 text-sky-200'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-sky-500/40 hover:text-sky-300'
                      }`}
                    >
                      {t.baitFilterAction}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Fish Grid / Table */}
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
        ) : viewMode === 'table' ? (
          <main className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full min-w-[780px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">{t.colFish}</th>
                  <th className="px-3 py-3">{t.colType}</th>
                  <th className="px-3 py-3">{t.colTime}</th>
                  <th className="px-3 py-3">{t.colBait}</th>
                  <th className="px-3 py-3">{t.colLocation}</th>
                  <th className="px-3 py-3">{t.colGear}</th>
                  <th className="px-3 py-3">{t.colValue}</th>
                  <th className="px-4 py-3 text-right">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredFish.map((fish) => {
                  const isCaught = caughtSet.has(fish.id);
                  const categoryStyle =
                    CATEGORY_STYLES[fish.category] ??
                    'border-slate-700 bg-slate-800 text-slate-300';
                  const rarityStyle = RARITY_STYLES[fish.rarity] ?? RARITY_STYLES.Unknown;
                  const timeStyle = TIME_STYLES[fish.timeOfDay] ?? TIME_STYLES.Both;

                  return (
                    <tr
                      key={fish.id}
                      className={`transition ${
                        isCaught ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 p-1">
                            <FishThumbnail
                              src={fish.image}
                              name={fish.name}
                              pendingLabel=""
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{fish.name}</div>
                            {fish.isMutant && (
                              <span className="mt-0.5 inline-block rounded-full border border-fuchsia-500/40 bg-fuchsia-500/15 px-1.5 py-0.2 text-[10px] font-medium text-fuchsia-300">
                                {t.mutantBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${categoryStyle}`}
                          >
                            {t.categories[fish.category] ?? fish.category}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${rarityStyle}`}
                          >
                            {t.rarities[fish.rarity] ?? fish.rarity}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
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
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-200">
                        {fish.baits.map(translateBait).join(' / ')}
                      </td>

                      <td className="px-3 py-3 text-xs">
                        <div className="font-medium text-slate-200">
                          {fish.locations.map(translateLocation).join(', ')}
                        </div>
                        <div className="text-slate-400">{translateHabitat(fish.habitat)}</div>
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-300">
                        {translateLineReq(fish.lineRequirement)}
                      </td>

                      <td className="px-3 py-3 text-xs">
                        {fish.sellPrice && (
                          <div className="font-medium text-yellow-300/90">{fish.sellPrice}</div>
                        )}
                        {fish.recycling && fish.recycling.length > 0 && (
                          <div className="text-slate-400">
                            {fish.recycling
                              .map((r) => `${r.qty}x ${translateRecyclingItem(r.item)}`)
                              .join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleCaught(fish.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                            isCaught
                              ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                              : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300'
                          }`}
                        >
                          <Check className={`h-3.5 w-3.5 ${isCaught ? 'opacity-100' : 'opacity-40'}`} />
                          {isCaught ? t.caughtBtn : t.markCaughtBtn}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </main>
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
          </>
        )}

        {activeTab === 'zones' && (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-50">{t.zonesTitle}</h2>
                <p className="mt-1 text-sm text-slate-400">{t.zonesSubtitle}</p>
              </div>
              <a
                href="https://gamesomg.com/dreadmoor-map/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 px-4 py-2.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/25"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t.externalMapBtn}
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {zonesData.map((zone) => (
                <article
                  key={zone.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-100">{zone.name[lang]}</h3>
                      <span className="shrink-0 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
                        {t.zoneTags[zone.tag] ?? zone.tag}
                      </span>
                    </div>

                    <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                      <Compass className="h-3.5 w-3.5 shrink-0" />
                      {zone.direction[lang]}
                    </p>

                    <p className="text-xs leading-relaxed text-slate-300">
                      {zone.description[lang]}
                    </p>
                  </div>

                  {zone.searchFilter && (
                    <button
                      type="button"
                      onClick={() => handleFilterFromZone(zone.searchFilter)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-300"
                    >
                      <Fish className="h-3.5 w-3.5" />
                      {t.zoneFilterFishBtn}
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'faq' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-bold text-slate-50">{t.faqTitle}</h2>
              <p className="mt-1 text-sm text-slate-400">{t.faqSubtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {['all', 'items', 'softlocks', 'mechanics'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqFilter(cat)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      faqFilter === cat
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.faqCategories[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {faqData
                .filter((item) => faqFilter === 'all' || item.category === faqFilter)
                .map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100 sm:text-base">
                        {item.question[lang]}
                      </h3>
                      <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        {t.faqCategories[item.category]}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {item.answer[lang]}
                    </p>
                  </article>
                ))}
            </div>
          </section>
        )}

        <footer className="mt-10 space-y-1.5 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-500">
          <p>{t.footerNote}</p>
          <p className="text-[11px] text-slate-600">{t.footerDisclaimer}</p>
        </footer>
      </div>
    </div>
  );
}
