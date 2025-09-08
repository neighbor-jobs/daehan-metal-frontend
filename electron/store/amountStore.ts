import Store from 'electron-store';
import axios from 'axios';

interface ApiProduct {
  id: string;
  name: string;
  scales?: string[];
  createdAt?: string;
}

export interface Product {
  prodId: string;
  prodName: string;
  scales?: Scale[] | [];
}

export interface Scale {
  scaleName: string;
  prevRawMatAmount?: string;
  prevManufactureAmount?: string;
}

const schema = {
  products: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        prodId: {type: 'string'},
        prodName: {type: 'string'},
        scales: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              scaleName: {type: 'string'},
              prevRawMatAmount: {type: ['string', 'null'], default: '0'},
              prevManufactureAmount: {type: ['string', 'null'], default: '0'},
            },
            required: ['scaleName'],
            additionalProperties: false
          },
          default: []
        }
      },
      required: ['prodId', 'prodName'],
      additionalProperties: false
    }
  }
}

const amountStore = new Store({
  schema,
  name: 'amounts',
  cwd: 'store'
})

// 제품 목록 전체 조회
export const getProducts = (): Product[] =>
  structuredClone(amountStore.get('products', []) as Product[]);

// 제품 목록 전체 덮어쓰기
export const replaceProducts = (products: Product[]): void =>
  amountStore.set('products', products);

// 제품 추가
export const addProduct = (product: Product): void => {
  const current = getProducts();
  setProductsSafely([...current, product]);
};

// 제품 수정
export const updateProduct = (index: number, newData: Partial<Product>): void => {
  const current = getProducts();
  current[index] = {...current[index], ...newData};
  setProductsSafely(current);
};

// 제품 삭제
export const removeProduct = (prodId: string): void => {
  const current = getProducts();
  setProductsSafely(current.filter((p) => p.prodId !== prodId));
};

// scale 조회
export const getScale = (productId: string, scaleName: string): Scale | undefined => {
  const products: Product[] = getProducts();
  const product: Product = products.find(p => p.prodId === productId);
  if (!product || !product.scales) return undefined;
  return product.scales?.find((s: Scale) => s.scaleName === scaleName);
}

// scale 추가
export const addScale = (productId: string, scale: Scale): void => {
  const products = getProducts();
  const productIdx = products.findIndex(p => p.prodId === productId);
  if (productIdx === -1) return;

  products[productIdx].scales = [...(products[productIdx].scales || []), scale];
  setProductsSafely(products);
};

// scale 수정
export const updateScale = (
  prodName: string,
  scaleName: string,
  newData: Partial<Scale>
): void => {
  const products = getProducts();
  const productIdx = products.findIndex(p => p.prodName === prodName);
  if (productIdx === -1) return;

  const scaleIdx = products[productIdx].scales?.findIndex((s: Scale) => s.scaleName === scaleName);
  if (scaleIdx === -1) return;

  const next = structuredClone(products);
  next[productIdx].scales![scaleIdx] = { ...next[productIdx].scales![scaleIdx], ...newData };
  setProductsSafely(next);
};

// scale 삭제
export const removeScale = (productId: string, scaleName: string): void => {
  const products = getProducts();
  const productIdx = products.findIndex(p => p.prodId === productId);
  if (productIdx === -1) return;

  products[productIdx].scales = products[productIdx].scales?.filter(
    (s: Scale) => s.scaleName !== scaleName
  );
  setProductsSafely(products);
};

// 최초 실행 시 API 에서 데이터 받아오기
/* data
* {
    "data": {
        "products": [
            {
                "id": "34166e1b-f036-4fe1-9f03-8291c3d9c104",
                "name": "0",
                "scales": [
                    "1",
                    "2"
                ],
                "createdAt": "2025-05-12T14:21:46.520Z"
            },
            {
                "id": "229370b9-6c4f-4b8d-9195-446a1a62f5a5",
                "name": "0000",
                "scales": [
                    "00",
                    "11"
                ],
                "createdAt": "2025-05-12T16:33:53.941Z"
            },
            {
                "id": "a74c5a82-ce90-4364-8b15-9ec59a2a85f6",
                "name": "0new",
                "scales": [
                    "1x1",
                    "2x2",
                    "3x3",
                    "4x4"
                ],
                "createdAt": "2025-05-13T05:36:11.937Z"
            },
            {
                "id": "61ae99f2-84a5-49da-ae4d-484bb582eb8d",
                "name": "2A",
                "scales": [
                    "AAAA"
                ],
                "createdAt": "2025-05-09T08:11:56.559Z"
            },
            {
                "id": "e25af26a-bc38-4dbd-82bb-05de8d5d2e70",
                "name": "2B",
                "scales": [
                    "0.15T",
                    "0.2T",
                    "0.3TX1X2",
                    "0.5TX1219X2438",
                    "0.5TX1X3",
                    "0.5TX4X3000",
                    "0.5TX4X8",
                    "0.6TX1X2",
                    "0.6TX4X8",
                    "0.8TX1X2",
                    "0.8TX1X3",
                    "0.8TX1X4",
                    "0.8TX4X3000",
                    "0.8TX4X8",
                    "1.0TX1X2",
                    "1.0TX1X3",
                    "1.0TX1X4",
                    "1.0TX4X3000",
                    "1.0TX4X4000",
                    "1.0TX4X8",
                    "1.0TX5X10",
                    "1.2TX1000X2480",
                    "1.2TX1000X3450",
                    "1.2TX1219X3250",
                    "1.2TX1X2650",
                    "1.2TX1X3",
                    "1.2TX1X4"
                ],
                "createdAt": "2025-05-02T08:31:42.898Z"
            },
            {
                "id": "c6c4098c-16ec-40ca-98af-3246b05c96c1",
                "name": "A/L",
                "scales": [
                    "0.5TX4X8",
                    "0.7TX4X8",
                    "0.8TX3X6",
                    "0.8TX4X8",
                    "1.0TX3X6",
                    "1.0TX4X4200",
                    "1.0TX4X8",
                    "1.2T",
                    "1.2TX 65 M2",
                    "1.2TX 93 M2",
                    "1.2TX110M 2",
                    "1.2TX1212X4200",
                    "1.2TX1X3",
                    "1.2TX4X3000",
                    "1.2TX4X8",
                    "1.5TX3X6",
                    "1.5TX3X6",
                    "1.5TX4X3000",
                    "1.5TX4X8",
                    "1.5TX5X10",
                    "2.0T",
                    "2.0TX1.22M",
                    "2.0TX1000X4200",
                    "2.0TX1050X4200",
                    "2.0TX10M2"
                ],
                "createdAt": "2025-05-02T08:31:42.898Z"
            },
            {
                "id": "7484aed0-2ed3-495a-85db-402f39560691",
                "name": "A/L 2.0T",
                "scales": [
                    "15 M2",
                    "1M2",
                    "200 M2",
                    "20M",
                    "220 M2",
                    "26M2",
                    "6 M2",
                    "7 M2",
                    "75 M2 X 3100",
                    "8 M2",
                    "9 M2",
                    "NCT 1200X1200",
                    "가공비",
                    "자재비"
                ],
                "createdAt": "2025-05-02T08:31:42.898Z"
            },
            {
                "id": "07a21dc9-d1f7-4acb-a599-0eca41177a59",
                "name": "A/L 3.0T",
                "scales": [
                    "11.5M",
                    "12 M2",
                    "127 M2",
                    "137M",
                    "184M",
                    "200M",
                    "21M",
                    "27 M²",
                    "338M",
                    "36M",
                    "5 M2",
                    "5M",
                    "80 M2"
                ],
                "createdAt": "2025-05-02T08:31:42.898Z"
            },
            {
                "id": "9d8d57e7-9bba-4497-ac20-366c0976d12c",
                "name": "A/L체크판",
                "scales": [
                    "1",
                    "2",
                    "3"
                ],
                "createdAt": "2025-05-02T08:31:42.898Z"
            },
            {
                "id": "de873491-2228-4665-b4fa-c0295bbb9425",
                "name": "B/D",
                "scales": [
                    "1.2TX1X2500",
                    "1.2TX1X3",
                    "1.2TX1X3000",
                    "1.2TX1X4000",
                    "1.5TX1X4250"
                ],
                "createdAt": "2025-05-02T08:31:42.898Z"
            }
        ],
        "totalPages": 5
    },
    "message": "",
    "statusCode": 200
}
*
* */

type FetchResult = { ok: true; products: ApiProduct[] } | { ok: false; reason: string };

const isApiProduct = (v: any): v is ApiProduct =>
  v && typeof v.id === 'string' && typeof v.name === 'string';

export const fetchAllProducts = async () => {
  try {
    const firstRes = await axios.get('http://localhost:3000/product?page=1&orderBy=asc');
    const { products, totalPages } = firstRes.data?.data ?? {};
    if (!Array.isArray(products) || typeof totalPages !== 'number') {
      return { ok: false, reason: 'invalid shape' };
    }
    const all: ApiProduct[] = [];
    for (const p of products) if (isApiProduct(p)) all.push(p);

    for (let page = 2; page <= totalPages; page++) {
      const res = await axios.get(`http://localhost:3000/product?page=${page}&orderBy=asc`);
      const chunk = res.data?.data?.products ?? [];
      if (!Array.isArray(chunk)) return { ok: false, reason: 'invalid page shape' };
      for (const p of chunk) if (isApiProduct(p)) all.push(p);
    }

    return { ok: true, products: all } as FetchResult;
  } catch {
    console.error('❌ fail fetching products');
    return { ok: false, reason: 'network error' } as FetchResult;
  }
};

export const initializeProducts = async () => {
  const products = getProducts();
  if (products?.length > 0) return;

  const res: any = await fetchAllProducts();
  if (!res.ok) {
    console.warn('initializeProducts skipped: API not available, keep local empty cache');
    return; // 빈 캐시 유지 (최초 구동인데 서버가 죽었을 때)
  }
  const transformed = res.products.map(transformApiProduct);
  setProductsSafely(transformed);
};

export const transformApiProduct = (apiProduct: ApiProduct): Product => ({
  prodId: apiProduct.id,
  prodName: apiProduct.name,
  scales: apiProduct.scales?.map((scaleName: string): Scale => ({
    scaleName,
    prevRawMatAmount: '0',
    prevManufactureAmount: '0',
  })) || []
});

export const validateProductsAgainstAPI = async (options: {
  autoFix?: boolean; // 불일치 시 자동 수정 여부
  removeOrphaned?: boolean; // API 에 없는 제품 삭제 여부
}): Promise<{
  mismatches: Array<{
    productId: string;
    field: 'prodName' | 'scales';
    storedValue: any;
    apiValue: any;
  }>;
}> => {
  const storedProducts = getProducts();
  const apiRes: any = await fetchAllProducts();

  // 🔒 가장 중요한 방어선: API 실패/비정상 → 로컬 변경 금지
  if (!apiRes.ok) {
    console.warn('validate skipped: API unreachable or invalid -> DO NOT TOUCH LOCAL');
    return { mismatches: [] };
  }
  const apiProducts = apiRes.products;

  // 추가 방어선: 로컬에 데이터가 있는데 API 결과가 0개면, 서버 문제로 보고 변경 금지
  if (storedProducts.length > 0 && apiProducts.length === 0) {
    console.warn('validate aborted: local>0 but api=0 -> suspicious, keep local as-is');
    return { mismatches: [] };
  }

  const mismatches: Array<{
    productId: string;
    field: 'prodName' | 'scales';
    storedValue: any;
    apiValue: any;
  }> = [];

  // 머지 작업은 메모리에서 먼저 계산 후, 마지막에 한 번에 커밋
  let next = structuredClone(storedProducts);

  // 1. 기존 제품 검사
  for (const storedProd of storedProducts) {
    const apiProd = apiRes.find(p => p.id === storedProd.prodId);

    if (!apiProd) {
      if (options.removeOrphaned) {
        next = next.filter(p => p.prodId !== storedProd.prodId);
      }
      continue;
    }

    // prodName 검사
    if (storedProd.prodName !== apiProd.name) {
      mismatches.push({
        productId: storedProd.prodId,
        field: 'prodName',
        storedValue: storedProd.prodName,
        apiValue: apiProd.name
      });

      if (options.autoFix) {
        const idx: number = next.findIndex(p => p.prodId === storedProd.prodId);
        if (idx !== -1) next[idx] = { ...next[idx], prodName: apiProd.name };
      }
    }

    // scales 검사
    const apiScaleNames: Set<any> = new Set(apiProd.scales);
    const storedScaleNames: Set<any> = new Set(storedProd.scales.map(s => s.scaleName));

    // 누락된 scale
    for (const scaleName of apiScaleNames) {
      if (!storedScaleNames.has(scaleName)) {
        mismatches.push({
          productId: storedProd.prodId,
          field: 'scales',
          storedValue: Array.from(storedScaleNames),
          apiValue: Array.from(apiScaleNames)
        });

        if (options.autoFix) {
          const idx = next.findIndex(p => p.prodId === storedProd.prodId);
          if (idx !== -1) {
            const cur: Scale[] = next[idx].scales ?? [];
            next[idx] = {
              ...next[idx],
              scales: [...cur, { scaleName, prevRawMatAmount: '0', prevManufactureAmount: '0' }]
            };
          }
        }
      }
    }

    // API에 없는 scale 제거
    if (options.autoFix) {
      const idx = next.findIndex(p => p.prodId === storedProd.prodId);
      if (idx !== -1) {
        next[idx] = {
          ...next[idx],
          scales: (next[idx].scales ?? []).filter(s => apiScaleNames.has(s.scaleName))
        };
      }
    }
  }

  // 2. 신규 제품 추가
  if (options.autoFix) {
    for (const apiProd of apiProducts) {
      if (!next.some(p => p.prodId === apiProd.id)) {
        next.push(transformApiProduct(apiProd));
      }
    }
  }

  // 원자적 커밋
  if (options.autoFix || options.removeOrphaned) {
    setProductsSafely(next);
  }

  return { mismatches };
};

const setProductsSafely = (next: Product[]) => {
  const backup = amountStore.get('products', []) as Product[];
  try {
    amountStore.set('products', next);
  } catch (e) {
    // 롤백
    amountStore.set('products', backup);
    throw e;
  }
};