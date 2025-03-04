import {Box, Tab, Tabs} from '@mui/material';
import {useState} from 'react';
import {ClientManageMenuType, PurchaseManageMenuType, RevenueManageMenuType} from '../../types/headerMenu.ts';

interface SubHeaderProps {
  subMenu: { key: string, value: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType }[]
  handleChange: (subType: RevenueManageMenuType | PurchaseManageMenuType | ClientManageMenuType) => void
}

const SubHeader = ({subMenu, handleChange}: SubHeaderProps): React.JSX.Element => {
  const [value, setValue] = useState<number | boolean>(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    handleChange(subMenu[newValue].value);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs"
      >
        {subMenu.map((item, index) => (
          <Tab
            label={item.value}
            key={index}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default SubHeader;