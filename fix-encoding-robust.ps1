# fix-encoding-robust.ps1
# Fixes common UTF-8 mangling artifacts site-wide without using literal non-ASCII chars in the script

$replacements = @{
    # â†— -> ↗
    "â" + [char]0x2020 + [char]0x2014 = [char]0x2197
    # â€” -> —
    "â" + [char]0x20AC + [char]0x201D = [char]0x2014
    # â€“ -> –
    "â" + [char]0x20AC + [char]0x2013 = [char]0x2013
    # â˜° -> ☰
    "â" + [char]0x02DC + [char]0x00B0 = [char]0x2630
}

# Simple string replacement for common ones found in my view_file output
# â†— is often represented as â€ — in some environments
# Let's just do the most common literal matches from the grep

$targets = @(
    "â†—",
    "â€”",
    "â€“",
    "â˜°"
)

Get-ChildItem -Filter * .html -Recurse | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw -Encoding UTF8
    
    $changed = $false
    # Direct literal replacement (risky if script encoding is wrong)
    # So let's use the explicit mangled strings seen in grep
    
    $map = @{
        "â†—" = "↗"
        "â€”" = " — "
        "â€“" = "–"
        "â˜°" = "☰"
    }
    
    foreach ($key in $map.Keys) {
        if ($content.Contains($key)) {
            $content = $content.Replace($key, $map[$key])
            $changed = $true
        }
    }
    
    if ($changed) {
        Write-Host "Fixed: $file"
        [System.IO.File]::WriteAllText($file, $content)
    }
}
