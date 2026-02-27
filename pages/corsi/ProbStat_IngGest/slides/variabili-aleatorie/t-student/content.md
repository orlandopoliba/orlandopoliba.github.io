# Legge t-Student

<div id="tstudent-density" class="plot-narrow"></div>

<div class="slider-row">
  <label for="tstudent-title-n-slider">$n = $</label>
  <input id="tstudent-title-n-slider" type="range" min="1" max="20" step="1" value="5" />
  <span id="tstudent-title-n-value">$5$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $T_n$ si dice distribuita con _legge t-Student_ con $n$ gradi di libertà se ha densità
$$
 f_{T_n}(t) = \frac{\Gamma\left(\frac{n+1}{2}\right)}{\sqrt{n\pi} \Gamma\left(\frac{n}{2}\right)} \left(1 + \frac{t^2}{n}\right)^{-\frac{n+1}{2}}, \quad t \in \mathbb{R}.
$$

</div>

**Notazione.** $T_n \sim t(n)$.

**Fenomeni modellati.** La legge t-Student ha una forma a campana simile alla normale, ma con code più pesanti. Compare in statistica quando la varianza della popolazione non è nota. Alcuni esempi:
- test di ipotesi sulla media con varianza ignota
- intervalli di confidenza per la media
- ...

---

## Simulazione

<div id="tstudent-sim"></div>

<div class="slider-row">
  <label for="tstudent-sim-n-slider">$n = $</label>
  <input id="tstudent-sim-n-slider" type="range" min="1" max="20" step="1" value="5" />
  <span id="tstudent-sim-n-value">$5$</span>
</div>

<div class="button-row">
  <button id="tstudent-sample-btn" class="slide-btn">Campiona $T_n \sim t(n)$</button>
  <button id="tstudent-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="tstudent-result">Esito: -</div>

<div id="tstudent-total">Esperimenti eseguiti: 0</div>

<div id="tstudent-hist" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="tstudent-bin-slider">Ampiezza bin =</label>
  <input id="tstudent-bin-slider" type="range" min="0.05" max="1.00" step="0.05" value="0.25" />
  <span id="tstudent-bin-value" class="slider-value">$0.25$</span>
  <label class="toggle">
    <input id="tstudent-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densita della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/tstudent-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/tstudent-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="tstudent-istruzioni"></div>

**Istruzioni**:
- Scegliere i gradi di libertà $n$ con lo slider.
- Campionare la variabile aleatoria $T_n \sim t(n)$ con il pulsante.
- Osservare i punti dei campioni sull'asse e l'istogramma delle densità delle frequenze relative.
- Modificare l'ampiezza dei bin per cambiare la precisione dell'istogramma.
- Premere il pulsante "Reset" per azzerare i risultati.

---

## Calcolatore di probabilità

<div id="tstudent-probability"></div>

<div class="slider-row">
  <label for="tstudent-probability-n-slider">$n = $</label>
  <input id="tstudent-probability-n-slider" type="range" min="1" max="20" step="1" value="5" />
  <span id="tstudent-probability-n-value">$5$</span>
</div>

<div id="tstudent-probability-plot" class="plot-narrow"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="tstudent-probability-x1-slider" type="range" min="-6.0" max="6.0" step="0.01" value="-1.0" />
      <input id="tstudent-probability-x2-slider" type="range" min="-6.0" max="6.0" step="0.01" value="1.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="tstudent-probability-x1-slider">$x_1 = $</label>
      <span id="tstudent-probability-x1-value">$-1.00$</span>
    </div>
    <div class="range-dual-value">
      <label for="tstudent-probability-x2-slider">$x_2 = $</label>
      <span id="tstudent-probability-x2-value">$1.00$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <span id="tstudent-probability-result">
    $\displaystyle \mathbb{P}(\{x_1 \leq T_n \leq x_2\}) = \displaystyle \int_{x_1}^{x_2} f_{T_n}(t) \, \mathrm{d} t =$
  </span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/tstudent-probability-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/tstudent-probability"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="tstudent-probability-istruzioni"></div>

**Istruzioni**:
- Scegliere i gradi di libertà $n$ con lo slider.
- Impostare i valori di $x_1$ e $x_2$ con lo slider doppio.
- Osservare l'area colorata e la probabilità calcolata.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="tstudent-stats-n-slider">$n = $</label>
  <input id="tstudent-stats-n-slider" type="range" min="1" max="20" step="1" value="5" />
  <span id="tstudent-stats-n-value">$5$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[T_n] = 0 \ (n > 1) = $ <span id="tstudent-expected-value">$0.00$</span></div>
  <div class="formula">$\mathrm{Var}(T_n) = \frac{n}{n-2} \ (n > 2) = $ <span id="tstudent-variance-value">$1.67$</span></div>
</div>

<div id="tstudent-plot-2" class="plot-narrow"></div>
