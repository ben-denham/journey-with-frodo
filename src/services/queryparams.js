import React, {useState, useEffect} from 'react';
import * as yup from "yup";

function getQueryParams() {
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(searchParams);
}


export const QueryParamsSchema = yup.object({
  title: yup.string().required('The title is required'),
  start: yup.date().required('The start date is required'),
  end: yup.date()
          .required('The end date is required')
          .min(yup.ref('start'), 'The end date cannot be before the start date'),
});

export const QueryParamsContext = React.createContext();

export function QueryParamsProvider({children}) {
  const [queryParams, setQueryParams] = useState(getQueryParams());

  // Whenever the user presses the back button after we've pushed
  // state, update the query params.
  useEffect(function() {
    function handleBackNavigation() {
      setQueryParams(getQueryParams());
    }
    window.addEventListener("popstate", handleBackNavigation);
    return function cleanup() {
      window.removeEventListener("popstate", handleBackNavigation);
    }
  }, []);

  function updateQueryParams(queryParams) {
    const queryString = queryParams ? (new URLSearchParams(queryParams)).toString() : '';
    const newPath = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + queryString;
    window.history.pushState({path: newPath}, '', newPath);
    // Update query params.
    setQueryParams(getQueryParams());
  }

  return (
    <QueryParamsContext.Provider
      value={{queryParams, updateQueryParams}}
    >
      {children}
    </QueryParamsContext.Provider>
  );
}
