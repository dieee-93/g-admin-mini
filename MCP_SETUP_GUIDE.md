# 🚀 MCP Servers Setup Guide - G-Admin Mini

## ✅ Configured MCPs

G-Admin Mini está configurado con **6 MCPs prioritarios** para optimizar el desarrollo:

1. **Filesystem** - Acceso seguro al codebase
2. **Memory** - Knowledge graph persistente
3. **GitHub** - Gestión de repositorio
4. **Postgres Pro** - Análisis de performance de BD
5. **Figma** - Design-to-code
6. **Claude Context** - Búsqueda semántica de código

---

## 📋 Setup Rápido

### 1️⃣ Copiar archivo de environment variables

```bash
cp .env.mcp.example .env.mcp
```

### 2️⃣ Obtener API Keys

Abre `.env.mcp` y completa las siguientes keys (instrucciones detalladas abajo).

### 3️⃣ Configurar variables de entorno

**Opción A: Script Automático (Recomendado)** ⭐

```powershell
# Ejecuta el script de configuración
.\setup-mcp-env.ps1
```

El script va a:
- ✅ Leer `.env.mcp`
- ✅ Configurar las variables en Windows
- ✅ Mostrar un resumen de lo configurado

**Opción B: Manual (PowerShell)**

```powershell
# Configurar cada variable manualmente
[System.Environment]::SetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "tu_token", "User")
[System.Environment]::SetEnvironmentVariable("SUPABASE_DATABASE_URL", "tu_url", "User")
[System.Environment]::SetEnvironmentVariable("FIGMA_ACCESS_TOKEN", "tu_token", "User")
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "tu_key", "User")
[System.Environment]::SetEnvironmentVariable("MILVUS_TOKEN", "tu_token", "User")
```

### 4️⃣ Reiniciar Claude Code

⚠️ **Importante**: Reinicia Claude Code completamente para que cargue las variables.

---

## 🔑 Cómo Obtener cada API Key

### **GitHub Personal Access Token**

1. Ve a: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Selecciona scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
4. Click **"Generate token"**
5. Copia el token y pégalo en `.env.mcp`:
   ```
   GITHUB_PERSONAL_ACCESS_TOKEN=ghp_TuTokenAqui...
   ```

---

### **Supabase Database URL**

1. Ve a tu proyecto en: https://supabase.com/dashboard
2. Click **"Project Settings"** (⚙️) → **"Database"**
3. Copia el **"Connection String (URI)"**
4. Pégalo en `.env.mcp`:
   ```
   SUPABASE_DATABASE_URL=postgresql://postgres:password@db.abc123.supabase.co:5432/postgres
   ```

⚠️ **Nota**: Reemplaza `[YOUR-PASSWORD]` con tu password real del proyecto

---

### **Figma Access Token**

1. Ve a: https://www.figma.com/developers/api#access-tokens
2. En Figma, click tu perfil → **"Settings"**
3. Scroll a **"Personal Access Tokens"**
4. Click **"Generate new token"**
5. Dale un nombre descriptivo (ej: "Claude Code MCP")
6. Copia el token y pégalo en `.env.mcp`:
   ```
   FIGMA_ACCESS_TOKEN=figd_TuTokenAqui...
   ```

---

### **OpenAI API Key**

1. Ve a: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Dale un nombre (ej: "Claude Context MCP")
4. Copia la key (solo se muestra una vez)
5. Pégala en `.env.mcp`:
   ```
   OPENAI_API_KEY=sk-TuKeyAqui...
   ```

💰 **Costo**: Claude Context usa embeddings (~$0.0001 por 1K tokens). Indexar G-Admin completo ~$0.50

---

### **Zilliz Cloud Token (Vector Database)**

1. Regístrate en: https://cloud.zilliz.com/signup
2. Crea un **Free Cluster**:
   - Click **"Create Cluster"**
   - Selecciona **"Free"** tier
   - Region: Más cercana a ti
   - Click **"Create"**
3. Una vez creado el cluster, ve a **"API Keys"**
4. Click **"Create API Key"**
5. Copia el token y pégalo en `.env.mcp`:
   ```
   MILVUS_TOKEN=TuTokenAqui...
   ```

📦 **Free Tier**: 2GB storage, suficiente para indexar proyectos medianos

---

## 🧪 Verificar Configuración

### Opción A: Usando Claude Code CLI

```bash
# Ver MCPs disponibles
claude mcp list

# Testear un MCP específico
claude mcp test filesystem
claude mcp test memory
```

### Opción B: Verificar en sesión de Claude

Inicia una nueva sesión de Claude Code en este proyecto y pregunta:

```
¿Qué MCPs están disponibles?
```

Deberías ver los 6 MCPs listados.

---

## 📊 MCPs por Categoría

### ✅ Sin API Keys (Listos para usar)

- **Filesystem** - Lectura segura de archivos del proyecto
- **Memory** - Knowledge graph persistente entre sesiones

### 🔑 Requieren API Keys

- **GitHub** - Necesita GitHub token
- **Postgres Pro** - Necesita Supabase connection string
- **Figma** - Necesita Figma token
- **Claude Context** - Necesita OpenAI + Zilliz tokens

---

## 🎯 Casos de Uso

### **Filesystem MCP**
```
"Lee el archivo src/App.tsx"
"Busca todos los archivos que usen Zustand"
"Muéstrame la estructura del directorio src/pages"
```

### **Memory MCP**
```
"Recuerda: usamos ChakraUI v3.23.0, NO v2"
"¿Cuál fue la decisión sobre el sistema de íconos?"
"Guarda que el bundle está optimizado de 34kb a 4.6kb"
```

### **GitHub MCP**
```
"Crea un PR para las mejoras de Materials UX"
"Muéstrame los últimos 5 commits"
"Crea un issue para implementar virtualization en Sales"
```

### **Postgres Pro MCP**
```
"Muéstrame las queries más lentas"
"Analiza el execution plan de SELECT * FROM materials"
"Recomienda índices para mejorar performance"
```

### **Figma MCP**
```
"Convierte este diseño de Figma a componente React con ChakraUI"
"Extrae los tokens de color de este frame"
```

### **Claude Context MCP**
```
"Indexa el codebase de G-Admin"
"Busca funciones que manejan autenticación"
"Encuentra dónde se usa EventBus para materials.stock_updated"
```

---

## 🔧 Troubleshooting

### Error: "MCP server not found"

Asegúrate que Node 20.x está activo:
```bash
node --version  # Debe mostrar v20.x.x
```

Si tenés Node 24, cambia a Node 20:
```bash
nvm use 20
```

### Error: "Missing environment variable"

1. Verifica que `.env.mcp` existe y tiene las keys
2. Reinicia Claude Code para que cargue las nuevas variables
3. Verifica que no hay espacios extra en las keys

### Error: "Command not found: npx"

Verifica que npm está instalado:
```bash
npm --version
```

---

## 📚 Recursos

- **MCP Official Docs**: https://modelcontextprotocol.io/
- **Claude Code MCP Guide**: https://docs.claude.com/en/docs/claude-code/mcp
- **Awesome MCP Servers**: https://github.com/wong2/awesome-mcp-servers

---

## 🎉 ¡Listo!

Una vez completadas todas las API keys, los 6 MCPs estarán disponibles en todas tus sesiones de Claude Code en este proyecto.

**Próximos pasos:**
1. Indexar el codebase con Claude Context
2. Configurar knowledge base en Memory MCP
3. Analizar performance de queries con Postgres Pro
