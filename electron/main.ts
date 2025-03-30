import {app, BrowserWindow, ipcMain, shell} from 'electron'
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
  invoiceDocDef,
  itemSalesSumDocDef,
  outstandingAmountDocDef
} from './templetes.ts';
import {RevenueManageMenuType} from '../src/types/headerMenu.ts';
import {companyStore} from './store/salesCompanyStore.ts';
import {productStore} from './store/productStore.ts';

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      webSecurity: false,
    },
  })

  win.maximize();

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
  await companyStore.initialize();
  await productStore.initialize();
});

// 데이터 가져오기
ipcMain.handle('get-store', (_, key) => {
  console.log('데이터 경로: ', app.getPath('userData'));
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
  return { success: true };
});
ipcMain.handle('fetch-and-update-companies', () => companyStore.fetchAndUpdateCompanies())
// 특정 회사의 location 리스트 가져오기
ipcMain.handle('get-locations-list', (_event, companyId) => {
  return companyStore.getLocations(companyId);
})
// 특정 회사에 location 추가
ipcMain.handle('add-location', (_event, { companyId, location }) => {
  companyStore.addLocation(companyId, location);
  return { success: true };
});
// sales-company-store clear
ipcMain.handle('clear-sales-company', () => companyStore.clearCache());

/*
* ======================== 품목 관련 ==========================
* */

ipcMain.handle('get-products', () => productStore.getProducts());
ipcMain.handle('add-product', (_event, newProduct) => {
  productStore.addProduct(newProduct);
})
ipcMain.handle('fetch-and-update-products', () => productStore.fetchAndUpdateProducts());

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

ipcMain.handle('generate-and-open-pdf', async (_, printType: RevenueManageMenuType , data) => {
  return new Promise((resolve, reject) => {
    let docDefinition: TDocumentDefinitions;
    switch (printType) {
      case RevenueManageMenuType.SalesDetail:
        docDefinition = invoiceDocDef(data);
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
      case RevenueManageMenuType.ClientList:
        docDefinition = companyListDocRef(data)
        break
      default:
        throw new Error(`Unknown print type: ${printType}`);
    }

    if (!docDefinition) {
      throw new Error('Document definition is missing');
    }

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBuffer((buffer) => {
      const previewPath = path.join(app.getPath('temp'), 'preview.pdf');
      fs.writeFileSync(previewPath, buffer);

      // 시스템 기본 PDF 뷰어에서 열기
      shell.openPath(previewPath)
        .then(() => resolve(previewPath))
        .catch((error) => reject(error));
    });
  });
});