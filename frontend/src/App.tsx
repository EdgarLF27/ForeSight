import { useState } from 'react';
import { AuthPage } from './pages/auth/AuthPage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para vincular al empleado con su empresa
  const handleLinkCompany = async () => {
    if (!inviteCodeInput) return alert('Por favor, ingresa un código');
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users/link-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id_user, 
          inviteCode: inviteCodeInput 
        })
      });

      if (!response.ok) throw new Error('Código inválido');

      const updatedUser = await response.json();
      setUser(updatedUser); // Actualizamos el estado global con la nueva empresa
      alert('¡Vinculación exitosa!');
    } catch (err) {
      alert('Error: El código no existe o es incorrecto');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <AuthPage onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Hola, {user.firstName}!</h1>
        
        {/* CASO 1: Es Administrador */}
        {user.role === 'COMPANY_ADMIN' && (
          <div className="mt-6">
            <p className="text-gray-600 mb-4">Código para invitar a tus empleados:</p>
            <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-[#6B9E8A] text-2xl font-mono font-bold text-[#6B9E8A]">
              {user.company?.inviteCode}
            </div>
          </div>
        )}

        {/* CASO 2: Empleado sin empresa */}
        {(user.role === 'EMPLOYEE' || user.role === 'SUPPORT_TECH') && !user.id_company_fk && (
          <div className="mt-6 space-y-4">
            <p className="text-gray-600 text-sm">Ingresa el código de invitación de tu empresa:</p>
            <input 
              type="text"
              placeholder="FS-XXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-xl focus:ring-2 focus:ring-[#6B9E8A] outline-none"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
            />
            <button 
              disabled={loading}
              onClick={handleLinkCompany}
              className="w-full py-3 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Vinculando...' : 'Vincularme ahora'}
            </button>
          </div>
        )}

        {/* CASO 3: Ya vinculado */}
        {user.id_company_fk && (
          <div className="mt-6">
             <p className="text-gray-600">Empresa: <span className="font-semibold">{user.company?.legalName}</span></p>
             <p className="text-xs text-gray-400 mt-4 italic">El dashboard se está preparando...</p>
          </div>
        )}

        <button onClick={() => setUser(null)} className="mt-12 text-xs text-gray-400 hover:text-red-500">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default App;
