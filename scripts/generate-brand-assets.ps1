$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$fontPath = Join-Path $projectRoot 'node_modules\@expo-google-fonts\fruktur\400Regular\Fruktur_400Regular.ttf'
$assetDirectory = Join-Path $projectRoot 'assets'
$iconDirectory = Join-Path $projectRoot 'public\icons'

Add-Type -AssemblyName System.Drawing

$fontCollection = New-Object System.Drawing.Text.PrivateFontCollection
$fontCollection.AddFontFile($fontPath)
$fruktur = $fontCollection.Families | Where-Object Name -eq 'Fruktur' | Select-Object -First 1
if (-not $fruktur) { throw 'Could not load the bundled Fruktur font.' }

$stone = [System.Drawing.Color]::FromArgb(245, 242, 236)
$orange = [System.Drawing.Color]::FromArgb(178, 108, 59)
$brown = [System.Drawing.Color]::FromArgb(41, 36, 30)
$white = [System.Drawing.Color]::White
$trailSourcePath = Join-Path $assetDirectory 'branding\sunrise-trail-source.png'

function Get-CleanTrailArtwork {
  $source = [System.Drawing.Bitmap]::FromFile($trailSourcePath)
  $clean = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $minX = $source.Width; $minY = $source.Height; $maxX = 0; $maxY = 0
  for ($y = 0; $y -lt $source.Height; $y++) {
    for ($x = 0; $x -lt $source.Width; $x++) {
      $pixel = $source.GetPixel($x, $y)
      $isBackground = $pixel.R -gt 215 -and $pixel.G -gt 208 -and $pixel.B -gt 198
      $isLocationMarker = $pixel.R -gt 190 -and $pixel.G -gt 170 -and $pixel.B -gt 135 -and
        ($pixel.R - $pixel.B) -gt 35 -and ($pixel.G - $pixel.B) -gt 20
      $isLocationMarkerArea = $x -ge 530 -and $x -le 730 -and $y -ge 850
      if ($isBackground -or $isLocationMarker -or $isLocationMarkerArea) {
        $clean.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      } else {
        $clean.SetPixel($x, $y, $pixel)
        if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  $source.Dispose()
  $padding = 8
  $bounds = [System.Drawing.Rectangle]::new(
    [Math]::Max(0, $minX - $padding),
    [Math]::Max(0, $minY - $padding),
    [Math]::Min($clean.Width - [Math]::Max(0, $minX - $padding), $maxX - $minX + 1 + 2 * $padding),
    [Math]::Min($clean.Height - [Math]::Max(0, $minY - $padding), $maxY - $minY + 1 + 2 * $padding)
  )
  return @{ Bitmap = $clean; Bounds = $bounds }
}

$trailArtwork = Get-CleanTrailArtwork

function New-Canvas([int]$width, [int]$height, [System.Drawing.Color]$background) {
  $bitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear($background)
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Draw-CenteredWord($graphics, [string]$text, [int]$top, [float]$fontSize, [System.Drawing.Color]$color) {
  $font = New-Object System.Drawing.Font($fruktur, $fontSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $brush = New-Object System.Drawing.SolidBrush($color)
  $graphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new(0, $top, 1024, 190), $format)
  $brush.Dispose(); $format.Dispose(); $font.Dispose()
}

function Draw-SunTrail($graphics, [int]$top, [int]$height) {
  $width = [int]($height * $trailArtwork.Bounds.Width / $trailArtwork.Bounds.Height)
  $left = [int]((1024 - $width) / 2)
  $destination = [System.Drawing.Rectangle]::new($left, $top, $width, $height)
  $graphics.DrawImage($trailArtwork.Bitmap, $destination, $trailArtwork.Bounds, [System.Drawing.GraphicsUnit]::Pixel)
}

function Save-Png($canvas, [string]$path) {
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Bitmap.Dispose()
}

function New-BrandedIcon([int]$size, [bool]$includeScout) {
  $canvas = New-Canvas 1024 1024 $stone
  Draw-CenteredWord $canvas.Graphics 'UV' 42 132 $orange
  Draw-SunTrail $canvas.Graphics 185 500
  if ($includeScout) { Draw-CenteredWord $canvas.Graphics 'Scout' 700 180 $brown }
  if ($size -eq 1024) { return $canvas }
  $small = New-Canvas $size $size $stone
  $small.Graphics.DrawImage($canvas.Bitmap, 0, 0, $size, $size)
  $canvas.Graphics.Dispose(); $canvas.Bitmap.Dispose()
  return $small
}

function New-SplashLogo {
  $canvas = New-Canvas 1024 1024 ([System.Drawing.Color]::Transparent)
  Draw-CenteredWord $canvas.Graphics 'UV' 42 132 $orange
  Draw-SunTrail $canvas.Graphics 185 500
  Draw-CenteredWord $canvas.Graphics 'Scout' 700 180 $brown
  return $canvas
}

function New-ScaledSplashLogo([int]$size) {
  $source = New-SplashLogo
  $canvas = New-Canvas $size $size ([System.Drawing.Color]::Transparent)
  $canvas.Graphics.DrawImage($source.Bitmap, 0, 0, $size, $size)
  $source.Graphics.Dispose(); $source.Bitmap.Dispose()
  return $canvas
}

function New-AdaptiveForeground([int]$size, [bool]$monochrome) {
  $base = New-Canvas 1024 1024 ([System.Drawing.Color]::Transparent)
  Draw-CenteredWord $base.Graphics 'UV' 42 132 $orange
  Draw-SunTrail $base.Graphics 185 500
  Draw-CenteredWord $base.Graphics 'Scout' 700 180 $brown

  $canvas = New-Canvas $size $size ([System.Drawing.Color]::Transparent)
  $safeSize = [int]($size * 0.72)
  $offset = [int](($size - $safeSize) / 2)
  $canvas.Graphics.DrawImage($base.Bitmap, $offset, $offset, $safeSize, $safeSize)
  $base.Graphics.Dispose(); $base.Bitmap.Dispose()

  if ($monochrome) {
    for ($y = 0; $y -lt $size; $y++) {
      for ($x = 0; $x -lt $size; $x++) {
        $pixel = $canvas.Bitmap.GetPixel($x, $y)
        if ($pixel.A -gt 0) { $canvas.Bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, 255, 255, 255)) }
      }
    }
  }
  return $canvas
}

function New-MaskableIcon([int]$size) {
  $canvas = New-Canvas $size $size $stone
  $foreground = New-AdaptiveForeground $size $false
  $canvas.Graphics.DrawImage($foreground.Bitmap, 0, 0, $size, $size)
  $foreground.Graphics.Dispose(); $foreground.Bitmap.Dispose()
  return $canvas
}

New-Item -ItemType Directory -Force -Path $iconDirectory | Out-Null

Save-Png (New-BrandedIcon 1024 $true) (Join-Path $assetDirectory 'icon.png')
Save-Png (New-BrandedIcon 512 $true) (Join-Path $assetDirectory 'uv-scout-logo.png')
Save-Png (New-SplashLogo) (Join-Path $assetDirectory 'splash-icon.png')
Save-Png (New-AdaptiveForeground 1024 $false) (Join-Path $assetDirectory 'android-icon-foreground.png')
Save-Png (New-AdaptiveForeground 1024 $true) (Join-Path $assetDirectory 'android-icon-monochrome.png')
Save-Png (New-BrandedIcon 192 $true) (Join-Path $iconDirectory 'uv-scout-192-v2.png')
Save-Png (New-BrandedIcon 512 $true) (Join-Path $iconDirectory 'uv-scout-512-v2.png')
Save-Png (New-MaskableIcon 512) (Join-Path $iconDirectory 'uv-scout-maskable-512-v2.png')
Save-Png (New-BrandedIcon 180 $true) (Join-Path $iconDirectory 'apple-touch-icon-v2.png')
Save-Png (New-ScaledSplashLogo 192) (Join-Path $iconDirectory 'uv-scout-192-v3.png')
Save-Png (New-ScaledSplashLogo 512) (Join-Path $iconDirectory 'uv-scout-512-v3.png')
Save-Png (New-AdaptiveForeground 512 $false) (Join-Path $iconDirectory 'uv-scout-maskable-512-v3.png')

# A wide social preview card with the approved mark and the app's current tagline.
$card = New-Canvas 1200 630 $stone
$brand = New-BrandedIcon 490 $true
$card.Graphics.DrawImage($brand.Bitmap, 55, 70, 490, 490)
$brand.Graphics.Dispose(); $brand.Bitmap.Dispose()
$dividerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 207, 190), 2)
$card.Graphics.DrawLine($dividerPen, 590, 100, 590, 530)
$dividerPen.Dispose()

$wordFormat = New-Object System.Drawing.StringFormat
$wordFormat.Alignment = [System.Drawing.StringAlignment]::Near
$wordFormat.LineAlignment = [System.Drawing.StringAlignment]::Near
$uvFont = New-Object System.Drawing.Font($fruktur, 86, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$scoutFont = New-Object System.Drawing.Font($fruktur, 86, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$uvBrush = New-Object System.Drawing.SolidBrush($orange)
$brownBrush = New-Object System.Drawing.SolidBrush($brown)
$uvSize = $card.Graphics.MeasureString('UV', $uvFont)
$card.Graphics.DrawString('UV', $uvFont, $uvBrush, 650, 195, $wordFormat)
$card.Graphics.DrawString('Scout', $scoutFont, $brownBrush, 650 + $uvSize.Width - 10, 195, $wordFormat)

$taglineFont = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$taglineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(92, 82, 72))
$card.Graphics.DrawString('Plan your time outside based on the UV Index.', $taglineFont, $taglineBrush, [System.Drawing.RectangleF]::new(654, 310, 475, 150))

$uvFont.Dispose(); $scoutFont.Dispose(); $uvBrush.Dispose(); $brownBrush.Dispose(); $wordFormat.Dispose(); $taglineFont.Dispose(); $taglineBrush.Dispose()
Save-Png $card (Join-Path $iconDirectory 'og-image-v2.png')
$trailArtwork.Bitmap.Dispose()

Write-Output 'Generated UV Scout app, adaptive, favicon, PWA, Apple touch, and social preview assets.'
