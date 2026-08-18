param(
    [int]$Port = 5500
)

$rootDir = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()

Write-Host "Server running at http://localhost:$Port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $path = $request.Url.LocalPath
            if ($path -eq "/" -or $path -eq "") {
                $path = "/index.html"
            }

            $localPath = Join-Path $rootDir ($path.TrimStart('/').Replace('/', '\'))

            if (Test-Path $localPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                
                if ($localPath.EndsWith(".html")) {
                    $response.ContentType = "text/html; charset=utf-8"
                } elseif ($localPath.EndsWith(".css")) {
                    $response.ContentType = "text/css"
                } elseif ($localPath.EndsWith(".js")) {
                    $response.ContentType = "application/javascript"
                } elseif ($localPath.EndsWith(".json")) {
                    $response.ContentType = "application/json"
                }

                $response.ContentLength64 = $bytes.LongLength
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $msg.LongLength
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
        } catch {
            Write-Host "Request error: $_"
        } finally {
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
}
