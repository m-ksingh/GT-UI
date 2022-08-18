import React, { useEffect } from 'react';
import { useFormikContext } from "formik";

const FormikCotext = ({callback = 
    () => {}}) => {
    const { values } = useFormikContext();
    useEffect(() => callback(values), [values]);
  
    return null;
  }

  export default FormikCotext;