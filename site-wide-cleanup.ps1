# site-wide-cleanup.ps1
# Fixes common UTF-8 mangling artifacts site-wide in .html files

$replacements = @{
    "â†—" = "↗"
    "â€”" = " — "
    "â€“" = "–"
    "â˜°" = "☰"
    "âˆ’" = "−"
}

Get-ChildItem -Filter * .html -Recurse | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw -Encoding UTF8
    
    $changed = $false
    foreach ($key in $replacements.Keys) {
        if ($content.Contains($key)) {
            $content = $content.Replace($key, $replacements[$key])
            $changed = $true
        }
    }
    
    if ($changed) {
        Write-Host "Fixed: $file"
        [System.IO.File]::WriteAllText($file, $content)
    }
}
