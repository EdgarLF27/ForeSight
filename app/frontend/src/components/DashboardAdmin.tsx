import { useState, useMemo } from 'react';
import { 
  Ticket as TicketIcon, 
  Plus, 
  Building2, 
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Inbox,
  History,
  Filter,
  Calendar,
  Activity,
  Zap,
  ShieldAlert,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getFileUrl, reportsApi } from '@/services/api';
import type { Ticket, Company, Area as AreaType, User } from '@/types';
import { toast } from 'sonner';

interface DashboardAdminProps {
  company: Company | null;
  tickets: Ticket[];
  areas: AreaType[];
  currentUser: User;
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onViewTicket: (ticket: Ticket) => void;
}

const statusConfig = {
  OPEN: { label: 'Abierto', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  IN_PROGRESS: { label: 'En Proceso', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  RESOLVED: { label: 'Resuelto', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  CLOSED: { label: 'Cerrado', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  CANCELLED: { label: 'Cancelado', color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({ title, value, icon, trend, colorClass = "text-blue-400" }: { title: string, value: string | number, icon: React.ReactNode, trend?: string, colorClass?: string }) {
  return (
    <GlassCard className="p-6 group hover:bg-white/[0.05]">
      <div className="flex justify-between items-start mb-4">
        <div className={`${colorClass} drop-shadow-[0_0_8px_currentColor]`}>
          {icon}
        </div>
        {trend && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{trend}</span>}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-white dark:text-white tracking-tighter">{value}</h3>
    </GlassCard>
  );
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    const color = payload[0].stroke;
    return (
      <div className="bg-[#0a0a0b]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: color, color: color }} />
          <p className="text-xl font-black text-white">{`${payload[0].value}${unit}`}</p>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardAdmin({ 
  company, 
  tickets = [], 
  areas = [],
  onCreateTicket, 
  onViewTicket 
}: DashboardAdminProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [period, setPeriod] = useState('Semana');
  const [metric, setMetric] = useState('Volumen');
  const [category, setCategory] = useState('Todos');

  const stats = useMemo(() => ({
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  }), [tickets]);

  const metricConfig: any = {
    'Volumen': { color: '#22d3ee', unit: ' Tkts', icon: Activity },
    'Resolución': { color: '#10b981', unit: '%', icon: Zap },
    'Criticidad': { color: '#f43f5e', unit: ' Pts', icon: ShieldAlert }
  };

  const chartData = useMemo(() => {
    const days = period === 'Hoy' ? 1 : period === 'Semana' ? 7 : 30;
    const lastNDays = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return lastNDays.map(date => {
      let dailyTickets = tickets.filter(t => t.createdAt && t.createdAt.split('T')[0] === date);
      
      if (category !== 'Todos') {
        dailyTickets = dailyTickets.filter(t => t.area?.name === category);
      }

      let value = 0;
      if (metric === 'Volumen') value = dailyTickets.length;
      else if (metric === 'Resolución') {
        const resolved = dailyTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
        value = dailyTickets.length > 0 ? Math.round((resolved / dailyTickets.length) * 100) : 0;
      } else if (metric === 'Criticidad') {
        value = dailyTickets.reduce((acc, t) => acc + (t.priority === 'URGENT' ? 10 : t.priority === 'HIGH' ? 5 : 1), 0);
      }

      return {
        name: days <= 7 
          ? new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
          : new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase(),
        val: value
      };
    });
  }, [tickets, period, metric, category]);

  const handleCreateTicket = async () => {
    const success = await onCreateTicket({ title: 'Nueva Incidencia', description: '', priority: 'MEDIUM', category: 'General', areaId: '' });
    if (success) setIsCreateDialogOpen(false);
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      const response = await reportsApi.downloadAdminReport();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_ForeSight_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsDownloading(false);
    }
  };

  const CurrentMetricIcon = metricConfig[metric].icon;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Panel General</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Terminal de Control Operativo</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadReport} 
            disabled={isDownloading}
            className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} strokeWidth={3} /> 
            {isDownloading ? 'Generando...' : 'Reporte'}
          </button>
          <button onClick={() => setIsCreateDialogOpen(true)} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center gap-2">
            <Plus className="h-4 w-4" strokeWidth={3} /> Nueva Incidencia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Incidencias Activas" value={stats.open} icon={<AlertCircle className="h-6 w-6" />} trend="+2 hoy" colorClass="text-rose-400" />
        <MetricCard title="En Proceso" value={stats.inProgress} icon={<Clock className="h-6 w-6" />} trend="Tiempo Real" colorClass="text-amber-400" />
        <MetricCard title="Total Resueltas" value={stats.resolved} icon={<CheckCircle className="h-6 w-6" />} trend="94% Ratio" colorClass="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 shadow-lg">
                <CurrentMetricIcon className="h-6 w-6" style={{ color: metricConfig[metric].color }} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none">{metric}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Análisis por {period}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-[#0a0a0b] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white uppercase outline-none focus:border-cyan-500/50 cursor-pointer">
                <option value="Volumen">Volumen</option>
                <option value="Resolución">Resolución %</option>
                <option value="Criticidad">Impacto</option>
              </select>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-[#0a0a0b] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white uppercase outline-none focus:border-cyan-500/50 cursor-pointer">
                <option value="Hoy">Hoy</option>
                <option value="Semana">Semana</option>
                <option value="Mes">Mes</option>
              </select>
            </div>
          </div>
          
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metricConfig[metric].color} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={metricConfig[metric].color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'black', fill: '#475569' }} dy={15} />
                <YAxis hide={true} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip unit={metricConfig[metric].unit} />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="val" stroke={metricConfig[metric].color} strokeWidth={4} fillOpacity={1} fill="url(#chartGlow)" animationDuration={1000} style={{ filter: `drop-shadow(0px 0px 10px ${metricConfig[metric].color}88)` }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-white/[0.05] rounded-2xl border border-white/10 flex items-center justify-center mb-6 overflow-hidden">
               {company?.logo ? (
                  <img src={getFileUrl(company.logo) || ''} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <Building2 className="h-8 w-8 text-blue-400/20" />
                )}
            </div>
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{company?.name}</h4>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Nodo Corporativo</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-6 italic italic">
               {company?.description || 'Gestión centralizada de infraestructura técnica.'}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invitación:</span>
            <span className="text-sm font-mono font-black text-blue-400 tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{company?.inviteCode}</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <History className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Registros Recientes</h3>
          </div>
          <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-slate-500 px-3 py-1">Encriptado</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4 text-white">Asunto / Nodo</th>
                <th className="px-8 py-4 text-white">Estado</th>
                <th className="px-8 py-4 text-right text-white">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0, 5).map((ticket) => (
                <tr key={ticket.id} onClick={() => onViewTicket(ticket)} className="group cursor-pointer border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight italic">{ticket.title}</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase mt-1">ID: {ticket.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].color}`}>
                      {statusConfig[ticket.status].label}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight className="h-4 w-4 text-slate-700 ml-auto group-hover:text-white transition-all group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
