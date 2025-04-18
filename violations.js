const Violations = {
  "Toxic towards the Team": [
    "Calling your teammates trash? Congrats, you’ve unlocked ‘Drink Every Time They Whiff’ mode.",
    "If toxicity was a Rocket League rank, you’d be SSL. Unfortunately, it’s not. Bottoms up!",
    "The only thing worse than your insults is your rotation. Take a sip of shame."
  ],
  "Toxic towards the Opponents": [
    "Trash-talking the enemy? Enjoy drinking every time they demo you—which will be often.",
    "You type faster than you play. Take a shot for every toxic quick-chat you spam.",
    "The only thing you’re winning is the ‘Most Likely to Rage Quit’ award. Drink up, loser."
  ],
  "Toxic towards themselves": [
    "Calling yourself garbage? We agree. Chug until you improve (or pass out).",
    "Self-deprecation is only funny if it’s ironic. Yours is just sad. Drink to forget.",
    "If you hate yourself this much, wait until you see your rank after drinking. Bottoms up!"
  ],
  "Own Goal": [
    "Scoring for the other team? That’s not an accident—it’s treason. Drink in disgrace.",
    "Own goals are just advanced mind games… right? Right? (Take a shot, clown).",
    "The only thing you’re carrying is the enemy team. Chug while they thank you."
  ],
  "Saved Own Shot": [
    "Blocking your own shot is like high-fiving a wall—pointless and embarrassing. Drink.",
    "You had ONE job. Now take a shot for every goal your ‘save’ cost the team.",
    "Your defense is so bad, even your own shots don’t feel safe. Bottoms up!"
  ],
  "Lying about Things": [
    "‘I lagged’? Sure, and I’m Squishy. Drink twice—once for the lie, once for your ego.",
    "The only thing worse than your excuses is your gameplay. Chug to numb the pain.",
    "Keep lying and we’ll start a drinking game just for your terrible excuses."
  ]
};

export function getRandomViolationDescription(violationType) {
  if (!Violations[violationType]) {
    return "Invalid violation. Try being toxic correctly next time.";
  }
  const punishments = Violations[violationType];
  const randomIndex = Math.floor(Math.random() * punishments.length);
  return punishments[randomIndex];
}

export function getViolations() {
  return Object.keys(Violations);
}
