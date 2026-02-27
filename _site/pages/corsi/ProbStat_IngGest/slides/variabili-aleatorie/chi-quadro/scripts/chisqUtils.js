export const gammaFn = (z) => {
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
  }
  const g = 7;
  let x = p[0];
  const t = z - 1;
  for (let i = 1; i < p.length; i += 1) {
    x += p[i] / (t + i);
  }
  const t2 = t + g + 0.5;
  return Math.sqrt(2 * Math.PI) * (t2 ** (t + 0.5)) * Math.exp(-t2) * x;
};

const logGamma = (z) => Math.log(gammaFn(z));

export const gammaPdf = (alpha, lambda, x) => {
  if (x <= 0 || alpha <= 0 || lambda <= 0) {
    return 0;
  }
  const logDensity = alpha * Math.log(lambda) - logGamma(alpha) + (alpha - 1) * Math.log(x) - lambda * x;
  return Math.exp(logDensity);
};

const lowerGammaSeries = (s, x) => {
  let sum = 1 / s;
  let term = sum;
  for (let n = 1; n < 200; n += 1) {
    term *= x / (s + n);
    sum += term;
    if (term < 1e-12) {
      break;
    }
  }
  return sum * Math.exp(-x + s * Math.log(x));
};

const upperGammaContinuedFraction = (s, x) => {
  let a0 = 1;
  let a1 = x;
  let b0 = 0;
  let b1 = 1;
  let fac = 1;
  let n = 1;
  let gOld = a1 / b1;
  while (n < 200) {
    const an = n - s;
    a0 = (a1 + a0 * an) * fac;
    b0 = (b1 + b0 * an) * fac;
    const anf = n * fac;
    a1 = x * a0 + anf * a1;
    b1 = x * b0 + anf * b1;
    if (a1 !== 0) {
      fac = 1 / a1;
      const g = b1 * fac;
      if (Math.abs((g - gOld) / g) < 1e-12) {
        return g * Math.exp(-x + s * Math.log(x));
      }
      gOld = g;
    }
    n += 1;
  }
  return gOld * Math.exp(-x + s * Math.log(x));
};

export const regularizedGammaP = (s, x) => {
  if (x <= 0) {
    return 0;
  }
  if (x < s + 1) {
    const lower = lowerGammaSeries(s, x);
    return lower / gammaFn(s);
  }
  const upper = upperGammaContinuedFraction(s, x);
  return 1 - upper / gammaFn(s);
};

export const gammaSample = (alpha, lambda) => {
  if (alpha < 1) {
    const u = Math.random();
    return gammaSample(alpha + 1, lambda) * (u ** (1 / alpha));
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x = 0;
    let v = 0;
    do {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      x = z;
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x ** 4)) {
      return (d * v) / lambda;
    }
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return (d * v) / lambda;
    }
  }
};
