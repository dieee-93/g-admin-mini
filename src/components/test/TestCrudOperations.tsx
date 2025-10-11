/**
 * TEST COMPONENT: useCrudOperations Hook
 * 
 * Este componente es para probar que el fix del "Maximum update depth exceeded" funciona
 * y que useCrudOperations se comporta correctamente sin ciclos infinitos.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCrudOperations } from '@/hooks/core/useCrudOperations';
import { z } from 'zod';

// Tipo simple para testing
interface TestItem {
  id?: string;
  name: string;
  description?: string;
  created_at?: string;
}

// Tipo para tracking de valores entre renders
interface RenderValues {
  items: number;
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
  status: string;
}

// Schema simple para testing - ✅ MOVIDO FUERA para evitar recreación
const testSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  created_at: z.string().optional()
});

// ✅ Default values estables
const defaultValues = {
  name: '',
  description: ''
};

export function TestCrudOperations() {
  const renderCountRef = useRef(0);
  const previousValuesRef = useRef<RenderValues>({
    items: 0,
    loading: false,
    error: null,
    isSubscribed: false,
    status: 'idle'
  });
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // ✅ Incrementar contador de renders sin causar re-renders
  renderCountRef.current += 1;

  // 🔍 Log cada render para debugging
  console.log(`🔄 TestCrudOperations render #${renderCountRef.current}`);

  // ✅ Stable callbacks to prevent hook from recreating functions
  const onSuccess = useCallback((action: string, data: unknown) => {
    console.log('✅ CRUD Success:', action, data);
  }, []);

  const onError = useCallback((action: string, error: unknown) => {
    console.log('❌ CRUD Error:', action, error);
  }, []);

  // Test del hook useCrudOperations
  const {
    items,
    loading,
    error,
    form,
    fetchAll,
    refresh,
    startCreate,
    cancelForm,
    resetForm,
    searchItems,
    filterItems,
    isSubscribed
  } = useCrudOperations<TestItem>({
    tableName: 'test_items', // Tabla que no existe, pero eso está bien para testing
    selectQuery: '*',
    schema: testSchema, // Schema simple para testing - ahora estable
    defaultValues, // ✅ Valores por defecto estables
    enableRealtime: false, // Deshabilitamos realtime para evitar errores de conexión
    cacheKey: 'test-crud',
    cacheTime: 60000,
    onSuccess,
    onError
  });

  // 🔍 Track what changed between renders
  const currentValues: RenderValues = {
    items: items.length,
    loading,
    error,
    isSubscribed,
    status
  };

  // Check what changed
  useEffect(() => {
    const previous = previousValuesRef.current;
    const changes: string[] = [];

    (Object.keys(currentValues) as Array<keyof RenderValues>).forEach(key => {
      if (previous[key] !== currentValues[key]) {
        changes.push(`${key}: ${previous[key]} → ${currentValues[key]}`);
      }
    });

    if (changes.length > 0) {
      console.log(`🔍 Render #${renderCountRef.current} caused by:`, changes);
    }

    previousValuesRef.current = { ...currentValues };
  });

  // Test que el hook no causa bucles infinitos
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentRenderCount = renderCountRef.current;
      if (currentRenderCount > 10) {
        setStatus('error');
        console.error('❌ INFINITE RENDER LOOP DETECTED! Render count:', currentRenderCount);
      } else if (currentRenderCount >= 3 && status === 'idle') {
        setStatus('testing');
        // Dar tiempo para que se estabilice
        setTimeout(() => {
          if (renderCountRef.current < 10) {
            setStatus('success');
            console.log('✅ Hook stable after', renderCountRef.current, 'renders');
          }
        }, 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [status]); // ✅ Solo depende de status, no de renderCount

  const handleTestBasicOperations = async () => {
    try {
      console.log('🧪 Testing basic CRUD operations...');
      
      // Test fetchAll
      console.log('Testing fetchAll...');
      await fetchAll();
      
      // Test form operations
      console.log('Testing form operations...');
      startCreate();
      form.setValue('name', 'Test Item');
      form.setValue('description', 'Test Description');
      
      resetForm();
      cancelForm();
      
      // Test search/filter
      console.log('Testing search/filter...');
      const searchResults = searchItems('test', ['name', 'description']);
      const filterResults = filterItems(item => item.name.includes('test'));
      
      console.log('Search results:', searchResults.length);
      console.log('Filter results:', filterResults.length);
      
      console.log('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'testing': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success': return '✅ Hook is stable - No infinite renders detected!';
      case 'error': return '❌ INFINITE RENDER LOOP DETECTED!';
      case 'testing': return '🧪 Testing hook stability...';
      default: return '⏳ Initializing test...';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 useCrudOperations Test Component</h2>
      
      {/* Status del test */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: getStatusColor() + '22',
        border: `2px solid ${getStatusColor()}`,
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <strong>Test Status:</strong> {getStatusMessage()}
        <br />
        <strong>Render Count:</strong> {renderCountRef.current}
        <br />
        <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        <br />
        <strong>Error:</strong> {error || 'None'}
        <br />
        <strong>Items Count:</strong> {items.length}
        <br />
        <strong>Realtime Subscribed:</strong> {isSubscribed ? 'Yes' : 'No'}
      </div>

      {/* Botones de test */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleTestBasicOperations}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 Test Basic Operations
        </button>
        
        <button 
          onClick={refresh}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Test Refresh
        </button>
      </div>

      {/* Información del formulario */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>Form State:</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(form.formState, null, 2)}
        </pre>
      </div>

      {/* Log de renders */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f1f1f1',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <strong>Performance Log:</strong>
        <br />
        Component rendered {renderCountRef.current} times
        <br />
        {renderCountRef.current > 5 && '⚠️ High render count - check for infinite loops'}
        <br />
        {renderCountRef.current <= 3 && '✅ Normal render count'}
      </div>
    </div>
  );
}

export default TestCrudOperations;
