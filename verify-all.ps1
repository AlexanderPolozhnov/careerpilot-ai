# CareerPilot AI - Validation Script (Final Stable Version)
$ErrorActionPreference = "Continue"
$Failed = $false
$ProjectRoot = Get-Location
$LogDir = "$ProjectRoot/docs/logs/validation"

if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force }

$BackendLog = "$LogDir/backend_last_run.log"
$FrontendLog = "$LogDir/frontend_last_run.log"
$SummaryLog = "$LogDir/validation_summary.txt"

function Log-Summary($Text, $Color = "White") {
    Write-Host $Text -ForegroundColor $Color
    $Text | Add-Content -Path $SummaryLog
}

# Очистка
"=== VALIDATION: $(Get-Date) ===" | Set-Content -Path $SummaryLog -Encoding utf8

# --- 1. BACKEND ---
Log-Summary "`n[1/2] === BACKEND VALIDATION (Java/Maven) ===" "Cyan"
Set-Location backend
$output = ./mvnw.cmd clean test -Dtest="!CareerpilotAiApplicationTests" --no-transfer-progress 2>&1
# Превращаем всё в чистые строки и пишем в файл
$output | ForEach-Object { $_.ToString() } | Set-Content -Path $BackendLog -Encoding utf8
# Выводим в консоль
$output | ForEach-Object { $_.ToString() } | Write-Host
if ($LASTEXITCODE -ne 0) { 
    Log-Summary "Backend tests FAILED. Check $BackendLog" "Red"
    $Failed = $true 
} else {
    Log-Summary "Backend: OK" "Green"
}
Set-Location $ProjectRoot

# --- 2. FRONTEND ---
Log-Summary "`n[2/2] === FRONTEND VALIDATION (React/Vite/TypeScript) ===" "Cyan"
Set-Location frontend
$env:FORCE_COLOR = "0"

try {
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npx pnpm install --frozen-lockfile --silent 2>&1 | Out-Null

    Write-Host "Running build, lint, and tests..." -ForegroundColor Gray
    # Запускаем всё вместе для простоты
    $fOutput = cmd /c "npm run build && npm run lint && npm run test" 2>&1
    $fOutput | ForEach-Object { $_.ToString() } | Set-Content -Path $FrontendLog -Encoding utf8
    $fOutput | ForEach-Object { $_.ToString() } | Write-Host

    if ($LASTEXITCODE -ne 0) { 
        Log-Summary "Frontend validation FAILED. Check $FrontendLog" "Red"
        $Failed = $true 
    } else {
        Log-Summary "Frontend: OK" "Green"
    }
} catch {
    Log-Summary "Frontend error: $_" "Red"
    $Failed = $true
} finally {
    $env:FORCE_COLOR = ""
}
Set-Location $ProjectRoot

# --- FINAL ---
Log-Summary "`n========================================" "Cyan"
if ($Failed) {
    Log-Summary "VALIDATION FAILED." "Red"
    exit 1
} else {
    Log-Summary "ALL CHECKS PASSED. Success!" "Green"
    exit 0
}
