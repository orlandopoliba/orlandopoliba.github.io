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

const betacf = (a, b, x) => {
  const maxIter = 200;
  const eps = 3e-7;
  const fpmin = 1e-30;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) {
    d = fpmin;
  }
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIter; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) {
      d = fpmin;
    }
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) {
      c = fpmin;
    }
    d = 1 / d;
    let del = d * c;
    h *= del;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) {
      d = fpmin;
    }
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) {
      c = fpmin;
    }
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) {
      break;
    }
  }
  return h;
};

export const regularizedBeta = (a, b, x) => {
  if (x <= 0) {
    return 0;
  }
  if (x >= 1) {
    return 1;
  }
  const bt = Math.exp(
    Math.log(gammaFn(a + b)) - Math.log(gammaFn(a)) - Math.log(gammaFn(b)) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betacf(a, b, x) / a;
  }
  return 1 - (bt * betacf(b, a, 1 - x) / b);
};

export const tPdf = (n, t) => {
  const coeff = gammaFn((n + 1) / 2) / (Math.sqrt(n * Math.PI) * gammaFn(n / 2));
  return coeff * ((1 + (t * t) / n) ** (-(n + 1) / 2));
};

export const tCdf = (n, t) => {
  const x = n / (n + t * t);
  const ib = regularizedBeta(n / 2, 0.5, x);
  if (t >= 0) {
    return 1 - 0.5 * ib;
  }
  return 0.5 * ib;
};

export const normalSample = () => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

export const gammaSample = (alpha) => {
  if (alpha < 1) {
    const u = Math.random();
    return gammaSample(alpha + 1) * (u ** (1 / alpha));
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x = 0;
    let v = 0;
    do {
      x = normalSample();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x ** 4)) {
      return d * v;
    }
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
};

export const tSample = (n) => {
  const z = normalSample();
  const q = gammaSample(n / 2) * 2;
  return z / Math.sqrt(q / n);
};
