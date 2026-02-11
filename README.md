# cerves-app
App de logeo de cervecitas para borrachillos 🍺

App multiplataforma (iOS / Android / Web) hecha con **Expo (React Native)** + **Supabase (Postgres + Realtime)**.


- Login: **invisible (Supabase anonymous auth)**
- Datos compartidos: **grupos (eventos) + scoreboard global**
- Estilo: arcade / pixel

---

## 🧭 Roadmap

### **Phase 1 — Core Features 🍺**
The “it actually works” phase.

#### ✅ Add Drink Logging
- Screen to select a drink  
- Button to log consumption  
- Quick add from drink catalog  

#### 📌 Personal Dashboard
- Current week’s drinks count  
- Stats (liters, calories, € spent)  
- Recent consumption history  

#### 🏆 Leaderboards
- Event leaderboard  
- Compare stats with friends  
- Achievements / badges  

#### 🗓️ Calendar View
- Show consumption by day  
- Monthly overview  
- Tap a day to see details 

----
### **RELEASE 1 🚀 **
----

### **Phase 2 — Tracking & History 📊**
The “now we’re getting serious” phase.

#### 📈 Statistics Screen
- Charts / graphs  
- Weekly/monthly trends  
- Favorite drinks  

#### 📈 Daily Resume Screen in Personal Dashboard
- Charts / graphs  
- Weekly/monthly trends  
- Favorite drinks
---

### **Phase 3 — Social Features 👥**
The “bad influence” phase.

#### 👥 Groups / Events
- Create event with code  
- Join event by code  
- Track drinks during event  

---

### **Phase 4 — Polish ✨**
The “make it feel like a real app” phase.

#### ⚙️ Settings
- Edit profile  
- Change avatar  
- Reset data  
- Dark mode  

#### 🔔 Notifications
- Daily reminders  
- Health warnings  
- Event invites  

#### 📚 Drink Catalog Management
- Display available drinks by category  
- Filter/search drinks  

---

## 🚀 Future Ideas (Optional)
- Drink limits & smart alerts  
- BAC estimation (optional + configurable)  
- Export to CSV / PDF  
- Widgets (iOS/Android)  

---


## 1) Requisitos para compilar


- Node.js **LTS** (18 o 20)
- npm


Comprobar:


```bash
node -v
npm -v
```


---


## 2) Crear el proyecto Expo


Template con tabs:


```bash
npx create-expo-app@latest cerves-app --template tabs
cd beer-arcade
```


---`

## 3) Arrancar en local


```bash
npx expo start
```


---


## 4) Instalar dependencias de Supabase


```bash
npm i @supabase/supabase-js
npx expo install react-native-url-polyfill
```

## 5) Comandos clave (para no olvidarlos)


### Crear proyecto


```bash
npx create-expo-app@latest beer-arcade --template tabs
cd beer-arcade
```


### Arrancar (dev)


```bash
npx expo start
```


### Instalar Supabase


```bash
npm i @supabase/supabase-js
npx expo install react-native-url-polyfill
```

---

## 6) 🚀 Production Builds & Deployment


### Instalar EAS CLI


```bash
npm install -g eas-cli
eas login
```


### 🎯 Quick Commands Summary

**Build all platforms:**

```bash
# Android (APK para compartir con amigos)
npm run build:android

# iOS (para TestFlight)
npm run build:ios

# Web (exportar estáticos)
npm run build:web
```

**Deploy web to Vercel:**

```bash
npm install -g vercel
vercel --prod
```

---

### 📱 Android (APK instalable - sin Play Store)

```bash
npm run build:android
# o: eas build --platform android --profile production-internal
```

- Descarga el APK del link que te da EAS
- Compártelo directamente con tus amigos
- Ellos lo instalan sin necesidad de Play Store
- **No requiere servidor de desarrollo activo**


### 🍎 iOS (TestFlight - requiere Apple Developer $99/año)

```bash
npm run build:ios
# Espera a que termine, luego:
eas submit --platform ios
```

- Invita a tus amigos vía TestFlight app
- **No requiere servidor de desarrollo activo**


### 🌐 Web (Vercel)

**Deploy rápido:**

```bash
npm run build:web
npm install -g vercel
vercel --prod
```

**O conectar a Git para auto-deploy:**

1. Haz push a GitHub
2. Ve a [vercel.com](https://vercel.com) → New Project
3. Importa tu repositorio
4. Vercel detectará la config de `vercel.json` automáticamente
5. ¡Deploy! Tu app estará en `yourapp.vercel.app`

---

## 7) Subida a stores (cuando toque)


### Android (Google Play)


```bash
eas submit -p android
```


### iOS (App Store / TestFlight)


```bash
eas submit -p ios
```


---


## 8) Actualizaciones sin reinstalar (EAS Update)


> Requiere que ya tengas builds (dev/preview/production) creadas con EAS.


```bash
eas update --branch preview --message "fix: scoreboard refresh"
```


---