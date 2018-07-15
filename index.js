const https = require('https');
const fs = require('fs');

const { getLinksFromSourcePage } = require('./parseLinks');
const MAX_NUMBER_DOWNLOADS = 3;

const url = 'https://coursehunters.net/course/osnovy-yazyka-programmirovaniya-c';

const downloadVideo = itemToDownload => {
  const { url, title } = itemToDownload;

  const directoryName = process.platform === 'win32' ? '\\videos\\' : '/videos/';
  const destination = __dirname + directoryName + title + '.mp4';

  const file = fs.createWriteStream(destination);

  https.get(url, res => {
    console.log(`> Download of the video '${title}' started!`);

    res.pipe(file);

    file.on('finish', () => {
      console.log(`>> Video '${title}' downloaded!`);
      file.close();
    });
  }).on('error', err => {
    console.log('- OH, NO! SOMETHING GETS WRONG!', err);
    fs.unlink(destination);
  });
}

if (!fs.existsSync('./videos')) {
  fs.mkdirSync('./videos');
}

getLinksFromSourcePage(url).then(links => {
  const start = () => {
    if (links.length === 0) {
      return;
    }

    let items = [];

    for (let i = 0; i < MAX_NUMBER_DOWNLOADS; i++) {
      if (i < links.length) {
        items.push(links.splice(i, 1));
      }
    }

    items = items.filter(element => element.length > 0);

    items.forEach(link => {
      downloadVideo(link[0]);
    });

    console.log();

    setTimeout(start, 1000 * 60 * 3);
  }

  start();
});
