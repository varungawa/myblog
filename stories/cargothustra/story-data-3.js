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
        { if: 'vee_survivor', t: `Vee is in the room in a borrowed blanket, with a cup of tea he has not touched. He is the only one the sea gave back. He listens to the names. Chitale. Chinmay. Chopra. Charudutta. ChinnaSwamy. Chabria. Each one a person he went to school with, and with each name Vee does not move at all, which is worse than any step.` },
        { if: ['vee_friend', '!vee_survivor'], t: `Vee is at the back of the room, where he has been standing since the beginning, with a marker in his hand and no pen. He listens to the names. Chitale. Chinmay. Chopra. Charudutta. ChinnaSwamy. Chabria. Each one a person I met alive at the tea stall, and with each name Vee takes a step toward the door.` },
        { if: '!vee_friend', t: `At the back of the room stands a man I have seen once at a fence, with a marker and no pen. He listens to the names, and with each one he takes a step toward the door.` }
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
        `Every cut costs coin and trust. Vivekananda cannot strike with the swarm; that is exactly what Gora wants. So he does what the Marathas did against fifty thousand when the enemy was too large to meet: guerrilla war. *Ganimi kava.* Not one blow but a thousand, small and patient, each taking something Gora thought was his. His customs. His money. His convoys. His doors. Slowly and steadily, until he is holding an empire made of nothing.`,
        { if: 'gang_alive', t: `The Katta gang is loud and alive at the back of every room, and I have never been so glad of an interruption.` },
        { if: 'gang_lost', t: `The Katta gang is gone, and its absence sits in every scene.` },
        { if: 'carrier_known', t: `We know where Gora's drone carrier sits, and we leave it alone. A thing you know the position of is a thing you can wait for.` }
      ],
      next: 'cuts_hub'
    },

    cuts_hub: {
      text: [
        `Where do we cut first?`,
        { if: 'front_customs', t: `His customs now answer, quietly, to someone else.` },
        { if: 'front_money', t: `His creditors have taken their paper elsewhere.` },
        { if: 'front_convoys', t: `His convoys do not always arrive.` },
        { if: 'front_doors', t: `His drones cannot find the right door.` }
      ],
      choices: [
        { t: `His customs. The officers at Jaigad and Kandla who answer to him, one at a time.`, to: 'f_customs', if: '!front_customs' },
        { t: `His money. The angadia carry his creditors' paper somewhere else.`, to: 'f_money', if: '!front_money' },
        { t: `His convoys. The Katta's pirate hull and the sea-wolves take them at the edges.`, to: 'f_convoys', if: '!front_convoys' },
        { t: `His doors. Morgiana chalks every door the same again.`, to: 'f_doors', if: ['!front_doors', '!condemned_m'] },
        { t: `That is enough cutting for now.`, to: 'cuts_done', if: 'fronts>=1' }
      ]
    },

    f_customs: {
      text: [
        `It takes a month. An officer at Jaigad stops answering a particular telephone. A deputy at Kandla, a quiet man, discovers that he has loyalties he had forgotten. Nothing is stolen. The stamps simply start to mean something else.`
      ],
      on: { set: ['front_customs'], add: { fronts: 1, gentle: 1 } },
      next: 'cuts_hub'
    },

    f_money: {
      text: [
        `The angadia are patient and everywhere, and they have been carrying paper for the creditors of Gora's navy for a hundred years. One by one the creditors ask that their halves of the slips be paid somewhere else. By the end of the month Gora cannot buy diesel on credit between Dammam and Karachi.`
      ],
      on: { set: ['front_money', 'angadia_used'], add: { fronts: 1 } },
      next: 'cuts_hub'
    },

    f_convoys: {
      text: [
        { if: 'pirate_hull', t: `The Katta's pirate hull, flying its tea towel, works the edges of Gora's convoys: a tug cut loose here, a tanker's papers lost there. Chopra has been seen laughing on the bridge.` },
        { if: ['guild_known', '!pirate_hull'], t: `The guild's sea-wolves work the edges of Gora's convoys: a tug cut loose here, a tanker's papers lost there.` },
        { if: ['pirate_hull', 'guild_known'], t: `Where the hull and the sea-wolves work together, a convoy does not so much get stopped as get lost.` },
        `A navy that cannot move its own fuel is not a navy.`
      ],
      on: { set: ['front_convoys'], add: { fronts: 1, harsh: 1 } },
      next: 'cuts_hub'
    },

    f_doors: {
      text: [
        `Morgiana chalks every door the same again, knowing she was used, and this time as her own choice. Gora's drones, which know the doors, go quiet, as if somebody had turned the lights off in a house they thought was theirs.`
      ],
      on: { set: ['front_doors', 'm_ally'], add: { fronts: 1, gentle: 1 } },
      next: 'cuts_hub'
    },

    cuts_done: {
      route: [
        { if: 'fronts>=3', to: 'cuts_squeezed' },
        { to: 'cuts_slow' }
      ]
    },

    cuts_squeezed: {
      text: [
        `Three months. Gora wakes one morning in a house with a great many rooms and nobody in any of them. His customs answer to others. His creditors have gone elsewhere. His convoys do not arrive. He is still dangerous, in the way a cornered thing is, but for the first time he is listening.`
      ],
      on: { set: ['gora_squeezed'], peace: true },
      next: 'gandalf'
    },

    cuts_slow: {
      text: [
        `It is slow. It is steady. It is not enough yet, and everybody knows it. Gora is still strong, and still angry, and still has somewhere to stand.`
      ],
      next: 'gandalf'
    },

    gandalf: {
      on: { set: ['vee_friend'] },
      text: [
        `At the end of the week, at the last small port, a figure in grey climbs off the last hull: an old man with a staff and a cough like a door being forced. I have never seen him, and I know exactly who he is, because Vee has written his description on his wrist a hundred times. Gandalf of Gujarat. Vee's teacher, and his well-wisher, and the one person who has always known where to point him.`,
        `He does not ask for me. "Where is the boy?" he says. "He has been walking for too long without me."`,
        `He is dying. He knows it. He has come all this way to guide one more time.`
      ],
      choices: [
        { t: `Take him to Vee at once.`, to: 'g_to_vee' },
        { t: `Tend him first. Vee can wait one night.`, to: 'g_tend' },
        { t: `Keep him away from Vee. The old man is too weak, and Vee too raw.`, to: 'g_apart' }
      ]
    },

    g_to_vee: {
      text: [
        `I find Vee where I always seem to: at the edge of the forest, in the last of the light. The old man gets down from the cart, slowly, and Vee stands up as if a rope had pulled him. Neither speaks for a long time. Then the old man says, "Sit." Vee sits. It is the first time I have seen him sit still.`,
        `They talk until dawn. I do not hear what is said. In the morning Vee's knee has stopped.`
      ],
      on: { set: ['gandalf_with_vee', 'gandalf_guides'], add: { gentle: 2 } },
      next: 'white'
    },

    g_tend: {
      text: [
        `I put him in a bed and make him drink soup. He objects. "You are wasting my time," he says, and then, quieter, "No one has done that in years." He sleeps. Vee does not know he is here until the morning, and when he does, he is angry with me for ten seconds and grateful for the rest of his life.`
      ],
      on: { set: ['gandalf_tended', 'gandalf_guides'], add: { gentle: 1 } },
      next: 'white'
    },

    g_apart: {
      text: [
        `"Not yet," I say. "He is too raw." The old man looks at me for a long time, and I think he is going to argue, and then he says something worse: "You are probably right." He lets me put him in a small room on the quay. He is dying in a way that nobody is meant to see.`
      ],
      on: { set: ['gandalf_apart'], add: { harsh: 1 } },
      next: 'white'
    },

    white: {
      ch: [12, 'Grey to White'],
      on: { tick: true },
      text: [
        `The world is watching. Gora's embargo has become a headline, the swarm has become a rumour, and the volatility of both has put every price on earth out of true.`,
        `At a power station on a mountain pass there is a thing under Gora's whole enterprise, made of embargoes, debts and old grievances: a creature of fire. The old man goes to meet it on the lip of the pass, with his staff, in the grey.`,
        { if: 'gandalf_with_vee', t: `Vee walks beside him, not behind. I have never seen Vee walk in a straight line.` }
      ],
      chance: [
        { to: 'white_ok', w: 0.1, mods: [{ if: 'gandalf_with_vee', w: 0.7 }, { if: 'gandalf_tended', w: 0.4 }, { if: 'gora_squeezed', w: 0.1 }] },
        { to: 'white_fall', w: 0.9, mods: [{ if: 'gandalf_with_vee', w: -0.7 }, { if: 'gandalf_tended', w: -0.4 }, { if: 'gora_squeezed', w: -0.1 }] }
      ]
    },

    white_ok: {
      text: [
        `He falls. I have read that beat before, and I trust it. He returns in white, with a clarity that frightens even Vivekananda.`,
        { if: 'gandalf_with_vee', t: `Vee is the first to reach him. It is Vee's hand that he takes.` },
        `Like Rohan riding to Gondor, four hundred and fifty gigawatts of power from the east answer his call: a line of light across a continent. Gora's navy, a navy in name only, wavers. The pirates at the edge of his fleet look at the lit coast, and at the flag on their own sleeves, and some of them lower their guns.`
      ],
      on: { set: ['white'] },
      next: 'gora_offer'
    },

    white_fall: {
      text: [
        `He falls, and does not return. Vee holds his hand until it is only a hand. The creature of fire goes back down, and the power does not come, and the coast stays dark.`,
        `But the old man's voice goes on in Vee. A teacher is not a person; a teacher is a direction. He will hear it for the rest of his life.`
      ],
      on: { set: ['gandalf_dead'], war: true },
      next: 'gora_offer'
    },

    gora_offer: {
      text: [
        `Then Gora himself comes to the Mundra roads, alone, in a small boat, with his hook raised in greeting.`,
        { if: 'gora_squeezed', t: `He has nothing left but this offer, and he knows it, and he is very polite about it.` },
        { if: '!gora_squeezed', t: `He does not look tired. He looks like a man who has won, and is trying to be courteous about it.` },
        `"I will stand down," he says. "I will open the routes. I will take only one thing."`,
        `"You," I say, before he can.`,
        `We always take Gora's deals. It is a rule Vivekananda taught me, and the shreni taught him: if a man offers you a door, walk through it, and take the furniture with you.`
      ],
      choices: [
        { t: `Accept. Walk into his house as myself, and open it from inside.`, to: 'thug', set: ['deal_alone'] },
        { t: `Accept, and bring the angadia to carry his money out.`, to: 'thug', set: ['deal_courier', 'angadia_used'] },
        { t: `Accept, and bring the guild's sea-wolves to take his convoys.`, to: 'thug', set: ['deal_wolves'], if: 'guild_known' }
      ]
    },

    thug: {
      text: [
        `Gora's house is a flagship, as it turns out: a long grey ship with a great many rooms, all with locks. He gives me a cabin with a window. I have always wanted a window. Over dinner he says, kindly, that he is glad I came, and I smile at him the way I would smile at a lock.`,
        { if: 'thugs>=1', t: `Something has already gone missing, and nobody has noticed yet.` }
      ],
      choices: [
        { t: `Open his strongroom by courier: the angadia carry his cash out in cloth bundles, a little each night.`, to: 't_cash', if: '!t_cash' },
        { t: `Take his cargo: the sea-wolves wait at the edge of every convoy he has promised safe passage.`, to: 't_cargo', if: ['guild_known', '!t_cargo'] },
        { t: `Show him his own clerk's ledger page, and ask him to sign his ports over.`, to: 't_sign', if: ['item:ledger', '!t_sign'] },
        { t: `Charm him. Be the best company he has had in years, and ask for things.`, to: 't_charm', if: '!t_charm' },
        { t: `That is enough.`, to: 'thug_done', if: 'thugs>=1' }
      ]
    },

    t_cash: {
      text: [
        `It takes eleven nights. The courier comes to the back stair with an empty cloth and goes away with a full one. By the twelfth night his strongroom has a great deal of room in it.`
      ],
      on: { set: ['t_cash'], add: { thugs: 1 } },
      next: 'thug'
    },

    t_cargo: {
      text: [
        `At the same hour on the same night, eleven convoys lose their escorts and their papers and their cargo to a hull flying a tea towel and to some very patient men. "Pirates," says Gora in the morning, shaking his head, and I make a sympathetic sound.`
      ],
      on: { set: ['t_cargo'], add: { thugs: 1, harsh: 1 } },
      next: 'thug'
    },

    t_sign: {
      text: [
        `I put the page on the table between the soup and the salt. He reads it slowly, one-eyed, and then reads it again. "A man in my house," he says. "Yes." He signs what I ask. A man who has been shown himself in a mirror will sign almost anything.`
      ],
      on: { set: ['t_sign'], take: ['ledger'], add: { thugs: 1 } },
      next: 'thug'
    },

    t_charm: {
      text: [
        `I am the best company he has had in years. I make him laugh, which is difficult, and I let him tell me about his leg, which he does not tell anyone. It is, in the end, the most effective thing I do. People give a great deal to anyone who listens.`
      ],
      on: { set: ['t_charm'], add: { thugs: 1, gentle: 1 } },
      next: 'thug'
    },

    thug_done: {
      text: [
        `On the fortieth night I ask for the window to be opened, and he opens it. Below us the sea is quiet. He turns to say something, and sees that I am not looking at him but at the empty shelves behind him, and he begins to understand.`
      ],
      chance: [
        { to: 'thug_ok', w: 0.8, mods: [{ if: 'gora_squeezed', w: 0.1 }, { if: 'thugs>=3', w: 0.1 }, { if: 'thugs<=1', w: -0.3 }, { if: 'item:mark', w: 0.05 }] },
        { to: 'thug_caught', w: 0.2, mods: [{ if: 'gora_squeezed', w: -0.1 }, { if: 'thugs>=3', w: -0.1 }, { if: 'thugs<=1', w: 0.3 }] }
      ]
    },

    thug_ok: {
      text: [
        `He sits down on his own bed. He is not angry. He is something stranger: relieved. "You took everything," he says. "My cash. My cargo. My doors."`,
        `"Yes."`,
        `"I have not been so free in thirty years."`
      ],
      on: { set: ['gora_stripped'], peace: true },
      next: 'thug_end'
    },

    thug_caught: {
      text: [
        `The guard at the stair is quicker than I thought. The chain of couriers breaks at the first knot. I am taken in the dark, with a cloth in my hands, and the window is closed.`
      ],
      end: { id: 'caught_inside', title: 'Caught Inside', mood: 'dark', line: `I took his deal, and he took mine. I am in the best cabin on the ship, with a window, and a lock on the outside.` }
    },

    thug_end: {
      text: [
        `Gora's cash, Gora's cargo, Gora's signature. It would fill a hundred warehouses along the coast. And beyond them, a long way off, the sea is beginning to churn.`
      ],
      choices: [
        { t: `Take it all, and go to the sea's edge anyway.`, to: 'poison_a' },
        { t: `Take it all, and go. Let the sea keep its poison.`, to: 'richest' }
      ]
    },

    richest: {
      text: [
        `I take it all and I go. It fills a hundred warehouses along the coast, and the guild takes its fee, and the angadia take theirs, and I take the rest. I am the richest consignment in Gujarat.`
      ],
      end: { id: 'richest', title: 'The Richest Cargo', mood: 'mixed', line: `I never reached the sea's edge. Behind me the poison rises, and somebody else will have to hold it. I tell myself that is not mine. I am very good at telling myself things.` }
    },

    poison_a: {
      ch: [13, 'The Poison and the Blessing'],
      on: { tick: true },
      text: [
        `There is an old story about the churning of the ocean. The sea is churned, treasures rise, and last of all comes the poison. Here the poison is corruption. Every bribe, every favour, every lie that the swarm and its enemies told rises from the bottom of the sea like a dark tide.`,
        { if: 'buyer_paid', t: `I can see the money I sent to the buyer at Dammam, and the torn slip with its missing half.` },
        { if: 'label_stood', t: `I can see the label that stood: *aid*, in a customs officer's slow voice.` },
        { if: 'cassim_dead', t: `I can see a man in a cave with his arms full, and oil on the water.` },
        { if: 'cassim_shut', t: `I can see a man shut in a cave with his arms full.` },
        { if: 'gang_lost', t: `I can see twenty-seven names.` },
        { if: 't_cash', t: `I can see eleven nights of cloth bundles on a back stair.` },
        { if: 'cons_turned', t: `I can see a boy of nineteen who will never be forgiven by either side.` },
        `Gora waits on the shore. Vee stands with the names, and at his shoulder, in white or in memory, is the old man's voice. Vivekananda is at the end of the quay, hands empty. The poison reaches the first stone.`
      ],
      choices: [
        { t: `Forgive Vivekananda, knowing what it is, and what it is not.`, to: 'poison_b', set: ['forgave_v'] },
        { t: `I cannot forgive him. Not yet.`, to: 'poison_b' }
      ]
    },

    poison_b: {
      route: [
        { if: ['forgave_v', 'gora_stripped'], to: 'gora_asks' },
        { if: ['forgave_v', 'white', 'peace'], to: 'gora_asks' },
        { to: 'poison_c' }
      ]
    },

    gora_asks: {
      text: [
        { if: 'gora_stripped', t: `Gora comes up the quay in his shirtsleeves, with nothing in his hands: no cash, no cargo, no doors.` },
        { if: '!gora_stripped', t: `Gora comes up the quay without his hook.` },
        `He has hung it on a rope by the water, like a man hanging up a coat. His sailors have taken off their caps.`,
        `"I do not ask for you," he says. "I ask to follow."`
      ],
      choices: [
        { t: `Let him follow.`, to: 'poison_c', set: ['gora_follows'] },
        { t: `Send him away.`, to: 'poison_c' }
      ]
    },

    poison_c: {
      text: [
        `The poison is at the second stone. Someone has to hold it, and there is no one left who has not helped to make it.`,
        { if: 'gora_follows', t: `Gora stands a little behind me, and for once does not say anything at all.` }
      ],
      choices: [
        { t: `Let Vee hold it. His teacher is with him, and the Moon wears Shiva's blessing on its head.`, to: 'p_vee' },
        { t: `Share it among all of us.`, to: 'p_share' },
        { t: `Pass it on. Pour it into someone else's water.`, to: 'p_pass' }
      ]
    },

    p_vee: {
      route: [
        { if: ['gora_follows', 'forgave_v'], to: 'end_gora_follows' },
        { if: 'forgave_v', to: 'end_shakti' },
        { to: 'end_blessed' }
      ]
    },

    end_gora_follows: {
      text: [
        `Vee takes it. He does what his teacher taught him: he does not drink it and he does not refuse it. He holds it, in the throat, as Shiva did at the beginning of the world, and the trade goes on.`,
        { if: 'gandalf_dead', t: `The old man is not there, and is there entirely: a voice in Vee's throat, a direction.` },
        { if: 'white', t: `The old man in white stands at his shoulder, and says nothing, and does not need to.` },
        { if: 'gang_lost', t: `Vee reads the twenty-seven names against the twenty-seven mansions of the Moon, and finds the one star that agrees with his madness. He forgives everyone but himself. Shiva places the waning crescent on the Moon's head, not to cure the curse but to give it a home.` },
        { if: 'gang_alive', t: `Vee reads the sky with the Katta gang beside him, and finds the one star that agrees with his madness. He forgives everyone but himself. Shiva places the waning crescent on the Moon's head, not to cure the curse but to give it a home.` }
      ],
      end: { id: 'gora_follows', title: 'Gora Follows', mood: 'good', epi: true, line: `From the blessing Shakti is made: no longer a walk but a course. Gora's ship turns in the roads and follows the swarm out of port. The book ends on the Moon, not at the full, over a calm sea, and a ship leaving harbour on a course. I am on it. There is a window.` }
    },

    end_shakti: {
      text: [
        `Vee takes it. He does what his teacher taught him: he does not drink it and he does not refuse it. He holds it, in the throat, as Shiva did at the beginning of the world, and the trade goes on.`,
        { if: 'gandalf_dead', t: `The old man is not there, and is there entirely: a voice in Vee's throat, a direction.` },
        { if: 'white', t: `The old man in white stands at his shoulder, and says nothing, and does not need to.` },
        { if: 'gang_lost', t: `Vee reads the twenty-seven names against the twenty-seven mansions of the Moon, and finds the one star that agrees with his madness. He forgives everyone but himself. Shiva places the waning crescent on the Moon's head, not to cure the curse but to give it a home.` },
        { if: 'gang_alive', t: `Vee reads the sky with the Katta gang beside him, and finds the one star that agrees with his madness. He forgives everyone but himself. Shiva places the waning crescent on the Moon's head, not to cure the curse but to give it a home.` }
      ],
      end: { id: 'shakti', title: 'Shakti Rises', mood: 'good', epi: true, line: `From the blessing Shakti is made: no longer a walk but a course. I am the energy that moves once the stillness has been given its due. The sea is wide, the horizon recedes each time I reach it, and I would not have it any other way.` }
    },

    end_blessed: {
      text: [
        `Vee takes it, and holds it, and the trade goes on. But too much of it was mine, and I did not forgive when I could have, and the water behind me stays dark.`,
        { if: 'gandalf_dead', t: `The old man is not there, and is there entirely: a voice in Vee's throat, a direction.` },
        { if: 'white', t: `The old man in white stands at his shoulder, and says nothing, and does not need to.` },
        { if: 'gang_lost', t: `Vee reads the twenty-seven names against the twenty-seven mansions of the Moon, and finds the one star that agrees with his madness. He forgives everyone but himself. He holds it as a penance, and does not call it a blessing.` },
        { if: 'gang_alive', t: `Vee reads the sky with the Katta gang beside him, and finds the one star that agrees with his madness. He forgives everyone but himself. He holds it as a penance, and does not call it a blessing.` }
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
        tally: 'The angadia tally slip',
        mark: `The guild's mark`,
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
        white: { set: ['vee_friend', 'katta', 'gang_lost', 'gandalf_with_vee', 'gandalf_guides', 'guild_known'] },
        poison_a: { set: ['vee_friend', 'katta', 'gang_lost', 'white', 'gandalf_guides', 'gora_stripped', 'guild_known'] }
      },
      epilogue: [
        { if: 'gang_lost', t: `Vee never finished a ghazal after that, and never stopped starting one.` },
        { if: 'vee_survivor', t: `Vee survived the weather, and has never forgiven himself for it.` },
        { if: ['gang_alive', 'vee_friend'], t: `Vee is still with the Katta gang. The ghazals are cheerful, and still unfinished.` },
        { if: 'vee_away', t: `Vee still goes north to his teacher's grave or his teacher's house, and comes back steadier.` },
        { if: 'vee_wander', t: `Vee still walks the forest at night, one random step at a time.` },
        { if: 'gandalf_guides', t: `The old man's voice is with Vee still. He says it is not a voice, only a direction.` },
        { if: 'cons_kept', t: `The House at Gwadar kept its ledger, and Gora kept a man inside it.` },
        { if: 'cons_replaced', t: `The old house at Gwadar remembers that it was replaced.` },
        { if: 'cons_turned', t: `The clerk at Gwadar writes for me now, and nobody trusts him.` },
        { if: 'cons_watched', t: `The ledger copy still sits in a drawer in Mundra. The man at Gwadar never knew.` },
        { if: 'buyer_paid', t: `The buyer at Dammam was paid through the angadia, and nothing about it was ever written down.` },
        { if: 'buyer_vouched', t: `The buyer at Dammam says my slip has never been wrong.` },
        { if: 'buyer_walked', t: `The buyer at Dammam walked, and told his friends how it ended.` },
        { if: 'buyer_new', t: `A new consignee at Kandla signed, and nobody checked his history.` },
        { if: 'cassim_dead', t: `The shreni settled Cassim's account. It does not say how.` },
        { if: 'cassim_shut', t: `Cassim was never seen again.` },
        { if: 'cassim_saved', t: `Cassim paid off his debts slowly, and never quite forgave himself for not being greedier.` },
        { if: 'pirate_hull', t: `The Katta's pirate hull still flies a tea towel.` },
        { if: 'told', t: `Morgiana chalks every door the same, and now it is her own choice.` },
        { if: ['audited', '!told'], t: `I audited Morgiana's story and kept it to myself. She never found out I knew.` },
        { if: 'condemned_m', t: `Morgiana left the ports at dawn and did not say where.` },
        { if: 'gora_stripped', t: `Gora has no cash, no cargo and no doors, and has told his sailors he has never slept better.` },
        { if: 'gandalf_dead', t: `They buried the old man in grey, because it was the only colour he had left.` },
        { if: 'white', t: `The old man in white still sits at the last small port, and still says he is dying.` }
      ]
    }
  };
});
