#define MyAppName "FabMo Minder"
#define MyAppVersion "1.6.0"
#define MyAppPublisher "ShopBot Tools, Inc."
#define MyAppURL "http://www.gofabmo.org/"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName={#MyAppName}
Compression=lzma2
SolidCompression=yes
OutputDir=./Win
OutputBaseFilename=fabmominder-win_x64_x86-setup-v{#MyAppVersion}
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[CustomMessages]
english.LaunchProgram=Launch the FabMo Minder
english.DesktopIcon=Desktop Icon
english.CreateDesktopIcon=Create a desktop icon
french.LaunchProgram=Lancer le programme FabMo Minder
french.DesktopIcon=Icone du bureau
french.CreateDesktopIcon=Creer une icone sur le bureau

[Files]
; Place all x64 files here
Source: "nw_bin/x64/*"; Excludes: "ffmpegsumo.dll,libEGL.dll,libGLESv2.dll,d3dcompiler_47.dll,nwjc.exe,pdf.dll" ; DestDir: "{app}"; Check: Is64BitInstallMode; Flags: ignoreversion recursesubdirs
; Place all x86 files here, first one should be marked 'solidbreak'
Source: "nw_bin/x86/*"; Excludes: "ffmpegsumo.dll,libEGL.dll,libGLESv2.dll,d3dcompiler_47.dll,nwjc.exe,pdf.dll" ; DestDir: "{app}"; Check: not Is64BitInstallMode; Flags: solidbreak ignoreversion recursesubdirs
; Place all common files here, first one should be marked 'solidbreak'
Source: "../*"; Excludes: "build,.git,.gitattributes,.gitignore,node_modules"; DestDir: "{app}"; Flags: ignoreversion solidbreak recursesubdirs
Source: "../node_modules/*"; Excludes: "nw"; DestDir: "{app}/node_modules"; Flags: ignoreversion solidbreak recursesubdirs

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:DesktopIcon}"

[Icons]
Name: "{group}\FabMo Minder"; Filename: "{app}\FabMo_Minder.exe"; WorkingDir: "{app}"; IconFilename: "{app}/images/fabmo.ico"
Name: "{userdesktop}\FabMo Minder"; Filename: "{app}\FabMo_Minder.exe"; WorkingDir: "{app}"; IconFilename: "{app}/images/fabmo.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\FabMo_Minder.exe"; WorkingDir: "{app}"; Description: {cm:LaunchProgram}; Flags: postinstall shellexec


; add folder to the Path for command line execution
[Registry]
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; \
    Check: NeedsAddPath('{app}')

[Code]
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SYSTEM\CurrentControlSet\Control\Session Manager\Environment',
    'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  // look for the path with leading and trailing semicolon
  // Pos() returns 0 if not found
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
end;
