import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OnboardingForm } from "./onboarding-form";

const mockedFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockedFetch;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("OnboardingForm", () => {
  it("renders input fields and a submit button", () => {
    render(<OnboardingForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/corporation number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("submits the form with valid data", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "OK",
    });

    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "+12345678901" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "https://fe-hometask-api.dev.vault.tryvault.com/profile-details",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            firstName: "First",
            lastName: "Last",
            phone: "+12345678901",
            corporationNumber: "123456789",
          }),
        })
      );
    });

    const mockResponse = mockedFetch.mock.results[0].value;
    const response = await mockResponse;
    expect(response.ok).toBe(true);
    const responseText = await response.text();
    expect(responseText).toBe("OK");
  });

  it("validates form input and prevents submission with invalid data", async () => {
    render(<OnboardingForm />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(fetch).toHaveBeenCalledTimes(0);
    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        /must be at least 1 character/i
      );
      expect(errorMessages.length).toBe(2);
      expect(
        screen.getByText(/must start with \+1 and contain exactly 10 digits/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/must be 9 characters/i)).toBeInTheDocument();
    });
  });

  it("displays error message for invalid phone number format", async () => {
    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "1234567890" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/must start with \+1 and contain exactly 10 digits/i)
      ).toBeInTheDocument();
    });
  });

  it("displays error message for invalid corporation number length", async () => {
    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "+12345678901" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be 9 characters/i)).toBeInTheDocument();
    });
  });

  it("validates corporation number with async request", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Invalid Corporation Number" }),
    });

    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "+12345678901" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "123456789" },
    });

    fireEvent.blur(screen.getByLabelText(/corporation number/i));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid corporation number/i)
      ).toBeInTheDocument();
    });
  });

  it("resets the form after successful submission", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "OK",
    });

    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "+13064817263" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);

      expect(
        (screen.getByLabelText(/first name/i) as HTMLInputElement).value
      ).toBe("");
      expect(
        (screen.getByLabelText(/last name/i) as HTMLInputElement).value
      ).toBe("");
      expect(
        (screen.getByLabelText(/phone number/i) as HTMLInputElement).value
      ).toBe("");
      expect(
        (screen.getByLabelText(/corporation number/i) as HTMLInputElement).value
      ).toBe("");
    });
  });

  it("displays an error message when the phone number is invalid", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: "Invalid phone number",
      }),
    });

    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "+11111112345" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "123456789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);

      expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    });

    const mockResponse = mockedFetch.mock.results[0].value;
    const response = await mockResponse;
    const json = await response.json();
    expect(json.message).toBe("Invalid phone number");
  });

  it("displays an error message when the corporation number is invalid", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: "Invalid corporation number",
      }),
    });

    render(<OnboardingForm />);

    fireEvent.input(screen.getByLabelText(/first name/i), {
      target: { value: "First" },
    });
    fireEvent.input(screen.getByLabelText(/last name/i), {
      target: { value: "Last" },
    });
    fireEvent.input(screen.getByLabelText(/phone number/i), {
      target: { value: "+12345678901" },
    });
    fireEvent.input(screen.getByLabelText(/corporation number/i), {
      target: { value: "123456788" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/invalid corporation number/i)
      ).toBeInTheDocument();
    });

    const mockResponse = mockedFetch.mock.results[0].value;
    const response = await mockResponse;
    const json = await response.json();
    expect(json.message).toBe("Invalid corporation number");
  });
});
