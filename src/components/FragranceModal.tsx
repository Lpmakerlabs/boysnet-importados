import { useEffect, useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FragranceItem,
  MAX_QTY_PER_ITEM,
  WHOLESALE_INSTRUCTIONS,
} from '@/src/data/catalog';

interface FragranceModalProps {
  item: FragranceItem | null;
  currentQuantity: number;
  onClose: () => void;
  onSetQuantity: (id: string, qty: number) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FragranceModal({
  item,
  currentQuantity,
  onClose,
  onSetQuantity,
}: FragranceModalProps) {
  const [draftQty, setDraftQty] = useState<number>(1);
  const [draftInput, setDraftInput] = useState<string>('1');
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const commitDraftQty = (next: number) => {
    const clamped = Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.trunc(next)));
    setDraftQty(clamped);
    setDraftInput(String(clamped));
  };

  useEffect(() => {
    if (item) {
      const initial = Math.min(
        MAX_QTY_PER_ITEM,
        Math.max(1, currentQuantity > 0 ? Math.trunc(currentQuantity) : 1)
      );
      setDraftQty(initial);
      setDraftInput(String(initial));
      setPhotoError(false);
      setLogoError(false);
    }
  }, [item, currentQuantity]);

  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  const handleConfirm = () => {
    if (!item) return;
    const parsed = parseInt(draftInput, 10);
    const finalQty = Number.isFinite(parsed) && parsed >= 1
      ? Math.min(MAX_QTY_PER_ITEM, Math.trunc(parsed))
      : draftQty;
    onSetQuantity(item.id, finalQty);
    onClose();
  };

  const canShowPhoto = Boolean(item?.productPhoto && !photoError);
  const canShowLogo = Boolean(!canShowPhoto && item?.brandLogo && !logoError);
  const displayImg = item
    ? canShowPhoto
      ? item.productPhoto
      : canShowLogo
      ? item.brandLogo
      : null
    : null;
  const isProductPhoto = canShowPhoto;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="fragrance-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-fragrance-title"
        >
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="relative grid max-h-[90dvh] w-full max-w-2xl grid-cols-1 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-[#171923] transition-colors hover:border-[#E6005A] cursor-pointer"
              aria-label="Cerrar detalle"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-center justify-center border-b border-neutral-100 bg-[#FCE8F0]/35 p-8 md:col-span-5 md:border-b-0 md:border-r">
              {displayImg ? (
                <img
                  src={displayImg}
                  alt={isProductPhoto ? item.name : `Logo ${item.brand}`}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (canShowPhoto) setPhotoError(true);
                    else setLogoError(true);
                  }}
                  className={
                    isProductPhoto
                      ? 'max-h-60 w-auto object-contain'
                      : 'max-h-28 w-auto max-w-[85%] object-contain'
                  }
                />
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center text-center">
                  <span className="font-display text-2xl font-semibold text-[#80002F]">
                    {item.brand}
                  </span>
                  <span className="mt-1 text-xs text-[#171923]/65">{item.line}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between p-6 md:col-span-7 md:p-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#171923]/65">
                  <span className="font-semibold text-[#80002F]">{item.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.line}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Pág. {item.page}</span>
                </div>

                <h2
                  id="modal-fragrance-title"
                  className="mt-2 font-display text-xl font-bold text-[#171923] sm:text-2xl"
                >
                  {item.name}
                </h2>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-[#80002F]">Concentración</dt>
                    <dd className="mt-0.5 font-medium text-[#171923]">
                      {item.concentration ?? 'Según presentación'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-[#80002F]">Contenido</dt>
                    <dd className="mt-0.5 font-mono font-medium tabular-nums text-[#171923]">
                      {item.volume ?? 'Ver descripción'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-[#80002F]">Formato</dt>
                    <dd className="mt-0.5 text-[#171923]">
                      {item.isKit ? 'Kit / Set' : item.isTester ? 'Caja Tester' : 'Presentación regular'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-[#80002F]">Foto del producto</dt>
                    <dd className="mt-0.5 text-xs text-[#171923]/80">
                      {isProductPhoto ? 'Incluida en lista PDF' : 'Solicitar foto por WhatsApp'}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 text-xs leading-relaxed text-[#171923]/70">
                  {WHOLESALE_INSTRUCTIONS.extraRequestNote}
                </p>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="block text-xs text-[#171923]/65">
                      Precio mayorista en dólares
                    </span>
                    {item.priceUsd !== null ? (
                      <span className="font-mono text-2xl font-semibold tabular-nums text-[#171923]">
                        ${item.priceUsd.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-[#171923]/60">USD</span>
                      </span>
                    ) : (
                      <span className="font-mono text-lg font-semibold text-[#80002F]">
                        Consultar precio
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[1, 3, 6, 12].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => commitDraftQty(preset)}
                        className={`h-8 rounded border px-2.5 font-mono text-xs tabular-nums transition-colors cursor-pointer ${
                          draftQty === preset
                            ? 'border-[#80002F] bg-[#80002F] text-white'
                            : 'border-neutral-200 bg-[#FCE8F0]/55 text-[#171923] hover:border-[#E6005A]'
                        }`}
                      >
                        {preset} u.
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="inline-flex h-11 items-center rounded-md border border-neutral-300 bg-white">
                    <button
                      type="button"
                      onClick={() => commitDraftQty(draftQty - 1)}
                      className="flex h-full w-10 items-center justify-center text-[#171923] hover:bg-[#FCE8F0] cursor-pointer"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_QTY_PER_ITEM}
                      value={draftInput}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setDraftInput('');
                          return;
                        }
                        const digits = raw.replace(/\D/g, '');
                        if (!digits) {
                          setDraftInput('');
                          return;
                        }
                        const parsed = parseInt(digits, 10);
                        const clamped = Math.min(MAX_QTY_PER_ITEM, Math.max(1, parsed));
                        setDraftQty(clamped);
                        setDraftInput(String(clamped));
                      }}
                      onBlur={() => commitDraftQty(draftQty)}
                      aria-label="Cantidad de unidades"
                      className="w-12 text-center font-mono text-sm font-semibold tabular-nums text-[#171923] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => commitDraftQty(draftQty + 1)}
                      className="flex h-full w-10 items-center justify-center text-[#171923] hover:bg-[#FCE8F0] cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    onClick={handleConfirm}
                    className="flex-1 h-11 rounded-md bg-[#80002F] px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#E6005A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80002F] whitespace-nowrap cursor-pointer"
                  >
                    {item.priceUsd !== null
                      ? currentQuantity > 0
                        ? `Actualizar (${draftQty} u. · $${(item.priceUsd * draftQty).toFixed(2)})`
                        : `Agregar al pedido · $${(item.priceUsd * draftQty).toFixed(2)}`
                      : `Agregar para consultar (${draftQty} u.)`}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
