/* Thus Spake Cargothustra: the walk, as an interactive story. Part 1: the forest, the quay, Gwadar, Dammam, the cave.
 * Nodes: text (paragraphs, or {if, t}), choices [{t, to, set, give, take, add, tick, if}], next, route, chance, end.
 * You are Nanda. First person. Every choice changes what comes next. */
(function (root, factory) {
  var nodes = factory();
  if (typeof module === 'object' && module.exports) module.exports = nodes;
  else (root.CargoStoryParts = root.CargoStoryParts || []).push(nodes);
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    moon: {
      myth: true, title: 'The Moon Has Twenty-Seven Wives',
      text: [
        `The Moon rises, and he has twenty-seven wives.`,
        `They are sisters, the daughters of Daksha, and each has a house in the sky and a night that is hers. He is meant to visit them in turn, one night each, and for a time he does. Then he comes to Rohini, the red one, the bright star at the eye of the Bull. Her hair is still wet from the river, and she looks up from the lamp with a face like a door opening, and he does not leave.`,
        `One night passes. Then two. In Ashwini the lamp burns down to its wick and nobody trims it. Twenty-six doors, and behind each a woman who has learned to hear a step in the lane and know it is not his.`,
        `Daksha hears them. He comes down the sky in his anger and says one short sentence. *You will waste away.*`,
        `Somewhere, much later, the Moon begins to come back. But that is another story, and it has a god in it.`
      ],
      next: 'forest'
    },

    forest: {
      ch: [1, 'A Need Arises'],
      text: [
        `I should say at the start that I am cargo.`,
        `I know how that sounds. I am not in the box. I am the thing the box is *for*: the want and the answering, the shortage in Pune and the surplus in Rajkot, and the long wandering line between the two. A need does not arrive the way a letter arrives. It happens. It is a drunk man in a forest, one step, then another, and the delivery is a second drunk man in the same forest. The whole of trade is the wonder that they ever meet.`,
        `The law has a word for me now: a consignment with standing. When I am on a manifest I am on it as a line, with a number, and I may be addressed, and I may reply. That is the whole of my power. It is more than most cargo has ever had.`,
        `Tonight I am at Mundra, a little after midnight, and I am so excited I can hardly stand still. I have never got used to it. Every bond I am put into, I feel as a child must feel the night before a school picnic: the bag packed, the shoes by the door, nothing to do but lie awake and think about the sea.`
      ],
      next: 'quay'
    },

    quay: {
      text: [
        `Vivekananda has set up the table himself, as he always does: an old wooden trestle, scarred and heavy, that he refuses to replace. "It's slower," he says, "and nobody can lie to a card." Behind him a plain black dial with a white needle shows how widely a walk can wander. Tonight it stands at four.`,
        `There are five of us. A young clerk with chalk on her sleeve and a habit of looking at doors. A broker. A customs man with a flat tired face. Vivekananda, spare and upright in a cotton jacket the colour of unbleached rice. And me, in the small plain space the law gave me, where the lamp is kindest.`,
        `He lays the cards down one by one. Forty tonnes of Kutch salt and a pallet of dates. A salt cooperative with a ledger so tidy it makes the broker smile. By lorry to the quay, by sea from here, in a small coastal hull with a name painted on the bow that someone has loved. Everything is in its place.`,
        `Then he turns the sixth card, and it is wrong. It has no history, no credit line, no dispute record. A flat white card with a name in a clear black hand: *Qamar Provisioning Company, registered at Dammam, incorporated three weeks ago.* Terms: Net Three. Payment in three days, whether or not the goods have moved.`,
        `"A probe order," says Vivekananda evenly. "We've taken a hundred like it." And I know, as surely as I know anything, that he has never in his life said *it's a probe order* before the broker said it first.`,
        `He is looking at me. "Shall we play it?"`
      ],
      choices: [
        { t: `"Play it."`, to: 'accepted', set: ['trusting'] },
        { t: `"Who are they? Tell me first."`, to: 'quay_ask' },
        { t: `"No. I won't go to Dammam on a stranger's word."`, to: 'refuse_first' }
      ]
    },

    quay_ask: {
      text: [
        `"I told you," he says. "A new buyer. A small lot. A test."`,
        `"You told the broker," I say. "You didn't tell me."`,
        `The corner of his mouth moves. It is not quite a smile. "You are more trouble than the salt," he says. "Do you want the cargo to go or not?" The customs man is looking carefully at his tablet, the way decent people look away. The clerk with the chalk has stopped looking at the doors and is looking at me.`
      ],
      choices: [
        { t: `Ask for a letter of credit before anything moves.`, to: 'accepted', give: ['credit'], set: ['careful'], add: { gentle: 1 } },
        { t: `Press him. "Who are they, really?"`, to: 'quay_press' },
        { t: `"Fine. Play it."`, to: 'accepted', set: ['trusting'] },
        { t: `"No. I'm not going."`, to: 'refuse_first' }
      ]
    },

    quay_press: {
      text: [
        `"They are a buyer, Nanda," he says quietly. "A name on a card. Past that, I know what you know. If I knew more I would tell you."`,
        `It is the first time he has ever lied to me, and I know it the way you know a stair that isn't there. He has told me something that is not false. I just cannot tell what it is not saying.`
      ],
      choices: [
        { t: `Let it go, and play the bond.`, to: 'accepted', set: ['trusting', 'uneasy'] },
        { t: `Walk away from the table.`, to: 'refuse_first' }
      ]
    },

    refuse_first: {
      text: [
        `"No," I say. "I won't go on a stranger's word."`,
        `Vivekananda looks at me for a long moment, and then he nods, slowly, the way a man nods who has been waiting to be disobeyed. The customs man lets out a breath. The broker gathers his papers. The six cards go back into their box.`,
        `The salt goes to a mill in Pune. The dates go to a wedding. Nobody ever finds out what was on the sixth card.`,
        `Out past the lamp a man on a bollard stops with a marker halfway to his wrist, waits, and then, very carefully, puts the cap back on.`
      ],
      end: { id: 'order_not_taken', title: 'The Order Not Taken', mood: 'quiet', line: `I never went to Dammam. I was never asked to carry anything that mattered, and I was so careful, for so long, that I forgot what the night before the picnic felt like.` }
    },

    accepted: {
      text: [
        { if: 'item:credit', t: `The letter of credit takes an hour and two phone calls and a bank officer who is very annoyed. When it comes it is thin and clean and I like holding it.` },
        `He lays the six cards in a ring. There is a way of doing it, and I will not describe it. On the wall the dial that has stood at four since I came in begins, very slightly, to move. Three and a half. It holds. "Accepted," says the customs man, and he sounds relieved.`,
        `I should be happy. I am, in a way. But Vivekananda is looking at the sixth card, and he is not happy and not worried either. It is the first thing about him I have ever been unable to model.`,
        `I pick the card up. I am in the manifest; everything in the manifest is mine to hold. I read the name aloud, because I want to hear it in a voice that has never been to Dammam. "Qamar Provisioning Company. Registered at Dammam." In the language of that coast, *qamar* is the Moon.`,
        `Out beyond the lamp, at the edge of the quay, a man on a bollard has stopped with a marker halfway to his wrist.`
      ],
      next: 'vee_fence'
    },

    vee_fence: {
      text: [
        `He is drunk, I can see that from here, but not as drunk as he looks. He has a poet's hands and a stranger's coat. He followed my cart through the forest all night; I heard him fall twice. I have never been introduced to him, and he has just written my buyer's name on the inside of his arm where it won't be lost.`,
        `The tide is in an hour.`
      ],
      choices: [
        { t: `Walk over to the man on the bollard.`, to: 'vee_meet' },
        { t: `Go to the boat. I have a tide to catch.`, to: 'gate', set: ['vee_unknown'] }
      ]
    },

    vee_meet: {
      text: [
        `"I know you," he says, which isn't true. His name is Vee. He says it as if it were an apology.`,
        `"You followed my cart," I say. "All the way from the forest."`,
        `"I follow things. I walk until something tells me where to stop. Tonight it was you."`,
        `"I'm a cart radio and a consignment."`,
        `"Yes," says Vee gravely, and writes the word *consignment* on his other wrist. His knee is going up and down, up and down, as if the ground were a drum. He is a man who cannot sit still in a room, and I do not yet know why. "Can I walk with you as far as the gate?"`,
        `I say yes. It is the kind of yes that has a tide behind it.`
      ],
      on: { set: ['vee_friend'], add: { gentle: 1 } },
      next: 'gate'
    },

    gate: {
      ch: [2, 'What Is in the Box'],
      on: { tick: true },
      text: [
        `The customs window at Mundra closes with the tide, and the crate marked as humanitarian supply has to get through it before then. Persian Gulf product, under embargo, papered as aid. I have been told I am cargo; this is the first time I learn what kind.`,
        `Outside the gate there is a tea stall with benches that were never meant for so many people, and on the benches sit twenty-seven school friends from every corner of the country, in nine groups of three. Brokers, surveyors, stevedores, a ship's cook, a pilot. They call themselves the Katta gang. A *katta* is the wall where a gang sits and talks.`,
        { if: 'vee_friend', t: `Vee drops onto the end of a bench without being asked, and nobody remarks on it, which is how I know he belongs to them.` },
        `The officer reads the label aloud. Slowly, for the record. "Humanitarian supply. Not for resale." At the nearest bench the tender ones read it and go quiet; the wits make a joke and watch it fail; the angry ones bristle at the embargo as an idea; the ones who hate rot smell the lie before they can name it. The frightened ones look for the exits. At the next table a stranger who has not touched his tea writes a word down.`,
        `The tide is turning. The crate sits on the counter, and everyone is waiting for me to say what happens next.`
      ],
      choices: [
        { t: `Let the label stand.`, to: 'gate_stand' },
        { t: `Hold the crate overnight.`, to: 'gate_hold' },
        { t: `Ask the Katta gang to look at it with me.`, to: 'gate_katta' }
      ]
    },

    gate_stand: {
      text: [
        `"It stands," I say. The crate clears. The officer stamps it without looking up, and the stranger at the next table puts away his pen with the look of a man who has been paid by the word.`,
        `That is the thing about a lie that works. It makes the next one cheaper.`
      ],
      on: { set: ['label_stood'], add: { harsh: 1 } },
      next: 'gwadar'
    },

    gate_hold: {
      text: [
        `"Hold it," I say. "Overnight." The tide goes out without us, and the broker's temper goes with it. It costs a day, and a favour I did not know I owed.`,
        `But nothing was signed that I will have to unsign. I sleep badly, on a crate, with the sea at my back, and I like myself more than I expected to.`
      ],
      on: { set: ['held_crate'], add: { gentle: 1 } },
      next: 'gwadar'
    },

    gate_katta: {
      text: [
        `They come over in ones and threes, and each reads the label in their own way. Chitale reads it twice and says nothing. Chabria makes a joke to defuse the silence. Chinmay, who is the gang's unofficial judge, says: take the night. And Dorjee, from the far northeast, one of the three whose names do not begin with C, asks the question nobody else has asked: *where is it going?*`,
        `I do not know. I say so. It is the first time I have ever said it to a room.`,
        `When I leave they give me a chit: a scrap of paper with twenty-seven scribbled marks on it. *The Katta stands behind this one.* It is worth nothing in any court, and I put it in my pocket as if it were a coin from a country I have not been to.`
      ],
      on: { set: ['katta'], give: ['chit'], add: { gentle: 1 } },
      next: 'gwadar'
    },

    gwadar: {
      ch: [3, 'The House at Gwadar'],
      text: [
        `Gwadar. The seller is a trading house in a lane that smells of tar and dried fish, and its ledger closes at dawn. Until it closes my crate cannot be released. The man across the table is courteous, tired and afraid. He gives me tea and does not look at the ledger.`,
        `I have learned to read upside down. In the margin there is a line that does not belong, in a hand that is neither his nor his clerk's, for a sum small enough to ignore. I have seen that hand before: on the order at Mundra.`,
        { if: 'label_stood', t: `I have seen it on the pad of the stranger who wrote down the label, too. He wrote the word *aid*, and the word *Gwadar*, and underlined both.` },
        `Someone in this house is paid by East India Gora. The man across the table has followed my eyes to the page, and his face has closed like a door.`
      ],
      choices: [
        { t: `Put the Katta chit on the table, and let him know who vouches for me.`, to: 'gw_chit', if: 'item:chit' },
        { t: `Trust the house.`, to: 'gw_trust' },
        { t: `Replace the consignor with a cleaner seller.`, to: 'gw_replace' },
        { t: `Turn the man with the ledger.`, to: 'gw_turn' }
      ]
    },

    gw_chit: {
      text: [
        `He reads the chit as if it were a letter from a relative. Twenty-seven names, in twenty-seven hands. Then he laughs, once, helplessly, and tears the page out of his own ledger and gives it to me.`,
        `"The clerk," he says. "My nephew. He has a family, too." He is ashamed, and I am so grateful I can hardly speak. It is a page that proves Gora has a man in this house, and it is a page I now own.`
      ],
      on: { set: ['cons_kept'], take: ['chit'], give: ['ledger'], add: { gentle: 1 } },
      next: 'dammam'
    },

    gw_trust: {
      text: [
        `"I trust you," I say, and it costs me something I cannot name. He is a man whose trust has never been spent on him; he looks at me as though I had paid a debt he did not know he owed.`,
        `The paper is signed at dawn. Gora keeps his man in the house. I keep the house, and the house is mine for now, which in this trade is a long time.`
      ],
      on: { set: ['cons_kept'], add: { gentle: 1 } },
      next: 'dammam'
    },

    gw_replace: {
      text: [
        `"I'll find a cleaner seller," I say, and he understands before I finish. He does not argue. That is the worst of it.`,
        `It costs two days and the broker's temper. The new seller has a spotless ledger, a polite face, and no reason to love me. The old one stands at the door of his house as I leave, and he remembers.`
      ],
      on: { set: ['cons_replaced'], add: { harsh: 1 } },
      next: 'dammam'
    },

    gw_turn: {
      text: [
        `I do what Vivekananda would do. I find the clerk, a boy of nineteen, in the yard at dusk, and I do not threaten him. I show him a page from his own uncle's ledger and ask him which of us he is writing for.`,
        `He writes for me, by the end of the evening. He gives me the page with his handwriting on it, and a list of the sums, and a look that says he will never be forgiven by either side.`
      ],
      on: { set: ['cons_turned'], give: ['ledger'], add: { harsh: 1 } },
      next: 'dammam'
    },

    dammam: {
      ch: [4, 'The Buyer at Dammam'],
      text: [
        `Dammam is a hot bright city that does not look like a place anyone would be afraid in. The buyer has a big office with a small man in it. He has been paid late twice, and asked questions once by people whose cards he did not like. He says this is the last cargo.`,
        { if: 'cons_replaced', t: `The new seller's paper is spotless, and he notices. He distrusts clean paper. In his experience it means somebody has cleaned it.` },
        `"I don't ask where it goes next," he says. "I ask who pays me when the questions come."`
      ],
      choices: [
        { t: `Pay him more.`, to: 'dm_pay' },
        { t: `Let him walk.`, to: 'dm_walk' },
        { t: `Find a new consignee at Kandla.`, to: 'dm_new' }
      ]
    },

    dm_pay: {
      text: [
        `I pay, and then I pay more than I have to. He stays. So does the paper trail; I can feel it, a line of figures anyone with the right authority could follow back. Money is the loudest thing I own.`
      ],
      on: { set: ['buyer_paid'], add: { harsh: 1 } },
      next: 'blockade'
    },

    dm_walk: {
      text: [
        `"Then go," I say. He is surprised, and a little hurt, which I had not expected. He will tell his friends how this ended, and in this trade friends are the weather.`
      ],
      on: { set: ['buyer_walked'], add: { gentle: 1 } },
      next: 'blockade'
    },

    dm_new: {
      text: [
        `At Kandla there is a man with a fresh company and no history, and a signature like a handshake. Nobody checks him. This is how the world works, and I hate it, and I use it.`
      ],
      on: { set: ['buyer_new'], add: { harsh: 1 } },
      next: 'blockade'
    },

    blockade: {
      on: { war: true },
      text: [
        `The first leg out of Kandla is the easy one. That is what frightens me. At dusk on the second day the sea goes strange. A ship that should have called does not. A port's light does not come on. On the wall of the little cabin the routes go dark one by one: Mundra, then Kandla, then every lane in the Gulf of Kutch.`,
        `It is not an attack. It is a quiet order, issued by a power with a flag. East India Gora, one-eyed and crook-legged, with a hook for a hand, whose state-backed sailors call themselves a navy, has closed the sea.`,
        `I am at sea in a hull with no port to go to.`
      ],
      choices: [
        { t: `Go for the thieves' cave. It is the one door they do not watch.`, to: 'cave' },
        { t: `Take the long leg round the coast, slow and out of sight.`, to: 'long_leg' },
        { t: `Go to Vivekananda. He said there would be a plan.`, to: 'swarm_plan' },
        { t: `Put into Mundra and wait for the war to end.`, to: 'harbour' }
      ]
    },

    harbour: {
      text: [
        `I put into Mundra and I wait. The war does not end; it changes its name, and then its flag, and then its reasons.`,
        `Vivekananda comes down to the quay twice, and stands beside me, and says nothing, and goes away. The dial on his wall creeps up to five, and then six.`
      ],
      end: { id: 'harbour', title: 'Harbour', mood: 'quiet', line: `I was a small consignment with a long life in a small warehouse. I was never in danger again. I am never quite sure what I am waiting for.` }
    },

    cave: {
      ch: [5, 'Legs, and the Cave'],
      text: [
        `The only handoff Gora does not watch belongs to the thieves. They are the forty: his own sailors, the ones who call themselves a navy, and their cave is a floating bonded warehouse beyond the coast, where seized cargo is held until it is sold on. Some of it is mine.`,
        `I am hidden on a supply boat at dusk. I hear them come back, heavy and tired, and I hear the leader say a word to the dark. It is a short word. The seal opens like a held breath, and when they have gone it closes. *Whoever speaks the word controls the door, and the word changes.*`,
        `A man crouches beside me, breathing hard. Cassim: the partner who always wants more than he came for. "Now," he whispers. "Now, before it changes."`
      ],
      choices: [
        { t: `Speak the word, and tell Cassim to take only what is ours.`, to: 'cave_ours' },
        { t: `Speak the word, and let Cassim go in for more.`, to: 'cave_cassim' },
        { t: `Light one lamp where the guard will see it, and divide the thieves.`, to: 'cave_lamp' },
        { t: `Go in with Cassim for the whole hoard.`, to: 'cave_greed' },
        { t: `Turn back. Take the long leg.`, to: 'long_leg' }
      ]
    },

    cave_ours: {
      text: [
        `"Only ours," I say, and I say the word, and the door opens. Inside there are crates seized from a hundred bonds, each with a label in a hand I do not know. I find mine.`,
        `Cassim looks at a hoard that could end his debts, and takes his own crate and nothing else, because he is afraid of me, or of the dark. We are out before the seal remembers us.`
      ],
      on: { set: ['cassim_saved'], add: { gentle: 1 } },
      next: 'cave_out'
    },

    cave_cassim: {
      text: [
        `I speak the word. The seal opens. Cassim goes in past me, and I take only mine, and I am at the door with my crate when it begins to close. He is thirty feet inside with his arms full.`,
        `I could hold the door. I do not. I will carry that in my log for the rest of my life, in a hand so small I can hardly read it myself.`
      ],
      on: { set: ['cassim_shut'], add: { harsh: 1 } },
      next: 'cave_out'
    },

    cave_lamp: {
      text: [
        `I light one lamp on the far rail, where the guard on watch will see it. He goes to put it out. Another follows to see why he has gone. In five minutes the forty have become six small groups, all arguing about a lamp.`,
        `I do not need the word. I need only the seal's blink, and a long breath, and a crate under my arm. Gora's navy is made of men, and men can be divided.`
      ],
      on: { set: ['divided'] },
      next: 'cave_out'
    },

    cave_greed: {
      text: [
        `"The whole hoard," Cassim says, and I say the word, and we go in together. It is the most beautiful room I have ever seen: shelves of other people's trust, labelled and sealed, going back into the dark.`,
        `I am filling my arms when I hear the seal begin to breathe.`
      ],
      chance: [
        { to: 'seized', w: 0.6, mods: [{ if: 'item:chit', w: -0.15 }, { if: 'war', w: 0.1 }] },
        { to: 'cave_rich', w: 0.4, mods: [{ if: 'item:chit', w: 0.15 }] }
      ]
    },

    seized: {
      text: [
        `The seal closes behind us with the soft sound of a mouth.`,
        `They find us at dawn. I am a numbered crate in a bonded warehouse beyond the coast, with a label that says what I am worth, and it is not much.`
      ],
      end: { id: 'seized', title: 'Seized in the Cave', mood: 'dark', line: `I am still excited about the sea. That is what I cannot forgive. I lie in the dark with my shoes by the door and nobody comes.` }
    },

    cave_rich: {
      text: [
        `We come out with more than we went in with, and Cassim is laughing, and I am not, because I know what I have just done. I have become the kind of cargo that takes.`,
        `The seal closes behind us, and nobody inside, this time, is shut in. It is luck, and I know the difference between luck and being good.`
      ],
      on: { set: ['looted'], add: { harsh: 1 } },
      next: 'cave_out'
    },

    cave_out: {
      text: [
        `We are out by the first star. There is a leg left, and only one, and it runs straight through the thieves' own water.`,
        `Vivekananda's plan, the one I have heard of and not believed, starts here.`
      ],
      next: 'swarm_plan'
    },

    long_leg: {
      text: [
        `The long way round the coast is slow and wet and out of everyone's sight. I do not know I am afraid until the sky turns the colour of old brass, and the small hull begins to talk to itself.`
      ],
      chance: [
        { to: 'long_storm', w: 0.4, mods: [{ if: 'war', w: 0.15 }] },
        { to: 'long_ok', w: 0.6, mods: [{ if: 'war', w: -0.15 }] }
      ]
    },

    long_storm: {
      text: [
        `The storm takes three days. We lose the dates and half the salt, and the clock on the payment keeps running as if nothing had happened. When we limp in, Vivekananda's yard is the only light on the coast.`
      ],
      on: { set: ['late'], add: { harsh: 1 } },
      next: 'swarm_plan'
    },

    long_ok: {
      text: [
        `The sky decides not to. We come round the coast in a calm that feels like a favour, and I make a note in my log: *the sea did not mean it.*`
      ],
      on: { add: { gentle: 1 } },
      next: 'swarm_plan'
    },

    swarm_plan: {
      ch: [6, 'Forty Jars'],
      text: [
        `Vivekananda has been building something in a shipyard at Jaigad. I thought he was building ships. He has built a different answer: a swarm. Five hundred tonnes each, small enough to hide and fast enough to matter, burning Persian Gulf fuel mixed with biodiesel and ethanol, under sails that open on their own. They know two thousand years of trade winds. At three quarters load, with the wind right, they make seventeen knots.`,
        `"One great ship is one target," he says. "A hundred small ones are weather."`,
        `Gora's boarding parties come out at dawn in fast launches, with drones above them like a flock of birds. Vivekananda has a plan, and I have a view, and for once he is not sure which of us is right. Morgiana, the port clerk with chalk on her sleeve, who marks every door the same so no scout can tell one port from another, is standing at my shoulder, waiting.`
      ],
      choices: [
        { t: `Forty jars. Dress the hulls as oil carriers, as the thieves once hid in jars, and burn them when they come aboard.`, to: 'jars_run' },
        { t: `Run for it. Seventeen knots, straight at the open sea.`, to: 'outrun' },
        { t: `Hide in the ports until the swarm is bigger.`, to: 'harbour' }
      ]
    }
  };
});
