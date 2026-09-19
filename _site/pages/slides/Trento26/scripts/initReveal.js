(function () {
  function isLeafSlide(section) {
    return !Array.from(section.children).some((child) => child.tagName === 'SECTION');
  }

  function isVerticalSlide(section) {
    return (
      section.parentElement &&
      section.parentElement.tagName === 'SECTION' &&
      section.parentElement.parentElement &&
      section.parentElement.parentElement.classList.contains('slides')
    );
  }

  function removeWhitespaceTextNodes(section) {
    Array.from(section.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
        node.remove();
      }
    });
  }

  function structureSlide(section) {
    if (!isLeafSlide(section) || section.dataset.structured === 'true') return;

    section.dataset.structured = 'true';
    section.classList.add('deck-slide');
    if (isVerticalSlide(section)) section.classList.add('vertical');

    const displayMathLength = Array.from(section.querySelectorAll('.math-display'))
      .reduce((length, node) => length + node.textContent.length, 0);
    if (displayMathLength > 900) section.classList.add('dense-math');
    if (section.querySelector('#dispersionCanvas')) section.classList.add('dispersion-slide');
    if (section.querySelector('#holderFrequencyCanvas')) section.classList.add('holder-frequency-slide');

    if (section.classList.contains('title-slide')) return;

    removeWhitespaceTextNodes(section);
    const title = Array.from(section.children).find((child) => child.tagName === 'H2');
    if (!title) return;
    if (title.textContent.trim() === 'Main steps') section.classList.add('proof-steps-slide');

    const header = document.createElement('header');
    header.className = 'slide-header';
    header.appendChild(title);

    if (title.textContent.trim() === 'Besov norm blow-up (sketch of proof)') {
      section.classList.add('besov-proof-slide');
    }

    const body = document.createElement('main');
    body.className = 'slide-body';
    Array.from(section.childNodes).forEach((node) => body.appendChild(node));

    section.appendChild(header);
    section.appendChild(body);
  }

  function structureSlides() {
    const slides = document.querySelectorAll('.reveal .slides section');
    slides.forEach(structureSlide);
  }

  function protectMath(markdown) {
    const displayBlocks = [];
    const protectedDisplays = markdown.replace(
      /(^|\n)\$\$\s*\n([\s\S]*?)\n\$\$(?=\n|$)/g,
      (match, prefix, math) => {
        const token = `@@SLIDE_MATH_DISPLAY_${displayBlocks.length}@@`;
        displayBlocks.push(`<div class="math-display">\n\\[\n${math}\n\\]\n</div>`);
        return `${prefix}${token}`;
      }
    );

    const protectedInline = protectedDisplays.replace(
      /(^|[^\\$])\$([^\n$]+?)\$/g,
      (match, prefix, math) => `${prefix}<span class="math-inline">$${math}$</span>`
    );

    return displayBlocks.reduce(
      (source, block, index) => source.replace(`@@SLIDE_MATH_DISPLAY_${index}@@`, block),
      protectedInline
    );
  }

  const deckReady = Reveal.initialize({
    plugins: [
      RevealMarkdown,
      RevealMath.KaTeX,
    ],
    transition: 'none',
    hash: true,
    controls: true,
    fragments: true,
    markdown: {
      smartypants: false,
      hooks: {
        preprocess: protectMath,
        postprocess(html) {
          return html;
        },
      },
    },
    katex: {
      strict: false,
      throwOnError: false,
    },
  }).then(async () => {
    structureSlides();
    Reveal.layout();

    // Wait until Reveal, fonts, and CSS have completed layout before plots
    // measure their containers. Otherwise canvases can be sized using a
    // transient width and appear stretched on the initial load.
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    Reveal.layout();

    // Keep one broken/optional plot from preventing all following plots from
    // being initialized.  This is especially useful while navigating slides
    // whose controls are not present in every deck variant.
    const setup = (name, fn) => {
      try {
        fn();
      } catch (error) {
        console.error(`Unable to initialize ${name}.`, error);
      }
    };
    setup('lattice plot', setupLatticePlot);
    setup('vortex plot', setupVortexPlot);
    setup('limit plot', setupLimitPlot);
    setup('puncturing plot', setupPuncturingPlot);
    setup('compactness vortices plot', setupCompactnessVorticesPlot);
    setup('liminf vortices plot', setupLiminfVorticesPlot);
    setup('not-subadditive plot', setupNotSubadditivePlot);
    setup('singularity plot', setupSingularityPlot);
    setup('3D singularity plot', setupSingularity3dPlot);
    setup('structure theorem plot', setupStructureTheoremPlot);
    setup('piecewise graph plot', setupPiecewiseGraphPlot);
    setup('constrained lattice plot', setupLatticeWithConstraintsPlot);
    setup('Ising simulation', setupMHIsingPlot);
    setup('XY simulation', setupMHXYPlot);
    setup('no-interfaces plot', setupNoInterfacesPlot);
    setup('transition angle control', setupTransitionAngleControl);
    setup('N-clock plot', setupNClockPlot);
    setup('N-epsilon plot', setupNepsPlot);
    setup('SN plot', setupSNPlot);
    setup('N-fixed proof plot', setupNFixedProofPlot);
    setup('N-fixed sinus plot', setupNFixedSinusPlot);
    setup('Ising interface plot', setupIsingInterfacePlot);
    setup('ball construction plot', setupBallConstructionPlot);
    setup('limsup plot', setupLimsupPlot);
    setup('dyadic plot', setupDyadicPlot);
    window.dispatchEvent(new CustomEvent('slidecontentready'));
  });

  window.SlideDeck = {
    ready: deckReady,
    onReady(callback) {
      deckReady.then(callback).catch((error) => {
        console.error('Unable to initialize the slide deck.', error);
      });
    },
  };
})();
