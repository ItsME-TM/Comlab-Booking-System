import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';

describe('useForm Hook', () => {
  test('initializes with provided initial values', () => {
    const initialValues = { name: 'John', email: 'john@example.com' };
    const { result } = renderHook(() => useForm(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  test('initializes with empty object when no initial values provided', () => {
    const { result } = renderHook(() => useForm());

    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  test('handleChange updates field value and marks as touched', () => {
    const { result } = renderHook(() => useForm({ name: '', email: '' }));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' },
      });
    });

    expect(result.current.values.name).toBe('John Doe');
    expect(result.current.touched.name).toBe(true);
  });

  test('handleBlur marks field as touched', () => {
    const { result } = renderHook(() => useForm({ name: '' }));

    act(() => {
      result.current.handleBlur({
        target: { name: 'name' },
      });
    });

    expect(result.current.touched.name).toBe(true);
  });

  test('setFieldValue updates specific field', () => {
    const { result } = renderHook(() => useForm({ name: '', email: '' }));

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  test('setFieldError sets error for specific field', () => {
    const { result } = renderHook(() => useForm({ name: '' }));

    act(() => {
      result.current.setFieldError('name', 'Name is required');
    });

    expect(result.current.errors.name).toBe('Name is required');
  });

  test('resetForm resets to initial values', () => {
    const initialValues = { name: 'John', email: 'john@example.com' };
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Jane' },
      });
      result.current.setFieldError('name', 'Error');
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  test('resetForm with new values updates initial values', () => {
    const { result } = renderHook(() => useForm({ name: 'John' }));
    const newValues = { name: 'Jane', email: 'jane@example.com' };

    act(() => {
      result.current.resetForm(newValues);
    });

    expect(result.current.values).toEqual(newValues);
  });

  test('validation function is called when provided', () => {
    const validate = jest.fn(() => ({}));
    const { result } = renderHook(() => useForm({ name: '' }, validate));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      });
    });

    expect(validate).toHaveBeenCalledWith({ name: 'John' });
  });

  test('validation errors are set correctly', () => {
    const validate = values => {
      const errors = {};
      if (!values.name) errors.name = 'Name is required';
      if (!values.email) errors.email = 'Email is required';
      return errors;
    };

    const { result } = renderHook(() =>
      useForm({ name: '', email: '' }, validate),
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: '' },
      });
    });

    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.email).toBe('Email is required');
  });

  test('isValid returns correct validation status', () => {
    const validate = values => {
      const errors = {};
      if (!values.name) errors.name = 'Name is required';
      return errors;
    };

    const { result } = renderHook(() => useForm({ name: '' }, validate));

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.setFieldValue('name', 'John');
    });

    expect(result.current.isValid).toBe(true);
  });

  test('getFieldProps returns correct field properties', () => {
    const { result } = renderHook(() => useForm({ name: 'John' }));

    const fieldProps = result.current.getFieldProps('name');

    expect(fieldProps).toEqual({
      name: 'name',
      value: 'John',
      onChange: result.current.handleChange,
      onBlur: result.current.handleBlur,
    });
  });
});
