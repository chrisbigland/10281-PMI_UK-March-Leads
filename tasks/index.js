const mix = require('laravel-mix');
const File = require('laravel-mix/src/File')
const glob = require('glob');
const juice = require("juice");
const { html: beautifyHTML } = require('js-beautify');
const { argv } = require('yargs');
const { config } = require('./config');

const {
	enabled = true,
	source = 'dist/**/*.html',
	base,
	inlineCss: juiceConfig = { enabled: false, ignore: [] },
	optimize: combConfig = { enabled: false, ignore: [] },
	beautify: beautifyConfig = { enabled: false, ignore: [] }
} = config;


// files to ignore
const ignoreCSS = argv.ignoreCss || '';
const ignoreOptimize = argv.ignoreOptimize || '';
const ignoreBeautify = argv.ignoreBeautify || '';

juiceConfig.ignore = ignoreCSS.split(',').map(path => `${config.base}${path}`);
combConfig.ignore = ignoreOptimize.split(',').map(path => `${config.base}${path}`);
beautifyConfig.ignore = ignoreBeautify.split(',').map(path => `${config.base}${path}`);


/**
 * 
 * @param {string} html 
 * @param {object} config 
 * @returns string
 */
function inlineCss(html, config) {
	return new Promise((resolve, reject) => {
		juice.juiceResources(html, config, (error, processedHTML) => {
			if (error) {
				console.log(error);
				reject(error);
			}

			resolve(processedHTML)
		})
	})
}


/**
 * 
 * @param {string} html 
 * @param {object} config 
 * @returns string
 */
function optimize(html, comb, config) {
	return new Promise(async (resolve, reject) => {
		resolve(comb(html, config).result)
	})
}


/**
 * 
 * @param {string} html 
 * @param {object} config 
 * @returns string
 */
function beautify(html, config) {
	return new Promise(async (resolve, reject) => {
		resolve(beautifyHTML(html, config));
	})
}



/**
 * 
 */
async function run() {
	let dir = new File(base);

	try {
		dir.copyTo('./dist', {
			recursive: true
		});
	} catch (error) {
		console.log(error.message);
	}

	const filePaths = glob.sync(source);
	const { comb } = await import("email-comb");
	
	filePaths.forEach((filePath) => {
		let file = new File(filePath);
		let processedHTML = file.read();

		new Promise((resolve, reject) => resolve(processedHTML))
			.then((processedHTML) => {
				return (juiceConfig.enabled && !juiceConfig.ignore.includes(filePath))
					? inlineCss(processedHTML, juiceConfig) 
					: processedHTML;
			})
			.then((processedHTML) => {
				return (combConfig.enabled && !combConfig.ignore.includes(filePath))
					? optimize(processedHTML, comb, combConfig) 
					: processedHTML;
			})
			.then((processedHTML) => {
				return (beautifyConfig.enabled && !beautifyConfig.ignore.includes(filePath))
					? beautify(processedHTML, beautifyConfig) 
					: processedHTML;
			})
			.then((processedHTML) => {
				file.write(processedHTML);
			})
			.catch((error) => {
				console.log(error);
			})
	});
}



if(enabled && (juiceConfig.enabled || combConfig.enabled || beautifyConfig.enabled)) {
	run();
}

