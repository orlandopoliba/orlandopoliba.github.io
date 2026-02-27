# Frequenze e grafici

### Statistica descrittiva

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Tabella delle frequenze e grafici

**Istruzioni**. Inserire le frequenze assolute e scegliere il tipo di diagramma da visualizzare.

<div class="frequency-layout" data-frequency-lab>
  <div class="frequency-panel">
    <table class="frequency-table" data-frequency-table>
      <thead>
        <tr>
          <th scope="col">Valori</th>
          <th scope="col">Frequenze assolute</th>
          <th scope="col">Frequenze relative</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2</td>
          <td><input class="frequency-input" type="number" min="0" step="1" value="1" /></td>
          <td class="frequency-relative">-</td>
        </tr>
        <tr>
          <td>3</td>
          <td><input class="frequency-input" type="number" min="0" step="1" value="1" /></td>
          <td class="frequency-relative">-</td>
        </tr>
        <tr>
          <td>5</td>
          <td><input class="frequency-input" type="number" min="0" step="1" value="1" /></td>
          <td class="frequency-relative">-</td>
        </tr>
        <tr>
          <td>7</td>
          <td><input class="frequency-input" type="number" min="0" step="1" value="1" /></td>
          <td class="frequency-relative">-</td>
        </tr>
        <tr>
          <td>10</td>
          <td><input class="frequency-input" type="number" min="0" step="1" value="1" /></td>
          <td class="frequency-relative">-</td>
        </tr>
      </tbody>
    </table>
    <div class="frequency-diagram-title" data-frequency-title>Diagramma a barre delle frequenze assolute</div>
    <div class="frequency-chart" data-frequency-chart role="img" aria-label="Diagramma a barre delle frequenze assolute"></div>
    <div class="frequency-toggle" data-frequency-toggle>
      <div class="frequency-switch" role="radiogroup" aria-label="Modalità del diagramma">
        <input class="frequency-switch-input" type="radio" name="frequency-mode" id="frequency-mode-absolute" value="absolute" aria-label="Frequenze assolute" checked />
        <input class="frequency-switch-input" type="radio" name="frequency-mode" id="frequency-mode-relative" value="relative" aria-label="Frequenze relative" />
        <input class="frequency-switch-input" type="radio" name="frequency-mode" id="frequency-mode-pareto" value="pareto" aria-label="Diagramma di Pareto" />
        <input class="frequency-switch-input" type="radio" name="frequency-mode" id="frequency-mode-pie" value="pie" aria-label="Diagramma a torta" />
        <span class="frequency-switch-track"></span>
        <span class="frequency-switch-thumb"></span>
        <label class="frequency-switch-marker marker-absolute" for="frequency-mode-absolute" title="Frequenze assolute"></label>
        <label class="frequency-switch-marker marker-relative" for="frequency-mode-relative" title="Frequenze relative"></label>
        <label class="frequency-switch-marker marker-pareto" for="frequency-mode-pareto" title="Diagramma di Pareto"></label>
        <label class="frequency-switch-marker marker-pie" for="frequency-mode-pie" title="Diagramma a torta"></label>
      </div>
    </div>
  </div>
  <div class="frequency-data-block">
  <div class="frequency-data-label">Dati:</div>
    <div class="frequency-data-list" data-frequency-list></div>
  </div>
</div>

---

## Intervalli di classe

<div id="intervalli-classi"></div>

Viene estratto un campione casuale di 35 pesi di un farmaco misurati in milligrammi.

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/classi-dati"><i class="fa-solid fa-angle-down"></i><strong>Visualizza dati</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

<div class="class-interval-plot">
  <div class="frequency-diagram-title" data-class-interval-title>Diagramma a barre delle frequenze relative</div>
  <div class="frequency-chart" data-class-interval-chart role="img" aria-label="Diagramma a barre delle frequenze relative"></div>
  <div class="frequency-chart is-hidden" data-class-interval-class-chart role="img" aria-label="Diagramma a barre delle frequenze relative per classi"></div>
  <div class="frequency-chart is-hidden" data-class-interval-histogram role="img" aria-label="Istogramma delle densità di frequenze relative"></div>
  <div class="range-dual-row class-interval-slider is-hidden" data-class-interval-slider>
    <div class="range-dual-track">
      <div class="range-dual range-quad">
        <input id="class-boundary-1" type="range" min="5.5" max="5.9" step="0.001" value="5.567" />
        <input id="class-boundary-2" type="range" min="5.5" max="5.9" step="0.001" value="5.633" />
        <input id="class-boundary-3" type="range" min="5.5" max="5.9" step="0.001" value="5.700" />
        <input id="class-boundary-4" type="range" min="5.5" max="5.9" step="0.001" value="5.767" />
        <input id="class-boundary-5" type="range" min="5.5" max="5.9" step="0.001" value="5.833" />
      </div>
      <div class="range-quad-labels" data-class-interval-labels>
        <span class="range-quad-label edge-left" data-class-boundary-label="min"></span>
        <span class="range-quad-label" data-class-boundary-label="1"></span>
        <span class="range-quad-label" data-class-boundary-label="2"></span>
        <span class="range-quad-label" data-class-boundary-label="3"></span>
        <span class="range-quad-label" data-class-boundary-label="4"></span>
        <span class="range-quad-label" data-class-boundary-label="5"></span>
        <span class="range-quad-label edge-right" data-class-boundary-label="max"></span>
      </div>
    </div>
  </div>
</div>

<div class="class-toggle-row">
  <div class="class-toggle" role="radiogroup" aria-label="Modalità di visualizzazione">
    <input class="class-toggle-input" type="radio" name="class-mode" id="class-mode-values" value="values" checked />
    <label class="class-toggle-label" for="class-mode-values">Valori</label>
    <input class="class-toggle-input" type="radio" name="class-mode" id="class-mode-class-freq" value="class-freq" />
    <label class="class-toggle-label" for="class-mode-class-freq">Classi</label>
    <input class="class-toggle-input" type="radio" name="class-mode" id="class-mode-class-density" value="class-density" />
    <label class="class-toggle-label" for="class-mode-class-density">Densità</label>
  </div>
</div>

--

## Dati del campione

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/intervalli-classi"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="classi-dati"></div>

<div class="dataset-grid">
  <span>5.582</span>
  <span>5.603</span>
  <span>5.622</span>
  <span>5.651</span>
  <span>5.671</span>
  <span>5.673</span>
  <span>5.681</span>
  <span>5.686</span>
  <span>5.687</span>
  <span>5.689</span>
  <span>5.692</span>
  <span>5.693</span>
  <span>5.696</span>
  <span>5.698</span>
  <span>5.703</span>
  <span>5.704</span>
  <span>5.705</span>
  <span>5.715</span>
  <span>5.717</span>
  <span>5.719</span>
  <span>5.728</span>
  <span>5.729</span>
  <span>5.730</span>
  <span>5.736</span>
  <span>5.738</span>
  <span>5.739</span>
  <span>5.742</span>
  <span>5.756</span>
  <span>5.759</span>
  <span>5.762</span>
  <span>5.765</span>
  <span>5.772</span>
  <span>5.778</span>
  <span>5.784</span>
  <span>5.807</span>
</div>
