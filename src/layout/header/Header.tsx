import MainHeader from './MainHeader.tsx';
import SubHeader from './SubHeader.tsx';
import {Box} from '@mui/material';
import {
  AccountingManageMenuType,
  ClientManageMenuType,
  MenuType,
  PurchaseManageMenuType,
  RevenueManageMenuType
} from '../../types/headerMenu.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import {useHeaderStore} from '../../stores/headerStore.ts';
import {useEffect, useState} from 'react';

const Header = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const {selectedType, setSelectedType, setSelectedSubType} = useHeaderStore();
  const [subNavIdx, setSubNavIdx] = useState(0);
  const revenueManageSubMenu = Object.entries(RevenueManageMenuType).map(([key, value]) => ({
    key, value,
  }));
  const purchaseManageSubMenu = Object.entries(PurchaseManageMenuType).map(([key, value]) => ({
    key, value,
  }));
  const clientManageSubMenu = Object.entries(ClientManageMenuType).map(([key, value]) => ({
    key, value,
  }));
  const accountManageSubMenu = Object.entries(AccountingManageMenuType).map(([key, value]) => ({
    key, value,
  }))

  // handler
  const handleMainNav = (menuType: MenuType) => {
    setSelectedType(menuType);
    setSubNavIdx(0);
    switch (menuType) {
      case MenuType.RevenueManage:
        navigate('/revenue');
        setSelectedSubType(RevenueManageMenuType.SalesDetail);
        break;
      case MenuType.PurchaseManage:
        navigate('/purchase');
        setSelectedSubType(PurchaseManageMenuType.PurchaseDetail);
        break;
      case MenuType.InventoryManage:
        navigate('/item');
        break;
      case MenuType.ClientManage:
        navigate('/client/sales');
        setSelectedSubType(ClientManageMenuType.SalesManage);
        break;
      case MenuType.AccountingManage:
        navigate('/account/payroll');
        setSelectedSubType(AccountingManageMenuType.PayrollDetail);
        break;
      default:
        navigate('/');
    }
  };

  const handleSubNav = (subType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType | AccountingManageMenuType) => {
    setSelectedSubType(subType);
    switch (subType) {
      /* 매출 관리 */
      case RevenueManageMenuType.SalesDetail :
        navigate('/revenue');
        setSubNavIdx(0);
        break;
      case RevenueManageMenuType.DailySales:
        navigate('/revenue/daily');
        setSubNavIdx(1);
        break;
      case RevenueManageMenuType.ClientSales:
        navigate('/revenue/client');
        setSubNavIdx(2);
        break;
      case RevenueManageMenuType.ClientSalesSummary:
        navigate('/revenue/client-summary');
        setSubNavIdx(3);
        break;
      case RevenueManageMenuType.ItemSales:
        navigate('/revenue/item');
        setSubNavIdx(4);
        break;
      case RevenueManageMenuType.ItemSalesSummary:
        navigate('/revenue/item-summary');
        setSubNavIdx(5);
        break;
      case RevenueManageMenuType.ClientOutstandingBalance:
        navigate('/revenue/client-outstanding');
        setSubNavIdx(6);
        break;

      /* 매입 관리 */
      case PurchaseManageMenuType.PurchaseDetail:
        navigate('/purchase');
        setSubNavIdx(0);
        break;
      /*case PurchaseManageMenuType.DailyPurchase:
        navigate('/purchase/daily');
        setSubNavIdx(0);
        break;*/
      case PurchaseManageMenuType.MonthlyPurchase:
        navigate('/purchase/monthly');
        setSubNavIdx(1);
        break;

      /* 거래처 관리 */
      case ClientManageMenuType.SalesManage:
        navigate('/client/sales');
        setSubNavIdx(0);
        break;
      case ClientManageMenuType.SupplierManage:
        navigate('/client/purchase');
        setSubNavIdx(1);
        break;

      /* 회계 관리 */
      case AccountingManageMenuType.PayrollDetail:
        navigate('account/payroll');
        setSubNavIdx(0);
        break;
      case AccountingManageMenuType.PayrollRegister:
        navigate('/account/payroll-new');
        setSubNavIdx(1);
        break;
      case AccountingManageMenuType.EmployeeManage:
        navigate('/account/employee');
        setSubNavIdx(2);
        break;
      default:
        navigate('/');
    }
  };

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/revenue')) {
      setSelectedType(MenuType.RevenueManage);
      if (path === '/revenue') {
        setSelectedSubType(RevenueManageMenuType.SalesDetail);
        setSubNavIdx(0);
      } else if (path === '/revenue/daily') {
        setSelectedSubType(RevenueManageMenuType.DailySales);
        setSubNavIdx(1);
      } else if (path === '/revenue/client') {
        setSelectedSubType(RevenueManageMenuType.ClientSales);
        setSubNavIdx(2);
      } else if (path === '/revenue/client-summary') {
        setSelectedSubType(RevenueManageMenuType.ClientSalesSummary);
        setSubNavIdx(3);
      } else if (path === '/revenue/item') {
        setSelectedSubType(RevenueManageMenuType.ItemSales);
        setSubNavIdx(4);
      } else if (path === '/revenue/item-summary') {
        setSelectedSubType(RevenueManageMenuType.ItemSalesSummary);
        setSubNavIdx(5);
      } else if (path === '/revenue/client-outstanding') {
        setSelectedSubType(RevenueManageMenuType.ClientOutstandingBalance);
        setSubNavIdx(6);
      }
    } else if (path.startsWith('/purchase')) {
      setSelectedType(MenuType.PurchaseManage);
      if (path === '/purchase') {
        setSelectedSubType(PurchaseManageMenuType.PurchaseDetail);
        setSubNavIdx(0);
      } else if (path === '/purchase/monthly') {
        setSelectedSubType(PurchaseManageMenuType.MonthlyPurchase);
        setSubNavIdx(1);
      }
    } else if (path.startsWith('/client')) {
      setSelectedType(MenuType.ClientManage);
      if (path === '/client/sales') {
        setSelectedSubType(ClientManageMenuType.SalesManage);
        setSubNavIdx(0);
      } else if (path === '/client/purchase') {
        setSelectedSubType(ClientManageMenuType.SupplierManage);
        setSubNavIdx(1);
      }
    } else if (path.startsWith('/account')) {
      setSelectedType(MenuType.AccountingManage);
      if (path === '/account/payroll') {
        setSelectedSubType(AccountingManageMenuType.PayrollDetail);
        setSubNavIdx(0);
      } else if (path === '/account/payroll-new') {
        setSelectedSubType(AccountingManageMenuType.PayrollRegister);
        setSubNavIdx(1);
      } else if (path === '/account/employee') {
        setSelectedSubType(AccountingManageMenuType.EmployeeManage);
        setSubNavIdx(2);
      }
    } else {
      setSelectedType(null);
      setSelectedSubType(null);
    }
  }, [location.pathname, setSelectedType, setSelectedSubType]);

  return (
    <Box>
      <MainHeader handleNavigate={handleMainNav}/>
      {selectedType === MenuType.RevenueManage &&
        <SubHeader subMenu={revenueManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
      {selectedType === MenuType.PurchaseManage &&
        <SubHeader subMenu={purchaseManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
      {selectedType === MenuType.ClientManage &&
        <SubHeader subMenu={clientManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
      {selectedType === MenuType.AccountingManage &&
        <SubHeader subMenu={accountManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
    </Box>
  )
}

export default Header;