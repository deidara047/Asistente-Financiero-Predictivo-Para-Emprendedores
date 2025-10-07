import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { Provider } from 'react-redux';
import './index.css'
import App from './App.tsx'
import store from './store';

// Crear la instancia de head
const head = createHead()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <UnheadProvider head={head}>
        <App />
      </UnheadProvider>
    </Provider>
  </StrictMode>,
)
