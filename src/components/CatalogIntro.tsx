import {
  BadgeDollarSign,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { WHOLESALE_PHONE_DISPLAY, buildWhatsAppUrl, resolveAssetPath } from '@/src/data/catalog';

interface CatalogIntroProps {
  totalReferences: number;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function CatalogIntro({ totalReferences }: CatalogIntroProps) {
  const whatsappConsultUrl = buildWhatsAppUrl(
    'Hola BoysNet, quiero hacer una consulta sobre el catálogo mayorista.'
  );

  return (
    <section id="top">
      <h1 className="sr-only">
        BoysNet Importados — Importadores de perfumería, skincare y cosméticos (
        {totalReferences.toLocaleString('es-AR')} productos)
      </h1>

      {/* Responsive brand banner (mobile & desktop artwork) */}
      <div className="border-b border-[#80002F]/30 bg-[#4A001E]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
          className="w-full"
        >
          <picture className="block w-full">
            <source
              media="(min-width: 768px)"
              srcSet={resolveAssetPath('/assets/banners/banner-desktop.webp')}
              type="image/webp"
              width={2172}
              height={724}
            />
            <img
              src={resolveAssetPath('/assets/banners/banner-mobile.webp')}
              alt="BoysNet Importados — Importadores de perfumería, skincare y cosméticos. Perfumes, Skincare, Cosméticos. Envíos a todo el país. Más de 30 años junto a vos."
              width={1086}
              height={1448}
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full object-cover select-none"
            />
          </picture>
        </motion.div>
      </div>

      {/* Rectangular Instagram (@casaboysnet) storefront & contact box below the banner */}
      <div className="border-b border-[#C4004D] bg-[#E6005A] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 sm:py-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: EASE_OUT_EXPO }}
            className="rounded-2xl border border-white/25 bg-[#99003B]/55 px-5 py-4 shadow-sm backdrop-blur-xs sm:px-6 sm:py-4.5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <div className="flex items-center gap-4 lg:shrink-0">
                <div className="h-15 w-15 shrink-0 overflow-hidden rounded-full border-2 border-white/90 bg-[#E6005A] shadow-xs sm:h-16 sm:w-16">
                  <img
                    src={resolveAssetPath('/assets/aistudio/Logo_BoysNet_con_sol_sonriente_4dd2d177.webp')}
                    alt="BoysNet Importados"
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full scale-110 object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
                      @casaboysnet
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#FCE8F0]">
                      30 años en el mercado
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#FCE8F0] sm:text-[13px]">
                    Perfumes · Skincare · Cosméticos
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-white/85">
                    360 mil seguidores · Encarnación, Paraguay
                  </p>
                </div>
              </div>

              <dl className="flex-1 space-y-2 border-t border-white/15 pt-3.5 text-xs text-white/95 sm:text-[13px] lg:border-t-0 lg:border-x lg:border-white/20 lg:px-7 lg:py-0.5">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-[#FCE8F0]" aria-hidden="true" />
                  <dd className="font-semibold text-white">
                    Avda. Internacional a 80 m de la Aduana Paraguaya, Encarnación
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-[#FCE8F0]" aria-hidden="true" />
                  <dd className="font-medium text-white/90">
                    Atención de 8 a 17 hs · Envíos a todo el país
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-2.5 border-t border-white/15 pt-3.5 lg:shrink-0 lg:border-t-0 lg:pt-0">
                <a
                  href={whatsappConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#80002F] shadow-xs transition-colors hover:bg-[#FCE8F0] sm:text-[13px]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span className="font-mono tabular-nums">{WHOLESALE_PHONE_DISPLAY}</span>
                </a>
                <a
                  href="https://linktr.ee/boysnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/25 sm:text-[13px]"
                >
                  <span>linktr.ee/boysnet</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Separated white operational highlights strip */}
      <div className="border-b border-neutral-200 bg-white text-[#171923]">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: EASE_OUT_EXPO }}
          className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-neutral-200 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          <div className="flex items-center gap-3.5 py-4 md:pr-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#80002F]/15 bg-[#FCE8F0]/60 text-[#80002F]">
              <BadgeDollarSign className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-[#171923] sm:text-[15px]">
                Mínimos de compra
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#171923]/80 sm:text-[13px]">
                1ra compra <span className="font-mono font-bold text-[#80002F]">$300 USD</span> ·
                Luego <span className="font-mono font-bold text-[#80002F]">$100 USD</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 py-4 md:px-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#80002F]/15 bg-[#FCE8F0]/60 text-[#80002F]">
              <Truck className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-[#171923] sm:text-[15px]">
                Retiro y envíos
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#171923]/80 sm:text-[13px]">
                Encarnación · Gratis Posadas · Todo el país
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 py-4 md:pl-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#80002F]/15 bg-[#FCE8F0]/60 text-[#80002F]">
              <PackageCheck className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-[#171923] sm:text-[15px]">
                Pago al contado y embalaje
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#171923]/80 sm:text-[13px]">
                Efectivo, USDT, Pesos y Gs. · Embalaje{' '}
                <span className="font-mono font-bold text-[#80002F]">$10 USD</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
