import {Box, Button} from '@mui/material';
import {useHeaderStore} from '../stores/headerStore.ts';

interface FooterProps {
  printData: any,
  companyName?: string,
  startAt?: string,
  endAt?: string,
  value?: string,
}

const PrintButton = ({printData, value}: FooterProps): React.JSX.Element => {
  const {selectedSubType} = useHeaderStore();
  console.log(printData);

  // handler
  const handlePrint = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('generate-and-open-pdf', selectedSubType, printData);
    }
  }

  return (
    <Box
      sx={{
        /*position: 'fixed',
        width: '100%',
        bottom: 16,
        right: 16,
        display: 'flex',
        justifyContent: 'flex-end',*/
        position: 'relative', // fixed 제거하여 테이블과 독립적으로 배치
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 1, // 버튼을 테이블과 분리할 여백 추가
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