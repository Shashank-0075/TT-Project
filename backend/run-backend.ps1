$Host.UI.RawUI.WindowTitle = "CampusFix - Backend (Spring Boot 3.5)"

$env:JAVA_HOME = "C:\sts-5.2.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.3.v20260502-0818\jre"
$env:MAVEN_HOME = "C:\Users\DELL\tools\apache-maven-3.9.9"
$env:Path = "$env:MAVEN_HOME\bin;$env:JAVA_HOME\bin;$env:Path"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  CampusFix - Starting Spring Boot Backend" -ForegroundColor Cyan
Write-Host "  Java:   $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "  Maven:  $env:MAVEN_HOME" -ForegroundColor Gray
Write-Host "  Port:   http://localhost:8080" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot
mvn spring-boot:run
