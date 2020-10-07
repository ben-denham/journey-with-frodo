import moment from 'moment';
import Papa from 'papaparse';

// FILE HANDLING.

async function loadCsv(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}


// LOTR DATE HANDLING.

const getSRDatestamp = (() => {

  function isLeapYear(ta_year) {
    return (ta_year % 4 === 0) && (ta_year % 100 !== 0);
  }

  function getSRDatestamp({ta_year, month, day}) {
    /* Given a Third-Age year, and Shire Reckoning month + day, return
       a Shire-Reckoning datestamp (number of days since start of
       third age). */
    if (!ta_year && !month && !day) {
      return 0;
    }

    ta_year = parseInt(ta_year, 10);
    const days_before_year = (ta_year * 365) + Math.floor(ta_year / 4) - Math.floor(ta_year / 100);
    let total_days = days_before_year;
    // Handle special days.
    if (month === 'special') {
      switch (day) {
        case 'year_start_yule':
          total_days += 1;
          break;
        case 'one_lithe':
          total_days += 2 + (6 * 30);
          break;
        case 'midyear':
          total_days += 3 + (6 * 30);
          break;
        case 'overlithe':
          if (!isLeapYear(ta_year)) {
            throw Error('No overlithe in this year.');
          }
          total_days += 4 + (6 * 30);
          break;
        case 'two_lithe':
          total_days += 4 + (6 * 30);
          if (isLeapYear(ta_year)) {
            total_days += 1;
          }
          break;
        case 'year_end_yule':
          total_days += 365;
          if (isLeapYear(ta_year)) {
            total_days += 1;
          }
          break;
        default:
          throw Error('Invalid special day.');
      }
    }
    // Handle normal months.
    else {
      month = parseInt(month, 10);
      day = parseInt(day, 10);
      if (!(month >= 1 && month <= 12 && day >= 1 && day <= 30)) {
        throw Error('Invalid month or day.');
      }
      // Base is one day (2 yule, first day of year) + 30 days in each month.
      let days_before_month = 1 + (30 * (month - 1));
      // If we are after the Lithedays, add them to the total.
      if (month > 6) {
        // At least 3 Lithe days every year.
        days_before_month += 3;
        // Add one more day for Overlithe in leap years.
        if (isLeapYear(ta_year)) {
          days_before_month += 1;
        }
      }
      total_days += days_before_month + day;
    }
    return total_days;
  }

  return getSRDatestamp;
})();


// REAL DATE HANDLING.

const DATE_FORMAT = 'YYYY-MM-DD';

function journeyDuration(dateA, dateB) {
  // Drop timezone from dates to avoid daylight-savings differences.
  dateA = moment.utc(dateA.format(DATE_FORMAT), DATE_FORMAT);
  dateB = moment.utc(dateB.format(DATE_FORMAT), DATE_FORMAT);
  // The last day is part of the journey, so add 1 day.
  return moment.duration(dateB - dateA).add(1, 'day');
}

function journeyDays(dateA, dateB) {
  return Math.floor(journeyDuration(dateA, dateB).asDays());
}

function getRealDateInfo(startDate, endDate, day = null) {
  const totalDays = journeyDays(startDate, endDate);

  let currentDate, proportionComplete;
  let currentDay = Number.parseInt(day || '', 10);
  if (isNaN(currentDay)) {
    currentDate = moment();
    currentDay = journeyDays(startDate, currentDate);
    proportionComplete = (currentDate - startDate) / (endDate - startDate);
  }
  else {
    // Subtract half a day to represent midday on the selected day.
    proportionComplete = (currentDay - 0.5) / totalDays;
    // Wrap in moment to clone date that will be mutated.
    currentDate = moment(startDate).add(moment.duration((endDate - startDate) * proportionComplete));
  }

  let daysUntil = null;
  if (currentDay <= 0) {
    daysUntil = Math.abs(currentDay - 1);
    currentDay = null;
  }

  return {
    currentDate,
    currentDay,
    daysUntil,
    totalDays,
    proportionComplete,
  };
}


// JOUNEY INFO.

const MAX_PAST_FUTURE_EVENTS = 5;
const FRODO_START_DATE = {ta_year: 3018, month: 9, day: 23};
const FRODO_END_DATE = {ta_year: 3019, month: 3, day: 25};
const FRODO_START_SR_DATESTAMP = getSRDatestamp(FRODO_START_DATE);
const FRODO_END_SR_DATESTAMP = getSRDatestamp(FRODO_END_DATE);
// The last day is part of the journey, so add 1 day.
const FRODO_DAY_LENGTH = (FRODO_END_SR_DATESTAMP - FRODO_START_SR_DATESTAMP) + 1;

function getRealDateForSRDatestamp(SRDatestamp, startRealDate, endRealDate) {
  const proportionComplete = (SRDatestamp - FRODO_START_SR_DATESTAMP) / FRODO_DAY_LENGTH;
  const dateDiff = moment.duration(journeyDuration(startRealDate, endRealDate) * proportionComplete);
  // Wrap in moment to clone date that will be mutated.
  return moment(startRealDate).add(dateDiff);
}

// Return 1 second less than a full SR day in real time duration.
function getAlmostDayRealDuration(startRealDate, endRealDate) {
  // 1 second less than one day.
  const almostOneDay = 1 - (1 / 86400);
  const almostOneDayProportion = almostOneDay / FRODO_DAY_LENGTH;
  return moment.duration(journeyDuration(startRealDate, endRealDate) * almostOneDayProportion);
}

function getNearEvents(events, currentSRDatestamp, startDate, endDate) {
  let firstCurrentEventIndex, lastCurrentEventIndex;
  for (var i = 0; i < events.length; i++) {
    let event = events[i];
    let eventSRDatestamp = getSRDatestamp({ta_year: event.ta_year, month: event.month, day: event.day});
    if (eventSRDatestamp < currentSRDatestamp) {
      // Keep updating the first current index to be the last past event.
      firstCurrentEventIndex = i;
    }
    else if (eventSRDatestamp === currentSRDatestamp) {
      // If this is the first time we have hit an actual match, then
      // set the first current index.
      if (lastCurrentEventIndex === undefined) {
        firstCurrentEventIndex = i;
      }
      // Keep updating the last current index to be the last current event.
      lastCurrentEventIndex = i;
    }
    else if (eventSRDatestamp > currentSRDatestamp) {
      // If we hit a future event before any past or current event,
      // then we set the current event to that date.
      if (firstCurrentEventIndex === undefined) {
        firstCurrentEventIndex = i;
      }
      break;
    }
  }
  // If we never explicitly set the lastCurrentEventIndex, ensure it is set.
  if (lastCurrentEventIndex === undefined) {
    lastCurrentEventIndex = firstCurrentEventIndex;
  }

  function preprocessEvent(event) {
    const SRDatestamp = getSRDatestamp({ta_year: event.ta_year, month: event.month, day: event.day});
    const realDate = getRealDateForSRDatestamp(SRDatestamp, startDate, endDate);
    return {
      type: 'event',
      date: realDate,
      // Wrap in moment to copy before mutation.
      endDate: moment(realDate).add(getAlmostDayRealDuration(startDate, endDate)),
      description: event.description,
    };
  }
  const firstPastEventIndex = Math.max(0, (firstCurrentEventIndex - MAX_PAST_FUTURE_EVENTS));
  const pastEvents = events.slice(firstPastEventIndex, firstCurrentEventIndex).map(preprocessEvent);
  const currentEvents = events.slice(firstCurrentEventIndex, lastCurrentEventIndex + 1).map(preprocessEvent);
  const futureEvents = events.slice(lastCurrentEventIndex + 1, lastCurrentEventIndex + 1 + MAX_PAST_FUTURE_EVENTS).map(preprocessEvent);

  // Set "current" flags on current events.
  currentEvents.forEach((event, index) => {
    event.isCurrent = true;
    if (index === 0) {
      event.isFirstCurrent = true;
    }
  });

  return pastEvents.concat(currentEvents, futureEvents);
}

export async function getJourneyInfo(queryParams) {
  const {title, start, end, day} = queryParams;
  const startDate = moment(start, DATE_FORMAT);
  const endDate = moment(end, DATE_FORMAT);

  const {
    currentDay,
    daysUntil,
    totalDays,
    proportionComplete,
  } = getRealDateInfo(startDate, endDate, day);
  const currentSRDatestamp = Math.floor(FRODO_START_SR_DATESTAMP + (FRODO_DAY_LENGTH * proportionComplete));

  const eventsPromise = loadCsv('events.csv');
  const journeyPromise = loadCsv('journey.csv');
  const events = (await eventsPromise).data;
  const steps = (await journeyPromise).data;

  let currentStep = null;
  for (let step of steps) {
    let stepSRDatestamp = getSRDatestamp({ta_year: step.ta_year, month: step.month, day: step.day});
    if (stepSRDatestamp > currentSRDatestamp) {
      // Ensure that even if the current date is before all dates, we
      // still pick the first step.
      if (currentStep === null) {
        currentStep = step;
      }
      break;
    }
    currentStep = step;
  }

  const nearEvents = getNearEvents(events, currentSRDatestamp, startDate, endDate);

  return {
    title,
    currentDay,
    daysUntil,
    totalDays,
    proportionComplete,
    message: currentStep.message,
    reading: {
      volume: currentStep.reading_volume,
      book: currentStep.reading_book,
      chapterNumber: currentStep.reading_chapter_number,
      chapterTitle: currentStep.reading_chapter_title,
    },
    frodoMapYXPx: [currentStep.map_y, currentStep.map_x],
    spotifyId: currentStep.spotify_id,
    imageInfo: {
      src: 'journey-images/' + currentStep.image_file,
      copyright: '© ' + currentStep.image_copyright,
    },
    events: nearEvents,
  }
}
