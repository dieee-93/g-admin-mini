#!/bin/bash
echo "Fixing EventBus imports systematically..."

# Fix unit tests - from __tests__/unit/ perspective (need ../../)
echo "Fixing unit tests..."
find src/lib/events/__tests__/unit/ -name "*.ts" -exec sed -i 's|from '\''../types-v3'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/unit/ -name "*.ts" -exec sed -i 's|from '\''../types'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/unit/ -name "*.ts" -exec sed -i 's|from '\''../utils/|from '\''../../utils/|g' {} \;

# Fix integration tests - from __tests__/integration/ perspective (need ../../) 
echo "Fixing integration tests..."
find src/lib/events/__tests__/integration/ -name "*.ts" -exec sed -i 's|from '\''../types'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/integration/ -name "*.ts" -exec sed -i 's|from '\''../utils/|from '\''../../utils/|g' {} \;

# Fix business tests - from __tests__/business/ perspective (need ../../)
echo "Fixing business tests..."
find src/lib/events/__tests__/business/ -name "*.ts" -exec sed -i 's|from '\''../types'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/business/ -name "*.ts" -exec sed -i 's|from '\''../utils/|from '\''../../utils/|g' {} \;

# Fix performance tests - from __tests__/performance/ perspective (need ../../)
echo "Fixing performance tests..."
find src/lib/events/__tests__/performance/ -name "*.ts" -exec sed -i 's|from '\''../types'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/performance/ -name "*.ts" -exec sed -i 's|from '\''../utils/|from '\''../../utils/|g' {} \;

# Fix security tests - from __tests__/security/ perspective (need ../../)
echo "Fixing security tests..."
find src/lib/events/__tests__/security/ -name "*.ts" -exec sed -i 's|from '\''../types'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/security/ -name "*.ts" -exec sed -i 's|from '\''../utils/|from '\''../../utils/|g' {} \;

# Fix over-corrected paths (../../../ should be ../../)
echo "Fixing over-corrected paths..."
find src/lib/events/__tests__/ -name "*.ts" -exec sed -i 's|from '\''../../../types'\''|from '\''../../types'\''|g' {} \;
find src/lib/events/__tests__/ -name "*.ts" -exec sed -i 's|from '\''../../../utils/|from '\''../../utils/|g' {} \;

echo "All import fixes completed!"