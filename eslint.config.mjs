import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Config ESLint flat native (format attendu par ESLint 9 + eslint-config-next 16).
 * L'ancienne version passait par FlatCompat / @eslint/eslintrc et plantait
 * avec « Converting circular structure to JSON ».
 */
const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "payments/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
