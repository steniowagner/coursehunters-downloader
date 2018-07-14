const cheerio = require('cheerio');
const https = require('https');

const getLinksFromSourcePage = url => {
  let pageBody = '';

  return new Promise(resolve => {
    https.get(url, res => {
      res.on('data', chunk => {
        pageBody += chunk;
      });

      res.on('end', () => {
        resolve(parseItemsLinks(pageBody));
      });
    });
  });
}

const parseItemsLinks = pageBody => {
  const $ = cheerio.load(pageBody);
  const titles = [];
  const urls = [];

  $('.lessons-list__li').children('span')
    .each((index, element) => {
      const rawTitlte = $(element).text();
      const firstBlankIndex = rawTitlte.indexOf(' ');
      const title = rawTitlte.substring(firstBlankIndex + 1, rawTitlte.length);

      titles.push(title);
    });

  $('.lessons-list__li').children('link')
    .each((index, element) => {
      const uniqueRef = $(element).attr('itemprop');
      if (uniqueRef === 'url') {
        const url = $(element).attr('href');
        urls.push(url);
      }
    });

  return titles.map((title, index) => ({
    url: urls[index],
    title,
  }));
}

module.exports = {
  getLinksFromSourcePage,
};
