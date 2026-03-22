import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

// Interceptor de consola ultra-agresivo para mantener la consola inmaculada
const silenceGoogleNoise = () => {
  const silencers = ['Cross-Origin-Opener-Policy', 'window.closed', 'gsi/client'];
  const types: Array<keyof Console> = ['error', 'warn', 'info', 'debug'];
  
  types.forEach((type) => {
    const original = console[type] as any;
    (console[type] as any) = (...args: any[]) => {
      const msg = args.join(' ');
      if (silencers.some(s => msg.includes(s))) return;
      original.apply(console, args);
    };
  });
};

silenceGoogleNoise();

const GOOGLE_CLIENT_ID = "433426856774-t1e521993r6fs4ug2f3oi76o0rtia64n.apps.googleusercontent.com"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      useFedCM={true}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
