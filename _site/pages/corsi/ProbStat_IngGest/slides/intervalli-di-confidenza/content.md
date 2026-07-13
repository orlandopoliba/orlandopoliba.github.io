# Intervalli di confidenza

### Statistica inferenziale

<div class="back-link-row">
  <a class="back-link" href="../">Torna alla pagina principale</a>
</div>

---

## Significato di confidenza

<div class="formula-line">
$X \sim \mathcal{N}(\mu,1)$
</div>

<div class="button-row">
  <button id="confidence-sample-btn" class="slide-btn">Estrai campione casuale</button>
  <button id="confidence-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="confidence-sample-output" class="sample-output"></div>

<div class="interval-row">
  <div id="confidence-interval-output" class="formula-output interval-output"></div>
  <div id="confidence-interval-status" class="interval-status" aria-live="polite"></div>
</div>

<div id="confidence-interval-details" class="formula-output formula-output-compact"></div>

<div class="slider-row">
  <label for="confidence-beta-slider">$\beta = $</label>
  <input id="confidence-beta-slider" type="range" min="0.80" max="0.99" step="0.01" value="0.95" />
  <span id="confidence-beta-value" class="slider-value">$0.95$</span>
</div>

<div id="confidence-success-rate" class="formula-output formula-output-compact"></div>

--

<div class="formula-line">
$\mu = 10$
</div>
