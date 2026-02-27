# Legge esponenziale

<div id="exponential-density" class="plot-narrow"></div>

<div class="slider-row">
  <label for="exponential-title-lambda-slider">$\lambda = $</label>
  <input id="exponential-title-lambda-slider" type="range" min="0.1" max="3.0" step="0.1" value="1.0" />
  <span id="exponential-title-lambda-value">$1.0$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge esponenziale_ con parametro $\lambda > 0$ se ha funzione di densità
$$
f(x) = \lambda e^{-\lambda x} \quad \text{per } x > 0, \qquad f(x) = 0 \quad \text{per } x \leq 0.
$$

</div>

**Notazione.** $X \sim \mathrm{Exp}(\lambda)$.

**Fenomeni modellati.** La legge esponenziale descrive i tempi di attesa. Alcuni esempi:
- tempo tra due arrivi in un sistema di code
- durata di vita di un componente soggetto a guasti casuali
- tempo di attesa tra telefonate in un centralino
- ...

---

## Simulazione (tempo di attesa)

<div id="exponential-sim"></div>

<div class="slider-row">
  <label for="exponential-lambda-slider">$\lambda = $</label>
  <input id="exponential-lambda-slider" type="range" min="0.1" max="2.0" step="0.1" value="1.0" />
  <span id="exponential-lambda-value">$1.0$</span>
</div>

<div class="button-row">
  <button id="exponential-sample-btn" class="slide-btn">Campiona $X \sim \mathrm{Exp}(\lambda)$</button>
  <button id="exponential-reset-btn" class="slide-btn">Reset</button>
</div>

<div class="toggle-row">
  <span class="toggle-label" id="exponential-mode-real-label">Tempo reale</span>
  <label class="toggle">
    <input id="exponential-mode-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label" id="exponential-mode-sim-label">Tempo simulato</span>
</div>

<div id="exponential-result">Tempo atteso: -</div>

<div id="exponential-total">Esperimenti eseguiti: 0</div>

<div id="exponential-hist" class="plot-narrow"></div>

<div class="toggle-row">
  <label for="exponential-bin-slider">Ampiezza bin =</label>
  <input id="exponential-bin-slider" type="range" min="0.01" max="2.00" step="0.01" value="0.50" />
  <span id="exponential-bin-value" class="slider-value">$0.50$</span>
  <label class="toggle">
    <input id="exponential-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra densità della legge</span>
</div>

<div class="instruction-link-row">
<div class="instruction-link"><a href="#/exponential-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/exponential-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="exponential-istruzioni"></div>

**Istruzioni**:
- Scegliere il valore del parametro $\lambda$ tramite lo slider. 
- Campionare la variabile aleatoria $X \sim \mathrm{Exp}(\lambda)$ utilizzando il pulsante.
- Attendere in secondi in base al tempo che è stato campionato (modalità "Tempo reale").
- Se non si vuole attendere il tempo reale, attivare la modalità "Tempo simulato". Viene mostrato il risultato del tempo atteso. In questa modalità, si può tenere premuto il pulsante per campionare ripetutamente.
- Utilizzare lo slider per modificare l'ampiezza dei bin dell'istogramma.
- Osservare come l'istogramma delle densità delle frequenze relative si allinea alla funzione di densità della legge esponenziale al crescere del numero di campioni.
- Premere il pulsante "Reset" per azzerare i risultati.


---

## Calcolatore di probabilità

<div id="exponential-probability"></div>

<div class="slider-row">
  <label for="exponential-probability-lambda-slider">$\lambda = $</label>
  <input id="exponential-probability-lambda-slider" type="range" min="1" max="2" step="0.1" value="1.0" />
  <span id="exponential-probability-lambda-value">$1.0$</span>
</div>

<div id="exponential-probability-plot" class="plot-narrow"></div>

<div class="range-dual-row">
  
  <div class="range-dual-track">
    <div class="range-dual">
      <input id="exponential-probability-a-slider" type="range" min="0.0" max="8.0" step="0.01" value="1.0" />
      <input id="exponential-probability-b-slider" type="range" min="0.0" max="8.0" step="0.01" value="3.0" />
    </div>
  </div>
  <div class="range-dual-values">
    <div class="range-dual-value">
      <label for="exponential-probability-a-slider">$a = $</label>
      <span id="exponential-probability-a-value">$1.0$</span>
    </div>
    <div class="range-dual-value">
      <label for="exponential-probability-b-slider">$b = $</label>
      <span id="exponential-probability-b-value">$3.0$</span>
    </div>
  </div>
</div>

<div class="formula-box">
  <span id="exponential-probability-result">
    $\displaystyle \mathbb{P}(\{a \leq X \leq b\}) = \displaystyle \int_a^b \lambda e^{-\lambda x} \, \mathrm{d} x =$
  </span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/exponential-probability-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/exponential-probability"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="exponential-probability-istruzioni"></div>

**Istruzioni**:
- Scegliere il valore del parametro $\lambda$ tramite lo slider per modificare la distribuzione.
- Impostare i valori degli estremi dell'intervallo $a$ e $b$ con lo slider doppio.
- Osservare l'area ombreggiata e la probabilità calcolata.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="exponential-lambda-slider-2">$\lambda = $</label>
  <input id="exponential-lambda-slider-2" type="range" min="0.1" max="3.0" step="0.1" value="1.0" />
  <span id="exponential-lambda-value-2">$1.0$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = \frac{1}{\lambda} = $ <span id="exponential-expected-value">$1.00$</span></div>
  <div class="formula">$\mathrm{Var}(X) = \frac{1}{\lambda^2} = $ <span id="exponential-variance-value">$1.00$</span></div>
</div>

<div id="exponential-plot-2" class="plot-narrow"></div>
