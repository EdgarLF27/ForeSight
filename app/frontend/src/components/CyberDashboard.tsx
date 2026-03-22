import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  Calendar, 
  Search, 
  Bell, 
  LogOut, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

// --- SUB-COMPONENTES ---

const AuraBackground = () => (
  <div className="fixed inset-0 bg-background overflow-hidden -z-10 transition-colors duration-300">
    {/* Aura Azul Neón */}
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
    {/* Aura Violeta */}
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 dark:bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-700" />
  </div>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-card/40 dark:bg-white/5 backdrop-blur-xl border border-border/50 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none ${className}`}>
    {children}
  </div>
);

const GlowButton = ({ children, onClick, className = "", variant = "primary" }: any) => {
  const variants = {
    primary: "from-cyan-500 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]",
    danger: "from-red-500 to-orange-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
  };

  return (
    <button 
      onClick={onClick}
      className={`relative group px-6 py-3 bg-gradient-to-r ${variants[variant as keyof typeof variants]} rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-white font-medium ${className}`}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      {children}
    </button>
  );
};

const AnimatedChart = () => (
  <div className="w-full h-48 relative flex items-end px-2 overflow-hidden">
    <svg viewBox="0 0 400 150" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Línea de la Gráfica */}
      <path
        d="M0,120 Q50,110 80,60 T160,80 T240,40 T320,90 T400,20"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-[draw_3s_ease-in-out_infinite]"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{ animation: 'draw 4s forwards' }}
      />
      {/* Relleno Gradiente */}
      <path
        d="M0,120 Q50,110 80,60 T160,80 T240,40 T320,90 T400,20 L400,150 L0,150 Z"
        fill="url(#chartGradient)"
        className="opacity-40"
      />
    </svg>
    <style>{`
      @keyframes draw {
        to { stroke-dashoffset: 0; }
      }
    `}</style>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export const CyberDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    { label: "Revenue", value: "$42.5k", icon: TrendingUp, color: "text-emerald-500 dark:text-emerald-400", trend: "+12%" },
    { label: "Tickets Activos", value: "128", icon: Clock, color: "text-amber-500 dark:text-amber-400", trend: "8 Urgentes" },
    { label: "Resueltos", value: "1,420", icon: CheckCircle2, color: "text-cyan-500 dark:text-cyan-400", trend: "Este mes" },
    { label: "Alertas", value: "4", icon: AlertCircle, color: "text-rose-500 dark:text-rose-400", trend: "Acción requerida" },
  ];

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-cyan-500/30 transition-colors duration-300">
      <AuraBackground />
      
      {/* SIDEBAR */}
      <aside className={`fixed top-6 left-6 bottom-6 transition-all duration-500 z-50 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <GlassCard className="h-full flex flex-col p-4 bg-card/60 dark:bg-white/5 backdrop-blur-2xl">
          <div className="flex items-center gap-4 px-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 tracking-tight">
                ForeSight V2
              </span>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Ticket, label: "Tickets" },
              { icon: Users, label: "Equipo" },
              { icon: Calendar, label: "Agenda" },
              { icon: Settings, label: "Ajustes" },
            ].map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  item.active ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon size={22} className={item.active ? 'drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]' : ''} />
                {sidebarOpen && <span className="font-medium tracking-wide">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <GlowButton variant="danger" className="w-full !rounded-2xl" onClick={() => {}}>
              <LogOut size={20} />
              {sidebarOpen && "Logout"}
            </GlowButton>
          </div>
        </GlassCard>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`transition-all duration-500 ${sidebarOpen ? 'ml-84' : 'ml-32'} p-8 pr-10`}>
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar reportes, tickets, técnicos..."
                className="w-full bg-card/40 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-card/60 transition-all backdrop-blur-md text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-card/40 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-xl hover:bg-accent transition-all">
              <Bell size={22} className="text-foreground/70" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">Alex Rivera</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Admin</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border-2 border-primary/30 p-0.5">
                <div className="w-full h-full bg-muted rounded-[10px] overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-6 group hover:border-primary/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-primary/5 ${stat.color}`}>
                  <stat.icon size={26} />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
            </GlassCard>
          ))}
        </div>

        {/* GRÁFICA Y ACTIVIDAD RECIENTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">Rendimiento del Sistema</h3>
                <p className="text-muted-foreground text-sm">Actividad de tickets en tiempo real</p>
              </div>
              <select className="bg-card/40 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none text-foreground">
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
              </select>
            </div>
            <AnimatedChart />
            <div className="flex justify-between mt-6 pt-6 border-t border-border/50 text-xs text-muted-foreground font-medium">
              <span>LUN</span><span>MAR</span><span>MIE</span><span>JUE</span><span>VIE</span><span>SAB</span><span>DOM</span>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-bold text-white dark:text-foreground mb-6">Actividad Reciente</h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/50 transition-colors">
                    <Clock size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/90 font-medium leading-tight">Ticket #2049 resuelto por Técnico Especialista</p>
                    <p className="text-xs text-muted-foreground mt-1">Hace {i * 15} minutos</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-card/40 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl text-sm font-semibold hover:bg-accent transition-all text-foreground">
              Ver todo el historial
            </button>
          </GlassCard>
        </div>
      </main>

      <style>{`
        .ml-84 { margin-left: 21rem; }
      `}</style>
    </div>
  );
};

export default CyberDashboard;
