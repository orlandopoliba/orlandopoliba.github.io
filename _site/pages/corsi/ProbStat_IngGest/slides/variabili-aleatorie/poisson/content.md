# Legge di Poisson

<div id="poisson-bar" class="plot-narrow"></div>

<div class="slider-row">
  <label for="poisson-title-lambda-slider">$\lambda = $</label>
  <input id="poisson-title-lambda-slider" type="range" min="0.1" max="9.9" step="0.1" value="3" />
  <span id="poisson-title-lambda-value">$3.0$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge di Poisson_ con parametro $\lambda > 0$ se il suo range è $R(X) = \mathbb{N} = \\{0, 1, 2, \ldots\\}$ e
$$
\mathbb{P}(\\{X = k\\}) = e^{-\lambda} \frac{\lambda^k}{k!}, \quad \text{per }k = 0, 1, 2, \ldots
$$

</div>

**Notazione.** $X \sim \mathrm{P}(\lambda)$.

**Fenomeni modellati.** La legge di Poisson modella il numero di eventi rari in un intervallo di tempo o spazio. Alcuni esempi:
- numero di chiamate in un centralino in un'ora
- numero di difetti in un metro di cavo
- numero di errori tipografici per pagina
- ...

---

## Serie di Taylor dell'esponenziale

<div class="slider-row">
  <label for="poisson-taylor-order-slider">Ordine</label>
  <input id="poisson-taylor-order-slider" type="range" min="0" max="5" step="1" value="2" />
  <span id="poisson-taylor-order-value" class="slider-value">$2$</span>
</div>

<div id="poisson-taylor-plot" class="plot-narrow"></div>

<div id="poisson-taylor-formula" class="formula-card formula-card-wide"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="poisson-taylor-error-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra errore</span>
</div>

---

## Limite di una binomiale

<div id="poisson-limit-sim"></div>

<div class="slider-row">
  <label for="poisson-limit-lambda-slider">$\lambda = $</label>
  <input id="poisson-limit-lambda-slider" type="range" min="0.5" max="9.9" step="0.1" value="3" />
  <span id="poisson-limit-lambda-value">$3.0$</span>
</div>

<div class="slider-grid">
  <div class="slider-row slider-row-inline">
    <label for="poisson-limit-n-slider">$n = $</label>
    <input id="poisson-limit-n-slider" type="range" min="10" max="100" step="1" value="10" />
    <span id="poisson-limit-n-value" class="slider-value">$10$</span>
  </div>
  <div class="slider-row slider-row-inline">
    <label for="poisson-limit-p-slider">$p = $</label>
    <input id="poisson-limit-p-slider" type="range" min="0.001" max="1.0" step="0.001" value="0.300" disabled />
    <span id="poisson-limit-p-value" class="slider-value">$0.30$</span>
  </div>
</div>

<div id="poisson-limit-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="poisson-limit-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge di Poisson</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/poisson-limit-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/poisson-limit-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="poisson-limit-istruzioni"></div>

**Istruzioni**:
- Scegliere il valore di $\lambda$ e $n$ con gli slider. 
- Il valore di $p$ viene calcolato automaticamente come $p = \frac{\lambda}{n}$. 
- Osservare come il diagramma a barre della legge binomiale si allinea a quello della legge di Poisson al crescere di $n$.

---

## Simulazione

<div id="poisson-sim"></div>

<div class="slider-row">
  <label for="poisson-lambda-slider">$\lambda = $</label>
  <input id="poisson-lambda-slider" type="range" min="0.5" max="9.9" step="0.1" value="3" />
  <span id="poisson-lambda-value">$3.0$</span>
</div>

<div class="button-row">
  <button id="poisson-btn" class="slide-btn">Campiona $X \sim \mathrm{P}(\lambda)$</button>
  <button id="poisson-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="poisson-result">Esito: -</div>

<div id="poisson-total">Esperimenti eseguiti: 0</div>

<div id="poisson-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="poisson-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/poisson-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/poisson-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="poisson-istruzioni"></div>

**Istruzioni**:
- Scegliere il valore del parametro $\lambda$ tramite lo slider.
- Campionare la variabile aleatoria $X \sim \mathrm{P}(\lambda)$ per osservarne gli esiti.
- Il diagramma a barre delle frequenze relative viene aggiornato automaticamente.
- Tenere premuto il bottone per campionare ripetutamente.
- Osservare come il diagramma a barre delle frequenze relative si avvicina a quello della legge di Poisson al crescere del numero di esperimenti.
- Utilizzare il pulsante "Reset" per azzerare il conteggio degli esperimenti.

---

## Somma di leggi di Poisson

<div class="slider-grid">
  <div class="slider-row slider-row-inline">
    <label for="poisson-sum-lambda-1-slider">$\lambda_1 = $</label>
    <input id="poisson-sum-lambda-1-slider" type="range" min="0.5" max="9.9" step="0.1" value="3.0" />
    <span id="poisson-sum-lambda-1-value" class="slider-value">$3.0$</span>
  </div>
  <div class="slider-row slider-row-inline">
    <label for="poisson-sum-lambda-2-slider">$\lambda_2 = $</label>
    <input id="poisson-sum-lambda-2-slider" type="range" min="0.5" max="9.9" step="0.1" value="2.0" />
    <span id="poisson-sum-lambda-2-value" class="slider-value">$2.0$</span>
  </div>
</div>

<div class="button-row">
  <button id="poisson-sum-btn" class="slide-btn">Campiona $X_1 + X_2$</button>
  <button id="poisson-sum-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="poisson-sum-x1" class="simulation-value-line">$X_1 = -$</div>

<div id="poisson-sum-x2" class="simulation-value-line">$X_2 = -$</div>

<div id="poisson-sum-result" class="simulation-value-line">$X_1 + X_2 = -$</div>

<div id="poisson-sum-total">Esperimenti eseguiti: 0</div>

<div id="poisson-sum-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="poisson-sum-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra $\mathrm{P}(\lambda_1 + \lambda_2)$</span>
</div>

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="poisson-lambda-slider-2">$\lambda = $</label>
  <input id="poisson-lambda-slider-2" type="range" min="0.5" max="10" step="0.1" value="3" />
  <span id="poisson-lambda-value-2">$3.0$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = \lambda = $ <span id="poisson-expected-value">$3.0$</span></div>
  <div class="formula">$\mathrm{Var}(X) = \lambda = $ <span id="poisson-variance-value">$3.0$</span></div>
</div>

<div id="poisson-plot-2" class="plot-narrow"></div>
