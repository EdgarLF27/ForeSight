import { useState, useEffect } from 'react';
import { authService } from '../../../services/auth.service';

type Company = { id_company: number; legalName: string };
type Area = { id_area: number; name: string };

interface RegisterFormProps {
    onLoginClick: () => void;
}

export const RegisterForm = ({ onLoginClick }: RegisterFormProps) => {
  const [accountType, setAccountType] = useState<'ADMIN' | 'EMPLOYEE' | 'TECH'>('ADMIN');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    companyName: '', companyTaxId: '', companyAddress: '', companyPhone: '', companyEmail: '',
    companyId: '', areaId: '', experienceLevel: ''
  });

  useEffect(() => {
    if (accountType !== 'ADMIN') {
      authService.getCompanies().then(setCompanies).catch(console.error);
    }
  }, [accountType]);

  useEffect(() => {
    if (formData.companyId) {
      authService.getAreas(formData.companyId).then(setAreas).catch(console.error);
    }
  }, [formData.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let role = accountType === 'ADMIN' ? 'COMPANY_ADMIN' : (accountType === 'EMPLOYEE' ? 'EMPLOYEE' : 'SUPPORT_TECH');
    try {
      await authService.register({ ...formData, role });
      alert("¡Registro exitoso! Por favor inicia sesión.");
      onLoginClick(); // Redirigir al login
    } catch (err) {
      alert("Error en el registro");
    }
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#6B9E8A] focus:border-[#6B9E8A] outline-none transition-all placeholder:text-gray-300 text-gray-800 bg-white";

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Crear Cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Únete a ForeSight para gestionar tu soporte</p>
      </div>

      {/* Tabs de Tipo de Cuenta */}
      <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
        {[
            { id: 'ADMIN', label: 'Nueva Empresa' },
            { id: 'EMPLOYEE', label: 'Soy Empleado' },
            { id: 'TECH', label: 'Soy Técnico' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setAccountType(type.id as any)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                accountType === type.id 
                ? 'bg-white text-[#6B9E8A] shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Sección Común */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
            <input name="firstName" required className={inputClass} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
            <input name="lastName" required className={inputClass} onChange={handleChange} />
          </div>
        </div>

        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className={inputClass} onChange={handleChange} />
        </div>

        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
            <input name="password" type="password" required className={inputClass} onChange={handleChange} />
        </div>

        {/* Formulario Específico: EMPRESA */}
        {accountType === 'ADMIN' && (
           <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
             <h3 className="text-sm font-semibold text-gray-700">Datos de la Organización</h3>
             <div className="grid grid-cols-2 gap-4">
                <input name="companyName" placeholder="Razón Social" required className={inputClass} onChange={handleChange} />
                <input name="companyTaxId" placeholder="ID Fiscal (CUIT/RFC)" required className={inputClass} onChange={handleChange} />
             </div>
             <input name="companyAddress" placeholder="Dirección Fiscal" required className={inputClass} onChange={handleChange} />
             <div className="grid grid-cols-2 gap-4">
                <input name="companyPhone" placeholder="Teléfono" required className={inputClass} onChange={handleChange} />
                <input name="companyEmail" type="email" placeholder="Email Corporativo" required className={inputClass} onChange={handleChange} />
             </div>
           </div>
        )}

        {/* Formulario Específico: EMPLEADO/TÉCNICO */}
        {accountType !== 'ADMIN' && (
          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            <h3 className="text-sm font-semibold text-gray-700">Vinculación Laboral</h3>
            
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Selecciona tu Empresa</label>
                <select name="companyId" required className={inputClass} onChange={handleChange}>
                <option value="">-- Buscar Empresa --</option>
                {companies.map(c => <option key={c.id_company} value={c.id_company}>{c.legalName}</option>)}
                </select>
            </div>

            {accountType === 'EMPLOYEE' && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tu Área</label>
                    <select name="areaId" className={inputClass} onChange={handleChange}>
                        <option value="">-- Seleccionar Área --</option>
                        {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.name}</option>)}
                    </select>
                </div>
            )}

            {accountType === 'TECH' && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nivel de Experiencia</label>
                    <select name="experienceLevel" className={inputClass} onChange={handleChange}>
                        <option value="JUNIOR">Junior</option>
                        <option value="MID">Mid-Level</option>
                        <option value="SENIOR">Senior</option>
                        <option value="EXPERT">Experto</option>
                    </select>
                </div>
            )}
          </div>
        )}

        <div className="pt-4">
            <button type="submit" className="w-full py-2.5 bg-[#6B9E8A] hover:bg-[#5a8a77] text-white font-semibold rounded-md transition-colors shadow-sm">
            Registrarse
            </button>
        </div>

        <div className="text-center pt-2">
          <button 
            type="button" 
            onClick={onLoginClick}
            className="text-xs text-gray-500 hover:text-[#6B9E8A] transition-colors"
          >
            ¿Ya tienes cuenta? Inicia Sesión
          </button>
        </div>
      </form>
    </div>
  );
};