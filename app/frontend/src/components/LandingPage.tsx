import { 
  Ticket, 
  CheckCircle, 
  Users, 
  Shield, 
  Zap, 
  LayoutDashboard,
  ArrowRight,
  Menu,
  X,
  Plus,
  Minus,
  Star,
  Globe,
  Lock,
  MessageSquare,
  Quote,
  Activity,
  MousePointer2,
  Sparkles,
  Command,
  Monitor,
  Smartphone,
  Cpu,
  Layers,
  Calendar,
  Video,
  Bell,
  Building2,
  GitBranch,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { scrollY } = useScroll();
  
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-600 selection:text-white scroll-smooth overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        style={{ backgroundColor: navBackground }}
        className="fixed w-full z-[100] transition-all backdrop-blur-xl border-b border-transparent data-[scrolled=true]:border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-slate-950 rounded-[18px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                <Ticket className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                Fore<span className="text-blue-600">Sight</span>
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-12">
              <div className="flex items-center gap-10">
                {['Características', 'Gestión', 'Precios', 'FAQ'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`} 
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-all hover:-translate-y-0.5"
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <Button 
                onClick={onNavigateToAuth}
                className="bg-slate-950 hover:bg-blue-600 text-white rounded-2xl px-10 h-14 text-xs font-black uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 border-b-4 border-slate-800"
              >
                Acceder al Portal
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition-all active:scale-90"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col gap-6 p-8">
                {['Características', 'Gestión', 'Precios', 'FAQ'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`} 
                    className="text-2xl font-black uppercase tracking-tighter text-slate-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <Button onClick={onNavigateToAuth} className="w-full bg-blue-600 py-8 text-lg font-black uppercase rounded-3xl shadow-xl shadow-blue-500/20">
                  Iniciar Sesión
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[160px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100 rounded-full blur-[160px] opacity-40 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border-2 border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-[0.25em] mb-12 shadow-2xl shadow-slate-200/50"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              Gestión de Incidencias v2.4
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[12vw] lg:text-[100px] font-black tracking-[-0.05em] leading-[0.85] text-slate-950 mb-10 uppercase italic"
            >
              Control total de tu <span className="text-blue-600 not-italic">Soporte</span><br />
              <span className="relative">
                Técnico
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 h-4 bg-blue-600/10 -z-10" 
                />
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl text-slate-500 mb-16 max-w-2xl leading-relaxed font-medium"
            >
              La herramienta integral para <span className="text-slate-900 font-black uppercase italic tracking-tighter">Empresas Modernas</span> que centraliza tickets, agenda y notificaciones.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 mb-24"
            >
              <Button 
                onClick={onNavigateToAuth}
                className="w-full sm:w-auto text-sm h-16 px-14 rounded-[22px] bg-blue-600 hover:bg-blue-700 text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] transition-all hover:scale-105 font-black uppercase tracking-widest border-b-4 border-blue-800"
              >
                Comenzar Ahora
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto text-sm h-16 px-14 rounded-[22px] border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest transition-all hover:border-slate-300"
              >
                Ver Demo Interactiva
              </Button>
            </motion.div>

            {/* Dashboard Preview Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full max-w-6xl mx-auto group lg:perspective-1000"
            >
              <div className="relative bg-slate-950 rounded-[2rem] lg:rounded-[3rem] p-1.5 lg:p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] border border-slate-800 transition-transform group-hover:scale-[1.01] duration-700">
                <div className="absolute -top-6 lg:-top-10 left-6 lg:left-10 flex gap-1.5 lg:gap-2">
                  <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-red-500" />
                  <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-amber-500" />
                  <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full bg-green-500" />
                </div>
                
                <div className="bg-[#fcfcfc] rounded-[1.8rem] lg:rounded-[2.5rem] overflow-hidden border border-slate-200">
                  <div className="flex h-[400px] lg:h-[700px]">
                    {/* Mock Sidebar */}
                    <div className="hidden lg:flex w-24 bg-slate-950 flex-col items-center py-10 gap-10">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                        <Ticket size={24} />
                      </div>
                      <div className="flex flex-col gap-8 opacity-40">
                        <LayoutDashboard size={24} className="text-white" />
                        <Users size={24} className="text-white" />
                        <Activity size={24} className="text-white" />
                        <Calendar size={24} className="text-white" />
                        <Bell size={24} className="text-white" />
                      </div>
                    </div>
                    {/* Mock Content */}
                    <div className="flex-1 p-6 lg:p-10 flex flex-col gap-6 lg:gap-10">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1.5 lg:space-y-2 text-left">
                            <div className="h-3 lg:h-4 w-24 lg:w-32 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-8 lg:h-10 w-48 lg:w-64 bg-slate-900 rounded-xl lg:rounded-2xl animate-pulse" />
                          </div>
                          <div className="h-10 lg:h-14 w-32 lg:w-48 bg-blue-600 rounded-xl lg:rounded-2xl shadow-xl shadow-blue-500/20" />
                       </div>
                       
                       <div className="grid grid-cols-3 gap-3 lg:gap-6">
                          <div className="h-24 lg:h-32 bg-white rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 lg:p-6">
                            <div className="h-2 lg:h-3 w-12 lg:w-16 bg-slate-100 rounded-full mb-3 lg:mb-4" />
                            <div className="h-6 lg:h-8 w-16 lg:w-24 bg-slate-900 rounded-lg lg:rounded-xl" />
                          </div>
                          <div className="h-24 lg:h-32 bg-white rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 lg:p-6">
                            <div className="h-2 lg:h-3 w-12 lg:w-16 bg-slate-100 rounded-full mb-3 lg:mb-4" />
                            <div className="h-6 lg:h-8 w-16 lg:w-24 bg-slate-900 rounded-lg lg:rounded-xl" />
                          </div>
                          <div className="h-24 lg:h-32 bg-white rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-4 lg:p-6">
                            <div className="h-2 lg:h-3 w-12 lg:w-16 bg-slate-100 rounded-full mb-3 lg:mb-4" />
                            <div className="h-6 lg:h-8 w-16 lg:w-24 bg-slate-900 rounded-lg lg:rounded-xl" />
                          </div>
                       </div>

                       <div className="flex-1 bg-white rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 lg:p-10 text-left overflow-hidden">
                          <div className="space-y-4 lg:space-y-6">
                             {[1, 2, 3].map(i => (
                               <div key={i} className="flex items-center justify-between pb-4 lg:pb-6 border-b border-slate-50 last:border-0">
                                  <div className="flex items-center gap-3 lg:gap-4">
                                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-slate-100 rounded-xl lg:rounded-2xl" />
                                    <div className="space-y-1.5 lg:space-y-2">
                                      <div className="h-3 lg:h-4 w-32 lg:w-48 bg-slate-900 rounded-md lg:rounded-lg" />
                                      <div className="h-2 lg:h-3 w-16 lg:w-24 bg-slate-300 rounded-md lg:rounded-lg" />
                                    </div>
                                  </div>
                                  <div className="h-6 lg:h-8 w-16 lg:w-24 bg-slate-100 rounded-full" />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-UI elements - Hidden on mobile */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -right-16 top-1/4 bg-white p-6 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 hidden xl:block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Tickets</p>
                      <p className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Resueltos 94%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -left-16 bottom-1/4 bg-white p-6 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 hidden xl:block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <Bell size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notificaciones</p>
                      <p className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Alerta en Vivo</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Realistic System Stats */}
      <section className="py-24 border-y border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
            <StatItem label="Eficiencia" value="94%" sub="Resolución" />
            <StatItem label="Roles Activos" value="03" sub="Jerárquicos" />
            <StatItem label="Seguridad" value="SSL" sub="AES-256" />
            <StatItem label="Soporte" value="24/7" sub="Continuo" />
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="caracteristicas" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-24">
            <div className="max-w-2xl">
              <Badge className="bg-blue-600 text-white border-none rounded-lg px-4 py-1.5 font-black uppercase tracking-widest text-[10px] mb-6 shadow-lg shadow-blue-500/20">
                Funcionalidades
              </Badge>
              <h2 className="text-6xl lg:text-7xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-8">
                Diseñado para <span className="text-blue-600 not-italic">Operar</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium">
                Todo lo que necesitas para gestionar incidencias técnicas en un solo ecosistema integrado.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <SolutionCard 
              icon={<Ticket className="h-8 w-8 text-blue-600" />}
              title="Sistema de Tickets"
              description="Crea incidencias con niveles de prioridad (Baja, Media, Alta, Urgente) y categorías personalizadas."
            />
            <SolutionCard 
              icon={<Calendar className="h-8 w-8 text-indigo-600" />}
              title="Agenda Técnica"
              description="Agenda reuniones para resolver incidencias con estados de propuesta, aceptación y rechazo."
            />
            <SolutionCard 
              icon={<Video className="h-8 w-8 text-blue-600" />}
              title="Videollamadas"
              description="Comunicación directa por video para resolver problemas técnicos complejos en tiempo real."
            />
            <SolutionCard 
              icon={<Building2 className="h-8 w-8 text-indigo-600" />}
              title="Estructura de Áreas"
              description="Organiza tu empresa en departamentos técnicos especializados para una mejor gestión."
            />
            <SolutionCard 
              icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
              title="Comentarios en Vivo"
              description="Hilo de comunicación directa dentro de cada ticket para seguimiento detallado."
            />
            <SolutionCard 
              icon={<Bell className="h-8 w-8 text-indigo-600" />}
              title="Notificaciones Reales"
              description="Sistema de alertas en tiempo real para cambios de estado, asignaciones y menciones."
            />
          </div>
        </div>
      </section>

      {/* Advanced Management Section */}
      <section id="gestion" className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div>
              <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-12">
                Gestión<br />
                <span className="text-blue-500 not-italic">Jerárquica</span>
              </h2>
              <div className="space-y-16">
                <FeatureItem 
                  title="Roles y Permisos"
                  desc="Define accesos específicos para Administradores, Técnicos y Empleados con total control."
                />
                <FeatureItem 
                  title="Código de Invitación"
                  desc="Vincula nuevos miembros a tu empresa de forma segura mediante un código único de 6 caracteres."
                />
                <FeatureItem 
                  title="Historial de Actividad"
                  desc="Registro completo de cada cambio realizado en los tickets: quién, cuándo y qué se modificó."
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-gradient-to-tr from-blue-600 to-indigo-900 p-[2px] shadow-[0_100px_100px_-50px_rgba(0,0,0,1)]">
                <div className="w-full h-full bg-slate-950 rounded-[4rem] overflow-hidden flex items-center justify-center relative p-12">
                  <div className="grid grid-cols-2 gap-6 w-full relative">
                    <div className="h-48 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center gap-4 group hover:bg-blue-500/20 transition-colors">
                      <Shield size={48} className="text-blue-500" />
                      <span className="font-black uppercase italic tracking-widest text-[10px]">Admin Center</span>
                    </div>
                    <div className="h-48 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 translate-y-12">
                      <Activity size={48} className="text-slate-400" />
                      <span className="font-black uppercase italic tracking-widest text-[10px]">Técnico Desk</span>
                    </div>
                    <div className="h-48 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4">
                      <Users size={48} className="text-slate-400" />
                      <span className="font-black uppercase italic tracking-widest text-[10px]">Portal Empleado</span>
                    </div>
                    <div className="h-48 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center gap-4 translate-y-12 group hover:bg-blue-500/20 transition-colors">
                      <Key size={48} className="text-blue-500" />
                      <span className="font-black uppercase italic tracking-widest text-[10px]">Auth Seguro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Adapted to system */}
      <section id="precios" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black text-slate-950 uppercase italic tracking-tighter mb-6">Planes de Despliegue</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">
              Escalabilidad real para cualquier tamaño de infraestructura técnica.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <PricingCard 
              title="Plan Startup"
              price="0"
              desc="Perfecto para pequeñas empresas que inician su orden técnico."
              features={['1 Área', 'Tickets Ilimitados', 'Agenda Básica', 'Roles del Sistema']}
            />
            <PricingCard 
              title="Plan Enterprise"
              price="65"
              desc="Potencia total para empresas con múltiples departamentos."
              features={['Áreas Ilimitadas', 'Videollamadas HD', 'Notificaciones Push', 'Historial Completo', 'Roles Personalizados']}
              highlighted={true}
            />
            <PricingCard 
              title="Plan Corporativo"
              price="Custom"
              desc="Control masivo para grandes corporaciones globales."
              features={['SLA de Soporte', 'API Integrada', 'Auditoría SSO', 'Base de Datos Dedicada']}
            />
          </div>
        </div>
      </section>

      {/* FAQ - System Specific */}
      <section id="faq" className="py-40 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-black text-center text-slate-950 uppercase italic tracking-tighter mb-20">Protocolo & FAQ</h2>
          <div className="space-y-6">
            <FaqItem 
              index={0}
              question="¿Cómo funciona el código de invitación?"
              answer="Cada empresa genera un código único. Los empleados ingresan este código al registrarse para ser vinculados automáticamente a la organización y sus áreas."
              activeFaq={activeFaq}
              setActiveFaq={setActiveFaq}
            />
            <FaqItem 
              index={1}
              question="¿Puedo asignar tickets a áreas específicas?"
              answer="Sí, al crear un ticket puedes seleccionar el área técnica correspondiente (IT, Hardware, Redes, etc.) para que los técnicos asignados lo gestionen."
              activeFaq={activeFaq}
              setActiveFaq={setActiveFaq}
            />
            <FaqItem 
              index={2}
              question="¿Qué tipos de roles existen en ForeSight?"
              answer="El sistema maneja tres niveles principales: Administradores (control total), Técnicos (gestión y resolución) y Empleados (reporte y seguimiento)."
              activeFaq={activeFaq}
              setActiveFaq={setActiveFaq}
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-slate-950 rounded-[4rem] p-16 lg:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl lg:text-[100px] font-black uppercase italic tracking-tighter leading-[0.85] mb-12">
              Ordena tu<br />
              <span className="text-blue-500 not-italic">Soporte</span>
            </h2>
            <p className="text-slate-400 text-xl lg:text-2xl mb-16 max-w-2xl mx-auto font-medium">
              Únete a las empresas que ya optimizaron su flujo técnico con ForeSight.
            </p>
            <Button 
              onClick={onNavigateToAuth}
              className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white h-24 px-16 rounded-[30px] text-2xl font-black uppercase italic tracking-tighter shadow-3xl shadow-blue-500/20 transition-all hover:scale-110 active:scale-95"
            >
              Comenzar Gratis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-slate-500 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-20 font-black uppercase tracking-[0.4em] text-[9px]">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <Ticket size={16} strokeWidth={3} />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">ForeSight</span>
            </div>
            <p>© 2024 ForeSight Systems v2.4.0. All Rights Reserved.</p>
            <div className="flex gap-12">
              <span className="text-blue-500">Status: Stable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components

function StatItem({ label, value, sub }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-2"
    >
      <div className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter italic uppercase">{value}</div>
      <div className="space-y-1">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600 italic">{sub}</div>
      </div>
    </motion.div>
  );
}

function SolutionCard({ icon, title, description }: any) {
  return (
    <motion.div 
      whileHover={{ y: -15 }}
      className="group p-12 rounded-[3rem] bg-white border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_60px_100px_-20px_rgba(37,99,235,0.15)] transition-all duration-500"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter mb-6">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed italic">{description}</p>
    </motion.div>
  );
}

function FeatureItem({ title, desc }: any) {
  return (
    <div className="flex gap-8 group">
      <div className="mt-2 w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_20px_5px_rgba(37,99,235,0.4)]" />
      <div>
        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 group-hover:text-blue-500 transition-colors">{title}</h4>
        <p className="text-slate-400 font-medium leading-relaxed italic">{desc}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, desc, features, highlighted = false }: any) {
  return (
    <div className={`p-12 rounded-[4rem] flex flex-col transition-all duration-500 ${
      highlighted 
        ? 'bg-slate-950 text-white scale-105 shadow-[0_80px_100px_-30px_rgba(0,0,0,0.5)] border border-slate-800' 
        : 'bg-[#fcfcfc] border-2 border-slate-100 hover:border-blue-600/20 text-slate-900'
    }`}>
      <div className="mb-10 flex justify-between items-start">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{title}</h3>
        {highlighted && <Badge className="bg-blue-600 text-[9px] font-black uppercase italic tracking-widest border-none px-3 py-1">Recomendado</Badge>}
      </div>
      
      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-7xl font-black tracking-tighter italic uppercase">
          {price !== 'Custom' && <span className="text-4xl not-italic mr-1">$</span>}
          {price}
        </span>
        {price !== 'Custom' && <span className={`text-xs font-black uppercase tracking-widest ${highlighted ? 'text-slate-500' : 'text-slate-400'}`}>/mes</span>}
      </div>

      <p className={`text-lg font-medium leading-relaxed mb-12 italic ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
        {desc}
      </p>

      <div className="space-y-6 mb-12">
        {features.map((f: string) => (
          <div key={f} className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${highlighted ? 'bg-blue-600/20 text-blue-500' : 'bg-slate-100 text-slate-900'}`}>
              <CheckCircle size={14} strokeWidth={3} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest leading-none">{f}</span>
          </div>
        ))}
      </div>

      <Button className={`mt-auto h-20 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] transition-all italic ${
        highlighted 
          ? 'bg-blue-600 hover:bg-white hover:text-blue-600 text-white shadow-xl shadow-blue-500/20 border-b-4 border-blue-800' 
          : 'bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-900'
      }`}>
        Elegir {title}
      </Button>
    </div>
  );
}

function FaqItem({ index, question, answer, activeFaq, setActiveFaq }: any) {
  const isOpen = activeFaq === index;
  return (
    <div className={`rounded-[2rem] overflow-hidden transition-all duration-500 border-2 ${isOpen ? 'border-blue-600/20 bg-slate-50' : 'border-slate-100 bg-white'}`}>
      <button 
        onClick={() => setActiveFaq(isOpen ? null : index)}
        className="w-full p-10 text-left flex justify-between items-center transition-colors"
      >
        <span className="text-xl lg:text-2xl font-black text-slate-950 uppercase italic tracking-tighter">{question}</span>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-900'}`}>
          {isOpen ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-10 pt-0 text-lg text-slate-500 font-medium leading-relaxed italic">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
