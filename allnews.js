const cheerio = require('cheerio');
const request = require('request');
const newsSources = require('./news.json');

function getSelectors(url){
  const obj = {};
  newsSources.forEach(item=>{
    if (item.src === url) {
      Object.assign(obj, item);
    }
  }) 
  return obj;
}

function sendRequest(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body)=>{
      if(err) {
        reject(err);
      }
      resolve(cheerio.load(body));
    });
  })
}
async function fetchNews(url) {
  //деструктуризаяция объекта
  const {header, content: contentSelector} = getSelectors(url);
  const $newsPage = await sendRequest(url);
  // $newsPage(header) - это JQuery поиск элемента. newsHeads - массив объектов с полями title, href.
  const newsHeads = Array.prototype.slice.call($newsPage(header),0)
                    .map(item=>({title: $newsPage(item).text().replace(/\n/g, '').trim(), href: $newsPage(item).attr('href')}));
  const news = await Promise.all(newsHeads.map(async item => {
    const $item = await sendRequest(item.href);
    const content = $item(contentSelector).eq(0).text().replace(/\n/g, '').trim();
    //возвращаем новый объект с полями title, href (развернули объект с такими полями) и content
    return {...item, content}
  }))
  //возвращаем массив объектов с полями title, href и content
  return news;
}

exports.news = (url) => fetchNews(url);