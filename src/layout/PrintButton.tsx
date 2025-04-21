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

  // TODO: selectedSubType이 null이면 경로에 따라 변수 재정의하고 넘겨주기
  // console.log('print type: ', selectedSubType);

  // handler
  const handlePrint = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('generate-and-open-pdf', selectedSubType, printData);
    }
  }

  return (
    <Box
      sx={{
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