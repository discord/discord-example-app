
const Violations = {
  "Toxic towards the Team": {
    description: 'You can\'t be toxic towards your team'
  },
  "Toxic towards the Opponents": {
    description: 'You can\'t be toxic towards your opponent'
  },
  "Toxic towards themselves": {
    description: 'You can\'t be toxic towards yourself'
  },
  "Own Goal": {
    description: 'You can\'t shoot yourself'
  },
  "Saved Own Shot": {
    description: 'You can\'t save your own shot'
  },
}

export function getViolationDescription(violation) {
  return Violations[violation].description;
}

export function getViolations() {
  return Object.keys(Violations);
}
