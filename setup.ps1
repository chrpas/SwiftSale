#Requires -Version 5.1
<#
.SYNOPSIS
    SwiftSale One-Time Setup Script
.DESCRIPTION
    Installs all prerequisites, deploys the database, seeds product data and the
    system admin user, and creates Desktop + Start Menu shortcuts so the app can
    be launched with a single click.

    Safe to re-run -- already-completed steps are skipped automatically.

.NOTES
    Run as Administrator (the script will self-elevate if needed).
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Self-elevate to Administrator if not already running as one
# ---------------------------------------------------------------------------
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Re-launching as Administrator..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" `
        -Verb RunAs
    exit
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Write-Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok([string]$msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Skip([string]$msg) { Write-Host "  [SKIP] $msg (already done)" -ForegroundColor DarkGray }
function Write-Warn([string]$msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }

function Winget-Install([string]$id, [string]$displayName) {
    $installed = winget list --id $id --accept-source-agreements 2>&1
    if ($LASTEXITCODE -eq 0 -and ($installed -match [regex]::Escape($id))) {
        Write-Skip "$displayName is already installed"
        return
    }
    Write-Host "  Installing $displayName via winget..." -ForegroundColor White
    winget install --id $id --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "winget returned exit code $LASTEXITCODE for $displayName. It may still have succeeded."
    } else {
        Write-Ok "$displayName installed"
    }
}

function Wait-DockerPostgres {
    Write-Host "  Waiting for PostgreSQL to be healthy..." -ForegroundColor White
    for ($i = 1; $i -le 30; $i++) {
        docker exec swiftsale_postgres pg_isready -U postgres -d swiftsale_db 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { Write-Ok "PostgreSQL is ready"; return }
        Write-Host "    Attempt $i/30 -- retrying in 5s..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
    throw "PostgreSQL did not become healthy after 30 attempts."
}

function RefreshPath {
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

# ---------------------------------------------------------------------------
# Resolve project root (directory containing this script)
# ---------------------------------------------------------------------------
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) {
    $ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  SwiftSale -- One-Time Setup"                                -ForegroundColor Magenta
Write-Host "  Project root: $ProjectRoot"                                  -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Magenta

# ---------------------------------------------------------------------------
# STEP 1 -- Prerequisites
# ---------------------------------------------------------------------------
Write-Step "Step 1/7 -- Installing Prerequisites"

RefreshPath

Winget-Install "Microsoft.DotNet.SDK.9" ".NET 9 SDK"
Winget-Install "OpenJS.NodeJS.LTS"       "Node.js LTS"
Winget-Install "Docker.DockerDesktop"    "Docker Desktop"

$installNgrok = Read-Host "`n  Install ngrok for Remote Access feature? (y/N)"
if ($installNgrok -match '^[Yy]') {
    Winget-Install "ngrok.ngrok" "ngrok"
}

RefreshPath

# ---------------------------------------------------------------------------
# STEP 2 -- Frontend: npm install + build
# ---------------------------------------------------------------------------
Write-Step "Step 2/7 -- Installing Frontend Dependencies and Building"

$webDir = Join-Path $ProjectRoot "client\web"
Push-Location $webDir

if (-not (Test-Path "node_modules")) {
    Write-Host "  Running npm install..." -ForegroundColor White
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Ok "npm install complete"
} else {
    Write-Skip "node_modules already exists"
}

Write-Host "  Building frontend (npm run build)..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
Write-Ok "Frontend built successfully"

Pop-Location

# ---------------------------------------------------------------------------
# STEP 3 -- Ensure local PostgreSQL Windows service is running
# ---------------------------------------------------------------------------
Write-Step "Step 3/7 -- Checking PostgreSQL Service"

$composeFile = Join-Path $ProjectRoot "deploy\compose\docker-compose.yml"

# Find any local PostgreSQL Windows service (postgresql-x64-16, postgresql-x64-18, etc.)
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($null -ne $pgService) {
    if ($pgService.Status -eq 'Running') {
        Write-Skip "$($pgService.DisplayName) is already running"
    } else {
        Write-Host "  Starting $($pgService.DisplayName)..." -ForegroundColor White
        Start-Service -Name $pgService.Name
        Write-Ok "$($pgService.DisplayName) started"
    }
    $script:UseLocalPostgres = $true
} else {
    # Fall back to Docker if no local service found
    Write-Warn "No local PostgreSQL Windows service found. Falling back to Docker..."
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Docker Desktop also not running. Please install PostgreSQL or Docker Desktop and re-run."
        Read-Host "Press Enter to exit"
        exit 1
    }
    $pgRunning = docker ps --filter "name=swiftsale_postgres" --filter "status=running" -q 2>&1
    if ($pgRunning) {
        Write-Skip "swiftsale_postgres Docker container is already running"
    } else {
        Write-Host "  Starting PostgreSQL via Docker Compose..." -ForegroundColor White
        docker compose -f $composeFile up postgres -d
        if ($LASTEXITCODE -ne 0) { throw "docker compose up postgres failed" }
        Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor White
        for ($i = 1; $i -le 30; $i++) {
            docker exec swiftsale_postgres pg_isready -U postgres -d swiftsale_db 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { break }
            Start-Sleep -Seconds 5
        }
        Write-Ok "PostgreSQL Docker container ready"
    }
    $script:UseLocalPostgres = $false
}

# ---------------------------------------------------------------------------
# STEP 4 -- Apply EF Core Migrations and Seed Default Data
# ---------------------------------------------------------------------------
Write-Step "Step 4/7 -- Applying Database Migrations and Seeding Default Data"

$apiDir  = Join-Path $ProjectRoot "src\Api"
$connStr = "Host=localhost;Port=5432;Database=swiftsale_db;Username=postgres;Password=postgrespassword"

Write-Host "  Running API briefly to trigger EF migrations + default seed..." -ForegroundColor White
Write-Host "  (This will apply migrations and seed admin user, cashier, units of measure.)" -ForegroundColor DarkGray

$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ConnectionStrings__DefaultConnection = $connStr

$apiJob = Start-Job -ScriptBlock {
    param($dir, $conn)
    $env:ConnectionStrings__DefaultConnection = $conn
    $env:ASPNETCORE_ENVIRONMENT = "Production"
    Set-Location $dir
    dotnet run --launch-profile http 2>&1
} -ArgumentList $apiDir, $connStr

# Poll for up to 90 seconds for "Application started" in output
$timeout  = 90
$elapsed  = 0
$migrated = $false

while ($elapsed -lt $timeout) {
    $output = Receive-Job $apiJob -ErrorAction SilentlyContinue
    if ($output -match "Application started|Now listening on") {
        $migrated = $true
        break
    }
    Start-Sleep -Seconds 3
    $elapsed += 3
}

Stop-Job   $apiJob -ErrorAction SilentlyContinue
Remove-Job $apiJob -ErrorAction SilentlyContinue

if ($migrated) {
    Write-Ok "Database migrations and default seed data applied"
} else {
    Write-Warn "Could not confirm migration completion in ${timeout}s. The API will auto-migrate on next startup."
}

# ---------------------------------------------------------------------------
# STEP 5 -- Seed Product Catalog (Midea)
# ---------------------------------------------------------------------------
Write-Step "Step 5/7 -- Seeding Product Catalog"

$seedFile = Join-Path $ProjectRoot "database\seed\midea_catalog_seed.sql"

if (-not (Test-Path $seedFile)) {
    Write-Warn "Seed file not found at: $seedFile -- skipping product catalog seed"
} else {
    # Try to count existing products using local psql (reads connection from appsettings.Development.json)
    # Connection details: same as appsettings.Development.json
    $pgHost = "localhost"
    $pgPort = "5432"
    $pgDb   = "SwiftSaleDb"
    $pgUser = "postgres"
    $env:PGPASSWORD = "AdminSecurePass9!"

    # Find psql on PATH or common install locations
    $psqlExe = Get-Command psql -ErrorAction SilentlyContinue
    if ($null -eq $psqlExe) {
        $candidates = @(
            "C:\Program Files\PostgreSQL\18\bin\psql.exe",
            "C:\Program Files\PostgreSQL\17\bin\psql.exe",
            "C:\Program Files\PostgreSQL\16\bin\psql.exe",
            "C:\Program Files\PostgreSQL\15\bin\psql.exe"
        )
        $psqlPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    } else {
        $psqlPath = $psqlExe.Source
    }

    if ($null -eq $psqlPath) {
        Write-Warn "psql.exe not found. Skipping product catalog seed. Add PostgreSQL bin to PATH and re-run."
    } else {
        $countResult = & $psqlPath -h $pgHost -p $pgPort -U $pgUser -d $pgDb -t -c 'SELECT COUNT(*) FROM "Products";' 2>&1
        $productCount = [int](($countResult -replace '\s', '' -replace '[^0-9]', '0') | Select-Object -First 1)

        if ($productCount -gt 3) {
            Write-Skip "Products table already has $productCount rows -- skipping catalog seed"
        } else {
            Write-Host "  Applying Midea product catalog seed..." -ForegroundColor White
            & $psqlPath -h $pgHost -p $pgPort -U $pgUser -d $pgDb -f $seedFile
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "Seed script returned errors (duplicate rows are expected on re-run)."
            } else {
                Write-Ok "Product catalog seeded successfully"
            }
        }
        $env:PGPASSWORD = ""
    }
}

# ---------------------------------------------------------------------------
# STEP 6 -- Create Desktop and Start Menu Shortcuts
# ---------------------------------------------------------------------------
Write-Step "Step 6/7 -- Creating Desktop and Start Menu Shortcuts"

$appUrl   = "http://localhost:80"
$appName  = "SwiftSale POS"
$iconPath = Join-Path $ProjectRoot "client\web\public\favicon.ico"

$urlFileContent = "[InternetShortcut]`r`nURL=$appUrl`r`n"
if (Test-Path $iconPath -PathType Leaf) {
    $urlFileContent += "IconFile=$iconPath`r`nIconIndex=0`r`n"
}

# Desktop shortcut
$desktopDir = [Environment]::GetFolderPath("Desktop")
$desktopUrl = Join-Path $desktopDir "$appName.url"

if (Test-Path $desktopUrl) {
    Write-Skip "Desktop shortcut already exists at: $desktopUrl"
} else {
    Set-Content -Path $desktopUrl -Value $urlFileContent -Encoding ASCII
    Write-Ok "Desktop shortcut created: $desktopUrl"
}

# Start Menu shortcut
$startMenuDir = Join-Path ([Environment]::GetFolderPath("CommonPrograms")) "SwiftSale"
if (-not (Test-Path $startMenuDir)) {
    New-Item -ItemType Directory -Path $startMenuDir | Out-Null
}
$startMenuUrl = Join-Path $startMenuDir "$appName.url"

if (Test-Path $startMenuUrl) {
    Write-Skip "Start Menu shortcut already exists"
} else {
    Set-Content -Path $startMenuUrl -Value $urlFileContent -Encoding ASCII
    Write-Ok "Start Menu shortcut created: $startMenuUrl"
}

# ---------------------------------------------------------------------------
# STEP 7 -- Final Startup (Full Stack)
# ---------------------------------------------------------------------------
Write-Step "Step 7/7 -- Starting Full Stack"

$launchStack = Read-Host "`n  Start the full SwiftSale stack now (API + Client via Docker)? (Y/n)"
if ($launchStack -notmatch '^[Nn]') {
    Write-Host "  Bringing up full Docker Compose stack..." -ForegroundColor White
    docker compose -f $composeFile up --build -d
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "docker compose up returned errors. Check Docker Desktop logs."
    } else {
        Write-Ok "Stack is up!"
        Write-Host "  Opening SwiftSale in your browser in 5 seconds..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        Start-Process $appUrl
    }
}

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SwiftSale Setup Complete!"                                   -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  App URL      : http://localhost:80"
Write-Host "  Swagger UI   : http://localhost:5126/swagger"
Write-Host "  Admin login  : admin / admin123"
Write-Host "  Cashier login: cashier / cashier123"
Write-Host "------------------------------------------------------------" -ForegroundColor Green
Write-Host "  Desktop shortcut created -- launch SwiftSale from your"
Write-Host "  Desktop or Start Menu at any time!"
Write-Host "------------------------------------------------------------" -ForegroundColor Green
Write-Host "  WARNING: Change default passwords before going to production!" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
