# Repsol Benefits Alert - Chrome Extension 🚀⛽

An unofficial, open-source, and privacy-first Google Chrome extension that automatically alerts you about available cashback and discounts across partner brands from the Repsol "Waylet" loyalty program and their Area Cliente.

Instead of trying to memorize the 150+ associated shops, this extension does the heavy lifting for you cleanly and passively.

## 🌟 Key Features

- **Automatic Detection**: Browse the web as usual. Whenever you enter an online store with an available discount (e.g., Amazon, Zalando, Ikea), an elegant banner will drop down to notify you.
- **Google Search Assistant**: Displays shiny badges right next to Google search results. Check where to buy and save *before* deciding where to click!
- **Quick Search tool**: Type "Cecotec" or any brand directly into the extension's popup menu to instantly check the exact cashback percentage.
- **Smart Synchronization**: Silently updates your custom discounts and new promos by securely intercepting (without stealing cookies) the local data in your browser whenever you naturally visit your Repsol Area Cliente.
- **`Mute` Button**: Tired of seeing the alert every single day on your go-to supermarket? Click the `🔕` icon and the extension will permanently remember not to bother you on that specific domain.

## 🛡️ Privacy First

This extension is meticulously designed to protect your data completely:
1. **0% Tracking, 100% Local**: It uses zero external databases and zero analytic servers. The check *"Does this website have a discount?"* happens entirely in the temporary RAM of your computer (in a Vanilla JS Array structure). Nobody tracks your history.
2. **No Tokens Required**: It does not store your email, password, or Bearer session tokens. It cleverly piggybacks on the original WebApp flow to extract the generic benefits straight from your active screen, making it immune to external credential theft.
3. **Minimal Footprint**: Lightweight Glassmorphism UI built with pure native CSS and JS, with absolutely zero heavy dependencies or frameworks (no Vite, no React).

## 📥 Manual Installation (Developer Mode)

Since this extension is not yet published in the Chrome Web Store, you can manually sideload it in 30 seconds:

1. Download this repository's source code (Zip or clone).
2. Open Google Chrome and type in the address bar: `chrome://extensions/`
3. In the top right corner, toggle the **"Developer mode"** switch to ON.
4. In the top left corner, click the **"Load unpacked"** button.
5. Select the folder where you downloaded/extracted this code.
6. The extension is now successfully installed and visible in your toolbar!

## ⚙️ How to Test & Sync

Right out of the box, the extension comes packaged with ~100 hardcoded popular shops so you can test it instantly.
Try visiting websites like `amazon` or searching for "Ikea" and "Adidas shoes" on Google.

To keep the database updated with your personalized benefits:
1. Log into your account on `https://areacliente.repsol.es/` as you normally would.
2. Navigate to the "Compra en Marcas" (Buy in Brands) section, or simply click the `🔄 Sync Benefits` button in the extension menu.
3. The status ring will change from orange ("Default Data") to a bright **Green (Active)** indicator along with the timestamp of the last update (and likely increasing your tracked brands counter!).

## 🛠️ Built With

- **Google Manifest V3**.
- Pure JavaScript (ES6 Modules) - Content Scripts isolated & main worlds.
- DOM & API Interception Methods (Response JSON override).
- CSS "Glassmorphism" Design.
- Google Chrome API (`storage`, `tabs`, Web Accessible Resources).

---

> **Legal Disclaimer:** *This project is an open-source personal creation meant for demonstrative and educational purposes only. It is not related, associated to, sponsored, endorsed by, nor corporately affiliated with Repsol S.A., Waylet, or any mentioned companies. All logos, trademarks, and benefit availability operate strictly according to the original platform policies.*
