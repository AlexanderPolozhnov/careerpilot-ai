$backupFile = "docs/CONTEXT_BACKUP.md"
$archiveFile = "docs/CONTEXT_BACKUP_ARCHIVE.md"
$maxBlocks = 5 # Сколько последних блоков ## Update оставлять для агента

if (Test-Path $backupFile) {
    # Читаем файл с принудительной кодировкой UTF-8 для корректной работы с кириллицей
    $content = Get-Content $backupFile -Raw -Encoding UTF8
    
    # Разделяем файл по блокам обновлений.
    # Используем (?m)(?=^## Update), чтобы разбить строку, не удаляя сам заголовок.
    $blocks = [System.Text.RegularExpressions.Regex]::Split($content, "(?m)(?=^## Update)")
    
    # Если блоков больше, чем максимум (плюс блок с шапкой файла)
    if ($blocks.Count -gt ($maxBlocks + 1)) {
        # Забираем старые блоки для архива (начиная со второго, заканчивая до $maxBlocks)
        $oldBlocks = $blocks[1..($blocks.Count - $maxBlocks - 1)] -join ""
        
        # Оставляем заголовок файла ($blocks[0]) и последние $maxBlocks блоков
        $newBlocks = $blocks[0] + ($blocks[($blocks.Count - $maxBlocks)..($blocks.Count - 1)] -join "")
        
        # Дописываем старое в архив
        Add-Content $archiveFile -Value $oldBlocks -Encoding UTF8
        
        # Обновляем текущий бэкап
        Set-Content $backupFile -Value $newBlocks -Encoding UTF8
        
        Write-Host "Ротация успешна. Оставлено $maxBlocks последних блоков. Старые ушли в архив." -ForegroundColor Green
    } else {
        Write-Host "Ротация не требуется. Количество блоков не превышает $maxBlocks." -ForegroundColor Yellow
    }
} else {
    Write-Host "Файл бэкапа не найден по пути: $backupFile" -ForegroundColor Red
}
