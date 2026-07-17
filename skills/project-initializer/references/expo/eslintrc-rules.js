module.exports = {
  plugins: ['react', 'react-native', 'i18next'],
  rules: {
    // Prefer localization wrappers instead of hardcoded texts in JSX
    'react/jsx-no-literals': [
      'error',
      {
        noStrings: true,
        noPropertyAccessFromIndexSignature: false,
      },
    ],
    // Avoid raw text directly inside React Native <Text> component
    'react-native/no-raw-text': 'error',
    // Keep translation keys centralized and traceable
    'i18next/no-literal-string': [
      'warn',
      {
        markupOnly: true,
        ignoreAttribute: [],
        ignoreProps: ['testID', 'accessible'],
        ignorePropertyNames: ['value'],
      },
    ],
  },
};
