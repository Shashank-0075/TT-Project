@echo off
title CampusFix - Backend (Spring Boot 3.5)
set "JAVA_HOME=C:\sts-5.2.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.3.v20260502-0818\jre"
set "MAVEN_HOME=C:\Users\DELL\tools\apache-maven-3.9.9"
set "PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%"

echo ========================================================
echo   CampusFix - Starting Spring Boot Backend
echo   Java:   %JAVA_HOME%
echo   Maven:  %MAVEN_HOME%
echo   Port:   http://localhost:8080
echo ========================================================
echo.

cd /d "%~dp0"
call mvn spring-boot:run
pause
