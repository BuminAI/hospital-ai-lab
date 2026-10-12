@echo off
rem Runs a Node script with an absolute node.exe path (node is not on PATH in scheduled sessions).
rem Usage: ./.claude/run-node.cmd scripts/pick-publish-time.mjs ko
rem        ./.claude/run-node.cmd scripts/post-quality-check.mjs src/content/blog/<file>.md
cd /d "%~dp0.."
set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" %*
) else (
  node %*
)
