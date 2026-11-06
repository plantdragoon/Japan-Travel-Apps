# Japan Travel Apps 🇯🇵 • Concierge & Family Tracker

Two synchronized travel apps for Josh's 2027 Japan Adventure (Tokyo, Mt. Fuji, Kyoto, Nara, Osaka).

---

## 📱 The 2 Apps in this Repository

### 1. 🧰 Personal Concierge Widget (`JapanConciergeWidget.js`)
*For Josh's personal iPhone:*
- **Interactive Taxi Flashcards**: Japanese addresses & large driver flashcards for Tokyo, Kyoto, Osaka hotels and attractions.
- **Live Interactive Yen Calculator**: Instant USD ⇄ JPY currency conversions with live exchange rates.
- **Packing & Gear Checklist**: Verified gear and packing list.
- **Action Milestones**: Payment reminders, SmartEX bullet train booking windows, and airline check-in dates.
- **Contextual Phrases**: Essential Japanese travel phrases.
- **Deep Browser Routing**: Configured to open web links directly in Brave or Safari.

### 2. 🎒 Where's Josh? Family Tracker (`JapanFamilyTrackerWidget.js` & `index.html`)
*For friends and family (100% safe, zero private document links):*
- **iOS Home Screen Widget (`JapanFamilyTrackerWidget.js`)**: Real-time status, retro 8-bit Pixel Josh activity sprite (preparing, sleeping, morning, questing, dining, flying), dual clocks (JST vs Home), hotel basecamps, live flight radar (FlightAware), and 24/7 Tin Leg travel insurance & US Embassy emergency hub.
- **Standalone Web App (`index.html`)**: Interactive companion web tracker that family and friends can open in any browser (iPhone, Android, PC, Mac) without installing Scriptable.
  - **Live Web App**: [https://plantdragoon.github.io/Japan-Travel-Apps/](https://plantdragoon.github.io/Japan-Travel-Apps/)

---

## ⚡ Auto-Updating Setup for iOS Scriptable

Never copy and paste long scripts again! Paste these short loaders into Scriptable once. They automatically fetch the latest code from GitHub and cache it locally for offline use.

### A. Personal Concierge Loader
Create a new script in Scriptable named **`JapanConcierge`**:
```javascript
// Japan Travel Concierge • Auto-Loader
const URL = "https://raw.githubusercontent.com/plantdragoon/Japan-Travel-Apps/main/JapanConciergeWidget.js";
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "JapanConciergeCache.js");

let code = "";
try {
  let req = new Request(URL);
  req.timeoutInterval = 6;
  code = await req.loadString();
  if (code && code.includes("makeWidget")) fm.writeString(cache, code);
} catch (e) {}

if (!code && fm.fileExists(cache)) code = fm.readString(cache);
if (code) {
  const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
  await new AsyncFn(code)();
}
```

### B. Family Tracker Loader
Create a new script in Scriptable named **`WheresJosh`**:
```javascript
// Where's Josh? 🇯🇵 • Auto-Loader
const URL = "https://raw.githubusercontent.com/plantdragoon/Japan-Travel-Apps/main/JapanFamilyTrackerWidget.js";
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "JapanTrackerCache.js");

let code = "";
try {
  let req = new Request(URL);
  req.timeoutInterval = 6;
  code = await req.loadString();
  if (code && code.includes("makeWidget")) fm.writeString(cache, code);
} catch (e) {}

if (!code && fm.fileExists(cache)) code = fm.readString(cache);
if (code) {
  const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
  await new AsyncFn(code)();
}
```
