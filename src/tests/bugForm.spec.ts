// src/tests/bugForm.spec.ts

import { test, expect } from '@playwright/test';
import { BugFormPage } from '../pages/BugFormPage';
import { VALID_USER, INVALID_USER } from '../data/testData';

test.describe('Datacom QA Challenge: Form Validation & Bug Hunting', () => {
    let formPage: BugFormPage;

    test.beforeEach(async ({ page }) => {
        formPage = new BugFormPage(page);
        await formPage.navigateToForm();
    });

    // --- POSITIVE CASES (End-User Validation) ---

    test('T1. Successful registration with valid data)', async () => {
        // T1: Valid values in all fields
        const validData = { ...VALID_USER }; // All fields are filled with valid data
        await formPage.fillFields(validData);

        // Assert button is clickable 
        await expect(formPage.registerButton).toBeEnabled();

        await formPage.clickRegister();

        // **ASSUMPTION:** The page displays a success message upon registration.
        await expect(formPage.getPage().locator('text=SUCCESSFULLY SUBMITTED')).toBeVisible({ timeout: 5000 });

        // Print a success message to the terminal
        console.log('User registered successfully!');
    });
    
    // --- NEGATIVE CASES Validation Failures ---
    
    test('T2. Registration fails when required fields are empty', async () => {
        // Fill with empty/missing required data and uncheck the terms
        await formPage.fillFields(INVALID_USER.requiredMissing); 
        
        // Assert Register button is disabled (or should be, based on form rules)
        await expect(formPage.registerButton).toBeDisabled();
        
        // Click and assert error messages appear for the mandatory fields.
        // NOTE: We must use the *actual* label text on the page for locators.
        await formPage.clickRegister(); 

        await expect(formPage.errorMsg('Last Name*')).toBeVisible(); 
        await expect(formPage.errorMsg('Phone number*')).toBeVisible(); 
        await expect(formPage.errorMsg('Email address*')).toBeVisible();
        await expect(formPage.errorMsg('Password*')).toBeVisible();
        await expect(formPage.termsCheckboxLabel.locator('+ span')).toBeVisible(); // Check error for terms

        // Assert the page URL did not change (no successful submission)
        await expect(formPage.getPage()).toHaveURL(formPage.getBaseUrl()); 
    });

    test('T3. Registration fails with invalid email format ', async () => {
        await formPage.fillFields(INVALID_USER.badEmail);
        await formPage.termsCheckbox.check(); // Check terms to isolate email error
        await formPage.clickRegister();

        const emailErrorText = await formPage.errorMsg('Email address*').textContent();
        expect(emailErrorText).toContain('valid email address');
    });

    // --- BUSINESS LOGIC BUGS ---

    test('T4. BUSINESS LOGIC BUG: Registration fails if First Name is missing', async () => {
        // Scenario: Fill all REQUIRED fields (Last Name, Phone, Email, Password, Terms) 
        // but leave First Name empty, asserting that submission FAILS.
        
        // 1. Prepare data: All mandatory fields are valid; First Name is empty.
        const missingFirstName = { ...VALID_USER, firstName: '' }; 
        
        // 2. Fill the form
        await formPage.fillFields(missingFirstName);
        
        // 3. Click Register
        await formPage.clickRegister();

        // 4. Assert the submission fails and a First Name error is visible.
        // NOTE: We locate the error message using the 'First Name' label.
        await expect(formPage.errorMsg('First Name*')).toBeVisible(); 
        
        // 5. Assert the page URL did not change (no successful submission)
        await expect(formPage.getPage()).toHaveURL(formPage.getBaseUrl()); 
    });

    // --- BUG TEST CASES ---

    test('T5. BUG: Validate Last Name help text content and placement', async () => {
        const lastNameHelpText = formPage.getPage().locator('text=Note: All the fields marked with * are mandatory');
        
        // Assert 1: Text is present (Bug Check)
        await expect(lastNameHelpText).toBeVisible(); 
        
        // Assert 2: Text is irrelevant to the Last Name field itself 
        // This is a discussion point for the README.
        expect(await lastNameHelpText.textContent()).not.toContain('Last Name');
    });

    // Phone Label Spelling Error
    test('T6. BUG: Phone number label has a spelling mistake ', async () => {
        // We assert against the expected CORRECT spelling "number" (This test is designed to FAIL)
        const phoneLabelText = await formPage.phoneLabel.textContent();
        expect(phoneLabelText).toContain('number'); // Fails because actual text is 'nunber'
    });

    //  Unfriendly/Grammatical Help Text
    test('T7. BUG: Phone/Password help texts are not user-friendly', async () => {
        // Phone: "Phone length validation: at least 10 digits" 
        await expect(formPage.phoneHelpText).toContainText('validation'); // Flagging the technical language
        
        // Password: "Psw length validation: [6,20] characters"
        await expect(formPage.passwordHelpText).toContainText('Psw'); // Flagging abbreviation
    });

    // Password Visibility Defect
    test('T8. BUG: Password field is NOT masked ', async () => {
        // Assert the input type is 'password' for security
        const inputType = await formPage.passwordInput.getAttribute('type');
        expect(inputType).toBe('password'); // Expected to FAIL if actual type is 'text'
    });

    //  Checkbox clickability and initial state
    test('T9. BUG/VALIDATION: Terms checkbox is correctly interactable ', async () => {
        // Use valid data to ensure the checkbox is enabled
        await formPage.fillFields(VALID_USER);

        // Assert the checkbox is enabled
        await expect(formPage.termsCheckbox).toBeEnabled();

        // Uncheck and check the checkbox
        await formPage.termsCheckbox.uncheck();
        await expect(formPage.termsCheckbox).not.toBeChecked();

        await formPage.termsCheckbox.check();
        await expect(formPage.termsCheckbox).toBeChecked();

        // Assert the Register button state depends on the checkbox
        await formPage.termsCheckbox.uncheck();
        await expect(formPage.registerButton).toBeDisabled();

        await formPage.termsCheckbox.check();
        await expect(formPage.registerButton).toBeEnabled();
    });

    // New test for First Name mandatory check
    test('T10. UI BUG: First Name field is mandatory but missing the asterisk UI indicator', async () => {
        // Assert 1: Confirm the First Name label does NOT contain the mandatory indicator (*).
        const firstNameLabel = formPage.getPage().locator('text=First Name');
        expect(await firstNameLabel.textContent()).not.toContain('*');
        
        // Assert 2: (Hypothetically) Check for a mandatory class or attribute if it were known.
        // For this challenge, the missing asterisk is the primary UI defect.
    });

    // Edge Case: Phone Number Boundary Check (Below minimum)
    test('T11. EDGE: Phone number 9 digits fails validation', async () => {
        await formPage.fillFields(INVALID_USER.shortPhone);
        await formPage.clickRegister();
        await expect(formPage.errorMsg('Phone number*')).toBeVisible();
    });

    // Edge Case: Password Boundary Check (Above maximum)
    test('T12. EDGE: Password 21 characters fails validation', async () => {
        await formPage.fillFields(INVALID_USER.longPassword);
        await formPage.clickRegister();
        await expect(formPage.errorMsg('Password*')).toBeVisible();
    });



    test('T13. Terms and Conditions checkbox links to the terms page', async () => {
        // Locate the terms and conditions link
        const termsLink = formPage.getPage().locator('a', { hasText: 'terms and conditions' });

        // Assert the link is visible and has a valid href attribute
        await expect(termsLink).toBeVisible();
        const href = await termsLink.getAttribute('href');
        expect(href).toBeTruthy(); // Ensure the link has a valid URL

        // Simulate clicking the link and navigating to the terms page
        await termsLink.click();
        await expect(formPage.getPage()).toHaveURL(/terms/); // Assuming the URL contains 'terms'

        // User reads the terms and navigates back to the form
        await formPage.getPage().goBack();
        await formPage.termsCheckbox.check(); // Check the terms checkbox
        await expect(formPage.termsCheckbox).toBeChecked();
    });

    test('T14. Phone number error message is appropriate', async () => {
        // Prepare invalid phone number data
        const invalidPhoneData = { ...VALID_USER, phoneNumber: '12345abc' }; // Invalid phone number

        // Fill the form with invalid phone number
        await formPage.fillFields(invalidPhoneData);
        await formPage.clickRegister();

        // Assert the error message is appropriate
        const phoneErrorText = await formPage.errorMsg('Phone number*').textContent();
        expect(phoneErrorText).toBe('Phone number should contain at least 10 digits');
    });
});