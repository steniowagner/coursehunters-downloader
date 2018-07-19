const https = require('https');
const fs = require('fs');

const EventEmitter = require('events');
const emitter = new EventEmitter();

const { getLinksFromSourcePage } = require('./parseLinks');

const MAX_NUMBER_DOWNLOADS = 3;

const courseURL = 'https://coursehunters.net/course/sozdayte-12-faktornoe-prilozhenie-na-node-js-s-pomoshchyu-docker';

const getDestinationPath = (lessonTitle, courseTitle) => {
  const directoryName = process.platform === 'win32' ? `\\${courseTitle}\\` : `/${courseTitle}/`;
  const destination = __dirname + directoryName + lessonTitle + '.mp4';

  return destination;
}

const downloadVideo = (video, destination) => {
  const { url, title } = video;

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

startDownload = (lesson, courseTitle) => {
  const destinationPath = getDestinationPath(lesson.title, courseTitle);
  downloadVideo(lesson, destinationPath);
}

getLinksFromSourcePage(courseURL).then(courseInfo => {
  const { lessons, courseTitle } = courseInfo;

  let firstItems = lessons.splice(0, MAX_NUMBER_DOWNLOADS);

  if (!fs.existsSync(`./${courseTitle}`)) {
    fs.mkdirSync(`./${courseTitle}`);
  }

  emitter.on('started', title => {
    console.log(`> Starting Download of the lesson '${title}'!`);
  });

  emitter.on('finished', title => {
    console.log(`> Finishing Download of the lesson '${title}'!`);
  });

  emitter.on('error', err => {
    console.log('> OH, NO! SOMETHING GETS WRONG!', err);
  });

  firstItems.forEach(lesson => {
    startDownload(lesson, courseTitle);
  });

  emitter.on('slotAvailable', () => {
    if (lessons.length > 0) {
      const lesson = lessons.splice(0, 1)[0];
      startDownload(lesson, courseTitle);
    }
  });
});
