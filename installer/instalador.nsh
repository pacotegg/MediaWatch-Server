; Regla de cortafuegos de Windows para el servidor (solo en instalaciones «para todos los usuarios»,
; que son las que tienen permisos de administrador; en una instalacion normal Windows pregunta la
; primera vez que el servidor escucha, como con cualquier programa).
;
; Solo TCP entrante, solo desde la red local (remoteip=LocalSubnet) y en cualquier perfil: asi el
; movil de casa llega aunque Windows haya marcado la wifi como «publica», pero nada llega de fuera.

!macro customInstall
  ${If} $installMode == "all"
    nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="MediaWatch Server"'
    nsExec::ExecToLog 'netsh advfirewall firewall add rule name="MediaWatch Server" dir=in action=allow program="$INSTDIR\resources\bin\node.exe" enable=yes profile=any remoteip=LocalSubnet protocol=TCP'
  ${EndIf}
!macroend

!macro customUnInstall
  ${If} $installMode == "all"
    nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="MediaWatch Server"'
  ${EndIf}
!macroend
