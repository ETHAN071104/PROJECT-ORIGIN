$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$iconDirectory = Join-Path $projectRoot 'public\icons'
[System.IO.Directory]::CreateDirectory($iconDirectory) | Out-Null

function New-OriginIcon([int]$size, [string]$fileName) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.Clear([System.Drawing.Color]::FromArgb(9, 11, 25))

  $unit = [Math]::Max(1, [Math]::Floor($size / 32))
  $center = [Math]::Floor($size / 2)
  $outer = 10 * $unit
  $inner = 6 * $unit
  $cyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(101, 217, 232))
  $pale = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(184, 244, 244))
  $violet = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(109, 98, 142))
  $deep = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 20, 43))
  $star = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(83, 109, 160))

  for ($i = 0; $i -lt 14; $i++) {
    $x = (($i * 17 + 3) % 29 + 1) * $unit
    $y = (($i * 11 + 5) % 28 + 2) * $unit
    $graphics.FillRectangle($star, $x, $y, $unit, $unit)
  }

  $outerDiamond = [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new($center, $center - $outer),
    [System.Drawing.Point]::new($center + $outer, $center),
    [System.Drawing.Point]::new($center, $center + $outer),
    [System.Drawing.Point]::new($center - $outer, $center)
  )
  $innerDiamond = [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new($center, $center - $inner),
    [System.Drawing.Point]::new($center + $inner, $center),
    [System.Drawing.Point]::new($center, $center + $inner),
    [System.Drawing.Point]::new($center - $inner, $center)
  )
  $graphics.FillPolygon($cyan, $outerDiamond)
  $graphics.FillPolygon($deep, $innerDiamond)
  $graphics.FillRectangle($violet, $center - 3 * $unit, $center - 3 * $unit, 6 * $unit, 6 * $unit)
  $graphics.FillRectangle($pale, $center - $unit, $center - $unit, 2 * $unit, 2 * $unit)

  $path = Join-Path $iconDirectory $fileName
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  $cyan.Dispose(); $pale.Dispose(); $violet.Dispose(); $deep.Dispose(); $star.Dispose()
}

New-OriginIcon 192 'origin-192.png'
New-OriginIcon 512 'origin-512.png'
