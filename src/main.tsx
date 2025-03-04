import ReactDOM from 'react-dom/client'
import './index.css'
import {CssBaseline} from '@mui/material';
import {RouterProvider} from 'react-router-dom';
import routes from './routes.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <CssBaseline>
    <RouterProvider router={routes} />
  </CssBaseline>
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
})
