import { useState, useCallback } from 'react';

/**
 * Custom hook for form state management and validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validationSchema - Validation function
 * @returns {Object} - Form state and handlers
 */
export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    (name, value) => {
      setValues(prev => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors],
  );

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  const handleChange = useCallback(
    e => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;
      setValue(name, fieldValue);
    },
    [setValue],
  );

  const handleBlur = useCallback(
    e => {
      const { name } = e.target;
      setFieldTouched(name, true);

      // Validate field on blur if validation schema exists
      if (validationSchema) {
        try {
          validationSchema({ [name]: values[name] });
          setErrors(prev => ({ ...prev, [name]: null }));
        } catch (error) {
          if (error.errors && error.errors[name]) {
            setErrors(prev => ({ ...prev, [name]: error.errors[name] }));
          }
        }
      }
    },
    [validationSchema, values, setFieldTouched],
  );

  const validate = useCallback(() => {
    if (!validationSchema) return true;

    try {
      validationSchema(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
      return false;
    }
  }, [validationSchema, values]);

  const handleSubmit = useCallback(
    onSubmit => {
      return async e => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        // Mark all fields as touched
        const touchedFields = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setTouched(touchedFields);

        // Validate form
        const isValid = validate();

        if (isValid) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error('Form submission error:', error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validate],
  );

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues],
  );

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).some(key => errors[key]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setFieldTouched,
    setFieldError,
    validate,
    reset,
  };
};
