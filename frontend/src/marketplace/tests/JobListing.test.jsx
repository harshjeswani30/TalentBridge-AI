import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobListing from '../pages/JobListing';
import axiosInstance from '../api/axiosInstance';

// Mock axiosInstance
jest.mock('../api/axiosInstance');

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, profile: null }),
}));

const mockJobs = [
  {
    _id: 'job1',
    title: 'React Developer',
    description: 'Build React apps',
    location: 'Remote',
    jobType: 'full-time',
    requiredSkills: ['react', 'javascript'],
    company: { _id: 'c1', companyName: 'TechCorp', location: 'Remote' },
    salary: { min: 40000, max: 80000 },
    createdAt: '2026-05-27T00:00:00.000Z'
  },
  {
    _id: 'job2',
    title: 'Python Engineer',
    description: 'Build Python APIs',
    location: 'New York',
    jobType: 'full-time',
    requiredSkills: ['python', 'django'],
    company: { _id: 'c2', companyName: 'DataCorp', location: 'New York' },
    salary: { min: 50000, max: 90000 },
    createdAt: '2026-05-27T00:00:00.000Z'
  },
];

beforeEach(() => {
  axiosInstance.get.mockResolvedValue({
    data: { jobs: mockJobs },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('JobListing Page', () => {
  test('renders job cards after loading', async () => {
    render(<MemoryRouter><JobListing /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('React Developer')[0]).toBeInTheDocument();
      expect(screen.getByText('Python Engineer')).toBeInTheDocument();
    });
  });

  test('shows total job count in subtitle', async () => {
    render(<MemoryRouter><JobListing /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Open Roles/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2\)/i)).toBeInTheDocument();
    });
  });

  test('renders search input', async () => {
    render(<MemoryRouter><JobListing /></MemoryRouter>);
    await waitFor(() => screen.getByPlaceholderText(/search/i));
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  test('shows empty state when no jobs returned', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: { jobs: [] },
    });
    render(<MemoryRouter><JobListing /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/no roles found/i)).toBeInTheDocument();
    });
  });

  test('client side search filters jobs successfully', async () => {
    render(<MemoryRouter><JobListing /></MemoryRouter>);
    await waitFor(() => screen.getByPlaceholderText(/search/i));

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'React' },
    });

    await waitFor(() => {
      expect(screen.getAllByText('React Developer')[0]).toBeInTheDocument();
      expect(screen.queryByText('Python Engineer')).not.toBeInTheDocument();
    });
  });
});
