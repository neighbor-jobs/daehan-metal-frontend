import MainHeader from './MainHeader.tsx';
import SubHeader from './SubHeader.tsx';
import {Box} from '@mui/material';
import {ClientManageMenuType, MenuType, PurchaseManageMenuType, RevenueManageMenuType} from '../../types/headerMenu.ts';
import {useNavigate} from 'react-router-dom';
import {useHeaderStore} from '../../stores/headerStore.ts';
import {useState} from 'react';

const Header = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { selectedType, setSelectedType, setSelectedSubType } = useHeaderStore();
  const [ subNavIdx, setSubNavIdx ] = useState(0);
  const revenueManageSubMenu = Object.entries(RevenueManageMenuType).map(([key, value]) => ({
    key, value,
  }));
  const purchaseManageSubMenu = Object.entries(PurchaseManageMenuType).map(([key, value]) => ({
    key, value,
  }));
  const clientManageSubMenu = Object.entries(ClientManageMenuType).map(([key, value]) => ({
    key, value,
  }));

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
        navigate('/purchase/daily');
        setSelectedSubType(PurchaseManageMenuType.DailyPurchase);
        break;
      case MenuType.InventoryManage:
        navigate('/item');
        break;
      case MenuType.ClientManage:
        navigate('/client/sales');
        setSelectedSubType(ClientManageMenuType.SalesManage);
        break;
      default:
        navigate('/');
    }
  };

  const handleSubNav = (subType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType) => {
    setSelectedSubType(subType);
    switch (subType) {
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
      case PurchaseManageMenuType.DailyPurchase:
        navigate('/purchase/daily');
        setSubNavIdx(0);
        break;
      case PurchaseManageMenuType.ClientPurchase:
        navigate('/purchase/client');
        setSubNavIdx(1);
        break;
      case PurchaseManageMenuType.ClientPurchaseSummary:
        navigate('/purchase/client-summary');
        setSubNavIdx(2);
        break;
      case ClientManageMenuType.SalesManage:
        navigate('/client/sales');
        setSubNavIdx(0);
        break;
      case ClientManageMenuType.SupplierManage:
        navigate('/client/supplier');
        setSubNavIdx(1);
        break;
      default:
        navigate('/');
    }
  };

  // console.log('main', selectedType, 'sub', selectedSubType);

  return (
    <Box>
      <MainHeader handleNavigate={handleMainNav}/>
      {selectedType === MenuType.RevenueManage && <SubHeader subMenu={revenueManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
      {selectedType === MenuType.PurchaseManage && <SubHeader subMenu={purchaseManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
      {selectedType === MenuType.ClientManage && <SubHeader subMenu={clientManageSubMenu} handleChange={handleSubNav} idx={subNavIdx}/>}
    </Box>
  )
}

export default Header;