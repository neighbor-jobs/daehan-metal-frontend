import {Paying} from '../types/ledger.ts';

export const cacheManager = {
  /*
  * ================================ 헤더 관련 ===============================
  * */
  async getSelectedType() {
    return await window.ipcRenderer.invoke('get-store', 'selectedType');
  },

  async getSelectedSubType() {
    return await window.ipcRenderer.invoke('get-store', 'selectedSubType');
  },

  /*
  * ================================ 거래처 관련 ===============================
  * */
  /** 모든 회사 리스트 가져오기 */
  async getCompanies() {
    return await window.ipcRenderer.invoke('get-sales-companies');
  },

  /** 회사 추가 */
  async addCompany(company: any) {
    return await window.ipcRenderer.invoke('add-sales-company', company);
  },

  /** 갱신 */
  async fetchAndUpdateCompanies() {
    return await window.ipcRenderer.invoke('fetch-and-update-companies');
  },

  /** 특정 회사의 현장(location) 리스트 가져오기 */
  async getLocations(companyId: string) {
    return await window.ipcRenderer.invoke('get-locations-list', companyId);
  },

  /** 특정 회사에 새로운 현장(location) 추가 */
  async addLocation(companyId: string, location: any) {
    return await window.ipcRenderer.invoke('add-location', { companyId, location });
  },

  async clearSalesCompany() {
    return await window.ipcRenderer.invoke('clear-sales-company');
  },

  /*
* ================================ 품목 관련 ===============================
* */
  async getProducts() {
    return await window.ipcRenderer.invoke('get-products');
  },
  async addProduct(product: any) {
    return await window.ipcRenderer.invoke('add-product', product);
  },

  /** 갱신 */
  async fetchAndUpdateProducts() {
    return await window.ipcRenderer.invoke('fetch-and-update-products');
  },

/*
* ================================ 회계 관련 ===============================
* */
  async getLedgers() {
      return await window.ipcRenderer.invoke('ledgers:get');
  },
  async addLedgers(ledger: Paying) {
    return await window.ipcRenderer.invoke('ledgers:add', ledger);
  },
  async updateLedgers(index: number, data: Paying) {
    return await window.ipcRenderer.invoke('ledgers:update',index, data);
  },
  async removeLedgers(index: number) {
    return await window.ipcRenderer.invoke('ledgers:update',index);
  }
};

export default cacheManager;


