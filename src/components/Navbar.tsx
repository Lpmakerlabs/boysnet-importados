import { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { resolveAssetPath } from '@/src/data/catalog';

interface NavbarProps {
  totalUnits: number;
  onOpenOrder: () => void;
}

export function Navbar({ totalUnits, onOpenOrder }: NavbarProps) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#C4004D] bg-[#E6005A]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <a
          href="#top"
          aria-label="BoysNet Importados — Inicio"
          className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCE8F0]"
        >
          <img
            src={resolveAssetPath('/assets/aistudio/Logo_BoysNet_con_Sol_Sonriente_1__e410f336.png')}
            alt="BoysNet Importados"
            className="h-9 w-auto object-contain sm:h-10"
          />
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-white/90"
        >
          <a
            href="#catalogo"
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Catálogo
          </a>
          <a
            href="#marcas"
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Marcas
          </a>
          <a
            href="#condiciones"
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Condiciones
          </a>
          <a
            href="#contacto"
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Contacto
          </a>
        </nav>

        <motion.button
          type="button"
          onClick={onOpenOrder}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.12 }}
          className="inline-flex items-center gap-2.5 rounded-md bg-[#80002F] px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#660025] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCE8F0] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          <span>Pedido</span>
          <motion.span
            key={totalUnits}
            initial={!isFirstRender.current && totalUnits > 0 ? { scale: 1.25 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`font-mono text-xs tabular-nums ${
              totalUnits > 0 ? 'text-[#FCE8F0] font-semibold' : 'text-white/75'
            }`}
          >
            ({totalUnits})
          </motion.span>
        </motion.button>
      </div>
    </header>
  );
}
