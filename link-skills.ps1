$projectRoot = "c:\Users\Keisha\Documents\caltrans\caltransapp"
$skillsSource = Join-Path $projectRoot ".agents\skills"

# Get all hidden directories that look like agent configs
$agentDirs = Get-ChildItem -Path $projectRoot -Filter ".*" -Directory | Where-Object { $_.Name -notmatch "^\.(git|github|agents|agent|adal|augment|mcpjam)$" }

foreach ($dir in $agentDirs) {
    $agentSkillsPath = Join-Path $dir.FullName "skills"
    Write-Output "Processing $($dir.Name)..."
    
    if (Test-Path $agentSkillsPath) {
        # Check if it's already a link
        $item = Get-Item $agentSkillsPath
        if ($item.LinkType) {
            Write-Output "  Already linked. Skipping."
            continue
        }
        Write-Output "  Existing skills folder found. Backing up..."
        Rename-Item -Path $agentSkillsPath -NewName "skills_backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    }
    
    Write-Output "  Creating junction to $skillsSource"
    New-Item -ItemType Junction -Path $agentSkillsPath -Target $skillsSource -Force
}

# Also link to root 'skills' if it's not the same
$rootSkills = Join-Path $projectRoot "skills"
if (-not (Test-Path $rootSkills)) {
    New-Item -ItemType Junction -Path $rootSkills -Target $skillsSource -Force
}
