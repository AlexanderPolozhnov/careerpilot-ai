# CareerPilot AI - Project Validation Script
$ErrorActionPreference = "Stop"
$Failed = $false

Write-Host "`n[1/2] === BACKEND VALIDATION (Java/Maven) ===" -ForegroundColor Cyan
try {
    Set-Location backend
    ./mvnw.cmd clean test -Dtest="!CareerpilotAiApplicationTests" --no-transfer-progress
    if ($LASTEXITCODE -ne 0) { throw "Backend tests failed" }
    Set-Location ..
    Write-Host "Backend: OK" -ForegroundColor Green
} catch {
    Write-Host "BACKEND ERROR: $_" -ForegroundColor Red
    $Failed = $true
    Set-Location ..
}

Write-Host "`n[2/2] === FRONTEND VALIDATION (React/Vite/TypeScript) ===" -ForegroundColor Cyan
try {
    Set-Location frontend
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npx pnpm install --frozen-lockfile --silent
    
    Write-Host "Type check and build..." -ForegroundColor Gray
    npx pnpm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    
    Write-Host "Linting..." -ForegroundColor Gray
    npx pnpm run lint
    if ($LASTEXITCODE -ne 0) { throw "Frontend lint failed" }
    
    Write-Host "Testing..." -ForegroundColor Gray
    npx pnpm run test
    if ($LASTEXITCODE -ne 0) { throw "Frontend tests failed" }
    
    Set-Location ..
    Write-Host "Frontend: OK" -ForegroundColor Green
} catch {
    Write-Host "FRONTEND ERROR: $_" -ForegroundColor Red
    $Failed = $true
    Set-Location ..
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($Failed) {
    Write-Host "VALIDATION FAILED. Fix errors before pushing!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "ALL CHECKS PASSED. You can push!" -ForegroundColor Green
    exit 0
}
