#Requires -Version 5.1
<#
.SYNOPSIS
    SwiftSale Developer Start Script
.DESCRIPTION
    Starts the full SwiftSale development environment in a single command:
      1. Ensures the local PostgreSQL Windows service is running
      2. Launches the .NET API in a new terminal window
      3. Launches the Vite frontend dev server in a new terminal window
      4. Opens the browser at http://localhost:5173

    URLs:
      Frontend  : http://localhost:5173
      API       : http://localhost:5126
      Swagger   : http://localhost:5126/swagger

    NOTE: This script uses the natively installed PostgreSQL (Windows service),
          not Docker. Docker is only required for the full production stack
          (see: docker compose -f deploy/compose/docker-compose.yml up --build).
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Write-Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok([string]$msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Skip([string]$msg) { Write-Host "  [SKIP] $msg" -ForegroundColor DarkGray }
function Write-Warn([string]$msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }

# ---------------------------------------------------------------------------
# Resolve project root
# ---------------------------------------------------------------------------
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) {
    $ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "  SwiftSale -- Developer Environment Start"   -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "  Project root : $ProjectRoot"                -ForegroundColor DarkGray
Write-Host "  Frontend     : http://localhost:5173"       -ForegroundColor DarkGray
Write-Host "  API          : http://localhost:5126"       -ForegroundColor DarkGray
Write-Host "  Swagger      : http://localhost:5126/swagger" -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 1 -- Ensure local PostgreSQL Windows service is running
# ---------------------------------------------------------------------------
Write-Step "Step 1/3 -- Checking PostgreSQL Service"

# Find any PostgreSQL service (covers postgresql-x64-16, postgresql-x64-18, etc.)
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($null -eq $pgService) {
    Write-Host "  [WARN] No local PostgreSQL Windows service found." -ForegroundColor Yellow
    Write-Host "         Make sure PostgreSQL is installed and the service exists." -ForegroundColor Yellow
    Write-Host "         Alternatively, start Docker Desktop and use the Docker Compose stack." -ForegroundColor Yellow
    $continue = Read-Host "  Continue anyway? (y/N)"
    if ($continue -notmatch '^[Yy]') { exit 1 }
} elseif ($pgService.Status -eq 'Running') {
    Write-Skip "$($pgService.DisplayName) is already running"
} else {
    Write-Host "  Starting $($pgService.DisplayName)..." -ForegroundColor White
    try {
        Start-Service -Name $pgService.Name
        Write-Ok "$($pgService.DisplayName) started"
    } catch {
        Write-Warn "Could not start PostgreSQL service: $_"
        Write-Warn "Try running this script as Administrator, or start the service manually."
        $continue = Read-Host "  Continue anyway? (y/N)"
        if ($continue -notmatch '^[Yy]') { exit 1 }
    }
}

# ---------------------------------------------------------------------------
# STEP 2 -- Start .NET API in a new terminal window
# ---------------------------------------------------------------------------
Write-Step "Step 2/3 -- Starting .NET API"

$apiDir = Join-Path $ProjectRoot "src\Api"
$apiCmd = "Set-Location '$apiDir'; Write-Host '--- SwiftSale API (http://localhost:5126) ---' -ForegroundColor Cyan; dotnet run --launch-profile http"

Write-Host "  Opening API terminal window..." -ForegroundColor White
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command", $apiCmd
)
Write-Ok "API terminal launched (http://localhost:5126)"

# Brief delay so windows open in a readable order
Start-Sleep -Seconds 2

# ---------------------------------------------------------------------------
# STEP 3 -- Start Vite frontend dev server in a new terminal window
# ---------------------------------------------------------------------------
Write-Step "Step 3/3 -- Starting Frontend Dev Server"

$webDir      = Join-Path $ProjectRoot "client\web"
$frontendCmd = "Set-Location '$webDir'; Write-Host '--- SwiftSale Frontend (http://localhost:5173) ---' -ForegroundColor Magenta; npm run dev"

Write-Host "  Opening Frontend terminal window..." -ForegroundColor White
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command", $frontendCmd
)
Write-Ok "Frontend terminal launched (http://localhost:5173)"

# ---------------------------------------------------------------------------
# Open browser after a short wait to let servers initialise
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "  Opening browser in 6 seconds (waiting for servers to start)..." -ForegroundColor Cyan
Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  SwiftSale dev environment is running!"       -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Frontend  -->  http://localhost:5173"
Write-Host "  API       -->  http://localhost:5126"
Write-Host "  Swagger   -->  http://localhost:5126/swagger"
Write-Host "---------------------------------------------" -ForegroundColor Green
Write-Host "  Close the two terminal windows to stop servers."
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
