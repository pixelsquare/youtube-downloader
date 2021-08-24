@echo off

mklink /J %~dp0cli\lib %~dp0lib
mklink /J %~dp0app\lib %~dp0lib
mklink /J %~dp0react-app\src\lib %~dp0lib