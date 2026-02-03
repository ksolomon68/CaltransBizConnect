$files = Get-ChildItem -Path . -Filter *.html
foreach ($file in $files) {
    if ($file.Name -eq "events.html") { continue }
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace '<li><a href="index.html#events">Events</a></li>', ''
    $newContent = $newContent -replace '<li><a href="events.html">Events</a></li>', ''
    if ($content -ne $newContent) {
        $newContent | Set-Content $file.FullName -Encoding UTF8
        Write-Host "Updated $($file.Name)"
    }
}
