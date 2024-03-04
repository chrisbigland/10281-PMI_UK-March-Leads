const { argv } = require('yargs');
const env = argv.env || 'local';
const publicPath = `email-build`;

const config = {
	base: publicPath,
	source: `dist/**/*.html`,

	inlineCss: {
		enabled: false,

		applyStyleTags: true,
		insertPreservedExtraCss: true,
		webResources: {
			relativeTo: publicPath,
			images: false
		}
	},

	optimize: {
		enabled: true,

		"whitelist": [
			// Outlook web
			'.x_*',

			// Outlook.com and Office 365 - potentially deprecated
			'.owaContextualHighlight',

			// Outlook sup resize
			'.footnote',

			// custom Outlook Windows classes
			'.outlook-*',
			'.*-outlook',

			// Samsung specific classes
			'.samsung-*',

			// All IDs
			'#*',
		],

		"htmlCrushOpts": {
			"removeLineBreaks": true,
			"removeIndentations": true,
			"removeHTMLComments": false,
			"lineLengthLimit": 500
		},
	},


	beautify: {
		enabled: false,

		indent_size: 2,
		indent_with_tabs: true,
		indent_empty_lines: false,

		css: {
			indent_size: 2,
			preserve_newlines: true,
		}
	}
};


module.exports = {
  config,
};