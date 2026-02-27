# Legge Geometrica

<div id="geometric-bar" class="plot-narrow"></div>

<div class="slider-row">
  <label for="geometric-title-p-slider">$p = $</label>
  <input id="geometric-title-p-slider" type="range" min="0.1" max="1" step="0.01" value="0.50" />
  <span id="geometric-title-p-value">$0.35$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge geometrica_ con parametro $p \in (0,1]$ se ha range $R(X) = \mathbb{N} \setminus \\{0\\} = \\{1, 2, 3, \ldots\\}$ e
$$
\mathbb{P}(\\{X = k\\}) = (1 - p)^{k - 1} p, \quad \text{per } k = 1, 2, \ldots
$$

</div>

**Notazione.** $X \sim \mathrm{Geo}(p)$.

**Fenomeni modellati.** La legge geometrica descrive il primo successo in una sequenza di prove di Bernoulli indipendenti e identicamente distribuite, ciascuna con probabilità di successo $p$.
Alcuni esempi:
- numero di lanci di moneta finché esce la prima testa
- numero di chiamate finché un cliente risponde
- numero di pezzi controllati finché si trova il primo difettoso
- ...

---

## Simulazione (lancio di una moneta)

<div id="geometrica-coin-sim"></div>

<div class="button-row">
  <button id="geometric-coin-btn" class="slide-btn">Lancia moneta</button>
  <button id="geometric-coin-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="geometric-coin-sequence">Sequenza di lanci: -</div>

<div id="geometric-coin-count">Prima testa: -</div>

<div id="geometric-coin-total">Esperimenti eseguiti: 0</div>

<div id="geometric-coin-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="geometric-coin-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/geometrica-coin-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/geometrica-coin-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="geometrica-coin-istruzioni"></div>

**Istruzioni**:
- Premere il pulsante per lanciare una moneta. 
- Viene mostrato l'esito di ogni lancio (1 = testa, 0 = croce).
- Viene aggiornata la sequenza di lanci osservata.
- Quando esce testa, viene mostrato il numero del lancio in cui si ottiene la prima testa e viene aggiornato il diagramma a barre delle frequenze relative del primo lancio con testa. L'esperimento termina e si può ricominciare da capo lanciando di nuovo la moneta.
- Tenere premuto il pulsante per lanciare la moneta ripetutamente.
- Osservare come il diagramma a barre si allinea a quello della legge geometrica al crescere del numero di esperimenti.
- Usare il pulsante "Reset" per azzerare i conteggi.

---

## Simulazione (parametro $p$ scelto)

<div id="geometrica-param-sim"></div>

<div class="slider-row">
  <label for="geometric-p-slider">$p = $</label>
  <input id="geometric-p-slider" type="range" min="0.1" max="1" step="0.01" value="0.5" />
  <span id="geometric-p-value">$0.50$</span>
</div>

<div class="button-row">
  <button id="geometric-btn" class="slide-btn">Campiona $X \sim \mathrm{Geo}(p)$</button>
  <button id="geometric-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="geometric-result">Sequenza di prove: -</div>

<div id="geometric-count">Primo successo: -</div>

<div id="geometric-total">Esperimenti eseguiti: 0</div>

<div id="geometric-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="geometric-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/geometrica-param-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/geometrica-param-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="geometrica-param-istruzioni"></div>

**Istruzioni**:
- Scegliere il valore del parametro $p$ tramite lo slider.
- Campionare la variabile aleatoria $X \sim \mathrm{Geo}(p)$.
- Il diagramma a barre delle frequenze relative del primo successo si aggiorna automaticamente.
- Tenere premuto il pulsante per campionare ripetutamente.
- Osservare come il diagramma a barre si allinea a quello della legge geometrica al crescere del numero di esperimenti.
- Usare il pulsante "Reset" per azzerare i conteggi.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="geometric-p-slider-2">$p = $</label>
  <input id="geometric-p-slider-2" type="range" min="0.1" max="1" step="0.01" value="0.5" />
  <span id="geometric-p-value-2">$0.50$</span>
</div>

<div class="formula-box">
  <div class="formula">$\mathbb{E}[X] = \frac{1}{p} = $ <span id="geometric-expected-value">$2.00$</span></div>
  <div class="formula">$\mathrm{Var}(X) = \frac{1 - p}{p^2} = $ <span id="geometric-variance-value">$2.00$</span></div>
</div>

<div id="geometric-plot-2" class="plot-narrow"></div>
