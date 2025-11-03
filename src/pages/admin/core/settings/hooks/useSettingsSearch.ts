// 🔍 HOOK DE BÚSQUEDA DE CONFIGURACIONES G-ADMIN v2.1
// Búsqueda inteligente en tiempo real para configuraciones del sistema
import { useState, useMemo, useCallback } from 'react';
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ClockIcon,
  ShieldCheckIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

// 📋 Definición de elementos de configuración buscables
interface SearchableItem {
  id: string;
  title: string;
  description: string;
  section: 'perfil' | 'fiscal' | 'usuarios' | 'sistema';
  category: string;
  keywords: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
  priority: 'high' | 'medium' | 'low';
}

// 🎯 Base de datos de configuraciones buscables
const SEARCHABLE_ITEMS: SearchableItem[] = [
  // 🏢 Perfil Empresarial
  {
    id: 'business-info',
    title: 'Información del Negocio',
    description: 'Nombre, dirección, teléfono y email de la empresa',
    section: 'perfil',
    category: 'Empresarial',
    keywords: ['empresa', 'negocio', 'nombre', 'dirección', 'teléfono', 'email', 'contacto'],
    icon: BuildingOfficeIcon,
    path: '#business-info',
    priority: 'high'
  },
  {
    id: 'business-hours',
    title: 'Horarios de Operación',
    description: 'Configuración de días y horas de funcionamiento',
    section: 'perfil',
    category: 'Empresarial',
    keywords: ['horarios', 'horas', 'operación', 'funcionamiento', 'días', 'apertura', 'cierre'],
    icon: ClockIcon,
    path: '#business-hours',
    priority: 'high'
  },
  
  // 💰 Configuración Fiscal
  {
    id: 'tax-config',
    title: 'Configuración de Impuestos',
    description: 'IVA, tasas y configuración fiscal general',
    section: 'fiscal',
    category: 'Fiscal',
    keywords: ['iva', 'impuestos', 'tasas', 'fiscal', '21%', 'configuración fiscal'],
    icon: CurrencyDollarIcon,
    path: '#tax-config',
    priority: 'high'
  },
  {
    id: 'tax-categories',
    title: 'Categorías Fiscales',
    description: 'Gestión de categorías y tipos de productos fiscales',
    section: 'fiscal',
    category: 'Fiscal',
    keywords: ['categorías', 'productos', 'tipos', 'clasificación', 'panadería', 'bebidas'],
    icon: CurrencyDollarIcon,
    path: '#tax-categories',
    priority: 'medium'
  },
  {
    id: 'fiscal-compliance',
    title: 'Cumplimiento Fiscal',
    description: 'Estado de reportes y obligaciones fiscales',
    section: 'fiscal',
    category: 'Fiscal',
    keywords: ['cumplimiento', 'reportes', 'obligaciones', 'pendientes', 'envío'],
    icon: ShieldCheckIcon,
    path: '#fiscal-compliance',
    priority: 'high'
  },
  
  // 👥 Usuarios y Permisos
  {
    id: 'roles-management',
    title: 'Gestión de Roles',
    description: 'Administrador, Gerente, Empleado, Cajero y permisos',
    section: 'usuarios',
    category: 'Usuarios',
    keywords: ['roles', 'permisos', 'administrador', 'gerente', 'empleado', 'cajero', 'acceso'],
    icon: UserGroupIcon,
    path: '#roles-management',
    priority: 'high'
  },
  {
    id: 'user-management',
    title: 'Usuarios del Sistema',
    description: 'Lista de usuarios, estados y actividad',
    section: 'usuarios',
    category: 'Usuarios',
    keywords: ['usuarios', 'activos', 'inactivos', 'actividad', 'maría', 'juan', 'ana'],
    icon: UserGroupIcon,
    path: '#user-management',
    priority: 'medium'
  },
  {
    id: 'security-status',
    title: 'Estado de Seguridad',
    description: 'Autenticación, roles definidos y recomendaciones',
    section: 'usuarios',
    category: 'Seguridad',
    keywords: ['seguridad', 'autenticación', 'recomendaciones', 'usuarios inactivos'],
    icon: ShieldCheckIcon,
    path: '#security-status',
    priority: 'high'
  },
  
  // ⚙️ Sistema
  {
    id: 'themes',
    title: 'Themes & Appearance',
    description: 'Personalización de temas y apariencia visual',
    section: 'sistema',
    category: 'Apariencia',
    keywords: ['themes', 'temas', 'apariencia', 'visual', 'synthwave', 'personalizar'],
    icon: PaintBrushIcon,
    path: '#themes',
    priority: 'medium'
  },
  {
    id: 'system-status',
    title: 'Estado del Sistema',
    description: 'Uptime, versión, ambiente y información técnica',
    section: 'sistema',
    category: 'Sistema',
    keywords: ['estado', 'uptime', 'versión', 'ambiente', 'producción', 'build'],
    icon: CogIcon,
    path: '#system-status',
    priority: 'low'
  },
  {
    id: 'system-info',
    title: 'Información del Sistema',
    description: 'Base de datos, storage, framework y tecnologías',
    section: 'sistema',
    category: 'Sistema',
    keywords: ['información', 'base de datos', 'postgresql', 'storage', 'react', 'chakra'],
    icon: CogIcon,
    path: '#system-info',
    priority: 'low'
  }
];

export function useSettingsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 🔍 Lógica de búsqueda inteligente
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    
    return SEARCHABLE_ITEMS
      .map(item => {
        let score = 0;
        
        // 🎯 Scoring por coincidencias
        if (item.title.toLowerCase().includes(query)) score += 10;
        if (item.description.toLowerCase().includes(query)) score += 5;
        if (item.category.toLowerCase().includes(query)) score += 8;
        
        // Keywords matching
        const keywordMatches = item.keywords.filter(keyword => 
          keyword.toLowerCase().includes(query)
        ).length;
        score += keywordMatches * 3;
        
        // 🏆 Boost por prioridad
        if (item.priority === 'high') score += 2;
        if (item.priority === 'medium') score += 1;
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Limitar a 8 resultados máximo
  }, [searchQuery]);

  // 🎯 Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query.trim());
  }, []);

  const handleSelectResult = useCallback((item: SearchableItem) => {
    // Navegar a la sección
    if (item.path) {
      const element = document.querySelector(item.path);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
    
    // Limpiar búsqueda
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  // 📊 Estadísticas de búsqueda
  const searchStats = useMemo(() => ({
    totalItems: SEARCHABLE_ITEMS.length,
    sectionsCount: {
      perfil: SEARCHABLE_ITEMS.filter(item => item.section === 'perfil').length,
      fiscal: SEARCHABLE_ITEMS.filter(item => item.section === 'fiscal').length,
      usuarios: SEARCHABLE_ITEMS.filter(item => item.section === 'usuarios').length,
      sistema: SEARCHABLE_ITEMS.filter(item => item.section === 'sistema').length,
    },
    resultsCount: searchResults.length
  }), [searchResults.length]);

  return {
    // Estado
    searchQuery,
    isSearching,
    searchResults,
    searchStats,

    // Acciones  
    handleSearch,
    handleSelectResult,
    clearSearch,

    // Utilidades
    SEARCHABLE_ITEMS,
    
    // Sugerencias populares
    popularSearches: [
      'IVA', 'horarios', 'usuarios', 'themes', 'roles', 'reportes'
    ]
  };
}