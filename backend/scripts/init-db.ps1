<#
init-db.ps1
Simple PowerShell helper to create the local database and apply backend/db/schema.sql using values from backend/.env
Run from repo root: .\backend\scripts\init-db.ps1
#>

$scriptPath = $PSScriptRoot
$repoBackend = Join-Path $scriptPath '..'
$envFile = Join-Path $repoBackend '.env'
$schemaFile = Join-Path $repoBackend 'db\schema.sql'

if (-not (Test-Path $envFile)) {
    Write-Error "Env file not found at $envFile. Copy .env.example to .env and edit values first."
    exit 1
}
if (-not (Test-Path $schemaFile)) {
    Write-Error "Schema file not found at $schemaFile"
    exit 1
}

# Load .env (KEY=VALUE). This is a conservative parser.
foreach ($raw in Get-Content $envFile) {
    $line = $raw.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { continue }
    $idx = $line.IndexOf('=')
    if ($idx -lt 0) { continue }
    $name = $line.Substring(0,$idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    # remove surrounding single or double quotes if present
    if ($value.Length -ge 2) {
        if (($value.StartsWith("'") -and $value.EndsWith("'")) -or ($value.StartsWith('"') -and $value.EndsWith('"'))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
    }
    Set-Variable -Name $name -Value $value -Scope Global
}

if (-not (Get-Variable -Name PGPASSWORD -Scope Global -ErrorAction SilentlyContinue)) {
    Write-Error 'PGPASSWORD not found in .env. Please set it before running this script.'
    exit 1
}
$env:PGPASSWORD = $PGPASSWORD

Write-Host 'Using:'
Write-Host "  PGHOST=$PGHOST"
Write-Host "  PGUSER=$PGUSER"
Write-Host "  PGDATABASE=$PGDATABASE"
Write-Host "  PGPORT=$PGPORT"

function Find-Exe($name) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $possible = @(
        "C:\\Program Files\\PostgreSQL\\15\\bin\\$name.exe",
        "C:\\Program Files\\PostgreSQL\\14\\bin\\$name.exe",
        "C:\\Program Files\\PostgreSQL\\13\\bin\\$name.exe"
    )
    foreach ($p in $possible) { if (Test-Path $p) { return $p } }
    return $null
}

$createdbExe = Find-Exe 'createdb'
$psqlExe = Find-Exe 'psql'
if (-not $psqlExe) { Write-Error 'psql not found on PATH and not in common locations. Install Postgres or add psql to PATH.'; exit 1 }

# Create DB (if createdb available)
if ($createdbExe) {
    & $createdbExe -h $PGHOST -U $PGUSER $PGDATABASE 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'createdb returned non-zero exit code or DB may already exist (this is usually OK).'
    } else {
        Write-Host "Database $PGDATABASE created or already existed."
    }
} else {
    & $psqlExe -h $PGHOST -U $PGUSER -c "CREATE DATABASE \"$PGDATABASE\";" 2>$null
}

Write-Host "Applying schema from $schemaFile ..."
& $psqlExe -h $PGHOST -U $PGUSER -d $PGDATABASE -f $schemaFile
if ($LASTEXITCODE -eq 0) {
    Write-Host 'Schema applied successfully.'
} else {
    Write-Error "psql exited with code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Init finished. You can connect using psql -h $PGHOST -U $PGUSER -d $PGDATABASE"