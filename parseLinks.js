const cheerio = require('cheerio');
const https = require('https');

const getLinksFromSourcePage = url => {
  let pageBody = '';

  console.log('\n>> Getting Links from Source Page');

  return new Promise(resolve => {
    https.get(url, res => {
      res.on('data', chunk => {
        pageBody += chunk;
      });

      res.on('end', () => {
        console.log('>> DONE!');
        resolve(parseItemsLinks(pageBody));
      });
    });
  });
}

const handleWindowsFilename = title => {
  const isSpecialWindowsChar = character => {
    const value = character.charCodeAt(0) === 47 ||
      character.charCodeAt(0) === 34 ||
      character.charCodeAt(0) === 124 ||
      character.charCodeAt(0) === 58 ||
      character.charCodeAt(0) === 42 ||
      character.charCodeAt(0) === 60 ||
      character.charCodeAt(0) === 62 ||
      character.charCodeAt(0) === 34 ||
      character.charCodeAt(0) === 92 ||
      character.charCodeAt(0) === 63;

    return value;
  }

  title = title.split('')
    .filter(character => !isSpecialWindowsChar(character)).join('');

  return title;
}

const parseItemsLinks = pageBody => {
  const $ = cheerio.load(pageBody);
  const titles = [];
  const urls = [];

  $('.lessons-list__li').children('span')
    .each((index, element) => {
      const rawTitlte = $(element).text();
      const firstBlankIndex = rawTitlte.indexOf(' ');
      let title = rawTitlte.substring(firstBlankIndex + 1, rawTitlte.length);

      if (process.platform === 'win32') {
        title = handleWindowsFilename(title);
      }

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
