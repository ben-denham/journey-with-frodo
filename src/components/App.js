import React, {useContext} from 'react';
import {createUseStyles} from 'react-jss';

import frodo from '../images/frodo-silhouette.png';

import {QueryParamsContext, QueryParamsSchema} from '../services/queryparams';

import JourneyForm from './JourneyForm';
import JourneyProgress from './JourneyProgress';
import {mediumBreakpoint} from '../breakpoints';

const useStyles = createUseStyles({
  app: {
    margin: '5px auto',
    width: '90%',
    maxWidth: '1024px',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5em',
    marginBottom: '0.1em',
    [mediumBreakpoint]: {
      fontSize: '2.3em',
    },
  },
  titleImage: {
    height: '2em',
    verticalAlign: 'middle',
    paddingLeft: '0.5em',
  },
  footer: {
    fontSize: '0.7em',
    marginTop: '3em',
  },
  repoLink: {
    fontSize: '1.5em',
  },
});

function App() {
  const classes = useStyles();
  const {queryParams} = useContext(QueryParamsContext);

  const title = <h1 className={classes.title}>
    Journey with Frodo
    <img className={classes.titleImage} src={frodo} alt="Silhouette of Frodo" />
  </h1>

  return (
  <div className={classes.app}>
    { QueryParamsSchema.isValidSync(queryParams) ?
      <div>
        <JourneyProgress />
        {title}
      </div>
      :
      <div>
        {title}
        <JourneyForm />
      </div>
    }
    <div className={classes.footer}>
      <a className={classes.repoLink} href="https://github.com/ben-denham/journey-with-frodo">
        Open Source on GitHub
      </a>
      <br/>
      Fan project unrelated to Middle-earth Enterprises or New Line Cinema.
      <br/>
      Book text © Middle-earth Enterprises. <a href="https://www.cleanpng.com/png-frodo-baggins-the-lord-of-the-rings-the-fellowship-422730/">Frodo image</a> © New Line Cinema.
    </div>
  </div>
  );
}

export default App;
