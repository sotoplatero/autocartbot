require('dotenv').config()
var TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(  process.env.BOT_TOKEN, { polling: false } );

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const iPad = puppeteer.devices['iPad landscape'];

const selectorBuyNowButton = '#buy-now-button'
const selectorSignInButton = '#signInSubmit'
const selectorContinueButton = '#continue'
const selectorAddToList = '#wishListMainButton a'
const selectorPrice = 'a.a-color-price'
const product1 = 'B098PJNWKD'
const product2 = 'B0995TBTLS'

const EMAIL = process.env.EMAIL
// const chatUserID = process.env.USER_ID

async function run() {
// (async () => {

  // const {} console.log(process.argv)
  try {
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
    // await page.emulate(iPad);
    await page.goto(url);
    const availabilityHandle = await page.$('#availability')
    const availabilityText = await page.evaluate((availability) => availability.innerText, availabilityHandle);

    if ( /unavailable/ig.test(availabilityText) ) {
      await browser.close()
      return
    }

    // ADD WISH LIST
    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('#wishListMainButton a'),
    ]);

    // LOGIN
    await page.type('input#ap_email',EMAIL, { delay: 100 })
    await Promise.all([
      page.waitForNavigation(),
      page.click('input#continue')
    ]);

    // const priceHandle = await page.$(selectorPrice)
    // const priceText = await page.evaluate((price) => price.innerText, priceHandle);
    // const price = parceFloat( priceText.replace('\$','') )
    // console.log(price)

  } catch (e) {
    console.log(e)
  }

  await browser.close()

}

run();