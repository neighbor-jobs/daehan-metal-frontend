import {Box, Button} from '@mui/material';
import {useHeaderStore} from '../stores/headerStore.ts';
import {useLocation} from 'react-router-dom';
import {useEffect} from 'react';

interface FooterProps {
  printData: any,
  companyName?: string,
  propType?: string,
  startAt?: string,
  endAt?: string,
  value?: string,
}

const PrintButton = ({printData, value, propType}: FooterProps): React.JSX.Element => {
  const {selectedSubType, setHeaderByPath} = useHeaderStore();
  const type = propType ? propType : selectedSubType;
  const location = useLocation();

  useEffect(() => {
    if (!selectedSubType) {
      setHeaderByPath(location.pathname);
    }
  }, [location.pathname, selectedSubType, setHeaderByPath]);

  // handler
  const handlePrint = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('generate-and-open-pdf', type, printData);
    }
  }

  return (
    <Box
      sx={{
        position: 'relative', // fixed 제거하여 테이블과 독립적으로 배치
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        whiteSpace: 'nowrap',
      }}
    >
      <Button
        variant="contained"
        onClick={handlePrint}
      >
        {value ? value : '출력'}
      </Button>
    </Box>
  )
}

export default PrintButton;