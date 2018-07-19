const https = require('https');
const fs = require('fs');

const EventEmitter = require('events');
const emitter = new EventEmitter();

const { getLinksFromSourcePage } = require('./parseLinks');

const MAX_NUMBER_DOWNLOADS = 1;

const courseURL = 'https://coursehunters.net/course/sozdayte-12-faktornoe-prilozhenie-na-node-js-s-pomoshchyu-docker';

const downloadVideo = video => {
  const { url, title } = video;

  const directoryName = process.platform === 'win32' ? '\\videos\\' : '/videos/';
  const destination = __dirname + directoryName + title + '.mp4';

  const file = fs.createWriteStream(destination);

  https.get(url, res => {
    emitter.emit('started', title);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      emitter.emit('finished', title);
      emitter.emit('slotAvailable');
    });
  }).on('error', err => {
    emitter.emit('error', err);
    fs.unlink(destination);
  });
}

if (!fs.existsSync('./videos')) {
  fs.mkdirSync('./videos');
}

getLinksFromSourcePage(courseURL).then(links => {
  let firstItems = links.splice(0, MAX_NUMBER_DOWNLOADS);

  emitter.on('started', title => {
    console.log(`> Download of the video '${title}' started!`);
  });

  emitter.on('finished', title => {
    console.log(`> Video '${title}' downloaded!`);
  });

  emitter.on('error', err => {
    console.log('> OH, NO! SOMETHING GETS WRONG!', err);
  });

  firstItems.forEach(element => {
    downloadVideo(element, 1);
  });

  emitter.on('slotAvailable', () => {
    if (links.length > 0) {
      const video = links.splice(0, 1)[0];
      downloadVideo(video);
    }
  });
});
