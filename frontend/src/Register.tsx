import { useState, useEffect } from 'react';

// Tipos básicos para evitar errores de TS
type Company = { id: number; legalName: string };
type Area = { id: number; name: string };

export default function Register() {
  const [accountType, setAccountType] = useState<'ADMIN' | 'EMPLOYEE' | 'TECH'>('ADMIN');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  
  // Estado del formulario unificado
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    companyName: '', companyTaxId: '', companyAddress: '', companyPhone: '', companyEmail: '',
    companyId: '', areaId: '', experienceLevel: ''
  });

  // Cargar empresas al iniciar si es empleado/técnico
  useEffect(() => {
    if (accountType !== 'ADMIN') {
        fetch('http://localhost:3000/users/companies')
            .then(res => res.json())
            .then(data => setCompanies(data))
            .catch(err => console.error("Error cargando empresas", err));
    }
  }, [accountType]);

  // Cargar áreas cuando se selecciona empresa
  useEffect(() => {
    if (formData.companyId) {
        fetch(`http://localhost:3000/users/companies/${formData.companyId}/areas`)
            .then(res => res.json())
            .then(data => setAreas(data))
            .catch(console.error);
    }
  }, [formData.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapear accountType al enum del backend
    let role = 'COMPANY_ADMIN';
    if (accountType === 'EMPLOYEE') role = 'EMPLOYEE';
    if (accountType === 'TECH') role = 'SUPPORT_TECH';

    const payload = { ...formData, role };

    const response = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        alert("¡Registro exitoso!");
    } else {
        alert("Error en el registro");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-slate-800 p-8 rounded-xl border border-slate-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Crear cuenta en ForeSight
          </h2>
        </div>

        {/* SELECTOR DE TIPO DE CUENTA */}
        <div className="flex justify-center space-x-4 mb-8">
            <button 
                onClick={() => setAccountType('ADMIN')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${accountType === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
                Nueva Empresa
            </button>
            <button 
                onClick={() => setAccountType('EMPLOYEE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${accountType === 'EMPLOYEE' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
                Empleado
            </button>
            <button 
                onClick={() => setAccountType('TECH')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${accountType === 'TECH' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
                Técnico
            </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* SECCIÓN DATOS PERSONALES (COMÚN) */}
          <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-slate-600 pb-2">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" placeholder="Nombre" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                  <input name="lastName" placeholder="Apellido" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                  <input name="email" type="email" placeholder="Email" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                  <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                  <input name="phone" placeholder="Teléfono" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" />
              </div>
          </div>

          {/* SECCIÓN EMPRESA (CONDICIONAL) */}
          {accountType === 'ADMIN' ? (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-slate-600 pb-2">Datos de la Empresa</h3>
                  <div className="grid grid-cols-1 gap-4">
                      <input name="companyName" placeholder="Razón Social" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                      <input name="companyTaxId" placeholder="CUIT / RFC" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                      <input name="companyAddress" placeholder="Dirección" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                      <input name="companyPhone" placeholder="Teléfono Empresa" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                      <input name="companyEmail" placeholder="Email Corporativo" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required />
                  </div>
              </div>
          ) : (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-slate-600 pb-2">Vinculación</h3>
                  <select name="companyId" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600" required>
                      <option value="">Seleccione su Empresa...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                  </select>

                  {/* EMPLEADO: ÁREA */}
                  {accountType === 'EMPLOYEE' && (
                       <select name="areaId" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600">
                          <option value="">Seleccione su Área...</option>
                          {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                       </select>
                  )}

                  {/* TÉCNICO: EXPERIENCIA */}
                  {accountType === 'TECH' && (
                       <select name="experienceLevel" onChange={handleChange} className="bg-slate-700 text-white rounded p-2 w-full border border-slate-600">
                          <option value="">Nivel de Experiencia...</option>
                          <option value="JUNIOR">Junior</option>
                          <option value="MID">Mid / Semi-Senior</option>
                          <option value="SENIOR">Senior</option>
                          <option value="EXPERT">Experto</option>
                       </select>
                  )}
              </div>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Registrar Cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
