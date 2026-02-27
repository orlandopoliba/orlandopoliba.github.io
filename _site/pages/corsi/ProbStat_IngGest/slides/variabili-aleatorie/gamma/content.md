# Legge Gamma

<div id="gamma-density" class="plot-narrow"></div>

<div class="slider-row">
  <label for="gamma-title-alpha-slider">$\alpha = $</label>
  <input id="gamma-title-alpha-slider" type="range" min="0.5" max="5.0" step="0.1" value="2.0" />
  <span id="gamma-title-alpha-value">$2.0$</span>
</div>

<div class="slider-row">
  <label for="gamma-title-lambda-slider">$\lambda = $</label>
  <input id="gamma-title-lambda-slider" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
  <span id="gamma-title-lambda-value">$1.0$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div id="gamma-definizione"></div>

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge Gamma_ con parametri $\alpha > 0$ e $\lambda > 0$ se ha funzione di densità di probabilità data da
$$
 f(x) = \frac{\lambda^\alpha}{\Gamma(\alpha)} x^{\alpha - 1} e^{-\lambda x} \quad \text{per } x > 0, \qquad f(x) = 0 \quad \text{per } x \leq 0.
$$

</div>

**Notazione.** $X \sim \mathrm{Gamma}(\alpha, \lambda)$.

**Fenomeni modellati.** La legge Gamma descrive tempi di attesa generali e somme di esponenziali. Alcuni esempi:
- tempo totale per il completamento una sequenza di attività indipendenti
- tempi di vita di componenti con tasso di guasto variabile
- modelli di traffico o arrivi con più eventi
- ...

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/gamma-eulero"><i class="fa-solid fa-angle-down"></i><strong>La funzione Gamma di Eulero</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/gamma-definizione"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="gamma-eulero"></div>

**Funzione Gamma di Eulero.** Per ogni $\alpha > 0$ si definisce
$$
\Gamma(\alpha) = \int_0^{+\infty} y^{\alpha - 1} e^{-y}  \mathrm{d} y .
$$

**Proprietà principali.**
- $\Gamma(\alpha) = (\alpha - 1)\Gamma(\alpha - 1)$ per $\alpha > 1$.
- $\Gamma(n) = (n-1)!$ per ogni $n \in \mathbb{N}$, $n \geq 1$.
- $\Gamma(1) = 1$.
- $\Gamma\left(\frac{1}{2}\right) = \sqrt{\pi}$.

---

## Simulazione

<div id="gamma-sim"></div>

<div class="slider-row">
  <label for="gamma-sim-alpha-slider">$\alpha = $</label>
  <input id="gamma-sim-alpha-slider" type="range" min="0.5" max="5.0" step="0.1" value="2.0" />
  <span id="gamma-sim-alpha-value">$2.0$</span>
</div>

<div class="slider-row">
  <label for="gamma-sim-lambda-slider">$\lambda = $</label>
  <input id="gamma-sim-lambda-slider" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
  <span id="gamma-sim-lambda-value">$1.0$</span>
</div>

<div class="button-row">
  <button id="gamma-sample-btn" class="slide-btn">Campiona $X \sim \mathrm{Gamma}(\alpha, \lambda)$</button>
  <button id="gamma-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="gamma-result">Esito: -</div>

<div id="gamma-total">Esperimenti eseguiti: 0</div>

<div id="gamma-hist" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="gamma-bin-slider">Ampiezza bin =</label>
  <input id="gamma-bin-slider" type="range" min="0.05" max="1.00" step="0.05" value="0.25" />
  <span id="gamma-bin-value" class="slider-value">$0.25$</span>
  <label class="toggle">
    <input id="gamma-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densita della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/gamma-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/gamma-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="gamma-istruzioni"></div>

**Istruzioni**:
- Scegliere i parametri $\alpha$ e $\lambda$ con gli slider.
- Campionare la variabile aleatoria $X \sim \mathrm{Gamma}(\alpha, \lambda)$ con il pulsante.
- Osservare i punti dei campioni sull'asse e l'istogramma delle densita delle frequenze relative.
- Modificare l'ampiezza dei bin per cambiare la precisione dell'istogramma.
- Premere il pulsante "Reset" per azzerare i risultati.

---

## Calcolatore di probabilità

<div id="gamma-probability"></div>

<div class="slider-row">
  <label for="gamma-probability-alpha-slider">$\alpha = $</label>
  <input id="gamma-probability-alpha-slider" type="range" min="0.5" max="5.0" step="0.1" value="2.0" />
  <span id="gamma-probability-alpha-value">$2.0$</span>
</div>

<div class="slider-row">
  <label for="gamma-probability-lambda-slider">$\lambda = $</label>
  <input id="gamma-probability-lambda-slider" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
  <span id="gamma-probability-lambda-value">$1.0$</span>
</div>

<div id="gamma-probability-plot" class="plot-narrow"></div>

<div class="range-dual-row">
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="gamma-probability-x1-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.0" />
      <input id="gamma-probability-x2-slider" type="range" min="0.0" max="8.0" step="0.01" value="4.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="gamma-probability-x1-slider">$x_1 = $</label>
      <span id="gamma-probability-x1-value">$1.00$</span>
    </div>
    <div class="range-dual-value">
      <label for="gamma-probability-x2-slider">$x_2 = $</label>
      <span id="gamma-probability-x2-value">$4.00$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <span id="gamma-probability-result">
    $\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \displaystyle \int_{x_1}^{x_2} \frac{\lambda^\alpha}{\Gamma(\alpha)} x^{\alpha - 1} e^{-\lambda x} \, \mathrm{d} x =$
  </span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/gamma-probability-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/gamma-probability"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="gamma-probability-istruzioni"></div>

**Istruzioni**:
- Scegliere i parametri $\alpha$ e $\lambda$ con gli slider.
- Impostare i valori di $x_1$ e $x_2$ con lo slider doppio.
- Osservare l'area colorata e la probabilità calcolata.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="gamma-stats-alpha-slider">$\alpha = $</label>
  <input id="gamma-stats-alpha-slider" type="range" min="0.5" max="5.0" step="0.1" value="2.0" />
  <span id="gamma-stats-alpha-value">$2.0$</span>
</div>

<div class="slider-row">
  <label for="gamma-stats-lambda-slider">$\lambda = $</label>
  <input id="gamma-stats-lambda-slider" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
  <span id="gamma-stats-lambda-value">$1.0$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = \frac{\alpha}{\lambda} = $ <span id="gamma-expected-value">$2.00$</span></div>
  <div class="formula">$\mathrm{Var}(X) = \frac{\alpha}{\lambda^2} = $ <span id="gamma-variance-value">$2.00$</span></div>
</div>

<div id="gamma-plot-2" class="plot-narrow"></div>
