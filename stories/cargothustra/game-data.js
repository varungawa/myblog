/* Thus Spake Cargothustra: the walk. Game data.
 * Ten levels (S01 to S10) cover the thirteen Cs. Every turn the player picks an approach (saam, daam, dand, bhed)
 * and one call for that level. Three Markov chains then move: the position chain (S01..S10), the regime chain
 * (market high/low x war/peace) and the weather chain (calm/storm). All numbers are play-testing placeholders. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CargoGameData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    maxTurns: 30,
    reversion: 0.10,   // each turn every meter drifts this fraction of the way back toward its start value
    regimeScale: 0.5,  // regime and weather effects are scaled by this before they land
    meters: [
      { id: 'c1', short: 'C1', name: 'Commerce', note: 'margin and payment health', collapse: ['Insolvent', 'The money ran out before the tide did. The payment tenor passed, and the cargo was sold to cover it.'] },
      { id: 'c2', short: 'C2', name: 'Commodity', note: 'cargo standing and classification', collapse: ['Impounded', 'The cargo was reclassified, then impounded. What was in the box was no longer yours to say.'] },
      { id: 'c3', short: 'C3', name: 'Consignor', note: 'trust in the seller', collapse: ['Abandoned by the seller', 'The consignor stopped answering. A bond needs a hand that gives, and there was none.'] },
      { id: 'c4', short: 'C4', name: 'Consignee', note: 'trust in the buyer', collapse: ['Refused at the gate', 'The buyer refused delivery. A bond needs a hand that receives, and there was none.'] },
      { id: 'c5', short: 'C5', name: 'Carriage', note: 'route flexibility', collapse: ['No route left', 'Every leg was closed. The map had no line left on it.'] },
      { id: 'c6', short: 'C6', name: 'Carrier', note: 'fleet health', collapse: ['The fleet is gone', 'Without a carrier the walk simply stops.'] },
      { id: 'c7', short: 'C7', name: 'Corridors', note: 'port and sea-lane access', collapse: ['Seized', 'The corridors closed and the hull was boarded. Nanda’s walk ends in a bonded warehouse beyond the coast.'] },
      { id: 'c8', short: 'C8', name: 'Conditions', note: 'clauses and cover', collapse: ['Void', 'The clauses no longer covered anything. Every loss was yours.'] },
      { id: 'c9', short: 'C9', name: 'Climate', note: 'weather resilience', collapse: ['Wrecked by weather', 'The weather took what the wars had left.'] },
      { id: 'c10', short: 'C10', name: 'Claims', note: 'clean record, low claims', collapse: ['Uninsurable', 'The claims were too many. The insurers withdrew, and then so did everyone else.'] },
      { id: 'c11', short: 'C11', name: 'Costs', note: 'cost position', collapse: ['Ruined by costs', 'Freight, duties, demurrage and favours. The costs ate the cargo.'] },
      { id: 'c12', short: 'C12', name: 'Current affairs', note: 'standing with the world', collapse: ['Sanctioned', 'The world turned its attention to you, and did not look away.'] },
      { id: 'c13', short: 'C13', name: 'Integrity', note: 'Corruption risk, inverted: higher is cleaner', collapse: ['Exposed', 'Every bribe and shortcut came due at once. The inquiry found everything.'] }
    ],
    start: { c1: 60, c2: 65, c3: 55, c4: 50, c5: 55, c6: 60, c7: 55, c8: 50, c9: 50, c10: 70, c11: 50, c12: 50, c13: 65 },

    regimes: {
      HP: { name: 'Markets high · Peace', market: 'high', war: false, fx: { c1: 4, c11: -3, c7: 2, c12: 2 }, blurb: 'Demand is strong, the lanes are open, and freight is dear.' },
      HW: { name: 'Markets high · War', market: 'high', war: true, fx: { c1: 6, c11: -6, c7: -6, c12: -4, c6: -3, c13: -2 }, blurb: 'War pays a premium. The lanes narrow and the temptations widen.' },
      LP: { name: 'Markets low · Peace', market: 'low', war: false, fx: { c1: -5, c11: 3, c7: 1, c12: 1 }, blurb: 'Quiet seas and thin margins.' },
      LW: { name: 'Markets low · War', market: 'low', war: true, fx: { c1: -7, c11: -2, c7: -8, c12: -5, c6: -3 }, blurb: 'Nobody is buying and the lanes are closing.' }
    },
    // rows: from; columns: to
    regimeMatrix: {
      HP: { HP: 0.62, HW: 0.08, LP: 0.24, LW: 0.06 },
      HW: { HP: 0.20, HW: 0.50, LP: 0.06, LW: 0.24 },
      LP: { HP: 0.26, HW: 0.04, LP: 0.60, LW: 0.10 },
      LW: { HP: 0.06, HW: 0.20, LP: 0.20, LW: 0.54 }
    },
    weather: {
      calm: { name: 'Calm', fx: {}, up: 0, down: 0 },
      storm: { name: 'Storm', fx: { c9: -6, c6: -4 }, up: -0.10, down: 0.06 }
    },
    weatherMatrix: { calm: { calm: 0.88, storm: 0.12 }, storm: { calm: 0.50, storm: 0.50 } },
    stormBoostAtLevel: { 8: 0.35 },

    // ---- cards ----
    // The bond hand: one card per suit, filled by your calls. Cover helps the paper hold up; heat draws attention.
    suits: [
      { id: 'commerce', name: 'Commerce', c: 'C1', level: 1 },
      { id: 'commodity', name: 'Commodity', c: 'C2', level: 2 },
      { id: 'consignor', name: 'Consignor', c: 'C3', level: 3 },
      { id: 'consignee', name: 'Consignee', c: 'C4', level: 4 },
      { id: 'carriage', name: 'Carriage', c: 'C5', level: 5 },
      { id: 'carrier', name: 'Carrier', c: 'C6', level: 5 }
    ],
    defaultCards: {
      commerce: { name: 'Standing order', cover: 2, heat: 2 }, commodity: { name: 'Mixed lot', cover: 2, heat: 2 },
      consignor: { name: 'Old supplier', cover: 2, heat: 2 }, consignee: { name: 'Regular buyer', cover: 2, heat: 2 },
      carriage: { name: 'Coastal leg', cover: 2, heat: 1 }, carrier: { name: 'Coaster', cover: 2, heat: 1 }
    },
    // Placeholder port control ratings (not real ratings of real ports): scrutiny = how hard customs look,
    // palm = how far favours bend them, heat = geopolitical pressure on the corridor.
    ports: {
      'Gwadar': { scrutiny: 2, palm: 3, heat: 4 }, 'Dammam': { scrutiny: 3, palm: 2, heat: 3 }, 'Kandla': { scrutiny: 3, palm: 3, heat: 2 },
      'Mundra': { scrutiny: 3, palm: 2, heat: 2 }, 'Dighi': { scrutiny: 2, palm: 2, heat: 1 }, 'Jaigad': { scrutiny: 2, palm: 2, heat: 1 },
      'Open sea': { scrutiny: 1, palm: 0, heat: 1 }, 'Kutch sea': { scrutiny: 1, palm: 0, heat: 1 }
    },
    levelPorts: { 1: ['Mundra', 'Dammam'], 2: ['Gwadar', 'Mundra'], 3: ['Gwadar', 'Kandla'], 4: ['Kandla', 'Dammam'], 5: ['Kandla', 'Open sea'], 6: ['Mundra', 'Jaigad'], 7: ['Dighi', 'Kutch sea'], 8: ['Jaigad', 'Open sea'], 9: ['Mundra', 'Mundra'], 10: ['Mundra', 'Mundra'] },
    levelChapters: { 1: [1], 2: [2], 3: [3], 4: [4], 5: [5, 6], 6: [7], 7: [8], 8: [9, 10], 9: [11, 12], 10: [13] },
    // Cards that a call puts into the bond hand, keyed 'level.option'.
    suitCards: {
      '1.take': [{ suit: 'commerce', name: 'Net Three', cover: 3, heat: 2 }],
      '1.credit': [{ suit: 'commerce', name: 'Letter of credit terms', cover: 4, heat: 0 }],
      '1.refuse': [{ suit: 'commerce', name: 'Order refused', cover: 2, heat: 0 }],
      '2.stand': [{ suit: 'commodity', name: 'Aid label', cover: 3, heat: 4 }],
      '2.hold': [{ suit: 'commodity', name: 'Held crate', cover: 1, heat: 2 }],
      '2.katta': [{ suit: 'commodity', name: 'Checked by the Katta gang', cover: 3, heat: 1 }],
      '3.trust': [{ suit: 'consignor', name: 'The House at Gwadar', cover: 3, heat: 3 }],
      '3.replace': [{ suit: 'consignor', name: 'A clean seller', cover: 2, heat: 1 }],
      '3.turn': [{ suit: 'consignor', name: 'The turned clerk', cover: 3, heat: 2 }],
      '4.pay': [{ suit: 'consignee', name: 'The bought buyer', cover: 3, heat: 2 }],
      '4.walk': [{ suit: 'consignee', name: 'No buyer', cover: 0, heat: 1 }],
      '4.new': [{ suit: 'consignee', name: 'New consignee at Kandla', cover: 2, heat: 2 }],
      '5.sesame': [{ suit: 'carriage', name: 'The cave leg', cover: 3, heat: 2 }, { suit: 'carrier', name: 'Swarm hull', cover: 2, heat: 1 }],
      '5.long': [{ suit: 'carriage', name: 'The long leg round', cover: 2, heat: 0 }, { suit: 'carrier', name: 'Old coaster', cover: 1, heat: 0 }],
      '5.jars': [{ suit: 'carriage', name: 'Jars on the road', cover: 3, heat: 1 }, { suit: 'carrier', name: 'Oil carrier', cover: 3, heat: 1 }]
    },
    // Playable one-time cards. One per turn, spent when played. Granted by a call, keyed 'level.option'.
    grants: { '1.credit': 'credit', '2.katta': 'chit', '3.turn': 'ledger', '5.sesame': 'sesame', '5.jars': 'jars' },
    oneTime: {
      credit: { name: 'Letter of Credit', suit: 'Commerce', fx: { c8: 6, c1: 4, c4: 3 }, up: 0.03, tilt: {}, text: 'Paper a bank will honour.' },
      chit: { name: 'The Katta chit', suit: 'Client', fx: { c13: 6, c3: 4, c10: 4 }, up: 0, tilt: {}, text: 'Twenty-seven friends vouch for you.' },
      ledger: { name: 'Gora’s ledger page', suit: 'Consignor', fx: { c12: 6, c8: 4 }, up: 0.04, tilt: { war: -0.08 }, text: 'Proof that Gora has a man inside.' },
      sesame: { name: 'Open Sesame', suit: 'Carriage', fx: { c5: 8, c7: 8, c13: -2 }, up: 0.12, tilt: { war: 0.03 }, text: 'A spoken word that opens one node once. The word changes after.' },
      jars: { name: 'Forty Jars', suit: 'Carrier', fx: { c6: 8, c5: 4 }, up: 0.08, tilt: { war: -0.03 }, text: 'Oil carriers with something else inside.' }
    },
    // Morgiana: a Client card dealt face down once the walk reaches S06. Play it to audit (it costs time),
    // play it again to warn her. Left face down, it flips at S08 if you send the hull.
    morgiana: {
      dealtAt: 6,
      down: { name: 'A Client card, face down', suit: 'Client', text: 'Someone at Jaigad has been given a story. You could spend time to audit it.' },
      audit: { fx: { c1: -2 }, up: -0.05, tilt: {}, label: 'Audit it (costs time)', reveal: 'The brother’s detention is unverified. Someone built it.' },
      audited: { name: 'Morgiana, audited', suit: 'Client', text: 'The lie is not hers. You could warn her.' },
      tell: { fx: { c13: 4, c3: -2 }, up: 0, tilt: {}, label: 'Warn her', reveal: 'You told Morgiana the truth. She chalks every door the same again.' },
      flip: { fx: { c10: -6, c6: -4, c12: -2 }, text: 'The face-down card flips. Gora’s drones were waiting at the quiet corridor.' },
      sendOptions: ['send', 'withvee'],
      epilogue: { flipped: 'Morgiana’s card flipped at the worst moment, and the drones were waiting.', audited: 'You audited Morgiana’s card and knew the lie was not hers.', told: 'You told Morgiana the truth. She chalks every door the same again.', down: 'Morgiana’s card stayed face down to the end.' }
    },

    approaches: {
      saam: { label: 'Saam', verb: 'Persuade', desc: 'Courtesy as a tool. Builds trust and keeps the peace, but takes time.', fx: { c3: 3, c4: 3, c13: 2 }, up: -0.02, tilt: { war: -0.08, market: 0 } },
      daam: { label: 'Daam', verb: 'Pay', desc: 'Money smooths the way and leaves a paper trail.', fx: { c1: -6, c11: -4, c3: 2, c4: 2, c13: -3 }, up: 0.10, tilt: { war: 0, market: 0 } },
      dand: { label: 'Dand', verb: 'Force', desc: 'Fast, and it costs blood, standing and peace.', fx: { c7: 4, c12: -5, c10: -4, c13: -5 }, up: 0.14, tilt: { war: 0.10, market: 0 } },
      bhed: { label: 'Bhed', verb: 'Divide', desc: 'Split the pursuer from the prize. Someone remembers the betrayal.', fx: { c8: 4, c4: -3, c12: -2 }, up: 0.08, tilt: { war: -0.04, market: 0 } }
    },

    levels: [
      {
        n: 1, title: 'A Need Arises', c: 'C1 Commerce', tests: ['c1', 'c3'],
        scene: 'A forest at night. Vee follows a lane cart toward the quay at Mundra, where Vivekananda lays six cards on a wooden table. The buyer is three weeks old, registered at Dammam, and wants Net Three. The dial reads four.',
        prompt: 'The order',
        options: [
          { id: 'take', label: 'Take it as asked', text: 'Net Three, no questions. The cargo moves.', fx: { c1: 4, c3: -2, c8: -4 }, up: 0.05, fate: { nanda: 'took the unknown order' } },
          { id: 'credit', label: 'Ask for a letter of credit', text: 'Slower. The paper is stronger.', fx: { c1: -3, c8: 6, c4: 3 }, up: -0.02, fate: { nanda: 'asked for credit' } },
          { id: 'refuse', label: 'Refuse the order', text: 'Nobody can say you were careless.', fx: { c1: -8, c13: 4, c12: 2 }, up: -0.08, tilt: { war: -0.02 }, fate: { nanda: 'refused the first order' } }
        ]
      },
      {
        n: 2, title: 'What Is in the Box', c: 'C2 Commodity', tests: ['c2', 'c13'],
        scene: 'The customs window at Mundra closes with the tide. The crate is marked as humanitarian supply. At the tea stall outside, nine groups of three school friends read the label, and the tender ones go quiet.',
        prompt: 'The label',
        options: [
          { id: 'stand', label: 'Let the label stand', text: 'It clears. Someone at the next table writes a word down.', fx: { c2: 4, c13: -6, c10: -3 }, up: 0.08 },
          { id: 'hold', label: 'Hold the crate overnight', text: 'The tide goes out without it.', fx: { c2: -2, c1: -5, c13: 3 }, up: -0.04 },
          { id: 'katta', label: 'Ask the Katta gang to look', text: 'Twenty-seven friends have opinions. Vee sits among them, listening.', fx: { c13: 5, c3: 2, c10: 3 }, up: 0.0, fate: { katta: 'asked' } }
        ]
      },
      {
        n: 3, title: 'The House at Gwadar', c: 'C3 Consignor', tests: ['c3', 'c10'],
        scene: 'A trading house at Gwadar. The seller’s ledger closes at dawn. In its margin is a line in a hand that does not belong: someone in this house is paid by East India Gora.',
        prompt: 'The consignor’s fate',
        options: [
          { id: 'trust', label: 'Trust the house', text: 'The man across the table is tired and afraid, and he is yours.', fx: { c3: 6, c10: -5, c13: -2 }, up: 0.04, fate: { consignor: 'kept' } },
          { id: 'replace', label: 'Replace the consignor', text: 'A clean seller, a slower start, and an old owner who remembers.', fx: { c3: -6, c1: -5, c13: 4, c10: 4 }, up: -0.03, fate: { consignor: 'replaced' } },
          { id: 'turn', label: 'Turn the man with the ledger', text: 'Gora’s own clerk now writes for you. No one will quite trust him.', fx: { c3: 3, c12: 3, c13: -4, c8: 3 }, up: 0.07, tilt: { war: -0.05 }, fate: { consignor: 'turned' } }
        ]
      },
      {
        n: 4, title: 'The Buyer at Dammam', c: 'C4 Consignee', tests: ['c4', 'c1'],
        scene: 'The buyer at Dammam has been paid late twice and questioned once. This is the last cargo, he says. Then, at sea, every route goes dark: East India Gora, whose pirates call themselves a navy, has closed them.',
        prompt: 'The consignee’s fate',
        options: [
          { id: 'pay', label: 'Pay the buyer more', text: 'He stays. So does the paper trail.', fx: { c4: 8, c1: -7, c11: -4, c13: -2 }, up: 0.05, fate: { consignee: 'bought' } },
          { id: 'walk', label: 'Let the buyer walk', text: 'He will tell his friends how it ended.', fx: { c4: -8, c1: 2, c13: 3, c10: 3 }, up: -0.05, fate: { consignee: 'walked' } },
          { id: 'new', label: 'Find a new consignee at Kandla', text: 'A fresh name with no history. Nobody checks.', fx: { c4: -3, c7: 5, c8: 3, c1: -3 }, up: 0.06, fate: { consignee: 'replaced' } }
        ]
      },
      {
        n: 5, title: 'Legs, and the Cave', c: 'C5 Carriage, C6 Carrier', tests: ['c5', 'c6'],
        scene: 'The only handoff Gora does not watch belongs to the thieves: a floating warehouse beyond the coast, and one spoken word to open it. Nanda is hidden on a supply boat at dusk, and the crews are returning.',
        prompt: 'The leg',
        options: [
          { id: 'sesame', label: 'Speak the word and take the cargo back', text: 'The seal opens. A greedy partner goes in for more and is shut inside.', fx: { c5: 8, c13: -4, c4: -3 }, up: 0.10, tilt: { war: 0.05 } },
          { id: 'long', label: 'Take the long leg round', text: 'Slow, wet, and out of everyone’s sight.', fx: { c5: -2, c11: -6, c6: 3, c9: -3 }, up: -0.02 },
          { id: 'jars', label: 'Light one lamp and divide the thieves', text: 'The guard goes to put it out. Forty jars of oil leave the yard.', fx: { c5: 4, c12: -2, c13: -2 }, up: 0.07, tilt: { war: -0.05 } }
        ]
      },
      {
        n: 6, title: 'Four Ports', c: 'C7 Corridors', tests: ['c7', 'c6'],
        scene: 'Kandla, Mundra, Dighi, Jaigad, worked just in time: the swarm’s best week. Vee sits on a bollard with the Katta gang and almost writes a line. Then Jaigad’s customs change hands overnight.',
        prompt: 'Vee’s fate',
        options: [
          { id: 'close', label: 'Keep Vee close, with the gang', text: 'He is sober for days at a stretch. He almost finishes a ghazal.', fx: { c13: 3, c3: 2, c7: 3 }, up: 0.0, fate: { vee: 'close' } },
          { id: 'wander', label: 'Let Vee wander the forest', text: 'He walks drunk, one random step at a time, learning her chaos.', fx: { c12: 1, c13: 1 }, up: 0.02, fate: { vee: 'wandering' } },
          { id: 'away', label: 'Send Vee away from the ports', text: 'Safer for him. Lonelier.', fx: { c7: 2, c13: 1, c3: -2 }, up: -0.01, fate: { vee: 'away' } }
        ]
      },
      {
        n: 7, title: 'Fine Print', c: 'C8 Conditions', tests: ['c8', 'c13'],
        scene: 'Off Kutch, before the tide: a sale at sea, hull to hull, beyond any port’s jurisdiction, as a British trading house once did in the 1830s. At the edge of the lanterns Gora quotes a clause only the inner circle had seen.',
        prompt: 'The clause',
        options: [
          { id: 'sea', label: 'Sell at sea off Kutch', text: 'The ledger is signed on a rolling deck. No customs officer can touch it.', fx: { c8: 5, c7: 3, c13: -4 }, up: 0.08 },
          { id: 'insure', label: 'Insure under the deviation clause', text: 'Dull, and exactly what an underwriter wants to see.', fx: { c8: 8, c1: -4, c11: -3 }, up: 0.02 },
          { id: 'nothing', label: 'Sign nothing, and change the plan', text: 'Whoever leaked it will have to guess again.', fx: { c8: -3, c13: 4, c12: 2 }, up: -0.04, tilt: { war: -0.03 } }
        ]
      },
      {
        n: 8, title: 'Weather', c: 'C9 Climate, C10 Claims', tests: ['c9', 'c6'],
        scene: 'A storm front from the west. The only calm band is the quiet corridor, and a hull of volunteers could cross it. The Katta gang steps forward, all twenty-seven. Gora’s drones may already be waiting there.',
        prompt: 'The hull',
        options: [
          { id: 'send', label: 'Send the Katta gang’s hull; Vee stays ashore', text: 'The drones show where they are. Twenty-seven names go down in the weather.', fx: { c12: 4, c10: -10, c6: -10, c13: -4 }, up: 0.12, fate: { vee: 'ashore', katta: 'lost' } },
          { id: 'hold', label: 'Hold the hull back', text: 'The gang lives. The corridor stays shut, and the drones stay hidden.', fx: { c10: 3, c6: 3, c12: -5, c7: -4 }, up: -0.06, fate: { vee: 'with his friends', katta: 'safe' } },
          { id: 'withvee', label: 'Send it, and let Vee sail with them', text: 'He chose to go. The last ghazal is never finished.', fx: { c10: -12, c6: -10, c12: 4 }, up: 0.12, fate: { vee: 'lost', katta: 'lost' } }
        ]
      },
      {
        n: 9, title: 'A Thousand Cuts', c: 'C11 Costs, C12 Current affairs', tests: ['c11', 'c12'],
        scene: 'Every cut costs coin and trust. The world is watching and sanctions tighten. An old man in grey arrives, dying. Then Gora’s small boat at the Mundra roads: he will stand down and open the routes. He will take only her.',
        prompt: 'Gora’s offer',
        options: [
          { id: 'accept', label: 'Accept Gora’s deal', text: 'Nanda goes with him. The routes open.', fx: {}, up: 0, fate: { nanda: 'went with Gora' }, ends: 'deal' },
          { id: 'refuse', label: 'Refuse', text: 'Four hundred and fifty gigawatts light the coast. Gora’s navy wavers.', fx: { c12: 6, c13: 4, c1: -3 }, up: 0.08, tilt: { war: 0.04 }, fate: { nanda: 'refused Gora' } },
          { id: 'stall', label: 'Stall, and ask the old man', text: 'Grey becomes White. It takes a night.', fx: { c12: 3, c11: -3, c13: 2 }, up: 0.04, tilt: { war: -0.04 }, fate: { nanda: 'stalled Gora' } }
        ]
      },
      {
        n: 10, title: 'The Poison and the Blessing', c: 'C13 Corruption', tests: [],
        scene: 'The churning is done and the poison rises from the sea: every bribe, every lie, the swarm’s own. Gora waits at the shore. Vee stands with the names. Someone must hold it, and this is the last bond.',
        prompt: 'Who holds the poison?',
        final: true,
        options: [
          { id: 'shiva', label: 'Let Shiva hold it', text: 'He drinks it and keeps it in his throat, and the trade goes on.', fx: {}, up: 0, fate: { poison: 'shiva' } },
          { id: 'share', label: 'Share it among all of us', text: 'Each of you carries a little, for a long time.', fx: {}, up: 0, fate: { poison: 'shared' } },
          { id: 'pass', label: 'Pass it on', text: 'Pour it into someone else’s water.', fx: {}, up: 0, fate: { poison: 'passed' } }
        ]
      }
    ],

    endings: {
      shakti: ['Shakti rises', 'Shiva holds the poison, and the trade goes on. Nanda is no longer a walk but a course: the energy that moves once the stillness has been given its due. The routes open, and the cargo moves as a line.'],
      blessed: ['Blessed, and still dark', 'Shiva holds the poison, but too much of it was yours. Nanda arrives, and the water behind her stays dark.'],
      shared: ['The network carries it', 'You spread the poison thin across everyone. Nanda arrives, and so does every other party’s share of the cost.'],
      hollow: ['Delivered, hollow', 'You passed the poison on. The cargo is delivered, the books close clean, and the sea fills slowly behind you.'],
      deal: ['The deal', 'You took Gora’s deal. The routes open and the cargo does not. Nanda goes with him, and the walk is no longer hers.'],
      longwalk: ['The long walk', 'Thirty turns and the shore is still ahead. The walk is less random than when you began, and you are still on it.']
    },
    vee: {
      lost: 'Vee sailed with them and is gone. The last ghazal was never finished.',
      ashore: 'Vee lives and carries the twenty-seven names. He forgives everyone but himself, and walks the forest at night.',
      'with his friends': 'Vee is still with the Katta gang. The ghazals are cheerful, and still unfinished.',
      close: 'Vee stayed close to the gang, sober for days at a stretch.',
      wandering: 'Vee is still in the forest, still walking.',
      away: 'Vee was sent away from the ports, and writes to Nanda from a distance.'
    },
    consignor: {
      kept: 'The House at Gwadar kept its ledger, and Gora kept a man inside it.',
      replaced: 'The house was replaced. Its old owner remembers.',
      turned: 'The man with the ledger writes for you now, and no one trusts him.'
    },
    consignee: {
      bought: 'The buyer at Dammam stayed, richer and warier.',
      walked: 'The buyer walked, and told his friends how it ended.',
      replaced: 'A new consignee at Kandla signed. Nobody checked his history.'
    }
  };
});
