import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RecipeBuilder } from './RecipeBuilder';
import { useMaterials } from '@/modules/materials/hooks/useMaterials';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

// Mocks
vi.mock('@/modules/materials/hooks/useMaterials', () => ({
    useMaterials: vi.fn()
}));

// Mock child components
vi.mock('./sections', () => ({
    BasicInfoSection: () => <div data-testid="basic-info-section">Basic Info</div>,
    InputsEditorSection: ({ features }: any) => (
        <div data-testid="inputs-section">
            Inputs Section {features?.showCostCalculation ? '(Costs Active)' : ''}
        </div>
    ),
    TeamAssignmentSection: () => <div data-testid="team-section">Team Section</div>,
}));

vi.mock('./sections/OutputConfigSection', () => ({
    OutputConfigSection: ({ overhead }: any) => <div data-testid="output-section">Overhead: {overhead}</div>
}));

vi.mock('./sections/CostSummarySection', () => ({
    CostSummarySection: () => <div data-testid="costs-section">Cost Summary</div>
}));

vi.mock('../RecipeProductionSection', () => ({
    RecipeProductionSection: () => <div data-testid="production-section">Production Section</div>
}));

// Helper to render with providers (The "Container" pattern)
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const system = createSystem(defaultConfig);

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider value={system}>
                {children}
            </ChakraProvider>
        </QueryClientProvider>
    );
};

const renderWithProviders = (ui: React.ReactElement) => {
    return render(ui, { wrapper: createWrapper() });
};

describe('RecipeBuilder Component', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useMaterials as any).mockReturnValue({
            data: [{ id: '1', name: 'Flour', unitCost: 10 }],
            isLoading: false
        });
    });

    it('should render all standard sections for create mode', () => {
        renderWithProviders(
            <RecipeBuilder
                mode="create"
                entityType="product"
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByTestId('basic-info-section')).toBeInTheDocument();
        expect(screen.getByTestId('inputs-section')).toBeInTheDocument();
        expect(screen.getByTestId('team-section')).toBeInTheDocument();
        expect(screen.getByTestId('output-section')).toBeInTheDocument();
        expect(screen.getByTestId('recipe-save-button')).toBeInTheDocument();
    });

    it('should show "Crear Receta" button text in create mode', () => {
        const { getByTestId } = renderWithProviders(
            <RecipeBuilder
                mode="create"
                entityType="product"
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );
        expect(getByTestId('recipe-save-button')).toHaveTextContent('Crear Receta');
    });

    it('should show "Guardar Cambios" button text in edit mode', () => {
        const { getByTestId } = renderWithProviders(
            <RecipeBuilder
                mode="edit"
                entityType="product"
                initialData={{ id: '123', name: 'Test Recipe' }}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );
        expect(getByTestId('recipe-save-button')).toHaveTextContent('Guardar Cambios');
    });

    it('should disable save button initially if validation fails', () => {
        // Assuming empty recipe is invalid
        const { getByTestId } = renderWithProviders(
            <RecipeBuilder
                mode="create"
                entityType="product"
                onSave={mockOnSave}
            />
        );
        expect(getByTestId('recipe-save-button')).toBeDisabled();
    });

    it('should call onCancel when cancel button is clicked', () => {
        renderWithProviders(
            <RecipeBuilder
                mode="create"
                entityType="product"
                onCancel={mockOnCancel}
            />
        );

        // Check for button presence, but do NOT depend on specific implementation like <Button> vs <button>
        // However, Chakra Button renders a button.
        const cancelBtn = screen.getByText(/Cancelar/i);
        fireEvent.click(cancelBtn);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should hide BasicInfoSection for minimal complexity material', () => {
        renderWithProviders(
            <RecipeBuilder
                mode="create"
                entityType="material"
                complexity="minimal"
            />
        );

        expect(screen.queryByTestId('basic-info-section')).not.toBeInTheDocument();
        expect(screen.getByTestId('inputs-section')).toBeInTheDocument();
    });

    it('should pass features down to sections', () => {
        renderWithProviders(
            <RecipeBuilder
                mode="create"
                entityType="product"
                features={{ showCostCalculation: true }}
            />
        );

        expect(screen.getByTestId('inputs-section')).toHaveTextContent('(Costs Active)');
    });
});
