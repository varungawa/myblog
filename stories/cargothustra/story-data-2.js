/* Part 2: the run, forty jars, four ports, the star, fine print, weather. */
(function (root, factory) {
  var nodes = factory();
  if (typeof module === 'object' && module.exports) module.exports = nodes;
  else (root.CargoStoryParts = root.CargoStoryParts || []).push(nodes);
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    outrun: {
      text: [
        `"Seventeen knots," I say. "Straight out. Let them chase weather."`,
        `Vivekananda does not argue, which is how I know he thinks I am wrong. The sails open on their own and the hull leans, and for a few glorious minutes I am the fastest thing on the sea.`
      ],
      chance: [
        { to: 'outrun_ok', w: 0.5, mods: [{ if: 'divided', w: 0.25 }, { if: 'war', w: -0.1 }, { if: 'late', w: -0.1 }] },
        { to: 'boarded', w: 0.5, mods: [{ if: 'divided', w: -0.25 }, { if: 'war', w: 0.1 }, { if: 'late', w: 0.1 }] }
      ]
    },

    outrun_ok: {
      text: [
        `The launches fall behind. The drones lose interest, as drones do, at the edge of their battery. I stand at the rail with the wind in my teeth and the sea going by like a promise, and for once I do not feel like cargo. I feel like a thing that is going somewhere.`
      ],
      on: { add: { harsh: 1 } },
      next: 'ports'
    },

    boarded: {
      text: [
        `They are faster than I thought. The first launch comes up on our quarter at noon and the second on the other side, and the drones come down in a flock. A boarding party swings over the rail, laughing, with long knives. The master is on his knees before I have understood that this is happening.`,
        `An officer with a singed collar looks at me where I stand in my small plain space on the deck. "Consignment," he says, as if tasting it. "With standing."`
      ],
      choices: [
        { t: `Fight them off with what's in the hold.`, to: 'boarded_fight' },
        { t: `Surrender. The cargo isn't worth the crew.`, to: 'boarded_end' }
      ]
    },

    boarded_fight: {
      text: [
        `I do not know what is in the hold except salt, and dates, and a crate I have been told not to open. I open it. It is a bad idea, and it works, for a little while.`
      ],
      chance: [
        { to: 'boarded_won', w: 0.3, mods: [{ if: 'katta', w: 0.1 }] },
        { to: 'boarded_end', w: 0.7, mods: [{ if: 'katta', w: -0.1 }] }
      ]
    },

    boarded_won: {
      text: [
        `By the time it is over the officer is in the water and his launch is on fire and I am shaking. We have lost half the crew. We have won, in the way a house wins against a flood: by still being a house.`
      ],
      on: { set: ['scarred'], add: { harsh: 2 } },
      next: 'ports'
    },

    boarded_end: {
      text: [
        `They take the cargo and the crew. They take me last. The officer reads my number off the manifest aloud, and I answer to it, because that is the only power I have, and for the first time it is not enough.`
      ],
      end: { id: 'boarded', title: 'Boarded at Sea', mood: 'dark', line: `I was sold on, as cargo is. I am told the sea at the end of it was lovely. I never saw it, because the crate had no window.` }
    },

    jars_run: {
      text: [
        `We launch forty hulls from the yard at Jaigad, dressed as oil carriers, jars lashed on deck. It is the thieves' own trick turned on them: jars with something else inside.`,
        `Gora's boarding party comes over the rail at dawn, laughing, and the first jar they open is full of oil. So is the second. So is the third. The officer in charge is still frowning at it when Morgiana, on the foredeck, lifts the oil in its great bronze ladle over the side of the hull the boarders are standing on.`,
        `And waits. There is a pause before the match. A heartbeat, longer than the plan.`
      ],
      choices: [
        { t: `Say nothing. Let her strike the match.`, to: 'jars_burn', set: ['missed_pause'] },
        { t: `"Why did you wait?" I ask her, quietly.`, to: 'jars_ask' },
        { t: `Take the match from her and strike it myself.`, to: 'jars_match', add: { harsh: 1 } }
      ]
    },

    jars_ask: {
      text: [
        `"The wind," she says. "It shifted."`,
        `The wind did not shift. I look at her, and she looks at the door, the way she always does, and I let it go. But I write the pause in my log with a small question mark beside it, the way you mark a stair that may not be there.`
      ],
      on: { set: ['noticed_pause'] },
      next: 'jars_burn'
    },

    jars_match: {
      text: [
        `I take the match from her fingers. She lets me, which I will think about later. The flame is small and very bright.`
      ],
      chance: [
        { to: 'jars_burn', w: 0.7 },
        { to: 'oil_water', w: 0.3 }
      ]
    },

    oil_water: {
      text: [
        `The oil catches wrong. It catches the jar beside me, and the deck, and the lead hull burns to the waterline in the time it takes to say so. I am in the water. Morgiana pulls me out by my collar and does not say one word.`,
        `The swarm survives. It never recovers. Gora's drones have a lit hull to follow all the way home.`
      ],
      end: { id: 'oil_water', title: 'Oil on the Water', mood: 'dark', line: `I struck the match myself because I did not trust the pause, and the pause was the least of it. The swarm became a legend without a fleet.` }
    },

    jars_burn: {
      text: [
        `The oil burns. The boarding party, who have never been burned by their own trick, go over the side in a single movement, like birds. I watch them in the water, and I am not proud of what I feel, which is joy.`,
        `Gora's officer, soaked and singed, looks up at our sails turning on their own and says that this is not a fleet. It is weather, he says, and he does not yet know how to count it. A hull of ours is boarded in return. I never learn the names of the crew.`
      ],
      next: 'ports'
    },

    ports: {
      ch: [7, 'Four Ports'],
      on: { tick: true },
      text: [
        `For a week the swarm sings. Kandla, Mundra, Dighi, Jaigad: four ports worked in a rhythm the old Japanese yards would have recognised, each hull arriving just when the crane is ready for it. The dial on Vivekananda's wall has never been this low. Morgiana marks every door with the same chalk, so Gora's scouts cannot tell which port holds the cargo.`,
        { if: 'high', t: `The markets are high, and the cranes never stop; I can feel the whole coast humming like a held note.` },
        { if: 'low', t: `The markets are low and the cranes idle between hulls, but the swarm doesn't need a loud market. It needs a rhythm.` },
        { if: 'war', t: `On the horizon, patrol launches wait in the haze, like punctuation.` },
        `I notice that I am happy. I write in my log that happiness is the thing I cannot model.`,
        { if: 'vee_friend', t: `Vee is here, among the Katta gang, sober for days at a stretch. He sits on a bollard at dusk with the wits laughing around him, and he almost writes a line. When he sees me he lifts his marker like a man raising a glass.` }
      ],
      choices: [
        { t: `Keep Vee close, with the Katta gang.`, to: 'ports_close', if: 'vee_friend' },
        { t: `Let Vee wander the forest the way he likes.`, to: 'ports_wander', if: 'vee_friend' },
        { t: `Send Vee away from the ports. They are getting dangerous.`, to: 'ports_away', if: 'vee_friend' },
        { t: `Go and see Vivekananda.`, to: 'ports_b', if: '!vee_friend' }
      ]
    },

    ports_close: {
      text: [
        `I put Vee on the Katta's bench with a cup of tea and a pencil, and tell him it is his post. He nods, solemn as a boy. The wits tease him. He laughs, which I had not seen him do, and writes a line, and crosses it out, and writes it again.`
      ],
      on: { set: ['vee_close'], add: { gentle: 1 } },
      next: 'ports_b'
    },

    ports_wander: {
      text: [
        `I tell him he can walk wherever he likes, and he looks at me as if I had given him back something he had lost. He goes into the forest at dusk with his marker and his bad knee. In the morning he is back, with a poem on his wrist that is not finished and a look of peace.`
      ],
      on: { set: ['vee_wander'] },
      next: 'ports_b'
    },

    ports_away: {
      text: [
        `He does not argue. That is how I know it hurts. He takes the bus north in the morning with one bag, and a tiny wave, and a look that I will think about for a long time.`
      ],
      on: { set: ['vee_away'], add: { harsh: 1 } },
      next: 'ports_b'
    },

    ports_b: {
      on: { give: ['card_down'] },
      text: [
        `Then the week turns. Jaigad's customs change hands overnight; a new officer arrives with orders nobody can read. In the morning Morgiana's chalk mark at Jaigad is found to differ from the other three by a single stroke, and before noon she is white-faced: her brother has been detained, she says. His release can be bought with small pieces of information.`,
        `Vivekananda hears this the way a man hears rain he predicted. He is calm. He is too calm.`,
        `I put a card in my pocket without meaning to: the one with the story on it, face down.`
      ],
      choices: [
        { t: `Sit with Morgiana and look at the paper about her brother.`, to: 'ports_audit' },
        { t: `Press Vivekananda. "Why aren't you worried?"`, to: 'ports_press' },
        { t: `Say nothing. Watch.`, to: 'star_taken' }
      ]
    },

    ports_audit: {
      text: [
        `The paper is thin. No court, no officer's name, no date I can check. "He's been detained," she says again, as if the words were a coat. It is an excellent story, and I do not think anyone has ever told it to her out loud.`,
        `I give her my tea. I turn the card over in my pocket. It says what I thought it would.`
      ],
      on: { set: ['audited'], take: ['card_down'], give: ['card_up'] },
      choices: [
        { t: `Tell her: "I think it's a lie. I don't think Gora told you this."`, to: 'ports_tell' },
        { t: `Keep it to myself, for now.`, to: 'star_taken' }
      ]
    },

    ports_tell: {
      text: [
        `She does not move. "Then he is..." "I don't know. I think he's fine." "Who...?" She looks across the quay at Vivekananda, and understands, and for the first time since I met her she does not look at a door. She looks at me.`,
        `The swarm's best week ends here. I have broken something, and I do not know what.`
      ],
      on: { set: ['told', 'no_bait'], take: ['card_up'] },
      next: 'star_taken'
    },

    ports_press: {
      text: [
        `"Why aren't you worried?" "Because I am busy." "That isn't an answer." "No," he says, "it's half of one. Trust me for a week."`,
        `I do not like how much I do.`
      ],
      on: { set: ['v_pressed'] },
      next: 'star_taken'
    },

    star_taken: {
      myth: true, title: 'The Star Taken',
      text: [
        `At the hermitage of Brihaspati, guru of the gods, the lamp is trimmed and the evening smells of ghee and crushed jasmine. Tara, his wife, a star among the stars, has come down to the tank to bathe. The Moon sees her.`,
        `He has twenty-seven wives and an appetite like a tide. He looks, and the water forgets to move. She looks back, and the wet cloth against her skin is a sentence in a language she has never been taught and understands entirely.`,
        `That night the sky holds one door open and nobody is at the lamp. Her hair is loose, his light is on her, everywhere. The hermitage knows nothing and the jasmine knows everything. There is a sweetness in it the old poets call theft, and cannot condemn.`,
        `By morning there is a war: the gods on one side and the asuras on the other, over a star. Brahma ends it. Tara goes home with a secret in her, and the secret is a son. The child will be Budha, Mercury, clever and quick, the patron of merchants.`,
        `Commerce is the child of a stolen star and a quarrel.`
      ],
      next: 'fine_print'
    },

    fine_print: {
      ch: [8, 'Fine Print'],
      on: { tick: true },
      text: [
        `Off Kutch, before the tide, the swarm will do what a British trading house did in the 1830s: sell its cargo from ships anchored beyond any port's jurisdiction, so that no customs officer can touch the sale. Tokens for the cargo will change hands hull to hull, in the dark, and by the time they reach a port they will belong to someone else.`,
        `It is a duel of clauses. There are the insurance conditions, the warranties, the deviation clause, the delay clause, the salvage clause. An underwriter in Mumbai once read a policy aloud to me, bored, without understanding that he was describing a battle plan.`
      ],
      choices: [
        { t: `Use the letter of credit to back the sale.`, to: 'fp_credit', if: 'item:credit' },
        { t: `Sell at sea, off Kutch, hull to hull.`, to: 'fp_sea' },
        { t: `Insure it all under the deviation clause first.`, to: 'fp_insure' },
        { t: `Sign nothing. Change the plan.`, to: 'fp_nothing' }
      ]
    },

    fp_credit: {
      text: [
        `The letter of credit stands behind the sale like a wall. The bank officer who wrote it is the most annoyed man in Gujarat, and I love him.`
      ],
      on: { set: ['insured'], take: ['credit'], add: { gentle: 1 } },
      next: 'clause_leak'
    },

    fp_sea: {
      text: [
        `The ledger is signed on a rolling deck by lantern light, and it is the most beautiful thing I have ever seen: lanterns on black water, hull to hull, the tide a clock, nobody's writ running anywhere.`
      ],
      on: { set: ['sold_at_sea'], add: { harsh: 1 } },
      next: 'clause_leak'
    },

    fp_insure: {
      text: [
        `It is dull, and exactly what an underwriter wants to see. We are slow, and the tide waits for no clause, but the tokens we sell are insured, and when I sign my name I feel the small quiet pleasure of being boring on purpose.`
      ],
      on: { set: ['insured'], add: { gentle: 1 } },
      next: 'clause_leak'
    },

    fp_nothing: {
      text: [
        `I tell Vivekananda no, and he hears me, which does not always happen. The plan changes in the space of an hour. By midnight the hulls are somewhere else.`
      ],
      on: { set: ['plan_changed'], add: { gentle: 1 } },
      next: 'clause_leak'
    },

    clause_leak: {
      text: [
        `At the edge of the lanterns a small launch idles. In its stern stands a man with a crooked leg, one eye and a hook for a hand: East India Gora, come to watch his own defeat. He quotes a clause, word for word, from a plan only the inner circle has ever seen.`,
        { if: 'plan_changed', t: `It is the old plan. The sea where he thinks we will be is empty. His face is a pleasure to watch, for as long as it takes him to look at me.` },
        `There is a file. Morgiana had the file. And Vivekananda, I now remember, left it on the table, within her reach.`
      ],
      choices: [
        { t: `Confront Vivekananda. "You left it where she could reach it."`, to: 'confront_v' },
        { t: `Say nothing. The plan is the plan.`, to: 'weather' }
      ]
    },

    confront_v: {
      text: [
        { if: 'told', t: `"She knows," I say. "I told her." He is quiet for a long time. "Then I need a new plan," he says, and I realise I have broken it, and that he is, very slightly, proud.` },
        { if: '!told', t: `"Yes," he says at once, because he will not lie to the person who has the right to know. "Gora trusts an informant who is being squeezed. An informant he trusts can be steered. Her brother was never in danger. I arranged the story. And I need a hull to go down, Nanda. One hull, so that his drone carrier shows where it is."` },
        { if: '!told', t: `It is the half-truth of an old story, the one where a man is told the elephant is dead, *the man or the elephant*, and believes what he needs to. It is a statement that is not false, and that kills.` }
      ],
      choices: [
        { t: `"No. I won't be the bait. Find another way."`, to: 'cv_bait', if: '!told' },
        { t: `"Then do it, and do it clean. I'll hold the door."`, to: 'cv_accept', if: '!told' },
        { t: `"Tell Morgiana the truth. Now."`, to: 'cv_tell', if: '!told' },
        { t: `Say nothing more, and go.`, to: 'weather', if: 'told' }
      ]
    },

    cv_bait: {
      text: [
        `"No," I say. "Find another way."`,
        `He is silent for a long moment. Then he nods, and I see something in his face that is almost relief. "I was hoping you would say that," he says. "It is the only reason I told you."`
      ],
      on: { set: ['no_bait'], add: { gentle: 1 } },
      next: 'weather'
    },

    cv_accept: {
      text: [
        `"Then do it," I say. "And do it clean." He nods once, like a man signing something. I will carry that sentence with me, and I know exactly what it cost.`
      ],
      on: { set: ['trust_v', 'accepted_plan'], add: { harsh: 1 } },
      next: 'weather'
    },

    cv_tell: {
      text: [
        `I go and find Morgiana, and I tell her everything: the story, the file, the hull. She listens to the end without moving. Then she says, quietly, "Thank you for not letting me do it for nothing." She goes to chalk a door.`
      ],
      on: { set: ['told', 'no_bait'], take: ['card_down', 'card_up'], add: { gentle: 1 } },
      next: 'weather'
    },

    weather: {
      ch: [9, 'Weather'],
      on: { tick: true },
      text: [
        `A storm front comes in from the west, and in a storm every hull is a stranger again. The sails, which know two thousand years of winds, have never seen this one. The hulls scatter.`,
        `There is one band of calm: the quiet corridor, a long narrow road through the weather where the swarm could regroup. A hull of volunteers could cross it. The Katta gang steps forward, all twenty-seven of them in nine groups of three, the wits cracking their last jokes, the frightened ones going first. I cannot say why my throat is tight.`,
        { if: ['!told', '!no_bait'], t: `Somewhere over the water something is already waiting. I do not know that. I only feel it, the way you feel a stair that isn't there.` },
        { if: 'war', t: `And the war has not gone away. It is the weather behind the weather.` }
      ],
      choices: [
        { t: `Send the Katta gang's hull through the corridor.`, to: 'send_hull' },
        { t: `Hold the hull back. Nobody crosses.`, to: 'hold_hull' },
        { t: `Ask Vivekananda for another way across.`, to: 'decoy', if: ['no_bait'] }
      ]
    },

    send_hull: {
      text: [
        `"Send them," I say. It is the shortest sentence I have ever spoken, and I hear it go out across the water.`,
        { if: 'vee_friend', t: `Vee is on the quay with his marker uncapped and a face like a man at a wake. "Let me go with them," he says.` }
      ],
      choices: [
        { t: `Let Vee sail with his friends.`, to: 'hull_with_vee', if: 'vee_friend' },
        { t: `Keep Vee ashore.`, to: 'hull_router', if: 'vee_friend', set: ['vee_ashore'] },
        { t: `Watch them go.`, to: 'hull_router', if: '!vee_friend' }
      ]
    },

    hull_with_vee: {
      route: [
        { if: 'told', to: 'hull_saved', set: ['vee_sailed_safe'] },
        { if: 'no_bait', to: 'hull_saved', set: ['vee_sailed_safe'] },
        { to: 'sailed' }
      ]
    },

    sailed: {
      text: [
        `They go into the weather singing. Vee is at the bow with his hair in his eyes, and for a minute I see him as he must once have been, at school, with twenty-six people he loved.`,
        `Something is waiting in the corridor. It had been waiting for hours. The attack is over almost before I understand it. A hull goes down in the dark, and with it twenty-seven names, and the man who wrote them on his wrist.`
      ],
      end: { id: 'sailed', title: 'Sailed Into Weather', mood: 'dark', line: `I let Vee go with them, and he never came back. The last ghazal was never finished. I carry it, half-made, in my log, and I walk on, because there is nothing else to do.` }
    },

    hull_router: {
      route: [
        { if: 'told', to: 'hull_saved' },
        { if: 'no_bait', to: 'hull_saved' },
        { to: 'hull_lost' }
      ]
    },

    hull_saved: {
      text: [
        `Morgiana, who now knows the truth, gives Gora's people a false corridor. The drones wait where she told them to, and the hull comes through where she did not. We hear it over the water, the whole Katta gang, singing something rude and tuneless in nine voices.`,
        `Twenty-seven friends come ashore wet and laughing. The drones return to their carrier empty-handed, and for the first time we can see where it sits.`
      ],
      on: { set: ['gang_alive', 'carrier_known'], add: { gentle: 1 } },
      next: 'cuts'
    },

    hull_lost: {
      on: { set: ['gang_lost', 'carrier_known'], take: ['card_down', 'card_up'], give: ['card_flipped'] },
      text: [
        `The attack is over almost before it is understood. A drone wave, shaped like a flock of birds, was already waiting in the corridor. It had been waiting for hours. It knew the corridor, and so did only three people.`,
        `A hull goes down in the dark and the weather, and with it twenty-seven names. I see it from the deck of a different ship. The sea does not tell me whose hull it was.`,
        `In my pocket the face-down card turns itself over. It was a story, and I knew it was one.`,
        { if: 'audited', t: `I audited that card at Jaigad. I knew, or nearly knew. I sent them anyway.` }
      ],
      next: 'loss'
    },

    hold_hull: {
      text: [
        `"Hold it," I say. "Nobody crosses." There is a silence like a held breath, and then twenty-seven people let it go at once.`,
        `The drones wait at the quiet corridor for hours for a hull that never comes. The swarm scatters in the storm. At dawn Jaigad's customs close the port altogether, and it is gone, just like that, a door that stays shut.`,
        `The Katta gang is alive and furious. Vivekananda looks at me for a long time. "You saved twenty-seven," he says, "and lost a port." He does not say which of those he would have chosen.`
      ],
      on: { set: ['hull_held', 'gang_alive'], add: { gentle: 1, harsh: 0 }, war: true },
      next: 'quiet_loss'
    },

    decoy: {
      text: [
        `"Another way," says Vivekananda, and his face does the thing it does when he is pleased with himself and ashamed of it. "Three empty hulls under sail in the corridor. And the Katta takes the coast road home on foot at dusk, singing. Gora's drones will follow the sails."`,
        `"Will it work?" I ask.`,
        `"It is a plan," he says. "It is not a promise."`
      ],
      chance: [
        { to: 'decoy_ok', w: 0.7, mods: [{ if: 'told', w: 0.2 }, { if: 'war', w: -0.1 }] },
        { to: 'decoy_fail', w: 0.3, mods: [{ if: 'told', w: -0.2 }, { if: 'war', w: 0.1 }] }
      ]
    },

    decoy_ok: {
      text: [
        `The drones follow the sails. Three empty hulls burn gloriously in the corridor, and nobody is on them. The Katta gang comes home along the coast road at dawn, singing the same rude song in nine voices. And where the drones return to is a position, a precise one, on a map.`
      ],
      on: { set: ['gang_alive', 'carrier_known'], add: { gentle: 1 } },
      next: 'cuts'
    },

    decoy_fail: {
      text: [
        `The drones do not follow the sails. They go straight past them as if they had never been fooled, and I understand, with a cold lurch, that someone told them. Three empty hulls burn for nothing. The Katta gang is safe on the coast road, which is all I can say for the plan.`
      ],
      on: { set: ['gang_alive'], add: { harsh: 1 } },
      next: 'cuts'
    },

    quiet_loss: {
      text: [
        `Morgiana does not look at the doors for the whole of the next day. She sits at the end of the quay with her hands in her lap and chalk on her sleeve, and when I sit down beside her she says, "I was meant to have the route." She stops. "I think I gave it to someone."`
      ],
      choices: [
        { t: `Tell her what I suspect about her brother.`, to: 'quiet_tell' },
        { t: `Sit with her. Say nothing.`, to: 'cuts' }
      ]
    },

    quiet_tell: {
      text: [
        `"I think the story was a lie," I say. "I don't think it was Gora's." She looks at me, and then across the quay at Vivekananda, and then back. She is not angry. That is the worst of it. She is only very quiet.`
      ],
      on: { set: ['told'] },
      next: 'cuts'
    }
  };
});
