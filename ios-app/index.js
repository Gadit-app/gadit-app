import { registerRootComponent } from "expo";
import App from "./App";

// The app has a single App.tsx root (a WebView shell), not expo-router, so we
// register it explicitly. `main` in package.json points here.
registerRootComponent(App);
