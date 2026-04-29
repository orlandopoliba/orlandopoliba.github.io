# Probabilità condizionata

### Probabilità

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Teorema della probabilità totale

<div id="total-probability-demo" class="total-probability-demo probability-demo" data-formula-kind="total">
  <div class="total-probability-layout">
    <div class="sample-space-panel">
      <svg class="sample-space-grid" data-role="grid" viewBox="0 0 420 420" role="img" aria-label="Rappresentazione dello spazio campionario con gli eventi A, B e non B"></svg>
      <div class="sample-space-legend">
        <span>I pallini arancioni rappresentano l'evento <em>A</em>.</span>
      </div>
    </div>
    <div class="total-probability-controls">
      <div class="control-block">
        <div class="formula-line" data-role="prob-b-formula"></div>
        <div class="control-slider-row">
          <input data-role="prob-b-slider" type="range" min="1" max="9" step="1" value="5" />
          <span data-role="prob-b-percent" class="slider-value"></span>
        </div>
      </div>
      <div class="control-block">
        <div class="formula-line" data-role="prob-a-given-b-formula"></div>
        <div class="control-slider-row">
          <input data-role="prob-a-given-b-slider" type="range" min="1" max="9" step="1" value="4" />
          <span data-role="prob-a-given-b-percent" class="slider-value"></span>
        </div>
      </div>
      <div class="control-block">
        <div class="formula-line" data-role="prob-a-given-b-complement-formula"></div>
        <div class="control-slider-row">
          <input data-role="prob-a-given-b-complement-slider" type="range" min="1" max="9" step="1" value="7" />
          <span data-role="prob-a-given-b-complement-percent" class="slider-value"></span>
        </div>
      </div>
    </div>
  </div>
  <div class="total-formula-line" data-role="result-formula"></div>
</div>

---

## Teorema di Bayes

<div id="bayes-demo" class="total-probability-demo probability-demo" data-formula-kind="bayes">
  <div class="total-probability-layout">
    <div class="sample-space-panel">
      <svg class="sample-space-grid" data-role="grid" viewBox="0 0 420 420" role="img" aria-label="Rappresentazione dello spazio campionario con gli eventi A, B e non B"></svg>
      <div class="sample-space-legend">
        <span>I pallini arancioni rappresentano l'evento <em>A</em>.</span>
      </div>
    </div>
    <div class="total-probability-controls">
      <div class="control-block">
        <div class="formula-line" data-role="prob-b-formula"></div>
        <div class="control-slider-row">
          <input data-role="prob-b-slider" type="range" min="1" max="9" step="1" value="5" />
          <span data-role="prob-b-percent" class="slider-value"></span>
        </div>
      </div>
      <div class="control-block">
        <div class="formula-line" data-role="prob-a-given-b-formula"></div>
        <div class="control-slider-row">
          <input data-role="prob-a-given-b-slider" type="range" min="1" max="9" step="1" value="4" />
          <span data-role="prob-a-given-b-percent" class="slider-value"></span>
        </div>
      </div>
      <div class="control-block">
        <div class="formula-line" data-role="prob-a-given-b-complement-formula"></div>
        <div class="control-slider-row">
          <input data-role="prob-a-given-b-complement-slider" type="range" min="1" max="9" step="1" value="7" />
          <span data-role="prob-a-given-b-complement-percent" class="slider-value"></span>
        </div>
      </div>
    </div>
  </div>
  <div class="total-formula-line" data-role="result-formula"></div>
</div>
