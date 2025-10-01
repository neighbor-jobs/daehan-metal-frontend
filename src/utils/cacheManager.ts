import {Paying} from '../types/ledger.ts';
import {Employee} from '../types/employeeRes.ts';

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
    return await window.ipcRenderer.invoke('add-location', {companyId, location});
  },

  async clearSalesCompany() {
    return await window.ipcRenderer.invoke('clear-sales-company');
  },

  /*
* ================================ 품목 관련 ===============================
* */
  async getProducts() {
    return await window.ipcRenderer.invoke('products:get');
  },
  async addProduct(product: any) {
    return await window.ipcRenderer.invoke('products:add', product);
  },
  async updateProduct(index, newData) {
    return await window.ipcRenderer.invoke('products:update', index, newData);
  },
  async removeProduct(prodId: string) {
    return await window.ipcRenderer.invoke('products:remove', prodId);
  },

  async getScale(productId: string, scaleName: string) {
    return await window.ipcRenderer.invoke('scales:get', productId, scaleName);
  },
  async addScale(productId: string, scale) {
    return await window.ipcRenderer.invoke('scales:add', productId, scale);
  },
  async updateScale(prodName: string, scaleName: string, newData) {
    return await window.ipcRenderer.invoke('scales:update', prodName, scaleName, newData);
  },
  async removeScale(productId: string, scaleName: string) {
    return await window.ipcRenderer.invoke('scales:remove', productId, scaleName);
  },

  async validateProductsAgainstAPI(autoFix: boolean, removeOrphaned: boolean) {
    return await window.ipcRenderer.invoke('products:validate', {
      autoFix: autoFix,
      removeOrphaned: removeOrphaned,
    })
  },

  /*
* ================================ 거래처별 품목 캐시 (amountByCompanyStore) ===============================
* */

  /** 거래처별 캐시용 제품 전체 조회 */
  async getProductsByCompany() {
    return await window.ipcRenderer.invoke('abc:products:get');
  },

  /** 거래처별 캐시용 제품 추가 */
  async addProductByCompany(product: any) {
    return await window.ipcRenderer.invoke('abc:products:add', product);
  },

  /** 거래처별 캐시용 제품 삭제 */
  async removeProductByCompany(prodId: string) {
    return await window.ipcRenderer.invoke('abc:products:remove', prodId);
  },

  /** 거래처별 제품 목록 검증 및 동기화 */
  async validateProductsByCompany(autoFix: boolean, removeOrphaned: boolean) {
    return await window.ipcRenderer.invoke('abc:products:validate', {
      autoFix,
      removeOrphaned,
    });
  },

  /** 거래처별 직전 입력값 조회 (거래처 없으면 디폴트 반환) */
  async getPrevAmountByCompany(productId: string, scaleName: string, companyName?: string) {
    return await window.ipcRenderer.invoke('abc:prev:get', productId, scaleName, companyName);
  },

  /** 거래처별 직전 입력값 저장
   * @param opts.companyName 지정 시 해당 거래처 전용
   * @param opts.asDefault true면 디폴트로 저장
   */
  async setPrevAmountByCompany(productId: string, scaleName: string, value: any, opts?: { companyName?: string; asDefault?: boolean; touchUpdatedAt?: boolean }) {
    return await window.ipcRenderer.invoke('abc:prev:set', productId, scaleName, value, opts);
  },

  /** 특정 거래처의 특정 스케일 직전값 삭제 */
  async removeCompanyPrevAmount(productId: string, scaleName: string, companyName: string) {
    return await window.ipcRenderer.invoke('abc:prev:remove', productId, scaleName, companyName);
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
    return await window.ipcRenderer.invoke('ledgers:update', index, data);
  },

  async replaceLedgers(newLedgers: Paying[]) {
    return await window.ipcRenderer.invoke('ledgers:replace', newLedgers);
  },

  async removeLedgers(index: number) {
    return await window.ipcRenderer.invoke('ledgers:update', index);
  },

  async getDeductions() {
    return await window.ipcRenderer.invoke('deductions:get');
  },

  async replaceDeductions(newDeductions: string[]) {
    return await window.ipcRenderer.invoke('deductions:replace', newDeductions);
  },

  async getEmployees() {
    return await window.ipcRenderer.invoke('employees:get');
  },

  async addEmployee(newEmployeeId: string) {
    return await window.ipcRenderer.invoke('employees:add', newEmployeeId);
  },

  async replaceEmployees(newEmployees: Employee[]) {
    return await window.ipcRenderer.invoke('employees:replace', newEmployees);
  },

  async updateEmployees(newEmployees: any[]) {
    return await window.ipcRenderer.invoke('employees:update', newEmployees);
  },

  async removeEmployee(employeeId: string) {
    return await window.ipcRenderer.invoke('employees:remove', employeeId);
  }
};

export default cacheManager;