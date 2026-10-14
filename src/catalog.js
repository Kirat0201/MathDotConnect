// Curated content is separate from presentation so it can also power a future API/MCP server.
export const catalog = [
  {
    id: 'euler',
    title: 'Euler’s identity',
    formula: 'e^(iπ) + 1 = 0',
    topic: 'Pure mathematics',
    summary:
      'Five fundamental constants. Three operations. One extraordinary connection.',
    explanation:
      'Euler’s formula connects complex exponentials to circular motion: e^(iθ) = cos θ + i sin θ. Set θ to π and the point on the unit circle is −1. Adding 1 gives zero.',
    application:
      'Complex exponentials describe rotations and oscillations, making them a natural language for signal processing, electrical engineering, and wave physics.',
    symbols:
      'e: base of natural logarithms · i: square root of −1 · π: half a turn in radians',
    tags: ['complex numbers', 'geometry', 'identity'],
    source: {
      label: 'Explore complex exponentials · 3Blue1Brown',
      url: 'https://www.3blue1brown.com/lessons/eulers-formula-via-group-theory/',
    },
    accent: 'violet',
    readingMinutes: 3,
  },
  {
    id: 'fourier',
    title: 'Fourier series',
    formula: 'f(x) = a₀/2 + Σ[aₙ cos(nx) + bₙ sin(nx)]',
    topic: 'Signals & waves',
    summary: 'Complicated patterns, built from the simplest possible waves.',
    explanation:
      'A Fourier series represents a periodic function as a sum of sine and cosine waves. The coefficients measure how much of each frequency is present. Convergence depends on the function and the sense in which the series is interpreted.',
    application:
      'Frequency analysis helps us understand music, compress signals, and solve differential equations. The related Fourier transform extends this perspective beyond periodic functions.',
    symbols:
      'a₀: constant term · aₙ, bₙ: frequency coefficients · n: positive integer harmonic',
    tags: ['waves', 'sound', 'frequency'],
    source: {
      label: 'Visual introduction · 3Blue1Brown',
      url: 'https://www.youtube.com/watch?v=r6sGWTCMz2k',
    },
    accent: 'blue',
    readingMinutes: 4,
  },
  {
    id: 'bayes',
    title: 'Bayes’ theorem',
    formula: 'P(A | B) = P(B | A) P(A) / P(B)',
    topic: 'Probability',
    summary: 'A principled way to change your mind when the evidence changes.',
    explanation:
      'Bayes’ theorem relates the probability of a hypothesis after observing evidence to its prior probability and the likelihood of that evidence under the hypothesis. The denominator must be greater than zero.',
    application:
      'Used in medical test interpretation, spam filtering, forecasting, and statistical inference. A rare condition can remain unlikely after a positive test when the false-positive rate is appreciable.',
    symbols:
      'P(A): prior · P(B | A): likelihood · P(B): evidence probability · P(A | B): posterior',
    tags: ['inference', 'statistics', 'learning'],
    source: {
      label: 'A visual explanation · 3Blue1Brown',
      url: 'https://www.3blue1brown.com/lessons/bayes-theorem',
    },
    accent: 'orange',
    readingMinutes: 4,
  },
  {
    id: 'pythagoras',
    title: 'Pythagorean theorem',
    formula: 'a² + b² = c²',
    topic: 'Pure mathematics',
    summary:
      'The geometry of a right triangle reaches far beyond the classroom.',
    explanation:
      'In Euclidean geometry, the square of the hypotenuse of a right triangle equals the sum of the squares of its other two sides. The right-angle condition is essential.',
    application:
      'The distance formula in a plane is an application of this theorem. Generalizations underpin vector norms, navigation, and geometric computation.',
    symbols: 'a, b: perpendicular side lengths · c: hypotenuse',
    tags: ['geometry', 'distance', 'triangles'],
    source: {
      label: 'Pythagorean theorem · MathWorld',
      url: 'https://mathworld.wolfram.com/PythagoreanTheorem.html',
    },
    accent: 'green',
    readingMinutes: 2,
  },
  {
    id: 'heat',
    title: 'The heat equation',
    formula: '∂u/∂t = α ∇²u',
    topic: 'Physics',
    summary: 'How a hot cup cools, and how differences gradually smooth away.',
    explanation:
      'The heat equation describes diffusion in a homogeneous medium with constant diffusivity and no internal heat sources. The rate of temperature change depends on spatial curvature. Initial and boundary conditions determine a particular solution.',
    application:
      'Models heat conduction and diffusion. The same mathematical structure appears in probability and image smoothing.',
    symbols:
      'u: temperature · t: time · α: thermal diffusivity · ∇²: spatial Laplacian',
    tags: ['diffusion', 'differential equations', 'temperature'],
    source: {
      label: 'Solving the heat equation · 3Blue1Brown',
      url: 'https://www.youtube.com/watch?v=ToIXSwZ1pJU',
    },
    accent: 'rose',
    readingMinutes: 5,
  },
  {
    id: 'black-scholes',
    title: 'Black–Scholes equation',
    formula: '∂V/∂t + ½σ²S² ∂²V/∂S² + rS ∂V/∂S − rV = 0',
    topic: 'Finance',
    summary:
      'A bridge between random motion, risk, and the price of an option.',
    explanation:
      'Under the Black–Scholes model, a derivative’s price satisfies this partial differential equation. The basic model assumes constant volatility and interest rates, frictionless trading, and a non-dividend-paying underlying asset.',
    application:
      'A foundational model for European option pricing. Actual markets violate its assumptions; it does not reliably predict stock prices or remove financial risk.',
    symbols:
      'V: derivative value · S: underlying price · σ: volatility · r: risk-free rate · t: time',
    tags: ['options', 'stochastic processes', 'modeling'],
    source: {
      label: 'Black–Scholes model · Nobel Prize',
      url: 'https://www.nobelprize.org/prizes/economic-sciences/1997/press-release/',
    },
    accent: 'sand',
    readingMinutes: 5,
  },
  {
    id: 'entropy',
    title: 'Shannon entropy',
    formula: 'H(X) = −Σ p(x) log₂ p(x)',
    topic: 'Information theory',
    summary: 'How much surprise can a message hold?',
    explanation:
      'For a discrete random variable, Shannon entropy measures average information in bits when logarithms use base two. Outcomes with zero probability contribute zero by continuity. A fair coin has one bit of entropy.',
    application:
      'Entropy establishes theoretical limits on lossless compression and helps quantify uncertainty in communication and machine learning.',
    symbols:
      'X: discrete random variable · p(x): probability of outcome x · H: entropy in bits',
    tags: ['information', 'compression', 'uncertainty'],
    source: {
      label: 'Entropy · MathWorld',
      url: 'https://mathworld.wolfram.com/Entropy.html',
    },
    accent: 'blue',
    readingMinutes: 3,
  },
  {
    id: 'newton',
    title: 'Newton’s second law',
    formula: 'F = ma',
    topic: 'Physics',
    summary: 'A compact connection between a push and a change in motion.',
    explanation:
      'For constant mass in an inertial reference frame, net force equals mass times acceleration. The more general momentum form is F = dp/dt. Classical mechanics has limits at relativistic speeds and microscopic scales.',
    application:
      'From designing a bicycle brake to predicting a spacecraft trajectory, Newton’s law is a starting point for modeling motion.',
    symbols: 'F: net force vector · m: constant mass · a: acceleration vector',
    tags: ['mechanics', 'motion', 'forces'],
    source: {
      label: 'Newton’s laws · NASA',
      url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/newtons-laws-of-motion/',
    },
    accent: 'green',
    readingMinutes: 2,
  },
];
