# Android Build Instructions

The Android project is set up and configured.

## Automated Build (Recommended)

You can build the APK directly from the terminal if you have the Android SDK and a compatible Java JDK (JDK 17 or 21) installed.

We found a compatible JDK at: `C:\Program Files\Android\Android Studio\jbr`

To build the APK manually:

1. Open a terminal in the `android` folder.
2. Run the build command:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; .\gradlew assembleDebug
   ```
3. The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Using Android Studio

1. Open Android Studio.
2. Select "Open an existing Android Studio project".
3. Navigate to the `android` folder in this project and open it.
4. Wait for Gradle sync to complete.
5. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
6. The APK will be generated and you can locate it in the `build/outputs/apk/debug` folder.

## Deployment

To make the APK available for download on your website:

1. Copy the generated `app-debug.apk` to `client/public/rupee-tracker.apk`.
2. Redeploy your web application.
