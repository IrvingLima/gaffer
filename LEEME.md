# Gaffer — Modo Carrera (v4.24)

Abre **`index.html`** con doble clic en cualquier navegador (también en móvil). Se guarda solo en tu dispositivo (IndexedDB), funciona sin conexión y no tiene anuncios ni pagos. Hay **6 ranuras de carrera** para jugar partidas simultáneas.

## Qué incluye
- **20 países, 80 divisiones, 1.388 clubes y ~35.000 jugadores.** Europa (España, Inglaterra, Alemania, Italia, Francia, Portugal, Rusia, Países Bajos, Turquía, Bélgica, Escocia, Austria, Suiza, Dinamarca, Polonia, Grecia) y América con temporada de año natural (Brasil, Argentina, México, EE. UU.). Cada país tiene 4 divisiones, copa nacional, ventanas de fichajes de fechas reales y, los europeos, plazas continentales.
- **Temporada por país:** los países de año natural cierran su liga en diciembre y arrancan en su pretemporada; el 30 de junio solo cambian contratos y cantera. Las carreras empiezan siempre al principio de la temporada de tu liga.
- **Mercado mundial estilo FIFA:** buscas en todas las ligas, filtras por posición concreta, liga, nacionalidad, edad, nivel, potencial y precio, ordenas por calidad/precio, margen de crecimiento, salario… y ofertas por **cualquier** jugador. Atajos: «Alcanzables ahora», «Promesas baratas», «Fin de contrato», «Veteranos útiles». Indica si el precio y el salario te entran. **Pre-contrato** gratis desde enero a quien acaba contrato en junio.
- **Negociación en dos fases** (club y agente) con contraofertas, cláusulas, rivales que pujan, cesión con opción, **analista A–F** y **medidor del límite salarial** que se mueve con el deslizador.
- **Dificultad** al empezar (Relajado / Equilibrado / Exigente): presupuesto, margen salarial, precios y rivales.
- **Agentes libres con calidad cada verano:** estrellas veteranas, jugadores sólidos, promesas liberadas, más un goteo semanal. La IA tarda en llevárselos. Los recién fichados libres no se revenden con beneficio.
- **Jugadores:** posiciones reales (POR, DFC, LI, LD, CAI, CAD, MCD, MC, MCO, MI, MD, EI, ED, SD, DC) con alternativas, regates y pie malo en estrellas, estilos de juego (PlayStyles), bandera, y **evolución del nivel con flechas ▲▼, gráfica y explicación** de cada cambio. Potencial coherente con la edad y limitado en el precio.
- **Nombres variados:** miles de combinaciones por cultura y control para que los apellidos no se repitan.
- **Ojeo con medias ocultas** (opción para ver las exactas, desactivada), **mapa mundial animado** con zoom por regiones, staff y mercado de entrenadores.
- **Partido:** tres modos — *Simular todo*, *Momentos clave* (juegas solo las ocasiones de más peso) y *Jugar completo* — que puedes cambiar durante el partido; mapa de tiros, posesión y xG en vivo; resumen con los 3 momentos que lo decidieron.
- **Cantera jugable todo el año**, liga juvenil, cesiones con semáforo, mentores y diagnóstico de crecimiento.
- **Decisiones pendientes** con urgencia, datos clave y acciones; **guía «¿Cómo lograrlo?»** en cada objetivo; **retos mensuales** y **pedir fondos** a la directiva.
- **Historia permanente:** temporadas, ascensos, mejor once por temporada, canteranos graduados y su destino. **Carretera a la gloria:** empieza en 4ª división con presupuesto corto.
- **Create-a-Club** con filosofía (cantera / fichajes / equilibrada) que cambia objetivos y presupuesto, y rival histórico (derbi).

## Estructura
`index.html` · `css/style.css` · `js/`: datos (`data`, `data2`, `data3`, `names`), motor (`core`, `roles`, `sim`, `world`, `tourn`, `season`, `user1-3`, `manager`, `game`) e interfaz (`flags`, `ui-base`, `ui-views`, `ui-market`, `ui-map`, `ui-decide`, `ui-neg`, `ui-actions`, `ui-match`) · `playtest/` (rondas de pruebas CANTERA) · `v2_backup/`, `v3_backup_js/`.

## Pruebas (manual del agente playtester)
`node playtest/cantera.js ronda-N [fast|soak|pt24|all]` ejecuta los escenarios PT-xx con semillas reproducibles y `node playtest/informe.js ronda-N` genera el paquete de entrega. Los usuarios son **simulados**: sirven para detectar fallos, no sustituyen a jugadores reales.

## Del brief de 14 funciones
Implementadas: 1 cantera todo el año, 2 potencial como rango con explicación de cada cambio, 3 Create-a-Club con filosofía y rival, 4 negociación con analista A–F, 5 y 6 simulación interactiva (tres modos) con xG y momentos decisivos, 7 pretemporada (torneo con premio, riesgo y moral) e informe semanal de entrenamiento, 8 gestión internacional **ligera** (convocatorias de tus jugadores en los parones, con efectos visibles), 9 Deadline Day por horas, 10 historia permanente y Carretera a la gloria, 11 patrocinador a elegir + pedir fondos, 13 medias ocultas, 14 retos mensuales y destituciones de entrenadores anunciadas con motivo.
Pendientes: 8 dirigir una selección (calendario y plantilla propios), 12 jugador-mánager (no existe el modo jugador), pulir 14 (fichajes de entrenadores con motivo más detallado). Todas las cifras nuevas son propuestas a validar con CANTERA y con jugadores reales.
