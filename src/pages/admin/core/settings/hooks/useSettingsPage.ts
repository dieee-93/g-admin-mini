import { useEffect } from 'react';
import { 
  CogIcon,
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

export function useSettingsPage() {
  const { setQuickActions } = useNavigation();

  useEffect(() => {
    setQuickActions([
      {
        id: 'save-settings',
        label: 'Guardar Configuración',
        icon: CogIcon,
        action: () => console.log('Save settings'),
        color: 'blue'
      }
    ]);
  }, [setQuickActions]);

  // Métricas del dashboard
  const metrics = [
    {
      title: "Perfil Empresarial",
      value: "Completo",
      subtitle: "Información actualizada",
      icon: BuildingOfficeIcon
    },
    {
      title: "Configuración Fiscal",
      value: "IVA 21%",
      subtitle: "Configurado correctamente",
      icon: CurrencyDollarIcon
    },
    {
      title: "Permisos",
      value: "3 Roles",
      subtitle: "Activos en el sistema",
      icon: UserGroupIcon
    },
    {
      title: "Integraciones",
      value: "2 Activas",
      subtitle: "APIs funcionando",
      icon: LinkIcon
    }
  ];

  // Handlers para acciones de configuración
  const handleSaveSettings = () => {
    console.log('Save settings');
    // TODO: Implementar lógica de guardado
  };

  return {
    metrics,
    handlers: {
      handleSaveSettings
    },
    icons: {
      CogIcon,
      BuildingOfficeIcon,
      CurrencyDollarIcon,
      UserGroupIcon,
      LinkIcon
    }
  };
}