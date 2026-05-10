/**
 * Weather Calendar — Demo API Open-Meteo
 * =======================================
 * API pública utilizada: https://open-meteo.com/
 *
 * Endpoint principal:
 *   GET https://api.open-meteo.com/v1/forecast
 *
 * Parámetros usados:
 *   - latitude, longitude: coordenadas de la ciudad
 *   - daily: variables diarias (temperatura, precipitación, viento, etc.)
 *   - timezone: auto (detecta la zona horaria por coordenadas)
 *   - forecast_days: 7 (previsión de 7 días)
 *
 *  Sin API key ·  Gratuita ·  Licencia CC BY 4.0
 */

"use strict";

// ─── Constantes ──────────────────────────────────────────────────────────────

const API_BASE = "https://api.open-meteo.com/v1/forecast";

const DAILY_PARAMS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "windspeed_10m_max",
  "weathercode",
  "precipitation_probability_max",
  "uv_index_max",
  "cloudcover_mean"
].join(",");

// Códigos WMO → descripción e icono
const WMO = {
  0:  { label: "Cielo despejado",          icon: "☀️" },
  1:  { label: "Mayormente despejado",      icon: "🌤️" },
  2:  { label: "Parcialmente nublado",      icon: "⛅" },
  3:  { label: "Nublado",                   icon: "☁️" },
  45: { label: "Niebla",                    icon: "🌫️" },
  48: { label: "Niebla con escarcha",       icon: "🌫️" },
  51: { label: "Llovizna ligera",           icon: "🌦️" },
  53: { label: "Llovizna moderada",         icon: "🌦️" },
  61: { label: "Lluvia leve",               icon: "🌧️" },
  63: { label: "Lluvia moderada",           icon: "🌧️" },
  65: { label: "Lluvia intensa",            icon: "🌧️" },
  71: { label: "Nieve leve",               icon: "❄️" },
  73: { label: "Nieve moderada",           icon: "❄️" },
  80: { label: "Chubascos",                icon: "🌦️" },
  81: { label: "Chubascos moderados",      icon: "🌧️" },
  95: { label: "Tormenta",                 icon: "⛈️" },
  99: { label: "Tormenta con granizo",     icon: "⛈️" }
};

const DAYS_ES   = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// ─── Estado ──────────────────────────────────────────────────────────────────

let state = {
  weather: [],      // Array de objetos con datos por día
  selectedDay: 0,   // Índice del día seleccionado
  chart: null       // Instancia de Chart.js
};

// ─── Utilidades ──────────────────────────────────────────────────────────────

/**
 * Resuelve el código WMO al objeto { label, icon }.
 * Si el código exacto no existe, usa el más cercano por debajo.
 */
function resolveWMO(code) {
  if (WMO[code]) return WMO[code];
  const keys = Object.keys(WMO).map(Number).sort((a, b) => b - a);
  const match = keys.find(k => code >= k);
  return WMO[match] ?? { label: "Desconocido", icon: "🌡️" };
}

/**
 * Convierte una cadena de fecha "YYYY-MM-DD" a un objeto Date
 * evitando el problema de zona horaria (UTC offset).
 */
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
}

function getDayName(dateStr) {
  return DAYS_ES[parseLocalDate(dateStr).getDay()];
}

function isToday(dateStr) {
  const today = new Date();
  const d = parseLocalDate(dateStr);
  return today.getFullYear() === d.getFullYear() &&
         today.getMonth() === d.getMonth() &&
         today.getDate() === d.getDate();
}

/**
 * Genera la recomendación textual basada en los datos del día.
 * Este es el VALOR AÑADIDO: procesamos los datos de la API
 * y los convertimos en consejos útiles para el usuario.
 */
function buildRecommendation(day) {
  const tips = [];

  if (day.code >= 95) {
    tips.push("⚠️ Tormentas previstas: mejor quedarse en casa o evitar zonas al aire libre.");
  } else if (day.code >= 61) {
    tips.push("🌧️ Lluvia significativa: lleva paraguas o impermeable.");
  } else if (day.code >= 51) {
    tips.push("☂️ Posibles lloviznas: lleva un chubasquero ligero.");
  }

  if (day.max >= 35) {
    tips.push("🥵 Calor extremo: hidratación constante, evita el sol de 12h a 17h.");
  } else if (day.max >= 28) {
    tips.push("☀️ Día caluroso: usa protección solar (mínimo SPF 30).");
  } else if (day.max <= 5) {
    tips.push("🧥 Temperaturas muy bajas: abrígate bien y cuida el hielo en las vías.");
  } else if (day.max <= 12) {
    tips.push("🧣 Fresco: conviene llevar ropa de abrigo.");
  }

  if (day.wind > 60) {
    tips.push("💨 Viento muy fuerte: precaución al conducir y evita zonas expuestas.");
  } else if (day.wind > 40) {
    tips.push("💨 Viento notable: ten cuidado con objetos que puedan caer.");
  }

  if (day.uv >= 8) {
    tips.push("🔆 Índice UV muy alto: protección solar obligatoria, usa gafas y sombrero.");
  } else if (day.uv >= 6) {
    tips.push("🔆 Índice UV alto: aplica protector solar aunque esté nublado.");
  }

  if (tips.length === 0) {
    const wmo = resolveWMO(day.code);
    if (day.code <= 1) {
      tips.push("🌿 Día excelente para actividades al aire libre. ¡Disfrútalo!");
    } else {
      tips.push(`Condiciones normales con ${wmo.label.toLowerCase()}. Sin alertas especiales.`);
    }
  }

  return tips.join(" ");
}

// ─── Llamada a la API ─────────────────────────────────────────────────────────

/**
 * Fetcha los datos de previsión meteorológica de Open-Meteo.
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} - JSON de respuesta de la API
 */
async function fetchForecast(lat, lon) {
  const url = new URL(API_BASE);
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("daily", DAILY_PARAMS);
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  // Mostrar la URL real en el banner de info
  document.getElementById("request-url").textContent = decodeURIComponent(url.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Error de API: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Transforma la respuesta raw de la API en el formato que usa nuestra app.
 * Aquí normalizamos y enriquecemos los datos.
 */
function parseAPIResponse(data) {
  const d = data.daily;
  return d.time.map((date, i) => ({
    date,
    max:         d.temperature_2m_max[i] ?? 0,
    min:         d.temperature_2m_min[i] ?? 0,
    rain:        d.precipitation_sum[i] ?? 0,
    wind:        d.windspeed_10m_max[i] ?? 0,
    code:        d.weathercode[i] ?? 0,
    precipProb:  d.precipitation_probability_max[i] ?? 0,
    uv:          d.uv_index_max[i] ?? 0,
    cloud:       d.cloudcover_mean[i] ?? 0
  }));
}

// ─── Renderizado ─────────────────────────────────────────────────────────────

function renderWeekGrid() {
  const grid = document.getElementById("week-grid");
  grid.innerHTML = state.weather.map((day, i) => {
    const wmo = resolveWMO(day.code);
    const rainWidth = Math.min(100, Math.round(day.rain * 8));
    const isSelected = i === state.selectedDay;
    const today = isToday(day.date);

    return `
      <div
        class="day-card${isSelected ? " selected" : ""}${today ? " today-indicator" : ""}"
        onclick="selectDay(${i})"
        role="listitem"
        aria-label="${getDayName(day.date)} ${formatDate(day.date)}, ${wmo.label}, máxima ${Math.round(day.max)}°C"
        tabindex="0"
      >
        <div class="day-name">${getDayName(day.date)}</div>
        <div class="day-num">${formatDate(day.date)}</div>
        <span class="weather-icon" aria-hidden="true">${wmo.icon}</span>
        <div class="temp-max">${Math.round(day.max)}°</div>
        <div class="temp-min">${Math.round(day.min)}°</div>
        <div class="rain-bar-wrap" title="Precipitación: ${day.rain.toFixed(1)}mm">
          <div class="rain-bar" style="width: ${rainWidth}%"></div>
        </div>
      </div>`;
  }).join("");
}

function renderDetailPanel() {
  const panel = document.getElementById("detail-panel");
  const day = state.weather[state.selectedDay];
  if (!day) return;

  const wmo = resolveWMO(day.code);
  const rec = buildRecommendation(day);

  panel.hidden = false;
  panel.innerHTML = `
    <div class="detail-header">
      <div>
        <div class="detail-date">${wmo.icon} ${getDayName(day.date)}, ${formatDate(day.date)}</div>
        <div class="detail-summary">${wmo.label}</div>
      </div>
    </div>

    <div class="metrics">
      <div class="metric">
        <span class="metric-icon">🌡️</span>
        <div class="metric-label">Máx / Mín</div>
        <div class="metric-val">${Math.round(day.max)}°<span class="metric-unit">/ ${Math.round(day.min)}°C</span></div>
      </div>
      <div class="metric">
        <span class="metric-icon">🌧️</span>
        <div class="metric-label">Precipitación</div>
        <div class="metric-val">${day.rain.toFixed(1)}<span class="metric-unit"> mm</span></div>
      </div>
      <div class="metric">
        <span class="metric-icon">☂️</span>
        <div class="metric-label">Prob. lluvia</div>
        <div class="metric-val">${day.precipProb}<span class="metric-unit"> %</span></div>
      </div>
      <div class="metric">
        <span class="metric-icon">💨</span>
        <div class="metric-label">Viento máx.</div>
        <div class="metric-val">${Math.round(day.wind)}<span class="metric-unit"> km/h</span></div>
      </div>
      <div class="metric">
        <span class="metric-icon">🔆</span>
        <div class="metric-label">Índice UV</div>
        <div class="metric-val">${Math.round(day.uv)}<span class="metric-unit"> / 11+</span></div>
      </div>
      <div class="metric">
        <span class="metric-icon">☁️</span>
        <div class="metric-label">Nubosidad</div>
        <div class="metric-val">${Math.round(day.cloud)}<span class="metric-unit"> %</span></div>
      </div>
    </div>

    <div class="recommendation">
      <div class="rec-title">💡 Recomendación del día</div>
      <p class="rec-text">${rec}</p>
    </div>`;
}

function renderChart() {
  const section = document.getElementById("chart-section");
  section.hidden = false;

  const labels  = state.weather.map(d => `${getDayName(d.date)} ${formatDate(d.date)}`);
  const maxTemps = state.weather.map(d => Math.round(d.max));
  const minTemps = state.weather.map(d => Math.round(d.min));

  const canvas = document.getElementById("temp-chart");

  if (state.chart) {
    state.chart.destroy();
  }

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#9ca3af" : "#6b7280";

  state.chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Máxima (°C)",
          data: maxTemps,
          borderColor: "#EF9F27",
          backgroundColor: "rgba(239,159,39,0.12)",
          fill: true, tension: 0.4,
          pointBackgroundColor: "#EF9F27",
          pointRadius: 5
        },
        {
          label: "Mínima (°C)",
          data: minTemps,
          borderColor: "#378ADD",
          backgroundColor: "rgba(55,138,221,0.12)",
          fill: true, tension: 0.4,
          pointBackgroundColor: "#378ADD",
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: textColor, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}°C`
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 11 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor, font: { size: 11 },
            callback: v => `${v}°`
          }
        }
      }
    }
  });
}

function showError(message) {
  document.getElementById("week-grid").innerHTML = `
    <div class="error-box" style="grid-column:1/-1">
      ⚠️ ${message}
    </div>`;
}

// ─── Interacción ─────────────────────────────────────────────────────────────

function selectDay(index) {
  state.selectedDay = index;
  renderWeekGrid();
  renderDetailPanel();
}

// ─── Carga principal ──────────────────────────────────────────────────────────

async function loadWeather(lat, lon, cityName) {
  // Mostrar spinner
  document.getElementById("week-grid").innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Obteniendo datos de Open-Meteo para <strong>${cityName}</strong>...</p>
    </div>`;
  document.getElementById("detail-panel").hidden = true;
  document.getElementById("chart-section").hidden = true;

  try {
    const raw = await fetchForecast(lat, lon);
    state.weather = parseAPIResponse(raw);

    // Seleccionar el día de hoy por defecto
    const todayIndex = state.weather.findIndex(d => isToday(d.date));
    state.selectedDay = todayIndex >= 0 ? todayIndex : 0;

    renderWeekGrid();
    renderDetailPanel();
    renderChart();

  } catch (error) {
    console.error("Error cargando datos:", error);
    showError(`No se pudieron cargar los datos: ${error.message}. Comprueba tu conexión.`);
  }
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

document.getElementById("city-select").addEventListener("change", function () {
  const [lat, lon, name] = this.value.split(",");
  loadWeather(parseFloat(lat), parseFloat(lon), name);
});

document.getElementById("show-request-btn").addEventListener("click", function () {
  const block = document.getElementById("request-block");
  block.hidden = !block.hidden;
  this.textContent = block.hidden ? "Ver petición API" : "Ocultar petición";
});

// ─── Inicio ───────────────────────────────────────────────────────────────────

(function init() {
  const [lat, lon, name] = document.getElementById("city-select").value.split(",");
  loadWeather(parseFloat(lat), parseFloat(lon), name);
})();