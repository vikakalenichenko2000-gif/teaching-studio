const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
const THEME = {
  name: "Lingo English School",
  headFontFace: "Playfair Display",
  bodyFontFace: "Nunito",
  colors: {
    dk1: "152547", lt1: "FFFFFF", dk2: "7C5AA1", lt2: "E1D4F8",
    accent1: "7C5AA1", accent2: "C4CBA7", accent3: "EDC35F", accent4: "4E5536",
    accent5: "EEE6FB", accent6: "152547", hlink: "7C5AA1", folHlink: "4E5536",
  },
};
const HEX = { navy: "152547", lilac: "E1D4F8", lilac2: "F4EFFC", accent: "7C5AA1", olive: "C4CBA7", oliveInk: "4E5536", gold: "EDC35F", white: "FFFFFF" };

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.author = "Lingo English School";
  pres.title = "Tech Talk Challenge";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: "COVER",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.55, w: 6.2, h: 1.3, fontSize: 44, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 2.95, w: 6.0, h: 1.1, fontSize: 18, color: C.background2, valign: "top", margin: 0 }, text: "" } },
      { text: { text: "lingo  english school", options: { x: 0.6, y: 4.85, w: 4, h: 0.35, fontSize: 12, color: C.background2, bold: true, margin: 0 } } },
    ],
  });
  pres.defineSlideMaster({
    title: "ROUND",
    background: { color: C.background1 },
    margin: [0.5, 0.5, 0.5, 0.5],
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 1.35, y: 0.32, w: 8.1, h: 0.7, fontSize: 32, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: "Tech Talk Challenge · Lingo English School", options: { x: 0.5, y: 5.22, w: 5, h: 0.25, fontSize: 10, color: C.accent1, margin: 0 } } },
    ],
    slideNumber: { x: 9.05, y: 5.2, w: 0.45, h: 0.28, fontSize: 10, color: C.accent1, align: "right" },
  });

  // ---------- helpers ----------
  const badge = (s, label) => {
    s.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.32, w: 0.7, h: 0.7, fill: { color: C.accent3 }, line: { color: "C99A2E", width: 1.5 }, objectName: "round badge" });
    s.addText(label, { x: 0.5, y: 0.32, w: 0.7, h: 0.7, fontSize: 20, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
  };
  const card = (s, x, y, w, h, fill, name) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: name });
  const say = (s, text, y = 4.6) => {
    card(s, 0.5, y, 9.0, 0.48, C.accent2, "phrase bank");
    s.addText(text, { x: 0.7, y, w: 8.6, h: 0.48, fontSize: 15, color: C.text1, valign: "middle", margin: 0, isTextBox: true, italic: true });
  };
  const addRound = (title, label, section) => {
    const s = pres.addSlide({ masterName: "ROUND", sectionTitle: section });
    s.addText(title, { placeholder: "title" });
    badge(s, label);
    return s;
  };

  const IC = {
    laptop: await icon(fa.FaLaptop, HEX.accent), phone: await icon(fa.FaMobileAlt, HEX.accent), robot: await icon(fa.FaRobot, HEX.accent),
    users: await icon(fa.FaUsers, HEX.accent), comment: await icon(fa.FaComments, HEX.accent), star: await icon(fa.FaStar, HEX.navy),
    tools: await icon(fa.FaTools, HEX.accent), cart: await icon(fa.FaShoppingCart, HEX.accent), globe: await icon(fa.FaGlobe, HEX.accent),
    bolt: await icon(fa.FaBolt, HEX.navy), coin: await icon(fa.FaCoins, HEX.navy), check: await icon(fa.FaCheck, HEX.oliveInk), cross: await icon(fa.FaTimes, "B3261E"),
    laptopW: await icon(fa.FaLaptop, HEX.navy), phoneW: await icon(fa.FaMobileAlt, HEX.navy), robotW: await icon(fa.FaRobot, HEX.navy),
  };

  // ---------- 1 cover ----------
  pres.addSection({ title: "Start" });
  let s = pres.addSlide({ masterName: "COVER", sectionTitle: "Start" });
  s.addText("Tech Talk Challenge", { placeholder: "title" });
  s.addText("Unit 10 · Speaking games: technology, the Internet and the future", { placeholder: "body" });
  [[IC.laptopW, 7.15, 0.9], [IC.phoneW, 8.35, 2.0], [IC.robotW, 7.15, 3.1]].forEach(([img, x, y], i) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: 1.15, h: 1.15, fill: { color: i === 1 ? C.accent3 : C.background2 }, line: { color: i === 1 ? C.accent3 : C.background2, width: 0 }, objectName: "icon circle " + (i + 1) });
    s.addImage({ data: img, x: x + 0.29, y: y + 0.29, w: 0.57, h: 0.57, altText: ["laptop", "phone", "robot"][i] });
  });
  s.addNotes("Додатковий урок-гра на говоріння до Unit 10 (B1): технології, Інтернет, пасив, have/get something done, майбутнє покупок і професій. 35–45 хв. Розділіть клас на 2–3 команди. Бали записуйте на дошці.");

  // ---------- 2 rules ----------
  s = addRound("How we play", "★", "Start");
  const rules = [
    [IC.users, "Teams", "Work in teams of 2–3. Choose a team name."],
    [IC.comment, "1 point", "for every full answer in English: say why!"],
    [IC.bolt, "+1 bonus", "for a passive sentence or have / get something done."],
    [IC.coin, "Lingo Coins", "The best speakers get up to 5 coins today."],
  ];
  rules.forEach(([img, h, t], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.35, 2.1, 2.9, i === 3 ? C.accent3 : C.accent5, "rule card " + (i + 1));
    s.addShape(pres.shapes.OVAL, { x: x + 0.7, y: 1.6, w: 0.7, h: 0.7, fill: { color: C.background1 }, line: { color: C.background1, width: 0 }, objectName: "rule icon bg " + (i + 1) });
    s.addImage({ data: img, x: x + 0.85, y: 1.75, w: 0.4, h: 0.4, altText: h });
    s.addText(h, { x: x + 0.15, y: 2.45, w: 1.8, h: 0.45, fontSize: 18, bold: true, color: C.text1, align: "center", margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.15, y: 2.9, w: 1.8, h: 1.2, fontSize: 14, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  say(s, "Rule number one: English only!");
  s.addNotes("Поясніть правила. Бонус +1 — за речення в пасиві (is made, was invented, will be done) або have/get something done (I had my phone repaired). Lingo Coins — за правилами школи (офлайн).");

  // ---------- 3 this or that ----------
  pres.addSection({ title: "Warm-up" });
  s = addRound("This or that?", "1", "Warm-up");
  const pairs = [["phone", "laptop"], ["texting", "calling"], ["YouTube", "TikTok"], ["online shopping", "real shops"], ["video games", "films"], ["headphones", "speakers"]];
  pairs.forEach(([a, b], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.3 + row * 1.05;
    card(s, x, y, 4.4, 0.85, C.accent5, "pair " + (i + 1));
    s.addText([
      { text: a, options: { bold: true, color: C.text1 } },
      { text: "   or   ", options: { color: C.accent1, italic: true } },
      { text: b, options: { bold: true, color: C.text1 } },
    ], { x: x + 0.25, y, w: 3.9, h: 0.85, fontSize: 20, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "I prefer … because …   ·   I'd choose … because …");
  s.addNotes("5 хв. Кожен учень по черзі обирає і пояснює одним реченням. Швидкий темп. Можна рухливо: ліва рука — перший варіант, права — другий.");

  // ---------- 4 would you rather ----------
  s = addRound("Would you rather…?", "2", "Warm-up");
  const wyr = [
    "…live without the Internet for a month or without music for a month?",
    "…have a robot teacher or a human teacher?",
    "…lose your phone or lose your keys?",
    "…only text people or only call people for a year?",
  ];
  wyr.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.3 + row * 1.6;
    card(s, x, y, 4.4, 1.4, i === 1 ? C.background2 : C.accent5, "question " + (i + 1));
    s.addImage({ data: [IC.globe, IC.robot, IC.phone, IC.comment][i], x: x + 0.25, y: y + 0.45, w: 0.5, h: 0.5, altText: "icon" });
    s.addText(q, { x: x + 0.95, y, w: 3.3, h: 1.4, fontSize: 16, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "I'd rather … because …   ·   I wouldn't like to … because …");
  s.addNotes("5 хв. Пари обговорюють 1 хв, потім кожен ділиться відповіддю партнера: «Anna would rather… because…» (+1 бал).");

  // ---------- 5 true or false ----------
  pres.addSection({ title: "Passive" });
  s = addRound("True or false? Tech facts", "3", "Passive");
  const facts = [
    "The first iPhone was released in 2007.",
    "The telephone was invented by Thomas Edison.",
    "The first computer mouse was made of wood.",
    "The first email was sent in 2001.",
    "The first emojis were created in Japan.",
    "Instagram was created before Facebook.",
  ];
  facts.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.3 + row * 1.05;
    card(s, x, y, 4.4, 0.85, C.accent5, "fact " + (i + 1));
    s.addText(String(i + 1), { x: x + 0.15, y: y + 0.17, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
    s.addText(f, { x: x + 0.75, y, w: 3.5, h: 0.85, fontSize: 15, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "I think it's true / false because …   ·   Bonus: correct the false ones in the passive!");
  s.addNotes("5–7 хв. Команди вирішують True/False і пояснюють. Бонус +1: виправити хибне речення в пасиві (The telephone was invented by Alexander Graham Bell). Відповіді — на наступному слайді.");

  // ---------- 6 answers ----------
  s = addRound("Answers", "3", "Passive");
  const ans = [
    [true, "True: it was released in June 2007."],
    [false, "False: it was invented by Alexander Graham Bell."],
    [true, "True: it was made of wood in the 1960s."],
    [false, "False: the first email was sent in 1971."],
    [true, "True: they were created in Japan in the 1990s."],
    [false, "False: Facebook was created first (2004), Instagram in 2010."],
  ];
  ans.forEach(([ok, t], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.3 + row * 1.05;
    card(s, x, y, 4.4, 0.85, ok ? C.accent2 : C.accent5, "answer " + (i + 1));
    s.addImage({ data: ok ? IC.check : IC.cross, x: x + 0.25, y: y + 0.24, w: 0.38, h: 0.38, altText: ok ? "true" : "false" });
    s.addText(t, { x: x + 0.8, y, w: 3.45, h: 0.85, fontSize: 14, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "Your turn: write one tech fact in the passive. Other teams guess: true or false?");
  s.addNotes("Покажіть відповіді. Потім кожна команда пише власний факт у пасиві (правдивий чи вигаданий), інші вгадують.");

  // ---------- 7 tech problems ----------
  s = addRound("Tech problems: what should they do?", "4", "Passive");
  const probs = ["My phone screen is broken.", "My laptop keeps crashing.", "I spilled juice on my keyboard.", "My hair is too long for the school photo.", "My battery dies after two hours.", "Our Internet is really slow."];
  probs.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 3.07, y = 1.3 + row * 1.55;
    card(s, x, y, 2.87, 1.35, row === 0 ? C.accent5 : C.background2, "problem " + (i + 1));
    s.addImage({ data: IC.tools, x: x + 0.2, y: y + 0.2, w: 0.35, h: 0.35, altText: "tools" });
    s.addText(p, { x: x + 0.2, y: y + 0.55, w: 2.5, h: 0.75, fontSize: 15, color: C.text1, valign: "top", margin: 0, isTextBox: true });
  });
  say(s, "You should get it repaired / checked / replaced.   ·   Why don't you have it …?");
  s.addNotes("5 хв. Учень читає проблему як свою, команда радить з get/have something done. Зразки: get the screen repaired; have it checked; get the keyboard cleaned or replaced; get/have your hair cut; get the battery replaced; have a new router installed / get the Internet checked.");

  // ---------- 8 decode ----------
  pres.addSection({ title: "Messages" });
  s = addRound("Decode the message!", "5", "Messages");
  const msgs = ["gtg but brb", "r u OK? wot r u doing 2nite?", "thx 4 yr help with my hmwk", "c u @ yr house @ 8.30", "wots ur ETA?"];
  msgs.forEach((m, i) => {
    const left = i % 2 === 0;
    const y = 1.2 + i * 0.66;
    const x = left ? 0.5 : 3.2;
    card(s, x, y, 4.6, 0.55, left ? C.accent5 : C.background2, "message " + (i + 1));
    s.addText(m, { x: x + 0.2, y, w: 4.2, h: 0.55, fontSize: 17, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  card(s, 8.0, 1.2, 1.5, 3.2, C.accent3, "task card");
  s.addText("Read it in full English. Then write a message for another team!", { x: 8.1, y: 1.3, w: 1.3, h: 3.0, fontSize: 14, bold: true, color: C.text1, valign: "middle", align: "center", margin: 0, isTextBox: true });
  say(s, "gtg = I've got to go   ·   brb = be right back   ·   ETA = what time will you arrive?");
  s.addNotes("5 хв. Команди по черзі «розшифровують» повідомлення повними реченнями: I've got to go, but I'll be right back. / Are you OK? What are you doing tonight? / Thanks for your help with my homework. / See you at your house at 8.30. / What's your ETA? (What time will you arrive?) Потім кожна команда пише своє повідомлення скороченнями — інша розшифровує.");

  // ---------- 9 explain it ----------
  s = addRound("Explain it! 30 seconds", "6", "Messages");
  const words = ["webcam", "password", "headset", "download", "junk folder", "touchscreen", "update", "flash drive"];
  words.forEach((w, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.5 + col * 2.3, y = 1.35 + row * 1.35;
    card(s, x, y, 2.1, 1.1, row === 0 ? C.accent5 : C.background2, "word " + (i + 1));
    s.addText(w, { x, y, w: 2.1, h: 1.1, fontSize: 20, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "It's a thing you use when … · It's something that … · You need it to …");
  s.addNotes("5 хв. Учень пояснює слово за 30 секунд, не називаючи його; його команда вгадує. Варіант: учень сідає спиною до екрана, а команда пояснює.");

  // ---------- 10 debate ----------
  pres.addSection({ title: "Discussion" });
  s = addRound("Debate: shops with no people", "7", "Discussion");
  card(s, 0.5, 1.3, 4.4, 3.05, C.accent2, "for column");
  card(s, 5.1, 1.3, 4.4, 3.05, C.accent5, "against column");
  s.addImage({ data: IC.cart, x: 0.75, y: 1.5, w: 0.45, h: 0.45, altText: "cart" });
  s.addText("FOR: it's a great idea", { x: 1.35, y: 1.45, w: 3.4, h: 0.55, fontSize: 18, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  s.addText([
    { text: "It's quick and easy.", options: { bullet: true, breakLine: true } },
    { text: "No queues at the check-out.", options: { bullet: true, breakLine: true } },
    { text: "It may be cheaper.", options: { bullet: true } },
  ], { x: 0.75, y: 2.2, w: 4.0, h: 1.9, fontSize: 18, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 6, isTextBox: true });
  s.addImage({ data: IC.robot, x: 5.35, y: 1.5, w: 0.45, h: 0.45, altText: "robot" });
  s.addText("AGAINST: it's a bad idea", { x: 5.95, y: 1.45, w: 3.4, h: 0.55, fontSize: 18, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  s.addText([
    { text: "People lose their jobs.", options: { bullet: true, breakLine: true } },
    { text: "You are watched by cameras.", options: { bullet: true, breakLine: true } },
    { text: "There's no contact with people.", options: { bullet: true } },
  ], { x: 5.35, y: 2.2, w: 4.0, h: 1.9, fontSize: 18, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 6, isTextBox: true });
  say(s, "In my opinion …   ·   I agree / disagree because …   ·   On the other hand …");
  s.addNotes("7 хв. Зв'язок із текстом тесту «The Future of Shopping». Команди отримують сторону (FOR/AGAINST), 2 хв готують 3 аргументи (можна власні), потім по черзі говорять. Бонус за пасив: You are watched by cameras, Jobs are done by robots.");

  // ---------- 11 2040 ----------
  s = addRound("The world in 2040", "8", "Discussion");
  const fut = [
    "Which jobs will be done by robots?",
    "Will teachers be replaced by computers?",
    "What will be invented next?",
    "How will things be bought and sold?",
  ];
  fut.forEach((q, i) => {
    const y = 1.3 + i * 0.78;
    card(s, 0.5, y, 6.2, 0.62, i % 2 ? C.background2 : C.accent5, "future q " + (i + 1));
    s.addText(q, { x: 0.75, y, w: 5.8, h: 0.62, fontSize: 18, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  card(s, 6.95, 1.3, 2.55, 3.0, C.accent3, "grammar tip");
  s.addText([
    { text: "Future passive", options: { bold: true, breakLine: true, fontSize: 16 } },
    { text: "will be + V3", options: { breakLine: true, fontSize: 16 } },
    { text: "Taxis will be driven by computers.", options: { italic: true, fontSize: 14 } },
  ], { x: 7.1, y: 1.4, w: 2.25, h: 2.8, color: C.text1, valign: "middle", align: "center", margin: 0, isTextBox: true, paraSpaceAfter: 8 });
  say(s, "I think … will be … · I don't think … will be … · Maybe … · I'm sure …");
  s.addNotes("5 хв. Пари обговорюють, потім кожна пара робить один «прогноз» для класу з future passive.");

  // ---------- 12 hot seat ----------
  pres.addSection({ title: "Final" });
  s = addRound("Hot seat: quick questions", "9", "Final");
  const hot = [
    "How many hours a day do you spend on your phone?",
    "What's the best app on your phone? Why?",
    "Have you ever lost your phone?",
    "What was the last thing you downloaded?",
    "Who do you text most often?",
    "What would you have repaired if you could?",
    "Is your phone ever switched off?",
    "What gadget would you like to get next?",
  ];
  hot.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.25 + row * 0.82;
    card(s, x, y, 4.4, 0.68, row % 2 ? C.background2 : C.accent5, "hot q " + (i + 1));
    s.addText(q, { x: x + 0.2, y, w: 4.0, h: 0.68, fontSize: 14, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "One student sits in the hot seat. The class asks. Answer fast, in full sentences!", 4.6);
  s.addNotes("5 хв. Учень на «гарячому стільці» 1 хв відповідає на питання, які ставлять інші (з екрана або власні). Змінюються по черзі.");

  // ---------- 13 finish ----------
  s = pres.addSlide({ masterName: "COVER", sectionTitle: "Final" });
  s.addText("Who's the winner?", { placeholder: "title" });
  s.addText("Count your points. Lingo Coins for the best speakers!\nToday I can talk about technology and use the passive.", { placeholder: "body" });
  s.addShape(pres.shapes.OVAL, { x: 7.2, y: 1.45, w: 2.0, h: 2.0, fill: { color: C.accent3 }, line: { color: "C99A2E", width: 2 }, objectName: "coin" });
  s.addImage({ data: IC.star, x: 7.85, y: 2.1, w: 0.7, h: 0.7, altText: "star" });
  s.addNotes("Підрахунок балів, Lingo Coins (до 5). Рефлексія: кожен називає одне нове слово й одне речення в пасиві, яке сьогодні сказав.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})();
