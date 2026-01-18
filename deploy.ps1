$ErrorActionPreference = "Stop"

Write-Host "Reading configuration..."

if (-not (Test-Path .env)) {
    Write-Error ".env file not found."
    exit 1
}

$config = @{}
$lines = Get-Content .env
foreach ($line in $lines) {
    if ($line -match "=") {
        $parts = $line -split "=", 2
        $key = $parts[0].Trim()
        $val = $parts[1].Trim()
        $config[$key] = $val
    }
}

$gemini = $config["GEMINI_API_KEY"]
$url =    $config["CF_WORKER_URL"]
$token =  $config["CF_WORKER_TOKEN"]

if (-not $gemini -or -not $url -or -not $token) {
    Write-Error "Missing required keys in .env"
    exit 1
}

# Construct the environment variable string simply
$envString = "GEMINI_API_KEY=" + $gemini + ",CF_WORKER_URL=" + $url + ",CF_WORKER_TOKEN=" + $token

Write-Host "Deploying to Cloud Run..."
Write-Host "Env Vars configured."

gcloud run deploy pokemon-fusion-lab --source . --region us-central1 --allow-unauthenticated --port 3001 --set-env-vars $envString
