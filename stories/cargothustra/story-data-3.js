/* Part 3: the loss, a thousand cuts, grey to white, the poison and the blessing, and every ending's epilogue. */
(function (root, factory) {
  var nodes = factory();
  if (typeof module === 'object' && module.exports) module.exports = nodes;
  else (root.CargoStoryParts = root.CargoStoryParts || []).push(nodes);
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    loss: {
      ch: [10, 'The Loss'],
      text: [
        `In an inquiry room at Mundra a surveyor reads the findings in a flat voice: weather, route, drones, and a manifest with a chalk stroke on it that does not match the other three. The room turns on Morgiana, and she does not deny it.`,
        `Then her brother is found, alive and well in his own kitchen in his own town, and the pieces fall into place in the worst possible order. He was never detained. The story was built. Vivekananda says so in front of everyone, because he will not lie to the person who has the right to know. He did not know who was on the hull. He chose it because it carried volunteers.`,
        `Then the surveyor reads the crew list, and the room stops.`,
        { if: 'vee_friend', t: `Vee is at the back of the room, where he has been standing since the beginning, with a marker in his hand and no pen. He listens to the names. Chitale. Chinmay. Chopra. Charudutta. ChinnaSwamy. Chabria. Each one a person I met alive at the tea stall, and with each name Vee takes a step toward the door.` },
        { if: '!vee_friend', t: `At the back of the room stands a man I have seen once at a fence, with a marker and no pen. He listens to the names, Chitale, Chinmay, Chopra, Charudutta, ChinnaSwamy, Chabria, and with each one he takes a step toward the door.` }
      ],
      choices: [
        { t: `"I know it wasn't you, Morgiana."`, to: 'loss_forgive' },
        { t: `"You gave them the route."`, to: 'loss_condemn' },
        { t: `Say nothing. Go after Vee.`, to: 'vee_forest' }
      ]
    },

    loss_forgive: {
      text: [
        `She looks up as if I had spoken in a language she had stopped hoping to hear. She does not cry. She puts her hand flat on the table, on the chalk-marked manifest, and says, "Thank you," and nothing else.`
      ],
      on: { set: ['forgave_m'], add: { gentle: 1 } },
      next: 'vee_forest'
    },

    loss_condemn: {
      text: [
        `I hear myself say it. It is true, and it is not the whole truth, and I know the difference, and I say it anyway. Morgiana goes very still. She picks up her chalk from the table, one piece, carefully, and goes out.`
      ],
      on: { set: ['condemned_m'], add: { harsh: 1 } },
      next: 'vee_forest'
    },

    vee_forest: {
      text: [
        `By the last name he is out of the room and out of the building and walking, drunk, back into the forest. His steps are wilder than they were on the first night. I stand in the door and watch him go.`
      ],
      choices: [
        { t: `Follow Vee into the forest.`, to: 'forest_follow' },
        { t: `Let him go. Someone has to stay at the table.`, to: 'viraha', set: ['vee_alone'] }
      ]
    },

    forest_follow: {
      text: [
        `The forest has no paths. I find him by the sound of his knee. He is sitting against a tree, which is a thing I have never seen him do.`,
        `"I did not go with them," he says. "I never go with anyone." His shame is physical; he cannot sit still, even now. His hand is going up and down on his knee.`,
        `I sit down beside him. It is dark, and the trees have faces. I could stay.`
      ],
      choices: [
        { t: `Stay with him and walk. No plan, no table.`, to: 'forest_again' },
        { t: `Bring him back to the quay. The work isn't done.`, to: 'viraha', set: ['vee_brought'] }
      ]
    },

    forest_again: {
      text: [
        `We walk until the forest has no beginning. I stop being cargo somewhere in the second week, and nobody notices, least of all me. I take a step because the dark tells me to, and then another. It is a random walk, and I am not trying to make it less.`
      ],
      end: { id: 'forest_again', title: 'The Forest Again', mood: 'strange', line: `We are happy and unhappy in the same breath. Years later the lane carts still talk in a girl's voice about the sea, and nobody quite knows whose it is.` }
    },

    viraha: {
      myth: true, title: 'Viraha',
      text: [
        `Radha waits on the bank of the Yamuna, in the night. The river is slow and black and full of small lamps, and she has been waiting since the moon was a rind.`,
        `He said he would come. He always says it. The flute is a rumour on the other side of the water, and every time it stops she thinks it is the sound of a boat. She puts her hand in the river. It is the temperature of a body that has just left.`,
        `Krishna is at the court of kings, giving counsel, winning a war with a sentence that is not false. He is also, at the same time, nowhere. He is the strategist who has just given away a hull. He is the lover who does not come.`,
        `The river and the sea are one image. She waits, and the waiting is a kind of love, and she has never been so near him.`
      ],
      next: 'cuts'
    },

    cuts: {
      ch: [11, 'A Thousand Cuts'],
      on: { tick: true },
      text: [
        `Every cut costs coin and trust. The bill is paid in a currency this story has not used before: small coins, small favours, small acts of faith, from a hundred small ports.`,
        { if: 'carrier_known', t: `We know where Gora's drone carrier sits now. It is a dot on a map, with a ring around it.` },
        { if: 'gang_alive', t: `The Katta gang is loud and alive at the back of every room, and I have never been so glad of an interruption.` },
        { if: 'gang_lost', t: `The Katta gang is gone, and its absence sits in every scene.` },
        `Vivekananda cannot strike with the swarm; that is what Gora expects. He does what the Marathas did against fifty thousand when the enemy was too large to meet: he cuts. Each small hull, each courier on a bicycle in the old angadia tradition, each shopkeeper who holds a parcel for a night, takes a little from Gora's lines, and none of it can be seen from above.`
      ],
      choices: [
        { t: `A thousand small cuts. Couriers, shopkeepers, bicycles. Slow, and nobody sees it.`, to: 'cuts_small' },
        { t: `One blow at the drone carrier, while we know where it is.`, to: 'cuts_blow', if: 'carrier_known' },
        { t: `Send word to Gora. Talk.`, to: 'cuts_talk' },
        { t: `Ask Morgiana to chalk every door the same again.`, to: 'cuts_chalk', if: ['!condemned_m', 'told'] },
        { t: `Ask Morgiana to chalk every door the same again.`, to: 'cuts_chalk', if: ['!condemned_m', 'forgave_m', '!told'] }
      ]
    },

    cuts_small: {
      text: [
        `It is the least heroic war ever fought. A woman in Dighi holds a parcel for a night. A boy on a bicycle takes a letter nowhere near the coast. Forty thousand small acts of trust, none of which can be bombed from above, because there is nothing to see.`
      ],
      on: { set: ['small_cuts'], add: { gentle: 1 } },
      next: 'gandalf'
    },

    cuts_blow: {
      text: [
        `It is a single blow, and I am on the boat that delivers it. We come out of the dark at the carrier like a hand out of a sleeve.`
      ],
      chance: [
        { to: 'blow_ok', w: 0.55, mods: [{ if: 'war', w: -0.1 }, { if: 'small_cuts', w: 0.1 }] },
        { to: 'blow_fail', w: 0.45, mods: [{ if: 'war', w: 0.1 }] }
      ]
    },

    blow_ok: {
      text: [
        `The carrier burns, and the drones go down with it like birds in a net. I am not proud. But the sea, for one night, is quiet, and the quiet goes all the way to the horizon.`
      ],
      on: { set: ['carrier_burned'], peace: true, add: { harsh: 1 } },
      next: 'gandalf'
    },

    blow_fail: {
      text: [
        `Its escort is waiting. We lose two hulls and most of a night, and when we limp home I understand that Gora has been learning, too. He is not a man who sits still while he is cut.`
      ],
      on: { set: ['blow_failed'], war: true, add: { harsh: 1 } },
      next: 'gandalf'
    },

    cuts_talk: {
      text: [
        `Gora answers within the hour, which tells me he has been waiting to be asked. He is not what I thought: he is tired, and clever, and very much alone. He says very little. But we are talking, and while we talk there is no firing.`
      ],
      on: { set: ['talked'], add: { gentle: 2 } },
      next: 'gandalf'
    },

    cuts_chalk: {
      text: [
        `Morgiana chalks every door the same again, knowing she was used, and this time as her own choice. Gora's drones, which know the doors, go quiet, as if somebody had turned the lights off in a house they thought was theirs.`
      ],
      on: { set: ['m_ally'], add: { gentle: 1 } },
      next: 'gandalf'
    },

    gandalf: {
      text: [
        `At the end of the week, at the last small port, a figure in grey climbs off the last hull: an old man with a staff, and a cough like a door being forced. He asks for me by name. Gandalf of Gujarat has come, and he is dying.`
      ],
      choices: [
        { t: `Tend him through the night.`, to: 'g_tend' },
        { t: `Ask him now for the power he can call. We don't have time.`, to: 'g_press' },
        { t: `Send him to rest, and fight on without him.`, to: 'g_rest' }
      ]
    },

    g_tend: {
      text: [
        `I sit by him through the night. He does not say much. Near dawn he says, "You are the only one who has asked me nothing." I do not know what to answer.`
      ],
      on: { set: ['gandalf_tended'], add: { gentle: 1 } },
      next: 'white'
    },

    g_press: {
      text: [
        `"There isn't time," I say. He looks at me for a very long time, the way an old man looks at the last of a good thing, and says, "No. There never is." He rises. He goes.`
      ],
      on: { set: ['gandalf_pressed'], add: { harsh: 1 } },
      next: 'white'
    },

    g_rest: {
      text: [
        `"Rest," I say. He smiles, and for a moment looks like himself, and I do not see him for three days.`
      ],
      on: { set: ['gandalf_rested'] },
      next: 'white'
    },

    white: {
      ch: [12, 'Grey to White'],
      on: { tick: true },
      text: [
        `The world is watching. Gora's embargo has become a headline, the swarm has become a rumour, and the volatility of both has put every price on earth out of true.`,
        `At a power station on a mountain pass there is a thing under Gora's whole enterprise, made of embargoes, debts and old grievances: a creature of fire. The old man meets it on the lip of the pass, with his staff, in the grey.`
      ],
      chance: [
        { to: 'white_ok', w: 0.1, mods: [{ if: 'gandalf_tended', w: 0.75 }, { if: 'gandalf_pressed', w: 0.35 }] },
        { to: 'white_fall', w: 0.9, mods: [{ if: 'gandalf_tended', w: -0.75 }, { if: 'gandalf_pressed', w: -0.35 }] }
      ]
    },

    white_ok: {
      text: [
        `He falls. I have read that beat before, and I trust it. He returns in white, with a clarity that frightens even Vivekananda.`,
        `Like Rohan riding to Gondor, four hundred and fifty gigawatts of power from the east answer his call: a line of light across a continent. Gora's navy, a navy in name only, wavers. The pirates at the edge of his fleet look at the lit coast, and at the flag on their own sleeves, and some of them lower their guns.`
      ],
      on: { set: ['white'] },
      next: 'gora_strong'
    },

    white_fall: {
      text: [
        `He falls, and does not return. I hold his hand until it is only a hand. The creature of fire goes back down, and the power does not come, and the coast stays dark.`,
        `Gora's navy does not waver. It never had a reason to.`
      ],
      on: { set: ['gandalf_dead'], war: true },
      next: 'gora_weak'
    },

    gora_strong: {
      text: [
        `Then Gora himself comes to the Mundra roads, alone, in a small boat, with his hook raised in greeting. He has never looked so tired.`,
        `"I will stand down," he says. "I will open the routes. I will take only one thing."`,
        `"What?" I ask, though I know.`,
        `"You."`
      ],
      choices: [
        { t: `Show him his own clerk's ledger page. "You have a man in my house. I have a page in yours."`, to: 'gora_ledger', if: 'item:ledger' },
        { t: `Accept his deal.`, to: 'deal' },
        { t: `Refuse.`, to: 'poison_a', set: ['refused_gora'], add: { harsh: 1 } },
        { t: `Tell him I need a night to think.`, to: 'poison_a', set: ['stalled_gora'], add: { gentle: 1 } }
      ]
    },

    gora_weak: {
      text: [
        `Then Gora comes to the Mundra roads, alone, in a small boat, hook raised. He does not look tired. He looks like a man who has won and is trying to be polite about it.`,
        `"I will stand down," he says. "I will open the routes. I will take one thing only. You."`
      ],
      choices: [
        { t: `Show him his own clerk's ledger page. "You have a man in my house. I have a page in yours."`, to: 'gora_ledger', if: 'item:ledger' },
        { t: `Accept his deal.`, to: 'deal' },
        { t: `Refuse.`, to: 'still' },
        { t: `Tell him I need a night to think.`, to: 'still' }
      ]
    },

    gora_ledger: {
      text: [
        `I put the page on the water between our boats. He reads it, one-eyed, in the light of his own lamp, and then he laughs: a short, genuine bark, the first I have heard from him.`,
        `"A man in my house," he says. "Yes. I see." He is quiet for a time. "You are the first one who has ever shown me a mirror." He does not accept, and he does not refuse. He rows away, and I am left in the quiet, with the page gone and the sea still holding it.`
      ],
      on: { set: ['ledger_used', 'stalled_gora'], take: ['ledger'], add: { gentle: 2 } },
      next: 'poison_a'
    },

    deal: {
      text: [
        `I get into the small boat. It is so easy. The routes open behind me, one by one, like lamps coming on in a city at dusk, and Gora does not look at me, which I take for courtesy.`,
        `There is a window in the boat. I wanted a window. It is not the window I meant.`
      ],
      end: { id: 'deal', title: 'The Deal', mood: 'dark', line: `The routes are open. The cargo is not. I am in a house with a view of the sea that I can see and never reach, and the walk is no longer mine.` }
    },

    still: {
      text: [
        `"No," I say, or "not yet," or nothing, and he rows away, and the war goes on.`,
        `The swarm becomes a rumour, and the rumour becomes a habit. A thousand cuts, still. I stop being sure what I am carrying, or for whom.`
      ],
      end: { id: 'still', title: 'A Thousand Cuts, Still', mood: 'mixed', line: `I never reach the sea's edge. I am the cargo of a trade that does not end, and the war and the market go up and down together like a pulse. I am, I think, alive.` }
    },

    poison_a: {
      ch: [13, 'The Poison and the Blessing'],
      on: { tick: true },
      text: [
        `There is an old story about the churning of the ocean. The sea is churned, treasures rise, and last of all comes the poison. Here the poison is corruption. Every bribe, every favour, every lie that the swarm and its enemies told rises from the bottom of the sea like a dark tide.`,
        { if: 'buyer_paid', t: `I can see the money I paid the buyer at Dammam, and the paper trail behind it, thin as a vein.` },
        { if: 'label_stood', t: `I can see the label that stood: *aid*, in a customs officer's slow voice.` },
        { if: 'cassim_shut', t: `I can see a man shut in a cave with his arms full.` },
        { if: 'gang_lost', t: `I can see twenty-seven names.` },
        { if: 'cons_turned', t: `I can see a boy of nineteen who will never be forgiven by either side.` },
        `Gora waits on the shore. Vee stands with the names. Vivekananda is at the end of the quay, hands empty. The poison reaches the first stone.`
      ],
      choices: [
        { t: `Forgive Vivekananda, knowing what it is, and what it is not.`, to: 'poison_b', set: ['forgave_v'] },
        { t: `I cannot forgive him. Not yet.`, to: 'poison_b' }
      ]
    },

    poison_b: {
      route: [
        { if: ['forgave_v', 'white', 'peace'], to: 'gora_asks' },
        { if: ['forgave_v', 'white', 'harsh<=1'], to: 'gora_asks' },
        { to: 'poison_c' }
      ]
    },

    gora_asks: {
      text: [
        `Gora comes up the quay without his hook. He has hung it on a rope by the water, like a man hanging up a coat. His sailors have taken off their caps.`,
        `"I do not ask for you," he says. "I ask to follow."`
      ],
      choices: [
        { t: `Let him follow.`, to: 'poison_c', set: ['gora_follows'] },
        { t: `Send him away.`, to: 'poison_c' }
      ]
    },

    poison_c: {
      text: [
        `The poison is at the second stone. Someone has to hold it, and there is no one left who hasn't helped to make it.`,
        { if: 'gora_follows', t: `Gora stands a little behind me, and for once does not say anything at all.` }
      ],
      choices: [
        { t: `Let Shiva hold it.`, to: 'p_shiva' },
        { t: `Share it among all of us.`, to: 'p_share' },
        { t: `Pass it on. Pour it into someone else's water.`, to: 'p_pass' }
      ]
    },

    p_shiva: {
      route: [
        { if: ['gora_follows', 'forgave_v'], to: 'end_gora_follows' },
        { if: 'forgave_v', to: 'end_shakti' },
        { to: 'end_blessed' }
      ]
    },

    end_gora_follows: {
      text: [
        `Shiva takes it. He drinks the poison and keeps it in his throat, as he did at the beginning of the world, and the trade goes on. From the blessing Shakti is made: not a walk any longer but a course, the energy that moves once the stillness has been given its due.`,
        `Gora's ship turns in the roads and follows the swarm out of port. The routes open. The random walk narrows to a line, and the line, at last, has a direction.`,
        { if: 'gang_lost', t: `Vee reads the twenty-seven names against the twenty-seven mansions of the Moon, and finds the one star that agrees with his madness. He forgives Vivekananda, and never himself. Shiva places the waning crescent on the Moon's head, not to cure the curse but to give it a home.` },
        { if: '!gang_lost', t: `Vee reads the sky with the Katta gang, twenty-seven of them, and finds the one star among the mansions of the Moon that agrees with his madness. Shiva places the waning crescent on the Moon's head, not to cure the curse but to give it a home.` }
      ],
      end: { id: 'gora_follows', title: 'Gora Follows', mood: 'good', epi: true, line: `The book ends on the Moon, not at the full, over a calm sea, and a ship leaving harbour on a course. I am on it. There is a window.` }
    },

    end_shakti: {
      text: [
        `Shiva takes it. He drinks the poison and holds it in his throat, as he did at the beginning of the world, and the trade goes on. From the blessing Shakti is made: not a walk any longer but a course, the energy that moves once the stillness has been given its due.`,
        `The routes open, but slowly, and Gora does not follow. The war becomes a negotiation, and the negotiation becomes a habit.`,
        { if: 'gang_lost', t: `Vee reads the twenty-seven names against the twenty-seven mansions of the Moon and finds the one star that agrees with his madness. He forgives Vivekananda, and never himself.` },
        { if: '!gang_lost', t: `Vee reads the sky with the Katta gang and finds the one star that agrees with his madness. He forgives everyone but himself.` }
      ],
      end: { id: 'shakti', title: 'Shakti Rises', mood: 'good', epi: true, line: `I am no longer a walk. I am a course. The sea is wide and the horizon recedes each time I reach it, and I would not have it any other way.` }
    },

    end_blessed: {
      text: [
        `Shiva takes it. He drinks the poison and holds it in his throat, but too much of it was mine, and I did not forgive when I could have, and the water behind me stays dark.`,
        `I am delivered. I am blessed, and not forgiven, and not yet able to forgive.`
      ],
      end: { id: 'blessed_not_forgiven', title: 'Blessed, Not Forgiven', mood: 'mixed', epi: true, line: `I arrive. Vivekananda stays at the end of the quay with his hands empty, and I do not walk down to him. The poison is held, and the grudge is mine.` }
    },

    p_share: {
      text: [
        `I take a little of it, and Vee takes a little, and Vivekananda, and Morgiana if she is here, and the Katta if they are, and Gora's sailors, one by one, with their caps in their hands. Each of us carries a share, for a long time, thinly, in the throat.`
      ],
      end: { id: 'network', title: 'The Network Carries It', mood: 'good', epi: true, line: `Nobody is blessed. Everybody is a little poisoned, and all of us are alive. It is the oldest kind of trade there is, and I have never been so proud of anything.` }
    },

    p_pass: {
      text: [
        `I pass it on. It is easy, and nobody stops me. I pour it into someone else's water, and the books close clean, and the cargo is delivered.`
      ],
      end: { id: 'hollow', title: 'Delivered, Hollow', mood: 'mixed', epi: true, line: `I am delivered. The sea fills slowly behind me, and I tell myself that is not mine. I am very good at telling myself things.` }
    },

    _meta: {
      start: 'moon',
      items: {
        credit: 'The letter of credit',
        chit: 'The Katta chit',
        ledger: `Gora's ledger page`,
        card_down: `Morgiana's story, face down`,
        card_up: `Morgiana's story, unverified`,
        card_flipped: `Morgiana's story: it was a lie`
      },
      chapters: { 1: 'forest', 2: 'gate', 3: 'gwadar', 4: 'dammam', 5: 'cave', 6: 'swarm_plan', 7: 'ports', 8: 'fine_print', 9: 'weather', 10: 'loss', 11: 'cuts', 12: 'white', 13: 'poison_a' },
      // what a reader who jumps straight to a chapter is assumed to have done before it
      jumpFlags: {
        ports: { set: ['vee_friend', 'katta'] },
        fine_print: { set: ['vee_friend', 'katta'] },
        weather: { set: ['vee_friend', 'katta'] },
        loss: { set: ['vee_friend', 'katta', 'gang_lost', 'carrier_known'] },
        cuts: { set: ['vee_friend', 'katta', 'gang_lost', 'carrier_known'] },
        white: { set: ['vee_friend', 'katta', 'gang_lost', 'gandalf_tended'] },
        poison_a: { set: ['vee_friend', 'katta', 'gang_lost', 'white'] }
      },
      epilogue: [
        { if: 'gang_lost', t: `Vee never finished a ghazal after that, and never stopped starting one.` },
        { if: ['gang_alive', 'vee_friend'], t: `Vee is still with the Katta gang. The ghazals are cheerful, and still unfinished.` },
        { if: 'vee_away', t: `Vee writes to me from a long way off, in a hand that is not quite steady.` },
        { if: 'vee_wander', t: `Vee still walks the forest at night, one random step at a time.` },
        { if: 'cons_kept', t: `The House at Gwadar kept its ledger, and Gora kept a man inside it.` },
        { if: 'cons_replaced', t: `The old house at Gwadar remembers that it was replaced.` },
        { if: 'cons_turned', t: `The clerk at Gwadar writes for me now, and nobody trusts him.` },
        { if: 'buyer_paid', t: `The buyer at Dammam stayed, richer and warier.` },
        { if: 'buyer_walked', t: `The buyer at Dammam walked, and told his friends how it ended.` },
        { if: 'buyer_new', t: `A new consignee at Kandla signed, and nobody checked his history.` },
        { if: 'cassim_shut', t: `Cassim was never seen again.` },
        { if: 'cassim_saved', t: `Cassim paid off his debts slowly, and never quite forgave himself for not being greedier.` },
        { if: 'told', t: `Morgiana chalks every door the same, and now it is her own choice.` },
        { if: ['audited', '!told'], t: `I audited Morgiana's story and kept it to myself. She never found out I knew.` },
        { if: 'condemned_m', t: `Morgiana left the ports at dawn and did not say where.` },
        { if: 'gandalf_dead', t: `They buried the old man in grey, because it was the only colour he had left.` },
        { if: 'white', t: `The old man in white still sits at the last small port, and still says he is dying.` }
      ]
    }
  };
});
