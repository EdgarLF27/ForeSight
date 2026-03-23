import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Usar variable de entorno de Vercel/Vite para el ID de Google
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "433426856774-t1e521993r6fs4ug2f3oi76o0rtia64n.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} useFedCM={true}>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
