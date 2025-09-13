@echo off
echo ==========================================
echo EventBus V2.0 - Focused Error Analysis
echo ==========================================
echo.

REM Create test-results directory if it doesn't exist
if not exist "test-results" mkdir test-results

echo [FOCUS] Running only failing components for detailed analysis...

echo [1/3] DeduplicationManager (96%% complete - 1 TTL test failing)
call npx vitest run src/lib/events/v2/__tests__/unit/DeduplicationManager.test.ts --reporter=verbose --testTimeout=30000 --hookTimeout=15000 --bail=false --no-color > test-results/dedup-detailed.txt 2>&1
echo DeduplicationManager test completed.

echo [2/3] EventStore (timestamp and retrieval issues)
call npx vitest run src/lib/events/v2/__tests__/unit/EventStore.test.ts --reporter=verbose --testTimeout=30000 --hookTimeout=15000 --bail=false --no-color > test-results/eventstore-detailed.txt 2>&1
echo EventStore test completed.

echo [3/3] ModuleRegistry (dependency resolution issues)
call npx vitest run src/lib/events/v2/__tests__/unit/ModuleRegistry.test.ts --reporter=verbose --testTimeout=30000 --hookTimeout=15000 --bail=false --no-color > test-results/modules-detailed.txt 2>&1
echo ModuleRegistry test completed.

echo.
echo ==========================================
echo Focused Analysis Complete!
echo ==========================================
echo.
echo Files for analysis:
echo - dedup-detailed.txt (1 TTL test failing - 96%% working)
echo - eventstore-detailed.txt (timestamp filtering issues)
echo - modules-detailed.txt (dependency chain problems)
echo.
dir test-results\*.txt
echo.
pause