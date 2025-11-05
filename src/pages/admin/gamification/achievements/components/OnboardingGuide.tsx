import { VStack } from '@/shared/ui';

interface OnboardingGuideProps {
  userId?: string;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ userId }) => {
  return (
    <VStack align="stretch" gap="4">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2">Guía de Inicio</h3>
        <p className="text-sm text-gray-600">
          Bienvenido a tu panel de logros. Completa actividades para ganar puntos y desbloquear nuevas funcionalidades.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 text-blue-500">⭐</div>
          <div>
            <p className="font-medium text-blue-700">¡Explora tus logros!</p>
            <p className="text-blue-600 text-sm">
              Cambia entre vista de galaxia y grilla para ver tus achievements.
            </p>
          </div>
        </div>
      </div>
    </VStack>
  );
};