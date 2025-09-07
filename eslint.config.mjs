// @ts-check
import { defineConfig } from 'eslint/config';
import blackcombTypescript from 'eslint-plugin-blackcomb-defaults/typescript';

export default defineConfig(
  ...blackcombTypescript,
  {
    files: [
      '**/*.ts'
    ],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          'samples/tsconfig.json'
        ]
      }
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: [
            'strictCamelCase'
          ],
          filter: {
            regex: '^(_|\\d+)$|OData',
            match: false
          }
        },
        {
          selector: 'typeLike',
          format: [
            'StrictPascalCase'
          ],
          filter: {
            regex: 'OData',
            match: false
          }
        },
        {
          selector: 'objectLiteralProperty',
          format: [
            'strictCamelCase',
            'StrictPascalCase'
          ],
          filter: {
            regex: '^\\d+$',
            match: false
          }
        },
        {
          selector: 'typeParameter',
          format: [
            'PascalCase'
          ]
        }
      ]
    }
  }
);
