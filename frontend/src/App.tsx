import { useState } from 'react';
import { AuthPage } from './pages/auth/AuthPage';

function App() {
  const [user, setUser] = useState<any>(null);

  if (!user) {
    return <AuthPage onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold">Bienvenido, {user.firstName}</h1>
      <p className="text-slate-400">Rol: {user.role}</p>
      <button 
        onClick={() => setUser(null)}
        className="mt-4 bg-red-600 px-4 py-2 rounded"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

export default App;