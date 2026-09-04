// Automated Verification Script for SpeakBand Scoring Engine & Official IELTS Rounding Rules

function calculateOverallBand(scores) {
  const { fluency, lexical, grammar, pronunciation } = scores;
  const rawMean = (fluency + lexical + grammar + pronunciation) / 4;

  const whole = Math.floor(rawMean);
  const frac = Number((rawMean - whole).toFixed(4));

  if (frac < 0.25) {
    return whole;
  } else if (frac < 0.75) {
    return whole + 0.5;
  } else {
    return whole + 1.0;
  }
}

const testCases = [
  // .25 rounds up to .5
  { scores: { fluency: 6.0, lexical: 6.5, grammar: 6.0, pronunciation: 6.5 }, expected: 6.5, reason: 'Average 6.25 -> rounds up to 6.5' },
  // .75 rounds up to next integer
  { scores: { fluency: 6.5, lexical: 7.0, grammar: 6.5, pronunciation: 7.0 }, expected: 7.0, reason: 'Average 6.75 -> rounds up to 7.0' },
  // .125 rounds down to .0
  { scores: { fluency: 6.0, lexical: 6.0, grammar: 6.0, pronunciation: 6.5 }, expected: 6.0, reason: 'Average 6.125 -> rounds down to 6.0' },
  // .375 rounds up to .5
  { scores: { fluency: 6.0, lexical: 6.5, grammar: 6.5, pronunciation: 6.5 }, expected: 6.5, reason: 'Average 6.375 -> rounds up to 6.5' },
  // .625 rounds down to .5
  { scores: { fluency: 6.5, lexical: 6.5, grammar: 6.5, pronunciation: 7.0 }, expected: 6.5, reason: 'Average 6.625 -> rounds to 6.5' },
  // .875 rounds up to next integer
  { scores: { fluency: 6.5, lexical: 7.0, grammar: 7.0, pronunciation: 7.0 }, expected: 7.0, reason: 'Average 6.875 -> rounds up to 7.0' },
];

let allPassed = true;
console.log('=== OFFICIAL IELTS BAND ROUNDING TEST SUITE ===');
for (const tc of testCases) {
  const calculated = calculateOverallBand(tc.scores);
  const pass = calculated === tc.expected;
  if (!pass) allPassed = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${tc.reason} | Got: ${calculated}, Expected: ${tc.expected}`);
}

if (!allPassed) {
  console.error('FAIL: IELTS rounding tests failed!');
  process.exit(1);
} else {
  console.log('SUCCESS: All official IELTS band calculation rules verified perfectly.');
}
