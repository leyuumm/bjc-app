
  # BJC Mobile App Design

  This is a code bundle for BJC Mobile App Design. The original project is available at https://www.figma.com/design/Fwf126pdYaQ1748bPV8x0f/BJC-Mobile-App-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## 📱 Mobile Testing

  ### Browser Testing (WiFi)

  Test the app on your phone's browser over the same WiFi network:

  1. Find your PC's local IP address:
     ```
     ipconfig
     ```
     Look for the **IPv4 Address** under your WiFi adapter (e.g. `192.168.1.100`).

  2. Start the dev server exposed to the network:
     ```
     npm run dev:mobile
     ```

  3. On your phone, open a browser and go to:
     ```
     http://<YOUR_IP>:5173
     ```
     For example: `http://192.168.1.100:5173`

  ### APK via Capacitor

  The project already has Capacitor Android set up. To build and run on a physical device:

  0. Run Android environment/device diagnostics:
     ```
     npm run android:doctor
     ```

  1. Build the web app and sync with Android:
     ```
     npm run build
     npx cap sync android
     ```

  2. Open the Android project in Android Studio:
     ```
     npx cap open android
     ```

  3. Enable **USB Debugging** on your Android phone:
     - Go to **Settings → About Phone**
     - Tap **Build Number** 7 times to enable Developer Options
     - Go to **Settings → Developer Options**
     - Enable **USB Debugging**

  4. Connect your phone via USB, then click **Run** in Android Studio to install and launch the app.

  5. Or run directly from CLI:
     ```
     npm run android:run
     ```

  If your device appears as **unauthorized**, unlock the phone and accept the **Allow USB debugging** prompt. You can force the prompt to reappear by using **Revoke USB debugging authorizations** in Developer Options and reconnecting USB.
  