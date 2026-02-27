# Legge binomiale

<div id="binomial-bar" class="plot-narrow"></div>

<div class="slider-grid">
  <div class="slider-row slider-row-inline">
    <label for="binomial-title-n-slider">$n = $</label>
    <input id="binomial-title-n-slider" type="range" min="1" max="10" step="1" value="6" />
    <span id="binomial-title-n-value" class="slider-value">$6$</span>
  </div>
  <div class="slider-row slider-row-inline">
    <label for="binomial-title-p-slider">$p = $</label>
    <input id="binomial-title-p-slider" type="range" min="0" max="1" step="0.01" value="0.5" />
    <span id="binomial-title-p-value" class="slider-value">$0.50$</span>
  </div>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione e descrizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge binomiale_ con parametri $n \\in \\mathbb{N}$ e $p \\in [0,1]$ se è identicamente distribuita a $X_1 + X_2 + \\ldots + X_n$ dove $X_i \sim \mathrm{Be}(p)$, con $i = 1, 2, \\ldots, n$, sono indipendenti.
</div>

**Notazione.** $X \sim \mathrm{B}(n, p)$.

**Fenomeni modellati.** La legge binomiale modella il numero di successi in $n$ tentativi indipendenti, ciascuno con probabilità di successo $p$. Alcuni esempi:
- numero di teste in $n$ lanci di moneta
- numero di risposte corrette in un quiz a scelta multipla con $n$ domande
- numero di clienti che effettuano un acquisto in un gruppo di $n$ visitatori
- numero di componenti difettosi in un campione di $n$ pezzi
- ...

---

## Formula della legge binomiale

La funzione di massa di probabilità della legge binomiale è data da
<div class="formula-box">
    <div class="formula">$
    \mathbb{P}(\{X = k\}) = \displaystyle \binom{n}{k} p^k (1 - p)^{n - k}, \quad k = 0, 1, 2, \ldots, n ,
    $</div>
</div>
dove

- $\displaystyle\binom{n}{k} = \frac{n!}{k!(n - k)!}$ è il coefficiente binomiale, che conta il numero di modi in cui si possono scegliere $k$ successi in $n$ prove,
- $p^k$ è la probabilità di ottenere $k$ successi,
- $(1 - p)^{n - k}$ è la probabilità di ottenere $n - k$ insuccessi.

---

## Simulazione (lancio di 4 monete)

<div id="binomial-coins-sim"></div>

<div class="button-row">
  <button id="binomial-coins-btn" class="slide-btn">Lancia 4 monete</button>
  <button id="binomial-coins-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="binomial-coins-result">Esito: -</div>

<div id="binomial-coins-count">Numero di teste: -</div>

<div id="binomial-coins-total">Esperimenti eseguiti: 0</div>

<div id="binomial-coins-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="binomial-coins-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/binomial-coins-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/binomial-coins-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="binomial-coins-istruzioni"></div>

**Istruzioni**:
- Premere il pulsante per lanciare 4 monete. 
- Viene mostrato l'esito dei 4 lanci (testa = 1 e croce = 0) e viene contato il numero di teste nei 4 lanci. 
- Il diagramma a barre delle frequenze relative del numero di teste in 4 lanci si aggiorna automaticamente.
- Tenere premuto per effettuare l'esperimento ripetutamente.
- Osservare come il diagramma a barre si allinea a quello della legge binomiale al crescere del numero di esperimenti.
- Usare il pulsante "Reset" per azzerare i conteggi.

---

## Simulazione (parametri $n$ e $p$)

<div id="binomial-param-sim"></div>

<div class="slider-grid">
  <div class="slider-row slider-row-inline">
    <label for="binomial-n-slider">$n = $</label>
    <input id="binomial-n-slider" type="range" min="1" max="10" step="1" value="4" />
    <span id="binomial-n-value" class="slider-value">$4$</span>
  </div>
  <div class="slider-row slider-row-inline">
    <label for="binomial-p-slider">$p = $</label>
    <input id="binomial-p-slider" type="range" min="0" max="1" step="0.01" value="0.5" />
    <span id="binomial-p-value" class="slider-value">$0.50$</span>
  </div>
</div>

<div class="button-row">
  <button id="binomial-btn" class="slide-btn">Campiona $X \sim \mathrm{B}(n, p)$</button>
  <button id="binomial-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="binomial-result">Esito: -</div>

<div id="binomial-total">Esperimenti eseguiti: 0</div>

<div id="binomial-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="binomial-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/binomial-param-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/binomial-param-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="binomial-param-istruzioni"></div>

**Istruzioni**:
- Scegliere i valori dei parametri $n$ e $p$ tramite gli slider.
- Campionare la variabile aleatoria $X \sim \mathrm{B}(n, p)$ per osservarne gli esiti.
- Il diagramma a barre delle frequenze relative degli esiti si aggiorna automaticamente.
- Tenere premuto il pulsante per effettuare l'esperimento ripetutamente.
- Osservare come il diagramma a barre si allinea a quello della legge binomiale al crescere del numero di esperimenti.
- Usare il pulsante "Reset" per azzerare i conteggi.

---

## Valore atteso e varianza

<div class="slider-grid">
  <div class="slider-row slider-row-inline">
    <label for="binomial-n-slider-2">$n = $</label>
    <input id="binomial-n-slider-2" type="range" min="1" max="10" step="1" value="4" />
    <span id="binomial-n-value-2" class="slider-value">$4$</span>
  </div>
  <div class="slider-row slider-row-inline">
    <label for="binomial-p-slider-2">$p = $</label>
    <input id="binomial-p-slider-2" type="range" min="0" max="1" step="0.01" value="0.5" />
    <span id="binomial-p-value-2" class="slider-value">$0.50$</span>
  </div>
</div>

<div class="formula-box">
    <div class="formula">$\mathbb{E}[X] = np = $ <span id="binomial-expected-value">$5.00$</span></div>
    <div class="formula">$\mathrm{Var}(X) = np(1 - p) = $ <span id="binomial-variance-value">$2.50$</span></div>
</div>

<div id="binomial-plot-2" class="plot-narrow"></div>
