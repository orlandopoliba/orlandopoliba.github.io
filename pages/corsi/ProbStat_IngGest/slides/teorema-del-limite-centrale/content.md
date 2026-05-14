# Teorema del Limite Centrale

### Statistica inferenziale

<div class="back-link-row">
  <a class="back-link" href="../">Torna alla pagina principale</a>
</div>

---

## Legge di una media campionaria

<div class="formula-line">
$X \sim U(0,1)$
</div>

<div class="button-row">
  <button id="clt-uniform-sample-btn" class="slide-btn">Estrai campione casuale</button>
  <button id="clt-uniform-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="clt-uniform-sample-grid" class="sample-grid"></div>

<div class="formula-pair-row">
  <div id="clt-uniform-mean-output" class="formula-output formula-output-inline"></div>
  <div id="clt-uniform-standardized-output" class="formula-output formula-output-inline"></div>
</div>

<div id="clt-uniform-histogram" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="clt-uniform-bin-slider">Ampiezza bin =</label>
  <input id="clt-uniform-bin-slider" type="range" min="0.10" max="1.00" step="0.05" value="0.25" />
  <span id="clt-uniform-bin-value" class="slider-value">$0.25$</span>
  <label class="toggle">
    <input id="clt-uniform-density-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densità</span>
</div>

---

## Legge di una media campionaria

<div class="formula-line">
$X \sim \mathrm{Exp}(1)$
</div>

<div class="button-row">
  <button id="clt-exp-sample-btn" class="slide-btn">Estrai campione casuale</button>
  <button id="clt-exp-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="clt-exp-sample-grid" class="sample-grid"></div>

<div class="formula-pair-row">
  <div id="clt-exp-mean-output" class="formula-output formula-output-inline"></div>
  <div id="clt-exp-standardized-output" class="formula-output formula-output-inline"></div>
</div>

<div id="clt-exp-histogram" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="clt-exp-bin-slider">Ampiezza bin =</label>
  <input id="clt-exp-bin-slider" type="range" min="0.10" max="1.00" step="0.05" value="0.25" />
  <span id="clt-exp-bin-value" class="slider-value">$0.25$</span>
  <label class="toggle">
    <input id="clt-exp-density-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densità</span>
</div>
