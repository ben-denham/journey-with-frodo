import React, {useContext} from 'react';
import {createUseStyles} from 'react-jss';

import {QueryParamsContext, QueryParamsSchema} from '../services/queryparams';

import JourneyForm from './JourneyForm';
import JourneyProgress from './JourneyProgress';

const useStyles = createUseStyles({
  app: {
    margin: '5px auto',
    width: '85%',
    maxWidth: '1024px',
    textAlign: 'center',
  },
  title: {
    fontSize: '3em',
  },
});

function App() {
  const classes = useStyles();
  const {queryParams} = useContext(QueryParamsContext);

  return (
    <div className={classes.app}>
      <h1 className={classes.title}>
        Journey with Frodo
      </h1>

      { QueryParamsSchema.isValidSync(queryParams) ?
        <JourneyProgress />
        :
        <JourneyForm />
      }
    </div>
  );
}

export default App;
