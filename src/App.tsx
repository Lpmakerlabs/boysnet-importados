import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  LayoutList,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  BrandOption,
  CATALOG_ITEMS,
  FRAGRANCE_LINES,
  FragranceItem,
  FragranceLine,
  MAX_QTY_PER_ITEM,
  normalizeSearchText,
  parseStoredOrder,
} from '@/src/data/catalog';
import { Navbar } from '@/src/components/Navbar';
import { CatalogIntro } from '@/src/components/CatalogIntro';
import { CatalogCard } from '@/src/components/CatalogCard';
import { FragranceModal } from '@/src/components/FragranceModal';
import { OrderDrawer } from '@/src/components/OrderDrawer';
import { WholesaleFooter } from '@/src/components/WholesaleFooter';

type SortOption = 'pdf-order' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'pdf-order', label: 'Orden del catálogo' },
  { value: 'price-asc', label: 'Menor precio USD' },
  { value: 'price-desc', label: 'Mayor precio USD' },
  { value: 'name-asc', label: 'Alfabético A–Z' },
];

const CATEGORY_ONLY_LINES = FRAGRANCE_LINES.filter(
  (line): line is FragranceLine => line !== 'Todas'
);

function CategoryCardIcon({ category }: { category: 'Todas' | FragranceLine }) {
  const svgProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-6 w-6 shrink-0',
    'aria-hidden': true,
  };

  switch (category) {
    case 'Todas':
      return (
        <svg {...svgProps}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
        </svg>
      );
    case 'Árabes':
      return (
        <svg {...svgProps}>
          <path d="M9.5 4.5a2.5 2.5 0 0 1 5 0v2h-5v-2Z" />
          <path d="M8.5 6.5h7" />
          <path d="M7.5 10.5c0-1.9 1.6-3.5 3.5-3.5h2c1.9 0 3.5 1.6 3.5 3.5v8.2a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-8.2Z" />
          <path d="M12 11.5v5" />
          <path d="M9.8 14h4.4" />
        </svg>
      );
    case 'Diseñador & Varios':
      return (
        <svg {...svgProps}>
          <rect x="9.5" y="3.5" width="5" height="3.2" rx="0.8" />
          <path d="M10.5 6.7h3v2.3h-3z" />
          <rect x="6" y="9" width="12" height="11.5" rx="2.5" />
          <circle cx="12" cy="14.8" r="1.5" />
        </svg>
      );
    case 'Nicho':
      return (
        <svg {...svgProps}>
          <rect x="9.5" y="3" width="5" height="3" rx="0.8" />
          <path d="M10.5 6h3v2h-3z" />
          <polygon points="8,8 16,8 19,12.5 17.2,20.5 6.8,20.5 5,12.5" />
          <path d="M9.5 13.5h5" />
        </svg>
      );
    case 'K-Beauty':
      return (
        <svg {...svgProps}>
          <path d="M19.5 4.5c-7.5.4-13.2 4.9-13.2 11.3 0 2 .9 3.7 2.4 4.2 6.4 0 10.9-5.7 10.8-15.5Z" />
          <path d="M5 20.5c2.8-3.8 6.4-7 10.8-9.8" />
        </svg>
      );
    case 'Vaseline & Cuidado':
      return (
        <svg {...svgProps}>
          <path d="M9.5 3.5h5.5" />
          <path d="M12 3.5v3" />
          <rect x="9.5" y="6.5" width="5" height="2.5" rx="0.6" />
          <path d="M7.5 11.5A2.5 2.5 0 0 1 10 9h4a2.5 2.5 0 0 1 2.5 2.5V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-7.5Z" />
          <path d="M9.5 14h5" />
        </svg>
      );
    case 'Decantadores':
      return (
        <svg {...svgProps}>
          <path d="M10 4h4v3h-4z" />
          <path d="M12 5.2h2" />
          <rect x="8.5" y="7" width="7" height="13.5" rx="2" />
          <path d="M8.5 12h7" />
        </svg>
      );
  }
}

const STORAGE_KEY = 'boysnet_wholesale_order_v2';
const PAGE_SIZE = 24;
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface FilterCheckboxRowProps {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}

function FilterCheckboxRow({
  label,
  count,
  checked,
  onToggle,
}: FilterCheckboxRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="group flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-neutral-50 cursor-pointer"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
          checked
            ? 'border-[#E6005A] bg-[#E6005A] text-white'
            : 'border-neutral-300 bg-white group-hover:border-neutral-400'
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="h-3 w-3" strokeWidth={2.8} />}
      </span>
      <span className="min-w-0 truncate text-[13px] font-medium text-[#171923]">
        {label}{' '}
        <span className="font-normal text-neutral-400 tabular-nums">
          ({count.toLocaleString('es-AR')})
        </span>
      </span>
    </button>
  );
}

export default function App() {
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [activeLines, setActiveLines] = useState<FragranceLine[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pdf-order');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState<FragranceItem | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>(() => {
    try {
      return parseStoredOrder(localStorage.getItem(STORAGE_KEY));
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderQuantities));
    } catch {
      // Ignore storage errors in private sandboxes
    }
  }, [orderQuantities]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeBrands, activeLines, searchQuery, sortBy]);

  useEffect(() => {
    if (!isSortOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  const lineCounts = useMemo(() => {
    const counts: Record<FragranceLine, number> = {
      Árabes: 0,
      'Diseñador & Varios': 0,
      Nicho: 0,
      'K-Beauty': 0,
      'Vaseline & Cuidado': 0,
      Decantadores: 0,
    };
    for (const item of CATALOG_ITEMS) {
      counts[item.line] += 1;
    }
    return counts;
  }, []);

  const sortedBrandOptions = useMemo<BrandOption[]>(() => {
    const lineSet = activeLines.length > 0 ? new Set(activeLines) : null;
    const map = new Map<string, { count: number; logo: string | null }>();
    for (const item of CATALOG_ITEMS) {
      if (lineSet && !lineSet.has(item.line)) continue;
      const existing = map.get(item.brand);
      if (existing) {
        existing.count += 1;
        if (!existing.logo && item.brandLogo) existing.logo = item.brandLogo;
      } else {
        map.set(item.brand, { count: 1, logo: item.brandLogo });
      }
    }
    return Array.from(map.entries())
      .map(([brand, info]) => ({ brand, count: info.count, logo: info.logo }))
      .sort((a, b) => b.count - a.count);
  }, [activeLines]);

  const visibleBrandDirectory = useMemo(() => {
    const q = normalizeSearchText(brandSearch);
    if (q) {
      return sortedBrandOptions.filter((opt) => normalizeSearchText(opt.brand).includes(q));
    }
    if (showAllBrands) {
      return sortedBrandOptions;
    }
    const topSix = sortedBrandOptions.slice(0, 6);
    const topSet = new Set(topSix.map((opt) => opt.brand));
    const extraSelected = sortedBrandOptions.filter(
      (opt) => activeBrands.includes(opt.brand) && !topSet.has(opt.brand)
    );
    return [...topSix, ...extraSelected];
  }, [sortedBrandOptions, brandSearch, showAllBrands, activeBrands]);

  const filteredItems = useMemo(() => {
    const queryTokens = normalizeSearchText(searchQuery).split(' ').filter(Boolean);
    const brandSet = activeBrands.length > 0 ? new Set(activeBrands) : null;
    const lineSet = activeLines.length > 0 ? new Set(activeLines) : null;

    const matches = CATALOG_ITEMS.filter((item) => {
      if (lineSet && !lineSet.has(item.line)) return false;
      if (brandSet && !brandSet.has(item.brand)) return false;
      if (queryTokens.length === 0) return true;

      const haystack = normalizeSearchText(
        `${item.brand} ${item.name} ${item.line} ${item.volume ?? ''} ${item.concentration ?? ''}`
      );
      return queryTokens.every((token) => haystack.includes(token));
    });

    if (sortBy === 'pdf-order') return matches;

    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': {
          const pa = a.priceUsd ?? Number.POSITIVE_INFINITY;
          const pb = b.priceUsd ?? Number.POSITIVE_INFINITY;
          if (pa === pb) return 0;
          return pa - pb;
        }
        case 'price-desc': {
          const pa = a.priceUsd ?? -1;
          const pb = b.priceUsd ?? -1;
          if (pa === pb) return 0;
          return pb - pa;
        }
        case 'name-asc':
          return a.name.localeCompare(b.name, 'es');
        default:
          return 0;
      }
    });
  }, [activeBrands, activeLines, searchQuery, sortBy]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const orderItems = useMemo(() => {
    return CATALOG_ITEMS.flatMap((item) => {
      const quantity = orderQuantities[item.id] ?? 0;
      return quantity > 0 ? [{ item, quantity }] : [];
    });
  }, [orderQuantities]);

  const totalUnits = useMemo(
    () => orderItems.reduce((sum, entry) => sum + entry.quantity, 0),
    [orderItems]
  );

  const totalAmount = useMemo(
    () =>
      orderItems.reduce(
        (sum, entry) =>
          entry.item.priceUsd !== null ? sum + entry.item.priceUsd * entry.quantity : sum,
        0
      ),
    [orderItems]
  );

  const hasConsultOnly = useMemo(
    () => totalAmount === 0 && orderItems.some((entry) => entry.item.priceUsd === null),
    [totalAmount, orderItems]
  );

  const handleToggleBrand = (brand: string) => {
    setActiveBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const pruneBrandsForLines = (nextLines: FragranceLine[]) => {
    if (nextLines.length === 0) return;
    const lineSet = new Set(nextLines);
    const validBrands = new Set(
      CATALOG_ITEMS.filter((i) => lineSet.has(i.line)).map((i) => i.brand)
    );
    setActiveBrands((prev) => prev.filter((b) => validBrands.has(b)));
  };

  const handleSelectTopCard = (nextLine: 'Todas' | FragranceLine) => {
    if (nextLine === 'Todas') {
      setActiveLines([]);
      return;
    }
    const nextLines =
      activeLines.length === 1 && activeLines[0] === nextLine ? [] : [nextLine];
    setActiveLines(nextLines);
    pruneBrandsForLines(nextLines);
  };

  const handleToggleCategoryCheckbox = (line: FragranceLine) => {
    setActiveLines((prev) => {
      const next = prev.includes(line)
        ? prev.filter((l) => l !== line)
        : [...prev, line];
      pruneBrandsForLines(next);
      return next;
    });
  };

  const handleAdd = (id: string) => {
    setOrderQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.trunc(current) + 1));
      return {
        ...prev,
        [id]: next,
      };
    });
  };

  const handleSetQuantity = (id: string, nextQty: number) => {
    if (!Number.isFinite(nextQty)) return;
    const normalized = Math.trunc(nextQty);
    setOrderQuantities((prev) => {
      if (normalized <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: Math.min(MAX_QTY_PER_ITEM, normalized),
      };
    });
  };

  const handleRemoveItem = (id: string) => {
    setOrderQuantities((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleClearOrder = () => {
    setOrderQuantities({});
  };

  const handleResetFilters = () => {
    setActiveBrands([]);
    setActiveLines([]);
    setSearchQuery('');
    setBrandSearch('');
    setSortBy('pdf-order');
  };

  const hasActiveFilters =
    activeBrands.length > 0 || activeLines.length > 0 || searchQuery.trim() !== '';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-[#171923]">
        <Navbar totalUnits={totalUnits} onOpenOrder={() => setIsOrderOpen(true)} />

        <main>
          <CatalogIntro totalReferences={CATALOG_ITEMS.length} />

          <section id="catalogo" className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:py-9">
            {/* Part 1: Category icon cards */}
            <div
              role="group"
              aria-label="Categorías del catálogo"
              className="no-scrollbar flex items-stretch gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible"
            >
              {FRAGRANCE_LINES.map((line) => {
                const isActive =
                  line === 'Todas'
                    ? activeLines.length === 0
                    : activeLines.includes(line);
                const label = line === 'Todas' ? 'Todos' : line;

                return (
                  <button
                    key={line}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSelectTopCard(line)}
                    className={`flex min-w-[122px] lg:min-w-0 flex-col items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-center transition-colors duration-150 cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#FDEBF1] text-[#E6005A] ring-1 ring-[#F7C4D7]'
                        : 'bg-[#F4F5F7] text-[#171923] hover:bg-[#EAECEF]'
                    }`}
                  >
                    <CategoryCardIcon category={line} />
                    <span className="font-display text-xs sm:text-[13px] font-bold leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Part 2: Catalog header bar (Title + Search + Sort + Grid/List toggle) */}
            <div className="mt-7 flex flex-col gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#171923]">
                  Catálogo de Productos
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                  Más de 2.200 productos importados
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 sm:flex-initial">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    maxLength={120}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto..."
                    aria-label="Buscar producto"
                    className="h-10 w-full sm:w-64 md:w-72 rounded-xl border border-neutral-200 bg-white pl-9 pr-8 text-xs sm:text-sm text-[#171923] placeholder:text-neutral-400 transition-colors focus:border-[#E6005A] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#171923] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div ref={sortRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isSortOpen}
                    aria-label="Ordenar catálogo"
                    className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isSortOpen
                        ? 'border-[#E6005A] bg-white text-[#171923]'
                        : 'border-neutral-200 bg-white text-[#171923] hover:border-neutral-300'
                    }`}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                    <span>
                      {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ${
                        isSortOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.ul
                        role="listbox"
                        aria-label="Opciones de orden"
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.14, ease: EASE_OUT_EXPO }}
                        className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
                      >
                        {SORT_OPTIONS.map((opt) => {
                          const selected = opt.value === sortBy;
                          return (
                            <li key={opt.value} role="option" aria-selected={selected}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSortBy(opt.value);
                                  setIsSortOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                                  selected
                                    ? 'bg-[#FCE8F0]/70 font-semibold text-[#80002F]'
                                    : 'font-medium text-[#171923] hover:bg-neutral-50'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {selected && (
                                  <Check className="h-3.5 w-3.5 text-[#80002F]" aria-hidden="true" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                  aria-expanded={isMobileFiltersOpen}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors cursor-pointer lg:hidden ${
                    isMobileFiltersOpen || activeLines.length > 0 || activeBrands.length > 0
                      ? 'border-[#E6005A]/40 bg-[#FDEBF1] text-[#E6005A]'
                      : 'border-neutral-200 bg-white text-[#171923] hover:border-neutral-300'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Filtros</span>
                  {(activeLines.length > 0 || activeBrands.length > 0) && (
                    <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E6005A] px-1 font-mono text-[10px] text-white">
                      {activeLines.length + activeBrands.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5" role="group" aria-label="Modo de vista">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                    aria-label="Vista en cuadrícula"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#E6005A] text-white shadow-xs'
                        : 'bg-[#F4F5F7] text-[#171923] hover:bg-[#EAECEF]'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    aria-label="Vista en lista"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[#E6005A] text-white shadow-xs'
                        : 'bg-[#F4F5F7] text-[#171923] hover:bg-[#EAECEF]'
                    }`}
                  >
                    <LayoutList className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Part 3: Left Filter Sidebar + Right Product Grid */}
            <div
              id="marcas"
              className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-7"
            >
              <aside
                aria-label="Filtros del catálogo"
                className={`${isMobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-20`}
              >
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-[#171923]">
                      Filtrar catálogo
                    </h3>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs font-semibold text-[#E6005A] transition-colors hover:text-[#80002F] cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Category filter */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen((prev) => !prev)}
                      aria-expanded={isCategoryOpen}
                      className="flex w-full items-center justify-between py-1 text-left cursor-pointer"
                    >
                      <span className="font-display text-[13px] font-bold text-[#171923]">
                        Categoría
                      </span>
                      {isCategoryOpen ? (
                        <ChevronUp className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                      )}
                    </button>

                    {isCategoryOpen && (
                      <div className="mt-2.5 space-y-1">
                        {CATEGORY_ONLY_LINES.map((line) => (
                          <FilterCheckboxRow
                            key={line}
                            label={line}
                            count={lineCounts[line]}
                            checked={activeLines.includes(line)}
                            onToggle={() => handleToggleCategoryCheckbox(line)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="my-4 border-t border-neutral-100" />

                  {/* Brand filter */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsBrandOpen((prev) => !prev)}
                      aria-expanded={isBrandOpen}
                      className="flex w-full items-center justify-between py-1 text-left cursor-pointer"
                    >
                      <span className="font-display text-[13px] font-bold text-[#171923]">
                        Marca
                      </span>
                      {isBrandOpen ? (
                        <ChevronUp className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                      )}
                    </button>

                    {isBrandOpen && (
                      <div className="mt-3">
                        <div className="relative">
                          <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                            aria-hidden="true"
                          />
                          <input
                            type="search"
                            maxLength={120}
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            placeholder="Buscar marca..."
                            aria-label="Buscar marca"
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-7 text-xs text-[#171923] placeholder:text-neutral-400 transition-colors focus:border-[#E6005A] focus:outline-none"
                          />
                          {brandSearch && (
                            <button
                              type="button"
                              onClick={() => setBrandSearch('')}
                              aria-label="Limpiar búsqueda de marcas"
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#171923] cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        {visibleBrandDirectory.length === 0 ? (
                          <p className="py-3 text-center text-xs text-neutral-400">
                            No hay marcas que coincidan.
                          </p>
                        ) : (
                          <div
                            className={`mt-3 space-y-1 ${
                              showAllBrands || brandSearch.trim() !== ''
                                ? 'max-h-64 overflow-y-auto pr-1'
                                : ''
                            }`}
                          >
                            {visibleBrandDirectory.map((opt) => (
                              <FilterCheckboxRow
                                key={opt.brand}
                                label={opt.brand}
                                count={opt.count}
                                checked={activeBrands.includes(opt.brand)}
                                onToggle={() => handleToggleBrand(opt.brand)}
                              />
                            ))}
                          </div>
                        )}

                        {brandSearch.trim() === '' && sortedBrandOptions.length > 6 && (
                          <button
                            type="button"
                            onClick={() => setShowAllBrands((prev) => !prev)}
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#E6005A] transition-colors hover:text-[#80002F] cursor-pointer"
                          >
                            <span>
                              {showAllBrands
                                ? 'Ver menos marcas'
                                : 'Ver más marcas'}
                            </span>
                            {showAllBrands ? (
                              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                  <p className="tabular-nums">
                    Mostrando{' '}
                    <span className="font-semibold text-[#171923]">{visibleItems.length}</span> de{' '}
                    <span className="font-semibold text-[#171923]">
                      {filteredItems.length.toLocaleString('es-AR')}
                    </span>{' '}
                    resultados
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="font-medium text-[#80002F] underline decoration-[#80002F]/30 underline-offset-4 hover:text-[#E6005A] cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>

                {filteredItems.length === 0 ? (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 px-6 py-14 text-center">
                    <p className="text-base font-semibold text-[#171923]">
                      No encontramos productos con ese filtro
                    </p>
                    <p className="mt-1.5 text-sm text-neutral-500">
                      Probá eligiendo otra categoría o marca, o limpiá los filtros activos.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-5 rounded-full bg-[#80002F] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#E6005A] cursor-pointer"
                    >
                      Ver todo el catálogo
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-2 gap-3.5 sm:gap-5 xl:grid-cols-3'
                          : 'flex flex-col gap-3'
                      }
                    >
                      {visibleItems.map((item, idx) => (
                        <CatalogCard
                          key={item.id}
                          item={item}
                          index={idx}
                          quantity={orderQuantities[item.id] ?? 0}
                          viewMode={viewMode}
                          onAdd={handleAdd}
                          onUpdateQuantity={handleSetQuantity}
                          onSelect={setSelectedItem}
                        />
                      ))}
                    </div>

                    {visibleCount < filteredItems.length && (
                      <div className="mt-10 flex flex-col items-center gap-3">
                        <p className="text-xs tabular-nums text-[#171923]/65">
                          Viendo {visibleItems.length} de{' '}
                          {filteredItems.length.toLocaleString('es-AR')} productos
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleCount((prev) =>
                              Math.min(prev + PAGE_SIZE, filteredItems.length)
                            )
                          }
                          className="inline-flex h-11 items-center justify-center rounded-md bg-[#80002F] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#E6005A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80002F] cursor-pointer"
                        >
                          Cargar {Math.min(PAGE_SIZE, filteredItems.length - visibleCount)}{' '}
                          {Math.min(PAGE_SIZE, filteredItems.length - visibleCount) === 1
                            ? 'producto'
                            : 'productos'}{' '}
                          más
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </main>

        <WholesaleFooter />

        <AnimatePresence>
          {totalUnits > 0 && !isOrderOpen && (
            <motion.div
              key="mobile-order-bar"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
              className="fixed bottom-4 left-4 right-4 z-30 md:hidden"
            >
              <button
                type="button"
                onClick={() => setIsOrderOpen(true)}
                className="flex h-12 w-full items-center justify-between rounded-md border border-[#80002F]/35 bg-[#E6005A] px-4 text-sm font-semibold text-white shadow-lg cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[#FCE8F0]" aria-hidden="true" />
                  <span>Ver pedido ({totalUnits} u.)</span>
                </span>
                <span className="rounded bg-[#80002F] px-2 py-0.5 font-mono text-xs tabular-nums text-white">
                  {hasConsultOnly ? 'A consultar' : `$${totalAmount.toFixed(2)} USD`}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <FragranceModal
          item={selectedItem}
          currentQuantity={selectedItem ? orderQuantities[selectedItem.id] ?? 0 : 0}
          onClose={() => setSelectedItem(null)}
          onSetQuantity={handleSetQuantity}
        />

        <OrderDrawer
          isOpen={isOrderOpen}
          items={orderItems}
          onClose={() => setIsOrderOpen(false)}
          onUpdateQuantity={handleSetQuantity}
          onRemoveItem={handleRemoveItem}
          onClearOrder={handleClearOrder}
        />
      </div>
    </MotionConfig>
  );
}
