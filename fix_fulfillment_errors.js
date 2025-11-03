// Lista de archivos con errores any y sus correcciones
const fixes = [
  {
    file: 'src/modules/fulfillment/services/fulfillmentService.ts',
    patches: [
      { line: 67, old: 'order?: any;', new: 'order?: { id: string; number?: string; total?: string; customer?: { id: string; name: string; email: string; phone?: string; type?: string }; items?: unknown[]; location_id?: string; };' },
      { line: 382, old: 'const updates: any = {', new: 'const updates: { status: QueueStatus; updated_at: string; actual_ready_time?: string; metadata?: OrderMetadata } = {' },
      { line: 501, old: 'order: any,', new: 'order: { total?: string; customer?: { type?: string } },'}
    ]
  }
];

console.log('Fix script ready - run manually');
