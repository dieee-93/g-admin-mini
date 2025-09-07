/**
 * TEST COMPONENT: useCrudOperations Hook
 * 
 * Este componente es para probar que el fix del "Maximum update depth exceeded" funciona
 * y que useCrudOperations se comporta correctamente sin ciclos infinitos.
 */

import React, { useEffect, useState } from 'react';
import { useCrudOperations } from '@/hooks/core/useCrudOperations';
import { z } from 'zod';

// Tipo simple para testing
interface TestItem {
  id?: string;
  name: string;
  description?: string;
  created_at?: string;
}

// Schema simple para testing
const testSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  created_at: z.string().optional()
});

export function TestCrudOperations() {
  const [renderCount, setRenderCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Incrementar contador de renders para detectar ciclos infinitos
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Test del hook useCrudOperations
  const {
    items,
    loading,
    error,
    form,
    fetchAll,
    create,
    update,
    remove,
    refresh,
    startCreate,
    startEdit,
    saveForm,
    cancelForm,
    resetForm,
    searchItems,
    filterItems,
    isSubscribed
  } = useCrudOperations<TestItem>({
    tableName: 'test_items', // Tabla que no existe, pero eso está bien para testing
    selectQuery: '*',
    schema: testSchema, // Schema simple para testing
    enableRealtime: false, // Deshabilitamos realtime para evitar errores de conexión
    cacheKey: 'test-crud',
    cacheTime: 60000,
    
    onSuccess: (action, data) => {
      console.log('✅ CRUD Success:', action, data);
    },
    
    onError: (action, error) => {
      console.log('❌ CRUD Error:', action, error);
    }
  });

  // Test que el hook no causa bucles infinitos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (renderCount > 10) {
        setStatus('error');
        console.error('❌ INFINITE RENDER LOOP DETECTED! Render count:', renderCount);
      } else if (renderCount >= 3 && status === 'idle') {
        setStatus('testing');
        // Dar tiempo para que se estabilice
        setTimeout(() => {
          if (renderCount < 10) {
            setStatus('success');
            console.log('✅ Hook stable after', renderCount, 'renders');
          }
        }, 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [renderCount, status]);

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
        <strong>Render Count:</strong> {renderCount}
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
        Component rendered {renderCount} times
        <br />
        {renderCount > 5 && '⚠️ High render count - check for infinite loops'}
        <br />
        {renderCount <= 3 && '✅ Normal render count'}
      </div>
    </div>
  );
}

export default TestCrudOperations;
