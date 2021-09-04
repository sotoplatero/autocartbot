
const chromium = require('chrome-aws-lambda');

const selectorBuyNowButton = '#buy-now-button'
const selectorSignInButton = '#signInSubmit'
const selectorContinueButton = '#continue'

const chatUserID = process.env.USER_ID

async function run() {
    const browser = await chromium.puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.PATH_CHROME || await chromium.executablePath,
        headless: chromium.headless,
    });
}

run();