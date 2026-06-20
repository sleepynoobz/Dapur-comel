import js            from '@eslint/js'
import globals       from 'globals'
import reactPlugin   from 'eslint-plugin-react'
import reactHooks    from 'eslint-plugin-react-hooks'
import reactRefresh  from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', 'public'] },

  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react:          reactPlugin,
      'react-hooks':  reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType:  'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React
      ...reactPlugin.configs.recommended.rules,
      'react/prop-types':    'off',   // TypeScript handles this; we use JSDoc
      'react/react-in-jsx-scope': 'off', // React 17+ JSX transform

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // React Refresh (HMR)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // No console.log in production code
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // No unused variables
      'no-unused-vars': ['warn', {
        argsIgnorePattern:    '^_',
        varsIgnorePattern:    '^_',
        ignoreRestSiblings:   true,
      }],

      // Consistent imports
      'no-duplicate-imports': 'error',
    },
  },
]
