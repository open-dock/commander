module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'standard-with-typescript',
		'plugin:react/recommended',
		'airbnb',
		'prettier',
	],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: 'tsconfig.json',
	},
	rules: {},
};
