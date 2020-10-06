import React, {useContext, useEffect, useState} from 'react';
import clsx from 'clsx';
import {createUseStyles} from 'react-jss';
import {FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton} from 'react-share';
import copy from 'copy-to-clipboard';

import linkIcon from '../images/link.svg';
import frodo from '../images/frodo-silhouette.png';
// Bark source: https://commons.wikimedia.org/wiki/File:Hunt._Elm_bark_1.jpg
import bark from '../images/bark-pattern.png';

import {QueryParamsContext} from '../services/queryparams';
import {getJourneyInfo} from '../services/journeyinfo';
import MiddleEarthMap from './MiddleEarthMap';
import {mediumBreakpoint, largeBreakpoint} from '../breakpoints';

const useStyles = createUseStyles({
  journeyTitle: {
    fontSize: '1.3em',
    marginBottom: 0,
    [mediumBreakpoint]: {
      fontSize: '1.7em',
    },
  },
  dayCounter: {
    fontFamily: 'Ringbearer',
    fontSize: '1.7em',
    margin: '0.5em 0',
  },
  progressBar: {
    height: 24,
    background: 'url(' + bark + ')',
    margin: '20px 0px',
    borderRadius: 12,
    border: '2px solid #cccccc',
  },
  progressBarInner: {
    borderRadius: 12,
    height: '100%',
    background: '#24ce0077',
    position: 'relative',
    '& img': {
      height: 64,
      position: 'absolute',
      top: -20,
      right: -18,
    }
  },
  message: {
    fontSize: '1.3em',
    marginTop: 0,
    lineHeight: '1.5em',
  },
  reading: {
    marginTop: '0.4em',
    fontSize: '0.6em',
    display: 'block',
    lineHeight: '2em',
  },
  imageWrapper: {
    margin: 'auto',
    marginBottom: '1.2em',
    width: '100%',
    '& img': {
      width: '100%',
    },
    '& p': {
      fontSize: '0.6em',
      margin: 0,
    }
  },
  linksWrapper: {
    '& button': {
      margin: '0 5px 10px 5px',
      height: 68,
      borderRadius: '34px !important',
      border: '2px solid #cccccc !important',
      verticalAlign: 'top',
      '&.react-share__ShareButton': {
        width: 68,
        '& circle': {
          display: 'none',
        },
      },
    },
  },
  newButton: {
    display: 'inline-block',
    verticalAlign: 'top',
    cursor: 'pointer',
    height: 'initial !important',
    minHeight: 68,
  },
  linkButton: {
    width: 68,
    borderRadius: 32,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    '& img': {
      display: 'block',
      width: 32,
      height: 32,
      margin: 'auto',
    }
  },
  events: {
    width: '100%',
    overflowY: 'scroll',
    fontSize: '0.75em',
    margin: 'auto',
    textAlign: 'left',
    borderTop: '2px solid black',
    borderBottom: '2px solid black',
    '& td': {
      borderTop: '1px solid #555555',
    },
    '& tr:first-child td': {
      borderTop: 'none',
    }
  },
  yearEvent: {
    textDecoration: 'underline',
  },
  currentEvent: {
    fontWeight: 'bold',
  },
  mainGrid: {
    marginBottom: '0.5em',
    [largeBreakpoint]: {
      display: 'flex',
    },
  },
  mainGridItem: {
    marginBottom: '0.5em',
    '&:last-child': {
      marginBottom: 0,
    },
    [largeBreakpoint]: {
      marginBottom: 0,
      marginRight: '0.5em',
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  sidebarGrid: {
    [largeBreakpoint]: {
      display: 'flex',
      flexDirection: 'column',
      height: 507,
    }
  },
  sidebarGridItem: {
    marginBottom: '0.5em',
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

function ProgressBar({progress}) {
  const classes = useStyles();
  const progressPercent = Math.max(Math.min((progress * 100), 100), 0)
  return <div className={classes.progressBar}>
    <div className={classes.progressBarInner} style={{width: progressPercent + '%'}}>
      <img src={frodo} alt="Frodo" />
    </div>
  </div>
}

function Spotify({spotifyId}) {
  return <iframe
           title="spotify"
           src={'https://open.spotify.com/embed/track/' + spotifyId}
           style={{marginBottom: -10}}
           width="100%" height="80" frameBorder="0" allowtransparency="true"
           allow="encrypted-media" />
}

function JourneyImage({imageInfo}) {
  const classes = useStyles();
  return <div className={classes.imageWrapper}>
    <img src={imageInfo.src} alt="Frodo's current stage in his journey." />
    <p className={classes.imageCopyright}>{imageInfo.copyright}</p>
  </div>
}

function EventList({events, className, style}) {
  const classes = useStyles();
  const scrollerRef = React.createRef();
  const scrollTargetRef = React.createRef();

  function formatEventDate({date, endDate}) {
    if (date.year() !== endDate.year()) {
      return date.format('DD MMMM YYYY') + ' - ' + endDate.format('DD MMMM YYYY');
    }
    else if (date.month() !== endDate.month()) {
      return date.format('DD MMMM') + ' - ' + endDate.format('DD MMMM YYYY');
    }
    else if (date.day() !== endDate.day()) {
      return date.format('DD') + ' - ' + endDate.format('DD MMMM YYYY');
    }
    else {
      return date.format('DD MMMM YYYY');
    }
  }

  useEffect(() => {
    if (scrollerRef.current && scrollTargetRef.current) {
      // Timeout to give time for heights to settle.
      setTimeout(() => {
        const targetOffset = scrollTargetRef.current.offsetTop;
        // Scroll to slightly above target, but not negative.
        const scrollTarget = Math.max((targetOffset -50), 0);
        scrollerRef.current.scrollTop = scrollTarget;
      }, 500);
    }
  })

  return <div className={clsx(classes.events, className)} style={style} ref={scrollerRef}>
    <table>
      <tbody>
        {events.map(({description, isCurrent, isFirstCurrent, isNewYear, ...restEvent}) =>
          <tr key={description} ref={isFirstCurrent ? scrollTargetRef : null}>
            <td className={clsx({[classes.currentEvent]: isCurrent})}>
              {formatEventDate(restEvent)}: {description}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
}

function Links({shareQuote}) {
  const classes = useStyles();
  const {updateQueryParams} = useContext(QueryParamsContext);

  function handleNewButtonClick() {
    updateQueryParams();
  }

  function handleLinkButtonClick() {
    copy(window.location.href);
    alert('Copied link to clipboard');
  }

  return <div className={classes.linksWrapper}>
    <button className={classes.linkButton} onClick={handleLinkButtonClick}>
      <img src={linkIcon} alt="Copy link to clipboard" />
    </button>
    <FacebookShareButton url={window.location.href} quote={shareQuote}
                         hastag="#journeywithfrodo">
      <FacebookIcon round={true} />
    </FacebookShareButton>
    <TwitterShareButton url={window.location.href} title={shareQuote}
                        hashtags={['journeywithfrodo']}>
      <TwitterIcon round={true} />
    </TwitterShareButton>
    <button className={classes.newButton} onClick={handleNewButtonClick}>
      Track a New Journey
    </button>
  </div>
}

function JourneyProgress() {
  const classes = useStyles();
  const {queryParams} = useContext(QueryParamsContext);
  const [journeyInfo, setJourneyInfo] = useState(null);

  function formatReading({volume, book, chapterNumber, chapterTitle}) {
    let result = volume;
    if (book) {
      result += ' - Book ' + book;
    }
    if (chapterNumber) {
      result += ' - Chapter ' + chapterNumber;
    }
    result += ': ' + chapterTitle;
    return result;
  }

  useEffect(() => {
    async function updateJourneyInfo() {
      const fetchedJourneyInfo = await getJourneyInfo(queryParams);
      setJourneyInfo(fetchedJourneyInfo);
    }
    updateJourneyInfo();
  }, [queryParams]);

  if (!journeyInfo) {
    return '';
  }

  const {
    title,
    currentDay,
    daysUntil,
    totalDays,
    proportionComplete,
    message,
    reading,
    frodoMapYXPx,
    spotifyId,
    imageInfo,
    events,
  } = journeyInfo;
  const dayMessage = (
    currentDay ?
    `Day ${currentDay.toLocaleString()} of ${totalDays.toLocaleString()}` :
    `${daysUntil.toLocaleString()} day${(daysUntil > 1) ? 's' : ''} until the journey begins`
  )

  return <div>
    <h2 className={classes.journeyTitle}>{title}</h2>
    <p className={classes.dayCounter}>{dayMessage}</p>
    <ProgressBar progress={proportionComplete} />
    <p className={classes.message}>
      {message}
      <span className={classes.reading}>
        {formatReading(reading)}
      </span>
    </p>
    <div className={classes.mainGrid}>
      <div className={classes.mainGridItem} style={{flex: 2}}>
        <MiddleEarthMap frodoMapYXPx={frodoMapYXPx} />
      </div>
      <div className={classes.mainGridItem} style={{flex: 1}}>
        <div className={classes.sidebarGrid}>
          <div className={classes.sidebarGridItem}>
            <Spotify spotifyId={spotifyId} />
          </div>
          <EventList className={classes.sidebarGridItem} style={{flex: 1}} events={events} />
        </div>
      </div>
    </div>
    <JourneyImage className={classes.sidebarGridItem} imageInfo={imageInfo} />
    <Links shareQuote={`${title} - ${dayMessage} - See my progress on Journey with Frodo!`} />
  </div>
}

export default JourneyProgress;
