@echo off
echo ===================================================
echo   Building Cyber Runner 3D Android APK Package...
echo ===================================================

cd /d "%~dp0"

echo Syncing latest game files to Android assets...
xcopy /E /Y /I "..\index.html" "app\src\main\assets\public\"
xcopy /E /Y /I "..\css\*" "app\src\main\assets\public\css\"
xcopy /E /Y /I "..\js\*" "app\src\main\assets\public\js\"

echo.
echo Checking Gradle...
if exist gradlew.bat (
    call gradlew.bat assembleDebug
) else (
    echo Gradle wrapper not found locally. 
    echo Please open the 'android' folder in Android Studio and click 'Build > Build APK(s)'.
)

echo.
echo ===================================================
echo Build process complete!
echo If build succeeded, APK is located at:
echo app\build\outputs\apk\debug\app-debug.apk
echo ===================================================
pause
