# Dreadmoor Tracker — Roadmap de Mejoras

Checklist de mejoras basadas en el feedback de `r/DreadmoorGame`, datos del **Early Access** (28 especies en total) y el estado actual de la web.

---

## 1. Datos clave en cada pez (`src/data/fish.json` y `src/i18n/translations.js`)

- [x] **Definir nuevo esquema de `fish.json`:** Incorporar `rarity`, `isMutant`, `timeOfDay`, `lineRequirement`, `habitat`, `sellPrice` y `recycling` manteniendo compatibilidad con `id`, `name`, `image`, `baits`, `locations`, `category`, `contractUse` y `notes`.
- [x] **Precio de venta y reciclaje (`sellPrice` + `recycling`):** Mostrar rango de venta y materiales obtenidos al procesar cada pez (ej. *Chromatic scales*, *Bone plate*, *Jaws*, *Fish meat*, *Leeches*).
- [x] **Rareza y Mutantes (`rarity` + `isMutant`):** Clasificar en `Common`, `Rare`, `Unique` (nocturnos) y `Legendary` (puntos fijos con barco atracado), además de marcar variantes mutantes (*Sea Blight*).
- [x] **Horario (`timeOfDay`):** Agregar campo estructurado (`Day`, `Night`, `Both`) en `fish.json`, su traducción en `translations.js` y un badge + filtro en `App.jsx`.
- [x] **Resistencia de línea / Módulo mínimo (`lineRequirement`):** Indicar requisito exacto (`None`, `Line Strength 30`, `Thrust 30`, `Exhaustion 30`, `Exhaustion 45`, etc.) y dónde conseguir el plano/mejora si aplica.
- [x] **Hábitat / Profundidad (`habitat`):** Agregar tipo de hábitat general (bajíos, aguas tranquilas, mar abierto, cuevas, zonas agitadas, aguas nocturnas) con traducciones y visualización en tarjeta.
- [x] **Catálogo completo de Early Access (28 especies):** Ampliar la lista actual (6 peces) con el resto de especies confirmadas del Early Access (10 pacíficos/estándar, 6 depredadores y 12 mutantes/únicos/legendarios; falta completar datos numéricos de *Bristler* cuando haya guía).
- [x] **Fallback de imágenes (`public/images/fish/`):** Agregar manejo visual cuando un pez nuevo aún no tenga `.webp` propio para evitar íconos rotos mientras se completan las imágenes.
- [x] **Indicador de versión ("Actualizado a Early Access"):** Mostrar un badge o etiqueta clara en el header/subtítulo para diferenciar la guía de las viejas guías de la demo.

---

## 2. Búsqueda y filtros (`src/App.jsx`)

- [ ] **Buscador ampliado:** Hacer que el campo de búsqueda filtre no solo por `fish.name`, sino también por `contractUse`, `locations`, `habitat` y `notes` (en el idioma activo).
- [x] **Filtros nuevos (`timeOfDay`, `rarity`, `lineRequirement`):** Permitir filtrar rápidamente peces nocturnos, legendarios/únicos o sin requisito de línea.
- [ ] **Referencia rápida de cebos:** Agregar un tooltip, popover o sección desplegable con **"Cómo conseguir cada cebo"** (tienda donde se compra o receta de crafteo: *Earthworm*, *Wind-Up Tin*, *Sturdy Earcrawler*, *Rainbow Fin*, *Flaming Belly*, *Pipecross*, *Clinging Pincer*).
- [ ] **Vista compacta / tabla (opcional para 28+ peces):** Permitir alternar entre vista de tarjetas y lista compacta para recorrer las 28 especies más rápido.

---

## 3. Secciones nuevas de alto valor (`src/App.jsx` + nuevos datos/componentes)

- [ ] **Navegación por pestañas:** Agregar tabs simples en la cabecera (ej. `Peces / Tracker`, `Zonas y Mapa`, `Guía y FAQ`).
- [ ] **Guía de Zonas / Puntos sin nombre:** Lista de ubicaciones clave con referencias cardinales desde el Puesto Comercial (ej. *Lilo's Cave*, *Ghoul Tower*, *Tuning Fork*, *The Throat*, *Drowned Ruins*, *Blighted Backwater*, *Wreck Fields*) para suplir la falta de nombres en el mapa del juego.
- [ ] **FAQ de Early Access y Mecánicas:**
  - [ ] Dónde encontrar ítems críticos de misión/crafteo (bidones de combustible, cuerda entre restos flotantes, planos de mejoras).
  - [ ] Solución a *softlocks* conocidos (ej. bloqueo tras hablar con el Padre Matthias, bug de progreso de pesca).
  - [ ] Explicación de mecánicas poco claras (limpiar percebes del casco, durabilidad del barco, técnica quieto vs. recoger lento, atajos/controles alternativos de pesca).
