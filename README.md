# cerves-app
App de logeo de cervecitas para borrachillos 🍺

App multiplataforma (iOS / Android / Web) hecha con **Expo (React Native)** + **Supabase (Postgres + Realtime)**.


- Login: **invisible (Supabase anonymous auth)**
- Datos compartidos: **grupos (eventos) + scoreboard global**
- Estilo: arcade / pixel


---


## 1) Requisitos


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
npx create-expo-app@latest beer-arcade --template tabs
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

## 6) Builds (APK / IPA) con EAS


### Instalar EAS


```bash
npm install -g eas-cli
eas login
eas build:configure
```


### Android (APK instalable para amigos)


```bash
eas build -p android --profile preview
```


### Android (AAB para Play Store)


```bash
eas build -p android --profile production
```


### iOS (IPA para TestFlight)


```bash
eas build -p ios --profile preview
```


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