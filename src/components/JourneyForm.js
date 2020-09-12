import React, {useContext} from 'react';
import {createUseStyles} from 'react-jss';
import clsx from 'clsx';
import {Formik, yupToFormErrors} from 'formik';

import {QueryParamsContext, QueryParamsSchema} from '../services/queryparams';


const useStyles = createUseStyles({
  subtitle: {
    fontSize: '1.7em',
  },
  inputWrapper: {
    marginBottom: '1.2em',
  },
  input: {
    background: '#e5ceb2',
    border: '2px solid black',
    '&:focus': {
      outline: '3px solid #b7a58f',
    },
    '&::placeholder': {
      color: '#555555',
    },
  },
  error: {
    border: '2px solid #a61b08',
  },
  errorLabel: {
    color: '#a61b08',
  },
  titleInput: {
    width: '100%',
    fontSize: '1.2em',
    fontFamily: 'Aniron',
    textAlign: 'center',
  },
  datesWrapper: {
    display: 'flex',
  },
  dateWidget: {
    flex: 1,
  },
  dateLabel: {
    fontSize: '1.5em',
  },
  dateInput: {
    fontFamily: 'Ringbearer',
    fontSize: '1.2em',
    width: '80%',
  },
  beginButton: {
    marginTop: '1.2em',
    fontFamily: 'Ringbearer',
    fontSize: '1.5em',
    color: 'white',
    background: '#422a0d',
    border: '2px solid black',
    borderRadius: 15,
    padding: 15,
    '&:focus': {
      outline: '3px solid #b7a58f',
    },
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

  const classes = useStyles();
  return <Formik
           initialValues={queryParams}
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
        <div className={classes.inputWrapper}>
          <input
            name="title"
            type="text"
            className={clsx(classes.input, classes.titleInput,
                            {[classes.error]: (errors.title && (loadedForm || touched.title))})}
            placeholder="Enter a title for your journey"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.title || ''}
          />
          {(errors.title && (loadedForm || touched.title)) &&
           <div className={classes.errorLabel}>{errors.title}</div>
          }
        </div>
        <div className={classes.datesWrapper}>
          <div className={clsx(classes.inputWrapper, classes.dateWidget)}>
            <label className={classes.dateLabel} htmlFor="start">Start date</label>
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
            {(errors.start && (loadedForm || touched.start)) &&
             <div className={classes.errorLabel}>{errors.start}</div>
            }
          </div>
          <div className={clsx(classes.inputWrapper, classes.dateWidget)}>
            <label className={classes.dateLabel} htmlFor="end">End date</label>
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
            {(errors.end && (loadedForm || touched.end)) &&
             <div className={classes.errorLabel}>{errors.end}</div>
            }
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
