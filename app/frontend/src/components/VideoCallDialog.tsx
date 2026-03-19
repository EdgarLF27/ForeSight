import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
}

export function VideoCallDialog({ isOpen, onClose, roomName, userName }: VideoCallDialogProps) {
  // Extraer el nombre de la sala de la URL de Jitsi si viene completa
  const cleanRoomName = roomName.replace('https://meet.jit.si/', '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Solo permitimos cerrar si el estado 'open' es false (vía botón interno)
      if (!open) onClose();
    }}>
      <DialogContent 
        className="max-w-[98vw] w-full h-[95vh] p-0 overflow-hidden bg-black border-none rounded-3xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()} // Evita cerrar al dar click fuera
        onEscapeKeyDown={(e) => e.preventDefault()} // Evita cerrar con Escape
      >
        <div className="absolute top-0 left-0 right-0 z-50 p-0 bg-slate-900/40 backdrop-blur-md border-b border-white/5 flex flex-row items-center justify-between h-9 px-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
              Live Session
            </span>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-all duration-300"
          >
            <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Finalizar</span>
            <div className="h-5 w-5 rounded-lg bg-white/5 group-hover:bg-destructive flex items-center justify-center transition-colors">
              <X className="h-3 w-3" />
            </div>
          </button>
        </div>
        
        <div className="w-full h-full bg-slate-950">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={cleanRoomName}
            configOverwrite={{
              startWithAudioMuted: true,
              disableModeratorIndicator: true,
              startScreenSharing: false,
              enableEmailInStats: false,
              prejoinPageEnabled: false, // Salta la página de pre-unión para entrar directo
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            }}
            userInfo={{
              displayName: userName,
            }}
            onApiReady={(externalApi) => {
              // Aquí podrías añadir listeners de eventos si lo necesitas
              externalApi.addEventListener('readyToClose', () => {
                onClose();
              });
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
            loadingComponent={() => (
              <div className="flex flex-col items-center justify-center h-full space-y-4 bg-slate-900 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest">Iniciando Sala Segura...</p>
              </div>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
