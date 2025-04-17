
const Violations = {
  ownGoal: {
    description: 'You can\'t shoot yourself'
  },
  savedOwnShot: {
    description: 'You can\'t save your own shot'
  },
  toxicTowardsTeam: {
    description: 'You can\'t be toxic towards your team'
  },
  toxicTowardsOpponent: {
    description: 'You can\'t be toxic towards your opponent'
  },
  toxicTowardsSelf: {
    description: 'You can\'t be toxic towards yourself'
  }
}

export function getViolationDescription(violation) {
  return Violations[violation].description;
}

export function getViolations() {
  return Object.keys(Violations);
}
