import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows validation errors on empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('shows error for invalid email format', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
    });
  });

  test('calls login and navigates to student dashboard on success', async () => {
    mockLogin.mockResolvedValueOnce({ role: 'student', name: 'Test Student' });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'student@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('student@test.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
    });
  });

  test('calls login and navigates to company dashboard for company role', async () => {
    mockLogin.mockResolvedValueOnce({ role: 'company', name: 'Test Corp' });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'company@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('shows API error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password.' } },
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('renders link to register page', () => {
    renderLogin();
    expect(screen.getByText(/create one/i)).toBeInTheDocument();
  });
});
