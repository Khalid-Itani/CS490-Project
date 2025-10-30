import { render, screen, fireEvent } from '@testing-library/react';
import EducationPage from './EducationPage';

describe('EducationPage', () => {
  it('renders form and validates required fields', () => {
    render(<EducationPage />);
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText(/Please fill all required fields/i)).toBeInTheDocument();
  });

  it('renders education entries and timeline', () => {
    render(<EducationPage />);
    expect(screen.getByText(/Education/i)).toBeInTheDocument();
    expect(screen.getByText(/Timeline/i)).toBeInTheDocument();
  });
});
