@echo off
rem Runs the site audit script with an absolute node.exe path (node is not on PATH in scheduled sessions).
cd /d "%~dp0.."
"C:\Program Files\nodejs\node.exe" scripts\audit-site.mjs %*
