# ole-ia-automation-playwright

Proyecto de automatización E2E con TypeScript + Playwright + Cucumber.js (BDD) sobre `https://www.saucedemo.com/`.

---

## Trigger — número de ticket Jira

Cuando el usuario proporcione **únicamente un número de ticket Jira** (ej. `SB-78`, `OLE-12`), ejecutar automáticamente el siguiente flujo sin pedir confirmación ni input adicional:

### Paso 1 — Leer el ticket
Invocar el agente `atlassian-manager`:
- Leer el ticket con `mcp__atlassian__getJiraIssue`
- Extraer **solo la descripción** del ticket (campo `description`)
- Identificar el nombre del módulo desde la descripción (ej. `login`, `checkout`, `carrito`)
- ⚠️ Si falla o el ticket no existe: detener y reportar al usuario. No continuar.

### Paso 2 — Crear rama en GitHub
Invocar el agente `github-manager`:
- Crear rama `feature/{ticket-key}-{modulo}` desde `main`
- Ejemplo: `feature/SB-85-login`
- Publicar la rama en el remoto (`git push -u origin`)
- ⚠️ Si falla: detener y reportar. No continuar.

### Paso 3 — Planificar los tests
Invocar el agente `playwright-planner` pasándole los criterios extraídos en el paso 1:
- Navegar `https://www.saucedemo.com/` en tiempo real
- Explorar la UI del módulo correspondiente
- Guardar screenshots en `reports/evidence/planner-{modulo}-{flujo}-{timestamp}.png`
- Generar plan BDD en Markdown con escenarios Given/When/Then en español
- ⚠️ Si falla o devuelve plan vacío: detener y reportar. No continuar.

### Paso 4 — Generar el código
Invocar el agente `playwright-generator` pasándole el plan del paso 3:
- Generar `src/tests/features/{modulo}.feature`
- Generar `src/page/{Modulo}Page.ts`
- Generar `src/tests/step-definitions/{modulo}.ts`
- Ejecutar `npx tsc --noEmit` para verificar compilación
- El generator debe devolver explícitamente si detectó **discrepancias entre el ticket y la app** que harán fallar algún test intencionalmente
- ⚠️ Si falla o hay errores de compilación sin resolver: detener y reportar. No continuar.

### Paso 5 — Commitear y pushear el código generado
Invocar el agente `github-manager`:
- Stagear solo los archivos del módulo generado
- Commitear con mensaje: `feature({ticket-key}): add {modulo} E2E tests`
- Pushear a la rama `feature/{ticket-key}-{modulo}`
- ⚠️ Si el push falla: detener y reportar. No continuar.

### Paso 6 — Ejecutar los tests y capturar el reporte
Claude Code (orquestador) ejecuta directamente:
```bash
npm run test:dev -- --tags "@{modulo}"
```
- El reporte HTML se genera en `reports/cucumber-report.html`
- La URL permanente del reporte es: `https://ole-ia-automation-playwright.surge.sh`
- ⚠️ Si el comando falla por error de configuración (no por tests en rojo): detener y reportar. Los tests en rojo son esperados si hay discrepancias conocidas del Paso 4.

### Paso 7 — Crear bugs por discrepancias conocidas (si las hay)
Si el `playwright-generator` reportó discrepancias entre el ticket y el comportamiento real de la app:
Invocar el agente `atlassian-manager` **una vez por cada discrepancia**:
- Crear bug `[AUTO]` con summary: `[AUTO] Discrepancia: {descripción breve}`
- Descripción del bug: escenario afectado, valor esperado según ticket, valor real de la app
- Vincular con "Blocks" al ticket original
- ⚠️ Verificar con JQL si ya existe un bug `[AUTO]` para la misma discrepancia antes de crear uno nuevo

### Paso 8 — Crear Pull Request
Invocar el agente `github-manager`:
- Crear PR desde `feature/{ticket-key}-{modulo}` hacia `main`
- Título: `[AUTO] {ticket-key} — {Modulo}: E2E automation`
- Incluir en el cuerpo: tabla de escenarios, archivos generados, URL de Cucumber Reports
- Si se crearon bugs en el paso 7, mencionarlos en el PR
- Devolver la URL del PR creado

### Paso 9 — Reportar en Jira
Invocar el agente `atlassian-manager`:
- Comentar en el ticket con los escenarios cubiertos y los archivos creados
- Incluir el comando de ejecución: `npm run test:dev -- --tags "@{modulo}"`
- Incluir `📊 Reporte: https://ole-ia-automation-playwright.surge.sh`
- Incluir `🔀 PR: {pr_url}`
- Si se crearon bugs en el paso 7, mencionarlos con sus keys

---

## Flujo cuando un test falla

Cuando el usuario reporte un test fallido:

### Paso 1 — Clasificar el error
- **Error de código** (selector roto, assertion incorrecta, TypeScript error) → ir al paso 2
- **Error de la app** (comportamiento inesperado, URL incorrecta, flujo roto) → ir al paso 4

### Paso 2 — Reparar (máximo 2 intentos)
Invocar `playwright-healer`:
- Intento 1: healer repara → Claude Code re-ejecuta `npm run test:dev -- --tags "@{modulo}"` y captura URL de Cucumber Reports
- Si sigue fallando: Intento 2 → re-ejecutar y capturar URL
- Si tras 2 intentos sigue fallando o el error es de la app → ir al paso 4

### Paso 3 — Commitear el fix y actualizar el PR
Si el healer reparó el test exitosamente:
Invocar `github-manager`:
- Commitear los archivos reparados en la rama activa del módulo
- Pushear al remoto (el CI re-ejecutará automáticamente en GitHub Actions)
- Invocar `atlassian-manager` para comentar en el ticket que el fix fue aplicado + URL del reporte

### Paso 4 — Capturar evidencia del bug de la app
Invocar `playwright-healer` para:
- Reproducir el fallo en la app
- Guardar screenshot en `reports/evidence/evidence-bug-{modulo}-{timestamp}.png`
- Devolver la ruta absoluta del screenshot

### Paso 5 — Crear bug en Jira
Invocar `atlassian-manager`:
- Crear bug `[AUTO]` con el error exacto
- Adjuntar el screenshot como evidencia
- Vincular con "Blocks" al ticket original
- Comentar en la historia informando del fallo, el bug creado y la URL de Cucumber Reports

---

## Nota de orquestación

Los subagentes (`playwright-architect`, `playwright-planner`, etc.) no pueden usar el tool `Agent` recursivamente. **Claude Code principal es quien orquesta los subagentes en secuencia**, siguiendo los pasos definidos en este archivo.

---

## Estructura del proyecto

```
src/
  page/                          # Page Objects (extienden BasePage)
  tests/
    features/                    # Gherkin en español
    step-definitions/            # Steps
  support/
    world.ts                     # CustomWorld
    hooks.ts                     # BeforeAll limpia reports/evidence/
    env.ts                       # Variables de entorno y credenciales
reports/
  evidence/                      # Screenshots — se limpian en cada ejecución
```

## Scripts

```bash
npm run test:dev                            # todos los tests
npm run test:dev -- --tags "@smoke"         # solo smoke
npm run test:dev -- --tags "@{modulo}"      # filtrar por módulo
```

## GitHub Actions

El workflow `.github/workflows/e2e.yml` ejecuta los tests automáticamente en cada push o PR a `main`, y también puede dispararse manualmente con un tag específico.

**Secrets requeridos en GitHub → Settings → Secrets:**
| Secret | Descripción |
|--------|-------------|
| `BASE_URL` | URL base de la app (`https://www.saucedemo.com`) |
| `STANDARD_USER` | Usuario estándar |
| `STANDARD_PASSWORD` | Contraseña del usuario estándar |
| `LOCKED_USER` | Usuario bloqueado |
| `LOCKED_PASSWORD` | Contraseña del usuario bloqueado |
| `SURGE_TOKEN` | Token de Surge.sh para publicar el reporte (`npx surge token`) |
| `SLACK_WEBHOOK_URL` | URL del webhook del Slack Workflow Builder |
| `CUCUMBER_PUBLISH_TOKEN` | (Opcional) Token de Cucumber Reports para URLs persistentes |

**Reporte publicado en:** `https://ole-ia-automation-playwright.surge.sh`
Cada ejecución de Actions sobreescribe el dominio con el reporte más reciente y notifica a Slack.
