import {app, BrowserWindow, ipcMain} from 'electron'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import Store from 'electron-store';
import pdfMake from 'pdfmake/build/pdfmake';
import {readFileSync} from 'fs';
import * as fs from 'node:fs';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {
  companyListDocRef,
  companySalesDocDef,
  companySalesSumDocDef,
  dailySalesDocDef,
  invoiceDocDef,
  itemSalesSumDocDef,
  outstandingAmountDocDef,
  payrollRegisterDocRef,
  purchaseReceiptDocRef,
  salaryDocsRef
} from './templetes.ts';
import {
  AccountingManageMenuType,
  ClientManageMenuType,
  PurchaseManageMenuType,
  RevenueManageMenuType
} from '../src/types/headerMenu.ts';
import {companyStore} from './store/salesCompanyStore.ts';
import {addLedgers, getLedgers, Ledger, removeLedgers, replaceLedgers, updateLedgers} from './store/ledgerStore.ts';
import {
  addProduct,
  addScale,
  getProducts,
  getScale,
  initializeProducts,
  Product,
  removeProduct,
  removeScale,
  updateProduct,
  updateScale,
  validateProductsAgainstAPI
} from './store/amountStore.ts';
import {getDeductions, replaceDeductions} from './store/deductionStore.ts';
import {
  addEmployee,
  getEmployees,
  initEmployee,
  removeEmployee,
  replaceEmployees,
  updateEmployees,
  validateEmployeesAgainstAPI
} from './store/employeeStore.ts';
import {
  abcInitializeProducts,
  abcValidateAgainstAPI,
  addProductByCompany,
  AmountPair,
  getPrevAmountByCompany,
  getProductsByCompany,
  ProductByCompany,
  removeCompanyPrevAmount,
  removeProductByCompany,
  setPrevAmountByCompany
} from './store/amountByCompanyStore.ts';
import {CachePayrollMemo, getPayrollMemo, removePayrollMemo, replacePayrollMemo} from './store/payrollMemoStore.ts';

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = new Store({name: 'header-store'});

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(app.getAppPath(), 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public', 'fonts') // 개발 환경
  : path.join(process.resourcesPath, 'fonts') // 프로덕션 환경에서는 resourcesPath 사용

export const fontPath = process.env.VITE_PUBLIC

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    // fullscreen: true,
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true, /* 개발용: false, 서비스용: true */
      webSecurity: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    win.webContents.send('main-process-message', `Render path: ${RENDERER_DIST}`)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  createWindow();

  // product
  await initializeProducts();
  await validateProductsAgainstAPI({
    autoFix: true,
    removeOrphaned: true
  });

  // employees
  await initEmployee();
  await validateEmployeesAgainstAPI();

  // amount by company
  await abcInitializeProducts();
  await abcValidateAgainstAPI({
    autoFix: true,
    removeOrphaned: true,
  });
});

// 데이터 가져오기
ipcMain.handle('get-store', (_, key) => {
  // console.log('데이터 경로: ', app.getPath('userData'));
  return store.get(key);
});

// 데이터 저장하기
ipcMain.handle('set-store', (_, key, value) => {
  store.set(key, value);
});

/*
* ======================== 매출처 관련 ==========================
* */
ipcMain.handle('get-sales-companies', () => companyStore.getSalesCompanies());
ipcMain.handle('add-sales-company', (_event, company) => {
  companyStore.addSalesCompany(company);
  return {success: true};
});
ipcMain.handle('fetch-and-update-companies', () => companyStore.fetchAndUpdateCompanies())
// 특정 회사의 location 리스트 가져오기
ipcMain.handle('get-locations-list', (_event, companyId) => {
  return companyStore.getLocations(companyId);
})
// 특정 회사에 location 추가
ipcMain.handle('add-location', (_event, {companyId, location}) => {
  companyStore.addLocation(companyId, location);
  return {success: true};
});
// sales-company-store clear
ipcMain.handle('clear-sales-company', () => companyStore.clearCache());

/*
* ======================== 품목 가격 관련 ==========================
* */

// products CRUD
ipcMain.handle('products:get', () => getProducts());
ipcMain.handle('products:add', (_event, product: Product) => {
  addProduct(product);
  return {success: true};
});
ipcMain.handle('products:update', (_event, index: number, newData: Partial<Product>) => {
  updateProduct(index, newData);
  return {success: true};
});
ipcMain.handle('products:remove', (_event, prodId: string) => {
  removeProduct(prodId);
  return {success: true};
});

// 데이터 정합성 검사
ipcMain.handle('products:validate', async (_event, options) => {
  return await validateProductsAgainstAPI(options);
});

// scale CRUD
ipcMain.handle('scales:get', (_event, productId: string, scaleName: string) => {
  return getScale(productId, scaleName);
})

ipcMain.handle('scales:add', (_event, productId, scale) => {
  addScale(productId, scale);
  return {success: true};
});

ipcMain.handle('scales:update', (_event, productId, scaleName, newData) => {
  updateScale(productId, scaleName, newData);
  return {success: true};
});

ipcMain.handle('scales:remove', (_event, productId, scaleName) => {
  removeScale(productId, scaleName);
  return {success: true};
});

/*
* ======================== 거래처별 최근 거래값 캐싱 (amountByCompanyStore) ==========================
* */

// products (시험용 스토어) CRUD
ipcMain.handle('abc:products:get', () => getProductsByCompany());

ipcMain.handle('abc:products:add', (_event, product: ProductByCompany) => {
  addProductByCompany(product);
  return {success: true};
});

ipcMain.handle('abc:products:remove', (_event, prodId: string) => {
  removeProductByCompany(prodId);
  return {success: true};
});

// 검증/동기화 (이름/스케일만 API와 맞춤; 금액 데이터는 로컬 소유)
ipcMain.handle('abc:products:validate', async (_event, options?: {
  baseUrl?: string;
  orderBy?: 'asc' | 'desc';
  autoFix?: boolean;
  removeOrphaned?: boolean;
}) => {
  return await abcValidateAgainstAPI(options);
});

// 직전값 조회: companyName 있으면 거래처별, 없으면 디폴트
ipcMain.handle('abc:prev:get', (_event, productId: string, scaleName: string, companyName?: string) => {
  return getPrevAmountByCompany(productId, scaleName, companyName);
});

// 직전값 저장: opts.companyName 있으면 거래처별, asDefault=true면 디폴트
ipcMain.handle('abc:prev:set', (
  _event,
  productId: string,
  scaleName: string,
  value: AmountPair,
  opts?: { companyName?: string; asDefault?: boolean; touchUpdatedAt?: boolean }
) => {
  setPrevAmountByCompany(productId, scaleName, value, opts);
  return {success: true};
});

// 특정 거래처의 직전값 삭제 (스케일 단위)
ipcMain.handle('abc:prev:remove', (_event, productId: string, scaleName: string, companyName: string) => {
  removeCompanyPrevAmount(productId, scaleName, companyName);
  return {success: true};
});

/*
* ================================ 회계 관련 ===============================================
* */
ipcMain.handle('ledgers:get', () => getLedgers());

ipcMain.handle('ledgers:add', (_event, ledger) => {
  addLedgers(ledger);
  return {success: true};
});
ipcMain.handle('ledgers:update', (_event, index, data) => {
  updateLedgers(index, data);
  return {success: true};
});

ipcMain.handle('ledgers:replace', (_event, newLedgers: Ledger[]) => {
  replaceLedgers(newLedgers);
  return {success: true};
});

ipcMain.handle('ledgers:remove', (_event, index) => {
  removeLedgers(index);
  return {success: true};
});

// ------------------------------------------------------------------------------------------
ipcMain.handle('deductions:get', () => getDeductions());

ipcMain.handle('deductions:replace', (_event, newDeductions: string[]) => replaceDeductions(newDeductions));

// ------------------------------------------------------------------------------------------
ipcMain.handle('employees:get', () => getEmployees());

ipcMain.handle('employees:add', (_event, newEmployeeId: string) => addEmployee(newEmployeeId))

ipcMain.handle('employees:replace', (_event, newEmployees) => replaceEmployees(newEmployees));

ipcMain.handle('employees:update', (_event, newEmployees) => updateEmployees(newEmployees));

ipcMain.handle('employees:remove', (_event, id: string) => removeEmployee(id));

// ------------------------------------------------------------------------------------------
ipcMain.handle('payrollMemo:get', () => getPayrollMemo());

ipcMain.handle('payrollMemo:replace', (_e, newMemo: CachePayrollMemo) => replacePayrollMemo(newMemo));

ipcMain.handle('payrollMemo:remove', () => removePayrollMemo());

/*
* ======================== 인쇄 관련 ==========================
* */

pdfMake.vfs = {
  'Pretendard-Medium.ttf': readFileSync(path.join(fontPath, 'Pretendard-Medium.ttf'), 'base64'),
};

pdfMake.fonts = {
  Pretendard: {
    normal: 'Pretendard-Medium.ttf',
  },
};

ipcMain.handle('generate-and-open-pdf',
  async (_,
         printType:
           RevenueManageMenuType
           | PurchaseManageMenuType
           | ClientManageMenuType
           | AccountingManageMenuType,
         data) => {
    // 1. 문서 정의 (DocDefinition) 계산
    let docDefinition: TDocumentDefinitions;
    switch (printType) {
      case RevenueManageMenuType.SalesDetail:
        docDefinition = invoiceDocDef(data);
        break;
      case RevenueManageMenuType.DailySales:
        docDefinition = dailySalesDocDef(data);
        break;
      case RevenueManageMenuType.ClientSalesSummary:
        docDefinition = companySalesSumDocDef(data);
        break;
      case RevenueManageMenuType.ClientSales:
        docDefinition = companySalesDocDef(data);
        break;
      case RevenueManageMenuType.ClientOutstandingBalance:
        docDefinition = outstandingAmountDocDef(data);
        break;
      case RevenueManageMenuType.ItemSalesSummary:
        docDefinition = itemSalesSumDocDef(data);
        break;
      case ClientManageMenuType.SalesManage:
        docDefinition = companyListDocRef(data)
        break;
      case PurchaseManageMenuType.MonthlyPurchase:
        docDefinition = purchaseReceiptDocRef(data)
        break;
      /* 직원별 급여명세서 */
      case AccountingManageMenuType.EmployeeManage:
        docDefinition = salaryDocsRef(data);
        break;
      /* 급여대장 */
      case AccountingManageMenuType.PayrollDetail:
        docDefinition = payrollRegisterDocRef(data);
        break;
      default:
        throw new Error(`Unknown print type: ${printType}`);
    }

    if (!docDefinition) {
      throw new Error('Document definition is missing');
    }

    // 2. pdfMake의 getBuffer 비동기 호출을 Promise로 감싸서 처리
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      pdfDocGenerator.getBuffer((buffer) => {
        if (buffer) {
          resolve(buffer);
        } else {
          // buffer가 유효하지 않으면 실패 처리
          reject(new Error('PDF buffer generation failed'));
        }
      });
    });

    // 3. 파일 저장 및 프리뷰 창 열기
    try {
      const previewPath = path.join(app.getPath('temp'), 'preview.pdf');

      // 버퍼를 파일로 저장
      fs.writeFileSync(previewPath, buffer);

      // 내부 프리뷰 창 열기
      const previewWin = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {plugins: true}
      });

      // 파일 URL로 로드
      await previewWin.loadURL(`file://${previewPath}`);

      // 4. 성공 응답 반환 (IPC 통신 필수!)
      return previewPath;

    } catch (error) {
      // 파일 저장/창 열기 중 에러 발생 시
      console.error("PDF Preview Error:", error);
      // 에러를 throw 하여 렌더러 프로세스에 실패를 알림
      throw new Error(`PDF 파일 처리 중 오류 발생: ${error.message}`);
    }
  });