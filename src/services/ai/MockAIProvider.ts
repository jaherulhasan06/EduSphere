import {
  GeneratedNoteContent,
  QuizQuestionItem,
  StructuredTutorResponse
} from '../../types/edusphere';
import {
  AIProvider,
  NotesGenerationParams,
  QuizGenerationParams,
  TutorRequestParams
} from './AIProvider';

interface TopicKnowledgeEntry {
  keywords: string[];
  subject: string;
  simpleExplanation: (classNum: number, board: string) => string;
  steps: string[];
  example: string;
  importantPoints: string[];
  followUp: string;
  definitions: { term: string; definition: string }[];
  concepts: { heading: string; explanation: string }[];
  questions: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    subtopic: string;
  }[];
}

const KNOWLEDGE_BANK: TopicKnowledgeEntry[] = [
  {
    keywords: ['quadratic', 'equation', 'roots', 'discriminant', 'polynomial', 'algebra'],
    subject: 'Mathematics',
    simpleExplanation: (classNum, board) =>
      `For Class ${classNum} (${board}), a quadratic equation is any second-degree polynomial equation of the standard form ax² + bx + c = 0, where a ≠ 0. Its solutions—called roots or zeros—represent the x-coordinates where the parabola intersects the horizontal axis.`,
    steps: [
      'Write the equation in standard form: ax² + bx + c = 0 and identify the coefficients a, b, and c.',
      'Calculate the Discriminant: D = b² - 4ac to determine the nature of the roots before solving.',
      'If D > 0, there are two distinct real roots; if D = 0, two equal real roots; if D < 0, no real roots.',
      'Apply the Quadratic Formula: x = (-b ± √D) / (2a) or factorize the middle term into two linear factors.',
      'Verify both roots by substituting them back into the original equation.'
    ],
    example:
      'Solve 2x² - 7x + 3 = 0: Here a = 2, b = -7, c = 3. Discriminant D = (-7)² - 4(2)(3) = 49 - 24 = 25. Since √25 = 5, x = (7 ± 5) / 4, which gives x = 3 or x = 1/2.',
    importantPoints: [
      'The coefficient "a" can never be zero; otherwise the equation reduces to a linear equation.',
      'Sum of roots (α + β) = -b / a, and Product of roots (α · β) = c / a.',
      'In board exams (CBSE/SEBA/ICSE), always state the nature of roots explicitly when asked.'
    ],
    followUp:
      'Find the values of k for which the quadratic equation 2x² + kx + 3 = 0 has two real and equal roots.',
    definitions: [
      { term: 'Quadratic Equation', definition: 'A polynomial equation of degree 2 in the form ax² + bx + c = 0 (a ≠ 0).' },
      { term: 'Discriminant (D)', definition: 'The expression D = b² - 4ac that determines whether roots are real and distinct, equal, or imaginary.' },
      { term: 'Zero / Root', definition: 'A value of the variable x that satisfies ax² + bx + c = 0.' }
    ],
    concepts: [
      {
        heading: 'Standard Form & Factorization Method',
        explanation: 'By splitting the middle term bx into two terms p·x and q·x such that p + q = b and p·q = a·c, we can factorize the quadratic into two linear binomials.'
      },
      {
        heading: 'Sridharacharya / Quadratic Formula',
        explanation: 'Derived by completing the square, x = [-b ± √(b² - 4ac)] / 2a works for every quadratic equation regardless of whether middle-term splitting is obvious.'
      },
      {
        heading: 'Relationship Between Roots and Coefficients',
        explanation: 'If α and β are the roots of ax² + bx + c = 0, then α + β = -b/a and αβ = c/a. Useful for forming new quadratic equations.'
      }
    ],
    questions: [
      {
        question: 'What is the discriminant of the quadratic equation 3x² - 2x + 1/3 = 0?',
        options: ['0', '4', '-4', '8'],
        correctAnswerIndex: 0,
        explanation: 'Here a = 3, b = -2, c = 1/3. Discriminant D = b² - 4ac = (-2)² - 4(3)(1/3) = 4 - 4 = 0.',
        subtopic: 'Discriminant & Nature of Roots'
      },
      {
        question: 'If the roots of px² - 14x + 8 = 0 are in the ratio 1:6 (one root is 6 times the other), what is the value of p?',
        options: ['2', '3', '4', '6'],
        correctAnswerIndex: 1,
        explanation: 'Let roots be α and 6α. Sum = 7α = 14/p ⇒ α = 2/p. Product = 6α² = 8/p ⇒ 6(4/p²) = 8/p ⇒ 24/p = 8 ⇒ p = 3.',
        subtopic: 'Sum and Product of Roots'
      },
      {
        question: 'Which of the following is NOT a quadratic equation?',
        options: ['(x + 1)² = 2(x - 3)', 'x² - 2x = (-2)(3 - x)', '(x - 2)(x + 1) = (x - 1)(x + 3)', 'x³ - x² = (x - 1)³'],
        correctAnswerIndex: 2,
        explanation: 'Expanding (x - 2)(x + 1) = (x - 1)(x + 3) gives x² - x - 2 = x² + 2x - 3. The x² terms cancel out, leaving -3x + 1 = 0, which is linear.',
        subtopic: 'Identifying Quadratic Equations'
      },
      {
        question: 'For what positive value of k does x² + kx + 64 = 0 have real and equal roots?',
        options: ['8', '16', '32', '12'],
        correctAnswerIndex: 1,
        explanation: 'For equal roots, D = k² - 4(1)(64) = 0 ⇒ k² = 256 ⇒ k = 16 (positive value).',
        subtopic: 'Equal Roots Condition'
      },
      {
        question: 'If α and β are the roots of x² - 5x + 6 = 0, what is the value of α² + β²?',
        options: ['11', '13', '17', '25'],
        correctAnswerIndex: 1,
        explanation: 'α + β = 5 and αβ = 6. Therefore α² + β² = (α + β)² - 2αβ = 25 - 12 = 13.',
        subtopic: 'Symmetric Functions of Roots'
      }
    ]
  },
  {
    keywords: ['ohm', 'electricity', 'current', 'voltage', 'resistance', 'circuit', 'power', 'physics'],
    subject: 'Physics / Science',
    simpleExplanation: (classNum, board) =>
      `Adapted for Class ${classNum} (${board}): Ohm's Law states that the electric current (I) flowing through a metallic conductor is directly proportional to the potential difference (V) across its ends, provided physical conditions such as temperature remain constant (V = I · R).`,
    steps: [
      'Understand Electric Current (I): The rate of flow of electric charge (I = Q / t), measured in Amperes (A).',
      'Understand Potential Difference (V): Work done to move a unit charge between two points (V = W / Q), measured in Volts (V).',
      'Apply Ohm’s Law: V = I × R, where R is the constant of proportionality called Resistance (measured in Ohms, Ω).',
      'Analyze Resistor Combinations: Series (R_eq = R₁ + R₂ + ...) vs. Parallel (1/R_eq = 1/R₁ + 1/R₂ + ...).',
      'Compute Heating Effect & Power: Joule’s Law of Heating H = I²Rt and Electric Power P = V·I = I²R = V²/R.'
    ],
    example:
      'An electric lamp of resistance 20 Ω and a conductor of resistance 4 Ω are connected in series to a 6 V battery. Total Resistance R_s = 20 + 4 = 24 Ω. Current I = V / R_s = 6 / 24 = 0.25 A.',
    importantPoints: [
      'Resistance depends on length (R ∝ L), cross-sectional area (R ∝ 1/A), nature of material (resistivity ρ), and temperature.',
      'An ammeter is always connected in series (low resistance), while a voltmeter is connected in parallel (high resistance).',
      'Commercial unit of electrical energy is kilowatt-hour (1 kWh = 3.6 × 10⁶ Joules).'
    ],
    followUp:
      'If a wire of resistance 8 Ω is stretched to double its original length while keeping volume constant, what will be its new resistance?',
    definitions: [
      { term: 'Ohm’s Law', definition: 'At constant temperature, V ∝ I, or V = I·R where R is resistance.' },
      { term: 'Resistivity (ρ)', definition: 'Intrinsic property of a material equal to the resistance of a conductor of unit length and unit cross-sectional area (Ω·m).' },
      { term: 'Kilowatt-hour (kWh)', definition: 'Commercial unit of electrical energy equivalent to 1000 Watt power consumed for 1 hour (3.6 × 10⁶ J).' }
    ],
    concepts: [
      {
        heading: 'Factors Affecting Resistance of a Conductor',
        explanation: 'R = ρ (L / A). Doubling the length doubles resistance, whereas doubling the cross-sectional area halves the resistance.'
      },
      {
        heading: 'Series vs Parallel Domestic Circuits',
        explanation: 'Household appliances are wired in parallel so each appliance receives the same 220V supply and can operate independently with its own switch.'
      },
      {
        heading: 'Joule’s Law of Heating',
        explanation: 'Heat dissipated in a resistor is H = I²Rt. Used in electric irons, heaters, and protective fuse wires made of lead-tin alloy.'
      }
    ],
    questions: [
      {
        question: 'When a 12 V battery is connected across an unknown resistor, there is a current of 2.5 mA in the circuit. What is the resistance of the resistor?',
        options: ['480 Ω', '4800 Ω', '48 Ω', '2400 Ω'],
        correctAnswerIndex: 1,
        explanation: 'Current I = 2.5 mA = 2.5 × 10⁻³ A. By Ohm’s law, R = V / I = 12 / (2.5 × 10⁻³) = 4800 Ω (or 4.8 kΩ).',
        subtopic: 'Ohm’s Law Calculation'
      },
      {
        question: 'Three resistors of 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their equivalent resistance?',
        options: ['11 Ω', '1 Ω', '0.5 Ω', '3 Ω'],
        correctAnswerIndex: 1,
        explanation: '1/R_p = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1. Hence R_p = 1 Ω.',
        subtopic: 'Parallel Combination of Resistors'
      },
      {
        question: 'Which instrument is used to measure electric current in a circuit and how is it connected?',
        options: ['Voltmeter in parallel', 'Ammeter in series', 'Ammeter in parallel', 'Galvanometer in parallel'],
        correctAnswerIndex: 1,
        explanation: 'An ammeter has very low internal resistance and is connected in series so that the entire circuit current passes through it.',
        subtopic: 'Circuit Instruments'
      },
      {
        question: '1 kilowatt-hour (1 unit of commercial electricity) is equal to how many Joules?',
        options: ['3.6 × 10⁵ J', '3.6 × 10⁶ J', '1000 J', '6.0 × 10⁶ J'],
        correctAnswerIndex: 1,
        explanation: '1 kWh = 1000 W × 3600 s = 3,600,000 J = 3.6 × 10⁶ Joules.',
        subtopic: 'Electrical Energy & Power'
      },
      {
        question: 'A cylindrical wire of resistance R is stretched to twice its original length (volume remaining constant). What is its new resistance?',
        options: ['2R', '4R', 'R/2', '8R'],
        correctAnswerIndex: 1,
        explanation: 'Since volume V = A·L is constant, doubling length L halves the area A. R_new = ρ(2L)/(A/2) = 4 · ρ(L/A) = 4R.',
        subtopic: 'Resistivity & Geometry'
      }
    ]
  },
  {
    keywords: ['photosynthesis', 'chlorophyll', 'stomata', 'life', 'biology', 'nutrition', 'respiration', 'cell', 'xylem'],
    subject: 'Biology / Science',
    simpleExplanation: (classNum, board) =>
      `Tailored for Class ${classNum} (${board}): Photosynthesis is the biochemical process by which autotrophic green plants synthesize glucose (C₆H₁₂O₆) from carbon dioxide and water using sunlight energy absorbed by chlorophyll inside chloroplasts.`,
    steps: [
      'Absorption of Light Energy: Chlorophyll pigments in the thylakoid membranes trap solar photons.',
      'Photolysis & Light Reaction: Light energy splits water molecules (2H₂O → 4H⁺ + 4e⁻ + O₂↑) and generates ATP and NADPH.',
      'Gas Exchange via Stomata: Carbon dioxide enters the leaf through microscopic stomatal pores regulated by guard cells.',
      'Calvin Cycle (Dark/Biosynthetic Phase): In the stroma, CO₂ is reduced using ATP and NADPH to form glucose (C₆H₁₂O₆).',
      'Storage & Transport: Excess glucose is stored as starch in leaves or translocated as sucrose via phloem.'
    ],
    example:
      'Balanced Equation: 6CO₂ + 12H₂O —(Sunlight / Chlorophyll)→ C₆H₁₂O₆ + 6H₂O + 6O₂↑. Desert plants (xerophytes) open stomata at night to absorb CO₂ and minimize water loss by transpiration.',
    importantPoints: [
      'Oxygen released during photosynthesis comes exclusively from the splitting of water (H₂O), not from CO₂.',
      'Guard cells swell when water flows into them (opening the stomatal pore) and shrink when water leaves (closing the pore).',
      'Xylem transports water and minerals upward via transpiration pull; Phloem translocates food bidirectionally using ATP.'
    ],
    followUp:
      'Why do desert plants take up carbon dioxide at night instead of during the daytime, and how do they perform photosynthesis the next day?',
    definitions: [
      { term: 'Autotrophic Nutrition', definition: 'Mode of nutrition in which organisms synthesize their own organic food from simple inorganic substances like CO₂ and H₂O.' },
      { term: 'Photolysis of Water', definition: 'Splitting of water molecules into hydrogen ions, electrons, and oxygen gas in the presence of light energy.' },
      { term: 'Translocation', definition: 'Active transport of soluble products of photosynthesis (sucrose, amino acids) through phloem tissue.' }
    ],
    concepts: [
      {
        heading: 'Three Key Events of Photosynthesis',
        explanation: '1) Absorption of light by chlorophyll, 2) Conversion of light energy to chemical energy and splitting of water, 3) Reduction of CO₂ to carbohydrates.'
      },
      {
        heading: 'Role of Stomata & Guard Cells',
        explanation: 'Stomata regulate both gaseous exchange (CO₂ in, O₂ out) and transpiration. Turgor pressure changes in guard cells control stomatal opening.'
      },
      {
        heading: 'Vascular Transport: Xylem vs Phloem',
        explanation: 'Xylem vessels use physical forces (root pressure and transpiration pull) for unidirectional water flow; Phloem uses metabolic energy (ATP) for bidirectional food transport.'
      }
    ],
    questions: [
      {
        question: 'During photosynthesis, the oxygen gas released into the atmosphere comes from the splitting of which molecule?',
        options: ['Carbon dioxide (CO₂)', 'Water (H₂O)', 'Glucose (C₆H₁₂O₆)', 'Chlorophyll'],
        correctAnswerIndex: 1,
        explanation: 'Photolysis of water (2H₂O → 4H⁺ + 4e⁻ + O₂) in the light-dependent reaction is the sole source of released oxygen.',
        subtopic: 'Light Reaction & Photolysis'
      },
      {
        question: 'Which plant vascular tissue is responsible for the translocation of soluble products of photosynthesis from leaves to other parts?',
        options: ['Xylem vessels', 'Phloem', 'Cortex parenchyma', 'Epidermis'],
        correctAnswerIndex: 1,
        explanation: 'Phloem sieve tubes and companion cells translocate sucrose and amino acids bidirectionally using energy from ATP.',
        subtopic: 'Plant Vascular System'
      },
      {
        question: 'What causes the stomatal pore to open in a green leaf?',
        options: [
          'Outflow of water from guard cells causing them to shrink',
          'Inflow of water into guard cells causing them to swell and curve',
          'Breakdown of starch in epidermal cells',
          'Loss of chlorophyll from mesophyll cells'
        ],
        correctAnswerIndex: 1,
        explanation: 'When potassium ions and water enter the guard cells, their turgor pressure increases, causing the thicker inner walls to curve apart and open the pore.',
        subtopic: 'Stomatal Regulation'
      },
      {
        question: 'In what chemical form is excess carbohydrate stored as a reserve energy source in plant leaves?',
        options: ['Glycogen', 'Starch', 'Chitin', 'Cellulose'],
        correctAnswerIndex: 1,
        explanation: 'Plants polymerize excess glucose into insoluble starch granules for storage, whereas animals store carbohydrates as glycogen.',
        subtopic: 'Carbohydrate Storage'
      },
      {
        question: 'Where inside the chloroplast does the light-independent (biosynthetic/Calvin) phase of photosynthesis take place?',
        options: ['Grana lamellae', 'Stroma', 'Outer membrane', 'Mitochondrial matrix'],
        correctAnswerIndex: 1,
        explanation: 'Light reactions occur in the grana/thylakoids, while carbon fixation (Calvin cycle) occurs in the aqueous stroma of the chloroplast.',
        subtopic: 'Chloroplast Structure'
      }
    ]
  },
  {
    keywords: ['trigonometry', 'sin', 'cos', 'tan', 'triangle', 'hypotenuse', 'angle', 'identity'],
    subject: 'Mathematics',
    simpleExplanation: (classNum, board) =>
      `For Class ${classNum} (${board}), Trigonometry studies the quantitative relationships between the side lengths and acute angles of a right-angled triangle using six fundamental ratios: sine, cosine, tangent, cosecant, secant, and cotangent.`,
    steps: [
      'Identify the reference acute angle θ in a right-angled triangle.',
      'Label the side opposite to θ as Perpendicular (P), the side adjacent to θ as Base (B), and the side opposite the 90° angle as Hypotenuse (H).',
      'Define primary ratios: sin θ = P/H, cos θ = B/H, and tan θ = P/B = sin θ / cos θ.',
      'Memorize standard angles (0°, 30°, 45°, 60°, 90°), e.g., sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1.',
      'Apply the Pythagorean Trigonometric Identities: sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, and 1 + cot²θ = cosec²θ.'
    ],
    example:
      'In right ΔABC right-angled at B, if AB = 3 cm and BC = 4 cm, by Pythagoras theorem AC = √(3² + 4²) = 5 cm. Then sin C = AB/AC = 3/5 and cos C = BC/AC = 4/5.',
    importantPoints: [
      'The value of sin θ increases from 0 to 1 as θ increases from 0° to 90°, whereas cos θ decreases from 1 to 0.',
      'Since the hypotenuse is the longest side in a right triangle, sin θ and cos θ are always ≤ 1.',
      'Always convert all ratios into sin θ and cos θ when proving complex trigonometric identities.'
    ],
    followUp:
      'If tan θ + cot θ = 2 for an acute angle θ, find the value of tan⁷θ + cot⁷θ.',
    definitions: [
      { term: 'Sine of Angle θ (sin θ)', definition: 'Ratio of the side opposite to angle θ (Perpendicular) to the Hypotenuse in a right-angled triangle.' },
      { term: 'Pythagorean Identity', definition: 'The fundamental identity sin²θ + cos²θ = 1 valid for all real values of angle θ.' },
      { term: 'Angle of Elevation', definition: 'The angle formed by the line of sight with the horizontal when viewing an object above eye level.' }
    ],
    concepts: [
      {
        heading: 'Six Trigonometric Ratios',
        explanation: 'sin θ = P/H, cos θ = B/H, tan θ = P/B, and their reciprocals cosec θ = H/P, sec θ = H/B, cot θ = B/P.'
      },
      {
        heading: 'Standard Trigonometric Table (0° to 90°)',
        explanation: 'At 45°, sin 45° = cos 45° = 1/√2 and tan 45° = 1. At 30°, sin 30° = 1/2 and cos 30° = √3/2.'
      },
      {
        heading: 'Three Fundamental Identities',
        explanation: 'Derived by dividing P² + B² = H² by H², B², and P² respectively: sin²θ + cos²θ = 1, sec²θ - tan²θ = 1, cosec²θ - cot²θ = 1.'
      }
    ],
    questions: [
      {
        question: 'If sin A = 3/5 in a right-angled triangle, what is the value of tan A?',
        options: ['4/5', '3/4', '4/3', '5/4'],
        correctAnswerIndex: 1,
        explanation: 'Given P = 3k, H = 5k. By Pythagoras theorem, Base B = √(5² - 3²)k = 4k. Therefore tan A = P/B = 3/4.',
        subtopic: 'Trigonometric Ratios'
      },
      {
        question: 'What is the numerical value of 2 tan² 45° + cos² 30° - sin² 60°?',
        options: ['0', '1', '2', '3/2'],
        correctAnswerIndex: 2,
        explanation: 'tan 45° = 1, cos 30° = √3/2, sin 60° = √3/2. Expression = 2(1)² + (3/4) - (3/4) = 2.',
        subtopic: 'Standard Angles Evaluation'
      },
      {
        question: 'Simplify the trigonometric expression: (sec A + tan A)(1 - sin A).',
        options: ['sin A', 'cos A', 'cosec A', 'sec A'],
        correctAnswerIndex: 1,
        explanation: 'Write in terms of sin and cos: (1/cos A + sin A/cos A)(1 - sin A) = [(1 + sin A)(1 - sin A)] / cos A = (1 - sin²A)/cos A = cos²A / cos A = cos A.',
        subtopic: 'Trigonometric Identities'
      },
      {
        question: 'If 5 tan θ = 4, then what is the value of (5 sin θ - 3 cos θ) / (5 sin θ + 2 cos θ)?',
        options: ['1/6', '1/3', '2/5', '3/7'],
        correctAnswerIndex: 0,
        explanation: 'Divide numerator and denominator by cos θ: (5 tan θ - 3) / (5 tan θ + 2) = (4 - 3) / (4 + 2) = 1/6.',
        subtopic: 'Ratio Substitution'
      },
      {
        question: 'The shadow of a vertical tower on level ground is √3 times its height. What is the angle of elevation of the Sun?',
        options: ['30°', '45°', '60°', '90°'],
        correctAnswerIndex: 0,
        explanation: 'tan θ = Height / Shadow = h / (√3 h) = 1/√3. Since tan 30° = 1/√3, the angle of elevation θ = 30°.',
        subtopic: 'Heights and Distances'
      }
    ]
  }
];

function findMatchingEntry(
  topic: string,
  subject: string,
  query: string,
  classNum: number,
  board: string
): TopicKnowledgeEntry {
  const combined = `${topic} ${subject} ${query}`.toLowerCase();
  for (const entry of KNOWLEDGE_BANK) {
    if (entry.keywords.some((kw) => combined.includes(kw))) {
      return entry;
    }
  }
  // Construct a dynamic topic-specific knowledge entry when user specifies another topic
  const cleanTopic = topic.trim() || 'Core Curriculum Concept';
  return {
    keywords: [cleanTopic.toLowerCase()],
    subject,
    simpleExplanation: (cNum, brd) =>
      `In Class ${cNum} (${brd}) ${subject}, "${cleanTopic}" is a foundational concept that connects theoretical principles with practical problem-solving. Mastering its core definitions and governing relationships helps you tackle analytical questions systematically.`,
    steps: [
      `Identify the fundamental definition and standard notation used in "${cleanTopic}".`,
      `Break down the governing laws, formulas, or cause-and-effect mechanisms for Class ${classNum} (${board}).`,
      'Map out the given data and unknown variables before selecting a method.',
      'Execute the step-by-step derivation or explanation using board-approved terminology.',
      'Cross-check units, boundary conditions, and logical consistency of your final answer.'
    ],
    example: `Worked Application in ${subject} (${cleanTopic}): When analyzing a standard Class ${classNum} problem on ${cleanTopic}, start by stating the core law, substitute the known parameters with standard SI/mathematical units, and interpret the resulting value in context.`,
    importantPoints: [
      `Always write the fundamental principle or formula for ${cleanTopic} before substituting values—board marking schemes award step marks.`,
      'Include labelled diagrams or structured points wherever applicable to improve clarity.',
      `Review how ${cleanTopic} links to subsequent chapters in the ${board} Class ${classNum} syllabus.`
    ],
    followUp: `State the primary principle of ${cleanTopic} in your own words and explain one real-world scenario where it applies.`,
    definitions: [
      {
        term: cleanTopic,
        definition: `A key syllabus concept in Class ${classNum} ${subject} governing the relationship between core variables and observable outcomes.`
      },
      {
        term: 'Primary Principle / Law',
        definition: `The foundational rule in ${cleanTopic} that stays invariant under standard syllabus conditions.`
      },
      {
        term: 'Analytical Application',
        definition: `Applying ${cleanTopic} to solve multi-step numerical or conceptual board examination problems.`
      }
    ],
    concepts: [
      {
        heading: `1. Core Foundation of ${cleanTopic}`,
        explanation: `Establishes the fundamental definition, scope, and assumptions studied in Class ${classNum} ${subject}.`
      },
      {
        heading: `2. Governing Mechanism & Mathematical/Logical Formulation`,
        explanation: `Explains how changes in input variables systematically determine the output in ${cleanTopic}.`
      },
      {
        heading: `3. Exam Problem-Solving Strategy`,
        explanation: `Structured approach for answering 3-mark and 5-mark questions on ${cleanTopic} with clear diagrams and step-wise deductions.`
      }
    ],
    questions: [
      {
        question: `In the context of Class ${classNum} ${subject}, which statement best describes the primary objective of studying ${cleanTopic}?`,
        options: [
          `Understanding the systematic relationship between core variables and real-world applications in ${cleanTopic}`,
          'Memorizing isolated numbers without conceptual connection',
          'Ignoring units and boundary conditions during derivation',
          'Applying unrelated assumptions outside the syllabus'
        ],
        correctAnswerIndex: 0,
        explanation: `${cleanTopic} focuses on building rigorous conceptual understanding and applying governing principles accurately.`,
        subtopic: `${cleanTopic} Fundamentals`
      },
      {
        question: `When solving a multi-step board question on ${cleanTopic}, what should be your first analytical step?`,
        options: [
          'Guessing the final numeric answer directly',
          `Identifying the given parameters, required unknown, and governing law of ${cleanTopic}`,
          'Skipping the formula statement',
          'Changing the units randomly'
        ],
        correctAnswerIndex: 1,
        explanation: `Listing knowns, unknowns, and the governing equation ensures accuracy and secures step-marking in board exams.`,
        subtopic: `${cleanTopic} Methodology`
      },
      {
        question: `Which of the following is essential when presenting a complete answer on ${cleanTopic} in ${subject}?`,
        options: [
          'Stating proper units, logical steps, and clear justification',
          'Writing only a single word without explanation',
          'Omitting diagrams and formulas',
          'Leaving intermediate fractions unsimplified'
        ],
        correctAnswerIndex: 0,
        explanation: `Complete board answers require clear steps, standard units, and concise reasoning.`,
        subtopic: `${cleanTopic} Representation`
      },
      {
        question: `If a key input parameter in a standard ${cleanTopic} system is altered while keeping other factors constant, how should you analyze the outcome?`,
        options: [
          `By evaluating the direct or inverse relationship defined by the core law of ${cleanTopic}`,
          'By assuming nothing ever changes',
          'By discarding the governing equation',
          'By reversing the hypothesis arbitrarily'
        ],
        correctAnswerIndex: 0,
        explanation: `Analyzing proportionality and conservation laws in ${cleanTopic} reveals how dependent variables respond.`,
        subtopic: `${cleanTopic} Analysis`
      },
      {
        question: `Why is ${cleanTopic} considered an important building block in the Class ${classNum} curriculum?`,
        options: [
          `It bridges foundational concepts with higher-level analytical problem solving in ${subject}`,
          'It is completely disconnected from all other chapters',
          'It requires zero conceptual reasoning',
          'It only applies to hypothetical cases with no practical utility'
        ],
        correctAnswerIndex: 0,
        explanation: `${cleanTopic} establishes essential analytical skills required across advanced chapters.`,
        subtopic: `${cleanTopic} Synthesis`
      }
    ]
  };
}

export class MockAIProvider implements AIProvider {
  public readonly providerName = 'Demo AI Provider (MockAIProvider)';
  public readonly isDemoProvider = true;

  async generateTutorResponse(params: TutorRequestParams): Promise<StructuredTutorResponse> {
    const cleanQuestion = params.userQuestion.trim();
    if (!cleanQuestion) {
      throw new Error('Please enter a question or topic for the AI Tutor to explain.');
    }

    // Brief realistic processing delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    const entry = findMatchingEntry(
      params.topic,
      params.subject,
      cleanQuestion,
      params.classNumber,
      params.boardId
    );
    const activeTopic = params.topic.trim() || entry.subject;

    return {
      topic: activeTopic,
      classNumber: params.classNumber,
      subject: params.subject,
      simpleExplanation: entry.simpleExplanation(params.classNumber, params.boardId),
      stepByStepBreakdown: entry.steps,
      realWorldExample: entry.example,
      importantPoints: entry.importantPoints,
      followUpQuestion: entry.followUp,
      providerLabel: 'Demo AI mode — responses are generated by a demonstration provider.'
    };
  }

  async generateStudyNotes(params: NotesGenerationParams): Promise<GeneratedNoteContent> {
    const cleanTopic = params.topic.trim();
    if (!cleanTopic) {
      throw new Error('Please specify a chapter or topic name to generate structured study notes.');
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const entry = findMatchingEntry(
      cleanTopic,
      params.subject,
      cleanTopic,
      params.classNumber,
      params.boardId
    );
    const formatLabel =
      params.format === 'exam_revision'
        ? 'Board Exam Revision Sheet'
        : params.format === 'flash_summary'
        ? 'Quick Flash Summary'
        : 'Comprehensive Chapter Notes';

    return {
      topicTitle: `${cleanTopic} — Class ${params.classNumber} (${params.boardId}) ${formatLabel}`,
      shortSummary: entry.simpleExplanation(params.classNumber, params.boardId),
      importantDefinitions: entry.definitions,
      mainConcepts: entry.concepts,
      keyPoints: entry.importantPoints,
      examples: [
        entry.example,
        `Board Exam Tip (${params.boardId} Class ${params.classNumber}): Always highlight key definitions and box final numerical answers.`
      ],
      revisionSection: entry.steps,
      practiceQuestions: [
        {
          question: entry.followUp,
          hint: 'Start by writing the standard formula/definition and substituting the given conditions.'
        },
        {
          question: `Explain the core principle of ${cleanTopic} with a labelled example suitable for Class ${params.classNumber}.`,
          hint: 'Break your answer into Definition, Mechanism/Formula, and Worked Example.'
        }
      ]
    };
  }

  async generatePracticeQuiz(params: QuizGenerationParams): Promise<QuizQuestionItem[]> {
    const cleanTopic = params.topic.trim() || params.subject;
    await new Promise((resolve) => setTimeout(resolve, 400));

    const entry = findMatchingEntry(
      cleanTopic,
      params.subject,
      cleanTopic,
      params.classNumber,
      params.boardId
    );
    const count = Math.max(3, Math.min(10, params.questionCount || 5));

    const result: QuizQuestionItem[] = [];
    for (let i = 0; i < count; i++) {
      const template = entry.questions[i % entry.questions.length];
      const suffix = i >= entry.questions.length ? ` (Variant ${i + 1})` : '';
      result.push({
        id: `q-${Date.now()}-${i + 1}`,
        question: `${template.question}${suffix}`,
        options: template.options,
        correctAnswerIndex: template.correctAnswerIndex,
        explanation: template.explanation,
        subtopic: template.subtopic
      });
    }

    return result;
  }
}

export const aiProvider: AIProvider = new MockAIProvider();
