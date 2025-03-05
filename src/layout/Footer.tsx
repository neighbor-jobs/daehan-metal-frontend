import {Box, Button} from '@mui/material';
import {useHeaderStore} from '../stores/headerStore.ts';

interface FooterProps {
  printData: any,
}

const Footer = ({printData}: FooterProps): React.JSX.Element => {
  const {selectedSubType} = useHeaderStore();

  // handler
  const handlePrint = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke('generate-and-open-pdf',selectedSubType, printData);
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Button
        variant="contained"
        onClick={handlePrint}
      >
        출력
      </Button>
    </Box>
  )
}

export default Footer;