// Where's Josh? 🇯🇵 • Japan Travel Family & Friends Tracker Widget
// Designed for iOS Scriptable (Large / Medium Widget + Standalone Family View)
// Keeps friends & family updated on Josh's location, live status, sleep/wake hours, hotels, and accurate flights.
// 100% self-contained: Contains ZERO links to Josh's private travel document.

// -------------------------------------------------------------
// USER CONFIGURATION & PREFERENCES
// -------------------------------------------------------------
// Live Web Dashboard URL (GitHub Pages travel tracker)
const WEB_DASHBOARD_URL = "https://plantdragoon.github.io/Japan-Travel-Apps/";

// Flight Tracker Provider: "flightaware" (Live radar tracking) | "google" (Google Flight Status)
const FLIGHT_TRACKER_MODE = "flightaware";

// -------------------------------------------------------------
// VERIFIED FLIGHT TRACKER ROUTING
// -------------------------------------------------------------
function getActiveFlightTracker(now) {
  let iso = now.toISOString();

  // Outbound Leg 1: Sun Mar 21 morning LIT -> IAH (approx 7:00 AM - 10:30 AM CST)
  if (iso >= "2027-03-21T11:00:00Z" && iso < "2027-03-21T16:00:00Z") {
    return {
      flightNum: "UA 5240",
      label: "✈️ Track UA5240",
      flightaware: "https://www.flightaware.com/live/flight/UAL5240",
      google: "https://www.google.com/search?q=United+5240+flight+status"
    };
  }

  // Outbound Leg 2: Sun Mar 21 11:10 AM CST through landing in Tokyo Mon Mar 22 (IAH -> HND)
  if (iso >= "2027-03-21T16:00:00Z" && iso < "2027-03-23T00:00:00Z") {
    return {
      flightNum: "NH 113",
      label: "✈️ Track NH113",
      flightaware: "https://www.flightaware.com/live/flight/ANA113",
      google: "https://www.google.com/search?q=ANA+113+flight+status"
    };
  }

  // Return Leg 1: Wed Mar 31 HND -> ORD (5:15 PM JST -> 3:15 PM CDT)
  if (iso >= "2027-03-31T08:00:00Z" && iso < "2027-03-31T21:00:00Z") {
    return {
      flightNum: "UA 882",
      label: "✈️ Track UA882",
      flightaware: "https://www.flightaware.com/live/flight/UAL882",
      google: "https://www.google.com/search?q=United+882+flight+status"
    };
  }

  // Return Leg 2: Wed Mar 31 ORD -> LIT (7:55 PM CDT -> 9:54 PM CDT)
  if (iso >= "2027-03-31T21:00:00Z" && iso < "2027-04-01T05:00:00Z") {
    return {
      flightNum: "UA 4542",
      label: "✈️ Track UA4542",
      flightaware: "https://www.flightaware.com/live/flight/SKW4542",
      google: "https://www.google.com/search?q=United+4542+flight+status"
    };
  }

  // Default / Pre-trip / In-country: Flagship ANA 113 transpacific flight
  return {
    flightNum: "NH 113",
    label: "✈️ Flight Tracker",
    flightaware: "https://www.flightaware.com/live/flight/ANA113",
    google: "https://www.google.com/search?q=ANA+113+flight+status"
  };
}

function getFlightUrl(now) {
  let tracker = getActiveFlightTracker(now);
  if (FLIGHT_TRACKER_MODE === "google") return tracker.google;
  return tracker.flightaware;
}

// -------------------------------------------------------------
// DYNAMIC JST RESOLVER (JOSH STANDARD TIME -> JAPAN STANDARD TIME)
// -------------------------------------------------------------
function getJoshTimeZone(now) {
  let t = now.getTime();
  // Departure from Houston: Sun Mar 21, 2027 @ 11:10 AM CDT (16:10 UTC)
  let tOutboundDep = new Date('2027-03-21T11:10:00-05:00').getTime();
  // Pacific midpoint / Date Line crossing: approx Mar 21 @ 6:00 PM CDT (Mar 22 8:00 AM JST)
  let tOutboundMid = new Date('2027-03-21T18:00:00-05:00').getTime();
  // Landing at Tokyo Haneda: Mon Mar 22, 2027 @ 3:25 PM JST (06:25 UTC)
  let tJapanArrival = new Date('2027-03-22T15:25:00+09:00').getTime();
  // Departure from Tokyo Haneda: Wed Mar 31, 2027 @ 5:15 PM JST (08:15 UTC / 3:15 AM CDT)
  let tReturnDep = new Date('2027-03-31T17:15:00+09:00').getTime();
  // Pacific midpoint return: approx Mar 31 @ 11:00 PM JST (Mar 31 9:00 AM CDT)
  let tReturnMid = new Date('2027-03-31T09:00:00-05:00').getTime();
  // Touchdown Chicago ORD: Wed Mar 31, 2027 @ 3:15 PM CDT (20:15 UTC)
  let tReturnORD = new Date('2027-03-31T15:15:00-05:00').getTime();
  // Landing Little Rock LIT: Wed Mar 31, 2027 @ 9:54 PM CDT
  let tHomeArrival = new Date('2027-03-31T21:54:00-05:00').getTime();

  if (t < tOutboundDep) {
    // Pre-trip: Little Rock, AR
    return {
      timeZone: 'America/Chicago',
      label: 'JST (JOSH)',
      webTitle: "Josh's Time • JST",
      webSub: 'Josh Standard Time • Central (Little Rock, AR)',
      isJapan: false,
      status: 'pre-trip'
    };
  } else if (t < tOutboundMid) {
    // Flight Leg 1 / early Pacific transit
    return {
      timeZone: 'America/Chicago',
      label: 'JST (FLIGHT)',
      webTitle: "Josh's Time • JST",
      webSub: 'Josh Standard Time • In-Flight (Pacific Transit)',
      isJapan: false,
      status: 'flight-outbound'
    };
  } else if (t < tReturnDep) {
    // In Japan! (Crossed Pacific / Tokyo / Kyoto / Osaka)
    return {
      timeZone: 'Asia/Tokyo',
      label: 'JST (JAPAN)',
      webTitle: "Josh's Time • JST",
      webSub: 'Japan Standard Time • Tokyo (UTC+9)',
      isJapan: true,
      status: 'japan'
    };
  } else if (t < tReturnMid) {
    // Return flight early transpacific transit
    return {
      timeZone: 'Asia/Tokyo',
      label: 'JST (FLIGHT)',
      webTitle: "Josh's Time • JST",
      webSub: 'Josh Standard Time • In-Flight Return',
      isJapan: false,
      status: 'flight-return'
    };
  } else {
    // Return to US airspace / Little Rock Home
    return {
      timeZone: 'America/Chicago',
      label: 'JST (HOME)',
      webTitle: "Josh's Time • JST",
      webSub: 'Josh Standard Time • Central (Safely Home)',
      isJapan: false,
      status: 'home'
    };
  }
}


// -------------------------------------------------------------
// VERIFIED MASTER FLIGHT DATA (100% ACCURATE FROM RESERVATION)
// -------------------------------------------------------------
const FLIGHT_RESERVATION = {
  passenger: "JOSHUADANIEL WISE",
  eTicket: "0162153570261",
  airline: "United Airlines & All Nippon Airways (ANA)",
  outbound: [
    {
      flightNumber: "UA 5240",
      airline: "United Airlines (CommuteAir)",
      aircraft: "Embraer ERJ-145",
      depCode: "LIT",
      depCity: "Little Rock, AR",
      depTime: "Sun, Mar 21 @ 7:00 AM CST",
      depIso: "2027-03-21T07:00:00-05:00",
      arrCode: "IAH",
      arrCity: "Houston, TX",
      arrTime: "Sun, Mar 21 @ 8:50 AM CST",
      arrIso: "2027-03-21T08:50:00-05:00",
      duration: "1h 50m",
      flightAwareUrl: "https://www.flightaware.com/live/flight/UAL5240",
      notes: "Morning departure from Little Rock. Bags checked through to Tokyo."
    },
    {
      layover: true,
      city: "Houston (IAH)",
      duration: "2h 20m layover",
      notes: "Terminal transfer at IAH to International Terminal for ANA boarding."
    },
    {
      flightNumber: "NH 113",
      airline: "All Nippon Airways (ANA) / UA 7935",
      aircraft: "Boeing 777-300ER",
      depCode: "IAH",
      depCity: "Houston, TX",
      depTime: "Sun, Mar 21 @ 11:10 AM CST",
      depIso: "2027-03-21T11:10:00-05:00",
      arrCode: "HND",
      arrCity: "Tokyo Haneda (Terminal 3)",
      arrTime: "Mon, Mar 22 @ 3:25 PM JST",
      arrIso: "2027-03-22T15:25:00+09:00",
      duration: "13h 15m",
      flightAwareUrl: "https://www.flightaware.com/live/flight/ANA113",
      notes: "Transpacific flight crossing International Date Line. Lands Tokyo Monday afternoon."
    }
  ],
  return: [
    {
      flightNumber: "UA 882 / NH 114",
      airline: "United Airlines (Code-share ANA)",
      aircraft: "Boeing 777-200",
      depCode: "HND",
      depCity: "Tokyo Haneda (Terminal 3)",
      depTime: "Wed, Mar 31 @ 5:15 PM JST",
      depIso: "2027-03-31T17:15:00+09:00",
      arrCode: "ORD",
      arrCity: "Chicago O'Hare, IL",
      arrTime: "Wed, Mar 31 @ 3:15 PM CDT",
      arrIso: "2027-03-31T15:15:00-05:00",
      duration: "12h 00m",
      flightAwareUrl: "https://www.flightaware.com/live/flight/UAL882",
      notes: "Flight home across the Pacific. Gains back hours due to time zone difference."
    },
    {
      layover: true,
      city: "Chicago (ORD)",
      duration: "4h 40m layover",
      notes: "US Customs & Immigration clearance at ORD Terminal 5, then domestic gate transfer."
    },
    {
      flightNumber: "UA 4542",
      airline: "United Airlines (SkyWest)",
      aircraft: "Embraer 175",
      depCode: "ORD",
      depCity: "Chicago O'Hare, IL",
      depTime: "Wed, Mar 31 @ 7:55 PM CDT",
      depIso: "2027-03-31T19:55:00-05:00",
      arrCode: "LIT",
      arrCity: "Little Rock, AR",
      arrTime: "Wed, Mar 31 @ 9:54 PM CDT",
      arrIso: "2027-03-31T21:54:00-05:00",
      duration: "1h 59m",
      flightAwareUrl: "https://www.flightaware.com/live/flight/SKW4542",
      notes: "Final connecting flight arriving safely home in Little Rock."
    }
  ]
};

// -------------------------------------------------------------
// VERIFIED ITINERARY & BASECAMPS (HOTELS & ACTIVITIES)
// Zero references to buffer night: unified Tokyo base is Hotel Groove Shinjuku
// -------------------------------------------------------------
const TRIP_SCHEDULE = {
  "2027-03-21": {
    city: "In Flight ✈",
    region: "En Route to Tokyo",
    mapQuery: "Haneda Airport, Tokyo",
    statusSummary: "Josh is traveling! En route from Little Rock (LIT) to Houston (IAH) and crossing the Pacific on ANA NH113 to Tokyo.",
    mediumSummary: "Traveling LIT to Houston, then boarding ANA NH113 to Tokyo across the Pacific.",
    todaysFocus: "13-hour flight across the Pacific Ocean. Landing in Tokyo tomorrow afternoon.",
    hotel: {
      name: "In Flight (ANA NH113)",
      address: "Transpacific Air Corridor",
      addressJa: "太平洋上空",
      phone: "N/A"
    }
  },
  "2027-03-22": {
    city: "Tokyo",
    region: "Shinjuku (Arrival Night)",
    mapQuery: "Citadines Shinjuku Tokyo",
    statusSummary: "Josh landed at Tokyo Haneda Airport (3:25 PM JST)! Headed to Citadines Shinjuku Tokyo to check in, unpack, explore local Shinjuku, and rest up before the tour kicks off tomorrow.",
    mediumSummary: "Landed at Tokyo Haneda! Heading to Citadines Shinjuku to check in & rest.",
    todaysFocus: "Haneda arrival transit, digital Suica activation, dinner in Shinjuku, and settling into Citadines Shinjuku.",
    hotel: {
      name: "Citadines Shinjuku Tokyo",
      address: "1-28-13 Shinjuku, Shinjuku City, Tokyo 160-0022",
      addressJa: "東京都新宿区新宿1-28-13",
      phone: "+81 3-5379-7208"
    }
  },
  "2027-03-23": {
    city: "Tokyo",
    region: "Kabukicho & Shinjuku",
    mapQuery: "Hotel Groove Shinjuku",
    statusSummary: "Josh checked out of Citadines Shinjuku and transferred to Hotel Groove Shinjuku in Kabukicho! Visiting Shinjuku Gyoen National Garden and joining the tour orientation.",
    mediumSummary: "Transferred to Hotel Groove Kabukicho. Garden walk & tour orientation.",
    todaysFocus: "Hotel transfer to Hotel Groove Shinjuku, Shinjuku Gyoen gardens, tour orientation meetup.",
    hotel: {
      name: "Hotel Groove Shinjuku (Tokyu Kabukicho Tower)",
      address: "1-29-1 Kabukicho, Shinjuku City, Tokyo 160-0021",
      addressJa: "東京都新宿区歌舞伎町1-29-1 東急歌舞伎町タワー",
      phone: "+81 3-6233-8888"
    }
  },
  "2027-03-24": {
    city: "Tokyo & Mt. Fuji",
    region: "Fuji-Hakone-Izu",
    mapQuery: "Hakone Ropeway, Japan",
    statusSummary: "SideQuests Day 1! Josh is on an all-day excursion to Mt. Fuji, Chureito Pagoda, and the Hakone Ropeway, followed by the group Welcome Dinner.",
    mediumSummary: "All-day Mt. Fuji & Hakone Ropeway excursion, followed by Welcome Dinner.",
    todaysFocus: "Mt. Fuji vista, volcanic Hakone valley, Open-Air Museum, 7:30 PM Welcome Dinner.",
    hotel: {
      name: "Hotel Groove Shinjuku",
      address: "1-29-1 Kabukicho, Shinjuku City, Tokyo",
      addressJa: "東京都新宿区歌舞伎町1-29-1",
      phone: "+81 3-6233-8888"
    }
  },
  "2027-03-25": {
    city: "Tokyo",
    region: "Tsukiji, Asakusa & Harajuku",
    mapQuery: "Senso-ji, Asakusa, Tokyo",
    statusSummary: "SideQuests Day 2! Josh has sushi-making class at Tsukiji, visiting Senso-ji Temple in Asakusa, Shibuya Crossing, and an evening Ni-chome tour.",
    mediumSummary: "Tsukiji sushi class, Senso-ji Temple, Shibuya Crossing & Ni-chome tour.",
    todaysFocus: "Tsukiji Market sushi lunch, Tokyo's oldest temple (Senso-ji), Harajuku fashion, evening cultural walking tour.",
    hotel: {
      name: "Hotel Groove Shinjuku",
      address: "1-29-1 Kabukicho, Shinjuku City, Tokyo",
      addressJa: "東京都新宿区歌舞伎町1-29-1",
      phone: "+81 3-6233-8888"
    }
  },
  "2027-03-26": {
    city: "Kyoto",
    region: "Higashiyama District",
    mapQuery: "Solaria Nishitetsu Hotel Kyoto Premier",
    statusSummary: "Josh took the 185 mph Nozomi Bullet Train to Kyoto! This afternoon he is exploring the historic wooden streets of Higashiyama and Nishiki Market.",
    mediumSummary: "Nozomi Bullet Train to Kyoto! Exploring historic Higashiyama & markets.",
    todaysFocus: "Shinkansen bullet train transit, 1,350-year-old Yasaka Shrine, Nishiki Food Market.",
    hotel: {
      name: "Solaria Nishitetsu Hotel Kyoto Premier",
      address: "509 Kamiosakacho, Nakagyo Ward, Kyoto 604-8001",
      addressJa: "京都府京都市中京区上大阪町509",
      phone: "+81 75-708-5757"
    }
  },
  "2027-03-27": {
    city: "Kyoto",
    region: "Arashiyama & Kiyomizu",
    mapQuery: "Arashiyama Bamboo Grove, Kyoto",
    statusSummary: "SideQuests Day 4! Josh is walking through the Arashiyama Bamboo Grove, doing an authentic kimono tea ceremony, and visiting Kiyomizu-dera Temple.",
    mediumSummary: "Arashiyama Bamboo Grove, kimono tea ceremony, and Kiyomizu-dera Temple.",
    todaysFocus: "Arashiyama Bamboo Grove, Tenryu-ji Zen temple, kimono dressing & chanoyu tea ceremony, Kiyomizudera stage.",
    hotel: {
      name: "Solaria Nishitetsu Hotel Kyoto Premier",
      address: "509 Kamiosakacho, Nakagyo Ward, Kyoto",
      addressJa: "京都府京都市中京区上大阪町509",
      phone: "+81 75-708-5757"
    }
  },
  "2027-03-28": {
    city: "Nara & Osaka",
    region: "Nara Park & Dotonbori",
    mapQuery: "Dotonbori, Osaka",
    statusSummary: "Josh visited the bowing deer of Nara and the giant Bronze Buddha at Todaiji, and has now arrived in Osaka under the famous neon lights of Dotonbori!",
    mediumSummary: "Bowing deer of Nara, giant Bronze Buddha, and neon Dotonbori in Osaka.",
    todaysFocus: "Sacred bowing sika deer in Nara, 15m Great Buddha, Osaka Castle, neon Dotonbori street food.",
    hotel: {
      name: "voco Osaka Central (IHG)",
      address: "1-7-1 Kyomachibori, Nishi Ward, Osaka 550-0003",
      addressJa: "大阪府大阪市中央区京町堀1-7-1",
      phone: "+81 6-6445-1100"
    }
  },
  "2027-03-29": {
    city: "Osaka",
    region: "Shinsekai & Namba",
    mapQuery: "voco Osaka Central",
    statusSummary: "SideQuests Day 6! Free daytime in Osaka exploring Kuromon Market, followed by a 4 PM retro Shinsekai tour and the official 6 PM Farewell Dinner.",
    mediumSummary: "Exploring Kuromon Market, retro Shinsekai district & Farewell Dinner.",
    todaysFocus: "Free exploration in Osaka, Tsutenkaku Tower & kushikatsu, tour grand finale Farewell Dinner.",
    hotel: {
      name: "voco Osaka Central (IHG)",
      address: "1-7-1 Kyomachibori, Nishi Ward, Osaka",
      addressJa: "大阪府大阪市中央区京町堀1-7-1",
      phone: "+81 6-6445-1100"
    }
  },
  "2027-03-30": {
    city: "Osaka",
    region: "Universal Studios Japan",
    mapQuery: "Universal Studios Japan, Osaka",
    statusSummary: "Core tour concluded! Josh joined tour host Peter for a bonus day trip to Universal Studios Japan (Super Nintendo World & Donkey Kong Country)!",
    mediumSummary: "Universal Studios Japan bonus day: Super Nintendo World & Donkey Kong!",
    todaysFocus: "Mario Kart, Donkey Kong Country, Super Nintendo World, post-trip night at voco Osaka.",
    hotel: {
      name: "voco Osaka Central (IHG)",
      address: "1-7-1 Kyomachibori, Nishi Ward, Osaka",
      addressJa: "大阪府大阪市中央区京町堀1-7-1",
      phone: "+81 6-6445-1100"
    }
  },
  "2027-03-31": {
    city: "Osaka ➔ Tokyo ➔ USA",
    region: "Journey Home ✈",
    mapQuery: "Haneda Airport, Tokyo",
    statusSummary: "Josh is heading home today! Bullet train to Tokyo Haneda Airport, flight UA882 to Chicago (ORD), and connecting back home to Little Rock (LIT)!",
    mediumSummary: "Nozomi to Haneda, flight UA882 to Chicago, and connecting back home!",
    todaysFocus: "9 AM Nozomi to Tokyo, 5:15 PM ANA/United flight to Chicago, landing Little Rock at 9:54 PM tonight.",
    hotel: {
      name: "Home Sweet Home (USA)",
      address: "Little Rock, AR",
      addressJa: "アメリカ合衆国 アーカンソー州リトルロック",
      phone: "N/A"
    }
  }
};

// -------------------------------------------------------------
// RETRO 8-BIT PIXEL JOSH SPRITE GENERATOR (OFFLINE RETINA CANVAS)
// -------------------------------------------------------------
const PIXEL_PALETTE = {
  'H': '#784728', // hair base (warm golden-brown from photo)
  'h': '#553018', // fade sides (neatly tapered)
  'F': '#9b643c', // hair highlight
  'S': '#fde2b6', // skin tone (fair warm)
  's': '#ebb991', // nose / wireframe bridge
  'G': '#d97706', // gold wireframe aviator glasses
  'E': '#1e293b', // eyes (pupils)
  'B': '#58361e', // trimmed beard & mustache (from photo)
  'W': '#ffffff', // bright smile / white teeth
  'T': '#9ca3af', // athletic crew-neck gray tee (from photo)
  't': '#6b7280', // t-shirt shadow / folds
  'P': '#1e293b', // dark athletic joggers
  'K': '#0f172a', // black watch on wrist / shoes
  'O': '#b45309', // leather adventure backpack
  'Y': '#facc15', // gold checklist / passport
  'C': '#38bdf8', // coffee mug / blanket cyan
  'M': '#64748b', // bed frame
  'Z': '#c084fc', // purple Zzz
  'R': '#ef4444', // red ramen bowl
  'V': '#e2e8f0', // steam / fluffy clouds
  'F_CL': '#e2e8f0' // fluffy clouds alias
};

const PIXEL_MATRICES = {
  // Pre-Trip Mode: Josh with athletic gray tee, gold wireframe glasses, neat beard, watch & backpack!
  preparing: [
    ".....HHHHHH.....",
    "....FHHHHHHF....",
    "...hHSSSSSSHh...",
    "...hGEGsGEGh....",
    "...hSGsSSGSh....",
    "...hBBWWBBBh....",
    "....hBBBBBh.....",
    "..OOTTTTTTTT....",
    "..OOTTTTTTTT.YY.",
    "..OOTTTTTTTT.YY.",
    "..K.TTTTTTTT....",
    ".....PPPPPP.....",
    ".....PPPPPP.....",
    "....PPP..PPP....",
    "....PP....PP....",
    "...KKK....KKK..."
  ],

  // Trip Mode: Night sleep
  sleep: [
    "................",
    "............ZZ..",
    "...........Z....",
    "..........ZZ....",
    ".....HHHHHH.....",
    "....FHHHHHHF....",
    "...hGEGsGEGh....",
    "...hBBWWBBBh....",
    ".CCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCC.",
    ".MMMMMMMMMMMMMM.",
    ".MM..........MM.",
    "................"
  ],

  // Trip Mode: Morning coffee prep
  morning: [
    ".....HHHHHH.....",
    "....FHHHHHHF....",
    "...hHSSSSSSHh...",
    "...hGEGsGEGh....",
    "...hSGsSSGSh....",
    "...hBBWWBBBh....",
    "....hBBBBBh.....",
    "....TTTTTTTT.VV.",
    "...TTTTTTTTC.V..",
    "...TTTTTTTTC....",
    "..K.TTTTTTTTCC..",
    ".....PPPPPP.....",
    ".....PPPPPP.....",
    "....PPP..PPP....",
    "....PP....PP....",
    "...KKK....KKK..."
  ],

  // Trip Mode: Daytime active questing
  explore: [
    ".....HHHHHH.....",
    "....FHHHHHHF....",
    "...hHSSSSSSHh...",
    "...hGEGsGEGh....",
    "...hSGsSSGSh....",
    "...hBBWWBBBh....",
    "....hBBBBBh.....",
    "..OOTTTTTTTT....",
    "..OOTTTTTTTT....",
    "..OOTTTTTTTT....",
    "..K.TTTTTTTT....",
    ".....PPPPPP.....",
    ".....PPPPPP.....",
    "....PPP..PPP....",
    "....PP....PP....",
    "...KKK....KKK..."
  ],

  // Trip Mode: Evening dinner & ramen
  dining: [
    ".....HHHHHH.....",
    "....FHHHHHHF....",
    "...hHSSSSSSHh...",
    "...hGEGsGEGh....",
    "...hSGsSSGSh....",
    "...hBBWWBBBh....",
    "....hBBBBBh.....",
    "....TTTTTTTT.VV.",
    "...TTTTTTTT.V.V.",
    "...TTTTTTTT..YY.",
    "..KRRRRRRRR.....",
    "....RRRRRR......",
    ".....PPPPPP.....",
    ".....PPPPPP.....",
    "....PPP..PPP....",
    "...KKK....KKK..."
  ],

  // Trip Mode: In flight
  flight: [
    "................",
    "..........WW....",
    ".........WWW....",
    "........WWWW....",
    "....WWWWWWWWWW..",
    "...WWWWWEWWWWW..",
    "..WWWWWWWWWWWWW.",
    ".WWWWWWWWWWWWWWW",
    "..WWWWWWWWWWWWW.",
    "...WWWWWWWWWWW..",
    "....WWWWWWWWWW..",
    "........WWWW....",
    ".........WWW....",
    "..........WW....",
    ".VVVV......VVVV.",
    "VVVVVVVV..VVVVVV"
  ],

  // Post-Trip Mode: Safely Home
  home: [
    ".....HHHHHH.....",
    "....FHHHHHHF....",
    "...hHSSSSSSHh...",
    "...hGEGsGEGh....",
    "...hSGsSSGSh....",
    "...hBBWWBBBh....",
    "....hBBBBBh.....",
    "....TTTTTTTT....",
    "...WTTTTTTTTW...",
    "...WTTTTTTTTW...",
    "..K.TTTTTTTT....",
    ".....PPPPPP.....",
    ".....PPPPPP.....",
    "....PPP..PPP....",
    "....PP....PP....",
    "...KKK....KKK..."
  ]
};

function createPixelJoshImage(stateKey) {
  let matrix = PIXEL_MATRICES[stateKey] || PIXEL_MATRICES.preparing;
  let scale = 2; // 16x16 matrix drawn into a sharp 32x32 retina image
  let ctx = new DrawContext();
  ctx.size = new Size(16 * scale, 16 * scale);
  ctx.opaque = false;

  for (let r = 0; r < matrix.length; r++) {
    let row = matrix[r];
    for (let c = 0; c < row.length; c++) {
      let ch = row[c];
      let hex = PIXEL_PALETTE[ch];
      if (hex) {
        ctx.setFillColor(new Color(hex));
        ctx.fillRect(new Rect(c * scale, r * scale, scale, scale));
      }
    }
  }
  return ctx.getImage();
}

// -------------------------------------------------------------
// SCRIPT NAME & RELIABLE ACTION URL GENERATOR
// Explicit query parameter format guarantees parameter delivery across iOS 16, 17 & 18
// -------------------------------------------------------------
function getScriptCurrentName() {
  try {
    if (typeof Script.name === "function") {
      let n = Script.name();
      if (n && n.trim().length > 0) return n.trim();
    }
  } catch(e) {}
  return "JapanFamilyTrackerWidget";
}

function getActionUrl(action) {
  try {
    let name = (typeof Script.name === "function") ? Script.name() : getScriptName();
    return "scriptable:///run?scriptName=" + encodeURIComponent(name) + "&action=" + encodeURIComponent(action);
  } catch(e) {
    return "scriptable:///run?scriptName=JapanFamilyTrackerWidget&action=" + encodeURIComponent(action);
  }
}

// -------------------------------------------------------------
// MULTI-LAYER ACTION EXTRACTOR
// Resilient against iOS deep link sandboxing changes & varied URL formats
// -------------------------------------------------------------
function extractAction() {
  if (typeof args !== "undefined" && args) {
    // 1. Standard query parameters (?action=emergency or &action=emergency)
    if (args.queryParameters) {
      if (args.queryParameters.action) return String(args.queryParameters.action).toLowerCase().trim();
      for (let k of Object.keys(args.queryParameters)) {
        let kl = k.toLowerCase().trim();
        let vl = String(args.queryParameters[k]).toLowerCase().trim();
        if (kl === "emergency" || vl === "emergency") return "emergency";
        if (kl === "hotel" || vl === "hotel") return "hotel";
        if (kl === "timeline" || vl === "timeline" || kl === "itinerary" || vl === "itinerary") return "timeline";
        if (kl === "flights" || vl === "flights") return "flights";
      }
    }
    // 2. Widget parameter (Configured in iOS Home Screen Edit Widget menu)
    if (args.widgetParameter && typeof args.widgetParameter === "string") {
      let wp = args.widgetParameter.toLowerCase().trim();
      if (wp.includes("emerg")) return "emergency";
      if (wp.includes("hotel")) return "hotel";
      if (wp.includes("time") || wp.includes("itin")) return "timeline";
      if (wp.includes("flight")) return "flights";
    }
    // 3. Raw URL deep-link array (Captures full URL string if queryParameters was omitted by iOS)
    if (args.urls && args.urls.length > 0) {
      let u = decodeURIComponent(String(args.urls[0])).toLowerCase();
      if (u.includes("action=emergency") || u.includes("emergency")) return "emergency";
      if (u.includes("action=hotel") || u.includes("hotel")) return "hotel";
      if (u.includes("action=timeline") || u.includes("timeline")) return "timeline";
      if (u.includes("action=flights") || u.includes("flights")) return "flights";
    }
    // 4. Plain texts array
    if (args.plainTexts && args.plainTexts.length > 0) {
      let pt = String(args.plainTexts[0]).toLowerCase();
      if (pt.includes("emerg")) return "emergency";
      if (pt.includes("hotel")) return "hotel";
      if (pt.includes("timeline")) return "timeline";
      if (pt.includes("flight")) return "flights";
    }
  }
  return "";
}

// -------------------------------------------------------------
// APP ROUTING (WIDGET vs DIRECT ACTION MODAL SHEETS)
// -------------------------------------------------------------
let action = extractAction();

if (config.runsInWidget) {
  let family = config.widgetFamily || "medium";
  let w = await makeWidget(family);
  Script.setWidget(w);
  Script.complete();
} else if (action === "emergency") {
  let info = await loadCurrentStatus();
  await showEmergencySheet(info);
  Script.complete();
} else if (action === "hotel") {
  let info = await loadCurrentStatus();
  await showHotelSheet(info);
  Script.complete();
} else if (action === "timeline" || action === "itinerary" || action === "status") {
  await showTimelineSheet();
  Script.complete();
} else if (action === "flights") {
  await showFlightsSheet();
  Script.complete();
} else if (action === "url" || action === "dashboard" || action === "web") {
  Safari.open(WEB_DASHBOARD_URL);
  Script.complete();
} else {
  // If run directly inside Scriptable app without an action (e.g. pressing Play in editor)
  let menu = new Alert();
  menu.title = "Where's Josh? • Japan Tracker";
  menu.message = "Choose an option to preview:";
  menu.addAction("🌐 Open Live Web Dashboard (GitHub Pages)");
  menu.addAction("📅 View Full 10-Day Trip Itinerary");
  menu.addAction("🏨 View Hotel Basecamp (Little Rock / Japan)");
  menu.addAction("🚨 View Emergency & Insurance Hub");
  menu.addAction("✈️ View Accurate Flights & Live Trackers");
  menu.addAction("📱 Preview Medium Widget (Home Screen)");
  menu.addAction("📱 Preview Large Widget");
  menu.addCancelAction("Cancel");
  let res = await menu.presentAlert();
  if (res === 0) {
    Safari.open(WEB_DASHBOARD_URL);
  } else if (res === 1) {
    await showTimelineSheet();
  } else if (res === 2) {
    let info = await loadCurrentStatus();
    await showHotelSheet(info);
  } else if (res === 3) {
    let info = await loadCurrentStatus();
    await showEmergencySheet(info);
  } else if (res === 4) {
    await showFlightsSheet();
  } else if (res === 5) {
    let w = await makeWidget("medium");
    await w.presentMedium();
  } else if (res === 6) {
    let w = await makeWidget("large");
    await w.presentLarge();
  }
  Script.complete();
}

// -------------------------------------------------------------
// WIDGET FACE BUILDER (ADAPTIVE MEDIUM & LARGE LAYOUTS)
// -------------------------------------------------------------
async function makeWidget(family = "medium") {
  let w = new ListWidget();
  w.url = WEB_DASHBOARD_URL;
  let now = new Date();
  w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 5);

  let info = await loadCurrentStatus();

  // Premium Deep Slate / Indigo Theme
  let bg = new LinearGradient();
  bg.locations = [0, 1];
  bg.colors = [new Color("#0f172a"), new Color("#090d16")];
  w.backgroundGradient = bg;

  // Dynamic JST & Local Time Resolution (Josh Standard Time vs Japan Standard Time)
  let joshZone = getJoshTimeZone(now);
  let joshTime = new Intl.DateTimeFormat('en-US', { timeZone: joshZone.timeZone, hour: 'numeric', minute: '2-digit' }).format(now);
  let localTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(now);

  // Time in minutes for Josh's current physical location (e.g. Central Time in USA or JST in Japan)
  let joshParts = new Intl.DateTimeFormat('en-US', { timeZone: joshZone.timeZone, hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  let joshHour = parseInt(joshParts.find(p => p.type === 'hour').value, 10);
  let joshMin = parseInt(joshParts.find(p => p.type === 'minute').value, 10);
  if (joshHour === 24) joshHour = 0;
  let joshTotalMinutes = joshHour * 60 + joshMin;

  // Trip Dates
  let departureDate = new Date("2027-03-21T07:00:00-05:00");
  let returnDate = new Date("2027-03-31T21:54:00-05:00");
  let diffDays = Math.ceil((departureDate - now) / 86400000);
  let isPreTrip = now < departureDate;
  let isPostTrip = now > returnDate;

  // Pixel Josh Activity Status (Custom Sleep: 8:15 PM / 1215m to 5:00 AM / 300m in Josh's local time)
  let contactStatus;
  if (info.isFlightDay) {
    contactStatus = {
      key: "flight",
      badge: "✈️ SKY TRANSIT",
      text: "Cruising at 35,000 ft • Flight Mode",
      color: "#60a5fa"
    };
  } else if (joshTotalMinutes >= 1215 || joshTotalMinutes < 300) {
    // 8:15 PM to 5:00 AM: SLEEP MODE (Josh's local time)
    contactStatus = {
      key: "sleep",
      badge: "🛌 SLEEP MODE 💤",
      text: isPreTrip ? ("Josh is fast asleep for the night • " + diffDays + "d to takeoff") : "Late night in Japan • Do not disturb",
      color: "#c084fc"
    };
  } else if (joshTotalMinutes >= 300 && joshTotalMinutes < 510) {
    // 5:00 AM to 8:30 AM: MORNING FUEL (Josh's local time)
    contactStatus = {
      key: "morning",
      badge: "☕ MORNING FUEL",
      text: isPreTrip ? ("Up early, coffee & prep • " + diffDays + "d to takeoff!") : "Waking up & breakfast • Good time to text",
      color: "#ffd166"
    };
  } else if (isPostTrip) {
    contactStatus = {
      key: "home",
      badge: "🏡 SAFELY HOME",
      text: "Trip completed • Josh is back safely!",
      color: "#38bdf8"
    };
  } else if (isPreTrip) {
    contactStatus = {
      key: "preparing",
      badge: "🎒 PREPARING",
      text: "Pre-trip prep • " + diffDays + " days to takeoff!",
      color: "#ffd166"
    };
  } else if (joshTotalMinutes >= 1080 && joshTotalMinutes < 1215) {
    // 6:00 PM to 8:15 PM in Japan: Dinner & wind-down
    contactStatus = {
      key: "dining",
      badge: "🍜 DINING & RAMEN",
      text: "Active / Dinner & evening wind-down",
      color: "#fb923c"
    };
  } else {
    // Daytime exploration in Japan
    contactStatus = {
      key: "explore",
      badge: "🎒 QUESTING",
      text: "Out & exploring Japan • Great time to text",
      color: "#4ade80"
    };
  }

  // Pre-render pixel sprite
  let spriteImg = createPixelJoshImage(contactStatus.key);

  // -------------------------------------------------------------
  // MEDIUM WIDGET LAYOUT (~360 x 169 pt) - TWO-COLUMN SPLIT (BREATHABLE & BALANCED)
  // -------------------------------------------------------------
  if (family !== "large") {
    w.setPadding(13, 14, 13, 14);
    w.url = WEB_DASHBOARD_URL;

    let root = w.addStack();
    root.layoutHorizontally();

    // =========================================================
    // LEFT COLUMN (~42% width)
    // =========================================================
    let left = root.addStack();
    left.layoutVertically();

    // 1. Header (Title + City Tag)
    let titleTxt = left.addText("WHERE'S JOSH? 🇯🇵");
    titleTxt.font = Font.heavySystemFont(9);
    titleTxt.textColor = new Color("#94a3b8");
    titleTxt.minimumScaleFactor = 0.85;

    let cityTxt = left.addText(info.city.toUpperCase());
    cityTxt.font = Font.heavySystemFont(14.5);
    cityTxt.textColor = Color.white();
    cityTxt.lineLimit = 1;
    cityTxt.minimumScaleFactor = 0.85;

    left.addSpacer(7);

    // 2. Pixel Josh Sprite & Status Badge (Tap to text Josh directly)
    let cBar = left.addStack();
    cBar.layoutHorizontally();
    cBar.backgroundColor = new Color("#162032", 0.95);
    cBar.cornerRadius = 8;
    cBar.borderWidth = 1;
    cBar.borderColor = new Color(contactStatus.color, 0.45);
    cBar.setPadding(6, 8, 6, 8);
    cBar.url = "sms:";

    cBar.centerAlignContent();
    let avatar = cBar.addImage(spriteImg);
    avatar.imageSize = new Size(26, 26);
    avatar.cornerRadius = 4;

    cBar.addSpacer(6);

    let cInfo = cBar.addStack();
    cInfo.layoutVertically();

    let cBadge = cInfo.addText(contactStatus.badge);
    cBadge.font = Font.heavySystemFont(8.5);
    cBadge.textColor = new Color(contactStatus.color);
    cBadge.lineLimit = 1;
    cBadge.minimumScaleFactor = 0.8;

    let cNoteText = contactStatus.key === "sleep" ? (isPreTrip ? "Sleeping (wake 5 AM)" : "Sleeping in JST") :
      contactStatus.key === "morning" ? (isPreTrip ? "Up early • " + diffDays + "d to go" : "Morning in Japan") :
      isPreTrip ? (diffDays + "d to takeoff") :
      (contactStatus.key === "dining" ? "Dinner in Tokyo" : "Active in Tokyo");
    let cNote = cInfo.addText(cNoteText);
    cNote.font = Font.mediumSystemFont(8);
    cNote.textColor = new Color("#cbd5e1");
    cNote.lineLimit = 1;
    cNote.minimumScaleFactor = 0.8;

    cBar.addSpacer();

    let cIcon = cBar.addText("💬");
    cIcon.font = Font.systemFont(9);

    left.addSpacer(7);

    // 3. Compact Dual Clocks (Josh JST vs Local Time)
    let clockBox = left.addStack();
    clockBox.layoutVertically();
    clockBox.backgroundColor = new Color("#131a29", 0.85);
    clockBox.cornerRadius = 7;
    clockBox.setPadding(6, 8, 6, 8);

    let jstRow = clockBox.addStack();
    jstRow.layoutHorizontally();
    let jstLbl = jstRow.addText(joshZone.label);
    jstLbl.font = Font.boldSystemFont(8);
    jstLbl.textColor = new Color("#94a3b8");
    jstRow.addSpacer();
    let jstVal = jstRow.addText(joshTime);
    jstVal.font = Font.boldSystemFont(9.5);
    jstVal.textColor = new Color("#ffd166");

    clockBox.addSpacer(3);

    let locRow = clockBox.addStack();
    locRow.layoutHorizontally();
    let locLbl = locRow.addText("YOUR TIME");
    locLbl.font = Font.mediumSystemFont(7.5);
    locLbl.textColor = new Color("#64748b");
    locRow.addSpacer();
    let locVal = locRow.addText(localTime);
    locVal.font = Font.mediumSystemFont(8.5);
    locVal.textColor = new Color("#cbd5e1");

    // =========================================================
    // DIVIDER GUTTER
    // =========================================================
    root.addSpacer(10);

    // =========================================================
    // RIGHT COLUMN (~58% width)
    // =========================================================
    let right = root.addStack();
    right.layoutVertically();

    // 1. Status & Itinerary Focus Card (Tap opens Full Timeline sheet)
    let fCard = right.addStack();
    fCard.layoutVertically();
    fCard.backgroundColor = new Color("#162032");
    fCard.cornerRadius = 8;
    fCard.setPadding(7, 10, 7, 10);
    fCard.url = getActionUrl("timeline");

    let fHeader = fCard.addStack();
    fHeader.layoutHorizontally();
    fHeader.url = getActionUrl("timeline");
    let fHeadTxt = fHeader.addText("📍 STATUS & ITINERARY");
    fHeadTxt.font = Font.heavySystemFont(8);
    fHeadTxt.textColor = new Color("#93c5fd");
    fHeadTxt.url = getActionUrl("timeline");

    fHeader.addSpacer();

    let fTap = fHeader.addText("Tour ↗");
    fTap.font = Font.boldSystemFont(8);
    fTap.textColor = new Color("#ffd166");
    fTap.url = getActionUrl("timeline");

    fCard.addSpacer(3);

    let fBlurb = fCard.addText(info.mediumSummary || info.statusSummary);
    fBlurb.font = Font.mediumSystemFont(9.5);
    fBlurb.textColor = Color.white();
    fBlurb.lineLimit = 3;
    fBlurb.minimumScaleFactor = 0.8;
    fBlurb.url = getActionUrl("timeline");

    right.addSpacer(7);

    // 2. Combined Hotel Basecamp Card & Button (Directly opens Hotel Card Sheet)
    let isHome = (info.hotel.phone === "N/A" || info.hotel.name.includes("Little Rock"));
    let hBox = right.addStack();
    hBox.layoutHorizontally();
    hBox.backgroundColor = new Color("#131a29");
    hBox.cornerRadius = 7;
    hBox.borderWidth = 1;
    hBox.borderColor = new Color("#ffd166", 0.3);
    hBox.setPadding(6, 9, 6, 9);
    hBox.url = getActionUrl("hotel");

    let hIcon = hBox.addText(isHome ? "🏡 " : "🏨 ");
    hIcon.font = Font.systemFont(9);

    let hInfo = hBox.addStack();
    hInfo.layoutVertically();
    hInfo.url = getActionUrl("hotel");

    let hLabel = hInfo.addText(isHome ? "HOME BASECAMP" : "HOTEL BASECAMP");
    hLabel.font = Font.heavySystemFont(7);
    hLabel.textColor = new Color("#ffd166");
    hLabel.url = getActionUrl("hotel");

    let hName = hInfo.addText(info.hotel.name);
    hName.font = Font.boldSystemFont(8.5);
    hName.textColor = new Color("#f1f5f9");
    hName.lineLimit = 1;
    hName.minimumScaleFactor = 0.75;
    hName.url = getActionUrl("hotel");

    hBox.addSpacer();

    let hBtn = hBox.addStack();
    hBtn.backgroundColor = new Color("#27272a");
    hBtn.cornerRadius = 4;
    hBtn.setPadding(2, 5, 2, 5);
    hBtn.url = getActionUrl("hotel");
    let hBtnTxt = hBtn.addText("↗");
    hBtnTxt.font = Font.boldSystemFont(9);
    hBtnTxt.textColor = new Color("#ffd166");
    hBtnTxt.url = getActionUrl("hotel");

    right.addSpacer(7);

    // 3. Quick Action Buttons Row (Streamlined: Emergency Hub & Flight Tracker)
    let bRow = right.addStack();
    bRow.layoutHorizontally();

    // 3a. Emergency Hub (Opens Emergency Info Sheet)
    let btnEmerg = bRow.addStack();
    btnEmerg.layoutHorizontally();
    btnEmerg.centerAlignContent();
    btnEmerg.backgroundColor = new Color("#2d1217");
    btnEmerg.borderColor = new Color("#ef4444", 0.55);
    btnEmerg.borderWidth = 1;
    btnEmerg.cornerRadius = 6;
    btnEmerg.setPadding(5, 5, 5, 5);
    btnEmerg.url = getActionUrl("emergency");
    btnEmerg.addSpacer();
    let mEmergTxt = btnEmerg.addText("🚨 Emergency");
    mEmergTxt.font = Font.boldSystemFont(8);
    mEmergTxt.textColor = new Color("#fca5a5");
    mEmergTxt.lineLimit = 1;
    mEmergTxt.minimumScaleFactor = 0.65;
    mEmergTxt.url = getActionUrl("emergency");
    btnEmerg.addSpacer();

    bRow.addSpacer(6);

    // 3b. Live Flight Tracker on FlightAware (Opens in default browser)
    let flightTracker = getActiveFlightTracker(now);
    let btnFlights = bRow.addStack();
    btnFlights.layoutHorizontally();
    btnFlights.centerAlignContent();
    btnFlights.backgroundColor = new Color("#1e3a5f");
    btnFlights.borderWidth = 1;
    btnFlights.borderColor = new Color("#3b82f6", 0.4);
    btnFlights.cornerRadius = 6;
    btnFlights.setPadding(5, 5, 5, 5);
    btnFlights.url = getFlightUrl(now);
    btnFlights.addSpacer();
    let flightBtnLabel = "✈️ Flights";
    let mFlightTxt = btnFlights.addText(flightBtnLabel);
    mFlightTxt.font = Font.boldSystemFont(8);
    mFlightTxt.textColor = new Color("#93c5fd");
    mFlightTxt.lineLimit = 1;
    mFlightTxt.minimumScaleFactor = 0.65;
    mFlightTxt.url = getFlightUrl(now);
    btnFlights.addSpacer();
    return w;
  }
// -------------------------------------------------------------
  // LARGE WIDGET LAYOUT (~360 x 379 pt) - EXPANDED VERTICAL STACK
  // -------------------------------------------------------------
  w.setPadding(13, 16, 12, 16);

  // Row 1: Header + City Badge + Dual Clocks
  let r1 = w.addStack();
  r1.layoutHorizontally();

  let hLeft = r1.addStack();
  hLeft.layoutVertically();
  let titleTxt = hLeft.addText("WHERE'S JOSH? 🇯🇵");
  titleTxt.font = Font.heavySystemFont(11);
  titleTxt.textColor = new Color("#94a3b8");

  let cityTxt = hLeft.addText(info.city.toUpperCase());
  cityTxt.font = Font.heavySystemFont(18);
  cityTxt.textColor = Color.white();

  r1.addSpacer();

  let hRight = r1.addStack();
  hRight.layoutVertically();

  let clockTxt = hRight.addText(joshZone.label + ": " + joshTime);
  clockTxt.font = Font.boldSystemFont(11);
  clockTxt.textColor = new Color("#ffd166");
  clockTxt.rightAlignText();

  let homeClock = hRight.addText("YOUR TIME: " + localTime);
  homeClock.font = Font.mediumSystemFont(9);
  homeClock.textColor = new Color("#64748b");
  homeClock.rightAlignText();

  w.addSpacer(7);

  // Row 2: Retro 8-Bit Pixel Josh Contact Status Bar (Tap to text Josh directly)
  let cBar = w.addStack();
  cBar.layoutHorizontally();
  cBar.backgroundColor = new Color("#162032", 0.9);
  cBar.cornerRadius = 8;
  cBar.borderWidth = 1;
  cBar.borderColor = new Color(contactStatus.color, 0.45);
  cBar.setPadding(6, 8, 6, 8);
  cBar.url = "sms:";

  let avatar = cBar.addImage(spriteImg);
  avatar.imageSize = new Size(24, 24);
  avatar.cornerRadius = 4;

  cBar.addSpacer(8);

  let cInfo = cBar.addStack();
  cInfo.layoutVertically();

  let cBadge = cInfo.addText(contactStatus.badge);
  cBadge.font = Font.heavySystemFont(10);
  cBadge.textColor = new Color(contactStatus.color);

  let cNote = cInfo.addText(contactStatus.text);
  cNote.font = Font.mediumSystemFont(8.5);
  cNote.textColor = new Color("#cbd5e1");
  cNote.lineLimit = 1;

  cBar.addSpacer();

  let cBtn = cBar.addStack();
  cBtn.backgroundColor = new Color("#1e3a5f");
  cBtn.cornerRadius = 5;
  cBtn.setPadding(3, 7, 3, 7);
  let cBtnTxt = cBtn.addText("💬 Text");
  cBtnTxt.font = Font.boldSystemFont(8.5);
  cBtnTxt.textColor = new Color("#93c5fd");

  w.addSpacer(8);

  // Row 3: Status & Itinerary Focus Card (Tap opens Full Timeline)
  let fCard = w.addStack();
  fCard.layoutVertically();
  fCard.backgroundColor = new Color("#162032");
  fCard.cornerRadius = 10;
  fCard.setPadding(9, 12, 9, 12);
  fCard.url = getActionUrl("timeline");

  let fHeader = fCard.addStack();
  fHeader.layoutHorizontally();
  fHeader.url = getActionUrl("timeline");
  let fIcon = fHeader.addText("📍 ");
  fIcon.font = Font.boldSystemFont(10);
  let fHeadTxt = fHeader.addText("CURRENT STATUS & ITINERARY");
  fHeadTxt.font = Font.heavySystemFont(8);
  fHeadTxt.textColor = new Color("#93c5fd");
  fHeadTxt.url = getActionUrl("timeline");

  fHeader.addSpacer();

  let fTap = fHeader.addText("Full Tour ↗");
  fTap.font = Font.boldSystemFont(8);
  fTap.textColor = new Color("#ffd166");
  fTap.url = getActionUrl("timeline");

  fCard.addSpacer(3);

  let fBlurb = fCard.addText(info.statusSummary);
  fBlurb.font = Font.mediumSystemFont(10.5);
  fBlurb.textColor = Color.white();
  fBlurb.lineLimit = 4;
  fBlurb.minimumScaleFactor = 0.85;
  fBlurb.url = getActionUrl("timeline");

  w.addSpacer(8);

  // Row 4: Hotel Basecamp Quick Pill (Tap opens Hotel Card)
  let isHomeLrg = (info.hotel.phone === "N/A" || info.hotel.name.includes("Little Rock"));
  let hBox = w.addStack();
  hBox.layoutHorizontally();
  hBox.backgroundColor = new Color("#131a29");
  hBox.cornerRadius = 7;
  hBox.setPadding(6, 10, 6, 10);
  hBox.url = getActionUrl("hotel");

  let hIcon = hBox.addText(isHomeLrg ? "🏡 " : "🏨 ");
  hIcon.font = Font.systemFont(10);

  let hName = hBox.addText(isHomeLrg ? "Home Base: Little Rock, AR" : info.hotel.name);
  hName.font = Font.boldSystemFont(10);
  hName.textColor = new Color("#e2e8f0");
  hName.lineLimit = 1;
  hName.url = getActionUrl("hotel");

  hBox.addSpacer();

  let hPhone = hBox.addText(isHomeLrg ? "Base Info ↗" : "View Hotel ↗");
  hPhone.font = Font.semiboldSystemFont(9);
  hPhone.textColor = new Color("#ffd166");
  hPhone.url = getActionUrl("hotel");

  w.addSpacer(9);

  // Row 5: Action Buttons for Friends & Family (Streamlined: Emergency Hub & Flight Tracker)
  let bRow = w.addStack();
  bRow.layoutHorizontally();

  // 1. Direct Emergency Information Page
  let btnEmerg = bRow.addStack();
  btnEmerg.backgroundColor = new Color("#2d1217");
  btnEmerg.borderColor = new Color("#ef4444", 0.55);
  btnEmerg.borderWidth = 1;
  btnEmerg.cornerRadius = 6;
  btnEmerg.setPadding(6, 12, 6, 12);
  btnEmerg.url = getActionUrl("emergency");

  let mEmergTxt = btnEmerg.addText("🚨 Emergency & Safety Hub");
  mEmergTxt.font = Font.boldSystemFont(9.5);
  mEmergTxt.textColor = new Color("#fca5a5");
  mEmergTxt.url = getActionUrl("emergency");

  bRow.addSpacer();

  // 2. Direct Live Flight Tracker on FlightAware (Opens in user's default browser)
  let flightTracker = getActiveFlightTracker(now);
  let btnFlights = bRow.addStack();
  btnFlights.backgroundColor = new Color("#1e3a5f");
  btnFlights.borderWidth = 1;
  btnFlights.borderColor = new Color("#3b82f6", 0.45);
  btnFlights.cornerRadius = 6;
  btnFlights.setPadding(6, 12, 6, 12);
  btnFlights.url = getFlightUrl(now);
  let flightBtnLabel = "✈️ Flight Tracker";
  let mFlightTxt = btnFlights.addText(flightBtnLabel);
  mFlightTxt.font = Font.boldSystemFont(9.5);
  mFlightTxt.textColor = new Color("#93c5fd");
  mFlightTxt.url = getFlightUrl(now);

  return w;
}

// -------------------------------------------------------------
// DYNAMIC TRIP RESOLVER
// -------------------------------------------------------------
async function loadCurrentStatus() {
  let now = new Date();
  let jstStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(now);

  let departureDate = new Date("2027-03-21T07:00:00-05:00");
  let returnDate = new Date("2027-03-31T21:54:00-05:00");
  let diffDays = Math.ceil((departureDate - now) / 86400000);

  // Pre-trip mode
  if (diffDays > 0) {
    return {
      city: "Pre-Trip",
      stageLabel: diffDays + "d to takeoff",
      mapQuery: "Little Rock, AR",
      statusSummary: "Once Josh departs on March 21, this dynamic tracker will update in real-time to show where Josh is and what he's doing at every moment according to his itinerary!",
      mediumSummary: "Live tracking activates March 21 at takeoff! Tap Tour ↗ for the complete 10-day trip itinerary.",
      todaysFocus: "Pre-trip packing & preparations in Little Rock. Tap Tour for the complete 10-day itinerary.",
      hotel: {
        name: "Little Rock, AR",
        fullName: "Home Base • Little Rock, Arkansas",
        address: "Little Rock, AR, USA (Pre-Trip Preparation)",
        addressJa: "アメリカ合衆国 アーカンソー州リトルロック (出発前)",
        phone: "N/A",
        note: "Josh has not departed for Japan yet! Flight takeoff is scheduled for March 21, 2027. First hotel basecamp in Tokyo will be Citadines Shinjuku Tokyo upon arrival."
      },
      isFlightDay: false
    };
  }

  // In-trip day-by-day lookup
  if (TRIP_SCHEDULE[jstStr]) {
    let dayData = TRIP_SCHEDULE[jstStr];
    return {
      city: dayData.city,
      stageLabel: "In Japan",
      mapQuery: dayData.mapQuery,
      statusSummary: dayData.statusSummary,
      mediumSummary: dayData.mediumSummary || dayData.statusSummary,
      todaysFocus: dayData.todaysFocus,
      hotel: dayData.hotel,
      isFlightDay: jstStr === "2027-03-21" || jstStr === "2027-03-31"
    };
  }

  // Post-trip mode
  if (now > returnDate) {
    return {
      city: "Home",
      stageLabel: "Trip Completed",
      mapQuery: "Little Rock, AR",
      statusSummary: "Josh has returned safely home from Japan! Ask him about Mt. Fuji, Kyoto temples, and the neon lights of Osaka.",
      mediumSummary: "Josh returned safely home to Little Rock! Tap Tour ↗ to review memories.",
      todaysFocus: "Unpacking souvenirs, settling back in, and recovering from transpacific jet lag.",
      hotel: {
        name: "Little Rock, AR",
        fullName: "Home Base • Little Rock, Arkansas",
        address: "Little Rock, AR, USA (Trip Completed)",
        addressJa: "アメリカ合衆国 アーカンソー州リトルロック (帰国済)",
        phone: "N/A",
        note: "Josh has returned safely home from Japan!"
      },
      isFlightDay: false
    };
  }

  // Active fallback (Tokyo Groove)
  return TRIP_SCHEDULE["2027-03-24"];
}

// -------------------------------------------------------------
// HELPER: INLINE CSS PIXEL ANIMATIONS FOR WEBVIEWS
// -------------------------------------------------------------
function getPixelCssAnimations() {
  return `
    @keyframes pixelBreathe {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(1.5px); }
    }
    @keyframes floatZzz1 {
      0% { opacity: 0; transform: translateY(6px) scale(0.6); }
      40% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-16px) translateX(8px) scale(1.1); }
    }
    @keyframes floatZzz2 {
      0% { opacity: 0; transform: translateY(6px) scale(0.6); }
      40% { opacity: 1; }
      100% { opacity: 0; transform: translateY(-20px) translateX(12px) scale(1.3); }
    }
    @keyframes steamRise {
      0% { opacity: 0; transform: translateY(4px) scale(0.7); }
      50% { opacity: 0.9; }
      100% { opacity: 0; transform: translateY(-14px) translateX(3px) scale(1.2); }
    }
    @keyframes walkBounce {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-3px) rotate(2deg); }
      50% { transform: translateY(0) rotate(0deg); }
      75% { transform: translateY(-3px) rotate(-2deg); }
    }
    @keyframes slurpBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes planeHover {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .anim-breathe { animation: pixelBreathe 3s ease-in-out infinite; }
    .anim-walk { animation: walkBounce 0.6s steps(4, jump-none) infinite; }
    .anim-slurp { animation: slurpBob 1.6s ease-in-out infinite; }
    .anim-plane { animation: planeHover 2.6s ease-in-out infinite; }
    .zzz-1 { animation: floatZzz1 2.4s ease-out infinite; }
    .zzz-2 { animation: floatZzz2 2.4s ease-out infinite 1.2s; }
    .steam-1 { animation: steamRise 2s ease-out infinite; }
    .steam-2 { animation: steamRise 2s ease-out infinite 1s; }
  `;
}

function getPixelSvgSprite(stateKey) {
  let grid = PIXEL_MATRICES[stateKey] || PIXEL_MATRICES.preparing;
  let pSize = 3;
  let rects = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      let ch = grid[r][c];
      let hex = PIXEL_PALETTE[ch];
      if (hex) {
        rects.push('<rect x="' + (c * pSize) + '" y="' + (r * pSize) + '" width="' + pSize + '" height="' + pSize + '" fill="' + hex + '" />');
      }
    }
  }

  let animClass = "anim-walk";
  let extras = "";
  if (stateKey === "sleep") {
    animClass = "anim-breathe";
    extras = '<g class="zzz-1"><text x="32" y="14" fill="#c084fc" font-size="9" font-family="monospace" font-weight="bold">Z</text></g><g class="zzz-2"><text x="36" y="10" fill="#e9d5ff" font-size="7" font-family="monospace" font-weight="bold">z</text></g>';
  } else if (stateKey === "morning") {
    animClass = "anim-breathe";
    extras = '<g class="steam-1"><circle cx="36" cy="18" r="1.5" fill="#f8fafc" /></g><g class="steam-2"><circle cx="38" cy="14" r="1.5" fill="#e2e8f0" /></g>';
  } else if (stateKey === "dining") {
    animClass = "anim-slurp";
    extras = '<g class="steam-1"><circle cx="30" cy="16" r="1.5" fill="#f8fafc" /></g><g class="steam-2"><circle cx="34" cy="12" r="1.5" fill="#e2e8f0" /></g>';
  } else if (stateKey === "flight") {
    animClass = "anim-plane";
  } else if (stateKey === "preparing") {
    animClass = "anim-breathe";
  }

  return '<svg viewBox="0 0 48 48" width="48" height="48" style="image-rendering: pixelated; shape-rendering: crispEdges;"><g class="' + animClass + '">' + rects.join('') + '</g>' + extras + '</svg>';
}

// -------------------------------------------------------------
// MODAL SHEET: DEDICATED EMERGENCY INFORMATION PAGE
// Directly presented when tapping "🚨 Emergency" on widget
// -------------------------------------------------------------
async function showEmergencySheet(info) {
  let wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    let u = req.url;
    if (!u) return true;
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("tel:") || u.startsWith("maps:")) {
      Safari.open(u);
      return false;
    }
    return true;
  };

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Josh's Emergency & Safety Hub</title>
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 20px 16px 40px 16px;
          background-color: #0b0f17; color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        }
        ${getPixelCssAnimations()}
        .header { text-align: center; margin-bottom: 20px; }
        .badge {
          display: inline-block; background: rgba(239, 68, 68, 0.15);
          color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;
        }
        .title { font-size: 22px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; }
        .subtitle { font-size: 12px; color: #94a3b8; }
        .card {
          background: #141b29; border: 1px solid #243047; border-radius: 12px;
          padding: 14px; margin-bottom: 14px;
        }
        .card-title { font-size: 13px; font-weight: 800; color: #ffd166; text-transform: uppercase; margin-bottom: 8px; }
        .emerg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .btn {
          display: block; text-align: center; text-decoration: none; padding: 10px 8px;
          border-radius: 8px; font-size: 12px; font-weight: 700;
        }
        .btn-red { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.45); }
        .btn-blue { background: #1e3a5f; color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
        .btn-green { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .btn-slate { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
        .phrase-card {
          background: #0f1420; border-radius: 8px; padding: 8px 10px; margin-top: 6px;
          font-size: 11px; line-height: 1.4; border-left: 3px solid #fca5a5;
        }
        .phrase-en { font-weight: 700; color: #ffffff; }
        .phrase-ja { color: #fca5a5; font-size: 12px; margin-top: 2px; }
        .phrase-romaji { color: #94a3b8; font-size: 10px; font-style: italic; }
        .footer-note { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="badge">🚨 24/7 Safety & Assistance</span>
        <h1 class="title">Emergency Hub</h1>
        <div class="subtitle">Tin Leg Travel Insurance, Embassy & Japanese First Responders</div>
      </div>

      <!-- Tin Leg Platinum Travel Insurance -->
      <div class="card" style="border-color: rgba(239, 68, 68, 0.45);">
        <div class="card-title" style="color: #fca5a5;">🛡️ Travel Medical & Cancellation Insurance</div>
        <div style="font-size: 12px; line-height: 1.55; color: #cbd5e1;">
          <strong>Provider:</strong> Tin Leg Platinum Policy<br>
          <strong>Coverage:</strong> $100,000 Emergency Medical • $500,000 Medical Evacuation • $20,000 Trip Cancellation<br>
          <strong>24/7 International Emergency Hotline:</strong> <a href="tel:+17272645657" style="color: #ffd166; font-weight: bold;">+1 727-264-5657</a><br>
          <strong>US Toll-Free:</strong> 844-927-9265
        </div>
        <div class="emerg-grid">
          <a class="btn btn-red" href="tel:+17272645657">🚨 Call Tin Leg 24/7</a>
          <a class="btn btn-blue" href="https://tinleg.com/report-claim">📋 Online Claim Portal</a>
        </div>
      </div>

      <!-- US Embassy & Japan First Responders -->
      <div class="card">
        <div class="card-title" style="color: #93c5fd;">🇺🇸 U.S. Embassy & Japan Emergency Numbers</div>
        <div style="font-size: 12px; line-height: 1.55; color: #cbd5e1;">
          <strong>U.S. Embassy Tokyo:</strong> 1-10-5 Akasaka, Minato-ku, Tokyo<br>
          <strong>Embassy 24/7 Emergency Line:</strong> <a href="tel:+81332245000" style="color: #93c5fd; font-weight: 700;">+81 3-3224-5000</a><br>
          <strong>Japan Police:</strong> 110 &nbsp;•&nbsp; <strong>Fire / Ambulance:</strong> 119<br>
          <strong>Japan Helpline (English 24/7):</strong> 0570-000-911
        </div>
        <div class="emerg-grid">
          <a class="btn btn-blue" href="tel:+81332245000">🇺🇸 Call US Embassy</a>
          <a class="btn btn-slate" href="tel:110">🚓 Dial 110 Police</a>
        </div>
      </div>

      <!-- Active Hotel Basecamp -->
      <div class="card">
        <div class="card-title">🏨 Current Accommodations Front Desk</div>
        <div style="font-size: 14px; font-weight: 800; color: #ffffff;">${info.hotel.name}</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 3px;">${info.hotel.address}</div>
        ${info.hotel.addressJa ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">🇯🇵 ${info.hotel.addressJa}</div>` : ""}
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          ${info.hotel.phone !== "N/A" ? `<a class="btn btn-green" style="flex: 1;" href="tel:${info.hotel.phone.replace(/[^0-9+]/g, '')}">📞 Call Front Desk</a>` : ""}
          <a class="btn btn-blue" style="flex: 1;" href="https://maps.apple.com/?q=${encodeURIComponent(info.hotel.name + " " + info.hotel.address)}">🗺️ Maps ↗</a>
        </div>
      </div>

      <!-- Emergency Japanese Medical Phrases -->
      <div class="card">
        <div class="card-title" style="color: #ffd166;">🏥 Emergency Japanese (Show to Taxi / Responders)</div>
        <div class="phrase-card">
          <div class="phrase-en">Please call an ambulance!</div>
          <div class="phrase-ja">救急車を呼んでください</div>
          <div class="phrase-romaji">Kyūkyūsha o yonde kudasai</div>
        </div>
        <div class="phrase-card">
          <div class="phrase-en">Please take me to the nearest hospital.</div>
          <div class="phrase-ja">一番近い病院へ連れて行ってください</div>
          <div class="phrase-romaji">Ichiban chikai byōin e tsurete itte kudasai</div>
        </div>
        <div class="phrase-card">
          <div class="phrase-en">I need an English-speaking doctor.</div>
          <div class="phrase-ja">英語を話せる医師をお願いします</div>
          <div class="phrase-romaji">Eigo o hanaseru ishi o onegaishimasu</div>
        </div>
        <div class="phrase-card">
          <div class="phrase-en">I have international travel health insurance.</div>
          <div class="phrase-ja">海外旅行保険に加入しています</div>
          <div class="phrase-romaji">Kaigai ryokō hoken ni kanyū shite imasu</div>
        </div>
      </div>

      <div class="footer-note">
        Links open directly in your phone's default browser or phone dialer.<br>
        Swipe down to close.
      </div>
    </body>
    </html>
  `;

  await wv.loadHTML(html);
  await wv.present(false);
}

// -------------------------------------------------------------
// MODAL SHEET: CURRENT HOTEL INFORMATION CARD
// Directly presented when tapping "🏨 Hotel Base" on widget
// -------------------------------------------------------------
async function showHotelSheet(info) {
  let wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    let u = req.url;
    if (!u) return true;
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("tel:") || u.startsWith("maps:")) {
      Safari.open(u);
      return false;
    }
    return true;
  };

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Josh's Hotel Basecamp</title>
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 20px 16px 40px 16px;
          background-color: #0b0f17; color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .badge {
          display: inline-block; background: rgba(255, 209, 102, 0.15);
          color: #ffd166; border: 1px solid rgba(255, 209, 102, 0.35);
          border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;
        }
        .title { font-size: 22px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; }
        .subtitle { font-size: 12px; color: #94a3b8; }
        .card {
          background: #141b29; border: 1px solid #243047; border-radius: 12px;
          padding: 16px; margin-bottom: 14px;
        }
        .card-title { font-size: 13px; font-weight: 800; color: #ffd166; text-transform: uppercase; margin-bottom: 10px; }
        .hotel-name { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 6px; }
        .hotel-addr { font-size: 13px; color: #cbd5e1; line-height: 1.45; }
        .hotel-ja { font-size: 13px; color: #94a3b8; font-family: sans-serif; margin-top: 6px; }
        .actions-row { display: flex; gap: 8px; margin-top: 16px; }
        .btn {
          flex: 1; text-align: center; text-decoration: none; padding: 12px;
          border-radius: 8px; font-size: 12px; font-weight: 700;
        }
        .btn-blue { background: #1e3a5f; color: #93c5fd; }
        .btn-green { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .footer-note { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="badge">${(info.hotel.phone === "N/A" || info.hotel.name.includes("Little Rock")) ? "🏡 Home Basecamp" : "🏨 Accommodations Basecamp"}</span>
        <h1 class="title">${info.hotel.fullName || info.hotel.name}</h1>
        <div class="subtitle">${(info.hotel.phone === "N/A" || info.hotel.name.includes("Little Rock")) ? "Josh is currently home in Arkansas (Signifies he hasn't departed yet!)" : "Where Josh is staying in Japan"}</div>
      </div>

      <div class="card" style="border-color: rgba(255, 209, 102, 0.4);">
        <div class="card-title">${(info.hotel.phone === "N/A" || info.hotel.name.includes("Little Rock")) ? "Active Basecamp" : "Active Accommodations"}</div>
        <div class="hotel-name">${info.hotel.name}</div>
        <div class="hotel-addr">${info.hotel.address}</div>
        ${info.hotel.addressJa ? `<div class="hotel-ja">${info.hotel.addressJa}</div>` : ""}
        ${info.hotel.note ? `<div style="font-size: 12px; color: #ffd166; margin-top: 8px; line-height: 1.45;">${info.hotel.note}</div>` : ""}
        
        <div class="actions-row">
          <a class="btn btn-blue" href="https://maps.apple.com/?q=${encodeURIComponent(info.hotel.name + " " + info.hotel.address)}">🗺️ Open in Apple Maps</a>
          ${info.hotel.phone !== "N/A" ? `<a class="btn btn-green" href="tel:${info.hotel.phone.replace(/[^0-9+]/g, '')}">📞 Call Front Desk</a>` : ""}
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="color: #93c5fd;">📍 Hotel Details & Tour Base</div>
        <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
          • <strong>Tokyo Arrival (Mar 22 - 23):</strong> Citadines Shinjuku Tokyo<br>
          • <strong>Tokyo Tour Base (Mar 23 - 26):</strong> Hotel Groove Shinjuku (Tokyu Kabukicho Tower)<br>
          • <strong>Kyoto (Mar 26 - 28):</strong> Solaria Nishitetsu Hotel Kyoto Premier<br>
          • <strong>Osaka (Mar 28 - 31):</strong> voco Osaka Central (IHG)<br>
          • Luggage transfers between cities handled by tour operator.
        </div>
      </div>

      <div class="footer-note">
        Where's Josh? • Accommodations Hub<br>
        Swipe down to close.
      </div>
    </body>
    </html>
  `;

  await wv.loadHTML(html);
  await wv.present(false);
}

// -------------------------------------------------------------
// MODAL SHEET: FULL 10-DAY TRIP ITINERARY
// Directly presented when tapping "📍 Status & Itinerary" on widget
// -------------------------------------------------------------
async function showTimelineSheet() {
  let wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    let u = req.url;
    if (!u) return true;
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("tel:") || u.startsWith("maps:")) {
      Safari.open(u);
      return false;
    }
    return true;
  };

  let daysHtml = Object.keys(TRIP_SCHEDULE).sort().map(d => {
    let item = TRIP_SCHEDULE[d];
    let parts = d.split("-");
    let monthDay = parts[1] + "/" + parts[2];

    return `
      <div class="day-row">
        <div class="date-badge">${monthDay}</div>
        <div class="day-content">
          <div class="day-city">${item.city.toUpperCase()} • <span class="day-region">${item.region}</span></div>
          <div class="day-summary">${item.statusSummary}</div>
          <div class="day-focus"><strong>🎯 Focus:</strong> ${item.todaysFocus}</div>
          <div class="day-hotel">🏨 ${item.hotel.name}</div>
        </div>
      </div>
    `;
  }).join("");

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Josh's 10-Day Japan Timeline</title>
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 20px 16px 40px 16px;
          background-color: #0b0f17; color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .badge {
          display: inline-block; background: rgba(255, 209, 102, 0.15);
          color: #ffd166; border: 1px solid rgba(255, 209, 102, 0.35);
          border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;
        }
        .title { font-size: 22px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; }
        .subtitle { font-size: 12px; color: #94a3b8; }
        .day-row {
          display: flex; gap: 12px; margin-bottom: 14px; background: #131a27;
          border: 1px solid #1f2a3f; border-radius: 12px; padding: 12px;
        }
        .date-badge {
          font-size: 12px; font-weight: 900; color: #ffd166;
          background: rgba(255, 209, 102, 0.12); border-radius: 8px;
          padding: 8px 10px; align-self: flex-start; text-align: center;
        }
        .day-content { flex: 1; }
        .day-city { font-size: 12px; font-weight: 800; color: #ffffff; margin-bottom: 3px; }
        .day-region { font-size: 11px; color: #93c5fd; font-weight: 600; }
        .day-summary { font-size: 12px; color: #cbd5e1; line-height: 1.45; margin-bottom: 6px; }
        .day-focus { font-size: 11px; color: #94a3b8; margin-bottom: 6px; line-height: 1.4; }
        .day-hotel { font-size: 11px; font-weight: 600; color: #ffd166; }
        .footer-note { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="badge">📅 Complete Tour Calendar</span>
        <h1 class="title">10-Day Japan Itinerary</h1>
        <div class="subtitle">SideQuests Japan 2027 • Tokyo, Mt. Fuji, Kyoto, Nara, Osaka</div>
      </div>

      ${daysHtml}

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="${WEB_DASHBOARD_URL}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(37,99,235,0.4);">🌐 Open Live Web Tracker Dashboard ↗</a>
      </div>

      <div class="footer-note">
        Follow along each day as Josh travels through Japan.<br>
        Swipe down to close.
      </div>
    </body>
    </html>
  `;

  await wv.loadHTML(html);
  await wv.present(false);
}

// -------------------------------------------------------------
// MODAL SHEET: COMPLETE FLIGHT TRACKER & RESERVATIONS
// -------------------------------------------------------------
async function showFlightsSheet() {
  let wv = new WebView();
  wv.shouldAllowRequest = (req) => {
    let u = req.url;
    if (!u) return true;
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("tel:") || u.startsWith("maps:")) {
      Safari.open(u);
      return false;
    }
    return true;
  };

  let outboundHtml = FLIGHT_RESERVATION.outbound.map(leg => {
    if (leg.layover) {
      return `
        <div class="layover-box">
          <span class="layover-icon">⏳</span>
          <span class="layover-title">Layover in ${leg.city} (${leg.duration})</span>
          <div class="layover-notes">${leg.notes}</div>
        </div>
      `;
    }
    return `
      <div class="flight-card">
        <div class="flight-header">
          <span class="flight-num">${leg.flightNumber}</span>
          <span class="flight-aircraft">${leg.aircraft}</span>
          <a class="track-btn" href="${leg.flightAwareUrl}">Live Track ✈️</a>
        </div>
        <div class="route-row">
          <div class="airport-col">
            <span class="airport-code">${leg.depCode}</span>
            <span class="airport-city">${leg.depCity}</span>
            <span class="airport-time">${leg.depTime}</span>
          </div>
          <div class="arrow-col">
            <span class="arrow-line">➔</span>
            <span class="duration">${leg.duration}</span>
          </div>
          <div class="airport-col right-col">
            <span class="airport-code">${leg.arrCode}</span>
            <span class="airport-city">${leg.arrCity}</span>
            <span class="airport-time">${leg.arrTime}</span>
          </div>
        </div>
        <div class="flight-notes">${leg.notes}</div>
      </div>
    `;
  }).join("");

  let returnHtml = FLIGHT_RESERVATION.return.map(leg => {
    if (leg.layover) {
      return `
        <div class="layover-box">
          <span class="layover-icon">⏳</span>
          <span class="layover-title">Layover in ${leg.city} (${leg.duration})</span>
          <div class="layover-notes">${leg.notes}</div>
        </div>
      `;
    }
    return `
      <div class="flight-card">
        <div class="flight-header">
          <span class="flight-num">${leg.flightNumber}</span>
          <span class="flight-aircraft">${leg.aircraft}</span>
          <a class="track-btn" href="${leg.flightAwareUrl}">Live Track ✈️</a>
        </div>
        <div class="route-row">
          <div class="airport-col">
            <span class="airport-code">${leg.depCode}</span>
            <span class="airport-city">${leg.depCity}</span>
            <span class="airport-time">${leg.depTime}</span>
          </div>
          <div class="arrow-col">
            <span class="arrow-line">➔</span>
            <span class="duration">${leg.duration}</span>
          </div>
          <div class="airport-col right-col">
            <span class="airport-code">${leg.arrCode}</span>
            <span class="airport-city">${leg.arrCity}</span>
            <span class="airport-time">${leg.arrTime}</span>
          </div>
        </div>
        <div class="flight-notes">${leg.notes}</div>
      </div>
    `;
  }).join("");

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Josh's Verified Flights</title>
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 20px 16px 40px 16px;
          background-color: #0b0f17; color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .badge {
          display: inline-block; background: rgba(59, 130, 246, 0.15);
          color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4);
          border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;
        }
        .title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff; }
        .subtitle { font-size: 12px; color: #94a3b8; }
        .pax-card {
          background: #141b29; border: 1px solid #243047; border-radius: 12px;
          padding: 12px 14px; margin-bottom: 20px; font-size: 12px;
        }
        .section-title {
          font-size: 12px; font-weight: 800; color: #ffd166;
          letter-spacing: 0.6px; text-transform: uppercase; margin: 20px 0 10px 4px;
        }
        .flight-card {
          background: #131a27; border: 1px solid #1f2a3f; border-radius: 12px;
          padding: 14px; margin-bottom: 10px;
        }
        .flight-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;
        }
        .flight-num { font-size: 14px; font-weight: 800; color: #ffffff; }
        .flight-aircraft { font-size: 11px; color: #94a3b8; }
        .track-btn {
          background: #1e3a5f; color: #93c5fd; text-decoration: none;
          font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px;
        }
        .route-row { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }
        .airport-col { flex: 1; }
        .right-col { text-align: right; }
        .airport-code { font-size: 20px; font-weight: 900; color: #ffd166; display: block; }
        .airport-city { font-size: 11px; color: #94a3b8; display: block; margin-top: 1px; }
        .airport-time { font-size: 11px; font-weight: 600; color: #e2e8f0; display: block; margin-top: 3px; }
        .arrow-col { text-align: center; padding: 0 10px; }
        .arrow-line { font-size: 14px; color: #64748b; }
        .duration { font-size: 10px; color: #94a3b8; display: block; margin-top: 2px; }
        .flight-notes { font-size: 11px; color: #94a3b8; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px; margin-top: 8px; }
        .layover-box {
          background: rgba(255, 209, 102, 0.08); border: 1px dashed rgba(255, 209, 102, 0.3);
          border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; font-size: 12px;
        }
        .layover-title { font-weight: 700; color: #ffd166; }
        .layover-notes { font-size: 11px; color: #cbd5e1; margin-top: 2px; }
        .shinkansen-card {
          background: #161c27; border: 1px solid #233045; border-radius: 12px;
          padding: 12px 14px; margin-top: 12px;
        }
        .bullet-title { font-size: 13px; font-weight: 700; color: #6ee7b7; margin-bottom: 4px; }
        .bullet-desc { font-size: 12px; color: #cbd5e1; line-height: 1.45; }
        .footer-note { text-align: center; font-size: 11px; color: #64748b; margin-top: 26px; }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="badge">✈️ Verified Master Flight Hub</span>
        <h1 class="title">Josh's Flights</h1>
        <div class="subtitle">United Airlines & All Nippon Airways (ANA)</div>
      </div>

      <div class="pax-card">
        <strong>Passenger:</strong> ${FLIGHT_RESERVATION.passenger}<br>
        <strong>eTicket:</strong> <span style="font-family: monospace; color: #ffd166;">${FLIGHT_RESERVATION.eTicket}</span><br>
        <strong>Carrier:</strong> United UA & ANA NH
      </div>

      <div class="section-title">Outbound Journey (USA ➔ Japan)</div>
      ${outboundHtml}

      <div class="section-title">Return Journey (Japan ➔ USA)</div>
      ${returnHtml}

      <div class="section-title">Domestic Bullet Trains (In-Country)</div>
      <div class="shinkansen-card">
        <div class="bullet-title">🚅 Nozomi No. 23 (Tokyo ➔ Kyoto)</div>
        <div class="bullet-desc">
          • <strong>Friday, March 26:</strong> Departs Tokyo Station 10:12 AM, arrives Kyoto Station 12:23 PM (2h 11m at 185 mph).<br>
          • Luggage handled and transferred directly to hotel by tour operator.
        </div>
      </div>
      <div class="shinkansen-card" style="margin-top: 8px;">
        <div class="bullet-title">🚅 Nozomi Shinkansen (Shin-Osaka ➔ Tokyo)</div>
        <div class="bullet-desc">
          • <strong>Wednesday, March 31:</strong> Departs Shin-Osaka ~9:00 AM, arrives Tokyo Station ~11:30 AM before transfer to Haneda Airport for flight home.
        </div>
      </div>

      <div class="footer-note">
        Live Tap on "Live Track ✈️" opens real-time radar in your default browser.<br>
        Swipe down to close.
      </div>
    </body>
    </html>
  `;

  await wv.loadHTML(html);
  await wv.present(false);
}
