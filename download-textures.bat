@echo off
echo NASA Eyes on Earth Clone - Texture Downloader
echo =============================================

echo.
echo This script will help you download the required Earth textures.
echo.

set TEXTURE_DIR=public\textures

echo Creating textures directory...
if not exist "%TEXTURE_DIR%" mkdir "%TEXTURE_DIR%"

echo.
echo IMPORTANT: Due to file sizes and licensing, textures must be downloaded manually.
echo.
echo Please download the following textures and place them in the %TEXTURE_DIR% folder:
echo.

echo 1. Earth Day Map (earth_daymap.jpg)
echo    URL: https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography
echo    File: Download the highest resolution JPEG
echo.

echo 2. Earth Normal Map (earth_normal_map.jpg) 
echo    URL: https://visibleearth.nasa.gov/images/73934/topography
echo    File: Download the topography image as JPEG
echo.

echo 3. Earth Specular Map (earth_specular_map.jpg)
echo    URL: https://visibleearth.nasa.gov/images/57747/blue-marble-bathymetry  
echo    File: Download the bathymetry image as JPEG
echo.

echo 4. Earth Clouds (earth_clouds.jpg)
echo    URL: https://visibleearth.nasa.gov/images/57747/blue-marble-clouds
echo    File: Download the cloud layer as JPEG
echo.

echo 5. Milky Way Background (milky_way.jpg) - OPTIONAL
echo    URL: https://svs.gsfc.nasa.gov/3895
echo    File: Download any 360-degree Milky Way image
echo    Note: App will generate procedural Milky Way if not found
echo.

echo Alternative Quick Download Sources:
echo - Texture Haven: https://texturehaven.com/ (search for "earth")
echo - Solar System Scope: https://www.solarsystemscope.com/textures/
echo.

echo After downloading, rename files to match the exact names above.
echo.

echo Checking current textures...
echo.

if exist "%TEXTURE_DIR%\earth_daymap.jpg" (
    echo [✓] earth_daymap.jpg found
) else (
    echo [✗] earth_daymap.jpg missing
)

if exist "%TEXTURE_DIR%\earth_normal_map.jpg" (
    echo [✓] earth_normal_map.jpg found  
) else (
    echo [✗] earth_normal_map.jpg missing
)

if exist "%TEXTURE_DIR%\earth_specular_map.jpg" (
    echo [✓] earth_specular_map.jpg found
) else (
    echo [✗] earth_specular_map.jpg missing
)

if exist "%TEXTURE_DIR%\earth_clouds.jpg" (
    echo [✓] earth_clouds.jpg found
) else (
    echo [✗] earth_clouds.jpg missing
)

if exist "%TEXTURE_DIR%\milky_way.jpg" (
    echo [✓] milky_way.jpg found
) else (
    echo [✗] milky_way.jpg missing (optional)
)

echo.
echo NOTE: The application will work without textures using fallback colors,
echo but textures provide much better visual quality.
echo.

pause
