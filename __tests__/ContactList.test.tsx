import { render, screen } from "@testing-library/react";
import ContactList from "@/components/ContactList";
import { Contact } from "@prisma/client";

const mockContact = (overrides?: Partial<Contact>): Contact => ({
  id: "contact-1",
  applicationId: "app-1",
  name: "Jane Smith",
  role: "Hiring Manager",
  email: "jane@acme.com",
  phone: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("ContactList", () => {
  it("shows empty state when no contacts", () => {
    render(<ContactList contacts={[]} />);
    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
  });

  it("renders contact name and role", () => {
    render(<ContactList contacts={[mockContact()]} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Hiring Manager")).toBeInTheDocument();
  });

  it("renders contact email as mailto link", () => {
    render(<ContactList contacts={[mockContact()]} />);
    expect(screen.getByText("jane@acme.com")).toBeInTheDocument();
  });
});
