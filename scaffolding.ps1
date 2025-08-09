param(
    [string]$Ruta = ".",
    [string[]]$Extensiones = @("*.*"),
    [string]$ArchivoExport = ""
)

function Obtener-DescripcionArchivo {
    param([string]$Archivo)

    try {
        $lineas = Get-Content $Archivo -Encoding UTF8 -TotalCount 50
        $comentario = @()
        $enBloque = $false
        foreach ($linea in $lineas) {
            if ($linea -match '^\s*/\*\*?') { $enBloque = $true }
            if ($enBloque) {
                $comentario += ($linea -replace '^\s*\* ?', '').Trim()
                if ($linea -match '\*/') { break }
            }
            elseif ($linea -match '^\s*//') {
                $comentario += ($linea -replace '^\s*// ?', '').Trim()
            }
            elseif ($comentario.Count -gt 0) {
                # Ya terminó el bloque de comentario
                break
            }
        }
        if ($comentario.Count -gt 0) {
            # Limitar a 300 chars y reemplazar saltos de línea por espacio
            $texto = ($comentario -join " ") -replace '\s+', ' '
            if ($texto.Length -gt 300) {
                $texto = $texto.Substring(0, 297) + "..."
            }
            return $texto
        }
        else {
            return $null
        }
    }
    catch {
        return $null
    }
}

function Mostrar-Arbol {
    param(
        [string]$Directorio,
        [string]$Prefijo = "",
        [bool]$Ultimo = $true
    )

    $dirs = Get-ChildItem $Directorio -Directory | Sort-Object Name
    $archivos = Get-ChildItem $Directorio -File | Where-Object {
        $match = $false
        foreach ($ext in $Extensiones) {
            if ($_.Name -like $ext) {
                $match = $true
                break
            }
        }
        $match
    } | Sort-Object Name

    $totalItems = $dirs.Count + $archivos.Count
    $contador = 0

    foreach ($dir in $dirs) {
        $contador++
        $esUltimo = ($contador -eq $totalItems)
        if ($esUltimo) {
            $rama = "└─"
        } else {
            $rama = "├─"
        }
        Write-Host "$Prefijo$rama📂 $($dir.Name)" -ForegroundColor DarkYellow

        if ($esUltimo) {
            $prefijoNuevo = "$Prefijo    "
        }
        else {
            $prefijoNuevo = "$Prefijo│   "
        }
        Mostrar-Arbol -Directorio $dir.FullName -Prefijo $prefijoNuevo -Ultimo:$esUltimo
    }

    foreach ($archivo in $archivos) {
        $contador++
        $esUltimo = ($contador -eq $totalItems)
        if ($esUltimo) {
            $rama = "└─"
        } else {
            $rama = "├─"
        }

        $lineas = (Get-Content $archivo.FullName).Count
        $desc = Obtener-DescripcionArchivo $archivo.FullName

        # Icono estrella para archivos grandes (>300 líneas)
        $iconoSize = if ($lineas -gt 300) { "⭐" } else { " " }

        # Ajustar nombre y línea para alinear
        $nombreAlineado = $archivo.Name.PadRight(40)
        $lineasAlineado = ("({0,4} lines)" -f $lineas)

        if ($desc) {
            Write-Host "$Prefijo$rama$iconoSize 📄 $nombreAlineado $lineasAlineado → $desc" -ForegroundColor Gray
        }
        else {
            Write-Host "$Prefijo$rama$iconoSize 📄 $nombreAlineado $lineasAlineado" -ForegroundColor Gray
        }
    }
}

function Ejecutar-ConExport {
    param([scriptblock]$funcion)

    if ($ArchivoExport -ne "") {
        Start-Transcript -Path $ArchivoExport -Append -Force
        & $funcion
        Stop-Transcript
        Write-Host "`nArchivo exportado a: $ArchivoExport" -ForegroundColor Green
    }
    else {
        & $funcion
    }
}

Write-Host "INVENTARIO DEL PROYECTO" -ForegroundColor Green
Write-Host "Ruta: $Ruta" -ForegroundColor DarkGray
Write-Host "Extensiones: $($Extensiones -join ', ')" -ForegroundColor DarkGray
Write-Host ("=" * 80)

Ejecutar-ConExport {
    Mostrar-Arbol -Directorio $Ruta -Prefijo ""
}
