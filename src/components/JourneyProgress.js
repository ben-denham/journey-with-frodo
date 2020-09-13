import React, {useContext, useEffect} from 'react';
import {createUseStyles} from 'react-jss';
import {FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton} from 'react-share';
import copy from 'copy-to-clipboard';

import linkIcon from '../images/link.svg';

import {QueryParamsContext} from '../services/queryparams';
import {getJourneyInfo} from '../services/journeyinfo';
import MiddleEarthMap from './MiddleEarthMap';

const useStyles = createUseStyles({
  journeyTitle: {
    fontSize: '2.5em',
    marginBottom: 0,
  },
  dayCounter: {
    fontFamily: 'Ringbearer',
    fontSize: '2em',
    margin: '0.5em 0',
  },
  message: {
    fontSize: '1.3em',
    marginTop: 0,
    lineHeight: '1.3em',
  },
  reading: {
    marginTop: '0.4em',
    fontSize: '0.6em',
    display: 'block',
  },
  imageWrapper: {
    margin: 'auto',
    width: '370px',
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
      margin: '0 5px',
      height: 64,
    },
  },
  newButton: {
    display: 'inline-block',
    verticalAlign: 'top',
    cursor: 'pointer',
  },
  linkButton: {
    background: '#422a0d',
    width: 64,
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
    height: '355px',
    width: '370px',
    overflowY: 'scroll',
    fontSize: '0.8em',
    margin: 'auto',
    textAlign: 'left',
    borderTop: '1px solid black',
    borderBottom: '1px solid black',
    marginBottom: '0.6em',
    '& td': {
      borderTop: '1px solid black',
      background: '#ffdeb555',
    },
    '& tr:first-child td': {
      borderTop: 'none',
    }
  },
  currentEvent: {
    textDecoration: 'underline',
    background: '#ffdeb599',
  },
  grid: {
    display: 'flex',
    marginBottom: '1.2em',
  },
  gridCol: {
    flex: 1,
  },
});

function Spotify({spotifyId}) {
  return <iframe
           title="spotify"
           src={'https://open.spotify.com/embed/track/' + spotifyId}
           width="370" height="80" frameBorder="0" allowtransparency="true"
           allow="encrypted-media" />
}

function JourneyImage({imageInfo}) {
  const classes = useStyles();
  return <div className={classes.imageWrapper}>
    <img src={imageInfo.src} alt="Frodo's current stage in his journey." />
    <p className={classes.imageCopyright}>{imageInfo.copyright}</p>
  </div>
}

function EventList({events}) {
  const classes = useStyles();
  const scrollerRef = React.createRef();
  const scrollTargetRef = React.createRef();

  useEffect(() => {
    if (scrollerRef.current && scrollTargetRef.current) {
      // Timeout to give time for heights to settle.
      setTimeout(() => {
        const targetOffset = scrollTargetRef.current.offsetTop;
        // Scroll to slightly above target, but not negative.
        const scrollTarget = Math.max((targetOffset -100), 0);
        console.log(scrollTarget)
        scrollerRef.current.scrollTop = scrollTarget;
      }, 500);
    }
  })

  return <div className={classes.events} ref={scrollerRef}>
    <table>
      <tbody>
        {events.past.map(([eventDate, eventText]) =>
          <tr key={eventText}><td><strong>{eventDate}:</strong> {eventText}</td></tr>
        )}
        {events.current.slice(0, 1).map(([eventDate, eventText]) =>
          <tr ref={scrollTargetRef} key={eventText} className={classes.currentEvent}><td><strong>{eventDate}:</strong> {eventText}</td></tr>
        )}
        {events.current.slice(1).map(([eventDate, eventText]) =>
          <tr key={eventText} className={classes.currentEvent}><td><strong>{eventDate}:</strong> {eventText}</td></tr>
        )}
        {events.future.map(([eventDate, eventText]) =>
          <tr key={eventText}><td><strong>{eventDate}:</strong> {eventText}</td></tr>
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
    <button className={classes.newButton} onClick={handleNewButtonClick}>
      Track a New Journey
    </button>
    <button className={classes.linkButton} onClick={handleLinkButtonClick}>
      <img src={linkIcon} alt="Copy link to clipboard" />
    </button>
    <FacebookShareButton url={window.location.href} quote={shareQuote}
                         hastag="#journeywithfrodo">
      <FacebookIcon round={true} />
    </FacebookShareButton>
    <TwitterShareButton url={window.location.href} title={shareQuote}
                        hashtags={['#journeywithfrodo']}>
      <TwitterIcon round={true} />
    </TwitterShareButton>
  </div>
}

function JourneyProgress() {
  const classes = useStyles();
  const {queryParams} = useContext(QueryParamsContext);
  const {
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
  } = getJourneyInfo(queryParams);
  const dayMessage = (
    currentDay ?
    `Day ${currentDay.toLocaleString()} of ${totalDays.toLocaleString()}` :
    `${daysUntil.toLocaleString()} day${(daysUntil > 1) ? 's' : ''} until the journey begins`
  )

  return <div>
    <h2 className={classes.journeyTitle}>{title}</h2>
    <p className={classes.dayCounter}>{dayMessage}</p>
    <p className={classes.message}>
      {message}
      <span className={classes.reading}>
        {reading.volume} - Book {reading.book} -
        Chapter {reading.chapterNumber}: {reading.chapterTitle}
      </span>
    </p>
    <div className={classes.grid}>
      <div className={classes.gridCol}>
        <MiddleEarthMap frodoMapYXPx={frodoMapYXPx} />
      </div>
      <div className={classes.gridCol}>
        <Spotify spotifyId={spotifyId} />
        <EventList events={events} />
        <JourneyImage imageInfo={imageInfo} />
      </div>
    </div>
    <Links shareQuote={`${title} - ${dayMessage} - See my progress on Journey with Frodo!`} />
  </div>
}

export default JourneyProgress;
