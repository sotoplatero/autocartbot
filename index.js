require('dotenv').config()
var TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(  process.env.BOT_TOKEN, { polling: false } );

const chromium = require('chrome-aws-lambda');

const selectorBuyNowButton = '#buy-now-button'
const selectorSignInButton = '#signInSubmit'
const selectorContinueButton = '#continue'
const selectorAddToList = '#wishListMainButton a'
const selectorPrice = 'a.a-color-price'
const product1 = 'B098PJNWKD'
const product2 = 'B0995TBTLS'

// const chatUserID = process.env.USER_ID

async function run() {
// (async () => {

  // const {} console.log(process.argv)

    const browser = await chromium.puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.PATH_CHROME || await chromium.executablePath,
        headless: false,
        // headless: chromium.headless,
    });

    const url = `https://www.amazon.com/dp/${product2}`
    const page = await browser.newPage();
    await page.goto(url);
    const availabilityHandle = await page.$('#availability')
    const availabilityText = await page.evaluate((availability) => availability.innerText, availabilityHandle);

    const productIsAvailable = !/unavailable/ig.test(availabilityText)

    if ( productIsAvailable ) {
      const priceHandle = await page.$(selectorPrice)
      const priceText = await page.evaluate((price) => price.innerText, priceHandle);
      const price = parceFloat( priceText.replace('\$','') )
      console.log(price)

    }

    await browser.close()

}

run();