import MainHeader from './MainHeader.tsx';
import SubHeader from './SubHeader.tsx';
import {Box} from '@mui/material';
import {ClientManageMenuType, MenuType, PurchaseManageMenuType, RevenueManageMenuType} from '../../types/headerMenu.ts';
import {useNavigate} from 'react-router-dom';
import {useHeaderStore} from '../../stores/headerStore.ts';

const Header = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { selectedType, selectedSubType, setSelectedType, setSelectedSubType } = useHeaderStore();

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
    setSelectedSubType(null);
    switch (menuType) {
      case MenuType.RevenueManage:
        navigate('/revenue');
        break;
      case MenuType.PurchaseManage:
        navigate('/purchase');
        break;
      case MenuType.InventoryManage:
        navigate('/item');
        break;
      case MenuType.ClientManage:
        navigate('/client');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubNav = (subType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType) => {
    setSelectedSubType(subType);
    switch (subType) {
      case RevenueManageMenuType.DailySales:
        navigate('/revenue/daily');
        break;
      case RevenueManageMenuType.ClientSales:
        navigate('/revenue/client');
        break;
      case RevenueManageMenuType.ClientSalesSummary:
        navigate('/revenue/client-summary');
        break;
      case RevenueManageMenuType.ItemSales:
        navigate('/revenue/item');
        break;
      case RevenueManageMenuType.ItemSalesSummary:
        navigate('/revenue/item-summary');
        break;
      case RevenueManageMenuType.ClientOutstandingBalance:
        navigate('/revenue/client-outstanding');
        break;
      case PurchaseManageMenuType.DailyPurchase:
        navigate('/purchase/daily');
        break;
      case PurchaseManageMenuType.ClientPurchase:
        navigate('/purchase/client');
        break;
      case PurchaseManageMenuType.ItemPurchase:
        navigate('/purchase/item');
        break;
      case ClientManageMenuType.SalesManage:
        navigate('/client/sales');
        break;
      case ClientManageMenuType.SupplierManage:
        navigate('/client/supplier');
        break;
      default:
        navigate('/');
    }
  };

  console.log('main', selectedType, 'sub', selectedSubType);

  return (
    <Box>
      <MainHeader handleNavigate={handleMainNav}/>
      {selectedType === MenuType.RevenueManage && <SubHeader subMenu={revenueManageSubMenu} handleChange={handleSubNav} />}
      {selectedType === MenuType.PurchaseManage && <SubHeader subMenu={purchaseManageSubMenu} handleChange={handleSubNav} />}
      {selectedType === MenuType.ClientManage && <SubHeader subMenu={clientManageSubMenu} handleChange={handleSubNav} />}
    </Box>
  )
}

export default Header;