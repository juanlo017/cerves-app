# Cerves App - Deployment & Testing Guide

## 📋 Pre-Deployment Checklist

### 1. Check & Fix RLS Policies in Supabase

Run this in Supabase SQL Editor:

```sql
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Drop all existing policies (fresh start)
DROP POLICY IF EXISTS "Allow anonymous read players" ON players;
DROP POLICY IF EXISTS "Allow anonymous insert players" ON players;
DROP POLICY IF EXISTS "Allow anonymous update players" ON players;
DROP POLICY IF EXISTS "Allow anonymous delete players" ON players;

DROP POLICY IF EXISTS "Allow anonymous read drinks" ON drinks;
DROP POLICY IF EXISTS "Allow anonymous insert drinks" ON drinks;
DROP POLICY IF EXISTS "Allow anonymous update drinks" ON drinks;
DROP POLICY IF EXISTS "Allow anonymous delete drinks" ON drinks;

DROP POLICY IF EXISTS "Allow anonymous read consumptions" ON consumptions;
DROP POLICY IF EXISTS "Allow anonymous insert consumptions" ON consumptions;
DROP POLICY IF EXISTS "Allow anonymous update consumptions" ON consumptions;
DROP POLICY IF EXISTS "Allow anonymous delete consumptions" ON consumptions;

DROP POLICY IF EXISTS "Allow anonymous read groups" ON groups;
DROP POLICY IF EXISTS "Allow anonymous insert groups" ON groups;
DROP POLICY IF EXISTS "Allow anonymous update groups" ON groups;
DROP POLICY IF EXISTS "Allow anonymous delete groups" ON groups;

DROP POLICY IF EXISTS "Allow anonymous read group_members" ON group_members;
DROP POLICY IF EXISTS "Allow anonymous insert group_members" ON group_members;
DROP POLICY IF EXISTS "Allow anonymous update group_members" ON group_members;
DROP POLICY IF EXISTS "Allow anonymous delete group_members" ON group_members;

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for MVP (device-based auth)
-- PLAYERS
CREATE POLICY "Allow all operations on players"
ON players FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- DRINKS
CREATE POLICY "Allow read drinks"
ON drinks FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert drinks"
ON drinks FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update drinks"
ON drinks FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- CONSUMPTIONS
CREATE POLICY "Allow all operations on consumptions"
ON consumptions FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- GROUPS
CREATE POLICY "Allow all operations on groups"
ON groups FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- GROUP_MEMBERS
CREATE POLICY "Allow all operations on group_members"
ON group_members FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verify policies are created
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';
```

**Note:** These are permissive policies for MVP testing. Later you can restrict based on `user_id`.

### 2. Verify Environment Variables

Check your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://yrxssbhrpdcgtzhufooc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ IMPORTANT:** Use `ANON` key, NOT `service_role` key!

### 3. Update app.json

```json
{
  "expo": {
    "name": "Cerves",
    "slug": "cerves-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "cerves",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1A2E"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.juanlo.cerves"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1A1A2E"
      },
      "package": "com.juanlo.cerves"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Replace:**
- `com.yourname.cerves` with your actual bundle ID (e.g., `com.juanlo.cerves`)

---

## 🚀 Build Process

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials.

### Step 3: Configure EAS Build

```bash
eas build:configure
```

This creates `eas.json`. It should look like this:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 4: Build for Testing

**Option A: iOS Only (TestFlight Preview)**

```bash
eas build --platform ios --profile preview
```

**Option B: Android Only (APK)**

```bash
eas build --platform android --profile preview
```

**Option C: Both Platforms**

```bash
eas build --platform all --profile preview
```

**Build process takes 10-20 minutes.** You'll get a download link when done.

---

## 📲 Distribution Options

### Option 1: Internal Distribution (Easiest for MVP)

After build completes, EAS gives you a download link.

**iOS:**
1. Share link with friends
2. They open link on iPhone
3. Install profile and trust developer
4. **Note:** Friends need to be added to your Apple Developer team OR you need Ad-Hoc provisioning

**Android:**
1. Share APK link with friends
2. They download APK
3. Enable "Install from unknown sources" in settings
4. Install APK
5. ✅ Works immediately, no developer account needed

### Option 2: TestFlight (iOS)

```bash
eas submit --platform ios
```

Then invite testers via App Store Connect → TestFlight.

**Requirements:**
- Apple Developer account ($99/year)
- Up to 10,000 testers
- More professional distribution

### Option 3: Google Play Internal Testing (Android)

```bash
eas submit --platform android
```

Then invite testers via Google Play Console → Internal Testing.

**Requirements:**
- Google Play Developer account ($25 one-time)
- Up to 100 testers
- More professional distribution

---

## 🧪 Local Testing (Before Building)

Test the app locally first:

```bash
# Start development server
npx expo start

# Test on physical device (recommended)
# Scan QR code with Expo Go app (iOS/Android)

# Or run on simulator
npx expo start --ios
npx expo start --android
```

**Test checklist:**
- ✅ Onboarding flow works
- ✅ Can add drinks
- ✅ Weekly dashboard shows data
- ✅ Calendar displays consumption
- ✅ Rankings show correctly
- ✅ Navigation between tabs works
- ✅ Data persists after app restart

---

## 📝 Sharing with Friends

### Quick Distribution (No Developer Accounts)

1. Build Android APK: `eas build --platform android --profile preview`
2. Wait for build to complete (~15 min)
3. Copy the download link from EAS
4. Share link via WhatsApp/Telegram
5. Friends download and install

**Friends' steps (Android):**
1. Open link on phone
2. Download APK
3. Settings → Security → Enable "Install from unknown sources"
4. Open downloaded file
5. Install
6. Open app and start using!

### For iOS (Requires Apple Developer Account)

1. Build iOS: `eas build --platform ios --profile preview`
2. Add friends' device UDIDs to provisioning profile
3. Rebuild with their devices included
4. Share download link
5. They install profile and trust

**OR use TestFlight (easier but requires $99 Apple Developer account)**

---

## 🐛 Common Issues & Solutions

### Issue: "Network request failed"
**Solution:** Check Supabase URL and anon key in `.env`

### Issue: "Row-level security policy violation"
**Solution:** Run the RLS policy SQL script again

### Issue: Build fails on iOS
**Solution:** 
- Make sure bundle identifier is unique
- Check Apple Developer account is set up

### Issue: Build fails on Android
**Solution:**
- Make sure package name is unique
- Try running `eas build:configure` again

### Issue: App crashes on open
**Solution:**
- Check Supabase connection
- Verify RLS policies are set
- Check console logs: `npx expo start` and look for errors

---

## 🔄 Updating the App

When you make changes:

```bash
# Increment version in app.json
# "version": "1.0.1"

# Build new version
eas build --platform all --profile preview

# Share new download link with testers
```

---

## 💡 Tips for MVP Testing

1. **Start with Android** - easier distribution, no Apple Developer account needed
2. **Test with 3-5 friends first** - get feedback before wider release
3. **Create a WhatsApp/Telegram group** - easy way to share updates and get feedback
4. **Monitor Supabase dashboard** - check if data is being created correctly
5. **Ask friends to test**:
   - Adding different types of drinks
   - Checking weekly/monthly views
   - Looking at rankings
   - Reporting any crashes or bugs

---

## 📊 Monitoring (Post-Launch)

- **Supabase Dashboard**: Check table data, monitor queries
- **EAS Dashboard**: Track crashes and build status
- **Friend Feedback**: Keep notes on feature requests and bugs

---

## 🎯 Next Steps After MVP Testing

1. Gather feedback from friends
2. Fix critical bugs
3. Add requested features
4. Improve UI/UX based on usage
5. Consider proper authentication (if needed)
6. Publish to App Store / Play Store

---

## 📞 Support

If you run into issues:

1. Check Expo documentation: https://docs.expo.dev
2. Check Supabase docs: https://supabase.com/docs
3. Search for error messages
4. Ask in Expo Discord or forums

---

## Quick Reference Commands

```bash
# Local testing
npx expo start

# Build preview (internal testing)
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Submit to stores (production)
eas submit --platform android
eas submit --platform ios

# Check build status
eas build:list

# View project info
eas project:info
```

---

**Good luck with your MVP! 🍺🎉**
