import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill para ambiente Vite/Vercel
// O navegador não possui 'process.env' nativamente, e o Vite exige o prefixo VITE_
// Isso garante que o código consiga ler a chave corretamente.
// @ts-ignore
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  // @ts-ignore
  window.process = { env: {} };
}

// @ts-ignore
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
  // @ts-ignore
  if (window.process) {
     // @ts-ignore
     window.process.env.API_KEY = import.meta.env.VITE_API_KEY;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);