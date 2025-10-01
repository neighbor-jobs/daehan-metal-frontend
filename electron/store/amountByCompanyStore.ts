import Store from 'electron-store';

export interface AmountPair {
  rawMatAmount?: string;
  manufactureAmount?: string;
  updatedAt?: string;
}

export interface ScaleByCompany {
  scaleName: string;
  prevDefault?: AmountPair;
  prevByCompany?: Record<string, AmountPair>;
}

export interface ProductByCompany {
  prodId: string;
  prodName: string;
  scales?: ScaleByCompany[];
}

const amountByCompanySchema = {
  products: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        prodId: { type: 'string' },
        prodName: { type: 'string' },
        scales: {
          type: 'array',
          default: [],
          items: {
            type: 'object',
            properties: {
              scaleName: { type: 'string' },
              prevDefault: {
                type: ['object', 'null'],
                default: { rawMatAmount: '0', manufactureAmount: '0' },
                properties: {
                  rawMatAmount: { type: ['string', 'null'], default: '0' },
                  manufactureAmount: { type: ['string', 'null'], default: '0' },
                  updatedAt: { type: ['string', 'null'] }
                },
                additionalProperties: false
              },
              prevByCompany: {
                type: ['object', 'null'],
                default: {},
                additionalProperties: {
                  type: 'object',
                  properties: {
                    rawMatAmount: { type: ['string', 'null'], default: '0' },
                    manufactureAmount: { type: ['string', 'null'], default: '0' },
                    updatedAt: { type: ['string', 'null'] }
                  },
                  additionalProperties: false
                }
              }
            },
            required: ['scaleName'],
            additionalProperties: false
          }
        }
      },
      required: ['prodId', 'prodName'],
      additionalProperties: false
    }
  }
};

export const amountByCompanyStore = new Store({
  schema: amountByCompanySchema,
  name: 'amountsByCompany',
  cwd: 'store'
});

// ========================= 기본 CRUD =========================

export const getProductsByCompany = (): ProductByCompany[] =>
  structuredClone(amountByCompanyStore.get('products', []) as ProductByCompany[]);

export const setProductsByCompany = (products: ProductByCompany[]): void => {
  const backup = amountByCompanyStore.get('products', []) as ProductByCompany[];
  try {
    amountByCompanyStore.set('products', products);
  } catch (e) {
    amountByCompanyStore.set('products', backup);
    throw e;
  }
};

export const addProductByCompany = (product: ProductByCompany): void => {
  const current = getProductsByCompany();
  setProductsByCompany([...current, product]);
};

export const removeProductByCompany = (prodId: string): void => {
  const current = getProductsByCompany();
  setProductsByCompany(current.filter(p => p.prodId !== prodId));
};

// ========================= 조회 / 저장 =========================

// 조회 (거래처별 → 디폴트 순서)
export const getPrevAmountByCompany = (
  productId: string,
  scaleName: string,
  companyName?: string
): AmountPair | undefined => {
  const products = getProductsByCompany();
  const product = products.find(p => p.prodId === productId);
  if (!product) return undefined;

  const scale = product.scales?.find(s => s.scaleName === scaleName);
  if (!scale) return undefined;

  if (companyName && scale.prevByCompany?.[companyName]) {
    return scale.prevByCompany[companyName];
  }
  return scale.prevDefault;
};

// 저장 (거래처별 또는 디폴트)
type SavePrevAmountOpts = {
  companyName?: string;
  asDefault?: boolean;
  touchUpdatedAt?: boolean;
};

export const setPrevAmountByCompany = (
  productId: string,
  scaleName: string,
  value: AmountPair,
  opts: SavePrevAmountOpts = {}
): void => {
  const { companyName, asDefault = false, touchUpdatedAt = true } = opts;
  const products = getProductsByCompany();
  const pIdx = products.findIndex(p => p.prodId === productId);
  if (pIdx === -1) return;

  const sIdx = products[pIdx].scales?.findIndex(s => s.scaleName === scaleName) ?? -1;
  if (sIdx === -1) return;

  const next = structuredClone(products);
  const target = next[pIdx].scales![sIdx];

  const stamped: AmountPair = {
    ...value,
    updatedAt: touchUpdatedAt ? new Date().toISOString() : value.updatedAt
  };

  if (asDefault || !companyName) {
    target.prevDefault = {
      rawMatAmount: stamped.rawMatAmount ?? target.prevDefault?.rawMatAmount ?? '0',
      manufactureAmount: stamped.manufactureAmount ?? target.prevDefault?.manufactureAmount ?? '0',
      updatedAt: stamped.updatedAt
    };
  } else {
    target.prevByCompany = target.prevByCompany ?? {};
    const cur = target.prevByCompany[companyName] ?? {};
    target.prevByCompany[companyName] = {
      rawMatAmount: stamped.rawMatAmount ?? cur.rawMatAmount ?? '0',
      manufactureAmount: stamped.manufactureAmount ?? cur.manufactureAmount ?? '0',
      updatedAt: stamped.updatedAt
    };
  }

  setProductsByCompany(next);
};

// 거래처별 데이터 삭제
export const removeCompanyPrevAmount = (
  productId: string,
  scaleName: string,
  companyName: string
): void => {
  const products = getProductsByCompany();
  const pIdx = products.findIndex(p => p.prodId === productId);
  if (pIdx === -1) return;

  const sIdx = products[pIdx].scales?.findIndex(s => s.scaleName === scaleName) ?? -1;
  if (sIdx === -1) return;

  const next = structuredClone(products);
  if (next[pIdx].scales![sIdx].prevByCompany) {
    delete next[pIdx].scales![sIdx].prevByCompany![companyName];
    setProductsByCompany(next);
  }
};

// ================================================
// ============ API 연동 / 초기화 / 검증 ============
// ================================================

import axios from 'axios';

// --- API 타입 (로컬 전용, 충돌 방지용 접두어 abc) ---
interface AbcApiProduct {
  id: string;
  name: string;
  scales?: string[];
  createdAt?: string;
}

type AbcFetchResult =
  | { ok: true; products: AbcApiProduct[]; totalPages: number }
  | { ok: false; reason: string };

const isAbcApiProduct = (v: any): v is AbcApiProduct =>
  v && typeof v.id === 'string' && typeof v.name === 'string';

// --- API 전체 페이지 조회 ---
export const abcFetchAllProducts = async (
  baseUrl = 'https://saving-finer-fly.ngrok-free.app',
  orderBy: 'asc' | 'desc' = 'asc'
): Promise<AbcFetchResult> => {
  try {
    const first = await axios.get(`${baseUrl}/product?page=1&orderBy=${orderBy}`);
    const data = first.data?.data ?? {};
    const firstProducts = Array.isArray(data.products) ? data.products : [];
    const totalPages: number = typeof data.totalPages === 'number' ? data.totalPages : 1;

    const all: AbcApiProduct[] = [];
    for (const p of firstProducts) if (isAbcApiProduct(p)) all.push(p);

    for (let page = 2; page <= totalPages; page++) {
      const res = await axios.get(`${baseUrl}/product?page=${page}&orderBy=${orderBy}`);
      const chunk = res.data?.data?.products ?? [];
      if (!Array.isArray(chunk)) {
        return { ok: false, reason: 'invalid page shape' };
      }
      for (const p of chunk) if (isAbcApiProduct(p)) all.push(p);
    }

    return { ok: true, products: all, totalPages };
  } catch (e) {
    console.error('[abcFetchAllProducts] network error', e);
    return { ok: false, reason: 'network error' };
  }
};

// --- API → 로컬 저장 구조 변환 ---
export const abcTransformApiProduct = (apiProduct: AbcApiProduct): ProductByCompany => ({
  prodId: apiProduct.id,
  prodName: apiProduct.name,
  scales:
    apiProduct.scales?.map((scaleName) => ({
      scaleName,
      prevDefault: { rawMatAmount: '0', manufactureAmount: '0' },
      prevByCompany: {}
    })) ?? []
});

// --- 초기화: 로컬이 비어 있을 때 API 동기화하여 채움 ---
export const abcInitializeProducts = async (opts?: {
  baseUrl?: string;
  orderBy?: 'asc' | 'desc';
  skipIfExists?: boolean; // 기본 true: 로컬에 데이터 있으면 건너뜀
}) => {
  const { baseUrl = 'https://saving-finer-fly.ngrok-free.app', orderBy = 'asc', skipIfExists = true } = opts ?? {};
  const current = getProductsByCompany();
  if (skipIfExists && current.length > 0) return;

  const res = await abcFetchAllProducts(baseUrl, orderBy);
  if (!res.ok) {
    console.warn('[abcInitializeProducts] API 실패, 로컬 상태 유지');
    return;
  }
  // 안전장치: API가 비정상적으로 0개면 초기화 스킵(최초 구동 시 서버 문제일 수 있음)
  if (current.length > 0 && res.products.length === 0) {
    console.warn('[abcInitializeProducts] local>0 && api=0 → 의심, 로컬 유지');
    return;
  }

  const transformed = res.products.map(abcTransformApiProduct);
  setProductsByCompany(transformed);
};

// --- 검증/동기화: 이름/스케일 목록만 API와 맞춤 (금액 데이터는 로컬 소유) ---
export const abcValidateAgainstAPI = async (opts?: {
  baseUrl?: string;
  orderBy?: 'asc' | 'desc';
  autoFix?: boolean; // 이름/스케일 차이 자동보정
  removeOrphaned?: boolean; // API에 없는 제품을 로컬에서 제거
}): Promise<{
  mismatches: Array<{
    productId: string;
    field: 'prodName' | 'scales';
    storedValue: any;
    apiValue: any;
  }>;
}> => {
  const { baseUrl = 'https://saving-finer-fly.ngrok-free.app', orderBy = 'asc', autoFix = false, removeOrphaned = false } =
  opts ?? {};

  const stored = getProductsByCompany();
  const apiRes = await abcFetchAllProducts(baseUrl, orderBy);

  // API 실패 시 로컬 변경 금지
  if (!apiRes.ok) {
    console.warn('[abcValidateAgainstAPI] API 실패 → 로컬 무변경');
    return { mismatches: [] };
  }
  const apiProducts = apiRes.products;

  // 로컬이 있는데 API가 0개면 서버 문제로 간주하고 변경 금지
  if (stored.length > 0 && apiProducts.length === 0) {
    console.warn('[abcValidateAgainstAPI] local>0 && api=0 → 의심, 로컬 유지');
    return { mismatches: [] };
  }

  const mismatches: Array<{
    productId: string;
    field: 'prodName' | 'scales';
    storedValue: any;
    apiValue: any;
  }> = [];

  let next = structuredClone(stored);

  // 1) 기존 제품 검사
  for (const s of stored) {
    const api = apiProducts.find((p) => p.id === s.prodId);

    // 고아 제품 처리
    if (!api) {
      if (removeOrphaned) {
        next = next.filter((p) => p.prodId !== s.prodId);
      }
      continue;
    }

    // 이름 불일치
    if (s.prodName !== api.name) {
      mismatches.push({
        productId: s.prodId,
        field: 'prodName',
        storedValue: s.prodName,
        apiValue: api.name
      });

      if (autoFix) {
        const idx = next.findIndex((p) => p.prodId === s.prodId);
        if (idx !== -1) next[idx] = { ...next[idx], prodName: api.name };
      }
    }

    // 스케일 존재성 체크 (로컬에 없으면 추가 / API에 없으면 제거)
    const apiScaleSet = new Set(api.scales ?? []);
    const storedScaleSet = new Set((s.scales ?? []).map((x) => x.scaleName));

    // API에는 있는데 로컬엔 없는 스케일 → 추가
    for (const scaleName of apiScaleSet) {
      if (!storedScaleSet.has(scaleName)) {
        mismatches.push({
          productId: s.prodId,
          field: 'scales',
          storedValue: Array.from(storedScaleSet),
          apiValue: Array.from(apiScaleSet)
        });

        if (autoFix) {
          const idx = next.findIndex((p) => p.prodId === s.prodId);
          if (idx !== -1) {
            const cur = next[idx].scales ?? [];
            next[idx] = {
              ...next[idx],
              scales: [
                ...cur,
                {
                  scaleName,
                  prevDefault: { rawMatAmount: '0', manufactureAmount: '0' },
                  prevByCompany: {}
                }
              ]
            };
          }
        }
      }
    }

    // API에 없는 스케일 → 제거
    if (autoFix) {
      const idx = next.findIndex((p) => p.prodId === s.prodId);
      if (idx !== -1) {
        next[idx] = {
          ...next[idx],
          scales: (next[idx].scales ?? []).filter((sc) => apiScaleSet.has(sc.scaleName))
        };
      }
    }
  }

  // 2) 신규 제품 추가
  if (autoFix) {
    for (const api of apiProducts) {
      if (!next.some((p) => p.prodId === api.id)) {
        next.push(abcTransformApiProduct(api));
      }
    }
  }

  // 3) 최종 커밋
  if (autoFix || removeOrphaned) {
    setProductsByCompany(next);
  }

  return { mismatches };
};