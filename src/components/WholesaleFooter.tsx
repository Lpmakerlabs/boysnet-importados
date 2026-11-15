import { motion } from 'motion/react';
import {
  BUBBLE_WRAP_IMAGE,
  WHOLESALE_INSTRUCTIONS,
  buildWhatsAppUrl,
  resolveAssetPath,
} from '@/src/data/catalog';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function WholesaleFooter() {
  const directConsultUrl = buildWhatsAppUrl(
    'Hola BoysNet Importados, quiero consultar por disponibilidad mayorista o solicitar fotos.'
  );

  return (
    <>
      <section
        id="condiciones"
        className="border-t border-[#E6005A]/15 bg-[#FCE8F0]"
      >
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-2 border-b border-[#80002F]/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#171923]">
                Instrucciones y condiciones mayoristas
              </h2>
              <p className="mt-1 text-sm text-[#171923]/75">
                {WHOLESALE_INSTRUCTIONS.currencyNote}
              </p>
            </div>
            <p className="font-mono text-xs font-semibold tabular-nums text-[#80002F]">
              1ra compra mín. ${WHOLESALE_INSTRUCTIONS.firstOrderMinUsd} USD · Luego desde $
              {WHOLESALE_INSTRUCTIONS.repeatOrderMinUsd} USD
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
            className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <span className="font-mono text-xs font-semibold text-[#80002F]">01.</span>
              <h3 className="mt-2 text-base font-semibold text-[#171923]">
                Precios en USD y mínimos
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171923]/80">
                La primera compra debe ser de un mínimo de{' '}
                <strong className="font-semibold text-[#171923]">$300 USD</strong>. Luego podés
                acceder a los mismos precios a partir de{' '}
                <strong className="font-semibold text-[#171923]">$100 USD</strong>.
              </p>
            </div>

            <div>
              <span className="font-mono text-xs font-semibold text-[#80002F]">02.</span>
              <h3 className="mt-2 text-base font-semibold text-[#171923]">
                Tienda en Encarnación y Posadas
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171923]/80">
                {WHOLESALE_INSTRUCTIONS.physicalStore} Además:{' '}
                {WHOLESALE_INSTRUCTIONS.posadasShipping}
              </p>
            </div>

            <div>
              <span className="font-mono text-xs font-semibold text-[#80002F]">03.</span>
              <h3 className="mt-2 text-base font-semibold text-[#171923]">
                Pagos 100% al contado
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#171923]/80">
                {WHOLESALE_INSTRUCTIONS.paymentSummary}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[#171923]/75">
                {WHOLESALE_INSTRUCTIONS.paymentMethods.map((method) => (
                  <li key={method}>· {method}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-mono text-xs font-semibold text-[#80002F]">04.</span>
              <h3 className="mt-2 text-base font-semibold text-[#171923]">
                Envoltura con bolsa de burbujas
              </h3>
              <div className="mt-2 flex items-start gap-3">
                <img
                  src={BUBBLE_WRAP_IMAGE}
                  alt="Caja con envoltura protectora de burbujas para transporte"
                  className="h-16 w-16 shrink-0 rounded-md border border-[#80002F]/15 bg-white object-contain p-1"
                />
                <p className="text-sm leading-relaxed text-[#171923]/80">
                  {WHOLESALE_INSTRUCTIONS.bubbleWrapNote}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 rounded-lg border border-[#80002F]/15 bg-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-2 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center">
              <h3 className="font-display text-lg font-semibold text-[#171923]">
                {WHOLESALE_INSTRUCTIONS.argentinaHeading}
              </h3>
              <span className="text-xs font-semibold text-[#80002F]">
                Vía Cargo · Correo Argentino · OCA
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 text-sm leading-relaxed text-[#171923]/80 lg:grid-cols-2">
              <div className="space-y-3">
                <p>{WHOLESALE_INSTRUCTIONS.argentinaLead}</p>
                <ul className="space-y-1 text-xs sm:text-sm text-[#171923]/85">
                  {WHOLESALE_INSTRUCTIONS.riskTransferItems.map((item) => (
                    <li key={item}>– {item}</li>
                  ))}
                </ul>
                <p className="pt-1 font-medium text-[#171923]">
                  {WHOLESALE_INSTRUCTIONS.thirdPartyHeading}
                </p>
                <ul className="space-y-1 text-xs sm:text-sm text-[#171923]/85">
                  {WHOLESALE_INSTRUCTIONS.thirdPartyItems.map((item) => (
                    <li key={item}>* {item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p>{WHOLESALE_INSTRUCTIONS.customsClause}</p>
                <p className="font-medium text-[#171923]">
                  {WHOLESALE_INSTRUCTIONS.waiverHeading}
                </p>
                <ul className="space-y-1 text-xs sm:text-sm text-[#171923]/85">
                  {WHOLESALE_INSTRUCTIONS.waiverItems.map((item) => (
                    <li key={item}>– {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacto" className="border-t border-[#C4004D] bg-[#E6005A] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-4 pt-8 pb-24 text-sm sm:flex-row sm:items-center sm:px-6 md:py-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <img
              src={resolveAssetPath('/assets/aistudio/Logo_BoysNet_con_Sol_Sonriente_1__e410f336.webp')}
              alt="BoysNet Importados"
              width={108}
              height={36}
              loading="lazy"
              decoding="async"
              className="h-8 w-auto object-contain shrink-0 sm:h-9"
            />
            <span className="text-xs text-white/85">
              Avda. Internacional a 80 m de la Aduana Paraguaya, Encarnación · 8 a 17 hs · 0985 752200
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/90">
            <a
              href="https://linktr.ee/boysnet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center px-1 hover:text-white transition-colors"
            >
              linktr.ee/boysnet
            </a>
            <a
              href={directConsultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center rounded-md bg-[#80002F] px-4 py-2 font-semibold text-white hover:bg-[#660025] transition-colors"
            >
              WhatsApp · 0985 752200
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
