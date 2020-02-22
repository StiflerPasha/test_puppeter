import puppeteer from 'puppeteer';


const LAUNCH_PUPPETEER_OPTS = {
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920x1080'
  ]
};

const PAGE_PUPPETEER_OPTS = {
  networkIdle2Timeout: 5000,
  waitUntil: 'networkidle2',
  timeout: 3000000
};

async function clickOnSelector(page, selector) {
  let elem = await page.$(selector);
  if (elem) {
    await elem.hover();
    await elem.click();
  }
}

const main = async () => {
  const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/', PAGE_PUPPETEER_OPTS);
  
  let clip = 'span[data-icon=clip]';
  let photoBtn = 'span[data-icon=image]';
  let docBtn = 'span[data-icon=document]';
  let closeBtn = 'span[data-icon=x-light]';
  let sendBtn = 'span[data-icon=send-light]';
  let errorDiv = '#app > div > div > div._2aMzp > div._10V4p._1jxtm > span > div > span > div > div > div.rK2ei.USE1O > div._2CDPn > span > div > div.azEEh';
  
  await page.waitForSelector(clip, { timeout: 30000 })
    .then(() => clickOnSelector(page, clip))
    .catch(() => console.log('TimeOut Clip'));
  
  await clickOnSelector(page, photoBtn);
  
  // чтобы успеть выбрать файл
  await wait(10000);
  
  checkRequestFinished(page);
  
  if (await page.evaluate((div) => !!document.querySelector(div), errorDiv)) {
    console.log('Файл не поддерживается');
    await clickOnSelector(page, closeBtn);
    await clickOnSelector(page, clip);
    await clickOnSelector(page, docBtn);
    
    // чтобы успеть выбрать файл
    await wait(8000);
    await clickOnSelector(page, sendBtn);
  } else {
    await wait(5000);
    await clickOnSelector(page, sendBtn);
  }
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkRequestFinished(page) {
  page.once('requestfinished', () => console.log(`Request Finished`));
}

main().then(() => console.log('Browser launch'));
