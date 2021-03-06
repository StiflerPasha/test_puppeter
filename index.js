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
  let errorDiv = 'span > div > div.azEEh';
  
  //let fileToUpload = './response.mp4';
  
  page.waitForSelector2 = async function (selector, options = { timeout: 30000 }) {
    let result = await page.evaluate((selector, options) => {
      return new Promise(async (resolve, reject) => {
        
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
  
  // await page.waitForSelector(clip, { timeout: 30000 })
  //   //.then(() => clickOnSelector(page, clip))
  //   .catch(() => console.log('TimeOut Clip'));
  //
  // await wait(5000);
  
  
  // TODO: по поводу этого ожидания не уверен
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  await page.waitForSelector('#pane-side', { timeout: 60000 });
  console.log('Pane load');
  
  
  let paneContact = await page.evaluate((selector) => {
    
    const getReactObject = (el) => {
      for (let key in el) {
        if (key.startsWith('__reactInternalInstance$')) {
          return el[key];
        }
      }
    };
    
    let nodeList = [...document.querySelectorAll(selector)];
    let reactObjArr = nodeList
      .map(contact => {
        const { displayName, profilePicThumb } = getReactObject(contact).memoizedProps.children.props.contact;
        return ({
          name: displayName || '',
          avatar: {
            eurl: profilePicThumb.eurl || '',
            img: profilePicThumb.img || ''
          }
        });
      });
    
    return JSON.stringify(reactObjArr);
  }, '#pane-side > div:nth-child(1) > div > div > div');
  
  
  console.log(JSON.parse(paneContact));
  
  
  //let inputs = await page.$$('input[type=file]');
  //let input = inputs[1];
  
  //await input.uploadFile([fileToUpload]);
  
  //await clickOnSelector(page, photoBtn);
  
  // try {
  //   await Promise.race([
  //     page.waitForSelector2(sendBtn, { timeout: 10000 }),
  //     page.waitForSelector2(errorDiv, { timeout: 10000 })
  //   ]);
  // } catch (error) {
  //   console.log('Test error', error);
  // }
  
  
  // чтобы успеть выбрать файл
  //await wait(10000);
  
  //checkRequestFinished(page);
  
  // if (await page.evaluate((div) => !!document.querySelector(div), errorDiv)) {
  //   console.log('Файл не поддерживается');
  //   await clickOnSelector(page, closeBtn);
  //   await clickOnSelector(page, clip);
  //   await clickOnSelector(page, docBtn);
  //
  //   // чтобы успеть выбрать файл перед отправкой
  //   await wait(8000);
  //
  //   //await clickOnSelector(page, sendBtn);
  // } else {
  //   // перед отправкой
  //   await wait(2000);
  //
  //   //await clickOnSelector(page, sendBtn);
  // }
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


main();

// #pane-side > div:nth-child(1) > div > div > div
