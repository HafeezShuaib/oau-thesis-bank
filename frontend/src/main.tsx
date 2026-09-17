import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './components/shared';
import { AuthProvider } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <UploadProvider>
          <App />
        </UploadProvider>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);
