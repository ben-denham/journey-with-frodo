import React, {useContext} from 'react';
import {createUseStyles} from 'react-jss';

import {QueryParamsContext} from '../services/queryparams';


const useStyles = createUseStyles({
});

function JourneyProgress() {
  const {queryParams} = useContext(QueryParamsContext);

  return <div>
    {JSON.stringify(queryParams)}
  </div>
}

export default JourneyProgress;
