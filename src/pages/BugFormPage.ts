// src/pages/BugFormPage.ts

import { Page, Locator } from '@playwright/test';

// Type definition for form data
export type FormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  email: string;
  password: string;
  agreeTerms: boolean;
};

export class BugFormPage {
  private readonly page: Page;
  private readonly BASE_URL = 'https://qa-practice.netlify.app/bugs-form'; 

  // --- Locators ---
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly registerButton: Locator;

  // Error/Help Texts
  readonly phoneLabel: Locator;
  readonly phoneHelpText: Locator;
  readonly passwordHelpText: Locator;
  readonly termsCheckboxLabel: Locator;
  
  // Dynamic locator to find the validation error message associated with a field label
  readonly errorMsg = (fieldName: string) => this.page.locator(`text=${fieldName}`).locator('+ div > span');

  constructor(page: Page) {
    this.page = page;
    
    // UI Elements
    this.pageTitle = page.locator('h1', { hasText: 'CHALLENGE – Spot the BUGS!' });
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.termsCheckbox = page.getByRole('checkbox', { name: 'I agree with the terms and conditions' });
    this.termsCheckboxLabel = page.locator('text=I agree with the terms and conditions');
    
    // Inputs
    this.firstNameInput = page.getByPlaceholder('Enter first name');
    this.lastNameInput = page.getByPlaceholder('Enter last name');
    this.phoneInput = page.getByPlaceholder('Enter phone number');
    this.emailInput = page.getByPlaceholder('Enter email');
    this.passwordInput = page.getByPlaceholder('Password');
    
    // Labels & Help Text (Used for bug hunting)
    this.phoneLabel = page.locator('text=Phone number*'); //  used the intended label here
    this.phoneHelpText = page.locator('text=Phone length validation: at least 10 digits');
    this.passwordHelpText = page.locator('text=Psw length validation: [6,20] characters');
  }

  // --- Actions ---

  async navigateToForm() {
    await this.page.goto(this.BASE_URL);
  }

  /**
   * Fills specified fields with data.
   */
  async fillFields(data: Partial<FormData>) {
    if (data.firstName !== undefined) await this.firstNameInput.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastNameInput.fill(data.lastName);
    if (data.phoneNumber !== undefined) await this.phoneInput.fill(data.phoneNumber);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    
    if (data.agreeTerms === true) {
      await this.termsCheckbox.check();
    } else if (data.agreeTerms === false) {
      await this.termsCheckbox.uncheck();
    }
  }

  async clickRegister() {
    await this.registerButton.click();
  }

  // Public getter for the page property
  public getPage(): Page {
    return this.page;
  }

  // Public getter for the BASE_URL property
  public getBaseUrl(): string {
    return this.BASE_URL;
  }
}