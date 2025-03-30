import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  // Base JS config
  js.configs.recommended,
  
  // Next.js config
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
    ],
  }),
  
  // TypeScript config
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-sort-props': ['warn', {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true,
      }],
      
      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
    },
  },
  
  // Special rules for server components
  {
    files: ['app/**/*.tsx', 'app/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off', // Disable hooks rules for server components
    },
  },
  
  // Special rules for client components
  {
    files: ['app/**/*client*.tsx', 'app/**/*client*.ts', 'components/**/*.tsx', 'components/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'error', // Enable hooks rules for client components
    },
  },
  
  // Ignore build artifacts and dependencies
  {
    files: ['node_modules/**/*', '.next/**/*', 'out/**/*', 'public/**/*', 'build/**/*', 'dist/**/*', 'coverage/**/*'],
    rules: {
      '*': 'off',
    },
  },
]