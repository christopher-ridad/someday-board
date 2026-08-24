// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // These are React Compiler readiness rules. This project doesn't enable
    // the compiler (app.json sets reactCompiler: false) because Reanimated's
    // shared-value mutation (`sv.value = x`), which the board's drag/pull
    // animations depend on throughout, is a pattern the compiler's static
    // analysis doesn't understand and flags as an illegal mutation.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
