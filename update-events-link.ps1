# PowerShell script to update the Events link in the footer site-wide
$htmlFiles = Get-ChildItem -Path "c:\Users\Keisha\Documents\caltrans\Antig2" -Filter "*.html"

$target = '<li><a href="events.html">Events</a></li>'
$replacement = '<li><a href="index.html#events">Events</a></li>'

foreach ($file in $htmlFiles) {
    Write-Host "Updating link in $($file.Name)..."
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    if ($content.Contains($target)) {
        $newContent = $content.Replace($target, $replacement)
        [System.IO.File]::WriteAllText($file.FullName, $newContent, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "Successfully updated link in $($file.Name)"
    } else {
        Write-Host "Target link not found in $($file.Name)"
    }
}
