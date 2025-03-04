import ReactDOM from 'react-dom/client'
import './index.css'
import {CssBaseline, ThemeProvider} from '@mui/material';
import {RouterProvider} from 'react-router-dom';
import routes from './routes.tsx';
import theme from './theme.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <CssBaseline>
    <ThemeProvider theme={theme}>
      <RouterProvider router={routes} />
    </ThemeProvider>
  </CssBaseline>
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
})
