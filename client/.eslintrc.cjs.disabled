module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/react',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'react',
        'react-hooks',
        'jsx-a11y',
        'import',
    ],
    rules: {
        // General ESLint rules
        'no-unused-vars': 'error',
        'no-console': 'off',
        'eqeqeq': 'error',
        'curly': 'error',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],

        // React-specific rules
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off', // Not needed with React 17+

        // Import rules
        'import/order': ['warn', {
            'groups': ['builtin', 'external', 'internal'],
            'newlines-between': 'always',
        }],
        'import/no-unresolved': 'error',
        'import/no-extraneous-dependencies': ['error', {
            'devDependencies': [
                'src/**/__tests__/**', // Adjust based on your tests location
                'src/**/?(*.)+(spec|test).js',
            ],
        }],

        // Accessibility rules
        'jsx-a11y/anchor-is-valid': 'off', // Adjust based on project requirements
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
