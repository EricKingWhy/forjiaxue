# ForJiaXue Deployment Verification (T161)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/verify-deployment.ps1
# Idempotent: builds, waits for healthy, checks all endpoints, reports.
# Does NOT write any data into git — only hits read-only public APIs.

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)

Write-Host "=== ForJiaXue Deployment Verification ===" -ForegroundColor Cyan

# --- 1. Build & start ---
Write-Host "`n[1/4] Building and starting containers..." -ForegroundColor Yellow
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

# --- 2. Wait for healthy ---
Write-Host "`n[2/4] Waiting for services to become healthy (up to 120s)..." -ForegroundColor Yellow
$deadline = (Get-Date).AddSeconds(120)
$healthy = $false
while ((Get-Date) -lt $deadline) {
    $json = docker compose ps --format json 2>$null
    if ($json) {
        $rows = $json -split "`n" | Where-Object { $_.Trim() } | ForEach-Object { $_ | ConvertFrom-Json }
        $be = $rows | Where-Object { $_.Service -eq 'backend' }
        $fe = $rows | Where-Object { $_.Service -eq 'frontend' }
        if ($be -and $fe -and $be.Health -eq 'healthy' -and $fe.Health -eq 'healthy') {
            $healthy = $true; break
        }
    }
    Start-Sleep -Seconds 3
}
if (-not $healthy) {
    docker compose ps
    Write-Host "`n--- Recent logs ---" -ForegroundColor Gray
    docker compose logs --tail=40
    throw "Services did not become healthy in 120s"
}
Write-Host "  Both services healthy." -ForegroundColor Green

# --- 3. Backend APIs (read-only public endpoints) ---
Write-Host "`n[3/4] Verifying backend APIs..." -ForegroundColor Yellow
$failed = $false
$apis = @('/api/health', '/api/photos', '/api/music', '/api/config', '/api/blessing')
foreach ($ep in $apis) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8000$ep" -UseBasicParsing -TimeoutSec 10
        Write-Host ("  OK   {0,-18} ({1})" -f $ep, $r.StatusCode) -ForegroundColor Green
    } catch {
        Write-Host ("  FAIL {0,-18} ({1})" -f $ep, $_.Exception.Message) -ForegroundColor Red
        $failed = $true
    }
}

# --- 4. Frontend ---
Write-Host "`n[4/4] Verifying frontend..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/ForJiaXue" -UseBasicParsing -TimeoutSec 10
    Write-Host ("  OK   /ForJiaXue          ({0})" -f $r.StatusCode) -ForegroundColor Green
} catch {
    Write-Host ("  FAIL /ForJiaXue          ({0})" -f $_.Exception.Message) -ForegroundColor Red
    $failed = $true
}

# --- Summary ---
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($failed) {
    Write-Host "Some checks FAILED. Inspect: docker compose logs" -ForegroundColor Red
    exit 1
} else {
    Write-Host "All checks passed." -ForegroundColor Green
    Write-Host "App:   http://localhost:3000/ForJiaXue" -ForegroundColor White
    Write-Host "API:   http://localhost:8000/api/health" -ForegroundColor White
    Write-Host "Stop:  docker compose down" -ForegroundColor DarkGray
}
