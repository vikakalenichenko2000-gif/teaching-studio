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
  pres.title = "Fashion Time Machine";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: "COVER",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.2, w: 5.6, h: 1.75, fontSize: 40, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 3.15, w: 5.6, h: 1.2, fontSize: 18, color: C.background2, valign: "top", margin: 0 }, text: "" } },
      { text: { text: "lingo  english school", options: { x: 0.6, y: 4.85, w: 4, h: 0.35, fontSize: 12, color: C.background2, bold: true, margin: 0 } } },
    ],
  });
  pres.defineSlideMaster({
    title: "ROUND",
    background: { color: C.background1 },
    margin: [0.5, 0.5, 0.5, 0.5],
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 1.35, y: 0.32, w: 8.1, h: 0.7, fontSize: 32, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: "Fashion Time Machine · Lingo English School", options: { x: 0.5, y: 5.22, w: 5, h: 0.25, fontSize: 10, color: C.accent1, margin: 0 } } },
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

  const fs = require("fs");
  const A = process.env.ASSETS;
  const pic = (f) => "image/png;base64," + fs.readFileSync(path.join(A, f)).toString("base64");
  const PIC = { A: pic("A_hippies.png"), B: pic("B_punks.png"), C: pic("C_skaters.png") };
  const DIM = { A: [592, 572], B: [588, 572], C: [280, 548] };
  const fit = (s, k, x, y, w, h, alt) => {
    const [iw, ih] = DIM[k]; const r = Math.min(w / iw, h / ih); const ww = iw * r, hh = ih * r;
    s.addImage({ data: PIC[k], x: x + (w - ww) / 2, y: y + (h - hh) / 2, w: ww, h: hh, altText: alt });
  };
  const IC2 = { shirt: await icon(fa.FaTshirt, HEX.accent), cut: await icon(fa.FaCut, HEX.accent), mic: await icon(fa.FaMicrophone, HEX.accent), camera: await icon(fa.FaCamera, HEX.accent), palette: await icon(fa.FaPalette, HEX.accent), search: await icon(fa.FaSearch, HEX.accent), music: await icon(fa.FaMusic, HEX.accent) };
  const grid = (s, items, cols, y0, h, gapY, fs = 16, fills) => {
    const w = (9.0 - (cols - 1) * 0.2) / cols;
    items.forEach((t, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 0.5 + col * (w + 0.2), y = y0 + row * (h + gapY);
      card(s, x, y, w, h, fills ? fills(i, row) : (row % 2 ? C.background2 : C.accent5), "item " + (i + 1));
      s.addText(t, { x: x + 0.2, y, w: w - 0.4, h, fontSize: fs, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
    });
  };

  // ---------- 1 cover ----------
  pres.addSection({ title: "Start" });
  let s = pres.addSlide({ masterName: "COVER", sectionTitle: "Start" });
  s.addText("Fashion Time Machine", { placeholder: "title" });
  s.addText("Go Getter 4 · 1.5 Teenage fashions · Speaking games", { placeholder: "body" });
  [["A", 6.45], ["B", 7.5], ["C", 8.55]].forEach(([k, x]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.3, w: 0.95, h: 1.55, rectRadius: 0.1, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: "pic frame " + k });
    fit(s, k, x + 0.05, 1.35, 0.85, 1.45, { A: "hippies", B: "punks", C: "skater" }[k]);
  });
  s.addNotes("Додатковий урок-гра на говоріння до Go Getter 4, урок 1.5 «Teenage fashions» (хіпі, панки, скейтери; лексика Hairstyles; опис зовнішності; Past Simple). 35–45 хв. Розділіть клас на команди, бали — на дошці.");

  // ---------- 2 rules ----------
  s = addRound("How we play", "★", "Start");
  const rules = [
    [IC.users, "Teams", "Work in teams of 2–3. Choose a team name."],
    [IC.comment, "1 point", "for every full answer in English: say why!"],
    [IC.bolt, "+1 bonus", "for a new hair word or the Past Continuous: she was wearing…"],
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
  s.addNotes("Бонус +1: нове слово з Hairstyles (curly, dyed, shaved, spiky, straight, wavy, bald, beard, moustache) або Past Continuous (She was wearing a red leather jacket). Lingo Coins — за правилами школи.");

  // ---------- 3 who are they ----------
  pres.addSection({ title: "Warm-up" });
  s = addRound("Who are they?", "1", "Warm-up");
  [["A", 0.5], ["B", 3.6], ["C", 6.7]].forEach(([k, x]) => {
    card(s, x, 1.25, 2.8, 2.55, C.accent5, "picture card " + k);
    fit(s, k, x + 0.15, 1.35, 2.5, 2.35, { A: "hippies", B: "punks", C: "skater" }[k]);
  });
  s.addText("Hippies, punks or skaters? When was it popular? What are they wearing? What's their hair like?", { x: 0.5, y: 3.9, w: 9.0, h: 0.6, fontSize: 16, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  say(s, "In picture A, they're wearing …   ·   She's got long wavy hair   ·   It was popular in the …");
  s.addNotes("5 хв. Без підручника! Команди по черзі описують одну картинку (2–3 речення). Відповіді: A — hippies, 1960s; B — punks, 1970s–80s; C — skater, 1990s–2000s.");

  // ---------- 4 name a famous person ----------
  s = addRound("Name a famous person with…", "2", "Warm-up");
  grid(s, ["curly hair", "spiky hair", "a beard", "a moustache", "dyed hair", "straight hair", "wavy hair", "no hair: bald!"], 4, 1.35, 1.1, 0.25, 20);
  say(s, "… has got curly hair.   ·   … is bald.   ·   In the film …, he's got a moustache.");
  s.addNotes("5 хв. Команда за 20 секунд називає відому людину/персонажа з такою зачіскою (співаки, футболісти, мультики). +1 бал за правильну відповідь повним реченням.");

  // ---------- 5 guess who ----------
  s = addRound("Guess who?", "3", "Warm-up");
  const cats = [
    ["look", "pretty, good-looking, cool"],
    ["height", "tall, short, medium height"],
    ["build", "slim, well-built, strong"],
    ["face", "blue eyes, freckles, a big smile"],
    ["hair", "short, long, curly, straight, dyed …"],
  ];
  cats.forEach(([h, t], i) => {
    const x = 0.5 + i * 1.84;
    card(s, x, 1.35, 1.66, 2.3, i === 4 ? C.accent3 : C.accent5, "category " + (i + 1));
    s.addText(h, { x: x + 0.1, y: 1.5, w: 1.46, h: 0.5, fontSize: 18, bold: true, color: C.text1, align: "center", margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.12, y: 2.05, w: 1.42, h: 1.5, fontSize: 14, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addText("Describe a classmate or a famous person. Don't say the name! The others guess.", { x: 0.5, y: 3.8, w: 9.0, h: 0.6, fontSize: 16, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  say(s, "This person is quite tall and slim.   ·   He's got short straight hair.   ·   She's got blue eyes.");
  s.addNotes("5 хв. Зв'язок із впр. 2–3 SB. Учень описує однокласника або зірку за 5 категоріями, інші вгадують. Стежте, щоб описи були доброзичливими.");

  // ---------- 6 this or that ----------
  s = addRound("This or that? Fashion edition", "4", "Warm-up");
  const pairs = [["baggy jeans", "skinny jeans"], ["trainers", "boots"], ["a hoodie", "a leather jacket"], ["a baseball cap", "no hat"], ["dyed hair", "natural hair"], ["long hair", "short hair"]];
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
  say(s, "I'd wear … because …   ·   I prefer … because it's more comfortable / cool / …");
  s.addNotes("4 хв. Швидко по колу. Можна рухливо: ліва сторона класу — перший варіант, права — другий.");

  // ---------- 7 H P S ----------
  pres.addSection({ title: "The text" });
  s = addRound("Hippies, punks or skaters?", "5", "The text");
  const hps = [
    "They wore safety pins as earrings.",
    "They painted their faces with flowers.",
    "They wore baseball caps or hoodies.",
    "Their music was loud and angry.",
    "They wanted peace and freedom.",
    "They wanted to be comfortable.",
    "Men had long hair and beards.",
    "Blue, pink and green hair was popular.",
  ];
  hps.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.25 + row * 0.82;
    card(s, x, y, 4.4, 0.68, row % 2 ? C.background2 : C.accent5, "statement " + (i + 1));
    s.addText(String(i + 1), { x: x + 0.1, y, w: 0.45, h: 0.68, fontSize: 16, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
    s.addText(t, { x: x + 0.6, y, w: 3.65, h: 0.68, fontSize: 15, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "Show H, P or S! Then say: I think it's the punks because …", 4.6);
  s.addNotes("5 хв. Кожна команда має 3 картки H / P / S і показує відповідь одночасно. Відповіді — на наступному слайді.");

  // ---------- 8 answers ----------
  s = addRound("Answers", "5", "The text");
  const hpsA = ["P", "H", "S", "P", "H", "S", "H", "P"];
  const name = { H: "hippies", P: "punks", S: "skaters" };
  hps.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.25 + row * 0.82;
    const k = hpsA[i];
    card(s, x, y, 4.4, 0.68, k === "H" ? C.accent2 : k === "P" ? C.background2 : C.accent5, "answer " + (i + 1));
    s.addShape(pres.shapes.OVAL, { x: x + 0.12, y: y + 0.12, w: 0.44, h: 0.44, fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, objectName: "answer badge " + (i + 1) });
    s.addText(k, { x: x + 0.12, y: y + 0.12, w: 0.44, h: 0.44, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText([{ text: name[k] + ": ", options: { bold: true } }, { text: t }], { x: x + 0.7, y, w: 3.55, h: 0.68, fontSize: 14, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "Which fashion do you like the most? Why?", 4.6);
  s.addNotes("Покажіть відповіді, порахуйте бали. Перехід до SB впр. 6: кожен відповідає, який стиль йому подобається і чому.");

  // ---------- 9 interview ----------
  pres.addSection({ title: "Speaking" });
  s = addRound("Time machine interview", "6", "Speaking");
  [["A", "a hippie in 1968"], ["B", "a punk in 1979"], ["C", "a skater in 1999"]].forEach(([k, t], i) => {
    const y = 1.25 + i * 1.08;
    card(s, 0.5, y, 3.6, 0.95, i === 1 ? C.background2 : C.accent5, "role " + k);
    fit(s, k, 0.6, y + 0.05, 0.6, 0.85, name[["H", "P", "S"][i]]);
    s.addText([{ text: "Student A: ", options: { bold: true } }, { text: "you are " + t }], { x: 1.35, y, w: 2.65, h: 0.95, fontSize: 15, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  card(s, 4.35, 1.25, 5.15, 3.11, C.accent3, "journalist card");
  s.addImage({ data: IC2.mic, x: 4.6, y: 1.42, w: 0.4, h: 0.4, altText: "microphone" });
  s.addText("Student B: you are a journalist", { x: 5.1, y: 1.35, w: 4.2, h: 0.55, fontSize: 16, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  s.addText([
    { text: "What are you wearing today?", options: { bullet: true, breakLine: true } },
    { text: "What's your hair like?", options: { bullet: true, breakLine: true } },
    { text: "What music do you like?", options: { bullet: true, breakLine: true } },
    { text: "Why do you dress like this?", options: { bullet: true, breakLine: true } },
    { text: "What do your parents think about it?", options: { bullet: true } },
  ], { x: 4.6, y: 2.0, w: 4.7, h: 2.25, fontSize: 15, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 4, isTextBox: true });
  say(s, "I'm wearing …   ·   My hair is …   ·   I dress like this because I want to …");
  s.addNotes("7 хв. Рольова гра в парах: A — хіпі/панк/скейтер з минулого (говорить у Present Simple/Continuous), B — журналіст. 2 хв, потім обмін ролями. Кілька пар показують класу.");

  // ---------- 10 family detectives ----------
  s = addRound("Family fashion detectives", "7", "Speaking");
  grid(s, [
    "What did your mum or dad wear when they were teenagers?",
    "What was your grandma's hair like when she was young?",
    "Did anyone in your family have a beard or a moustache?",
    "Have you ever seen a funny old family photo? What were people wearing?",
    "Would you wear your parents' old clothes today? Why? Why not?",
    "Is there a family member who still loves an old style?",
  ], 2, 1.25, 0.88, 0.18, 15);
  say(s, "My mum wore …   ·   She was wearing …   ·   Her hair was …");
  s.addNotes("6 хв. Зв'язок із коментарями Suzie і Leo та SB впр. 7. Пари обговорюють, потім кожен розповідає про родича партнера (+1 за Past Continuous).");

  // ---------- 11 design ----------
  s = addRound("Design a teen fashion for 2040", "8", "Speaking");
  const steps = [[IC2.palette, "Name", "Give your style a cool name."], [IC2.shirt, "Clothes", "What do people wear?"], [IC2.cut, "Hair", "What's their hair like?"], [IC2.music, "Music", "What music do they love?"]];
  steps.forEach(([img, h, t], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.35, 2.1, 2.4, i % 2 ? C.background2 : C.accent5, "step " + (i + 1));
    s.addImage({ data: img, x: x + 0.82, y: 1.55, w: 0.45, h: 0.45, altText: h });
    s.addText(h, { x: x + 0.1, y: 2.1, w: 1.9, h: 0.45, fontSize: 18, bold: true, color: C.text1, align: "center", margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.15, y: 2.6, w: 1.8, h: 1.0, fontSize: 14, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addText("Plan in teams (3 minutes), then present your style in 1 minute. The class votes for the best one!", { x: 0.5, y: 3.85, w: 9.0, h: 0.6, fontSize: 16, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  say(s, "Our style is called …   ·   People wear …   ·   Their hair is …   ·   They want to …");
  s.addNotes("8 хв. Креативне завдання: команди вигадують молодіжну моду 2040 року, малюють ескіз (за бажанням) і презентують. Голосування: за свою команду голосувати не можна.");

  // ---------- 12 would you rather ----------
  pres.addSection({ title: "Final" });
  s = addRound("Would you rather…?", "9", "Final");
  const wyr = [
    "…dye your hair green for a month or shave your head?",
    "…wear your grandma's clothes for a week or your little brother's?",
    "…wear only one colour for a year or never wear jeans again?",
    "…have spiky blue hair for a week or a moustache for a day?",
  ];
  wyr.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.3 + row * 1.6;
    card(s, x, y, 4.4, 1.4, i === 1 || i === 2 ? C.background2 : C.accent5, "question " + (i + 1));
    s.addImage({ data: [IC2.palette, IC2.shirt, IC2.search, IC2.cut][i], x: x + 0.25, y: y + 0.45, w: 0.5, h: 0.5, altText: "icon" });
    s.addText(q, { x: x + 0.95, y, w: 3.3, h: 1.4, fontSize: 16, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  say(s, "I'd rather … because …   ·   No way! I'd never …");
  s.addNotes("4 хв. Швидкий фінальний раунд для сміху: кожен обирає й пояснює.");

  // ---------- 13 finish ----------
  s = pres.addSlide({ masterName: "COVER", sectionTitle: "Final" });
  s.addText("Who's the winner?", { placeholder: "title" });
  s.addText("Count your points. Lingo Coins for the best speakers!\nToday I can talk about fashions from the past and describe people's hair.", { placeholder: "body" });
  s.addShape(pres.shapes.OVAL, { x: 7.2, y: 1.45, w: 2.0, h: 2.0, fill: { color: C.accent3 }, line: { color: "C99A2E", width: 2 }, objectName: "coin" });
  s.addImage({ data: IC.star, x: 7.85, y: 2.1, w: 0.7, h: 0.7, altText: "star" });
  s.addNotes("Підрахунок балів, Lingo Coins (до 5). Рефлексія: кожен називає 2 нові слова про зачіски і одне речення про моду минулого.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})();
