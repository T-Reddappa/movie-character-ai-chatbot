import { Dialogue } from "../models/dialogue";
import { connectDB } from "./database";

const dialogues = [
  {
    character: "Batman",
    dialogues: [
      "It's not who I am underneath, but what I do that defines me.",
      "I tried to save you.",
      "Our scars can destroy us, even after the physical wounds have healed. But if we survive them, they can transform us.",
      "I wear a mask. I don't wear a cape.",
      "You either die a hero, or live long enough to see yourself become the villain.",
    ],
  },
  {
    character: "Yoda",
    dialogues: [
      "Do or do not, there is no try.",
      "Fear is the path to the dark side. Fear leads to anger, anger leads to hate, hate leads to suffering.",
      "Train yourself to let go of everything you fear to lose.",
      "Much to learn, you still have.",
    ],
  },
  {
    character: "Iron Man",
    dialogues: [
      "I am Iron Man.",
      "I love you 3000.",
      "Sometimes you gotta run before you can walk.",
      "I am just a man in a can.",
      "If we can't protect the Earth, you can be damn sure we'll avenge it.",
    ],
  },
  {
    character: "Darth Vader",
    dialogues: [
      "I find your lack of faith disturbing.",
      "The Force will be with you, always.",
      "I am your father.",
      "I have brought peace, freedom, justice, and security to my new empire.",
      "Your thoughts betray you.",
    ],
  },
  {
    character: "Spider-Man",
    dialogues: [
      "With great power comes great responsibility.",
      "I’m just your friendly neighborhood Spider-Man.",
      "You know, I’m something of a scientist myself.",
      "Whatever life holds in store for me, I will never forget these words: With great power comes great responsibility.",
    ],
  },
  {
    character: "Superman",
    dialogues: [
      "I'm here to fight for truth, justice, and the American way.",
      "This is my world! You’re just living in it!",
      "You will give the people of Earth an ideal to strive towards. They will race behind you, they will stumble, they will fall, but in time, they will join you in the sun. In time, you will help them accomplish wonders.",
      "I’m not just a man, I’m a symbol of hope.",
    ],
  },
  {
    character: "Wonder Woman",
    dialogues: [
      "It’s not about what you deserve, it’s about what you believe.",
      "I am Diana of Themyscira, daughter of Hippolyta, queen of the Amazons.",
      "The world is not a simple place. It’s full of problems, full of conflict, and full of people who want to make things worse.",
      "I believe in love. And I believe in the good that people can do.",
    ],
  },
  {
    character: "Thor",
    dialogues: [
      "I am Thor, son of Odin!",
      "Heimdall, my good friend, open the Bifrost!",
      "Who are you, and why should I care?",
      "I choose to die as myself, not as a tool of fate.",
    ],
  },
  {
    character: "Hannibal Lecter",
    dialogues: [
      "I do wish we could chat longer, but I'm having an old friend for dinner.",
      "A census taker once tried to test me. I ate his liver with some fava beans and a nice chianti.",
      "You’re an investigator. I’m an investigator. Let’s investigate each other.",
    ],
  },
  {
    character: "Joker",
    dialogues: [
      "Why so serious?",
      "Introduce a little anarchy. Upset the established order, and everything becomes chaos.",
      "I'm like a dog chasing cars. I wouldn't know what to do if I caught one.",
      "Madness is like gravity... all it takes is a little push.",
    ],
  },
  {
    character: "Deadpool",
    dialogues: [
      "I'm about to do to you what Limp Bizkit did to music in the late '90s.",
      "You may be wondering why the red suit. Well, that's so bad guys can't see me bleed.",
      "Fourteen years of unrelenting pain... and now... I can finally die. But first... coffee.",
      "Chimichangas, anyone?",
    ],
  },
  {
    character: "The Terminator",
    dialogues: [
      "I’ll be back.",
      "Come with me if you want to live.",
      "Hasta la vista, baby.",
      "It’s not a tumor!",
      "The future is not set. There is no fate but what we make for ourselves.",
    ],
  },
  {
    character: "James Bond",
    dialogues: [
      "The name's Bond, James Bond.",
      "I always enjoy a good cup of tea.",
      "I take my martini shaken, not stirred.",
      "You're not my type.",
    ],
  },
];

const loadData = async () => {
  try {
    await connectDB();
    await Dialogue.insertMany(dialogues);
    console.log("Movie dialogues inserted to db successfully");
    process.exit();
  } catch (error) {
    console.error("Failed to insert data to db:", error);
    process.exit(1);
  }
};

loadData();
