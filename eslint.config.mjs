import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default Next.js ignores
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },

    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      // Prettier as ESLint errors
      'prettier/prettier': 'error',

      // import hygiene
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': ['error', { count: 1 }],

      // sorted + grouped imports (corporate-style)
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // side effects
            ['^react', '^next', '^vue', '^@?\\w'], // frameworks & packages
            ['^@/', '^src/'], // internal alias imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // parent imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // local/same-folder imports
          ],
        },
      ],

      'simple-import-sort/exports': 'error',
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
])
