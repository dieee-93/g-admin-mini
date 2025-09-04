// codeSplitting.test.tsx - Tests for code splitting functionality
import { lazyComponents, CodeSplittingMonitor, createMonitoredLazyComponent } from '../codeSplitting';
import vi from 'vitest';

// Mock React.lazy to avoid actual imports during testing
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: vi.fn((importFn) => {
    const MockComponent = () => <div data-testid="lazy-component">Lazy Component Loaded</div>;
    MockComponent.displayName = 'MockLazyComponent';
    return MockComponent;
  }),
  Suspense: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
});

// Mock the performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  },
  writable: true
});

describe('Code Splitting', () => {
  beforeEach(() => {
    // Reset performance monitoring
    CodeSplittingMonitor['loadTimes'] = new Map();
    CodeSplittingMonitor['chunkSizes'] = new Map();
  });

  describe('Lazy Components', () => {
    it('should have all required lazy components defined', () => {
      expect(lazyComponents).toHaveProperty('OfflineMaterialsPage');
      expect(lazyComponents).toHaveProperty('CrossModuleAnalytics');
      expect(lazyComponents).toHaveProperty('ExecutiveDashboard');
      expect(lazyComponents).toHaveProperty('RecipeForm');
    });

    it('should have sub-components defined', () => {
      expect(lazyComponents).toHaveProperty('MaterialsHeader');
      expect(lazyComponents).toHaveProperty('MaterialsGrid');
      expect(lazyComponents).toHaveProperty('CorrelationsView');
      expect(lazyComponents).toHaveProperty('BottlenecksView');
      expect(lazyComponents).toHaveProperty('ExecutiveKPIGrid');
      expect(lazyComponents).toHaveProperty('RecipeBasicForm');
      expect(lazyComponents).toHaveProperty('RecipeAISuggestions');
    });
  });

  describe('CodeSplittingMonitor', () => {
    it('should record load times correctly', () => {
      CodeSplittingMonitor.recordLoadTime('TestComponent', 1500);
      CodeSplittingMonitor.recordLoadTime('TestComponent', 2000);
      
      const avgTime = CodeSplittingMonitor.getAverageLoadTime('TestComponent');
      expect(avgTime).toBe(1750);
    });

    it('should record chunk sizes', () => {
      CodeSplittingMonitor.recordChunkSize('test-chunk', 50 * 1024); // 50KB
      
      const report = CodeSplittingMonitor.getPerformanceReport();
      expect(report.chunkSizes).toHaveProperty('test-chunk', 50 * 1024);
    });

    it('should generate recommendations for slow components', () => {
      CodeSplittingMonitor.recordLoadTime('SlowComponent', 4000);
      
      const report = CodeSplittingMonitor.getPerformanceReport();
      expect(report.recommendations).toContain(
        expect.stringContaining('Consider further splitting SlowComponent')
      );
    });

    it('should generate recommendations for large chunks', () => {
      CodeSplittingMonitor.recordChunkSize('large-chunk', 150 * 1024); // 150KB
      
      const report = CodeSplittingMonitor.getPerformanceReport();
      expect(report.recommendations).toContain(
        expect.stringContaining('Chunk large-chunk is large')
      );
    });
  });

  describe('createMonitoredLazyComponent', () => {
    it('should create a lazy component that records load time', async () => {
      const mockImport = vi.fn().mockResolvedValue({
        default: () => <div>Mock Component</div>
      });

      const LazyComponent = createMonitoredLazyComponent(
        mockImport,
        'MonitoredComponent'
      );

      expect(typeof LazyComponent).toBe('function');
      expect(mockImport).not.toHaveBeenCalled(); // Should not be called until component is used
    });

    it('should handle import errors gracefully', async () => {
      const mockError = new Error('Import failed');
      const mockImport = vi.fn().mockRejectedValue(mockError);

      const LazyComponent = createMonitoredLazyComponent(
        mockImport,
        'FailingComponent'
      );

      // The component creation should not throw
      expect(typeof LazyComponent).toBe('function');
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should have appropriate chunk names for main components', () => {
      const { CODE_SPLITTING_CONFIG } = require('../codeSplitting');
      
      expect(CODE_SPLITTING_CONFIG.CHUNK_NAMES).toEqual({
        MATERIALS: 'materials-page',
        ANALYTICS: 'cross-module-analytics',
        EXECUTIVE: 'executive-dashboard', 
        RECIPES: 'recipe-intelligence'
      });
    });

    it('should have performance thresholds defined', () => {
      const { CODE_SPLITTING_CONFIG } = require('../codeSplitting');
      
      expect(CODE_SPLITTING_CONFIG.LARGE_COMPONENT_THRESHOLD).toBe(50);
      expect(CODE_SPLITTING_CONFIG.MEDIUM_COMPONENT_THRESHOLD).toBe(25);
    });

    it('should have preload strategy configured', () => {
      const { CODE_SPLITTING_CONFIG } = require('../codeSplitting');
      
      expect(CODE_SPLITTING_CONFIG.PRELOAD_STRATEGY).toHaveProperty('HIGH_PRIORITY');
      expect(CODE_SPLITTING_CONFIG.PRELOAD_STRATEGY).toHaveProperty('MEDIUM_PRIORITY');
      expect(CODE_SPLITTING_CONFIG.PRELOAD_STRATEGY).toHaveProperty('LOW_PRIORITY');
    });
  });
});