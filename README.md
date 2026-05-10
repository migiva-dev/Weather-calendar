**Calendario meteorológico semanal con recomendaciones inteligentes**  
*Integración con la API pública de Open-Meteo · Sin API key · 100% gratuito*

<br />

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-1D9E75?style=for-the-badge&logo=cloud&logoColor=white)](https://open-meteo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

🌐 **[Ver demo en vivo →](https://migiva-dev.github.io/Weather-calendar/)**

<br />

---

</div>

## 🗺️ ¿Qué es esto?

**Weather Calendar** es una aplicación web que consume la API pública de **Open-Meteo** para mostrar la previsión meteorológica de los próximos 7 días en formato de calendario interactivo.

El objetivo no es solo mostrar datos — sino **añadir valor** procesándolos:

- 🔢 Traduce códigos técnicos WMO a iconos y descripciones legibles
- 💡 Genera **recomendaciones contextuales** cruzando temperatura, UV, viento y lluvia
- 📊 Visualiza la evolución de temperaturas con una gráfica semanal
- 🔍 Muestra la petición real a la API en tiempo de ejecución (ideal para aprender)

---

## ✨ Funcionalidades

| Función | Descripción |
|---|---|
| 🗓️ **Calendario semanal** | Vista de 7 días con icono, máx/mín y barra de precipitación |
| 📋 **Detalle del día** | 6 métricas: temperatura, lluvia, prob. lluvia, viento, UV, nubosidad |
| 💡 **Recomendaciones** | Consejos inteligentes generados a partir de los datos de la API |
| 📈 **Gráfica de temperaturas** | Evolución máx/mín semanal con Chart.js |
| 🌍 **Multiciudad** | Valencia, Madrid, Barcelona, Sevilla, Bilbao, París, Londres, Nueva York |
| 🔍 **Debug API** | Botón para ver la URL exacta que se manda a Open-Meteo |
| 🌙 **Dark mode** | Soporta `prefers-color-scheme` automáticamente |
| ♿ **Accesibilidad** | ARIA labels, navegación por teclado, roles semánticos |

---

## 🔌 API: Open-Meteo

> *"Free Weather Forecast API for non-commercial use. No API key required."*

| | |
|---|---|
| 🌐 **URL base** | `https://api.open-meteo.com/v1/forecast` |
| 🔑 **API Key** | ❌ No necesaria |
| 💰 **Precio** | ✅ Gratuita |
| 📄 **Licencia datos** | CC BY 4.0 |
| ⚡ **Latencia** | < 10 ms |
| 📚 **Docs** | [open-meteo.com/en/docs](https://open-meteo.com/en/docs) |

### Ejemplo de petición real

​```http
GET https://api.open-meteo.com/v1/forecast
    ?latitude=39.4699
    &longitude=-0.3763
    &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,
           windspeed_10m_max,weathercode,precipitation_probability_max,
           uv_index_max,cloudcover_mean
    &timezone=auto
    &forecast_days=7
​```

### Fragmento de respuesta JSON

​```json
{
  "daily": {
    "time": ["2025-05-10", "2025-05-11", "..."],
    "temperature_2m_max": [24.1, 22.8, "..."],
    "temperature_2m_min": [15.3, 14.9, "..."],
    "weathercode": [1, 63, "..."],
    "precipitation_sum": [0.0, 8.2, "..."]
  }
}
​```

### Variables `daily` utilizadas

| Variable | Unidad | Descripción |
|---|---|---|
| `temperature_2m_max` | °C | Temperatura máxima del día |
| `temperature_2m_min` | °C | Temperatura mínima del día |
| `precipitation_sum` | mm | Precipitación acumulada |
| `windspeed_10m_max` | km/h | Velocidad máxima del viento |
| `weathercode` | WMO | Código del estado del tiempo |
| `precipitation_probability_max` | % | Probabilidad de lluvia |
| `uv_index_max` | índice | Índice UV máximo |
| `cloudcover_mean` | % | Nubosidad media |

---

## 🧠 Valor añadido sobre la API

La API devuelve números. Esta app los convierte en **información útil**:

​```js
// La API devuelve esto:
{ "weathercode": 63, "temperature_2m_max": 34.2, "uv_index_max": 9 }

// La app genera esto:
"🌧️ Lluvia moderada · 🔆 UV muy alto: usa protector solar aunque esté nublado."
​```

El motor de recomendaciones cruza 4 variables simultáneamente para generar consejos contextuales — algo que la API por sí sola no ofrece.

---

## 🚀 Instalación y uso

### Opción 1 — Abrir directo en el navegador

​```bash
git clone https://github.com/migiva-dev/Weather-calendar.git
cd Weather-calendar
# Abre index.html en tu navegador
​```

### Opción 2 — Servidor local

​```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Abre http://localhost:8080
​```

> ⚠️ Se recomienda servidor local para evitar restricciones CORS en algunos navegadores.

---

## 📁 Estructura

​```
Weather-calendar/
├── index.html      # Estructura y layout de la app
├── style.css       # Estilos + dark mode + responsive
├── app.js          # Lógica: API calls, procesado de datos, renderizado
└── README.md       # Este archivo
​```

---

## 🛠️ Tecnologías

- **HTML5 + CSS3 + JavaScript ES2020** — sin frameworks, vanilla puro
- **[Chart.js](https://www.chartjs.org/)** — gráfica de temperaturas semanales
- **[Open-Meteo API](https://open-meteo.com/)** — datos meteorológicos en tiempo real

---

## 📄 Licencia

MIT — libre para usar, modificar y distribuir.

Datos meteorológicos © [Open-Meteo](https://open-meteo.com) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

---

<div align="center">
  <sub>Hecho con ☕ · Demo educativa · <a href="https://github.com/migiva-dev">migiva-dev</a></sub>
</div>