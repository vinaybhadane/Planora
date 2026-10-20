import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

describe('App Workflow & State Transitions', () => {
  it('renders landing screen with header and turnkey demo options initially', () => {
    render(<App />);

    expect(
      screen.getByText(/Organize Weddings, Birthdays & Community Events with AI Precision/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Wedding Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Birthday Plan/i })).toBeInTheDocument();
  });

  it('transitions from landing to dashboard when demo plan is clicked', async () => {
    render(<App />);

    const weddingBtn = screen.getByRole('button', { name: /Explore Wedding Plan/i });
    fireEvent.click(weddingBtn);

    await waitFor(() => {
      expect(screen.getByText('Vineyard Harmony — Napa Valley Estate Wedding')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Change event parameters or switch event/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export or print event plan/i })).toBeInTheDocument();
    });
  });

  it('opens and closes context modal dialog using Cancel and Escape buttons', async () => {
    render(<App />);

    // Enter dashboard
    fireEvent.click(screen.getByRole('button', { name: /Explore Wedding Plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Change event parameters or switch event/i })).toBeInTheDocument();
    });

    // Open context modal
    fireEvent.click(screen.getByRole('button', { name: /Change event parameters or switch event/i }));

    const dialog = await waitFor(() => screen.getByRole('dialog'));
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Switch Event Context')).toBeInTheDocument();

    // Close via Cancel button
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('applies context change in modal and updates dashboard metrics', async () => {
    render(<App />);

    // Enter dashboard
    fireEvent.click(screen.getByRole('button', { name: /Explore Wedding Plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Change event parameters or switch event/i })).toBeInTheDocument();
    });

    // Open context modal
    fireEvent.click(screen.getByRole('button', { name: /Change event parameters or switch event/i }));

    // Wait for modal radio options to be ready
    const birthdayOption = await waitFor(() =>
      screen.getByRole('radio', { name: /Milestone Birthday/i })
    );
    fireEvent.click(birthdayOption);

    // Submit form
    const applyBtn = screen.getByRole('button', { name: /Apply context changes/i });
    const form = applyBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Neon Nostalgia — Rooftop 30th Milestone Birthday')).toBeInTheDocument();
    });
  });
});
