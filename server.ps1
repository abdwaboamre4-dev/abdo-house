$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "ABDO HOUSE Server running at http://localhost:$port/"
Start-Process "http://localhost:$port/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
    ".json" = "application/json"
}

$baseDir = (Get-Item -Path ".").FullName
$rootAntigravity = "C:\Users\hp\.gemini\antigravity"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        $rawPath = [System.Uri]::UnescapeDataString($req.Url.LocalPath.TrimStart('/'))
        if ($rawPath -eq '' -or $rawPath -eq '/') {
            $rawPath = 'index.html'
        }
        
        $filePath = Join-Path $baseDir $rawPath
        
        if (-not (Test-Path $filePath -PathType Leaf)) {
            # Check relative paths to brain or scratch
            if ($rawPath -like "*brain*") {
                $idx = $rawPath.IndexOf("brain")
                $sub = $rawPath.Substring($idx)
                $filePath = Join-Path $rootAntigravity $sub
            }
        }
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = $mimeTypes[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentType = $contentType
            $res.ContentLength64 = $bytes.Length
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
        } else {
            $res.StatusCode = 404
            $res.Close()
        }
    } catch {
        # continue loop
    }
}
