import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FragranceItem } from '@/src/data/catalog';

interface CatalogCardProps {
  item: FragranceItem;
  index?: number;
  quantity: number;
  viewMode?: 'grid' | 'list';
  onAdd: (id: string) => void;
  onUpdateQuantity: (id: string, nextQty: number) => void;
  onSelect: (item: FragranceItem) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function CatalogCard({
  item,
  index = 0,
  quantity,
  viewMode = 'grid',
  onAdd,
  onUpdateQuantity,
  onSelect,
}: CatalogCardProps) {
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    setPhotoError(false);
    setLogoError(false);
  }, [item.id]);

  const canShowPhoto = Boolean(item.productPhoto && !photoError);
  const canShowLogo = Boolean(!canShowPhoto && item.brandLogo && !logoError);
  const displayImg = canShowPhoto
    ? item.productPhoto
    : canShowLogo
    ? item.brandLogo
    : null;
  const isProductPhoto = canShowPhoto;

  const metaParts = [
    item.brand,
    item.concentration,
    item.volume,
    item.isTester ? 'Tester' : null,
    item.isKit && !item.name.toUpperCase().includes('KIT') ? 'Kit' : null,
  ].filter(Boolean) as string[];

  const renderMediaContent = (isCompact = false) =>
    displayImg ? (
      <img
        src={displayImg}
        alt={isProductPhoto ? item.name : `Logo ${item.brand}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (canShowPhoto) setPhotoError(true);
          else setLogoError(true);
        }}
        className={
          isProductPhoto
            ? 'h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04]'
            : isCompact
            ? 'max-h-10 w-auto max-w-[80%] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04]'
            : 'max-h-14 w-auto max-w-[78%] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] sm:max-h-16'
        }
      />
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-[#FCE8F0]/45 px-2 text-center">
        <span
          className={`font-display font-semibold tracking-tight text-[#80002F] ${
            isCompact ? 'text-[11px] leading-tight line-clamp-2' : 'text-sm sm:text-base'
          }`}
        >
          {item.brand}
        </span>
        {!isCompact && (
          <span className="mt-1 text-[11px] text-[#171923]/65">
            {[item.concentration, item.volume].filter(Boolean).join(' · ') || item.line}
          </span>
        )}
      </div>
    );

  const renderMetaRow = () => (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[#80002F] font-medium">
      {metaParts.map((part, idx) => (
        <span key={`${part}-${idx}`} className="inline-flex items-center gap-1.5 truncate">
          {idx > 0 && (
            <span className="text-[#171923]/30" aria-hidden="true">
              ·
            </span>
          )}
          <span className={idx === 0 ? 'font-semibold truncate' : 'text-[#171923]/65'}>
            {part}
          </span>
        </span>
      ))}
    </div>
  );

  const renderPrice = () =>
    item.priceUsd !== null ? (
      <span className="font-mono text-sm sm:text-base font-semibold tabular-nums text-[#171923]">
        ${item.priceUsd.toFixed(2)}{' '}
        <span className="text-[11px] sm:text-xs font-normal text-[#171923]/60">USD</span>
      </span>
    ) : (
      <span className="font-mono text-xs sm:text-sm font-semibold text-[#80002F]">
        Consultar
      </span>
    );

  const renderActionControl = (isFullWidthMobile = true) => (
    <AnimatePresence mode="wait" initial={false}>
      {quantity <= 0 ? (
        <motion.button
          key="add-btn"
          type="button"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.12, ease: EASE_OUT_EXPO }}
          onClick={() => onAdd(item.id)}
          className={`inline-flex h-9 sm:h-10 ${
            isFullWidthMobile ? 'w-full sm:w-auto' : 'w-auto'
          } items-center justify-center gap-1.5 rounded-md bg-[#80002F] px-3 sm:px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#E6005A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80002F] whitespace-nowrap shrink-0 cursor-pointer`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{item.priceUsd !== null ? 'Agregar' : 'Consultar'}</span>
        </motion.button>
      ) : (
        <motion.div
          key="qty-stepper"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.12, ease: EASE_OUT_EXPO }}
          className={`inline-flex h-9 sm:h-10 ${
            isFullWidthMobile ? 'w-full sm:w-auto' : 'w-auto'
          } items-center justify-between rounded-md border border-[#80002F] bg-[#FCE8F0]/45`}
          aria-label={`Cantidad de ${item.name}`}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdateQuantity(item.id, quantity - 1)}
            className="flex h-full w-9 items-center justify-center text-[#171923] transition-colors hover:bg-[#FCE8F0] rounded-l-md cursor-pointer"
            aria-label={`Quitar una unidad de ${item.name}`}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
          <motion.span
            key={quantity}
            initial={!isFirstRender.current ? { scale: 1.2 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 0.14, ease: EASE_OUT_EXPO }}
            className="min-w-[2.25rem] text-center font-mono text-xs font-semibold tabular-nums text-[#80002F]"
          >
            {quantity}
          </motion.span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            className="flex h-full w-9 items-center justify-center text-[#171923] transition-colors hover:bg-[#FCE8F0] rounded-r-md cursor-pointer"
            aria-label={`Sumar una unidad de ${item.name}`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (viewMode === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.18,
          delay: Math.min(index % 36, 11) * 0.012,
          ease: EASE_OUT_EXPO,
        }}
        className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-[border-color,box-shadow] duration-150 hover:border-[#E6005A]/45 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-white p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6005A] cursor-pointer sm:h-24 sm:w-24"
            aria-label={`Ver detalle de ${item.name}`}
          >
            {renderMediaContent(true)}
          </button>

          <div className="min-w-0 flex-1">
            {renderMetaRow()}
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="mt-1 block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6005A] cursor-pointer"
            >
              <h3 className="font-display text-sm font-bold leading-snug text-[#171923] transition-colors duration-150 group-hover:text-[#E6005A] line-clamp-2 sm:text-base">
                {item.name}
              </h3>
            </button>
            <p className="mt-1 text-xs text-[#171923]/55">
              {item.line} · Pág. {item.page}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-2.5 sm:shrink-0 sm:flex-col sm:items-end sm:justify-between sm:gap-2 sm:border-t-0 sm:pt-0">
          {renderPrice()}
          {renderActionControl(false)}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: Math.min(index % 36, 11) * 0.014,
        ease: EASE_OUT_EXPO,
      }}
      className="group flex flex-col justify-between rounded-lg border border-neutral-200 bg-white transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-[#E6005A]/45 hover:shadow-sm"
    >
      <div>
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-t-lg border-b border-neutral-100 bg-white p-4 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6005A] cursor-pointer"
          aria-label={`Ver detalle de ${item.name}`}
        >
          {renderMediaContent(false)}
        </button>

        <div className="p-3 pb-2.5 sm:p-5 sm:pb-4">
          {renderMetaRow()}

          <button
            type="button"
            onClick={() => onSelect(item)}
            className="mt-1.5 sm:mt-2 block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6005A] cursor-pointer"
          >
            <h3 className="font-display text-xs sm:text-[15px] font-bold leading-snug text-[#171923] transition-colors duration-150 group-hover:text-[#E6005A] line-clamp-2 sm:line-clamp-3">
              {item.name}
            </h3>
          </button>

          <p className="mt-1.5 hidden sm:block text-xs text-[#171923]/55">
            {item.line} · Pág. {item.page}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2.5 border-t border-neutral-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
        <div>
          <span className="hidden sm:block text-[11px] font-medium text-[#171923]/60">
            Precio USD
          </span>
          {renderPrice()}
        </div>

        {renderActionControl(true)}
      </div>
    </motion.article>
  );
}
