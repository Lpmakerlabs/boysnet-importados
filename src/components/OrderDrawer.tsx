import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Minus, Trash2, Copy, Check, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FIRST_ORDER_MIN_USD,
  FragranceItem,
  MAX_QTY_PER_ITEM,
  REPEAT_ORDER_MIN_USD,
  buildSafeWhatsAppOrderUrl,
  buildWhatsAppOrderText,
} from '@/src/data/catalog';

interface OrderDrawerProps {
  isOpen: boolean;
  items: Array<{ item: FragranceItem; quantity: number }>;
  onClose: () => void;
  onUpdateQuantity: (id: string, nextQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearOrder: () => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface OrderQuantityInputProps {
  value: number;
  ariaLabel: string;
  onCommit: (nextQty: number) => void;
}

function OrderQuantityInput({ value, ariaLabel, onCommit }: OrderQuantityInputProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const parsed = parseInt(text, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(MAX_QTY_PER_ITEM, Math.trunc(parsed));
    setText(String(clamped));
    if (clamped !== value) {
      onCommit(clamped);
    }
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={MAX_QTY_PER_ITEM}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') {
          setText('');
          return;
        }
        const digits = raw.replace(/\D/g, '');
        if (!digits) {
          setText('');
          return;
        }
        const parsed = parseInt(digits, 10);
        const clamped = Math.min(MAX_QTY_PER_ITEM, Math.max(1, parsed));
        setText(String(clamped));
        onCommit(clamped);
      }}
      onBlur={commit}
      aria-label={ariaLabel}
      className="w-11 text-center font-mono text-xs font-semibold tabular-nums text-[#171923] focus:outline-none"
    />
  );
}

export function OrderDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
}: OrderDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, true>>({});
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowPreview(false);
      return;
    }
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
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const totalUnits = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, entry) =>
          entry.item.priceUsd !== null ? sum + entry.item.priceUsd * entry.quantity : sum,
        0
      ),
    [items]
  );

  const consultCount = useMemo(
    () => items.filter((entry) => entry.item.priceUsd === null).length,
    [items]
  );

  const orderText = useMemo(() => buildWhatsAppOrderText(items), [items]);

  const { url: whatsappUrl, isTruncated } = useMemo(
    () => buildSafeWhatsAppOrderUrl(items),
    [items]
  );

  const markCopiedWithReset = () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    setCopied(true);
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimerRef.current = null;
    }, 2200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderText);
      markCopiedWithReset();
    } catch {
      setShowPreview(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="order-drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-drawer-title"
        >
          <motion.aside
            key="order-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
            className="flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C4004D] bg-[#E6005A] px-6 py-4 text-white">
              <div>
                <h2
                  id="order-drawer-title"
                  className="font-display text-xl font-semibold text-white"
                >
                  Lista de Pedido
                </h2>
                <p className="mt-0.5 text-xs text-white/85 tabular-nums">
                  {items.length} {items.length === 1 ? 'referencia' : 'referencias'} · {totalUnits}{' '}
                  {totalUnits === 1 ? 'unidad' : 'unidades'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
                aria-label="Cerrar lista de pedido"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-base font-semibold text-[#171923]">
                  Tu lista de pedido está vacía
                </p>
                <p className="mt-2 max-w-xs text-sm text-[#171923]/65">
                  Agregá productos desde el catálogo para calcular el total mayorista en USD (1ra
                  compra mínimo ${FIRST_ORDER_MIN_USD} USD · reposición desde $
                  {REPEAT_ORDER_MIN_USD} USD).
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-md bg-[#80002F] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#E6005A] cursor-pointer"
                >
                  Volver al catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul>
                    <AnimatePresence initial={false}>
                      {items.map(({ item, quantity }) => {
                        const thumb =
                          item.productPhoto && !failedSrcs[item.productPhoto]
                            ? item.productPhoto
                            : item.brandLogo && !failedSrcs[item.brandLogo]
                            ? item.brandLogo
                            : null;
                        return (
                          <motion.li
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              x: 20,
                              height: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              borderBottomWidth: 0,
                            }}
                            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                            className="flex gap-3.5 overflow-hidden border-b border-neutral-200 py-4 last:border-b-0"
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white p-1.5">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={item.name}
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={() =>
                                    setFailedSrcs((prev) => ({ ...prev, [thumb]: true }))
                                  }
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <span className="font-display text-[11px] font-semibold text-[#80002F] text-center leading-tight">
                                  {item.brand}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="truncate font-display text-sm font-bold text-[#171923]">
                                    {item.name}
                                  </h3>
                                  <p className="text-xs text-[#171923]/65">
                                    {item.brand} ·{' '}
                                    <span className="font-mono tabular-nums">
                                      {item.priceUsd !== null
                                        ? `$${item.priceUsd.toFixed(2)} USD`
                                        : 'A consultar'}
                                    </span>
                                  </p>
                                </div>
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onRemoveItem(item.id)}
                                  className="p-1 text-neutral-400 transition-colors hover:text-[#E6005A] cursor-pointer"
                                  aria-label={`Eliminar ${item.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </motion.button>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="inline-flex h-8 items-center rounded border border-neutral-300 bg-white">
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                                    className="flex h-full w-7 items-center justify-center text-[#171923] hover:bg-[#FCE8F0] cursor-pointer"
                                    aria-label={`Restar unidad a ${item.name}`}
                                  >
                                    <Minus className="h-3 w-3" aria-hidden="true" />
                                  </button>
                                  <OrderQuantityInput
                                    value={quantity}
                                    ariaLabel={`Unidades de ${item.name}`}
                                    onCommit={(nextQty) => onUpdateQuantity(item.id, nextQty)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                                    className="flex h-full w-7 items-center justify-center text-[#171923] hover:bg-[#FCE8F0] cursor-pointer"
                                    aria-label={`Sumar unidad a ${item.name}`}
                                  >
                                    <Plus className="h-3 w-3" aria-hidden="true" />
                                  </button>
                                </div>

                                <span className="font-mono text-sm font-semibold tabular-nums text-[#171923]">
                                  {item.priceUsd !== null
                                    ? `$${(item.priceUsd * quantity).toFixed(2)} USD`
                                    : 'Consultar'}
                                </span>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>

                  <div className="mt-4 border-t border-neutral-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPreview((prev) => !prev)}
                      className="text-xs font-medium text-[#80002F] underline decoration-[#E6005A]/40 underline-offset-4 hover:text-[#E6005A] cursor-pointer"
                    >
                      {showPreview
                        ? 'Ocultar vista previa de la lista'
                        : 'Ver vista previa para WhatsApp'}
                    </button>
                    <AnimatePresence>
                      {showPreview && (
                        <motion.pre
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.16 }}
                          className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-[#E6005A]/20 bg-[#FCE8F0] p-3 font-mono text-[11px] leading-relaxed text-[#171923]"
                        >
                          {orderText}
                        </motion.pre>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t border-neutral-200 bg-white px-6 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-[#171923]/75">
                      Total estimado
                    </span>
                    <span className="font-mono text-xl font-semibold tabular-nums text-[#171923]">
                      {totalAmount === 0 && consultCount > 0 ? (
                        <span className="text-base text-[#80002F]">A consultar</span>
                      ) : (
                        <>
                          ${totalAmount.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-[#171923]/60">USD</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] tabular-nums text-[#171923]/65">
                    {totalAmount < REPEAT_ORDER_MIN_USD
                      ? `Mínimo mayorista: $${FIRST_ORDER_MIN_USD} USD (1ra compra) · $${REPEAT_ORDER_MIN_USD} USD (siguientes).`
                      : totalAmount < FIRST_ORDER_MIN_USD
                      ? `Alcanza mínimo de reposición ($${REPEAT_ORDER_MIN_USD} USD). Primera compra mínimo $${FIRST_ORDER_MIN_USD} USD.`
                      : `Cumple mínimo primera compra ($${FIRST_ORDER_MIN_USD} USD).`}
                    {consultCount > 0 ? ` + ${consultCount} a consultar.` : ''}
                  </p>

                  {isTruncated && (
                    <p className="mt-1.5 rounded bg-[#FCE8F0]/75 px-2.5 py-1.5 text-[11px] leading-snug text-[#80002F]">
                      Lista extensa: al tocar WhatsApp copiamos la lista completa para que la
                      pegues directo en el chat.
                    </p>
                  )}

                  <div className="mt-3.5 flex flex-col gap-2.5">
                    <motion.a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (isTruncated) {
                          navigator.clipboard?.writeText(orderText).catch(() => {});
                          markCopiedWithReset();
                        }
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.1 }}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#80002F] px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#E6005A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80002F]"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      <span>Consultar lista por WhatsApp</span>
                    </motion.a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-xs font-semibold text-[#171923] transition-colors hover:border-[#E6005A] cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#E6005A]" aria-hidden="true" />
                            <span>Lista copiada</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Copiar lista</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={onClearOrder}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-200 px-3 text-xs font-medium text-[#171923]/70 transition-colors hover:border-[#80002F] hover:text-[#80002F] cursor-pointer"
                      >
                        Vaciar
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
