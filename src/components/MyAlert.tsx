import {useEffect, useRef} from 'react';
import { Alert, Box, Fade } from '@mui/material';

const MyAlert = ({ open = false, onClose, message, severity }): React.JSX.Element => {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      if (alertRef.current) {
        alertRef.current.focus();
      }
    }, 80);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'fixed',
          zIndex: 2000,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ mt: 30, minWidth: 360 }}>
          <Alert severity={severity}
                 onClose={onClose}
                 tabIndex={-1}
                 ref={alertRef}>
            {message}
          </Alert>
        </Box>
      </Box>
    </Fade>
  );
}

export default MyAlert;
