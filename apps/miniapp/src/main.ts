import { createSSRApp } from "vue";
import App from "./App.vue";
import FloatingNavigation from "./components/FloatingNavigation.vue";
export function createApp() {
  const app = createSSRApp(App);
  app.component("FloatingNavigation", FloatingNavigation);
  return {
    app,
  };
}
