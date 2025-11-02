import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

describe('Sample Test', () => {
  it('renders a simple text', () => {
    render(<div>Hello, test!</div>);
    expect(screen.getByText('Hello, test!')).toBeInTheDocument();
  });
});
