@echo off
echo ==========================================
echo EventBus Enterprise - Complete Testing Suite
echo ==========================================
echo.

REM Create test-results directory if it doesn't exist
if not exist "test-results" mkdir test-results

echo [1/7] Running Unit Tests...
call npx vitest run src/lib/events/__tests__/unit --reporter=verbose --testTimeout=30000 --hookTimeout=15000 --bail=false --no-color > test-results/unit-tests.txt 2>&1
echo Unit Tests completed.

echo [2/7] Running Integration Tests...
call npx vitest run src/lib/events/__tests__/integration --reporter=verbose --testTimeout=60000 --hookTimeout=30000 --bail=false --no-color > test-results/integration-tests.txt 2>&1
echo Integration Tests completed.

echo [3/7] Running Business Logic Tests...
call npx vitest run src/lib/events/__tests__/business --reporter=verbose --testTimeout=60000 --hookTimeout=30000 --bail=false --no-color > test-results/business-tests.txt 2>&1
echo Business Logic Tests completed.

echo [4/7] Running Security Tests...
call npx vitest run src/lib/events/__tests__/security --reporter=verbose --testTimeout=90000 --hookTimeout=45000 --bail=false --no-color > test-results/security-tests.txt 2>&1
echo Security Tests completed.

echo [5/7] Running Distributed System Tests...
call npx vitest run src/lib/events/distributed/__tests__ --reporter=verbose --testTimeout=90000 --hookTimeout=45000 --bail=false --no-color > test-results/distributed-tests.txt 2>&1
echo Distributed Tests completed.

echo [6/7] Running Performance Tests...
call npx vitest run src/lib/events/__tests__/performance --reporter=verbose --testTimeout=120000 --hookTimeout=60000 --bail=false --no-color > test-results/performance-tests.txt 2>&1
echo Performance Tests completed.

echo [7/7] Generating Summary Report...
call npx vitest run src/lib/events/__tests__ --reporter=json --no-color --testTimeout=120000 --hookTimeout=60000 > test-results/eventbus-summary.json 2>&1
echo Summary Report generated.

echo.
echo ==========================================
echo Testing Complete! Check test-results/ folder
echo ==========================================
echo.
echo Files generated:
dir test-results\*.txt
dir test-results\*.json
echo.
echo Summary:
echo - unit-tests.txt (detailed unit test results)
echo - integration-tests.txt (integration test results)  
echo - business-tests.txt (business workflow tests)
echo - security-tests.txt (security hardening tests)
echo - distributed-tests.txt (distributed system tests)
echo - performance-tests.txt (performance benchmarks)
echo - eventbus-summary.json (structured summary)
echo.
pause