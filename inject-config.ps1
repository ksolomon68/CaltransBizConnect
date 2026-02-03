$configScript = '<script src="js/config.js"></script>'
$targetFiles = Get-ChildItem -Path . -Filter *.html

foreach ($file in $targetFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if config.js is already present
    if ($content -notmatch 'js/config\.js') {
        # Check if auth.js, main.js, or components are present
        if ($content -match 'js/auth\.js|js/main\.js|js/components/') {
            Write-Host "Updating $($file.Name)..."
            
            # Find the first script tag to insert before it
            if ($content -match '<script') {
                $newContent = $content -replace '(?i)<script', "$configScript`n    <script"
                # The above regex might replace all script tags if not careful.
                # Let's use a more precise replacement for just the first occurrence.
                $firstScriptIndex = $content.IndexOf('<script')
                $newContent = $content.Insert($firstScriptIndex, "$configScript`n  ")
                
                Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            }
        }
    }
}
