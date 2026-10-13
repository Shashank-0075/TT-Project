@echo off
set "JAVA_HOME=C:\sts-5.2.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.3.v20260502-0818\jre"
set "MAVEN_HOME=C:\Users\DELL\tools\apache-maven-3.9.9"
set "PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%"

"%MAVEN_HOME%\bin\mvn.cmd" %*
