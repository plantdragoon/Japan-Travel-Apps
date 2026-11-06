// Japan Travel Concierge - Interactive Large Home Screen Widget
// Fully Dynamic Architecture: Auto-Syncs Products, Action Milestones, Emergency Hub, Contextual Phrases & Taxi Flashcards directly from Google Docs
// With Gemini 3.5 Flash Dynamic Engine, Brave Browser Deep-Linking, Dual Clock, Suica / Apple Wallet & Live Yen

// Secure Credentials: Loaded locally from iOS Keychain if configured on your phone,
// keeping your secret keys and travel doc 100% private and off public GitHub.
const DOC_ID = (typeof Keychain !== "undefined" && Keychain.contains("DOC_ID")) ? Keychain.get("DOC_ID") : "";
const DOC_URL = DOC_ID ? `https://docs.google.com/document/d/${DOC_ID}/edit` : "";
const GEMINI_KEY = (typeof Keychain !== "undefined" && Keychain.contains("GEMINI_KEY")) ? Keychain.get("GEMINI_KEY") : "";

// Browser Preference: Routes web links directly into Brave iOS app
const PREFER_BRAVE = true;

function toBrowserUrl(url) {
  if (PREFER_BRAVE && url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return "brave://open-url?url=" + encodeURIComponent(url);
  }
  return url;
}

// -------------------------------------------------------------
// BASELINE STATIC FALLBACKS (Used ONLY when offline or network fails)
// -------------------------------------------------------------
const BASELINE_PRODUCTS = [
  { name: "Quince Small Carry-On", category: "Primary Luggage", price: "~$120", note: "Hard-shell carry-on fits overhead bins on domestic & international flights", url: "https://www.quince.com/travel/hard-shell-small-carry-on-suitcase" },
  { name: "Wandf Foldable Travel Duffle (20L)", category: "Packable Souvenir Bag", price: "~$15", note: "Folds completely flat into luggage; unfolds for souvenirs on return flight", url: "https://www.amazon.com/WANDF-Foldable-Duffel-Luggage-Sports/dp/B073XH5543" },
  { name: "Wander Plus Original Pillow", category: "Travel Pillow", price: "~$60", note: "Ergonomic neck support for the 13-hour IAH ✈ HND flight", url: "https://www.wander-plus.com/products/original-pillow?variant=50200148345153" },
  { name: "Concept Global Travel Sling Bag", category: "Daypack / Sling (4L–6L)", price: "4L - 6L", note: "Everyday carry for phone, passport, coin pouch & battery pack", url: "https://conceptglobal.co/collections/travel-sling-bags" },
  { name: "DiFOLD Origami Water Bottle", category: "Collapsible Water Bottle", price: "~$30", note: "Folds down flat to save daypack space when empty between stations", url: "https://difold.com/products/origami-bottle" },
  { name: "ArmsEzzz Wearable Travel Armrest", category: "Long-Haul Flight Comfort", price: "~$35", note: "Shoulder-supported sling armrest for long flights", url: "https://armsezzz.com/products/armsezzz-travel-armrest" }
];

const BASELINE_MILESTONES = [
  ["2026-12-22T23:59:59", "Dec 22 • 1st Tour Installment ($3,224)"],
  ["2026-12-24T23:59:59", "Dec 24 • Passport & Emergency Contact"],
  ["2027-02-22T23:59:59", "Feb 22 • Final Tour Installment ($649)"],
  ["2027-02-28T19:00:00", "Feb 28 @ 7 PM • SmartEX Nozomi Seats Open"],
  ["2027-03-20T11:10:00", "Mar 20 @ 11:10 AM • ANA Aisle Seat Check-In"],
  ["2027-03-21T07:00:00", "Mar 21 @ 7:00 AM • Departure Day ✈ LIT to TYO"]
];

const BASELINE_PHRASES = [
  ["こんばんは","Konbanwa","Good evening"],
  ["おやすみなさい","Oyasuminasai","Good night"],
  ["静かにしてください","Shizuka ni shite kudasai","Please be quiet"],
  ["お茶をください","Ocha o kudasai","Tea, please"],
  ["水をお願いします","Mizu o onegaishimasu","Water, please"],
  ["おはようございます","Ohayou gozaimasu","Good morning"],
  ["いただきます","Itadakimasu","Thank you for the meal (before eating)"],
  ["これはいくらですか？","Kore wa ikura desu ka?","How much is this?"],
  ["駅はどこですか？","Eki wa doko desu ka?","Where is the station?"],
  ["トイレはどこですか？","Toire wa doko desu ka?","Where is the restroom?"],
  ["お会計をお願いします","Okaikei o onegaishimasu","The check, please"],
  ["おすすめは何ですか？","Osusume wa nan desu ka?","What do you recommend?"],
  ["英語を話せますか？","Eigo o hanasemasu ka?","Do you speak English?"],
  ["烏龍茶をお願いします","Uron-cha o onegaishimasu","Oolong tea, please (zero alcohol)"],
  ["すみません","Sumimasen","Excuse me / pardon"],
  ["写真を撮ってもいいですか？","Shashin totte mo ii?","May I take a photo?"],
  ["緑茶をください","Ryokucha o kudasai","Green tea, please"],
  ["こんにちは","Konnichiwa","Hello / Good afternoon"],
  ["英語メニューありますか？","Eigo menyuu arimasu ka?","English menu, please?"],
  ["ごちそうさまでした","Gochisousama deshita","Thank you for the meal"],
  ["貸切風呂はありますか？","Kashikiri buro arimasu ka?","Private onsen available?"],
  ["Suicaは使えますか？","Suica wa tsukaemasu ka?","Can I use Suica / IC card?"],
  ["ありがとうございます","Arigatou gozaimasu","Thank you very much"],
  ["また明日","Mata ashita","See you tomorrow"]
];

const BASE_PLACES = [
  ["Hotel Groove Shinjuku (Tokyo)", "ホテルグルーヴ新宿", "東京都新宿区歌舞伎町1-29-1 東急歌舞伎町タワー", "ホテルグルーヴ新宿までお願いします。", "Hotel Groove Shinjuku, Tokyo"],
  ["Citadines Shinjuku (Buffer Night)", "シタディーン新宿", "東京都新宿区新宿1-28-13", "シタディーン新宿までお願いします。", "Citadines Shinjuku Tokyo"],
  ["Solaria Nishitetsu (Kyoto)", "ソラリア西鉄ホテル京都プレミア", "京都府京都市中京区上大阪町509", "ソラリア西鉄ホテル京都プレミアまでお願いします。", "Solaria Nishitetsu Hotel Kyoto Premier"],
  ["VOCO Osaka Central (Osaka)", "voco大阪セントラル", "大阪府大阪市中央区京町堀1-7-1", "voco大阪セントラルまでお願いします。", "voco Osaka Central"],
  ["Universal Studios Japan (USJ)", "ユニバーサル・スタジオ・ジャパン", "大阪府大阪市此花区桜島2-1-33", "ユニバーサル・スタジオ・ジャパンまでお願いします。", "Universal Studios Japan, Osaka"],
  ["Dotonbori / Glico (Osaka)", "道頓堀", "大阪府大阪市中央区道頓堀1丁目", "道頓堀までお願いします。", "Dotonbori, Osaka"],
  ["Shinsekai / Tsutenkaku (Osaka)", "新世界・通天閣", "大阪府大阪市浪速区恵美須東1-18-6", "通天閣までお願いします。", "Tsutenkaku Tower, Osaka"],
  ["Tokyo Station (Shinkansen)", "東京駅", "東京都千代田区丸の内1丁目", "東京駅の八重洲口までお願いします。", "Tokyo Station"],
  ["Haneda Airport (HND)", "羽田空港", "東京都大田区羽田空港", "羽田空港国際線ターミナルまでお願いします。", "Haneda Airport Terminal 3"]
];

// -------------------------------------------------------------
// APP LAUNCH ROUTING (Widget vs Interactive Modals)
// -------------------------------------------------------------
let isTaxi = args.queryParameters && (args.queryParameters.action === "taxi" || args.queryParameters.taxi);
let isIntel = args.queryParameters && (args.queryParameters.action === "intel" || args.queryParameters.intel);
let isConverter = args.queryParameters && (args.queryParameters.action === "converter" || args.queryParameters.converter || args.queryParameters.action === "yen" || args.queryParameters.yen);

if (isTaxi) {
  let [info] = await Promise.all([loadItinerary()]);
  await showTaxi(info);
  Script.complete();
} else if (isIntel) {
  let [info, yenData] = await Promise.all([loadItinerary(), fetchYenData()]);
  await showIntel(info, yenData.label);
  Script.complete();
} else if (isConverter) {
  let yenData = await fetchYenData();
  await showConverter(yenData.rate);
  Script.complete();
} else if (config.runsInWidget) {
  let w = await makeWidget();
  Script.setWidget(w);
  Script.complete();
} else {
  // Direct test run inside Scriptable editor
  let menu = new Alert();
  menu.title = "Japan Travel Concierge";
  menu.message = "Choose an option to preview:";
  menu.addAction("Preview Large Widget Face");
  menu.addAction("✦ Expanded Intel, Gear & Emergency Hub");
  menu.addAction("🚕 Test Dynamic Taxi Flashcards");
  menu.addAction("💴 Test Interactive Yen Calculator");
  menu.addCancelAction("Cancel");
  let res = await menu.presentAlert();
  if (res === 0) {
    let w = await makeWidget();
    w.presentLarge();
  } else if (res === 1) {
    let [info, yenData] = await Promise.all([loadItinerary(), fetchYenData()]);
    await showIntel(info, yenData.label);
  } else if (res === 2) {
    let [info] = await Promise.all([loadItinerary()]);
    await showTaxi(info);
  } else if (res === 3) {
    let yenData = await fetchYenData();
    await showConverter(yenData.rate);
  }
  Script.complete();
}

// -------------------------------------------------------------
// WIDGET FACE BUILDER
// -------------------------------------------------------------
async function makeWidget() {
  let w = new ListWidget();
  let now = new Date();
  w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 5);
  w.url = toBrowserUrl(DOC_URL);

  // Premium Deep Slate Gradient
  let bg = new LinearGradient();
  bg.locations = [0, 1];
  bg.colors = [new Color("#131722"), new Color("#080a0e")];
  w.backgroundGradient = bg;
  w.setPadding(18, 16, 16, 16);

  let [info, yen] = await Promise.all([loadItinerary(), fetchYen()]);
  let hr = now.getHours();

  // 1. Dynamic Milestone Ticker (Calculated from Section 1 of Doc)
  let ms = info.activeMilestone || parseMilestonesFromDoc(info.rawDocText, now) || getMilestone(now);

  // 2. Dynamic Context-Aware Phrase (Matched to today's city/activity)
  let phraseObj = info.phrase || null;
  let [jp, rom, en] = phraseObj
    ? [phraseObj.japanese, phraseObj.romaji, phraseObj.english]
    : BASELINE_PHRASES[hr % 24];

  let phraseTag = phraseObj && phraseObj.tag ? phraseObj.tag : ("HOUR " + formatHour(hr));

  let tyo = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',hour:'numeric',minute:'2-digit'}).format(now);
  let lit = new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(now);

  let baseRun = URLScheme.forRunningScript();
  let sep = baseRun && baseRun.includes("?") ? "&" : "?";

  // Header Row: Destination + Weather + Dual Clock
  let hRow = w.addStack();
  hRow.layoutHorizontally();

  let hLeft = hRow.addStack();
  hLeft.layoutVertically();
  let cityTxt = hLeft.addText((info.city || "Tokyo").toUpperCase());
  cityTxt.font = Font.heavySystemFont(17);
  cityTxt.textColor = Color.white();

  let subTxt = hLeft.addText(info.day || "SideQuests Japan 2027");
  subTxt.font = Font.semiboldSystemFont(10);
  subTxt.textColor = new Color("#ff5c6a");

  hRow.addSpacer();

  let hRight = hRow.addStack();
  hRight.layoutVertically();
  let wTxt = hRight.addText(info.weather || "63°F • Clear");
  wTxt.font = Font.boldSystemFont(11);
  wTxt.textColor = new Color("#94a3b8");
  wTxt.rightAlignText();

  let clkTxt = hRight.addText("TYO " + tyo + "  •  LIT " + lit);
  clkTxt.font = Font.mediumSystemFont(9.5);
  clkTxt.textColor = new Color("#64748b");
  clkTxt.rightAlignText();

  w.addSpacer(10);

  // Milestone Countdown Banner (Dynamic from Section 1)
  if (ms) {
    let mBox = w.addStack();
    mBox.layoutHorizontally();
    mBox.backgroundColor = new Color("#1e293b", 0.65);
    mBox.cornerRadius = 6;
    mBox.setPadding(5, 9, 5, 9);

    let mDot = mBox.addText("⏳ ");
    mDot.font = Font.systemFont(8);

    let mText = mBox.addText(ms.text);
    mText.font = Font.boldSystemFont(9);
    mText.textColor = new Color("#cbd5e1");
    mText.lineLimit = 1;
    mText.minimumScaleFactor = 0.8;

    mBox.addSpacer();

    let mBadge = mBox.addText(ms.days > 0 ? (ms.days + "d left") : "Today");
    mBadge.font = Font.heavySystemFont(9);
    mBadge.textColor = new Color("#ffd166");

    w.addSpacer(10);
  }

  // Schedule Focus Card
  let fBox = w.addStack();
  fBox.layoutVertically();
  fBox.backgroundColor = new Color("#161d2b");
  fBox.cornerRadius = 9;
  fBox.setPadding(10, 12, 10, 12);
  fBox.url = toBrowserUrl(DOC_URL);

  let fTop = fBox.addStack();
  fTop.layoutHorizontally();
  let fDot = fTop.addText("● ");
  fDot.font = Font.boldSystemFont(9);
  fDot.textColor = new Color("#ff5c6a");
  let fLabel = fTop.addText("SCHEDULE FOCUS");
  fLabel.font = Font.heavySystemFont(8);
  fLabel.textColor = new Color("#8fa2b8");

  fTop.addSpacer();

  let fDocLink = fTop.addText("Master Hub ↗");
  fDocLink.font = Font.boldSystemFont(8);
  fDocLink.textColor = new Color("#63b3ed");

  fBox.addSpacer(3);

  let fMain = fBox.addText(info.activity);
  fMain.font = Font.systemFont(10.5);
  fMain.textColor = Color.white();
  fMain.lineLimit = 3;
  fMain.minimumScaleFactor = 0.85;

  w.addSpacer(10);

  // Gemini Intel Card (Tap to Expand Modal)
  let aBox = w.addStack();
  aBox.layoutVertically();
  aBox.backgroundColor = new Color("#221a28");
  aBox.cornerRadius = 9;
  aBox.setPadding(10, 12, 10, 12);
  aBox.url = baseRun ? (baseRun + sep + "action=intel") : toBrowserUrl(DOC_URL);

  let aTop = aBox.addStack();
  aTop.layoutHorizontally();
  let aSparkle = aTop.addText("✦ ");
  aSparkle.font = Font.boldSystemFont(9);
  aSparkle.textColor = new Color("#ffd166");
  let aLabel = aTop.addText("GEMINI CONCIERGE INTEL");
  aLabel.font = Font.heavySystemFont(8);
  aLabel.textColor = new Color("#ffd166");

  aTop.addSpacer();

  let aExpand = aTop.addText("Tap to Expand ↗");
  aExpand.font = Font.boldSystemFont(8);
  aExpand.textColor = new Color("#ffd166");

  aBox.addSpacer(3);

  let aTip = aBox.addText(info.tip);
  aTip.font = Font.mediumSystemFont(10.5);
  aTip.textColor = new Color("#f0f4f8");
  aTip.lineLimit = 3;
  aTip.minimumScaleFactor = 0.85;

  w.addSpacer(10);

  // Contextual Japanese Phrase of the Day / Hour
  let pBox = w.addStack();
  pBox.layoutHorizontally();
  pBox.backgroundColor = new Color("#151a24");
  pBox.cornerRadius = 8;
  pBox.setPadding(9, 11, 9, 11);
  pBox.url = toBrowserUrl("https://translate.google.com/?sl=ja&tl=en&text=" + encodeURIComponent(jp) + "&op=translate");

  let pLeft = pBox.addStack();
  pLeft.layoutVertically();

  let pTop = pLeft.addStack();
  pTop.layoutHorizontally();
  let pHeader = pTop.addText("PHRASE (" + phraseTag.toUpperCase() + ")");
  pHeader.font = Font.heavySystemFont(8);
  pHeader.textColor = new Color("#7c8ba1");
  pTop.addSpacer(6);
  let pAudio = pTop.addText("•  Listen 🔊");
  pAudio.font = Font.boldSystemFont(8);
  pAudio.textColor = new Color("#ffd166");

  pLeft.addSpacer(2);

  let pText = pLeft.addText(jp + "  (" + rom + ")");
  pText.font = Font.boldSystemFont(10.5);
  pText.textColor = Color.white();
  pText.minimumScaleFactor = 0.85;

  pBox.addSpacer();

  let pMean = pBox.addText("“" + en + "”");
  pMean.font = Font.semiboldSystemFont(9.5);
  pMean.textColor = new Color("#ffd166");
  pMean.minimumScaleFactor = 0.85;

  w.addSpacer(12);

  // Action Buttons
  let row = w.addStack();
  row.layoutHorizontally();

  let btnTaxi = row.addStack();
  btnTaxi.backgroundColor = new Color("#273142");
  btnTaxi.cornerRadius = 6;
  btnTaxi.setPadding(7, 11, 7, 11);
  btnTaxi.url = baseRun ? (baseRun + sep + "action=taxi") : toBrowserUrl(DOC_URL);

  let tTxt = btnTaxi.addText("🚕 Taxi Card");
  tTxt.font = Font.boldSystemFont(9);
  tTxt.textColor = Color.white();

  row.addSpacer();

  let btnWallet = row.addStack();
  btnWallet.backgroundColor = new Color("#183152");
  btnWallet.cornerRadius = 6;
  btnWallet.setPadding(7, 11, 7, 11);
  btnWallet.url = "shoebox://";
  let wBtn = btnWallet.addText("💳 Suica / Transit");
  wBtn.font = Font.boldSystemFont(9);
  wBtn.textColor = new Color("#63b3ed");

  row.addSpacer();

  let btnYen = row.addStack();
  btnYen.backgroundColor = new Color("#24252b");
  btnYen.cornerRadius = 6;
  btnYen.setPadding(7, 11, 7, 11);
  btnYen.url = baseRun ? (baseRun + sep + "action=converter") : toBrowserUrl("https://www.google.com/search?q=1000+jpy+to+usd");
  let yTxt = btnYen.addText("💴 " + yen);
  yTxt.font = Font.boldSystemFont(9);
  yTxt.textColor = new Color("#ffd166");

  return w;
}

// -------------------------------------------------------------
// DYNAMIC GOOGLE DOC PARSERS (Products, Milestones, Emergency Hub)
// -------------------------------------------------------------
function parseProductsFromDoc(txt) {
  let products = [];
  if (!txt || typeof txt !== "string") return products;

  let sIdx = txt.search(/4\.\s*Packing\s*&/i);
  if (sIdx === -1) sIdx = txt.search(/Packing\s*&\s*Planned/i);
  if (sIdx === -1) return products;

  let rest = txt.substring(sIdx);
  let nextSectionIdx = rest.search(/\n\s*5\.\s*|\n\s*Cultural\s*&|\n\s*Comprehensive/i);
  let section = nextSectionIdx !== -1 ? rest.substring(0, nextSectionIdx) : rest;

  let lines = section.split("\n");
  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.startsWith("•")) {
      let content = trimmed.replace(/^[*\-•]\s*/, "");
      if (content.toLowerCase().startsWith("packing & planned") || content.toLowerCase().startsWith("4.")) continue;

      let category = "Planned Gear";
      let name = content;
      let price = "";
      let note = "";
      let url = "";

      let urlMatch = content.match(/https?:\/\/[^\s\)]+/);
      if (urlMatch) {
        url = urlMatch[0];
        content = content.replace(url, "").trim();
      }

      let priceMatch = content.match(/\(?~?\$[0-9,]+(?:\.[0-9]{2})?\)?/);
      if (priceMatch) {
        price = priceMatch[0].replace(/[()]/g, "").trim();
        content = content.replace(priceMatch[0], "").trim();
      }

      if (content.includes(":")) {
        let colonIdx = content.indexOf(":");
        category = content.substring(0, colonIdx).trim();
        content = content.substring(colonIdx + 1).trim();
      }

      if (content.includes("–")) {
        let parts = content.split("–");
        name = parts[0].trim();
        note = parts.slice(1).join("–").trim();
      } else if (content.includes(" - ")) {
        let parts = content.split(" - ");
        name = parts[0].trim();
        note = parts.slice(1).join(" - ").trim();
      } else {
        name = content.trim();
      }

      name = name.replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, "");
      note = note.replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, "");

      if (name.length > 1) {
        if (!url) {
          url = "https://www.google.com/search?q=" + encodeURIComponent(name + " buy online");
        }
        products.push({ name, category, price, note, url });
      }
    }
  }
  return products;
}

function parseMilestonesFromDoc(txt, now) {
  if (!txt || typeof txt !== "string") return null;
  let sIdx = txt.search(/1\.\s*Action\s*Items/i);
  if (sIdx === -1) sIdx = txt.search(/Action\s*Items/i);
  if (sIdx === -1) return null;

  let rest = txt.substring(sIdx);
  let nextSectionIdx = rest.search(/\n\s*2\.\s*|\n\s*Flight\s*&/i);
  let section = nextSectionIdx !== -1 ? rest.substring(0, nextSectionIdx) : rest;

  let lines = section.split("\n");
  let monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  let upcoming = [];

  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed.startsWith("*") && !trimmed.startsWith("-") && !trimmed.startsWith("•")) continue;
    let clean = trimmed.replace(/^[*\-•]\s*/, "");
    if (clean.toLowerCase().startsWith("action items") || clean.toLowerCase().startsWith("1.")) continue;

    let m = clean.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?(?:\s*@?\s*(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?)?/i);
    if (m) {
      let mon = monthMap[m[1].toLowerCase().substring(0, 3)];
      let day = parseInt(m[2], 10);
      let year = m[3] ? parseInt(m[3], 10) : (mon >= 9 ? 2026 : 2027);
      let hour = 23;
      let min = 59;
      if (m[4] && m[5]) {
        hour = parseInt(m[4], 10);
        min = parseInt(m[5], 10);
        if (m[6] && m[6].toUpperCase() === "PM" && hour < 12) hour += 12;
        if (m[6] && m[6].toUpperCase() === "AM" && hour === 12) hour = 0;
      }

      let d = new Date(year, mon, day, hour, min, 0);
      if (d > now) {
        let label = clean.replace(/https?:\/\/[^\s\)]+/g, "").replace(/\s+/g, " ").trim();
        // Remove trailing punctuation or parentheticals if overly long, without using ellipses
        if (label.length > 46) {
          let cut = label.substring(0, 46);
          let lastSpace = cut.lastIndexOf(" ");
          label = lastSpace > 20 ? cut.substring(0, lastSpace) : cut;
        }
        upcoming.push({ date: d, text: label });
      }
    }
  }

  if (upcoming.length > 0) {
    upcoming.sort((a, b) => a.date - b.date);
    let nextM = upcoming[0];
    return {
      text: nextM.text,
      days: Math.ceil((nextM.date - now) / 86400000)
    };
  }
  return null;
}

function parseEmergencyHubFromDoc(txt) {
  let hub = {
    policy: "Tin Leg Platinum Policy",
    coverage: "$20,000 Trip Cancellation • $100,000 Medical",
    hotline: "+1 727-264-5657",
    tollFree: "844-927-9265",
    claimUrl: "https://tinleg.com/report-claim",
    eTicket: "0162153570261",
    passenger: "JOSHUADANIEL WISE",
    flights: [
      { leg: "Depart Sun, Mar 21", details: "LIT 7:00 AM ➔ IAH 8:50 AM (United UA5240)" },
      { leg: "Transpacific Leg", details: "IAH 11:10 AM ➔ HND Mar 22 3:25 PM (ANA NH113)" },
      { leg: "Return Wed, Mar 31", details: "HND 5:15 PM ➔ ORD 3:15 PM (United UA882 / ANA NH114)" },
      { leg: "Final Connecting Leg", details: "ORD 7:55 PM ➔ LIT 9:54 PM (United UA4542)" }
    ]
  };

  if (!txt) return hub;

  let etMatch = txt.match(/eTicket[:\s]+([0-9]{10,15})/i);
  if (etMatch) hub.eTicket = etMatch[1];

  let intlMatch = txt.match(/\+1[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}/);
  if (intlMatch) hub.hotline = intlMatch[0];

  return hub;
}

// -------------------------------------------------------------
// EXPANDED MODAL SHEET: INTEL, GEAR, ACTIONS & EMERGENCY HUB
// -------------------------------------------------------------
async function showIntel(info, yen) {
  let wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    let url = req.url;
    if (!url) return true;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      Safari.open(toBrowserUrl(url));
      return false;
    } else if (url.startsWith("tel:") || url.startsWith("brave:") || url.startsWith("maps:") || url.startsWith("shoebox:") || url.startsWith("scriptable:")) {
      Safari.open(url);
      return false;
    }
    return true;
  };

  let hub = parseEmergencyHubFromDoc(info.rawDocText);

  // Dynamic products list extracted live from Google Doc
  let productsList = (info.products && Array.isArray(info.products) && info.products.length > 0)
    ? info.products
    : (info.rawDocText ? parseProductsFromDoc(info.rawDocText) : BASELINE_PRODUCTS);

  if (!productsList || productsList.length === 0) {
    productsList = BASELINE_PRODUCTS;
  }

  let productsHtml = productsList.map(p => {
    let targetUrl = p.url || `https://www.google.com/search?q=${encodeURIComponent(p.name + " buy online")}`;
    let priceBadge = p.price ? `<span class="product-price">${p.price}</span>` : "";
    let subDesc = (p.category ? p.category : "Planned Purchase") + (p.note ? ` • ${p.note}` : "");

    return `
      <div class="product-item">
        <div class="product-info">
          <div class="product-name">
            ${p.name}
            ${priceBadge}
          </div>
          <div class="product-desc">${subDesc}</div>
        </div>
        <a class="product-btn" href="${toBrowserUrl(targetUrl)}">Buy</a>
      </div>
    `;
  }).join("");

  let sections = (info.expandedIntel && Array.isArray(info.expandedIntel) && info.expandedIntel.length > 0)
    ? info.expandedIntel
    : [
        { icon: "💡", category: "Concierge Intel", content: info.tip || "Check your Master Hub for complete daily updates." }
      ];

  let sectionsHtml = sections.map(s => {
    let formattedContent = (s.content || "")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        if (line.startsWith("•") || line.startsWith("-")) {
          let clean = line.replace(/^[•\-]\s*/, "");
          return `<li>${clean}</li>`;
        }
        return `<p style="margin: 6px 0;">${line}</p>`;
      })
      .join("");

    if (formattedContent.includes("<li>")) {
      formattedContent = `<ul style="margin: 6px 0; padding-left: 18px;">${formattedContent}</ul>`;
    }

    return `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">${s.icon || "✦"}</span>
          <span class="card-title">${s.category || "Intel"}</span>
        </div>
        <div class="card-body">
          ${formattedContent}
        </div>
      </div>
    `;
  }).join("");

  let flightsHtml = hub.flights.map(f => `
    <div class="flight-row">
      <div class="flight-leg">${f.leg}</div>
      <div class="flight-details">${f.details}</div>
    </div>
  `).join("");

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Gemini Concierge Intel</title>
      <style>
        :root { color-scheme: dark; }
        body {
          margin: 0;
          padding: 20px 18px 48px 18px;
          background-color: #0b0e14;
          color: #f0f4f8;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .header { margin-bottom: 20px; }
        .badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .badge {
          display: inline-flex; align-items: center; background: rgba(255, 209, 102, 0.15);
          color: #ffd166; border: 1px solid rgba(255, 209, 102, 0.35); border-radius: 6px;
          padding: 3px 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .weather-pill { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; }
        .city-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 4px 0; color: #ffffff; }
        .subtitle { font-size: 13px; font-weight: 600; color: #ff5c6a; margin: 0; }
        .hero-card {
          background: linear-gradient(135deg, rgba(255, 209, 102, 0.14) 0%, rgba(255, 92, 106, 0.10) 100%);
          border: 1px solid rgba(255, 209, 102, 0.3); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }
        .hero-title { font-size: 11px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; color: #ffd166; margin-bottom: 6px; }
        .hero-body { font-size: 14px; line-height: 1.45; font-weight: 600; color: #ffffff; }
        .card { background: #141923; border: 1px solid #232c3d; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
        .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 8px; }
        .card-icon { font-size: 17px; }
        .card-title { font-size: 13px; font-weight: 700; letter-spacing: 0.3px; color: #e2e8f0; text-transform: uppercase; }
        .card-body { font-size: 13px; line-height: 1.5; color: #cbd5e1; }
        .card-body ul { margin: 0; padding-left: 18px; }
        .card-body li { margin-bottom: 6px; }
        .product-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
        .product-item:last-child { border-bottom: none; padding-bottom: 2px; }
        .product-info { flex: 1; padding-right: 12px; }
        .product-name { font-size: 13px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .product-price { font-size: 11px; font-weight: 600; color: #ffd166; background: rgba(255, 209, 102, 0.12); border: 1px solid rgba(255, 209, 102, 0.25); padding: 1px 6px; border-radius: 4px; }
        .product-desc { font-size: 11px; color: #94a3b8; margin-top: 2px; line-height: 1.35; }
        .product-btn { background: #1c2b42; color: #63b3ed; border: 1px solid rgba(99, 179, 237, 0.4); border-radius: 7px; padding: 6px 11px; font-size: 11px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .emergency-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .emerg-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; text-align: center; }
        .emerg-red { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; }
        .emerg-blue { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #93c5fd; }
        .flight-row { padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .flight-row:last-child { border-bottom: none; }
        .flight-leg { font-size: 11px; font-weight: 700; color: #ffd166; }
        .flight-details { font-size: 12px; color: #e2e8f0; margin-top: 2px; }
        .actions { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
        .btn { display: block; text-align: center; padding: 13px 16px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; }
        .btn-primary { background-color: #2b6cb0; color: #ffffff; }
        .btn-secondary { background-color: #1f2735; color: #cbd5e1; border: 1px solid #334155; }
        .footer-note { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="badge-row">
          <span class="badge">✦ Gemini Concierge Intel</span>
          <span class="weather-pill">${info.weather || "Japan 2027"}</span>
          ${yen ? `<span class="weather-pill">${yen}</span>` : ""}
        </div>
        <h1 class="city-title">${(info.city || "Tokyo").toUpperCase()}</h1>
        <p class="subtitle">${info.day || "SideQuests Japan 2027"}</p>
      </div>

      <div class="hero-card">
        <div class="hero-title">✦ Executive Headline</div>
        <div class="hero-body">${info.tip}</div>
      </div>

      <!-- Emergency, Insurance & Flight Logistics Card (Direct from Section 2) -->
      <div class="card" style="border-color: rgba(239, 68, 68, 0.35);">
        <div class="card-header">
          <span class="card-icon">🚨</span>
          <span class="card-title" style="color: #fca5a5;">Flight & Emergency Hub (Doc Section 2)</span>
        </div>
        <div class="card-body">
          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong>Policy:</strong> ${hub.policy} (${hub.coverage})<br>
            <strong>eTicket:</strong> <span style="color: #ffd166; font-family: monospace; font-size: 13px;">${hub.eTicket}</span> (${hub.passenger})
          </div>
          <div class="emergency-grid">
            <a class="emerg-btn emerg-red" href="tel:${hub.hotline.replace(/[^0-9+]/g, '')}">📞 Call 24/7 Hotline</a>
            <a class="emerg-btn emerg-blue" href="${toBrowserUrl(hub.claimUrl)}">📋 File Claim (Online)</a>
          </div>
          <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Flight Schedule:</div>
          ${flightsHtml}
        </div>
      </div>

      <!-- Dynamic Planned Purchases Section Synced Live from Google Doc Section 4 -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🛍️</span>
          <span class="card-title">Planned Gear & Purchases (${productsList.length} Items Synced)</span>
        </div>
        <div class="card-body">
          ${productsHtml}
        </div>
      </div>

      ${sectionsHtml}

      <div class="actions">
        <a class="btn btn-primary" href="${toBrowserUrl(DOC_URL)}">📖 Open Full Master Hub in Brave</a>
        <a class="btn btn-secondary" href="https://maps.apple.com/?q=${encodeURIComponent((info.city || "Tokyo") + ", Japan")}">🗺️ Explore Destination in Apple Maps</a>
      </div>

      <div class="footer-note">
        Live Auto-Sync from Google Drive & Gemini 3.5<br>
        Swipe down or tap Done to return to Home Screen
      </div>
    </body>
    </html>
  `;

  await wv.loadHTML(html);
  await wv.present(false);
}

// -------------------------------------------------------------
// DYNAMIC TAXI DRIVER FLASHCARD & DESTINATION NAVIGATOR
// -------------------------------------------------------------
async function showTaxi(info) {
  let a = new Alert();
  a.title = "🚕 Japan Taxi & Hotel Flashcard";
  a.message = "Tap your hotel or destination to show instructions in Japanese to your driver:";

  // Merge base locations with any dynamic custom places from Gemini or Doc
  let allPlaces = [...BASE_PLACES];
  if (info && info.customPlaces && Array.isArray(info.customPlaces)) {
    for (let cp of info.customPlaces) {
      if (cp.label && cp.nameJa && cp.addressJa) {
        allPlaces.push([cp.label, cp.nameJa, cp.addressJa, cp.phrase || (cp.nameJa + "までお願いします。"), cp.searchQuery || cp.label]);
      }
    }
  }

  allPlaces.forEach(p => a.addAction(p[0]));
  a.addCancelAction("Close");

  let pick = await a.presentAlert();
  if (pick >= 0 && pick < allPlaces.length) {
    let p = allPlaces[pick];
    Pasteboard.copy(p[2] + " " + p[1]);

    let card = new Alert();
    card.title = "🚕 " + p[1];
    card.message = `「${p[3]}」\n\n【住所】\n${p[2]}\n\n(Address copied to clipboard!)`;
    card.addAction("Open in Apple Maps 🗺️");
    card.addAction("Open in Google Maps 📍");
    card.addCancelAction("Done");
    let res = await card.presentAlert();
    if (res === 0) {
      Safari.open("https://maps.apple.com/?q=" + encodeURIComponent(p[4]));
    } else if (res === 1) {
      Safari.open(toBrowserUrl("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p[4])));
    }
  }
}

// -------------------------------------------------------------
// DYNAMIC INTERACTIVE YEN CURRENCY CALCULATOR
// -------------------------------------------------------------
async function showConverter(rate) {
  let wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    let url = req.url;
    if (!url) return true;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      Safari.open(toBrowserUrl(url));
      return false;
    }
    return true;
  };

  let effectiveRate = (rate && !isNaN(rate) && rate > 50) ? rate : 155.0;
  let sample1k = (1000 / effectiveRate).toFixed(2);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Japan Yen Calculator</title>
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 20px 18px 40px 18px;
          background-color: #0b0e14;
          color: #f0f4f8;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .badge {
          display: inline-flex; align-items: center; background: rgba(255, 209, 102, 0.15);
          color: #ffd166; border: 1px solid rgba(255, 209, 102, 0.35); border-radius: 6px;
          padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .title { font-size: 24px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff; }
        .rate-info { font-size: 12px; color: #94a3b8; font-weight: 500; }
        .calc-card {
          background: #141923; border: 1px solid #232c3d; border-radius: 14px;
          padding: 18px 16px; margin-bottom: 18px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .input-group { margin-bottom: 14px; }
        .label { font-size: 11px; font-weight: 700; color: #8fa2b8; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; display: block; }
        .input-wrap {
          display: flex; align-items: center; background: #0f131a; border: 1px solid #2d3748;
          border-radius: 10px; padding: 10px 14px;
        }
        .curr-sym { font-size: 22px; font-weight: 800; color: #ffd166; margin-right: 8px; }
        .yen-input {
          flex: 1; background: transparent; border: none; color: #ffffff; font-size: 26px;
          font-weight: 800; outline: none; width: 100%;
        }
        .output-card {
          background: linear-gradient(135deg, rgba(43, 108, 176, 0.25) 0%, rgba(26, 32, 44, 0.4) 100%);
          border: 1px solid rgba(99, 179, 237, 0.35); border-radius: 10px;
          padding: 12px 14px; display: flex; align-items: baseline; justify-content: space-between;
        }
        .output-label { font-size: 12px; font-weight: 700; color: #93c5fd; text-transform: uppercase; }
        .output-val { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
        .tax-alert {
          margin-top: 10px; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          display: none; align-items: center; gap: 6px;
        }
        .tax-qualify { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #6ee7b7; display: flex; }
        .grid-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin: 18px 0 8px 4px; }
        .preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px; }
        .preset-btn {
          background: #181f2c; border: 1px solid #283548; border-radius: 8px; padding: 10px 6px;
          color: #e2e8f0; font-size: 13px; font-weight: 700; text-align: center; cursor: pointer;
        }
        .preset-btn:active { background: #2b394e; transform: scale(0.98); }
        .preset-sub { font-size: 10px; color: #8fa2b8; font-weight: 500; margin-top: 2px; }
        .table-card {
          background: #141923; border: 1px solid #232c3d; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;
        }
        .table-row {
          display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 12px;
        }
        .table-row:last-child { border-bottom: none; }
        .table-yen { font-weight: 700; color: #ffd166; }
        .table-usd { font-weight: 700; color: #ffffff; }
        .table-desc { color: #8fa2b8; font-size: 11px; }
        .footer-note { text-align: center; font-size: 11px; color: #64748b; margin-top: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="badge">💴 Live Forex Converter</span>
        <h1 class="title">Yen Calculator</h1>
        <div class="rate-info">Live Rate: <strong>$1.00 USD = ¥${effectiveRate.toFixed(2)} JPY</strong></div>
      </div>

      <div class="calc-card">
        <div class="input-group">
          <label class="label">Amount in Japanese Yen (JPY):</label>
          <div class="input-wrap">
            <span class="curr-sym">¥</span>
            <input type="number" id="yenIn" class="yen-input" value="1000" inputmode="numeric" placeholder="e.g. 3500" autofocus />
          </div>
        </div>

        <div class="output-card">
          <span class="output-label">USD Total</span>
          <span class="output-val" id="usdOut">$${sample1k}</span>
        </div>

        <div id="taxBadge" class="tax-alert"></div>
      </div>

      <div class="grid-title">Quick Preset Conversion</div>
      <div class="preset-grid">
        <div class="preset-btn" onclick="setYen(150)">
          ¥150
          <div class="preset-sub">Vending / Drink</div>
        </div>
        <div class="preset-btn" onclick="setYen(500)">
          ¥500
          <div class="preset-sub">Conbini Snack</div>
        </div>
        <div class="preset-btn" onclick="setYen(1200)">
          ¥1,200
          <div class="preset-sub">Ramen / Lunch</div>
        </div>
        <div class="preset-btn" onclick="setYen(3500)">
          ¥3,500
          <div class="preset-sub">Izakaya Dinner</div>
        </div>
        <div class="preset-btn" onclick="setYen(5500)" style="border-color: rgba(16, 185, 129, 0.5);">
          ¥5,500
          <div class="preset-sub" style="color: #6ee7b7;">Tax-Free Min ✨</div>
        </div>
        <div class="preset-btn" onclick="setYen(10000)">
          ¥10,000
          <div class="preset-sub">10k Note</div>
        </div>
      </div>

      <div class="table-card">
        <div style="font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; margin-bottom: 8px;">Traveler Quick Reference</div>
        <div class="table-row">
          <span class="table-yen">¥100</span>
          <span class="table-desc">Small conbini coffee</span>
          <span class="table-usd">$${(100 / effectiveRate).toFixed(2)}</span>
        </div>
        <div class="table-row">
          <span class="table-yen">¥1,000</span>
          <span class="table-desc">Standard meal</span>
          <span class="table-usd">$${(1000 / effectiveRate).toFixed(2)}</span>
        </div>
        <div class="table-row">
          <span class="table-yen">¥5,000</span>
          <span class="table-desc">Tax-free minimum</span>
          <span class="table-usd">$${(5000 / effectiveRate).toFixed(2)}</span>
        </div>
        <div class="table-row">
          <span class="table-yen">¥10,000</span>
          <span class="table-desc">Yukichi Fukuzawa bill</span>
          <span class="table-usd">$${(10000 / effectiveRate).toFixed(2)}</span>
        </div>
        <div class="table-row">
          <span class="table-yen">¥30,000</span>
          <span class="table-desc">Department store shopping</span>
          <span class="table-usd">$${(30000 / effectiveRate).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer-note">
        Real-Time Conversion • Swipe down or tap Done to return to Home Screen
      </div>

      <script>
        const rate = ${effectiveRate};
        const input = document.getElementById('yenIn');
        const output = document.getElementById('usdOut');
        const taxBadge = document.getElementById('taxBadge');

        function calc() {
          let val = parseFloat(input.value);
          if (isNaN(val) || val <= 0) {
            output.innerText = "$0.00";
            taxBadge.style.display = "none";
            return;
          }
          let usd = val / rate;
          output.innerText = "$" + usd.toFixed(2);

          if (val >= 5000) {
            let taxSavings = (val * 0.10) / rate;
            taxBadge.className = "tax-alert tax-qualify";
            taxBadge.innerHTML = "🎉 <strong>Tax-Free Eligible!</strong> 10% tourist savings ≈ $" + taxSavings.toFixed(2) + " USD";
            taxBadge.style.display = "flex";
          } else {
            taxBadge.style.display = "none";
          }
        }

        function setYen(n) {
          input.value = n;
          calc();
        }

        input.addEventListener('input', calc);
        calc();
      </script>
    </body>
    </html>
  `;

  await wv.loadHTML(html);
  await wv.present(false);
}

function getMilestone(now) {
  for (let [dateStr, text] of BASELINE_MILESTONES) {
    let d = new Date(dateStr);
    if (d > now) {
      return { text, days: Math.ceil((d - now) / (1000 * 60 * 60 * 24)) };
    }
  }
  return null;
}

async function fetchYenData() {
  try {
    let req = new Request("https://open.er-api.com/v6/latest/USD");
    req.timeoutInterval = 4;
    let res = await req.loadJSON();
    let rate = res && res.rates && res.rates.JPY ? res.rates.JPY : 155.0;
    return { rate, label: "¥1k ≈ $" + (1000 / rate).toFixed(2) };
  } catch(e) {
    return { rate: 157.5, label: "¥1k ≈ $6.35" };
  }
}

async function fetchYen() {
  let d = await fetchYenData();
  return d.label;
}

function formatHour(h) {
  let ampm = h >= 12 ? "PM" : "AM";
  let d = h % 12;
  return (d === 0 ? 12 : d) + " " + ampm;
}

// -------------------------------------------------------------
// LIVE ITINERARY & GEMINI CONCIERGE DATA ENGINE
// -------------------------------------------------------------
async function loadItinerary() {
  let txt = "";
  try {
    let r = new Request(`https://docs.google.com/document/d/${DOC_ID}/export?format=txt`);
    r.timeoutInterval = 8;
    txt = await r.loadString();
  } catch(e) {}

  let now = new Date();

  if (GEMINI_KEY && GEMINI_KEY.length > 5 && txt.length > 50) {
    try {
      let ep = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_KEY}`;
      let p = `You are a personal digital concierge for SideQuests Japan 2027.
Return strictly valid JSON with this exact structure:
{
  "city": "Tokyo",
  "day": "Countdown or Day Title",
  "weather": "63°F • Clear",
  "activity": "1 concise sentence of scheduled focus",
  "tip": "1 punchy headline tip for the home screen widget face (under 120 chars)",
  "phrase": {
    "japanese": "おおきに",
    "romaji": "Ookini",
    "english": "Thank you (Kansai dialect)",
    "tag": "Osaka Slang / Kyoto Etiquette / Onsen Inquiry / Zero-Alcohol Fuel"
  },
  "activeMilestone": {
    "text": "Dec 22 • 1st Tour Installment ($3,224)",
    "days": 47
  },
  "customPlaces": [
    {
      "label": "Osaka Castle (Osaka)",
      "nameJa": "大阪城",
      "addressJa": "大阪府大阪市中央区大阪城1-1",
      "phrase": "大阪城までお願いします。",
      "searchQuery": "Osaka Castle"
    }
  ],
  "expandedIntel": [
    { "icon": "📋", "category": "Upcoming Deadlines & Actions", "content": "..." },
    { "icon": "♨️", "category": "Tattoo & Onsen Protocol", "content": "..." },
    { "icon": "🍵", "category": "Zero-Alcohol & High-Protein Fuel", "content": "..." },
    { "icon": "👟", "category": "Footwear & High-Step Endurance", "content": "..." },
    { "icon": "🚅", "category": "Transit & Shinkansen Luggage", "content": "..." }
  ],
  "products": [
    {
      "name": "Product Name",
      "category": "Gear Category",
      "price": "~$XX",
      "note": "Short note",
      "url": "Direct URL or search URL"
    }
  ]
}
Traveler Profile & Rules from Master Hub:
- Zero-alcohol lifestyle: recommend ordering Uron-cha (Oolong tea) or Ryokucha at group dinners/izakayas.
- Tattoo etiquette: left leg Tactics Ogre tattoo must be covered with water-resistant sleeve/patch in onsens/gyms, or private kashikiri onsen.
- Nutrition: conbini salad chicken, boiled eggs, edamame, yakitori, wagyu.
- Footwear: 18k-25k daily steps, Brooks Glycerin 23 shoes, slip-on etiquette for indoor temples/dining.
- Dynamic Products: Parse EVERY single item listed in Section 4 ('Packing & Planned Purchases') of the document into the 'products' array.
- Dynamic Milestones: Calculate the nearest upcoming deadline from Section 1 ('Action Items') relative to today (${now.toISOString().substring(0, 10)}).
- Contextual Phrase: Select 1 phrase perfectly tailored to today's active destination/culture (e.g. Kyoto tea etiquette, Osaka Kansai-ben slang like 'Ookini', Hakone onsen kashikiri inquiry, or zero-alcohol ordering).
- Itinerary Context: ` + txt.substring(0, 10000);

      let r = new Request(ep);
      r.method = "POST";
      r.headers = {"Content-Type":"application/json"};
      r.body = JSON.stringify({contents:[{parts:[{text:p}]}]});
      let res = await r.loadJSON();
      let clean = res.candidates[0].content.parts[0].text.replace(/```json/g,"").replace(/```/g,"").trim();
      let parsed = JSON.parse(clean);
      if (parsed && parsed.tip) {
        parsed.rawDocText = txt;
        let docProducts = parseProductsFromDoc(txt);
        if (!parsed.products || !Array.isArray(parsed.products) || parsed.products.length === 0) {
          parsed.products = docProducts;
        } else {
          for (let p of parsed.products) {
            let found = docProducts.find(dp => dp.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(dp.name.toLowerCase()));
            if (found && found.url && found.url.startsWith("http") && !found.url.includes("google.com/search")) {
              p.url = found.url;
            }
          }
        }
        if (!parsed.activeMilestone) {
          parsed.activeMilestone = parseMilestonesFromDoc(txt, now);
        }
        return parsed;
      }
    } catch(e) {}
  }

  // Pre-trip vs In-trip Fallbacks (used offline)
  let days = Math.ceil((new Date("2027-03-21T07:00:00") - now) / 86400000);
  let localProducts = parseProductsFromDoc(txt);
  if (localProducts.length === 0) localProducts = BASELINE_PRODUCTS;
  let localMilestone = parseMilestonesFromDoc(txt, now) || getMilestone(now);

  if (days > 0) {
    return {
      city: "Tokyo",
      day: `Countdown: ${days} Days Until LIT ✈ TYO`,
      weather: "63°F • Clear",
      activity: "Next action: Reserve Citadines Shinjuku. Check in online for ANA NH113 aisle seat on Mar 20.",
      tip: "Dec 22: $3,224 tour installment due. Acquire water-resistant tattoo sleeves for onsens before departure.",
      products: localProducts,
      activeMilestone: localMilestone,
      rawDocText: txt,
      expandedIntel: [
        {
          icon: "📋",
          category: "Upcoming Deadlines & Actions",
          content: "• ASAP: Reserve Tokyo buffer hotel (Citadines Shinjuku) for March 22 arrival.\n• Dec 22, 2026: 1st WeTravel tour installment of $3,224 due.\n• Dec 24, 2026: Submit Passport Information & Emergency Contact forms via WeTravel dashboard.\n• Feb 22, 2027: Final WeTravel installment of $649 due (Mt. Fuji add-on balance).\n• Feb 28, 2027 @ 7:00 PM CST (Mar 1, 10:00 AM JST): SmartEX opens reservations for March 31 Nozomi bullet train (Shin-Osaka ➔ Tokyo). Reserve rear-row seat with oversized baggage area.\n• Mar 20, 2027 @ 11:10 AM CST: Check in online for ANA NH113 (opens exactly 24h prior) to swap middle seat to aisle/window. [eTicket: 0162153570261 | Name: JOSHUADANIEL WISE].\n• Mar 21, 2027 @ 7:00 AM CST: Flight departure LIT (UA5240) ➔ IAH ➔ HND (NH113).\n• Pending: Coordinate Universal Studios Japan (USJ) Super Nintendo World admission with tour host Peter."
        },
        {
          icon: "♨️",
          category: "Tattoo & Onsen Protocol",
          content: "• Tattoos remain strictly prohibited at most Japanese public onsens and municipal gyms.\n• For your left leg Tactics Ogre piece, order high-quality water-resistant skin-toned cover tape or compression calf sleeves before departure.\n• When in Hakone or traditional ryokans, look into reserving a private bath (kashikiri onsen) to relax without restriction."
        },
        {
          icon: "🍵",
          category: "Zero-Alcohol & High-Protein Fuel",
          content: "• Izakayas & Group Dinners: Confidently order non-alcoholic staples: 「烏龍茶をお願いします」(Uron-cha o onegaishimasu - Oolong tea, please) or Ryokucha (green tea).\n• Conbini Protein Staples: 7-Eleven, Lawson, and FamilyMart stock pre-cooked Salad Chicken (20-25g protein), boiled eggs (yudetamago), edamame, and protein yogurt drinks.\n• Dining: Yakitori (chicken skewers, shio/salt seasoned), sashimi, and wagyu yakiniku."
        },
        {
          icon: "👟",
          category: "Footwear & High-Step Endurance",
          content: "• Expect 18,000 to 25,000 steps daily across Tokyo, Kyoto, and Nara.\n• Your Brooks Glycerin 23s are ideal for concrete transit walking.\n• Indoor Etiquette: You will take shoes off frequently (temples, fitting rooms, traditional restaurants). Practice easy slip-on/slip-off transitions or use elastic lock laces."
        },
        {
          icon: "🚅",
          category: "Transit & Shinkansen Luggage",
          content: "• Mar 26 (Tokyo ➔ Kyoto): Nozomi No. 23 (10:12 AM) is booked and handled for the entire group by SideQuests.\n• Mar 28 (Kyoto ➔ Nara ➔ Osaka): Handled via private chartered group coach bus.\n• Mar 31 (Shin-Osaka ➔ Tokyo): Independent return transit. SmartEX opens Feb 28 @ 7:00 PM CST (Mar 1 @ 10:00 AM JST). You MUST reserve a rear-row seat with oversized baggage area for your luggage.\n• Local Transit: Tap digital Suica / ICOCA in Apple Wallet for all subways and JR lines."
        }
      ]
    };
  }

  // Day-by-day in-trip fallback calendar
  let jstDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(now);
  let dailyFallback = {
    "2027-03-21": {
      city: "In Transit", day: "SideQuests Japan • Flight Day", weather: "68°F • Flight En Route",
      activity: "Depart LIT (7:00 AM UA5240) ➔ IAH (11:10 AM ANA NH113) ➔ HND.",
      tip: "Wear your Brooks Glycerin shoes and compression socks. Stay hydrated on the 13-hour transpacific flight!",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [{ icon: "✈️", category: "Flight Schedule", content: "• LIT ➔ IAH: UA5240 departs 7:00 AM, arrives 8:50 AM.\n• IAH ➔ HND: ANA NH113 departs 11:10 AM, arrives Mar 22 @ 3:25 PM.\n• eTicket: 0162153570261 | Name: JOSHUADANIEL WISE." }]
    },
    "2027-03-22": {
      city: "Tokyo", day: "Tokyo Arrival • Buffer Night", weather: "59°F • Clear Evening",
      activity: "Land at Haneda (3:25 PM JST). Transit to Citadines Shinjuku buffer hotel.",
      tip: "Pass immigration, activate digital Suica in Apple Wallet, and grab an easy dinner at a conbini before sleep.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [{ icon: "🛬", category: "Arrival Logistics", content: "• Haneda Terminal 3 arrival @ 3:25 PM.\n• Transit: Keikyu Line to Shinagawa or Tokyo Monorail to Hamamatsucho, then JR Yamanote to Shinjuku.\n• Check in: Citadines Shinjuku Tokyo (1-28-13 Shinjuku)." }]
    },
    "2027-03-23": {
      city: "Tokyo", day: "Tokyo Transfer Day", weather: "61°F • Mild",
      activity: "Transfer luggage from Citadines to Hotel Groove Shinjuku (check-in 3:00 PM).",
      tip: "Take it easy today. Shake off jet lag, explore Kabukicho and Shinjuku Gyoen, and get a solid night's sleep.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [{ icon: "🏨", category: "Hotel Transfer", content: "• Check out of Citadines Shinjuku by 11:00 AM.\n• Move to Hotel Groove Shinjuku (Tokyu Kabukicho Tower, 1-29-1 Kabukicho). Check-in opens 3:00 PM.\n• Tomorrow morning starts early at 8:00 AM for Mt. Fuji!" }]
    },
    "2027-03-24": {
      city: "Tokyo & Hakone", day: "SideQuests Day 1 • Mt. Fuji & Welcome", weather: "57°F • Crisp Mountain Air",
      activity: "8:00 AM Mt. Fuji Excursion ➔ 7:15 PM Lobby Meetup ➔ 7:30 PM Welcome Dinner.",
      tip: "Layer up for mountain winds at Hakone Ropeway! Meet in the Groove lobby at 7:15 PM for dinner.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🏔️", category: "Mt. Fuji & Hakone Excursion (8 AM - 7 PM)", content: "• Stop 1: Arakurayama Sengen Park (staircase climb to iconic Chureito Pagoda & Mt. Fuji view).\n• Stop 2: Hakone Ropeway aerial tramway over volcanic Owakudani Valley (view of Lake Ashi).\n• Stop 3: Hakone Open-Air Museum (70,000 sqm sculpture park by Rodin/Picasso + mineral foot bath)." },
        { icon: "🍽️", category: "Welcome Dinner (Included Meal)", content: "• Meet in Hotel Groove lobby at 7:15 PM.\n• 7:30 PM: Official Welcome Dinner with host Peter and the group. Celebrate with Uron-cha!" }
      ]
    },
    "2027-03-25": {
      city: "Tokyo", day: "SideQuests Day 2 • Tokyo Culture & Ni-chome", weather: "63°F • Partly Cloudy",
      activity: "Tsukiji Market & Sushi class ➔ Sensoji ➔ Meiji Shrine ➔ Harajuku ➔ 9 PM Ni-chome Bar Tour.",
      tip: "Wear slip-on shoes for temple entry. Meet in the lobby at 9:00 PM for the guided Ni-chome gay bar tour!",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🍣", category: "Daytime Excursions (Included Lunch)", content: "• Buffet breakfast at Shinjuku Groove (Included).\n• Tsukiji Outer Market fresh seafood street stalls.\n• Hands-on sushi making class + lunch (Included).\n• Sensoji Temple (Tokyo's oldest, 645 AD) & Nakamise street.\n• Meiji Shrine forested grounds (170 tranquil acres).\n• Harajuku Takeshita Street fashion & Shibuya Crossing scramble." },
        { icon: "🏳️‍🌈", category: "Shinjuku Ni-chome Gay Bar Tour", content: "• Meet in Hotel Groove lobby at 9:00 PM.\n• Guided walking tour of Tokyo's historic LGBTQ+ hub (400+ bars). Drinks on own." }
      ]
    },
    "2027-03-26": {
      city: "Kyoto", day: "SideQuests Day 3 • Bullet Train to Kyoto", weather: "64°F • Pleasant",
      activity: "10:12 AM Nozomi No. 23 to Kyoto (arr 12:23 PM) ➔ Higashiyama ➔ Yasaka ➔ Nishiki Market.",
      tip: "Pick up an ekiben (station bento) at Tokyo Station! Your luggage is transferred directly to Solaria Nishitetsu.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🚅", category: "Shinkansen Transit (Included)", content: "• Check out of Groove Shinjuku after breakfast.\n• Nozomi No. 23 departs Tokyo Station at 10:12 AM, arrives Kyoto Station at 12:23 PM (2h 11m).\n• English-speaking guide meets the group right on the Kyoto platform." },
        { icon: "🏮", category: "Afternoon Tour & Solaria Nishitetsu", content: "• Higashiyama historic stone-paved lanes and wooden machiya tea houses.\n• Yasaka Shrine (1,350-year-old vermilion shrine).\n• Nishiki Market ('Kyoto's Kitchen') for yuba and matcha snacks.\n• Check in: Solaria Nishitetsu Hotel Kyoto Premier (along Kamo River; luggage already waiting). Dinner on own." }
      ]
    },
    "2027-03-27": {
      city: "Kyoto", day: "SideQuests Day 4 • Arashiyama, Kimono & Temples", weather: "62°F • Mild",
      activity: "Arashiyama Bamboo Grove ➔ Tenryuji ➔ Kimono Tea Ceremony ➔ Kiyomizudera.",
      tip: "Enjoy the authentic chanoyu tea ceremony in full kimono! Back at the hotel by 5:00 PM.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🎋", category: "Arashiyama & Tenryuji", content: "• Buffet breakfast at Solaria Nishitetsu (Included).\n• Private bus to Arashiyama Bamboo Grove.\n• Tenryuji Temple (UNESCO World Heritage, Sogenchi Garden by Muso Soseki).\n• Included Kyoto Lunch." },
        { icon: "👘", category: "Kimono & Chanoyu Ceremony", content: "• Traditional kimono dressing & tea ceremony led by a Kyoto tea master.\n• Kiyomizudera Temple (13m high wooden stage & Otowa Waterfall 3 streams).\n• Return to hotel by 5:00 PM. Dinner on own." }
      ]
    },
    "2027-03-28": {
      city: "Nara & Osaka", day: "SideQuests Day 5 • Nara Deer & Osaka Castle", weather: "65°F • Clear",
      activity: "Nara Park & Todaiji Daibutsu ➔ 1-hr coach to Osaka ➔ Osaka Castle ➔ Dotonbori neon.",
      tip: "Bow to the sacred sika deer in Nara! Tonight dive into Osaka's famous street food in Dotonbori.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🦌", category: "Nara Excursion", content: "• Buffet breakfast at Solaria Nishitetsu (Included) & checkout.\n• Private bus to Nara Park (hundreds of wild bowing sika deer).\n• Todaiji Temple & the 15-meter bronze Great Buddha (Daibutsu, 752 AD)." },
        { icon: "🏯", category: "Osaka Arrival & Dotonbori", content: "• Private coach to Osaka (~1 hour).\n• Osaka Castle (built 1583 by Toyotomi Hideyoshi).\n• Dotonbori entertainment district (neon Glico Running Man, takoyaki, okonomiyaki). Dinner on own.\n• Check in: voco Osaka Central for 2 nights." }
      ]
    },
    "2027-03-29": {
      city: "Osaka", day: "SideQuests Day 6 • Free Day & Farewell Dinner", weather: "66°F • Warm & Bright",
      activity: "Osaka Free Day ➔ 4:00 PM Shinsekai Tour ➔ 6:00 PM Farewell Dinner.",
      tip: "Sample kushikatsu in retro Shinsekai at 4 PM! Farewell dinner kicks off at 6:00 PM.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🏙️", category: "Osaka Daytime Freedom", content: "• Buffet breakfast at voco Osaka Central (Included).\n• Free daytime to explore Osaka, visit Kuromon Market, or relax." },
        { icon: "🗼", category: "Shinsekai & Farewell Dinner (Included Meal)", content: "• Meet in voco lobby at 4:00 PM for Shinsekai neighborhood tour (Tsutenkaku Tower & kushikatsu).\n• 6:00 PM: Official Farewell Dinner (Included Meal) to celebrate the journey!" }
      ]
    },
    "2027-03-30": {
      city: "Osaka", day: "SideQuests Day 7 • Universal Studios Japan", weather: "64°F • Clear",
      activity: "Core tour ends after breakfast. Day trip to Universal Studios Japan with Peter!",
      tip: "Super Nintendo World & Donkey Kong Country today! Post-trip night at voco Osaka Central.",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🍄", category: "Universal Studios Japan (USJ)", content: "• Buffet breakfast at voco Osaka Central (Included).\n• Core tour concludes. Join host Peter for day trip to Universal Studios Japan.\n• Highlights: Super Nintendo World, Donkey Kong Country, Mario Kart, Harry Potter.\n• Overnight: voco Osaka Central (post-trip night)." }
      ]
    },
    "2027-03-31": {
      city: "Osaka & Tokyo", day: "Departure Day • Journey Home", weather: "61°F • Travel Day",
      activity: "9:00 AM Nozomi to Tokyo ➔ Keikyu/Monorail to HND ➔ 5:15 PM flight home.",
      tip: "Board your Nozomi with your reserved rear-row oversized baggage seat. Arrive HND by 1:30 PM!",
      products: localProducts, activeMilestone: localMilestone, rawDocText: txt,
      expandedIntel: [
        { icon: "🚅", category: "Shinkansen & Flight Schedule", content: "• Check out of voco Osaka Central.\n• 9:00 AM Nozomi Shinkansen from Shin-Osaka to Tokyo/Shinagawa (reserved on SmartEX).\n• Transit to Haneda Terminal 3.\n• 5:15 PM: Depart HND on ANA NH114 / UA882 to Chicago ORD (arrive 3:15 PM).\n• 7:55 PM: Depart ORD on UA4542 to LIT (arrive 9:54 PM CST)." }
      ]
    }
  };

  return dailyFallback[jstDateStr] || dailyFallback["2027-03-24"];
}
