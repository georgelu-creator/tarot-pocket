// Validate the engineered print pattern independently from component lighting.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const browserOptions = require('./browser_options.cjs');

(async () => {
  const source = fs.readFileSync(path.join(__dirname, '../assets/design/card-back.svg'), 'utf8');
  const browser = await chromium.launch(browserOptions);
  try {
    const page = await browser.newPage();
    const result = await page.evaluate(async (svg) => {
      const documentSvg = new DOMParser().parseFromString(svg, 'image/svg+xml');
      const root = documentSvg.documentElement;
      const fail = (condition, message) => { if (!condition) throw new Error(message); };
      fail(!documentSvg.querySelector('parsererror'), 'Invalid SVG');
      fail(root.getAttribute('viewBox') === '0 0 300 500', 'Expected exact 3:5 viewBox');
      const allowed = new Set(['svg', 'defs', 'g', 'rect', 'ellipse', 'circle', 'path', 'use']);
      const colors = new Set();
      for (const element of documentSvg.querySelectorAll('*')) {
        fail(allowed.has(element.localName), `Unexpected SVG element: ${element.localName}`);
        for (const attribute of element.attributes) {
          fail(!/^on/i.test(attribute.name), 'Event handler is not print artwork');
          if (['fill', 'stroke'].includes(attribute.name) && attribute.value !== 'none') {
            fail(['#60465C', '#F6F1E9'].includes(attribute.value), `Unexpected color: ${attribute.value}`);
            colors.add(attribute.value);
          }
          if (attribute.name === 'href') fail(attribute.value === '#celestial-pair', 'External or unknown reference');
          fail(!/url\s*\(/i.test(attribute.value), 'External paint/filter reference');
        }
      }
      fail(colors.size === 2, 'Both exact brand colors must be present');

      // Analytic symmetry: centred circles/ellipses/rectangles are invariant under
      // the half-turn; every other visible mark comes from one shared pair group.
      const direct = [...root.children];
      for (const element of direct) {
        if (element.localName === 'defs' || element.localName === 'use') continue;
        const shapes = element.localName === 'g' ? [...element.children] : [element];
        for (const shape of shapes) {
          const number = (name) => Number(shape.getAttribute(name) || 0);
          if (shape.localName === 'rect') {
            fail(number('x') * 2 + number('width') === 300, 'Rectangle is not horizontally centred');
            fail(number('y') * 2 + number('height') === 500, 'Rectangle is not vertically centred');
          } else {
            fail(['circle', 'ellipse'].includes(shape.localName), 'Unpaired off-centre geometry');
            fail(number('cx') === 150 && number('cy') === 250, 'Orbit/ring centre shifted');
            const transform = shape.getAttribute('transform');
            if (transform) fail(/^rotate\(-?\d+(?:\.\d+)? 150 250\)$/.test(transform), 'Orbit rotation moved off centre');
          }
        }
      }
      const uses = [...root.querySelectorAll(':scope > use')];
      fail(uses.length === 2, 'Every asymmetric mark needs exactly two instances');
      fail(uses[0].getAttribute('href') === '#celestial-pair' && !uses[0].hasAttribute('transform'), 'Missing original half');
      fail(uses[1].getAttribute('href') === '#celestial-pair' && uses[1].getAttribute('transform') === 'rotate(180 150 250)', 'Missing exact half-turn counterpart');

      const image = new Image();
      image.src = 'data:image/svg+xml;base64,' + btoa(svg);
      await image.decode();
      const pixels = [];
      for (const width of [84, 96, 120, 300, 600]) {
        const height = width * 5 / 3;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, width, height);
        const data = context.getImageData(0, 0, width, height).data;
        let sum = 0, maximum = 0, changedPixels = 0, inkPixels = 0;
        let minX = width, minY = height, maxX = 0, maxY = 0;
        for (let pixel = 0; pixel < width * height; pixel++) {
          let difference = 0;
          for (let channel = 0; channel < 3; channel++) {
            const delta = Math.abs(data[pixel * 4 + channel] - data[(width * height - 1 - pixel) * 4 + channel]);
            difference = Math.max(difference, delta);
            sum += delta;
            maximum = Math.max(maximum, delta);
          }
          if (difference > 8) changedPixels++;
          if (data[pixel * 4] > 100) {
            inkPixels++;
            const x = pixel % width, y = Math.floor(pixel / width);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
          fail(data[pixel * 4 + 3] === 255, 'Background is not fully opaque');
        }
        const mean = sum / (width * height * 3);
        const changedRatio = changedPixels / (width * height);
        // Renderer edge antialiasing can differ around rotated cubic paths. An
        // average <1 level out of 255 and <1% pixels beyond 8 levels catches
        // displaced motifs while allowing only tiny edge raster differences.
        fail(mean < 1 && changedRatio < 0.01, `Rendered half-turn mismatch at ${width}px: ${mean}, ${changedRatio}`);
        const inset = Math.min(minX, minY, width - 1 - maxX, height - 1 - maxY);
        fail(inset >= Math.floor(width * 0.06), `Print too close to edge at ${width}px`);
        const center = ((height / 2) * width + width / 2) * 4;
        fail([96, 70, 92, 255].every((value, offset) => data[center + offset] === value), 'Eclipse centre is not blank plum');
        fail(inkPixels > width * height * 0.025, `Print became invisible at ${width}px`);
        pixels.push({ width, height, meanChannelDifference: Number(mean.toFixed(4)), maxChannelDifference: maximum, pixelsBeyond8: changedPixels, totalPixels: width * height, insetPixels: inset });
      }
      return { geometricHalfTurn: true, palette: [...colors], pixels };
    }, source);
    assert.equal(result.geometricHalfTurn, true);
    console.log(JSON.stringify({ status: 'PASS', asset: 'assets/design/card-back.svg', ...result }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
