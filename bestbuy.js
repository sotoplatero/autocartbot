process.env.NTBA_FIX_319 = 1;
require('dotenv').config()

var TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(  process.env.BOT_TOKEN, { polling: false } );

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const iPad = puppeteer.devices['iPad landscape'];

async function run() {
// (async () => {
  const [,,product] = process.argv
  if (!product) {
    console.log('Define el código del producto') 
    return null
  }

  const browser = await chromium.puppeteer.launch({
      ignoreDefaultArgs: ['--disable-extensions'],
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.PATH_CHROME || await chromium.executablePath,
      headless: false,
      // headless: chromium.headless,
  });

  try {

    const url = `https://www.bestbuy.com/site/${product}.p?skuId=${product}`
    const page = await browser.newPage();
    // await page.emulate(iPad);
    await page.goto(url);
    const priceHandle = await page.$('.priceView-customer-price > span')
    const addToCartHandle = await page.$('button[data-button-state="ADD_TO_CART"]')
    const price = await page.evaluate((availability) => parseFloat(availability.innerText.slice(1)), priceHandle);

    // VALIDATE PRICE AND AVAILABILITY
    if (price > process.env.PRICEMAX || !addToCartHandle) {
      await browser.close()
      return
    }
 
    // ADD TO CART
    await page.click('button[data-button-state="ADD_TO_CART"]'),
    await page.waitFor('.go-to-cart-button a')
    await Promise.all([
      page.waitForNavigation(),
      page.click('.go-to-cart-button a'),
    ]);

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('.checkout-buttons__checkout > button'),
    ]);

    await Promise.all([
      page.waitForNavigation(),
      page.click('.cia-guest-content__continue', {delay: 100}),
    ]);
    await page.waitForTimeout(500)

    // CONTACT

    await page.type('input[id$=firstName]',process.env.NAME,{ delay: 100 })
    await page.type('input[id$=lastName]',process.env.LASTNAME,{ delay: 100 })
    await page.type('input[id$=street]',process.env.ADDRESS,{ delay: 100 })
    await page.type('input[id$=city]',process.env.CITY,{ delay: 100 })
    await page.select('select[id$=state]',process.env.STATE)
    await page.type('input[id$=zipcode]',process.env.ZIPCODE,{ delay: 100 })
    await page.type('input[id$=emailAddress]',process.env.EMAIL,{ delay: 100 })
    await page.type('input[id$=phone]',process.env.PHONE,{ delay: 100 })

    await Promise.all([
      page.waitForNavigation(),
      page.click('.button--continue > button')
    ]);

    // CHECKOUT
    await page.type('#optimized-cc-card-number',process.env.CARD)
    await page.select('[name=expiration-month]','12')
    await page.select('[name="expiration-year"]','2022')
    await page.type('#credit-card-cvv','123')

    await Promise.all([
      page.waitForNavigation(),
      page.click('.payment__order-summary > button')
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