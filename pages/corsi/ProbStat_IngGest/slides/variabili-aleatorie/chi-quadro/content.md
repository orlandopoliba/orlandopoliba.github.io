# Legge chi-quadro

<div id="chisq-density" class="plot-narrow"></div>

<div class="slider-row">
  <label for="chisq-title-n-slider">$n = $</label>
  <input id="chisq-title-n-slider" type="range" min="1" max="10" step="1" value="4" />
  <span id="chisq-title-n-value">$4$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge chi-quadro_ con $n$ gradi di libertà se $X \sim \mathrm{Gamma}\left(\frac{n}{2}, \frac{1}{2}\right)$, cioè se ha funzione di densità di probabilità data da
$$
 f(x) = \frac{1}{2^\frac{n}{2} \Gamma\left(\frac{n}{2}\right)} x^{\frac{n}{2} - 1} e^{-\frac{x}{2}} \quad \text{per } x > 0, \qquad f(x) = 0 \quad \text{per } x \leq 0.
$$

</div>

**Notazione.** $X \sim \chi^2(n)$.

**Fenomeni modellati.** La legge chi-quadro compare in statistica e nei test di ipotesi. Alcuni esempi:
- somma di quadrati di variabili normali standard
- statistiche di test per la varianza
- ...

---

## Simulazione

<div id="chisq-sim"></div>

<div class="slider-row">
  <label for="chisq-sim-n-slider">$n = $</label>
  <input id="chisq-sim-n-slider" type="range" min="1" max="10" step="1" value="4" />
  <span id="chisq-sim-n-value">$4$</span>
</div>

<div class="button-row">
  <button id="chisq-sample-btn" class="slide-btn">Campiona $X \sim \chi^2(n)$</button>
  <button id="chisq-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="chisq-result">Esito: -</div>

<div id="chisq-total">Esperimenti eseguiti: 0</div>

<div id="chisq-hist" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="chisq-bin-slider">Ampiezza bin =</label>
  <input id="chisq-bin-slider" type="range" min="0.1" max="2.0" step="0.1" value="0.5" />
  <span id="chisq-bin-value" class="slider-value">$0.50$</span>
  <label class="toggle">
    <input id="chisq-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densita della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/chisq-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/chisq-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="chisq-istruzioni"></div>

**Istruzioni**:
- Scegliere i gradi di libertà $n$ con lo slider.
- Campionare la variabile aleatoria $X \sim \chi^2(n)$ con il pulsante.
- Osservare i punti dei campioni sull'asse e l'istogramma delle densità delle frequenze relative.
- Modificare l'ampiezza dei bin per cambiare la precisione dell'istogramma.
- Premere il pulsante "Reset" per azzerare i risultati.

---

## Calcolatore di probabilita

<div id="chisq-probability"></div>

<div class="slider-row">
  <label for="chisq-probability-n-slider">$n = $</label>
  <input id="chisq-probability-n-slider" type="range" min="1" max="10" step="1" value="4" />
  <span id="chisq-probability-n-value">$4$</span>
</div>

<div id="chisq-probability-plot" class="plot-narrow"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="chisq-probability-x1-slider" type="range" min="0.0" max="20.0" step="0.05" value="2.0" />
      <input id="chisq-probability-x2-slider" type="range" min="0.0" max="20.0" step="0.05" value="8.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="chisq-probability-x1-slider">$x_1 = $</label>
      <span id="chisq-probability-x1-value">$2.00$</span>
    </div>
    <div class="range-dual-value">
      <label for="chisq-probability-x2-slider">$x_2 = $</label>
      <span id="chisq-probability-x2-value">$8.00$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <span id="chisq-probability-result">
    $\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \displaystyle \int_{x_1}^{x_2} \frac{1}{2^\frac{n}{2}\Gamma(\frac{n}{2})} x^{\frac{n}{2} - 1} e^{-\frac{x}{2}} \, \mathrm{d} x =$
  </span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/chisq-probability-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/chisq-probability"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="chisq-probability-istruzioni"></div>

**Istruzioni**:
- Scegliere i gradi di libertà $n$ con lo slider.
- Impostare i valori di $x_1$ e $x_2$ con lo slider doppio.
- Osservare l'area colorata e la probabilità calcolata.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="chisq-stats-n-slider">$n = $</label>
  <input id="chisq-stats-n-slider" type="range" min="1" max="10" step="1" value="4" />
  <span id="chisq-stats-n-value">$4$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = n = $ <span id="chisq-expected-value">$4$</span></div>
  <div class="formula">$\mathrm{Var}(X) = 2n = $ <span id="chisq-variance-value">$8$</span></div>
</div>

<div id="chisq-plot-2" class="plot-narrow"></div>
