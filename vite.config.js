import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Il plugin React abilita la trasformazione corretta di JSX durante sviluppo e build.
export default defineConfig({
  plugins: [react()],
});
