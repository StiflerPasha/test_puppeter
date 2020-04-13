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

async function timeout(ms) { return new Promise(resolve => { setTimeout(resolve, ms) }) }

async function ___clickOnSelector(page, selector, number) {
  let elem;
  if (number) {
    let elemList = await page.$$(selector);
    if (elemList.length) elem = elemList[number];
  } else {
    elem = await page.$(selector);
  }
  if (elem) {
    await elem.hover();
    await elem.click();
    elem.dispose();
    return true;
  }
  return false;
}

function takeSnapshot() {
  console.log('Take snapshot');
}

async function initExposeFunctions(page) {
  try {
    await Promise.all([
      page.exposeFunction('WZ_click_v2', async (selector) => {
        let elem = await page.$(selector);
        await elem.hover();
        await elem.click();
        elem.dispose();
      }),
      page.exposeFunction('WZ_mouse_move', async (x, y) => {
        await page.mouse.move(x, y);
      }),
      page.exposeFunction('WZ_keypress', async (key) => {
        await page.keyboard.press(key);
      }),
      page.exposeFunction('WZ_openAnyChat', async () => {
        try {
          let elem = await page.waitFor(() => document.querySelector('#pane-side>div>div>div>div, ._1NrpZ ._2wP_Y'), {
            visible: true,
            timeout: 1000
          });
          await elem.hover();
          await elem.click();
          elem.dispose();
        } catch (e) {
          console.log(`WZ_openAnyChat ERROR: ${e.message}, ${e.stack}`, e);
        }
      }),
      page.exposeFunction('WZ_Error', async (error, needTakeSnapshot) => {
        if (needTakeSnapshot) takeSnapshot();
        console.log(`WZ_Error: ${error}`);
      }),
      page.exposeFunction('WZ_openChatMedia', async () => {
        const waitFor = Date.now() + 20000;
        // TODO: ниже плохие селекторы, т.к. цепляются к классам, рассмотреть другие варианты, не забыть про бизнес-профили
        let mediaPaneIsOpened = await page.evaluate(() => {
          return !!document.querySelector('div[tabindex="-1"] div._2VQzd[role=button]');
        });
        while ((Date.now() < waitFor) && !mediaPaneIsOpened) {
          await ___clickOnSelector(page, '#main header');
          await timeout(250);
          mediaPaneIsOpened = await page.evaluate(() => {
            return !!document.querySelector('div[tabindex="-1"] div._2VQzd[role=button]');
          });
        }
        // TODO: вот тут у бизнес-аккаунта будет еще каталог, но у него такой же селектор как у медиа-панели и он будет стоять первым.
        //  но этого каталога может и не быть
        // TODO: тут никак без селекторов классов. Только если текст анализировать.
        // TODO: у групп селектор медиа будет стоять первым
        let hasExtraTabs = await page.evaluate(() => document.querySelectorAll('div[tabindex="-1"] div._2VQzd[role=button]').length > 1);
        let isBusiness = await page.evaluate(() => !!document.querySelector('div._2vsnU > div:nth-child(2) > div > div._10xEB'));
        let isGroup = !isBusiness && hasExtraTabs;
        if (isBusiness && hasExtraTabs) {
          await ___clickOnSelector(page, 'div[tabindex="-1"] div._2VQzd[role=button]', 1);
        } else if (isGroup) {
          await ___clickOnSelector(page, 'div[tabindex="-1"] div._2VQzd[role=button]', 0);
        } else {
          await ___clickOnSelector(page, 'div[tabindex="-1"] div._2VQzd[role=button]');
        }
      })
    ]);
  } catch (error) {
    console.log('Error', error);
  }
}

const main = async () => {
  const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/', PAGE_PUPPETEER_OPTS);
  
  // let clip = 'span[data-icon=clip]';
  // let photoBtn = 'span[data-icon=image]';
  // let docBtn = 'span[data-icon=document]';
  // let closeBtn = 'span[data-icon=x-light]';
  // let sendBtn = 'span[data-icon=send-light]';
  // let errorDiv = 'span > div > div.azEEh';
  
  await initExposeFunctions(page);
  
  //let fileToUpload = './response.mp4';
  
  page.waitForSelector2 = async function (selector, options = { timeout: 30000 }) {
    let result = await page.evaluate((selector, options) => {
      return new Promise(async (resolve) => {
        
        async function timeout(ms) {
          return new Promise(resolve => {
            setTimeout(resolve, ms);
          });
        }
        
        let waitFor = Date.now() + options.timeout;
        while (Date.now() < waitFor) {
          let el = document.querySelector(selector);
          if (el) {
            resolve(true);
            return;
          }
          await timeout(50);
        }
        resolve(false);
      });
    }, selector, options);
    if (!result) throw { message: 'waitForSelector2 error' };
  };
};


main();

// #pane-side > div:nth-child(1) > div > div > div
