import Store from 'electron-store';

interface Product {
  id: string;
  prodName: string;
  scales?: Scale[];
  defaultRawMatAmount: string,
  defaultManufactureAmount: string,
}

interface Scale {
  scaleName: string;
  rawMatAmount: string,
  manufactureAmount: string,
}

type ProductCache = Record<string, Product>; // id 기준으로 저장

class AmountStore {
  private store: Store<ProductCache>;

  constructor() {
    this.store = new Store<ProductCache>({ name: 'amount-cache' });
  }

  /** 초기화 */
  initializeFromServer(productsFromServer: {
    id: string;
    name: string;
    scales?: string[];
  }[]): void {
    productsFromServer.forEach((serverProduct) => {
      // 이미 존재하는 캐시는 건드리지 않음
      if (this.getById(serverProduct.id)) return;

      const product: Product = {
        id: serverProduct.id,
        prodName: serverProduct.name,
        defaultRawMatAmount: '0',
        defaultManufactureAmount: '0',
        scales: serverProduct.scales?.map((scaleName) => ({
          scaleName,
          rawMatAmount: '0',
          manufactureAmount: '0',
        })),
      };
      this.upsert(product);
    });
  }

  /** 전체 캐시 가져오기 */
  getAll(): Product[] {
    return Object.values(this.store.store);
  }

  /** 특정 ID 기준 조회 */
  getById(id: string): Product | undefined {
    return this.store.get(id);
  }

  /** 새 Product 추가 또는 수정 (upsert) */
  upsert(product: Product): void {
    this.store.set(product.id, product);
  }

  /** 특정 Product 삭제 */
  delete(id: string): void {
    this.store.delete(id);
  }

  /** 전체 삭제 (초기화용) */
  clear(): void {
    this.store.clear();
  }

  /** 서버 데이터로부터 변환 및 추가 */
  fromServerData(serverProduct: {
    id: string;
    name: string;
    scales?: string[];
  }): void {
    const converted: Product = {
      id: serverProduct.id,
      prodName: serverProduct.name,
      defaultRawMatAmount: '0',
      defaultManufactureAmount: '0',
      scales: serverProduct.scales?.map((scaleName) => ({
        scaleName,
        rawMatAmount: '0',
        manufactureAmount: '0',
      })),
    };
    this.upsert(converted);
  }
}

export const amountStore = new AmountStore();