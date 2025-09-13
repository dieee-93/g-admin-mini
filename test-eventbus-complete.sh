#!/bin/bash

echo "=========================================="
echo "EventBus V2.0 - Complete Testing Suite"
echo "=========================================="
echo

# Create test-results directory if it doesn't exist
mkdir -p test-results

echo "[1/5] Running Unit Tests..."
npx vitest run src/lib/events/v2/__tests__/unit --reporter=verbose --testTimeout=30000 > test-results/unit-tests.txt 2>&1

echo "[2/5] Running Integration Tests..."
npx vitest run src/lib/events/v2/__tests__/integration --reporter=verbose --testTimeout=60000 > test-results/integration-tests.txt 2>&1

echo "[3/5] Running Business Logic Tests..."
npx vitest run src/lib/events/v2/__tests__/business --reporter=verbose --testTimeout=60000 > test-results/business-tests.txt 2>&1

echo "[4/5] Running Performance Tests..."
npx vitest run src/lib/events/v2/__tests__/performance --reporter=verbose --testTimeout=120000 > test-results/performance-tests.txt 2>&1

echo "[5/5] Generating Summary Report..."
npx vitest run src/lib/events/v2/__tests__ --reporter=json --no-colors > test-results/eventbus-summary.json 2>&1

echo
echo "=========================================="
echo "Testing Complete! Check test-results/ folder"
echo "=========================================="
echo
echo "Files generated:"
echo "- unit-tests.txt (detailed unit test results)"
echo "- integration-tests.txt (integration test results)"  
echo "- business-tests.txt (business workflow tests)"
echo "- performance-tests.txt (performance benchmarks)"
echo "- eventbus-summary.json (structured summary)"
echo