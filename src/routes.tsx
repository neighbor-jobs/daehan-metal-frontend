import { createHashRouter } from 'react-router-dom';
import DailySales from './pages/revenue-manage/DailySales.tsx';
import ClientSales from './pages/revenue-manage/ClientSales.tsx';
import ClientSalesSummary from './pages/revenue-manage/ClientSalesSummary.tsx';
import ItemSales from './pages/revenue-manage/ItemSales.tsx';
import ItemSalesSummary from './pages/revenue-manage/ItemSalesSummary.tsx';
import ClientOutstandingBalance from './pages/revenue-manage/ClientOutstandingBalance.tsx';
import MainLayout from './layout/MainLayout.tsx';
import RevenueMain from './pages/revenue-manage/RevenueMain.tsx';
import Home from './pages/Home.tsx';
import SalesCompany from './pages/company-manage/SalesCompany.tsx';
import ProductMain from './pages/product-manage/ProductMain.tsx';
import DailyPurchase from './pages/purchase-manage/DailyPurchase.tsx';
import PurchaseMain from './pages/purchase-manage/PurchaseMain.tsx';
import PurchaseCompany from './pages/company-manage/PurchaseCompany.tsx';

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
          {
            path: 'daily',
            element: <DailyPurchase />
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
      }
    ]
  }
]);

export default routes;