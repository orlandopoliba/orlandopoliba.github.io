# Legge di Bernoulli

<div id="bernoulli-bar" class="plot-narrow"></div>

<div class="slider-row">
  <label for="bernoulli-title-p-slider">$p = $</label>
  <input id="bernoulli-title-p-slider" type="range" min="0" max="1" step="0.01" value="0.75" />
  <span id="bernoulli-title-p-value">$0.75$</span>
</div>

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Definizione

<div class="definition-box">

**Definizione.** Una variabile aleatoria $X$ si dice distribuita con _legge di Bernoulli_ con parametro $p \\in [0,1]$ se il suo range è $R(X) = \\{0, 1\\}$ e
$$
\\mathbb{P}(\\{X = 1\\}) = p, \\quad \\mathbb{P}(\\{X = 0\\}) = 1 - p .
$$

</div>

**Notazione.** $X \sim \mathrm{Be}(p)$.

**Fenomeni modellati.** La legge di Bernoulli modella fenomeni che possono avere solo due esiti possibili, spesso indicati come "successo" (1) e "insuccesso" (0). Alcuni Esempi: 
- lancio di una moneta (testa o croce)
- il superamento di un esame (passato o non passato)
- il funzionamento di un componente (funziona o non funziona)
- ...

<span class="attention-label">Attenzione</span>. Il "successo" è da intendersi _latu sensu_, cioè come l'esito che ci interessa osservare, non necessariamente come un esito "positivo" o "desiderabile".

---

## Simulazione (lancio di una moneta)

<div id="bernoulli-coin-sim"></div>

<div class="button-row">
  <button id="coin-btn" class="slide-btn">Lancia moneta</button>
  <button id="coin-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="coin-result">Esito: -</div>

<div id="coin-total">Lanci totali: 0</div>

<div id="coin-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/bernoulli-coin-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/bernoulli-coin-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="bernoulli-coin-istruzioni"></div>

**Istruzioni**:
- Premere il pulsante per lanciare una moneta. 
- Viene mostrato l'esito del lancio (testa = 1 o croce = 0).
- Il diagramma a barre delle frequenze relative si aggiorna automaticamente.
- Tenere premuto il pulsante per lanciare la moneta ripetutamente.
- Osservare come il diagramma a barre si allinea a quello della legge di Bernoulli al crescere del numero di esperimenti.
- Premere "Reset" per azzerare i conteggi.

---

## Simulazione (parametro $p$ scelto)

<div id="bernoulli-param-sim"></div>

<div class="slider-row">
  <label for="bernoulli-p-slider">$p = $</label>
  <input id="bernoulli-p-slider" type="range" min="0" max="1" step="0.01" value="0.5" />
  <span id="bernoulli-p-value">$0.50$</span>
</div>

<div class="button-row">
  <button id="bernoulli-btn" class="slide-btn">Campiona $X \sim \mathrm{Be}(p)$</button>
  <button id="bernoulli-reset-btn" class="slide-btn">Reset</button>
</div>

<div id="bernoulli-result">Esito: -</div>

<div id="bernoulli-total">Prove totali: 0</div>

<div id="bernoulli-plot" class="plot-narrow"></div>

<div class="toggle-row">
  <label class="toggle">
    <input id="bernoulli-theory-toggle" type="checkbox" />
    <span class="toggle-slider"></span>
  </label>
  <span class="toggle-label">Mostra diagramma a barre della legge</span>
</div>

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/bernoulli-param-istruzioni"><i class="fa-solid fa-angle-down"></i><strong>Istruzioni</strong><i class="fa-solid fa-angle-down"></i></a></div>
</div>

--

<div class="instruction-link-row">
  <div class="instruction-link"><a href="#/bernoulli-param-sim"><i class="fa-solid fa-angle-up"></i><strong>Indietro</strong><i class="fa-solid fa-angle-up"></i></a></div>
</div>

<div id="bernoulli-param-istruzioni"></div>

**Istruzioni**:
- Scegliere il valore del parametro $p$ tramite lo slider.
- Campionare la variabile aleatoria $X \sim \mathrm{Be}(p)$ per osservare gli esiti.
- Il diagramma a barre delle frequenze relative si aggiorna automaticamente.
- Tenere premuto il pulsante per campionare ripetutamente.
- Osservare come il diagramma a barre si allinea a quello della legge di Bernoulli al crescere del numero di esperimenti.
- Premere "Reset" per azzerare i conteggi.

---

## Valore atteso e varianza

<div class="slider-row">
  <label for="bernoulli-p-slider-2">$p = $</label>
  <input id="bernoulli-p-slider-2" type="range" min="0" max="1" step="0.01" value="0.5" />
  <span id="bernoulli-p-value-2">$0.50$</span>
</div>

<div class="formula-box">
    <div class="formula">$\mathbb{E}[X] = p = $ <span id="bernoulli-expected-value">$0.50$</span></div>
    <div class="formula">$\mathrm{Var}(X) = p(1 - p) = $ <span id="bernoulli-variance-value">$0.25$</span></div>
</div>


<div id="bernoulli-plot-2" class="plot-narrow"></div>
