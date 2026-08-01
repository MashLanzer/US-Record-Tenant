// Adds the deep-link intent-filter (scheme "tenanttrust") to the generated
// Android project so OAuth (Google) can redirect back into the native app.
// Run in CI after `npx cap add android`.
import fs from "node:fs";

const path = "android/app/src/main/AndroidManifest.xml";
let manifest = fs.readFileSync(path, "utf8");

if (manifest.includes('android:scheme="tenanttrust"')) {
  console.log("Deep-link scheme already present — skipping.");
} else {
  const filter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="tenanttrust" />
            </intent-filter>`;
  // Insert before the close of the (only) MainActivity element.
  manifest = manifest.replace("</activity>", `${filter}\n        </activity>`);
  fs.writeFileSync(path, manifest);
  console.log('✓ Added deep-link scheme "tenanttrust" to AndroidManifest.xml');
}
