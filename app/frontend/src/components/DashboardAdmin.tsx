import { useState, useRef, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Building2, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  ChevronRight,
  Edit3,
  Camera,
  Info,
  Save,
  Loader2,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { companiesApi, getFileUrl } from '@/services/api';
import { toast } from 'sonner';
import type { Ticket as TicketType, Company, Area } from '@/types';

interface DashboardAdminProps {
  company: Company | null;
  tickets: TicketType[];
  areas: Area[];
  currentUser: any;
  onCreateTicket: (ticket: any) => Promise<boolean>;
  onUpdateTicket: (ticketId: string, updates: any) => void;
  onViewTicket: (ticket: TicketType) => void;
}

const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  OPEN: { label: 'Abierto', variant: 'destructive' },
  IN_PROGRESS: { label: 'En progreso', variant: 'warning' },
  RESOLVED: { label: 'Resuelto', variant: 'success' },
  CLOSED: { label: 'Cerrado', variant: 'secondary' },
};

export function DashboardAdmin({ 
  company: initialCompany, 
  tickets, 
  areas,
  currentUser,
  onCreateTicket, 
  onViewTicket 
}: DashboardAdminProps) {
  const [company, setCompany] = useState<Company | null>(initialCompany);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    name: initialCompany?.name || '',
    description: initialCompany?.description || '',
    information: (initialCompany as any)?.information || ''
  });

  useEffect(() => {
    if (initialCompany) {
      setCompany(initialCompany);
      setEditData({
        name: initialCompany.name || '',
        description: initialCompany.description || '',
        information: (initialCompany as any).information || ''
      });
    }
  }, [initialCompany]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: 'General',
    areaId: '',
  });

  const isAdmin = currentUser.role === 'Administrador' || (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Administrador') || currentUser.role === 'EMPRESA';
  const isTechnician = (typeof currentUser.role === 'object' && (currentUser.role as any).name === 'Técnico');

  const visibleTickets = tickets.filter(ticket => {
    if (isAdmin) return true;
    if (isTechnician) return !ticket.assignedToId || ticket.assignedToId === currentUser.id;
    return false;
  });

  const stats = {
    total: visibleTickets.length,
    open: visibleTickets.filter(t => t.status === 'OPEN').length,
    inProgress: visibleTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: visibleTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) return;
    const success = await onCreateTicket(newTicket);
    if (success) {
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', category: 'General', areaId: '' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      const { data } = await companiesApi.update(company.id, editData);
      setCompany(data);
      toast.success('Empresa actualizada');
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    setIsUploading(true);
    try {
      const { data } = await companiesApi.uploadLogo(company.id, file);
      setCompany(data);
      toast.success('Logo actualizado');
    } catch (err) {
      toast.error('Error al subir logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 p-1 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground uppercase italic">Panel de Control</h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Gestión estratégica de {company?.name}</p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild id="create-ticket-btn">
              <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-2xl shadow-lg shadow-primary/20 h-12 md:h-14 px-8 font-bold transition-all w-full md:w-auto">
                <Plus className="h-5 w-5 mr-2" strokeWidth={3} /> Nuevo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl border-border bg-card shadow-2xl p-0 overflow-hidden mx-4 sm:mx-0">
               <div className="bg-primary p-6 md:p-10 text-primary-foreground relative">
                <div className="absolute -right-6 -top-6 opacity-10 rotate-12"><Ticket size={140} /></div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Nueva Incidencia</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 font-medium italic">Registra un nuevo ticket en el sistema.</DialogDescription>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Asunto</label>
                  <Input placeholder="Título descriptivo" value={newTicket.title} onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })} className="h-12 rounded-2xl bg-muted/30 border-border font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Descripción</label>
                  <Textarea placeholder="Detalles técnicos..." value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} className="min-h-[140px] rounded-2xl bg-muted/30 border-border font-medium" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Área</label>
                    <select value={newTicket.areaId} onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })} className="w-full h-12 px-4 border border-border rounded-2xl bg-muted/30 font-bold appearance-none uppercase text-xs">
                      <option value="">Seleccionar...</option>
                      {areas.map(area => (<option key={area.id} value={area.id}>{area.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest ml-1">Prioridad</label>
                    <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })} className="w-full h-12 px-4 border border-border rounded-2xl bg-muted/30 font-bold appearance-none uppercase text-xs">
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>
                <DialogFooter className="pt-4 gap-3">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-2xl h-12 px-6 font-bold text-muted-foreground uppercase text-xs">Cancelar</Button>
                  <Button className="bg-primary text-primary-foreground h-12 px-10 rounded-2xl font-bold uppercase text-xs shadow-lg shadow-primary/20" onClick={handleCreateTicket} disabled={!newTicket.title || !newTicket.description}>Crear Ticket</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div id="stats-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total" value={stats.total} icon={<Ticket className="h-5 w-5 text-primary" />} />
        <StatCard title="Abiertos" value={stats.open} icon={<AlertCircle className="h-5 w-5 text-destructive" />} />
        <StatCard title="En Proceso" value={stats.inProgress} icon={<Clock className="h-5 w-5 text-amber-500" />} />
        <StatCard title="Resueltos" value={stats.resolved} icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-xl bg-card rounded-[2rem] overflow-hidden order-2 lg:order-1">
          <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-10 py-6 md:py-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl"><BarChart3 className="h-6 w-6 text-primary" /></div>
              <CardTitle className="text-xl font-bold uppercase tracking-tight">Actividad</CardTitle>
            </div>
            <Badge variant="outline" className="font-bold text-[10px] uppercase px-3 py-1 rounded-full border-border">Recientes</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {visibleTickets.slice(0, 6).map((ticket) => (
                <div key={ticket.id} onClick={() => onViewTicket(ticket)} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 hover:bg-muted/30 transition-all cursor-pointer group relative gap-4">
                  <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${ticket.priority === 'URGENT' ? 'bg-destructive' : ticket.priority === 'HIGH' ? 'bg-amber-500' : 'bg-primary'}`} />
                  <div className="pl-2 flex-1">
                    <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{ticket.title}</p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 opacity-50" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className="text-primary/20">•</span>
                      <span className="flex items-center gap-1.5 text-primary"><MapPin className="h-3.5 w-3.5 opacity-50" /> {ticket.area?.name || 'Soporte'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <Badge variant={statusConfig[ticket.status].variant} className="font-bold text-[10px] uppercase px-3 py-1 rounded-lg">{statusConfig[ticket.status].label}</Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
              {visibleTickets.length === 0 && (
                <div className="py-24 text-center">
                  <Inbox className="h-16 w-12 text-muted-foreground/10 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Sin actividad registrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
          <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden group">
            <div className="h-32 bg-slate-950 relative">
               <div className="absolute -bottom-12 left-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-card rounded-3xl border-[6px] border-card shadow-2xl flex items-center justify-center overflow-hidden">
                      {company?.logo ? (
                        <img key={company.logo} src={getFileUrl(company.logo) || ''} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50"><Building2 className="h-12 w-12 text-primary/20" /></div>
                      )}
                    </div>
                    {isAdmin && (
                      <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-card active:scale-95">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
               </div>
               {isAdmin && (
                 <button onClick={() => setIsEditDialogOpen(true)} className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5">
                   <Edit3 className="h-4 w-4" />
                 </button>
               )}
            </div>
            <CardContent className="pt-16 pb-10 px-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">{company?.name}</h2>
                <p className="text-xs text-primary font-bold italic uppercase tracking-widest">{company?.description || 'División Corporativa'}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[10px] font-black text-primary uppercase tracking-widest">
                  <Info className="h-4 w-4" /> Información Institucional
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                  {(company as any)?.information || 'Información no disponible.'}
                </p>
              </div>
              {isAdmin && (
                <div className="p-5 bg-muted/30 rounded-[1.5rem] border border-border border-dashed space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Código de Acceso</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono font-black tracking-[0.4em] text-primary">{company?.inviteCode}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black px-2 py-0.5">ACTIVO</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden bg-card border-border shadow-2xl mx-4">
          <div className="bg-slate-950 p-8 md:p-10 text-white relative">
            <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><Building2 size={120} /></div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Identidad Corporativa</DialogTitle>
            <DialogDescription className="text-slate-500 mt-1 font-bold uppercase text-[10px] tracking-[0.2em]">Configuración de marca global.</DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <Input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-border font-black uppercase text-sm px-5" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Eslogan Corporativo</label>
              <Input value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-border font-bold text-xs px-5" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Misión y Visión</label>
              <Textarea value={editData.information} onChange={(e) => setEditData({...editData, information: e.target.value})} className="min-h-[160px] rounded-[1.5rem] bg-muted/30 border-border font-medium text-xs leading-relaxed p-5" placeholder="Escribe la historia de tu empresa..." />
            </div>
            <DialogFooter className="pt-4 gap-3 flex-col sm:flex-row">
              <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-2xl h-12 px-6 font-black text-muted-foreground uppercase text-xs tracking-widest">Cancelar</Button>
              <Button onClick={handleUpdateCompany} disabled={isSaving} className="bg-primary text-primary-foreground h-12 px-10 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 flex-1">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Sincronizar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-lg bg-card hover:shadow-2xl transition-all duration-500 group rounded-[2rem] overflow-hidden border border-transparent hover:border-primary/10">
      <CardContent className="p-6 md:p-8 flex items-center gap-6">
        <div className="p-4 rounded-[1.25rem] bg-muted/50 border border-border group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">{icon}</div>
        <div className="flex-1">
          <p className="text-3xl md:text-4xl font-black text-foreground tracking-tighter leading-none">{value}</p>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
