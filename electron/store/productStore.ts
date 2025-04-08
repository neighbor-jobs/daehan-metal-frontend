import Store from 'electron-store';
import axios, {AxiosResponse} from 'axios';

interface Snapshot {
  id: string;
  sequence: number;
  manufactureAmount: string;
  vCutAmount: string;
  rawMatAmount: string;
  productLength: string;
  stocks: number;
  unitWeight: string;
  vCut: string;
  createdAt: string;
}

interface Scale {
  id: string;
  scale: string;
  snapshot: Snapshot;
}

interface Info {
  id: string;
  scales: Scale[];
}

interface Product {
  id: string;
  bridgeId: string;
  productName: string;
  info: Info;
}

class ProductStore {
  private store: Store;
  private cache: Map<string, Product>;

  constructor() {
    this.store = new Store({ name: 'sales-product-store' });
    this.cache = new Map();
  }

  /** 초기화 메서드 (앱 실행 후 호출) */
  public async initialize() {
    console.log("🚀 서버에서 품목 & 규격 목록 가져오기...");
    await this.fetchAndUpdateProducts();
    this.saveToStore();
  }

  /** 서버에서 품목 리스트를 가져와 캐시 업데이트 */
  public async fetchAndUpdateProducts() {
    this.store.set('sales-product-store', []);
    try {
      // 1번 페이지를 가져오기 (totalPages 확인)
      const firstPageResponse: AxiosResponse = await axios.get(
        `http://localhost:3000/product?page=1&orderBy=desc`
      );

      const totalPages = firstPageResponse.data.data.totalCount;
      firstPageResponse.data.data.products.forEach((product) => this.cache.set(product.id, product));

      console.log(`✅ 1번 페이지 품목 업데이트 완료 (총 ${totalPages} 페이지)`);

      // 2페이지 이상이 존재하면 추가적으로 요청
      for (let page = 2; page <= totalPages; page++) {
        await this.fetchAdditionalPage(page);
      }
    } catch (error) {
      console.error("❌ 품목 리스트 업데이트 실패:", error);
    } finally {
      this.saveToStore();
    }
  }

  private async fetchAdditionalPage(page: number) {
    try {
      const response: AxiosResponse = await axios.get(
        `http://localhost:3000/product?page=${page}&orderBy=desc`
      );
      response.data.data.products.forEach((product) => this.cache.set(product.id, product));
      console.log(`✅ ${page}번 페이지 품목 추가 완료`);
    } catch (error) {
      console.error(`❌ ${page}번 페이지 품목 가져오기 실패:`, error);
    }
  }

  public getProducts(): Product[] {
    return Array.from(this.cache.values());
  }

  public addProduct(product: Product) {
    this.cache.set(product.id, product);
    this.saveToStore();
  }

/*
  public addScale(scale: Scale) {

  }
*/

  public replaceCache(newProducts: Product[]) {
    this.cache.clear();
    newProducts.forEach((product) => this.cache.set(product.id, product));
    this.saveToStore();
  }
/*
  public replaceCache(newCompanies: SalesCompanyInfo[]) {
    this.cache.clear();
    newCompanies.forEach((company) => this.cache.set(company.id, company));
    this.saveToStore();
  }
*/

  public clearCache() {
    this.cache.clear();
  }

  private saveToStore() {
    this.store.set('sales-product-store', this.getProducts());
  }
}

export const productStore = new ProductStore();
