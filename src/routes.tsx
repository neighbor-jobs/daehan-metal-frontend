import { createHashRouter } from 'react-router-dom';
import {lazy} from 'react';
import MainLayout from './layout/MainLayout.tsx';
import RevenueMain from './pages/revenue-manage/RevenueMain.tsx';
import Home from './pages/Home.tsx';
import SalesCompany from './pages/company-manage/SalesCompany.tsx';
import ProductMain from './pages/product-manage/ProductMain.tsx';
import PurchaseMain from './pages/purchase-manage/PurchaseMain.tsx';
import PurchaseCompany from './pages/company-manage/PurchaseCompany.tsx';
import EmployeeManagement from './pages/accounting-manage/EmployeeManagement.tsx';
import PayrollLedger from './pages/accounting-manage/PayrollLedger.tsx';
import NewPayrollLedger from './pages/accounting-manage/NewPayrollLedger.tsx';

// lazy
const DailySales = lazy(() => import('./pages/revenue-manage/DailySales'));
const ClientSales = lazy(() => import('./pages/revenue-manage/ClientSales'));
const ClientSalesSummary = lazy(() => import('./pages/revenue-manage/ClientSalesSummary'));
const ItemSales = lazy(() => import('./pages/revenue-manage/ItemSales'));
const ItemSalesSummary = lazy(() => import('./pages/revenue-manage/ItemSalesSummary'));
const ClientOutstandingBalance = lazy(() => import('./pages/revenue-manage/ClientOutstandingBalance'));
const MonthlyPurchase = lazy(() => import('./pages/purchase-manage/MonthlyPurchase'));

const routes = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: 'revenue',
        children: [
          {
            index: true,
            element: <RevenueMain />
          },
          {
            path: 'daily',
            element: <DailySales />
          },
          {
            path: 'client',
            element: <ClientSales />
          },
          {
            path: 'client-summary',
            element: <ClientSalesSummary />
          },
          {
            path: 'item',
            element: <ItemSales />
          },
          {
            path: 'item-summary',
            element: <ItemSalesSummary />
          },
          {
            path: 'client-outstanding',
            element: <ClientOutstandingBalance />
          },
        ]
      },
      {
        path: 'purchase',
        children: [
          {
            index: true,
            element: <PurchaseMain />
          },
          /*{
            path: 'daily',
            element: <DailyPurchase />
          },*/
          {
            path: 'monthly',
            element: <MonthlyPurchase />
          },
          /*{
            path: 'client',
            element: <ClientPurchases />
          },
          {
            path: 'client-summary',
            element: <ClientPurchasesSummary />
          }*/
        ]
      },
      {
        path: 'item',
        element: <ProductMain />
      },
      {
        path: 'client',
        children: [
          {
            path: 'sales',
            element: <SalesCompany />
          },
          {
            path: 'purchase',
            element: <PurchaseCompany />
          }
        ]
      },
      {
        path: 'account',
        children: [
          {
            path: 'payroll',
            element: <PayrollLedger />
          },
          {
            path: 'payroll-new',
            element: <NewPayrollLedger />
          },
          {
            path: 'employee',
            element: <EmployeeManagement />
          }
        ]
      }

    ]
  }
]);

export default routes;