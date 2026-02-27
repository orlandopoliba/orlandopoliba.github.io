# Legge uniforme

<div id="uniform-density" class="plot-narrow"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="uniform-title-a-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.0" />
      <input id="uniform-title-b-slider" type="range" min="0.0" max="8.0" step="0.01" value="4.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="uniform-title-a-slider">$a = $</label>
      <span id="uniform-title-a-value">$1.0$</span>
    </div>
    <div class="range-dual-value">
      <label for="uniform-title-b-slider">$b = $</label>
      <span id="uniform-title-b-value">$4.0$</span>
    </div>
  </div>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge uniforme_ su $[a,b]$ con $a < b$ se ha funzione di densità di probabilità data da
$$
 f(x) = \frac{1}{b-a} \quad \text{per } x \in [a,b], \qquad f(x) = 0 \quad \text{per } x \notin [a,b].
$$

</div>

**Notazione.** $X \sim \mathrm{U}(a,b)$.

**Fenomeni modellati.** La legge uniforme descrive situazioni in cui tutti i sottointervalli di uguale lunghezza in un intervallo sono equiprobabili. Alcuni esempi:
- istante di arrivo casuale in un intervallo di tempo
- posizione casuale lungo un segmento
- errore di misura uniforme tra due estremi
- ...

---

## Simulazione

<div id="uniform-sim"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="uniform-sim-a-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.0" />
      <input id="uniform-sim-b-slider" type="range" min="0.0" max="8.0" step="0.01" value="4.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="uniform-sim-a-slider">$a = $</label>
      <span id="uniform-sim-a-value">$1.0$</span>
    </div>
    <div class="range-dual-value">
      <label for="uniform-sim-b-slider">$b = $</label>
      <span id="uniform-sim-b-value">$4.0$</span>
    </div>
  </div>
</div>

<div class="button-row">
  <button id="uniform-sample-btn" class="slide-btn">Campiona $X \sim \mathrm{U}(a,b)$</button>
  <button id="uniform-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="uniform-result">Esito: -</div>

<div id="uniform-total">Esperimenti eseguiti: 0</div>

<div id="uniform-hist" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="uniform-bin-slider">Ampiezza bin =</label>
  <input id="uniform-bin-slider" type="range" min="0.01" max="2.00" step="0.01" value="0.50" />
  <span id="uniform-bin-value" class="slider-value">$0.50$</span>
  <label class="toggle">
    <input id="uniform-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densita della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/uniform-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/uniform-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="uniform-istruzioni"></div>

**Istruzioni**:
- Scegliere gli estremi $a$ e $b$ della distribuzione con lo slider doppio.
- Campionare la variabile aleatoria $X \sim \mathrm{U}(a,b)$ con il pulsante.
- Osservare i punti dei campioni sull'asse e l'istogramma delle densità delle frequenze relative.
- Modificare l'ampiezza dei bin per cambiare la precisione dell'istogramma.
- Premere il pulsante "Reset" per azzerare i risultati.

---

## Calcolatore di probabilità

<div id="uniform-probability"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="uniform-probability-a-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.0" />
      <input id="uniform-probability-b-slider" type="range" min="0.0" max="8.0" step="0.01" value="4.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="uniform-probability-a-slider">$a = $</label>
      <span id="uniform-probability-a-value">$1.0$</span>
    </div>
    <div class="range-dual-value">
      <label for="uniform-probability-b-slider">$b = $</label>
      <span id="uniform-probability-b-value">$4.0$</span>
    </div>
  </div>
</div>

<div id="uniform-probability-plot" class="plot-narrow"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="uniform-probability-x1-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.5" />
      <input id="uniform-probability-x2-slider" type="range" min="0.0" max="8.0" step="0.01" value="3.5" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="uniform-probability-x1-slider">$x_1 = $</label>
      <span id="uniform-probability-x1-value">$1.50$</span>
    </div>
    <div class="range-dual-value">
      <label for="uniform-probability-x2-slider">$x_2 = $</label>
      <span id="uniform-probability-x2-value">$3.50$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <span id="uniform-probability-result">
    $\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \displaystyle \int_{x_1}^{x_2} f(x) \, \mathrm{d} x =$
  </span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/uniform-probability-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/uniform-probability"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="uniform-probability-istruzioni"></div>

**Istruzioni**:
- Scegliere gli estremi $a$ e $b$ della distribuzione con lo slider doppio.
- Impostare i valori di $x_1$ e $x_2$ con lo slider doppio (anche fuori da $[a,b]$).
- Osservare l'area colorata e la probabilità calcolata.

---

## Valore atteso e varianza

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="uniform-stats-a-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.0" />
      <input id="uniform-stats-b-slider" type="range" min="0.0" max="8.0" step="0.01" value="4.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="uniform-stats-a-slider">$a = $</label>
      <span id="uniform-stats-a-value">$1.00$</span>
    </div>
    <div class="range-dual-value">
      <label for="uniform-stats-b-slider">$b = $</label>
      <span id="uniform-stats-b-value">$4.00$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = \frac{a + b}{2} = $ <span id="uniform-expected-value">$2.50$</span></div>
  <div class="formula">$\mathrm{Var}(X) = \frac{(b - a)^2}{12} = $ <span id="uniform-variance-value">$0.75$</span></div>
</div>

<div id="uniform-plot-2" class="plot-narrow"></div>
