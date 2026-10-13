$javaBin = "C:\sts-5.2.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.3.v20260502-0818\jre\bin"
$javaHome = "C:\sts-5.2.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.3.v20260502-0818\jre"
$mavenBin = "C:\Users\DELL\tools\apache-maven-3.9.9\bin"
$mavenHome = "C:\Users\DELL\tools\apache-maven-3.9.9"

[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[Environment]::SetEnvironmentVariable("M2_HOME", $mavenHome, "User")
[Environment]::SetEnvironmentVariable("MAVEN_HOME", $mavenHome, "User")

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notmatch [regex]::Escape($mavenBin)) {
    $updatedPath = "$mavenBin;$javaBin;$userPath"
    [Environment]::SetEnvironmentVariable("Path", $updatedPath, "User")
    Write-Host "Maven and Java successfully added to User PATH."
} else {
    Write-Host "Maven is already in User PATH."
}
