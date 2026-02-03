# PowerShell script to update footer in all HTML files
$footerTemplate = @'
        <div class="footer-section">
          <h3>Forms & Services</h3>
          <ul>
            <li><a href="https://app.smartsheet.com/b/form/b0a6941664cd453da6912c4c96d83530" target="_blank" rel="noopener noreferrer">Service Request Form ↗</a></li>
            <li><a href="https://app.smartsheet.com/b/form/5a91fd621bf6473cbe2e8dd2a5b1ecdd" target="_blank" rel="noopener noreferrer">Text Notifications ↗</a></li>
            <li><a href="https://app.smartsheet.com/b/form/d10fcca77e37449abbf81c035b7945f6" target="_blank" rel="noopener noreferrer">BDP Interest Form ↗</a></li>
            <li><a href="https://app.smartsheet.com/b/form/2070c1554666487584e007173d2208ed" target="_blank" rel="noopener noreferrer">Workforce Development ↗</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>Caltrans Resources</h3>
          <ul>
            <li><a href="https://dot.ca.gov" target="_blank" rel="noopener noreferrer">Caltrans Home ↗</a></li>
            <li><a href="https://dot.ca.gov/programs/civil-rights" target="_blank" rel="noopener noreferrer">Civil Rights ↗</a></li>
            <li><a href="https://dot.ca.gov/programs/civil-rights/small-business-and-workforce-development" target="_blank" rel="noopener noreferrer">SB & Workforce Dev ↗</a></li>
            <li><a href="https://ccop.dot.ca.gov/" target="_blank" rel="noopener noreferrer">Contracting Portal ↗</a></li>
            <li><a href="https://dot.ca.gov/programs/construction/construction-mentor-protege-program" target="_blank" rel="noopener noreferrer">Mentor Protege ↗</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>External Programs</h3>
          <ul>
            <li><a href="https://calosba.ca.gov/" target="_blank" rel="noopener noreferrer">CA Small Business ↗</a></li>
            <li><a href="https://www.californiaucp.com" target="_blank" rel="noopener noreferrer">California UCP ↗</a></li>
            <li><a href="https://www.ecfr.gov/current/title-49/subtitle-A/part-26" target="_blank" rel="noopener noreferrer">Federal DBE Regs ↗</a></li>
          </ul>
        </div>
'@

# Get all HTML files except index.html (already updated)
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" | Where-Object { $_.Name -ne "index.html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Pattern to match the old external resources section
    $pattern = '(?s)(<div class="footer-section">[\r\n\s]*<h3>External Resources</h3>.*?</div>[\r\n\s]*<div class="footer-section">[\r\n\s]*<h3>Caltrans Programs</h3>.*?</div>)'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $footerTemplate
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "Pattern not found in: $($file.Name)"
    }
}

Write-Host "`nFooter update complete!"
'@

Set-Content -Path "update-footer.ps1" -Value $footerTemplate
Write-Host "Script created: update-footer.ps1"
