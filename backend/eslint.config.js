// eslint.config.js (Archivo para ESLint v9+)

import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin"; // Plugin principal
import tseslintParser from "@typescript-eslint/parser"; // Parser para TypeScript

export default [
  {
    // 1. Configuración de archivos TypeScript
    files: ["src/**/*.ts"],
    
    // Configuración del parser y ambiente
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        // ESLint necesita este path para resolver los tipos
        project: ["./tsconfig.json"],
        // Esto le dice a Node dónde encontrar el tsconfig
        tsconfigRootDir: process.cwd(), 
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    
    // 2. Reglas y Plugins
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      // Reglas de calidad:
      // Añade las reglas recomendadas por TypeScript (como la comprobación de tipos)
      ...tseslint.configs.recommended.rules, 
      
      // Reglas comunes para Node.js
      "no-console": "warn", // Advertencia por el uso de console.log
      "prefer-const": "error", // Forzar el uso de const donde sea posible
      
      // Reglas específicas para tu proyecto
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // Evita variables no utilizadas
    }
  },
  {
    // 3. Ignorar archivos compilados y dependencias
    ignores: [
      "dist/", 
      "node_modules/", 
      "package-lock.json"
    ]
  }
];