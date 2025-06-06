
# Guide: Packaging Your Next.js "Simple Calc" App for Android with Capacitor

This guide will walk you through the steps to convert your Next.js web application into a native Android app using Capacitor. This allows your app to be installed on Android devices and run offline.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Node.js and npm/yarn**: For managing your Next.js project and Capacitor CLI.
    *   [Node.js download](https://nodejs.org/)
2.  **Android Studio**: The official IDE for Android app development.
    *   [Android Studio download](https://developer.android.com/studio)
3.  **Java Development Kit (JDK)**: Required by Android Studio. Android Studio usually prompts for installation or manages its own JDK.
4.  **Your "Simple Calc" Next.js Project**: The one we've been working on.

## Step 1: Prepare Your Next.js Application

1.  **Static Export Configuration**:
    Your `next.config.ts` has already been configured to include `output: 'export'`. This is **crucial** because it tells Next.js to build your application into a set of static HTML, CSS, and JavaScript files that Capacitor can bundle.
    Also, `images.unoptimized = true` was added to `next.config.ts`. This is necessary because the default `next/image` optimization requires a Node.js server environment, which isn't available in a purely static export used by Capacitor for offline apps.

2.  **Build Your Next.js App for Static Export**:
    Open your terminal in the root directory of your "Simple Calc" project and run the build command:
    ```bash
    npm run build
    ```
    Or if you use yarn:
    ```bash
    yarn build
    ```
    This command will generate a static version of your app in an `out` folder in your project's root directory. This `out` folder is what Capacitor will use. **Always run this build step after making changes to your Next.js web code and before syncing with Capacitor.**

## Step 2: Install Capacitor

1.  **Install Capacitor CLI (Locally Recommended)**:
    It's highly recommended to install the Capacitor CLI as a dev dependency in your project. This ensures version consistency across your development environment and CI/CD.
    ```bash
    npm install --save-dev @capacitor/cli
    ```
    Or with yarn:
    ```bash
    yarn add --dev @capacitor/cli
    ```
    If installed locally (as recommended), you will always prefix Capacitor commands with `npx` (e.g., `npx cap ...`).

2.  **Install Capacitor Core and Android Platform Libraries**:
    In your Next.js project's root directory, run:
    ```bash
    npm install @capacitor/core @capacitor/android
    ```
    Or with yarn:
    ```bash
    yarn add @capacitor/core @capacitor/android
    ```

## Step 3: Initialize Capacitor in Your Project

1.  **Run the `init` command**:
    In your Next.js project's root directory, execute:
    ```bash
    npx cap init
    ```
    Capacitor will ask you for:
    *   **App Name**: Enter something like `Simple Calc`.
    *   **App ID**: This is your unique package name (e.g., `com.yourdomain.yourapp`). Example: `com.simplecalc.app`. This ID must be unique if you plan to publish to the Google Play Store.

2.  **Configure `capacitor.config.ts` (or `capacitor.config.json`)**:
    Capacitor will create a `capacitor.config.ts` (or `.json`) file. Open it and **ensure the `webDir` property points to the output directory of your static Next.js build, which is `out`**.

    Example for `capacitor.config.ts`:
    ```typescript
    import type { CapacitorConfig } from '@capacitor/cli';

    const config: CapacitorConfig = {
      appId: 'com.simplecalc.app', // Or your chosen App ID
      appName: 'Simple Calc',     // Or your chosen App Name
      webDir: 'out',             // Important: points to Next.js static export folder
      server: {
        androidScheme: 'https',    // Use 'https' for better compatibility with modern Web APIs.
                                   // 'http' can also work but 'https' is generally preferred for WebViews.
      }
    };

    export default config;
    ```

    Example for `capacitor.config.json`:
    ```json
    {
      "appId": "com.simplecalc.app",
      "appName": "Simple Calc",
      "webDir": "out",
      "server": {
        "androidScheme": "https"
      }
    }
    ```
    **Note on `androidScheme`**: For purely offline apps where you don't intend to load external HTTPS resources directly within the main WebView content (other than through Capacitor plugins that handle their own networking), `http` might seem acceptable. However, `https` is generally preferred as it aligns better with modern web security practices and some Web APIs might behave differently or have restrictions under an `http` scheme. For a fully bundled offline app, the scheme choice mainly affects how local resources are addressed by the WebView.

## Step 4: Add the Android Platform

1.  **Execute the `add` command**:
    ```bash
    npx cap add android
    ```
    This command creates an `android` folder in your project. This folder contains a native Android project that wraps your web app.

## Step 5: Sync Your Web App with the Native Project

1.  **Build Your Next.js App (Crucial!)**:
    **If you've made any changes to your Next.js code (in `src`, `components`, etc.), you MUST rebuild your Next.js app first.** Ensure your `out` folder is up-to-date:
    ```bash
    npm run build
    ```

2.  **Run the `sync` command**:
    This command copies your web assets from the `out` folder into the native Android project.
    ```bash
    npx cap sync android
    ```
    You should run `npx cap sync android` after every Next.js web build if you've made changes to your Next.js code.

## Step 6: Open and Run in Android Studio

1.  **Open the Android project in Android Studio**:
    ```bash
    npx cap open android
    ```
    This will launch Android Studio and open the `android` subfolder of your project.

2.  **Android Studio Setup**:
    *   Android Studio might take some time to sync Gradle files and download any necessary SDK components when you first open the project.
    *   **`minSdkVersion`**: You might want to adjust the `minSdkVersion` in the `android/app/build.gradle` file. Capacitor defaults to a reasonable version, but you can change it if needed (e.g., to support older Android versions, though this can limit features).
    *   **Internet Permissions**: If your app (or any future features like fetching live currency rates, Firebase Analytics) needs internet access, ensure your `android/app/src/main/AndroidManifest.xml` has the internet permission: `<uses-permission android:name="android.permission.INTERNET" />`. Capacitor usually includes this by default. For your current app, which is designed to be mostly offline, this is still good to have for features like Firebase Analytics.

3.  **Run the App**:
    *   Select an Android emulator or connect a physical Android device (ensure USB debugging is enabled).
    *   Click the "Run" button (green play icon) in Android Studio.
    *   Your "Simple Calc" app should launch on the emulator/device!

## Step 7: Firebase Analytics (Native Android Part - Optional but Recommended for Native Insights)

While your `ClientProviders.tsx` sets up Firebase JS SDK for web analytics (which will work within the WebView when the app is online), for more robust analytics and crash reporting specifically within the native Android shell (especially for issues related to the native wrapper itself), you can add the native Firebase Android SDKs.

1.  **Add Firebase to your Android app in the Firebase Console**:
    *   Go to your Firebase project settings in the Firebase console.
    *   Click "Add app" and select the Android icon.
    *   Enter your **Android package name** (e.g., `com.simplecalc.app` - the one you set in `capacitor.config.ts`).
    *   You can provide an "App nickname" (e.g., "Simple Calc Android").
    *   Firebase will ask for a **Debug signing certificate SHA-1 hash**. You can get this from Android Studio:
        *   Open your Android project (`android` folder) in Android Studio.
        *   Click on "Gradle" on the right-hand side of the IDE.
        *   Navigate to `YourAppName > app > Tasks > android > signingReport`. Double-click `signingReport`.
        *   The SHA-1 key will be displayed in the "Run" window (usually for the `debug` variant).
    *   Register the app.
2.  **Download `google-services.json`**: Firebase will provide this file. Place it in the `android/app/` directory (Capacitor's Android project app directory).
3.  **Add Firebase SDKs to `build.gradle` files**: Follow the instructions in the Firebase console to add the Firebase Bill of Materials (BOM) and necessary dependencies (like `firebase-analytics-ktx`) to your `android/build.gradle` (project-level) and `android/app/build.gradle` (app-level) files.
4.  Re-sync Gradle in Android Studio (usually a prompt appears, or File > Sync Project with Gradle Files).

This native Firebase setup complements the web-based analytics for a more complete picture if your app has both web and native interactions.

## Step 8: Building for Release (APK / Android App Bundle)

When you're ready to distribute your app:

1.  In Android Studio, go to `Build > Generate Signed Bundle / APK...`.
2.  Choose "Android App Bundle" (.aab) for uploading to the Google Play Store (recommended), or "APK" for direct installs/testing.
3.  Follow the prompts to create a new keystore (if you don't have one) and sign your app. This keystore is vital, so keep it safe and backed up.

## Final Checks for Offline Functionality

Your "Simple Calc" app has been configured for offline functionality:

*   **Static Export (`output: 'export'`)**: Your `next.config.ts` ensures Next.js builds static assets, ideal for bundling.
*   **Genkit Flows (Math Quiz & Currency Converter)**:
    *   The Math Quiz currently uses a static list of questions (`math-quiz-questions.ts`) and does not call an external AI service.
    *   The Currency Converter uses mock exchange rates defined locally (`currency-converter-flow.ts`) and does not call an external API.
    *   This means these Genkit-related features will work offline. If you later enable live AI for the quiz or live rates for the currency converter, those specific parts would then require internet access.
*   **Core Calculator Logic**: All standard calculator functions, utility tools, and games are client-side JavaScript and are bundled into the app by Capacitor.
*   **Firebase Analytics**: The JavaScript SDK will attempt to send data when online. If offline, it generally queues events.

With these configurations, the core features of your app will be available completely offline once installed on an Android device via Capacitor.

## Customizing Icons and Splash Screen (Optional)

Capacitor uses default icons and splash screens. You can customize them:

*   **Manually**: Replace the image files in `android/app/src/main/res/drawable-*` (for icons) and configure the splash screen elements (e.g., background color, image) in `android/app/src/main/res/values/styles.xml` or similar.
*   **Tools**: Tools like `cordova-res` or the Capacitor Assets CLI (`@capacitor/assets`) can help generate these assets from a single source image.
    *   Example with `@capacitor/assets` (recommended):
        1.  `npm install --save-dev @capacitor/assets`
        2.  Create source images (e.g., `assets/icon.png` and `assets/splash.png`).
        3.  `npx capacitor-assets generate --android`

## Updating Your App

1.  Make changes to your Next.js code (in `src`, `components`, etc.).
2.  **Crucial**: Build your Next.js app: `npm run build`.
3.  Sync with Capacitor: `npx cap sync android`.
4.  Re-build and run from Android Studio. If you only changed web assets, sometimes just re-running the app from Android Studio is enough after a sync, but a full rebuild is safer.

This guide provides a solid path to getting your "Simple Calc" Next.js app running as a native-like Android application with offline capabilities. Good luck!
