import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // Just check that the app renders without throwing an error
  expect(document.body).toBeInTheDocument();
});
