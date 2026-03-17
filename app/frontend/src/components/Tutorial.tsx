import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { Step, CallBackProps } from 'react-joyride';
import type { User } from '@/types';

interface TutorialProps {
  user: User;
}

export const Tutorial: React.FC<TutorialProps> = ({ user }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem(`foresight_tutorial_${user.id}`);
    if (!tutorialCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user.id]);

  const isAdmin = user.role === 'EMPRESA' || user.role === 'Administrador' || (typeof user.role === 'object' && (user.role as any).name === 'Administrador');
  const hasCompany = !!user.companyId;

  const adminSteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-2">¡BIENVENIDO A FORESIGHT! 🚀</h3>
          <p className="text-sm font-medium text-muted-foreground">Como administrador, tienes el control total del sistema. Permítenos mostrarte lo más importante para gestionar tu infraestructura.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '#sidebar-nav',
      content: 'Este es tu centro de mando. Desde aquí gestionas tickets, equipo, roles, áreas y toda la configuración corporativa.',
      placement: 'right',
    },
    {
      target: '#stats-overview',
      content: 'Panel táctico de estado. Visualiza en tiempo real cuántas incidencias están abiertas, en proceso o resueltas.',
      placement: 'bottom',
    },
    {
      target: '#create-ticket-btn',
      content: '¿Nueva incidencia detectada? Usa este botón para registrar un ticket de soporte de inmediato.',
      placement: 'left',
    },
    {
      target: '#notifications-bell',
      content: 'Centro de alertas. Aquí recibirás actualizaciones críticas, comentarios de técnicos y cambios de estado.',
      placement: 'bottom',
    },
    {
      target: '#user-profile',
      content: 'Tu identidad. Aquí puedes ajustar tu perfil personal o cerrar la sesión de forma segura.',
      placement: 'bottom',
    },
  ];

  const employeeNoCompanySteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-2">¡HOLA, {user.name.split(' ')[0]}! 👋</h3>
          <p className="text-sm font-medium text-muted-foreground">Bienvenido a la red. Antes de empezar a reportar incidencias, debemos vincularte a tu organización.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '#join-company-card',
      content: 'Para activar todas las funciones, necesitas ingresar las credenciales de tu empresa.',
      placement: 'bottom',
    },
    {
      target: '#invite-code-input',
      content: 'Aquí debes introducir el código de 6 dígitos que te proporcionó tu administrador o jefe directo.',
      placement: 'bottom',
    },
    {
      target: '#join-btn',
      content: 'Una vez ingresado, pulsa este botón para sincronizarte con el panel de control de tu empresa.',
      placement: 'top',
    },
  ];

  const employeeWithCompanySteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-2">¡SISTEMA ACTIVO! ✅</h3>
          <p className="text-sm font-medium text-muted-foreground">Ya eres parte de la organización. Aquí tienes las herramientas para gestionar tus solicitudes de soporte.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '#create-ticket-btn',
      content: 'Tu herramienta principal. Úsala para reportar fallos técnicos, solicitudes de material o cualquier problema en tu área.',
      placement: 'bottom',
    },
    {
      target: '#stats-overview',
      content: 'Resumen personal. Aquí verás el progreso de tus reportes enviados.',
      placement: 'bottom',
    },
    {
      target: '#sidebar-nav',
      content: 'Navegación rápida. Accede a tus tickets históricos o revisa la agenda de mantenimientos programados.',
      placement: 'right',
    },
    {
      target: '#notifications-bell',
      content: 'Mantente alerta. Te notificaremos cuando un técnico sea asignado a tu caso o cuando se resuelva.',
      placement: 'bottom',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(`foresight_tutorial_${user.id}`, 'true');
    }
  };

  const getSteps = () => {
    if (isAdmin) return adminSteps;
    if (!hasCompany) return employeeNoCompanySteps;
    return employeeWithCompanySteps;
  };

  return (
    <Joyride
      steps={getSteps()}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: 'ANTERIOR',
        close: 'CERRAR',
        last: 'FINALIZAR',
        next: 'SIGUIENTE',
        skip: 'SALTAR TOUR'
      }}
      styles={{
        options: {
          primaryColor: '#0070f3',
          backgroundColor: '#0a0a0a',
          textColor: '#ffffff',
          arrowColor: '#0a0a0a',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left',
          borderRadius: '1.5rem',
          padding: '1.25rem',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 40px rgba(0, 112, 243, 0.2)',
          backdropFilter: 'blur(10px)',
        },
        buttonNext: {
          borderRadius: '1rem',
          fontSize: '0.7rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          padding: '0.8rem 1.5rem',
          backgroundColor: '#0070f3',
        },
        buttonBack: {
          fontSize: '0.7rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginRight: '1rem',
          color: '#666',
        },
        buttonSkip: {
          fontSize: '0.7rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#444',
        }
      }}
    />
  );
};
