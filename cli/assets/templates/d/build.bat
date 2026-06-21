@echo off
setlocal enabledelayedexpansion

:: A WASM-4 project should look like this:
::    +- Folder -------+
::    | source\app.d   |
::    | source\wasm4.d |
::    | build.bat      |
::    +----------------+

set "output=cart.wasm"
set "source=source"
set "files=source\app.d"
set "flags="

:: Change directory to where the script is located
cd /d "%~dp0"

ldc2 -of=%output% ^
    %files% %flags% -I=%source% ^
    -i -betterC ^
    --mtriple=wasm32 ^
    --checkaction=halt ^
    --d-version=JokaSmallFootprint ^
    --d-version=JokaMathStubs ^
    -L--export=update ^
    -L--strip-all ^
    -L--no-entry ^
    -L--stack-first ^
    -L--import-memory ^
    -L--initial-memory=65536 ^
    -L--max-memory=65536 ^
    -L-zstack-size=14752
