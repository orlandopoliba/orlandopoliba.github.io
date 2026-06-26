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
  }).then(() => {
    structureSlides();
    Reveal.layout();
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
