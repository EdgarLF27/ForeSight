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
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Ticket className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                ForeSight
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              {['Características', 'Cómo funciona', 'Precios', 'FAQ'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`} 
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              ))}
              <Button 
                onClick={onNavigateToAuth}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 h-auto text-sm font-bold shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95"
              >
                Ingresar
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col gap-4 p-6">
                {['Características', 'Cómo funciona', 'Precios', 'FAQ'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`} 
                    className="text-lg font-medium text-slate-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <Button onClick={onNavigateToAuth} className="w-full bg-blue-600 py-6 text-lg rounded-xl">
                  Ingresar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-widest mb-8 border border-blue-100 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Próxima Generación de Soporte
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]"
            >
              Control total de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">infraestructura</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl lg:text-2xl text-slate-500 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              La plataforma definitiva para equipos de IT que exigen velocidad, organización y resultados medibles.
            </motion.p>

            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Button 
                onClick={onNavigateToAuth}
                className="w-full sm:w-auto text-lg h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 font-bold"
              >
                Empieza Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto text-lg h-16 px-10 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
              >
                Ver Demo Interactiva
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-40 contrast-125"
            >
              <div className="text-xl font-bold tracking-tighter">TECHCORP</div>
              <div className="text-xl font-bold tracking-tighter">GLOBOBANK</div>
              <div className="text-xl font-bold tracking-tighter">DATAFLOW</div>
              <div className="text-xl font-bold tracking-tighter">NEXUS AI</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem label="Tickets Resueltos" value="250k+" />
            <StatItem label="Empresas Activas" value="1.2k+" />
            <StatItem label="Tiempo de Respuesta" value="< 15min" />
            <StatItem label="Satisfacción" value="99.9%" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="caracteristicas" className="py-32 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Potencia tu flujo de trabajo</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
              Diseñado meticulosamente para eliminar la fricción en la gestión de incidentes técnicos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<LayoutDashboard className="h-7 w-7 text-blue-600" />}
              title="Dashboard 360°"
              description="Visibilidad total de la salud de tu sistema con métricas en tiempo real y alertas predictivas."
            />
            <FeatureCard 
              icon={<Zap className="h-7 w-7 text-amber-500" />}
              title="Smart Routing"
              description="Algoritmos inteligentes que asignan automáticamente cada ticket al técnico más capacitado."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-7 w-7 text-green-500" />}
              title="Comunicación Centralizada"
              description="Hilo de chat directo por ticket, notas internas privadas y registro completo de actividad."
            />
            <FeatureCard 
              icon={<Shield className="h-7 w-7 text-purple-500" />}
              title="Seguridad Empresarial"
              description="Autenticación de dos factores, cifrado de extremo a extremo y cumplimiento de normativas."
            />
            <FeatureCard 
              icon={<Globe className="h-7 w-7 text-pink-500" />}
              title="Acceso Multiplataforma"
              description="Gestiona tickets desde cualquier lugar con nuestra app optimizada para móviles y tablets."
            />
            <FeatureCard 
              icon={<Star className="h-7 w-7 text-teal-500" />}
              title="Análisis de Calidad"
              description="Reportes detallados de rendimiento y encuestas de satisfacción automatizadas."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight">
                Implementación en <span className="text-blue-600">segundos</span>, no días.
              </h2>
              <div className="space-y-10">
                <Step 
                  number="01" 
                  title="Registra tu empresa" 
                  description="Crea tu espacio de trabajo personalizado en menos de un minuto." 
                />
                <Step 
                  number="02" 
                  title="Configura tus áreas" 
                  description="Define los departamentos técnicos y especialidades de tu equipo." 
                />
                <Step 
                  number="03" 
                  title="Invita a tu equipo" 
                  description="Usa el código único de invitación para que tus técnicos y empleados se unan." 
                />
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="aspect-square bg-blue-600 rounded-[40px] shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center p-8 lg:p-12">
                   <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col gap-6 transform group-hover:scale-105 transition-transform duration-500">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="h-8 w-1/3 bg-white/20 rounded-lg animate-pulse" />
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-white/20 rounded-lg animate-pulse" />
                        <div className="h-4 w-5/6 bg-white/20 rounded-lg animate-pulse" />
                        <div className="h-4 w-4/6 bg-white/20 rounded-lg animate-pulse" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="h-12 bg-white/20 rounded-lg animate-pulse" />
                        <div className="h-12 bg-blue-400/40 rounded-lg animate-pulse border border-white/20" />
                      </div>
                   </div>
                </div>
                {/* Abstract shapes for extra detail */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" />
              </div>
              
              {/* Floating element */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 hidden sm:flex items-center gap-4 z-20"
              >
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                  <CheckCircle className="text-green-600 h-8 w-8" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg">¡Configuración lista!</p>
                  <p className="text-sm text-slate-500 font-medium">Tu equipo ya puede operar.</p>
                </div>
              </motion.div>

              {/* Second floating element */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 z-20"
              >
                <Users className="text-blue-600 h-5 w-5" />
                <span className="font-bold text-slate-700">12 Técnicos Online</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">Precios transparentes</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              Sin cargos ocultos. Elige el plan que mejor se adapte a tu crecimiento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter"
              price="0"
              description="Ideal para pequeñas startups y equipos personales."
              features={['Hasta 5 técnicos', 'Tickets ilimitados', 'Dashboard básico', 'Soporte vía comunidad']}
            />
            <PricingCard 
              title="Pro"
              price="49"
              description="Para empresas en crecimiento que necesitan control total."
              features={['Técnicos ilimitados', 'Smart Routing IA', 'Reportes avanzados', 'Soporte prioritario 24/7']}
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price="Custom"
              description="Soluciones personalizadas para grandes infraestructuras."
              features={['SLA Garantizado', 'API de integración', 'Entrenamiento dedicado', 'Infraestructura aislada']}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Confían en nosotros</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">
              Líderes de IT que han transformado su operación con nuestra plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="ForeSight ha reducido nuestro tiempo de resolución en un 40%. Es simplemente increíble."
              author="Carlos Rodríguez"
              role="CTO en TechCorp"
              avatar="https://i.pravatar.cc/150?u=carlos"
            />
            <TestimonialCard 
              quote="La mejor inversión que hemos hecho este año. La interfaz es intuitiva y el soporte excelente."
              author="Ana Martínez"
              role="IT Manager en DataFlow"
              avatar="https://i.pravatar.cc/150?u=ana"
            />
            <TestimonialCard 
              quote="Finalmente una herramienta que entiende las necesidades reales de un equipo de soporte."
              author="David Wilson"
              role="Lead Engineer en Nexus AI"
              avatar="https://i.pravatar.cc/150?u=david"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center text-slate-900 mb-16">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <FaqItem 
              index={0}
              question="¿Cómo funciona el código de invitación?"
              answer="Cada empresa genera un código único de 6 caracteres. Cuando un empleado nuevo se registra, simplemente ingresa este código para ser vinculado automáticamente a tu organización."
              activeFaq={activeFaq}
              setActiveFaq={setActiveFaq}
            />
            <FaqItem 
              index={1}
              question="¿Puedo cambiar de plan en cualquier momento?"
              answer="Sí, puedes escalar o reducir tu plan en cualquier momento desde los ajustes de facturación. Los cambios se prorratean automáticamente."
              activeFaq={activeFaq}
              setActiveFaq={setActiveFaq}
            />
            <FaqItem 
              index={2}
              question="¿Qué tan seguros están mis datos?"
              answer="Utilizamos cifrado de grado bancario (AES-256) para todos los datos almacenados y TLS para las transferencias. Realizamos backups diarios automatizados."
              activeFaq={activeFaq}
              setActiveFaq={setActiveFaq}
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[40px] p-12 lg:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-8 relative z-10">¿Listo para el siguiente nivel?</h2>
            <p className="text-blue-100 text-xl lg:text-2xl mb-12 max-w-2xl mx-auto relative z-10">
              Únete a las empresas líderes que están revolucionando su soporte técnico con ForeSight.
            </p>
            <Button 
              onClick={onNavigateToAuth}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 h-20 px-12 rounded-2xl text-xl font-black shadow-2xl relative z-10 transition-transform hover:scale-105"
            >
              Crea tu cuenta gratis hoy
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-8 text-white">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Ticket className="h-5 w-5" />
                </div>
                <span className="text-2xl font-black tracking-tight">ForeSight</span>
              </div>
              <p className="max-w-md text-lg leading-relaxed">
                Transformamos la complejidad técnica en simplicidad operativa. La herramienta definitiva para el soporte moderno.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Plataforma</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Infraestructura</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Recursos</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm">© 2024 ForeSight Systems v2.0. Desarrollado con precisión.</p>
            <div className="flex gap-10 text-sm">
              <a href="#" className="hover:text-white transition-colors font-medium">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Términos de Servicio</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col gap-2"
    >
      <div className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">{value}</div>
      <div className="text-slate-500 font-bold text-sm uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
    >
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 text-lg leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="text-4xl font-black text-blue-100 group-hover:text-blue-600 transition-colors duration-300">{number}</div>
      <div>
        <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
        <p className="text-slate-500 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role, avatar }: { quote: string, author: string, role: string, avatar: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6"
    >
      <Quote className="h-8 w-8 text-blue-100" />
      <p className="text-lg text-slate-700 leading-relaxed italic">
        "{quote}"
      </p>
      <div className="flex items-center gap-4 mt-auto">
        <img src={avatar} alt={author} className="w-12 h-12 rounded-full border-2 border-blue-50" />
        <div>
          <div className="font-bold text-slate-900">{author}</div>
          <div className="text-sm text-slate-500">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

function PricingCard({ title, price, description, features, highlighted = false }: any) {
  return (
    <div className={`p-10 rounded-[35px] flex flex-col transition-all duration-300 ${
      highlighted 
        ? 'bg-blue-600 scale-105 shadow-3xl shadow-blue-600/20 text-white' 
        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
    }`}>
      <h3 className="text-2xl font-black mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-5xl font-black">${price}</span>
        {price !== 'Custom' && <span className={highlighted ? "text-blue-100" : "text-slate-400"}>/mes</span>}
      </div>
      <p className={`text-lg mb-10 ${highlighted ? 'text-blue-100' : 'text-slate-400'}`}>
        {description}
      </p>
      <div className="space-y-4 mb-12">
        {features.map((f: string) => (
          <div key={f} className="flex items-center gap-3">
            <CheckCircle className={`h-5 w-5 ${highlighted ? 'text-white' : 'text-blue-400'}`} />
            <span className="font-medium">{f}</span>
          </div>
        ))}
      </div>
      <Button className={`mt-auto h-16 rounded-2xl font-black text-lg ${
        highlighted 
          ? 'bg-white text-blue-600 hover:bg-slate-100' 
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}>
        Elegir {title}
      </Button>
    </div>
  );
}

function FaqItem({ index, question, answer, activeFaq, setActiveFaq }: any) {
  const isOpen = activeFaq === index;
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setActiveFaq(isOpen ? null : index)}
        className="w-full p-6 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="text-xl font-bold text-slate-900">{question}</span>
        {isOpen ? <Minus className="text-blue-600" /> : <Plus className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-white"
          >
            <div className="p-6 pt-0 text-slate-500 text-lg leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
