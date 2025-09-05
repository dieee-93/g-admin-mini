import { Decimal } from 'decimal.js';

// Set the precision for all Decimal instances created.
// 10 decimal places should be enough for most financial and inventory calculations.
Decimal.set({ precision: 10 });

// It's also a good practice to export the configured Decimal object
// so that you can be sure you're using the same configuration everywhere.
export default Decimal;
