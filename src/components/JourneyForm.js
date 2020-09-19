import React, {useContext} from 'react';
import {createUseStyles} from 'react-jss';
import clsx from 'clsx';
import {Formik, yupToFormErrors} from 'formik';

import {QueryParamsContext, QueryParamsSchema} from '../services/queryparams';
import {mediumBreakpoint} from '../breakpoints';

const useStyles = createUseStyles({
  subtitle: {
    fontSize: '1em',
    lineHeight: '1.4em',
    [mediumBreakpoint]: {
      fontSize: '1.3em',
    },
  },
  // Inputs.
  input: {
    fontSize: '0.8em',
    [mediumBreakpoint]: {
      fontSize: '1.2em',
    },
    background: '#e5ceb2',
    border: '2px solid black',
    borderRadius: 12,
    '&:focus': {
      outline: '3px solid #b7a58f',
    },
    '&::placeholder': {
      color: '#555555',
    },
  },
  inputLabel: {
    fontSize: '1.2em',
  },
  // Errors.
  error: {
    border: '2px solid #a61b08 !important',
  },
  errorLabel: {
    color: '#a61b08',
    minHeight: '2em',
    fontSize: '0.8em',
    lineHeight: '1.4em',
    [mediumBreakpoint]: {
      fontSize: '1em',
    },
  },
  // Title input.
  titleInput: {
    extend: 'input',
    width: '100%',
    fontFamily: 'Aniron',
    textAlign: 'center',
  },
  // Date inputs.
  datesWrapper: {
    [mediumBreakpoint]: {
      display: 'flex',
    },
  },
  dateWidget: {
    flex: 1,
  },
  dateInput: {
    extend: 'input',
    fontFamily: 'Ringbearer',
    width: '80%',
    padding: '0.2em',
  },
  // Submit button.
  beginButton: {
    marginTop: '0.8em',
  },
});

function JourneyForm() {
  const {queryParams, updateQueryParams} = useContext(QueryParamsContext);
  const loadedForm = Object.keys(queryParams).length !== 0;

  // If the form was loaded with pre-filled values, we need to
  // populate initial errors.
  let initialErrors = {};
  if (loadedForm) {
    try {
      QueryParamsSchema.validateSync(queryParams, {abortEarly: false})
    } catch (yupErrors) {
      initialErrors = yupToFormErrors(yupErrors);
    }
  }

  const initialValues = Object.assign({title: '', start: '', end: ''}, queryParams)
  const classes = useStyles();
  return <Formik
           initialValues={initialValues}
           initialErrors={initialErrors}
           validationSchema={QueryParamsSchema}
           onSubmit={(values) => {
             updateQueryParams(values);
           }}
         >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      isSubmitting,
    }) => (
      <form onSubmit={handleSubmit} autoComplete="off">
        <p className={classes.subtitle}>
          Enter the details of your journey, and track your progress alongside Frodo's quest to destroy the Ring
        </p>
        <input
          name="title"
          type="text"
          className={clsx(classes.titleInput,
                          {[classes.error]: (errors.title && (loadedForm || touched.title))})}
          placeholder="Enter a title for your journey"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.title || ''}
        />
        <div className={classes.errorLabel}>
          {((loadedForm || touched.title) && errors.title)}
        </div>
        <div className={classes.datesWrapper}>
          <div className={clsx(classes.dateWidget)}>
            <label className={classes.inputLabel} htmlFor="start">Start date</label>
            <br/>
            <input
              name="start"
              type="date"
              className={clsx(classes.input, classes.dateInput,
                              {[classes.error]: (errors.start && (loadedForm || touched.start))})}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.start || ''}
            />
            <div className={classes.errorLabel}>
              {((loadedForm || touched.start) && errors.start)}
            </div>
          </div>
          <div className={classes.dateWidget}>
            <label className={classes.inputLabel} htmlFor="end">End date</label>
            <br/>
            <input
              name="end"
              type="date"
              className={clsx(classes.input, classes.dateInput,
                              {[classes.error]: (errors.end && (loadedForm || touched.end))})}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.end || ''}
            />
            <div className={classes.errorLabel}>
              {((loadedForm || touched.end) && errors.end)}
            </div>
          </div>
        </div>
        <input
          type="submit"
          className={classes.beginButton}
          value="Begin your Journey"
        />
      </form>
    )}
  </Formik>;
}

export default JourneyForm;
