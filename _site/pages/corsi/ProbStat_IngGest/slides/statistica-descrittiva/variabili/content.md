# Tipi di variabili

### Statistica descrittiva

<div class="back-link-row">
  <a class="back-link" href="../../">Torna alla pagina principale</a>
</div>

---

## Classifica le variabili

**Istruzioni.** Trascina ogni variabile nella categoria corretta e premi "Verifica".

<div id="variable-classifier" class="variable-classifier">
  <div class="classifier-grid">
    <div class="drop-zone drop-target" data-category="discreta">
      <h4>Quantitativa discreta</h4>
      <div class="drop-list"></div>
    </div>
    <div class="drop-zone drop-target" data-category="continua">
      <h4>Quantitativa continua</h4>
      <div class="drop-list"></div>
    </div>
    <div class="drop-zone drop-target" data-category="qualitativa">
      <h4>Qualitativa</h4>
      <div class="drop-list"></div>
    </div>
    <div class="classifier-pool drop-target" data-category="pool">
      <h4>Variabili</h4>
      <div id="variable-list" class="variable-list">
        <div class="variable-item" data-item-id="voto" data-category="discreta" draggable="true" tabindex="0">Voto d'esame</div>
        <div class="variable-item" data-item-id="gasolio" data-category="continua" draggable="true" tabindex="0">Prezzo del gasolio</div>
        <div class="variable-item" data-item-id="social" data-category="qualitativa" draggable="true" tabindex="0">Social network</div>
        <div class="variable-item" data-item-id="sangue" data-category="qualitativa" draggable="true" tabindex="0">Gruppo sanguigno</div>
        <div class="variable-item" data-item-id="telefonate" data-category="discreta" draggable="true" tabindex="0">Numero di telefonate in un'ora</div>
        <div class="variable-item" data-item-id="tempo" data-category="continua" draggable="true" tabindex="0">Durata di una telefonata</div>
        <div class="variable-item" data-item-id="provincia" data-category="qualitativa" draggable="true" tabindex="0">Provincia di residenza</div>
        <div class="variable-item" data-item-id="consumo" data-category="continua" draggable="true" tabindex="0">Consumo energetico mensile</div>
      </div>
    </div>
  </div>

  <div class="button-row">
    <button id="classifier-check" class="slide-btn">Verifica</button>
    <button id="classifier-reset" class="slide-btn">Reset</button>
  </div>

  <div id="classifier-feedback" class="classifier-feedback"></div>
  <div id="fireworks" class="fireworks" aria-hidden="true"></div>
</div>
