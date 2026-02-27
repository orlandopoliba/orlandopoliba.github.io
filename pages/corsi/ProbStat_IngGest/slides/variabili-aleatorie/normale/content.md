# Legge normale

<div id="normal-density" class="plot-narrow"></div>

<div class="slider-row">
  <label for="normal-title-mu-slider">$\mu = $</label>
  <input id="normal-title-mu-slider" type="range" min="-3.0" max="3.0" step="0.1" value="0.0" />
  <span id="normal-title-mu-value">$0.0$</span>
</div>

<div class="slider-row">
  <label for="normal-title-sigma2-slider">$\sigma^2 = $</label>
  <input id="normal-title-sigma2-slider" type="range" min="0.2" max="4.0" step="0.1" value="1.0" />
  <span id="normal-title-sigma2-value">$1.0$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge normale_ con parametri $\mu \in \mathbb{R}$ e $\sigma^2 > 0$ se ha funzione di densità di probabilità data da
$$
 f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}(\frac{x - \mu}{\sigma})^2} , \quad x \in \mathbb{R}.
$$

</div>

**Notazione.** $X \sim \mathcal{N}(\mu, \sigma^2)$.

**Fenomeni modellati.** La legge normale descrive molte grandezze naturali (e sarà fondamentale nel Teorema del Limite Centrale). Alcuni esempi:
- errori di misura
- altezze o pesi in una popolazione
- rumore in un segnale
- ...

---

## Simulazione

<div id="normal-sim"></div>

<div class="slider-row">
  <label for="normal-sim-mu-slider">$\mu = $</label>
  <input id="normal-sim-mu-slider" type="range" min="-3.0" max="3.0" step="0.1" value="0.0" />
  <span id="normal-sim-mu-value">$0.0$</span>
</div>

<div class="slider-row">
  <label for="normal-sim-sigma2-slider">$\sigma^2 = $</label>
  <input id="normal-sim-sigma2-slider" type="range" min="0.2" max="4.0" step="0.1" value="1.0" />
  <span id="normal-sim-sigma2-value">$1.0$</span>
</div>

<div class="button-row">
  <button id="normal-sample-btn" class="slide-btn">Campiona $X \sim \mathcal{N}(\mu, \sigma^2)$</button>
  <button id="normal-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="normal-result">Esito: -</div>

<div id="normal-total">Esperimenti eseguiti: 0</div>

<div id="normal-hist" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="normal-bin-slider">Ampiezza bin =</label>
  <input id="normal-bin-slider" type="range" min="0.05" max="1.00" step="0.05" value="0.25" />
  <span id="normal-bin-value" class="slider-value">$0.25$</span>
  <label class="toggle">
    <input id="normal-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densita della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/normal-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/normal-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="normal-istruzioni"></div>

**Istruzioni**:
- Scegliere i parametri $\mu$ e $\sigma^2$ con gli slider.
- Campionare la variabile aleatoria $X \sim \mathcal{N}(\mu, \sigma^2)$ con il pulsante.
- Osservare i punti dei campioni sull'asse e l'istogramma delle densità delle frequenze relative.
- Modificare l'ampiezza dei bin per cambiare la precisione dell'istogramma.
- Premere il pulsante "Reset" per azzerare i risultati.

---

## Calcolatore di probabilità

<div id="normal-probability"></div>

<div class="slider-row">
  <label for="normal-probability-mu-slider">$\mu = $</label>
  <input id="normal-probability-mu-slider" type="range" min="-3.0" max="3.0" step="0.1" value="0.0" />
  <span id="normal-probability-mu-value">$0.0$</span>
</div>

<div class="slider-row">
  <label for="normal-probability-sigma2-slider">$\sigma^2 = $</label>
  <input id="normal-probability-sigma2-slider" type="range" min="0.2" max="4.0" step="0.1" value="1.0" />
  <span id="normal-probability-sigma2-value">$1.0$</span>
</div>

<div id="normal-probability-plot" class="plot-narrow"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="normal-probability-x1-slider" type="range" min="-6.0" max="6.0" step="0.01" value="-1.0" />
      <input id="normal-probability-x2-slider" type="range" min="-6.0" max="6.0" step="0.01" value="1.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="normal-probability-x1-slider">$x_1 = $</label>
      <span id="normal-probability-x1-value">$-1.00$</span>
    </div>
    <div class="range-dual-value">
      <label for="normal-probability-x2-slider">$x_2 = $</label>
      <span id="normal-probability-x2-value">$1.00$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <span id="normal-probability-result">
    $\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \displaystyle \frac{1}{\sigma\sqrt{2\pi}}\int_{x_1}^{x_2} e^{-\frac{1}{2}(\frac{x - \mu}{\sigma})^2} \, \mathrm{d} x =$
  </span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/normal-probability-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/normal-probability"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="normal-probability-istruzioni"></div>

**Istruzioni**:
- Scegliere i parametri $\mu$ e $\sigma^2$ con gli slider.
- Impostare i valori di $x_1$ e $x_2$ con lo slider doppio.
- Osservare l'area colorata e la probabilità calcolata.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="normal-stats-mu-slider">$\mu = $</label>
  <input id="normal-stats-mu-slider" type="range" min="-3.0" max="3.0" step="0.1" value="0.0" />
  <span id="normal-stats-mu-value">$0.0$</span>
</div>

<div class="slider-row">
  <label for="normal-stats-sigma2-slider">$\sigma^2 = $</label>
  <input id="normal-stats-sigma2-slider" type="range" min="0.2" max="4.0" step="0.1" value="1.0" />
  <span id="normal-stats-sigma2-value">$1.0$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = \mu = $ <span id="normal-expected-value">$0.00$</span></div>
  <div class="formula">$\mathrm{Var}(X) = \sigma^2 = $ <span id="normal-variance-value">$1.00$</span></div>
</div>

<div id="normal-plot-2" class="plot-narrow"></div>
