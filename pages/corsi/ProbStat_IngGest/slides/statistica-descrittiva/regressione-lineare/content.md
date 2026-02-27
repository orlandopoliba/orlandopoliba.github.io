# Regressione lineare

### Statistica descrittiva

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Regressione

**Domanda:** Che tipo di correlazione hanno i dati rappresentati in questo scatterplot?

<div class="regression-scatter-plot">
  <div class="frequency-chart regression-scatter-chart" data-regression-scatter-chart data-regression-pattern="linear" role="img" aria-label="Scatterplot di dati x e y linearmente correlati"></div>
</div>

<div class="regression-controls" data-regression-controls data-regression-correct-choice="linear">
  <div class="regression-choice-row">
    <button class="regression-choice-btn" type="button" data-regression-choice="linear" aria-pressed="false">Dati correlati linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="non-linear" aria-pressed="false">Dati correlati non linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="none" aria-pressed="false">Dati non correlati</button>
  </div>
  <div class="regression-verify-row">
    <button class="regression-verify-btn" type="button" data-regression-verify>Verifica</button>
  </div>
  <div class="regression-fireworks" data-regression-fireworks aria-hidden="true"></div>
</div>

---

## Regressione

**Domanda:** Che tipo di correlazione hanno i dati rappresentati in questo scatterplot?

<div class="regression-scatter-plot">
  <div class="frequency-chart regression-scatter-chart" data-regression-scatter-chart data-regression-pattern="non-linear" role="img" aria-label="Scatterplot di dati x e y non linearmente correlati"></div>
</div>

<div class="regression-controls" data-regression-controls data-regression-correct-choice="non-linear">
  <div class="regression-choice-row">
    <button class="regression-choice-btn" type="button" data-regression-choice="linear" aria-pressed="false">Dati correlati linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="non-linear" aria-pressed="false">Dati correlati non linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="none" aria-pressed="false">Dati non correlati</button>
  </div>
  <div class="regression-verify-row">
    <button class="regression-verify-btn" type="button" data-regression-verify>Verifica</button>
  </div>
  <div class="regression-fireworks" data-regression-fireworks aria-hidden="true"></div>
</div>

---

## Regressione

**Domanda:** Che tipo di correlazione hanno i dati rappresentati in questo scatterplot?

<div class="regression-scatter-plot">
  <div class="frequency-chart regression-scatter-chart" data-regression-scatter-chart data-regression-pattern="linear-negative" role="img" aria-label="Scatterplot di dati x e y linearmente correlati con correlazione negativa"></div>
</div>

<div class="regression-controls" data-regression-controls data-regression-correct-choice="linear">
  <div class="regression-choice-row">
    <button class="regression-choice-btn" type="button" data-regression-choice="linear" aria-pressed="false">Dati correlati linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="non-linear" aria-pressed="false">Dati correlati non linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="none" aria-pressed="false">Dati non correlati</button>
  </div>
  <div class="regression-verify-row">
    <button class="regression-verify-btn" type="button" data-regression-verify>Verifica</button>
  </div>
  <div class="regression-fireworks" data-regression-fireworks aria-hidden="true"></div>
</div>

---

## Regressione

**Domanda:** Che tipo di correlazione hanno i dati rappresentati in questo scatterplot?

<div class="regression-scatter-plot">
  <div class="frequency-chart regression-scatter-chart" data-regression-scatter-chart data-regression-pattern="exp-log-y" data-regression-y-scale="log" role="img" aria-label="Scatterplot di dati esponenziali con asse y in scala logaritmica"></div>
</div>

<div class="regression-controls" data-regression-controls data-regression-correct-choice="non-linear">
  <div class="regression-choice-row">
    <button class="regression-choice-btn" type="button" data-regression-choice="linear" aria-pressed="false">Dati correlati linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="non-linear" aria-pressed="false">Dati correlati non linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="none" aria-pressed="false">Dati non correlati</button>
  </div>
  <div class="regression-verify-row">
    <button class="regression-verify-btn" type="button" data-regression-verify>Verifica</button>
  </div>
  <div class="regression-fireworks" data-regression-fireworks aria-hidden="true"></div>
</div>

---

## Regressione

**Domanda:** Che tipo di correlazione hanno i dati rappresentati in questo scatterplot?

<div class="regression-scatter-plot">
  <div class="frequency-chart regression-scatter-chart" data-regression-scatter-chart data-regression-pattern="none" role="img" aria-label="Scatterplot di dati x e y non correlati"></div>
</div>

<div class="regression-controls" data-regression-controls data-regression-correct-choice="none">
  <div class="regression-choice-row">
    <button class="regression-choice-btn" type="button" data-regression-choice="linear" aria-pressed="false">Dati correlati linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="non-linear" aria-pressed="false">Dati correlati non linearmente</button>
    <button class="regression-choice-btn" type="button" data-regression-choice="none" aria-pressed="false">Dati non correlati</button>
  </div>
  <div class="regression-verify-row">
    <button class="regression-verify-btn" type="button" data-regression-verify>Verifica</button>
  </div>
  <div class="regression-fireworks" data-regression-fireworks aria-hidden="true"></div>
</div>

---

## Regressione lineare

<div class="regression-fit-formula" data-regression-fit-sse-formula></div>

<div class="regression-fit-plot">
  <div class="frequency-chart regression-fit-chart" data-regression-fit-chart role="img" aria-label="Scatterplot con retta y uguale a a x più b e segmenti verticali dei residui"></div>
</div>

<div class="regression-fit-controls">
  <div class="regression-fit-control">
    <label class="regression-fit-label" for="regression-fit-a-slider">a</label>
    <input id="regression-fit-a-slider" data-regression-fit-a type="range" min="-1.5" max="2.5" step="0.01" value="0.9" />
    <span class="regression-fit-value" data-regression-fit-a-value>0.90</span>
  </div>
  <div class="regression-fit-control">
    <label class="regression-fit-label" for="regression-fit-b-slider">b</label>
    <input id="regression-fit-b-slider" data-regression-fit-b type="range" min="-2" max="8" step="0.01" value="2.2" />
    <span class="regression-fit-value" data-regression-fit-b-value>2.20</span>
  </div>
</div>

---

## Metodo dei minimi quadrati

<div class="least-squares-generate-row">
  <button class="regression-verify-btn" type="button" data-least-squares-generate>Genera nuovi dati</button>
</div>

<div class="least-squares-surface-formula" data-least-squares-surface-formula></div>

<div class="least-squares-surface-plot">
  <div class="frequency-chart least-squares-surface-chart" data-least-squares-surface-chart role="img" aria-label="Superficie tridimensionale della somma dei quadrati degli errori in funzione di a e b"></div>
</div>

---

## Correlazione lineare

<div class="rho-correlation-plot">
  <div class="frequency-chart rho-correlation-chart" data-rho-correlation-chart role="img" aria-label="Scatterplot di dati normali bivariati con correlazione lineare controllata da rho"></div>
</div>

<div class="rho-correlation-controls">
  <label class="rho-correlation-label" for="rho-correlation-slider">\(\rho\)</label>
  <input id="rho-correlation-slider" data-rho-correlation-slider type="range" min="-0.95" max="0.95" step="0.01" value="0.00" />
  <span class="rho-correlation-value" data-rho-correlation-value>0.00</span>
</div>
