# PowerShell script to fix all common mangled UTF-8 characters site-wide
$htmlFiles = Get-ChildItem -Path "c:\Users\Keisha\Documents\caltrans\Antig2" -Filter "*.html"

# Mapping of mangled sequences to correct characters
$replacements = @{
    # Arrow ↗ (E2 86 97)
    ([char]0x00E2 + [char]0x2020 + [char]0x2014) = [char]0x2197
    # Em-dash — (E2 80 94)
    ([char]0x00E2 + [char]0x20AC + [char]0x201D) = [char]0x2014
    "â€”" = [char]0x2014
    # Right Arrow → (E2 86 92)
    "â†’" = [char]0x2192
}

foreach ($file in $htmlFiles) {
    Write-Host "Cleaning encoding in $($file.Name)..."
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content
    
    foreach ($key in $replacements.Keys) {
        if ($content.Contains($key)) {
            $content = $content.Replace($key, $replacements[$key])
        }
    }
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "Fixed mangled characters in $($file.Name)"
    }
}
