import {app, BrowserWindow, ipcMain, shell} from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store';
import pdfMake from 'pdfmake/build/pdfmake';
import {readFileSync} from 'fs';
import * as fs from 'node:fs';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {companySalesSumDocDef} from './templetes.ts';
import {RevenueManageMenuType} from '../src/types/headerMenu.ts';

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = new Store();

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
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const fontPath = path.join(process.env.APP_ROOT, 'electron/fonts');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST


let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    // icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
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

app.whenReady().then(createWindow)

// 데이터 가져오기
ipcMain.handle('get-store', (_, key) => {
  return store.get(key);
});

// 데이터 저장하기
ipcMain.handle('set-store', (_, key, value) => {
  store.set(key, value);
});

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
      case '거래처별 매출집계':
        docDefinition = companySalesSumDocDef('주식회사 성진금속', new Date(0), data);
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