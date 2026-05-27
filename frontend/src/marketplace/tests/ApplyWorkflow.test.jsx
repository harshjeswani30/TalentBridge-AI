import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ApplyForm from '../pages/ApplyForm';
import axiosInstance from '../api/axiosInstance';

jest.mock('../api/axiosInstance');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ jobId: 'job123' }),
}));

const mockJob = {
  _id: 'job123',
  title: 'Senior React Developer',
  description: 'Build amazing React apps',
  location: 'Remote',
  jobType: 'full-time',
  company: { companyName: 'TechCorp', location: 'Remote' },
};

describe('Apply Workflow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: mockJob });
  });

  test('renders apply form with job details loaded', async () => {
    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    });
    expect(screen.getByText(/TechCorp/)).toBeInTheDocument();
  });

  test('renders cover letter textarea', async () => {
    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    });
  });

  test('renders submit button', async () => {
    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
    });
  });

  test('updates character count as user types in cover letter', async () => {
    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => screen.getByLabelText(/cover letter/i));

    const textarea = screen.getByLabelText(/cover letter/i);
    fireEvent.change(textarea, { target: { value: 'Hello World' } });

    expect(screen.getByText(/11 \/ 2000/i)).toBeInTheDocument();
  });

  test('submits application and shows success state', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { _id: 'app1', status: 'pending' } });

    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => screen.getByLabelText(/cover letter/i));

    const textarea = screen.getByLabelText(/cover letter/i);
    fireEvent.change(textarea, { target: { value: 'I am excited to apply!' } });

    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/applications', {
        jobId: 'job123',
        coverLetter: 'I am excited to apply!',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/application submitted/i)).toBeInTheDocument();
    });
  });

  test('shows error message on API failure', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: 'You have already applied for this job.' } },
    });

    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => screen.getByRole('button', { name: /submit application/i }));

    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(screen.getByText(/already applied/i)).toBeInTheDocument();
    });
  });

  test('renders back link to job detail page', async () => {
    render(<MemoryRouter><ApplyForm /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/back to job/i)).toBeInTheDocument();
    });
  });
});
