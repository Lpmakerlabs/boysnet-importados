import rawPdfCatalog from './pdfCatalog.json';

export type FragranceLine =
  | 'Árabes'
  | 'Diseñador & Varios'
  | 'Nicho'
  | 'K-Beauty'
  | 'Vaseline & Cuidado'
  | 'Decantadores';

export interface FragranceItem {
  id: string;
  name: string;
  brand: string;
  line: FragranceLine;
  priceUsd: number | null;
  productPhoto: string | null;
  brandLogo: string | null;
  concentration: string | null;
  volume: string | null;
  isKit: boolean;
  isTester: boolean;
  featured: boolean;
  page: number;
}

export function resolveAssetPath(assetPath: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${assetPath.replace(/^\/+/, '')}`;
}

export const CATALOG_ITEMS: FragranceItem[] = (rawPdfCatalog as FragranceItem[]).map(
  (item) => ({
    ...item,
    productPhoto: item.productPhoto ? resolveAssetPath(item.productPhoto) : null,
    brandLogo: item.brandLogo ? resolveAssetPath(item.brandLogo) : null,
  })
);
const VALID_ITEM_IDS = new Set(CATALOG_ITEMS.map((item) => item.id));

export const BUBBLE_WRAP_IMAGE = resolveAssetPath('/assets/pdf/img_29.webp');

export const WHOLESALE_WHATSAPP_NUMBER = '595985752200';
export const WHOLESALE_PHONE_DISPLAY = '0985 752200';
export const FIRST_ORDER_MIN_USD = 300;
export const REPEAT_ORDER_MIN_USD = 100;
export const MAX_QTY_PER_ITEM = 999;
export const MAX_WHATSAPP_URL_LENGTH = 1900;

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[´`’']/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseStoredOrder(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const clean: Record<string, number> = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (!VALID_ITEM_IDS.has(id)) continue;
      if (typeof val === 'number' && Number.isFinite(val) && val >= 1) {
        clean[id] = Math.min(MAX_QTY_PER_ITEM, Math.trunc(val));
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export const FRAGRANCE_LINES: Array<'Todas' | FragranceLine> = [
  'Todas',
  'Árabes',
  'Diseñador & Varios',
  'Nicho',
  'K-Beauty',
  'Vaseline & Cuidado',
  'Decantadores',
];

export interface BrandOption {
  brand: string;
  count: number;
  logo: string | null;
}

export const BRAND_OPTIONS: BrandOption[] = (() => {
  const map = new Map<string, { count: number; logo: string | null }>();
  for (const item of CATALOG_ITEMS) {
    const existing = map.get(item.brand);
    if (existing) {
      existing.count += 1;
      if (!existing.logo && item.brandLogo) existing.logo = item.brandLogo;
    } else {
      map.set(item.brand, { count: 1, logo: item.brandLogo });
    }
  }
  return Array.from(map.entries()).map(([brand, info]) => ({
    brand,
    count: info.count,
    logo: info.logo,
  }));
})();

export const WHOLESALE_INSTRUCTIONS = {
  title: 'Lista de Precios Mayoristas de Perfumes',
  currencyNote:
    'Los precios están en dólares; no publicamos precios en pesos debido a la volatilidad de dicha moneda.',
  firstOrderMinUsd: FIRST_ORDER_MIN_USD,
  repeatOrderMinUsd: REPEAT_ORDER_MIN_USD,
  posadasShipping:
    'Contamos con envío gratis a Posadas, solamente a esa ciudad (no hacemos entregas en puerta).',
  argentinaCouriers: ['Vía Cargo', 'Correo Argentino', 'OCA'] as const,
  argentinaHeading: 'Condiciones de envío a Argentina',
  argentinaLead:
    'Los envíos se realizan a solicitud del cliente y mediante empresas de transporte y/o correo tercerizadas, ajenas a nuestra empresa. Una vez despachado el pedido, toda responsabilidad por el traslado del mismo se transfiere al cliente, incluyendo sin limitarse a:',
  riskTransferItems: [
    'Pérdida total o parcial del envío',
    'Daños, roturas, derrames o fallas en los productos ocasionadas durante el transporte',
    'Demoras o incumplimientos en los plazos de entrega',
  ],
  thirdPartyHeading:
    'Nuestra empresa no se responsabiliza por hechos atribuibles a terceros, tales como:',
  thirdPartyItems: [
    'Empresas de transporte o correo',
    'Aduanas, Gendarmería Nacional Argentina u otros organismos de control',
  ],
  customsClause:
    'En particular, no asumimos responsabilidad alguna en caso de retención, incautación o secuestro del pedido por parte de autoridades argentinas, dado que los productos no cuentan con factura argentina y dicha situación depende exclusivamente de la normativa vigente del país de destino.',
  waiverHeading:
    'Al efectuar una compra con envío a Argentina, el cliente declara conocer, aceptar y asumir expresamente estos riesgos, renunciando a cualquier reclamo posterior por:',
  waiverItems: [
    'Pérdida del envío',
    'Daños en la mercadería',
    'Retenciones o decomisos por parte de autoridades',
  ],
  physicalStore:
    'Disponemos de tienda física en Encarnación, donde el cliente puede ver, probar, retirar los productos personalmente y realizar compras sin riesgo de transporte.',
  paymentSummary:
    'Trabajamos al contado: se debe abonar la totalidad del pedido para realizar el envío o entrega de los productos.',
  paymentMethods: [
    'Efectivo en la tienda',
    'Criptomonedas USDT',
    'Transferencia en pesos / Mercado Pago (consultar cotización)',
    'Transferencias en guaraníes',
  ],
  bubbleWrapNote:
    'Envoltura de cada perfume con bolsa de burbujas para mayor protección durante el transporte tiene un costo de 10 dólares por pedido (sean 10 o 50 perfumes, el costo es el mismo).',
  extraRequestNote:
    'Cualquier otro perfume que desees o si necesitás fotos adicionales, consultá directamente al enviar tu pedido.',
};

export function buildWhatsAppOrderText(
  items: Array<{ item: FragranceItem; quantity: number }>
): string {
  const totalUnits = items.reduce((sum, entry) => sum + entry.quantity, 0);
  const itemsSubtotal = items.reduce(
    (sum, entry) =>
      entry.item.priceUsd !== null ? sum + entry.item.priceUsd * entry.quantity : sum,
    0
  );
  const consultCount = items.filter((entry) => entry.item.priceUsd === null).length;

  const lines: string[] = [
    '*LISTA PARA CONSULTAR — BOYSNET IMPORTADOS*',
    '',
    ...items.map(({ item, quantity }) => {
      if (item.priceUsd === null) {
        return `• ${quantity}x ${item.name} (${item.brand}) — Precio a consultar`;
      }
      const lineTotal = (item.priceUsd * quantity).toFixed(2);
      return `• ${quantity}x ${item.name} (${item.brand}) — $${item.priceUsd.toFixed(2)} USD c/u = $${lineTotal} USD`;
    }),
    '',
    `Total unidades: ${totalUnits}`,
    itemsSubtotal === 0 && consultCount > 0
      ? 'Total estimado: A consultar'
      : `Total estimado: $${itemsSubtotal.toFixed(2)} USD`,
    ...(consultCount > 0 && itemsSubtotal > 0
      ? [`(${consultCount} referencia(s) marcada(s) "A consultar" no incluida(s) en el total)`]
      : []),
  ];

  return lines.join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  const cleanPhone = WHOLESALE_WHATSAPP_NUMBER.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildSafeWhatsAppOrderUrl(
  items: Array<{ item: FragranceItem; quantity: number }>
): { url: string; isTruncated: boolean } {
  const fullUrl = buildWhatsAppUrl(buildWhatsAppOrderText(items));
  if (fullUrl.length <= MAX_WHATSAPP_URL_LENGTH) {
    return { url: fullUrl, isTruncated: false };
  }

  const totalUnits = items.reduce((sum, entry) => sum + entry.quantity, 0);
  const itemsSubtotal = items.reduce(
    (sum, entry) =>
      entry.item.priceUsd !== null ? sum + entry.item.priceUsd * entry.quantity : sum,
    0
  );
  const consultCount = items.filter((entry) => entry.item.priceUsd === null).length;
  const previewItems = items.slice(0, 12);
  const remainingCount = items.length - previewItems.length;

  const compactLines: string[] = [
    '*LISTA PARA CONSULTAR — BOYSNET IMPORTADOS*',
    '',
    ...previewItems.map(({ item, quantity }) =>
      item.priceUsd !== null
        ? `- ${quantity}x ${item.name} ($${(item.priceUsd * quantity).toFixed(2)})`
        : `- ${quantity}x ${item.name} (Consultar)`
    ),
    ...(remainingCount > 0
      ? [`... y ${remainingCount} referencia(s) más (lista completa copiada para pegar en el chat)`]
      : []),
    '',
    `Total unidades: ${totalUnits}`,
    itemsSubtotal === 0 && consultCount > 0
      ? 'Total estimado: A consultar'
      : `Total estimado: $${itemsSubtotal.toFixed(2)} USD`,
  ];

  const compactUrl = buildWhatsAppUrl(compactLines.join('\n'));
  if (compactUrl.length <= MAX_WHATSAPP_URL_LENGTH) {
    return { url: compactUrl, isTruncated: true };
  }

  const fallbackSummary = [
    '*LISTA PARA CONSULTAR — BOYSNET IMPORTADOS*',
    '',
    `Hola! Tengo una lista con ${items.length} referencias (${totalUnits} unidades) por ${
      itemsSubtotal === 0 && consultCount > 0
        ? 'precio a consultar'
        : `$${itemsSubtotal.toFixed(2)} USD`
    }.`,
    '(Te pego el detalle completo a continuación)',
  ].join('\n');

  return { url: buildWhatsAppUrl(fallbackSummary), isTruncated: true };
}
