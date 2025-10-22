# PowerShell script to remove specific links from HTML files
$basePath = "C:\Downloaded Web Sites\project_gl 2\Gamesloots-work-main"

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $basePath -Recurse -Filter "*.html"

Write-Host "Found $($htmlFiles.Count) HTML files to process"

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Remove Plati.ru links
    $content = $content -replace '<p[^>]*><a[^>]*href="https://www\.plati\.market/seller/imperiumkey/542171"[^>]*>Отзывы на Plati\.ru</a></p>', ''
    $content = $content -replace '<p[^>]*><a[^>]*href="https://www\.plati\.market/seller/imperiumkey/542171"[^>]*style="font-weight: bold;">Отзывы на Plati\.ru</a></p>', ''
    
    # Remove Coop-Land links
    $content = $content -replace '<p[^>]*><strong>&nbsp;<a[^>]*href="http://coop-land\.ru/forum/showtopic/71850[^"]*"[^>]*>Наша тема на Coop-Land</a></strong></p>', ''
    $content = $content -replace '<p[^>]*><strong>&nbsp;Наша тема на Coop-Land \(через поиск гугл\)</strong></p>', ''
    
    # Remove Lolzteam links
    $content = $content -replace '<p[^>]*><strong><a[^>]*href="https://lolz\.guru/threads/418150[^"]*"[^>]*>Наша тема на Lolzteam</a></strong></p>', ''
    $content = $content -replace '<p[^>]*><strong><a[^>]*href="https://lolzteam\.net/threads/418150[^"]*"[^>]*>Наша тема на Lolzteam</a></strong></p>', ''
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Link removal completed!"
