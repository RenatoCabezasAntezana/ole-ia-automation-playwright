# ole-ia-automation-playwright

Proyecto de automatización E2E con TypeScript + Playwright + Cucumber.js (BDD) sobre `https://www.saucedemo.com/`.

---

## Trigger — número de ticket Jira

Hay dos modos de ejecución según cómo el usuario proporcione el ticket:

- **Flujo completo** → el usuario proporciona únicamente el número de ticket (ej. `SB-78`): crea rama, genera código, corre tests, commitea y crea PR.
- **Flujo local** → el usuario proporciona `local` seguido del número de ticket (ej. `local SB-78`): planifica, genera código, corre tests en `localhost:3000` y reporta resultados. Sin git, sin PR. Ver sección [Flujo local — validación en localhost](#flujo-local--validación-en-localhost).

---

## Flujo completo

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

### Paso 5 — Ejecutar los tests y capturar el reporte
Claude Code (orquestador) ejecuta directamente en modo headless:
```bash
HEADLESS=true npm run test:dev -- --tags "@{modulo}"
```
- El reporte HTML se genera en `reports/cucumber-report.html`
- La URL permanente del reporte es: `https://ole-ia-automation-playwright.surge.sh`
- ⚠️ Si el comando falla por error de configuración (no por tests en rojo): detener y reportar. Los tests en rojo son esperados si hay discrepancias conocidas del Paso 4.

### Paso 6 — Commitear y pushear el código generado
Invocar el agente `github-manager`:
- Stagear solo los archivos del módulo generado
- Commitear con mensaje: `feature({ticket-key}): add {modulo} E2E tests`
- Pushear a la rama `feature/{ticket-key}-{modulo}`
- ⚠️ Si el push falla: detener y reportar. No continuar.

### Paso 7 — Crear Pull Request
Invocar el agente `github-manager`:
- Crear PR desde `feature/{ticket-key}-{modulo}` hacia `main`
- Título: `[AUTO] {ticket-key} — {Modulo}: E2E automation`
- Incluir en el cuerpo: tabla de escenarios, archivos generados, URL del reporte Surge
- Devolver la URL del PR creado

> El flujo del orquestador termina aquí. El reporte en Jira y la creación de bugs
> son responsabilidad de GitHub Actions al ejecutarse la pipeline.

---

> ⚠️ **Todo el reporte en Jira ocurre desde CI (GitHub Actions)**, no desde el orquestador.
> Al hacer push en el paso 5, GitHub Actions ejecuta los tests y al finalizar:
> - `scripts/jira-report-failures.js` detecta escenarios fallidos, crea bugs `[AUTO]`
>   en Jira y adjunta el screenshot de evidencia (guardado en disco solo en CI)
> - Comenta en el ticket original con los resultados de la ejecución y la URL del reporte

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

### Paso 4 — Bug de la app
Si el error es de la app (no del código de automatización):
- El test seguirá fallando intencionalmente — el `.feature` es el contrato del negocio
- Commitear los archivos tal como están con `github-manager` y pushear
- GitHub Actions detectará el fallo, `jira-report-failures.js` creará el bug `[AUTO]`
  en Jira automáticamente con el screenshot de evidencia adjunto
- No es necesario crear el bug manualmente desde el orquestador

---

## Flujo local — validación en localhost

Cuando el usuario proporcione `local` seguido de un número de ticket Jira (ej. `local SB-78`), ejecutar automáticamente el siguiente flujo sin pedir confirmación ni input adicional:

### Paso 1 — Leer el ticket
Invocar el agente `atlassian-manager`:
- Leer el ticket con `mcp__atlassian__getJiraIssue`
- Extraer la descripción y los criterios de aceptación
- Identificar el nombre del módulo y la URL local (se asume `http://localhost:3000` si no se especifica otra)
- ⚠️ Si falla o el ticket no existe: detener y reportar al usuario. No continuar.

### Paso 1.5 — Crear rama en GitHub
Invocar el agente `github-manager`:
- Crear rama `feature/{ticket-key}-{modulo}` desde `main`
- Publicar la rama en el remoto (`git push -u origin`)
- ⚠️ Si falla: detener y reportar. No continuar.

### Paso 2 — Planificar los tests
Invocar el agente `playwright-planner` pasándole los criterios extraídos en el paso 1:
- Navegar `http://localhost:3000` en tiempo real
- Explorar la UI del módulo correspondiente
- Guardar screenshots en `reports/evidence/planner-{modulo}-{flujo}-{timestamp}.png`
- Generar plan BDD en Markdown con escenarios Given/When/Then en español
- ⚠️ Si falla o devuelve plan vacío: detener y reportar. No continuar.

### Paso 3 — Generar el código
Invocar el agente `playwright-generator` pasándole el plan del paso 2:
- Generar `src/tests/features/{modulo}.feature`
- Generar `src/page/{Modulo}Page.ts`
- Generar `src/tests/step-definitions/{modulo}.ts`
- Ejecutar `npx tsc --noEmit` para verificar compilación
- ⚠️ Si hay errores de compilación sin resolver: detener y reportar. No continuar.

### Paso 4 — Ejecutar los tests localmente
Claude Code ejecuta directamente en modo headless:
```bash
HEADLESS=true npm run test:dev -- --tags "@{modulo}"
```

### Paso 5 — Clasificar los fallos

**Si todos los tests pasan:** reportar al usuario con tabla de resultados.

**Si hay tests fallidos, clasificar cada fallo:**

#### Error de código de automatización (selector roto, assertion incorrecta, TypeScript error)
- Invocar `playwright-healer` (máximo 2 intentos)
- Re-ejecutar tests tras cada intento
- Si el healer repara y los tests pasan → invocar `github-manager` para commitear y pushear el fix en la rama `feature/{ticket-key}-{modulo}`
- Si tras 2 intentos sigue fallando → tratar como bug de la app (ver abajo)

#### Bug de la app (comportamiento inesperado, mensaje incorrecto, flujo roto)
Invocar el agente `atlassian-manager`:
- Crear un bug `[AUTO]` en Jira con:
  - Título: `[AUTO] {ticket-key} — {modulo}: {nombre del escenario fallido}`
  - Descripción: escenario fallido, mensaje de error, URL del reporte de Cucumber
  - Screenshot de evidencia si está disponible en `reports/evidence/`
- Vincular el bug al ticket padre `{ticket-key}` con `mcp__atlassian__createIssueLink`

### Paso 6 — Reportar resultados al usuario
Mostrar al usuario:
- Tabla de escenarios con resultado (✅ pasó / ❌ falló)
- Bugs creados en Jira (con su key y link)
- URL del reporte de Cucumber (si se generó)

> No se crea PR. La rama queda publicada con el código generado y cualquier fix del healer commiteado.

---

## Trigger — retest de bugs vinculados

Cuando el usuario proporcione `retest-{ticket-key}` (ej. `retest-SB-108`), ejecutar automáticamente el siguiente flujo sin pedir confirmación ni input adicional:

### Paso 1 — Leer el ticket y obtener bugs vinculados
Invocar el agente `atlassian-manager`:
- Leer el ticket con `mcp__atlassian__getJiraIssue`
- Buscar todos los bugs `[AUTO]` vinculados al ticket usando `mcp__atlassian__getJiraIssueRemoteIssueLinks` y/o JQL: `issueType = Bug AND text ~ "[AUTO]" AND issueLinks in linkedIssues("{ticket-key}")`
- Extraer el módulo y los escenarios fallidos de cada bug
- ⚠️ Si no hay bugs vinculados: reportar al usuario y detener.

### Paso 2 — Ejecutar los tests del módulo
Claude Code ejecuta directamente en modo headless:
```bash
HEADLESS=true npm run test:dev -- --tags "@{modulo}"
```

### Paso 3 — Clasificar los resultados

**Si todos los tests pasan (bugs reparados):**
Invocar el agente `atlassian-manager`:
- Transicionar cada bug vinculado a `Done`
- Comentar en cada bug con evidencia: URL del reporte + resumen de escenarios en verde
- Comentar en el ticket padre que todos los bugs fueron verificados como resueltos

**Si hay tests fallidos, clasificar cada fallo:**

#### Error de código de automatización (selector roto, assertion incorrecta)
Puede ocurrir si el dev cambió la UI al arreglar el bug:
- Invocar `playwright-healer` (máximo 2 intentos)
- Re-ejecutar los tests tras cada intento
- Si el healer repara y los tests pasan → ir al bloque "todos los tests pasan" arriba
- Si tras 2 intentos sigue fallando → tratar como bug de la app (ver abajo)

#### Bug de la app (el bug sigue sin resolver)
Invocar el agente `atlassian-manager`:
- Comentar en el bug que los tests aún fallan + URL del reporte
- No cambiar el estado del ticket — el bug permanece abierto
- Reportar al usuario qué escenarios siguen fallando

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
