param(
    [string]$Token,
    [string]$RepoName = "cyber-runner-3d"
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept"        = "application/vnd.github+json"
    "User-Agent"    = "Antigravity-Uploader"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# 1. Get authenticated user
Write-Host "Verifying GitHub authentication..."
try {
    $userRes = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
    $username = $userRes.login
    Write-Host "Authenticated as: $username"
} catch {
    Write-Error "Authentication failed: $_"
    exit 1
}

# 2. Create repository if not exists
Write-Host "Creating/Checking repository '$RepoName'..."
$repoExists = $false
try {
    $repoRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName" -Headers $headers -Method Get
    $repoExists = $true
    Write-Host "Repository already exists."
} catch {
    Write-Host "Creating new repository..."
    $body = @{
        name        = $RepoName
        description = "Cyber Runner 3D - High performance Three.js web game with Android Studio export"
        private     = $false
        auto_init   = $true
    } | ConvertTo-Json

    $repoRes = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body
    Write-Host "Repository created successfully: $($repoRes.html_url)"
    Start-Sleep -Seconds 2
}

# 3. Collect files from project directory
$projectDir = "C:\Users\HP\.gemini\antigravity\scratch\threejs-3d-game"
$files = Get-ChildItem -Path $projectDir -Recurse -File | Where-Object { 
    $_.FullName -notlike "*.zip" -and 
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\build\*" -and
    $_.FullName -notlike "*\.gradle\*" -and
    $_.FullName -notlike "*node_modules*"
}

Write-Host "Found $($files.Count) files to upload."

# 4. Upload Blobs to GitHub
$treeEntries = @()

foreach ($file in $files) {
    $relPath = $file.FullName.Substring($projectDir.Length).TrimStart('\', '/').Replace('\', '/')
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $base64 = [Convert]::ToBase64String($bytes)

    $blobBody = @{
        content  = $base64
        encoding = "base64"
    } | ConvertTo-Json

    try {
        $blobRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/git/blobs" -Headers $headers -Method Post -Body $blobBody
        $treeEntries += @{
            path = $relPath
            mode = "100644"
            type = "blob"
            sha  = $blobRes.sha
        }
        Write-Host "Uploaded blob: $relPath"
    } catch {
        Write-Warning "Failed to upload blob for $relPath : $_"
    }
}

# 5. Create Tree
Write-Host "Creating Git Tree..."
$treeBody = @{
    tree = $treeEntries
} | ConvertTo-Json -Depth 5

$treeRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/git/trees" -Headers $headers -Method Post -Body $treeBody

# 6. Get latest commit SHA or base
$latestCommitSha = $null
try {
    $refRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/git/ref/heads/main" -Headers $headers -Method Get
    $latestCommitSha = $refRes.object.sha
} catch {
    # If main doesn't exist, try master or create main
}

# 7. Create Commit
Write-Host "Creating Git Commit..."
$commitBody = @{
    message = "Initial commit - Cyber Runner 3D full game and Android Studio export"
    tree    = $treeRes.sha
}
if ($latestCommitSha) {
    $commitBody["parents"] = @($latestCommitSha)
}
$commitJson = $commitBody | ConvertTo-Json

$commitRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/git/commits" -Headers $headers -Method Post -Body $commitJson

# 8. Update Reference (branch main)
Write-Host "Updating main branch reference..."
try {
    $refUpdateBody = @{
        sha   = $commitRes.sha
        force = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/git/refs/heads/main" -Headers $headers -Method Patch -Body $refUpdateBody
} catch {
    $refCreateBody = @{
        ref = "refs/heads/main"
        sha = $commitRes.sha
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/git/refs" -Headers $headers -Method Post -Body $refCreateBody
}

# 9. Enable GitHub Pages
Write-Host "Enabling GitHub Pages..."
try {
    $pagesBody = @{
        source = @{
            branch = "main"
            path   = "/"
        }
    } | ConvertTo-Json
    $pagesRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$RepoName/pages" -Headers $headers -Method Post -Body $pagesBody
    Write-Host "GitHub Pages enabled: $($pagesRes.html_url)"
} catch {
    Write-Host "GitHub Pages note: $_"
}

Write-Host "`n======================================================="
Write-Host " SUCCESS! Project uploaded to GitHub"
Write-Host " Repo URL:  https://github.com/$username/$RepoName"
Write-Host " Live Game: https://$username.github.io/$RepoName/"
Write-Host "======================================================="
