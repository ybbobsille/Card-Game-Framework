@echo on
setlocal

:: Redirect all output to a log file
set LOGFILE=install_logs.txt
echo Installation started at %DATE% %TIME% > "%LOGFILE%"
call :main >> "%LOGFILE%" 2>&1
exit /b

:main
:: Set variables
set "PYTHON_VERSION=3.13.3"
set "PYTHON_EXE=python.exe"
set "PYTHON_INSTALLER=python-%PYTHON_VERSION%-amd64.exe"
set "PYTHON_URL=https://www.python.org/ftp/python/%PYTHON_VERSION%/%PYTHON_INSTALLER%"
set "VENV_DIR=venv"

:: Check for existing Python version
for /f "tokens=* usebackq" %%i in (`where %PYTHON_EXE% 2^>nul`) do (
    set "PYTHON_PATH=%%i"
)

if defined PYTHON_PATH (
    for /f "tokens=2 delims==" %%v in ('"%PYTHON_PATH%" --version 2>&1 ^| findstr "Python %PYTHON_VERSION%"') do (
        echo Python %PYTHON_VERSION% is already installed at %PYTHON_PATH%.
        goto :create_venv
    )
)

echo Python %PYTHON_VERSION% not found. Proceeding to install...

:: Download installer
if not exist "%PYTHON_INSTALLER%" (
    echo Downloading Python installer from %PYTHON_URL% ...
    powershell -Command "Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%PYTHON_INSTALLER%'"
    if errorlevel 1 (
        echo Failed to download the installer.
        exit /b 1
    )
)

:: Install Python silently
echo Installing Python %PYTHON_VERSION% ...
start /wait "" "%PYTHON_INSTALLER%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

:: Verify installation
where python >nul 2>nul
if errorlevel 1 (
    echo Installation failed or Python not added to PATH.
    exit /b 1
)

:create_venv
echo Creating virtual environment in %VENV_DIR% ...
python -m venv %VENV_DIR%
if errorlevel 1 (
    echo Failed to create virtual environment.
    exit /b 1
)

:: Activate venv and install requirements
echo Activating virtual environment and installing dependencies...

call "%VENV_DIR%\Scripts\activate.bat"
if exist requirements.txt (
    echo Installing packages from requirements.txt ...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Failed to install some packages.
        exit /b 1
    )
) else (
    echo requirements.txt not found, skipping package installation.
)

echo Setup complete.
goto :eof
