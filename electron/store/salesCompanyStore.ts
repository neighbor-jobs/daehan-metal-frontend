import Store from 'electron-store';
import axios, {AxiosResponse} from 'axios';

export interface SalesCompanyInfo {
  id: string;
  companyName: string;
  locationNames: string[] | null;
  businessCategory: string | null;
  businessNumber: string | null;
  businessType: string | null;
  address: string | null;
  phoneNumber: string | null;
  ownerName: string | null;
  fax: string | null;
}

/*
export interface LocationInfo {
  id: string;
  name: string;
  locationId: string;
}
*/

class CompanyStore {
  private store: Store;
  private cache: Map<string, SalesCompanyInfo>;

  constructor() {
    this.store = new Store({ name: 'sales-company-store' });
    this.cache = new Map();
    this.loadCache();
  }

  private loadCache() {
    const companies = this.store.get('sales-company-store');

    if (Array.isArray(companies)) {
      companies.forEach((company) => this.cache.set(company.companyId, company));
    } else {
      this.store.set('sales-company-store', []);
    }
  }

  public getSalesCompanies(): SalesCompanyInfo[] {
    return Array.from(this.cache.values());
  }

  /** 초기화 메서드 (앱 실행 후 호출) */
  public async initialize() {
    // console.log("🚀 서버에서 거래처 목록 가져오기...");
    await this.fetchAndUpdateCompanies();
  }

  /** 서버에서 거래처 리스트를 가져와 캐시 업데이트 */
  public async fetchAndUpdateCompanies() {
    try {
      const response: AxiosResponse = await axios.get<SalesCompanyInfo[]>(
        `http://localhost:3000/company?orderBy=desc`
      );
      this.replaceCache(response.data.data);
    } catch (error) {
      console.error("❌ 거래처 리스트 업데이트 실패:", error);
    }
  }

  public addSalesCompany(company: SalesCompanyInfo) {
    this.cache.set(company.id, company);
    this.saveToStore();
  }

  public replaceCache(newCompanies: SalesCompanyInfo[]) {
    this.cache.clear();
    newCompanies.forEach((company) => this.cache.set(company.id, company));
    this.saveToStore();
  }

  public getLocations(companyId: string): string[] {
    const company = this.cache.get(companyId);
    return company ? company.locationNames : [];
  }

  public addLocation(companyId: string, location: string) {
    const company = this.cache.get(companyId);
    if (company) {
      company.locationNames.push(location);
      this.cache.set(companyId, company);
      this.saveToStore();
    } else {
      throw new Error(`Company with ID ${companyId} not found.`);
    }
  }

  public clearCache() {
    this.cache.clear();
  }

  private saveToStore() {
    this.store.set('sales-company-store', this.getSalesCompanies());
  }
}
export const companyStore = new CompanyStore();