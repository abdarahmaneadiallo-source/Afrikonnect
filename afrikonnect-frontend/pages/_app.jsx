// ===== PAGES/_APP.JSX =====
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '../lib/store';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C2620',
            color: '#EFF5F2',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#1D9E75', secondary: '#0B100E' } },
          error:   { iconTheme: { primary: '#D85A30', secondary: '#0B100E' } },
        }}
      />
    </>
  );
}
