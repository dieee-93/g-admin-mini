import { VStack } from '@/shared/ui';import { useState } from 'react';/**/**



interface OnboardingGuideProps {import { VStack, HStack, Button } from '@/shared/ui';

  userId?: string;

}import {  * OnboardingGuide - Guía Interactiva de Activación de Capacidades * OnboardingGuide - Guía Interactiva de Activación de Capacidades



export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ userId }) => {  CheckCircleIcon, 

  return (

    <VStack align="stretch" spacing={4}>  StarIcon, *  * 

      <div className="bg-white border rounded-lg p-4">

        <h3 className="text-lg font-bold mb-2">Guía de Inicio</h3>  PlayIcon

        <p className="text-sm text-gray-600">

          Bienvenido a tu panel de logros. Completa actividades para ganar puntos y desbloquear nuevas funcionalidades.} from '@heroicons/react/24/outline'; * Componente simplificado para mostrar progreso de onboarding. * Componente simplificado para mostrar progreso de onboarding.

        </p>

      </div>

      

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">interface OnboardingGuideProps { */ */

        <div className="flex items-center space-x-3">

          <div className="w-5 h-5 text-blue-500">⭐</div>  userId?: string;

          <div>

            <p className="font-medium text-blue-700">¡Explora tus logros!</p>}

            <p className="text-blue-600 text-sm">

              Cambia entre vista de galaxia y grilla para ver tus achievements.

            </p>

          </div>interface OnboardingStep {import { useState } from 'react';import { useState } from 'react';

        </div>

      </div>  id: string;

    </VStack>

  );  title: string;import { VStack, HStack, Button } from '@/shared/ui';import { VStack, HStack, Stack, Button } from '@/shared/ui';

};
  description: string;

  completed: boolean;import { import { 

  points: number;

}  CheckCircleIcon,   CheckCircleIcon, 



export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({   StarIcon,  StarIcon,

  userId 

}) => {  PlayIcon  PlayIcon

  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  } from '@heroicons/react/24/outline';} from '@heroicons/react/24/outline';

  const onboardingSteps: OnboardingStep[] = [

    {

      id: 'profile',

      title: 'Completa tu perfil',interface OnboardingGuideProps {interface OnboardingGuideProps {

      description: 'Configura la información básica de tu restaurante',

      completed: true,  userId?: string;  userId?: string;

      points: 100

    },}}

    {

      id: 'menu',

      title: 'Añade tu primer plato',

      description: 'Crea tu primera entrada en el menú',interface OnboardingStep {interface OnboardingStep {

      completed: false,

      points: 200  id: string;  id: string;

    },

    {  title: string;  title: string;

      id: 'sale',

      title: 'Registra tu primera venta',  description: string;  description: string;

      description: 'Completa una transacción de prueba',

      completed: false,  completed: boolean;  completed: boolean;

      points: 300

    }  points: number;  points: number;

  ];

}}

  const completedSteps = onboardingSteps.filter(step => step.completed);

  const totalPoints = completedSteps.reduce((sum, step) => sum + step.points, 0);

  const progress = (completedSteps.length / onboardingSteps.length) * 100;

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ 

  const toggleStep = (stepId: string) => {

    setExpandedStep(expandedStep === stepId ? null : stepId);  userId   userId 

  };

}) => {}) => {

  const StepIcon = ({ completed }: { completed: boolean }) => {

    return completed ? (  const [expandedStep, setExpandedStep] = useState<string | null>(null);  const [expandedStep, setExpandedStep] = useState<string | null>(null);

      <CheckCircleIcon className="w-6 h-6 text-green-500" />

    ) : (    

      <PlayIcon className="w-6 h-6 text-gray-400" />

    );  // Datos simulados para el ejemplo  // Datos simulados para el ejemplo

  };

  const onboardingSteps: OnboardingStep[] = [  const onboardingSteps: OnboardingStep[] = [

  return (

    <VStack align="stretch" spacing={4}>    {    {

      <div className="bg-white border rounded-lg p-4">

        <VStack align="stretch" spacing={3}>      id: 'profile',      id: 'profile',

          <HStack justify="space-between" w="full">

            <VStack align="start" spacing={1}>      title: 'Completa tu perfil',      title: 'Completa tu perfil',

              <h3 className="text-lg font-bold">Guía de Inicio</h3>

              <p className="text-sm text-gray-600">      description: 'Configura la información básica de tu restaurante',      description: 'Configura la información básica de tu restaurante',

                Completa estos pasos para activar todas las funcionalidades

              </p>      completed: true,      completed: true,

            </VStack>

            <VStack align="end" spacing={1}>      points: 100      points: 100

              <HStack spacing={2}>

                <StarIcon className="w-5 h-5 text-yellow-400" />    },    },

                <span className="font-bold text-lg">{totalPoints}</span>

              </HStack>    {    {

              <span className="text-xs text-gray-500">puntos ganados</span>

            </VStack>      id: 'menu',      id: 'menu',

          </HStack>

                title: 'Añade tu primer plato',      title: 'Añade tu primer plato',

          <div className="w-full bg-gray-200 rounded-full h-3">

            <div       description: 'Crea tu primera entrada en el menú',      description: 'Crea tu primera entrada en el menú',

              className="bg-blue-500 h-3 rounded-full transition-all duration-300"

              style={{ width: `${progress}%` }}      completed: false,      completed: false,

            />

          </div>      points: 200      points: 200

        </VStack>

      </div>    },    },



      <VStack align="stretch" spacing={3}>    {    {

        {onboardingSteps.map((step) => (

          <div key={step.id} className="bg-white border rounded-lg p-4">      id: 'sale',      id: 'sale',

            <HStack justify="space-between" align="center">

              <HStack spacing={3}>      title: 'Registra tu primera venta',      title: 'Registra tu primera venta',

                <StepIcon completed={step.completed} />

                <VStack align="start" spacing={1}>      description: 'Completa una transacción de prueba',      description: 'Completa una transacción de prueba',

                  <h4 className="font-semibold text-md">{step.title}</h4>

                  <p className="text-sm text-gray-600 max-w-md">      completed: false,      completed: false,

                    {step.description}

                  </p>      points: 300      points: 300

                </VStack>

              </HStack>    }    }

              

              <VStack align="end" spacing={1}>  ];  ];

                <div className={`px-2 py-1 rounded text-xs font-medium ${

                  step.completed 

                    ? 'bg-green-100 text-green-800' 

                    : 'bg-orange-100 text-orange-800'  const completedSteps = onboardingSteps.filter(step => step.completed);  const completedSteps = onboardingSteps.filter(step => step.completed);

                }`}>

                  {step.completed ? 'Completado' : 'Pendiente'}  const totalPoints = completedSteps.reduce((sum, step) => sum + step.points, 0);  const totalPoints = completedSteps.reduce((sum, step) => sum + step.points, 0);

                </div>

                <span className="text-xs text-gray-500">  const progress = (completedSteps.length / onboardingSteps.length) * 100;  const progress = (completedSteps.length / onboardingSteps.length) * 100;

                  {step.points} pts

                </span>

              </VStack>

            </HStack>  const toggleStep = (stepId: string) => {  const toggleStep = (stepId: string) => {



            {step.completed && (    setExpandedStep(expandedStep === stepId ? null : stepId);    setExpandedStep(expandedStep === stepId ? null : stepId);

              <div className="mt-3 p-3 bg-green-50 rounded-md">

                <HStack spacing={2} justify="center">  };  };

                  <CheckCircleIcon className="w-4 h-4 text-green-500" />

                  <span className="text-green-700 font-medium text-sm">

                    ¡Paso completado! Has ganado {step.points} puntos

                  </span>  const StepIcon = ({ completed }: { completed: boolean }) => {  const StepIcon = ({ completed }: { completed: boolean }) => {

                </HStack>

              </div>    return completed ? (    return completed ? (

            )}

      <CheckCircleIcon className="w-6 h-6 text-green-500" />      <CheckCircleIcon className="w-6 h-6 text-green-500" />

            {!step.completed && (

              <div className="mt-3">    ) : (    ) : (

                <Button

                  variant={expandedStep === step.id ? "solid" : "outline"}      <PlayIcon className="w-6 h-6 text-gray-400" />      <PlayIcon className="w-6 h-6 text-gray-400" />

                  size="sm"

                  onClick={() => toggleStep(step.id)}    );    );

                >

                  {expandedStep === step.id ? 'Contraer' : 'Ver detalles'}  };  };

                </Button>

              </div>

            )}

          </div>  return (  return (

        ))}

      </VStack>    <VStack align="stretch" spacing={4}>    <VStack align="stretch" spacing={4}>



      {completedSteps.length < onboardingSteps.length && (      {/* Header de progreso */}      {/* Header de progreso */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

          <HStack spacing={3}>      <div className="bg-white border rounded-lg p-4">      <div className="bg-white border rounded-lg p-4">

            <StarIcon className="w-5 h-5 text-blue-500" />

            <VStack align="start" spacing={1}>        <VStack align="stretch" spacing={3}>        <VStack align="stretch" spacing={3}>

              <span className="font-medium text-blue-700">

                ¡Sigue adelante!          <HStack justify="space-between" w="full">          <HStack justify="space-between" w="full">

              </span>

              <span className="text-blue-600 text-sm">            <VStack align="start" spacing={1}>            <VStack align="start" spacing={1}>

                Completa {onboardingSteps.length - completedSteps.length} pasos más para desbloquear funcionalidades avanzadas.

              </span>              <h3 className="text-lg font-bold">Guía de Inicio</h3>              <h3 className="text-lg font-bold">Guía de Inicio</h3>

            </VStack>

          </HStack>              <p className="text-sm text-gray-600">              <p className="text-sm text-gray-600">

        </div>

      )}                Completa estos pasos para activar todas las funcionalidades                Completa estos pasos para activar todas las funcionalidades

    </VStack>

  );              </p>              </p>

};
            </VStack>            </VStack>

            <VStack align="end" spacing={1}>            <VStack align="end" spacing={1}>

              <HStack spacing={2}>              <HStack spacing={2}>

                <StarIcon className="w-5 h-5 text-yellow-400" />                <StarIcon className="w-5 h-5 text-yellow-400" />

                <span className="font-bold text-lg">{totalPoints}</span>                <span className="font-bold text-lg">{totalPoints}</span>

              </HStack>              </HStack>

              <span className="text-xs text-gray-500">puntos ganados</span>              <span className="text-xs text-gray-500">puntos ganados</span>

            </VStack>            </VStack>

          </HStack>          </HStack>

                    

          <div className="w-full bg-gray-200 rounded-full h-3">          <div className="w-full bg-gray-200 rounded-full h-3">

            <div             <div 

              className="bg-blue-500 h-3 rounded-full transition-all duration-300"              className="bg-blue-500 h-3 rounded-full transition-all duration-300"

              style={{ width: `${progress}%` }}              style={{ width: `${progress}%` }}

            />            />

          </div>          </div>

        </VStack>        </VStack>

      </div>      </div>



      {/* Lista de pasos */}      {/* Lista de pasos */}

      <VStack align="stretch" spacing={3}>      <VStack align="stretch" spacing={3}>

        {onboardingSteps.map((step) => (        {onboardingSteps.map((step) => (

          <div key={step.id} className="bg-white border rounded-lg p-4">          <div key={step.id} className="bg-white border rounded-lg p-4">

            <HStack justify="space-between" align="center">            <HStack justify="space-between" align="center">

              <HStack spacing={3}>              <HStack spacing={3}>

                <StepIcon completed={step.completed} />                <StepIcon completed={step.completed} />

                <VStack align="start" spacing={1}>                <VStack align="start" spacing={1}>

                  <h4 className="font-semibold text-md">{step.title}</h4>                  <h4 className="font-semibold text-md">{step.title}</h4>

                  <p className="text-sm text-gray-600 max-w-md">                  <p className="text-sm text-gray-600 max-w-md">

                    {step.description}                    {step.description}

                  </p>                  </p>

                </VStack>                </VStack>

              </HStack>              </HStack>

                            

              <VStack align="end" spacing={1}>              <VStack align="end" spacing={1}>

                <div className={`px-2 py-1 rounded text-xs font-medium ${                <div className={`px-2 py-1 rounded text-xs font-medium ${

                  step.completed                   step.completed 

                    ? 'bg-green-100 text-green-800'                     ? 'bg-green-100 text-green-800' 

                    : 'bg-orange-100 text-orange-800'                    : 'bg-orange-100 text-orange-800'

                }`}>                }`}>

                  {step.completed ? 'Completado' : 'Pendiente'}                  {step.completed ? 'Completado' : 'Pendiente'}

                </div>                </div>

                <span className="text-xs text-gray-500">                <span className="text-xs text-gray-500">

                  {step.points} pts                  {step.points} pts

                </span>                </span>

              </VStack>              </VStack>

            </HStack>            </HStack>



            {step.completed && (            {step.completed && (

              <div className="mt-3 p-3 bg-green-50 rounded-md">              <div className="mt-3 p-3 bg-green-50 rounded-md">

                <HStack spacing={2} justify="center">                <HStack spacing={2} justify="center">

                  <CheckCircleIcon className="w-4 h-4 text-green-500" />                  <CheckCircleIcon className="w-4 h-4 text-green-500" />

                  <span className="text-green-700 font-medium text-sm">                  <span className="text-green-700 font-medium text-sm">

                    ¡Paso completado! Has ganado {step.points} puntos                    ¡Paso completado! Has ganado {step.points} puntos

                  </span>                  </span>

                </HStack>                </HStack>

              </div>              </div>

            )}            )}



            {!step.completed && (            {!step.completed && (

              <div className="mt-3">              <div className="mt-3">

                <Button                <Button

                  variant={expandedStep === step.id ? "solid" : "outline"}                  variant={expandedStep === step.id ? "solid" : "outline"}

                  size="sm"                  colorScheme="blue"

                  onClick={() => toggleStep(step.id)}                  size="sm"

                >                  onClick={() => toggleStep(step.id)}

                  {expandedStep === step.id ? 'Contraer' : 'Ver detalles'}                >

                </Button>                  {expandedStep === step.id ? 'Contraer' : 'Ver detalles'}

              </div>                </Button>

            )}              </div>

          </div>            )}

        ))}          </div>

      </VStack>        ))}

      </VStack>

      {/* Footer motivacional */}

      {completedSteps.length < onboardingSteps.length && (      {/* Footer motivacional */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">      {completedSteps.length < onboardingSteps.length && (

          <HStack spacing={3}>        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <StarIcon className="w-5 h-5 text-blue-500" />          <HStack spacing={3}>

            <VStack align="start" spacing={1}>            <StarIcon className="w-5 h-5 text-blue-500" />

              <span className="font-medium text-blue-700">            <VStack align="start" spacing={1}>

                ¡Sigue adelante!              <span className="font-medium text-blue-700">

              </span>                ¡Sigue adelante!

              <span className="text-blue-600 text-sm">              </span>

                Completa {onboardingSteps.length - completedSteps.length} pasos más para desbloquear funcionalidades avanzadas.              <span className="text-blue-600 text-sm">

              </span>                Completa {onboardingSteps.length - completedSteps.length} pasos más para desbloquear funcionalidades avanzadas.

            </VStack>              </span>

          </HStack>            </VStack>

        </div>          </HStack>

      )}        </div>

    </VStack>      )}

  );    </VStack>

};  );
};
  compact?: boolean;
  showOnlyNext?: boolean;
  maxCapabilities?: number;
}

interface CapabilityCardProps {
  capabilityId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Tarjeta individual de capacidad con sus hitos
 */
const CapabilityCard: React.FC<CapabilityCardProps> = ({ 
  capabilityId, 
  isExpanded, 
  onToggle 
}) => {
  const router = useRouter();
  const { 
    getCapabilityProgress, 
    getPendingMilestones,
    isCapabilityActive,
    getCompletionPercentage 
  } = useAchievements();
  
  const [pendingMilestones, setPendingMilestones] = useState<MilestoneDefinition[]>([]);
  
  // Configuración de capacidad
  const capabilityConfig = CAPABILITY_MILESTONE_CONFIG[capabilityId];
  const progress = getCapabilityProgress(capabilityId);
  const isActive = isCapabilityActive(capabilityId);
  const completion = getCompletionPercentage(capabilityId);
  
  // Cargar hitos pendientes
  useEffect(() => {
    if (isExpanded && !isActive) {
      getPendingMilestones(capabilityId).then(setPendingMilestones);
    }
  }, [isExpanded, isActive, capabilityId, getPendingMilestones]);

  // Colores del tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  const activeBadgeColor = useColorModeValue('green', 'green');
  const pendingBadgeColor = useColorModeValue('orange', 'orange');

  /**
   * Maneja la navegación a una página específica para completar un hito
   */
  const handleMilestoneAction = (milestone: MilestoneDefinition) => {
    if (milestone.redirect_url) {
      router.push(milestone.redirect_url);
    }
  };

  if (!capabilityConfig) {
    return null;
  }

  return (
    <Card bg={cardBg} shadow="sm" borderWidth="1px">
      <CardBody p={4}>
        <VStack align="stretch" gap={3}>
          {/* Header de capacidad */}
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Icon as={TargetIcon} boxSize={5} color={isActive ? 'green.500' : 'gray.400'} />
              <VStack align="start" gap={1}>
                <Text fontWeight="semibold" fontSize="md">
                  {capabilityConfig.name}
                </Text>
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {capabilityConfig.description}
                </Text>
              </VStack>
            </HStack>
            
            <VStack align="end" gap={1}>
              <Badge 
                colorScheme={isActive ? activeBadgeColor : pendingBadgeColor}
                variant="subtle"
              >
                {isActive ? 'Activa' : 'Latente'}
              </Badge>
              {!isActive && (
                <Text fontSize="xs" color="gray.500">
                  {completion}% completado
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Barra de progreso */}
          {!isActive && (
            <Progress 
              value={completion} 
              colorScheme="blue" 
              bg={progressBg}
              borderRadius="full"
              height="8px"
            />
          )}

          {/* Estado activo o botón expandir */}
          {isActive ? (
            <HStack gap={2} justify="center" p={3} bg="green.50" borderRadius="md">
              <Icon as={CheckCircleIcon} color="green.500" />
              <Text color="green.700" fontWeight="medium" fontSize="sm">
                ¡Capacidad activada! Ya puedes usar todas sus funcionalidades.
              </Text>
              <Icon as={GiftIcon} color="green.500" />
            </HStack>
          ) : (
            <Button
              variant={isExpanded ? "solid" : "outline"}
              colorScheme="blue"
              size="sm"
              onClick={onToggle}
              rightIcon={isExpanded ? undefined : <PlayIcon />}
            >
              {isExpanded ? 'Ocultar hitos' : 'Ver hitos pendientes'}
            </Button>
          )}

          {/* Lista de hitos pendientes */}
          {isExpanded && !isActive && (
            <VStack align="stretch" gap={2} mt={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Hitos para activar esta capacidad:
              </Text>
              
              {pendingMilestones.map((milestone, index) => (
                <HStack
                  key={milestone.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                >
                  <HStack gap={3}>
                    <Icon 
                      as={CircleStackIcon} 
                      boxSize={4} 
                      color="gray.400" 
                    />
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {milestone.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {milestone.description}
                      </Text>
                      {milestone.estimated_minutes > 0 && (
                        <Text fontSize="xs" color="blue.600">
                          ~{milestone.estimated_minutes} min
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  
                  {milestone.redirect_url && (
                    <Tooltip label="Ir a completar este hito">
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="ghost"
                        rightIcon={<ArrowRightIcon />}
                        onClick={() => handleMilestoneAction(milestone)}
                      >
                        Completar
                      </Button>
                    </Tooltip>
                  )}
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Componente principal de la guía de activación
 */
export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  userId,
  compact = false,
  showOnlyNext = false,
  maxCapabilities = 6
}) => {
  const { selectedCapabilities } = useBusinessProfile();
  const { 
    progress,
    isLoading,
    error,
    totalCapabilities,
    activeCapabilities,
    overallProgress,
    refreshProgress
  } = useAchievements(userId);

  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());

  // Manejar carga inicial
  useEffect(() => {
    if (userId) {
      refreshProgress();
    }
  }, [userId, refreshProgress]);

  /**
   * Alterna la expansión de una capacidad
   */
  const toggleExpanded = (capabilityId: string) => {
    setExpandedCapabilities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(capabilityId)) {
        newSet.delete(capabilityId);
      } else {
        newSet.add(capabilityId);
      }
      return newSet;
    });
  };

  // Filtrar capacidades a mostrar
  const capabilitiesToShow = showOnlyNext 
    ? selectedCapabilities
        .filter(cap => !progress.find(p => p.capabilityId === cap && p.isActive))
        .slice(0, 1)
    : selectedCapabilities.slice(0, maxCapabilities);

  // Estados de carga y error
  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <VStack gap={4}>
            <Icon as={TrendingUpIcon} boxSize={8} color="blue.400" />
            <Text>Cargando tu progreso...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card borderColor="red.200">
        <CardBody>
          <VStack gap={3}>
            <Text color="red.600" fontWeight="medium">
              Error cargando progreso
            </Text>
            <Text fontSize="sm" color="gray.600">
              {error}
            </Text>
            <Button size="sm" onClick={refreshProgress}>
              Reintentar
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {/* Resumen de progreso */}
      {!compact && (
        <Card>
          <CardBody>
            <VStack gap={4}>
              <HStack justify="space-between" w="full">
                <VStack align="start" gap={1}>
                  <Text fontSize="lg" fontWeight="bold">
                    Progreso de Activación
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {activeCapabilities} de {totalCapabilities} capacidades activas
                  </Text>
                </VStack>
                
                <VStack align="end" gap={1}>
                  <HStack gap={2}>
                    <Icon as={StarIcon} color="yellow.400" />
                    <Text fontWeight="bold" fontSize="lg">
                      {overallProgress}%
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    completado
                  </Text>
                </VStack>
              </HStack>
              
              <Progress 
                value={overallProgress} 
                colorScheme="green" 
                bg="gray.100"
                borderRadius="full"
                height="12px"
              />
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Lista de capacidades */}
      <VStack align="stretch" gap={3}>
        {capabilitiesToShow.length === 0 ? (
          <Card>
            <CardBody>
              <VStack gap={3}>
                <Icon as={TargetIcon} boxSize={8} color="gray.400" />
                <Text color="gray.600">
                  No tienes capacidades seleccionadas para activar
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          capabilitiesToShow.map(capabilityId => (
            <CapabilityCard
              key={capabilityId}
              capabilityId={capabilityId}
              isExpanded={expandedCapabilities.has(capabilityId)}
              onToggle={() => toggleExpanded(capabilityId)}
            />
          ))
        )}
      </VStack>

      {/* Mensaje de motivación */}
      {!compact && activeCapabilities < totalCapabilities && (
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody>
            <HStack gap={3}>
              <Icon as={TrendingUpIcon} color="blue.500" boxSize={5} />
              <VStack align="start" gap={1}>
                <Text fontWeight="medium" color="blue.700">
                  ¡Sigue activando capacidades!
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Completa los hitos para desbloquear nuevas funcionalidades en tu sistema.
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default OnboardingGuide;