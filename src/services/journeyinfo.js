import moment from 'moment';

function dayLength(dateA, dateB) {
  let dayDiff = moment.duration(dateB.diff(dateA)).asDays();
  // Even if the start and end are the same, there is still 1 day.
  return Math.floor(dayDiff) + 1;
}

export function getJourneyInfo(queryParams) {
  const {title, start, end} = queryParams;

  // Use Date.parse to support whatever the date inputs saved, and use
  // moment for calendar date subtraction.
  const startDate = moment(Date.parse(start));
  const endDate = moment(Date.parse(end));
  const totalDays = dayLength(startDate, endDate);

  let daysUntil = null;
  let currentDay = Number.parseInt(queryParams.day || '', 10);
  if (isNaN(currentDay)) {
    let currentDate = moment(new Date());
    currentDay = dayLength(startDate, currentDate);
  }
  if (currentDay <= 0) {
    daysUntil = Math.abs(currentDay - 1);
    currentDay = null;
  }

  const message = 'Frodo is still living in the Shire before his journey begins';
  const frodoMapYXPx = [660, 821];
  const reading = {
    volume: 'The Fellowship of the Ring',
    book: 'I',
    chapterNumber: 1,
    chapterTitle: 'A Long Expected Party',
  };
  const spotifyId = '6zW80jVqLtgSF1yCtGHiiD';
  const imageInfo = {
    src: 'journey-images/frodo-shire.jpg',
    copyright: '© New Line Cinema',
  }
  const events = {
    past: [
      ['September 18', 'Gandalf escapes from Orthanc in the early hours. The Black Riders cross the Fords of Isen.'],
      ['September 19', 'Gandalf comes to Edoras as a beggar, and is refused admittance.'],
      ['September 20', 'Gandalf gains entrance to Edoras. Théoden commands him to go: "Take any horse, only be gone ere tomoorrow is old!"'],
      ['September 21', 'Gandalf meets Shadowfax, but the horse will not allow him to come near. He follows Shadowfax far over the fields.'],
    ],
    current: [
      ['September 22', 'The Black Riders reach Sarn Ford at evening; they drive off the guard of Rangers. Gandalf overtakes Shadowfax.'],
    ],
    future: [
      ['September 23', 'Four Riders enter the Shire before dawn. The others pursue the Rangers eastward, and then return to watch the Greenway. A Black Rider comes to Hobbiton at nightfall. Frodo leaves Bag End. Gandalf having tamed Shadowfax rides from Rohan.'],
      ['September 24', 'Gandalf crosses the Isen'],
      ['September 26', 'The Old Forest. Frodo comes to Bombadil.'],
      ['September 27', 'Gandalf crosses Greyflood. Second night with Bombadil.'],
      ['September 28', 'The Hobbits captured by a Barrow-wight. Gandalf reaches Sarn Ford.'],
    ],
  }

  return {
    title,
    currentDay,
    daysUntil,
    totalDays,
    message,
    reading,
    frodoMapYXPx,
    spotifyId,
    imageInfo,
    events,
  }
}
