import { createBrowserRouter } from 'react-router-dom';
import DailySales from './pages/revenue-manage/DailySales.tsx';
import ClientSales from './pages/revenue-manage/ClientSales.tsx';
import ClientSalesSummary from './pages/revenue-manage/ClientSalesSummary.tsx';
import ItemSales from './pages/revenue-manage/ItemSales.tsx';
import ItemSalesSummary from './pages/revenue-manage/ItemSalesSummary.tsx';
import ClientOutstandingBalance from './pages/revenue-manage/ClientOutstandingBalance.tsx';
import MainLayout from './layout/MainLayout.tsx';
import RevenueMain from './pages/revenue-manage/RevenueMain.tsx';
import Home from './pages/Home.tsx';

const routes = createBrowserRouter([
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
            path: 'daily/',
            element: <DailySales />
          },
          {
            path: 'client/',
            element: <ClientSales />
          },
          {
            path: 'client-summary/',
            element: <ClientSalesSummary />
          },
          {
            path: 'item/',
            element: <ItemSales />
          },
          {
            path: 'item-summary/',
            element: <ItemSalesSummary />
          },
          {
            path: 'client-outstanding/',
            element: <ClientOutstandingBalance />
          },
        ]
      },
      {
        path: 'purchase',
        element: <div>매입관리</div>,
      },
      {
        path: 'item',
        element: <div>품목관리</div>,
      },
      {
        path: 'client',
        element: <div>거래처관리</div>,
      }
    ]
  }
]);

export default routes;