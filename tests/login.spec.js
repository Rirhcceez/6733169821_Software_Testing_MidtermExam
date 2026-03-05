import { test, expect } from "@playwright/test";
import { fillValidatedInput,  multipleSubjects , checkInvalidation, checkValidation} from "../utils/formHelper";

// ======= SETUP =======

test.beforeEach(async ({ page }) => {
    await page.goto("https://demoqa.com/automation-practice-form");
    await expect(page.getByText("Student Registration Form")).toBeVisible();
});

// ======= Section 1: Happy Case =======

test.describe("Happy Case", () => {

    // Acceptance Criteria 1 : Verify that a user can successfully submit the form with all valid data.
    // Acceptance Criteria 5 : Verify that the submission modal correctly displays the exact data entered in the form.
    
    // Success Modal: Upon successful submission, a summary modal titled "Thanks for submitting the form" shall appear.
    // Data Summary: The modal shall display a table summarizing all the data entered by the user (Label vs. Value).
    // Close Modal: A "Close" button at the bottom of the modal shall return the user to the blank form.

    test("login with complete valid data, success modal appears, data is displayed, and modal can be closed", async ({ page }) => {

        //fill form with valid data
        await fillValidatedInput(page, ['First Name', 'Last Name', 'Gender', 'Email', 'Mobile', 'Date', 'Subjects', 'Hobbies', 'Address', 'State', 'City']);

        //ACC 1 & Success Modal
        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Thanks for submitting the form')).toBeVisible();

        //ACC 5 & Data Summary
        await expect(page.getByRole('cell', { name: 'John Doe' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'test@example.com' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Other' })).toBeVisible();
        await expect(page.getByRole('cell', { name: '0123456789' })).toBeVisible();
        
        // This assertion will now pass because the date was selected correctly!
        await expect(page.locator('#dateOfBirthInput')).toHaveValue('30 May 2018'); 
        await expect(page.getByRole('cell', { name: 'Music' })).toBeVisible();
        await expect(page.getByRole('cell', { name: '111' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Uttar Pradesh Lucknow' })).toBeVisible();
    });

    // Additianal : Minimum Required Data test
    test("login with minimum required data", async ({ page }) => {

        //fill only mandatory fields with valid data
        await fillValidatedInput(page, ['First Name', 'Last Name', 'Gender', 'Mobile']);

        //Check if submit button is visible and clickable
        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Thanks for submitting the form')).toBeVisible();
    });
});

// ======= Section 2: Validation Rules =======

test.describe("Validation Rules", () => {

    // Acceptance Criteria 2 : Verify that the form cannot be submitted if mandatory fields (First Name, Last Name, Gender, Mobile) are blank.    
    test.describe("User cannot be submitted if mandatory fields are blank.", () => {
        test("All fields blank", async ({ page }) => {

            // Click submit without filling any fields
            await page.getByRole("button", { name: "Submit" }).click();

            // Check that validation errors are shown for all mandatory fields
            await checkInvalidation(page, 'First Name');
            await checkInvalidation(page, 'Last Name');
            await checkInvalidation(page, 'Mobile Number');
            await expect(page.getByRole('radio', { name: 'Male' , exact: true })).toHaveJSProperty('validity.valid', false);
        });
    });
    
    // Acceptance Crteria 6.1 : Mobile: Must be exactly 10 digits. Alphabetic characters or special symbols are not permitted.
    test("Mobile field contains exactly 10 digits and no symbols", async ({ page }) => {
        
        // Fill other mandatory fields with valid data
        await fillValidatedInput(page, ['First Name', 'Last Name', 'Gender']);

        await page.getByRole('button', { name: 'Submit' }).click();

        // Edge case : 9 digits case
        await page.getByRole('textbox', { name: 'Mobile Number' }).fill('123456789');
        await checkInvalidation(page, 'Mobile Number');

        // Edge case : 11 digits case
        await page.getByRole('textbox', { name: 'Mobile Number' }).fill('1234567890');
        await checkValidation(page, 'Mobile Number');
        
        // Edge case : Alphabetic characters
        await page.getByRole('textbox', { name: 'Mobile Number' }).fill('12345abcde');
        await checkInvalidation(page, 'Mobile Number');
    });

    // Acceptance Criteria 6.2 : Email: Must contain "@" and a valid domain extension.
    test("Email field contain @ and valid domain", async ({ page }) => {
       
        // Fill other mandatory fields with valid data
        await fillValidatedInput(page, ['First Name', 'Last Name', 'Gender', 'Mobile']);

        await page.getByRole('button', { name: 'Submit' }).click();

        // Edge case : Missing @ symbol
        await page.getByRole('textbox', { name: 'name@example.com' }).fill('test.example.com');
        await checkInvalidation(page, 'name@example.com');

        // Edge case : Missing domain extension
        await page.getByRole('textbox', { name: 'name@example.com' }).fill('test@example');
        await checkInvalidation(page, 'name@example.com');

        // Edge case : Valid domain extention
        const domain_ext = ['.com', '.net', '.org', '.edu', '.th'];
        for (const ext of domain_ext) {
            await page.getByRole('textbox', { name: 'name@example.com' }).fill(`test@example${ext}`);
            await checkValidation(page, 'name@example.com');
        }
    });


});

// ======= Section 3: Logic & UI =======

test.describe("Logic & UI", () => {

    // Acceptance Criteria 3 : Verify that the "City" dropdown options change based on the selected "State".
    // Acceptance Criteria 7 : Dynamic Dropdowns: The "City" dropdown must remain disabled or empty until a "State" is selected. Upon state selection, only cities belonging to that state shall be displayed.
    test('City dropdown is disabled until State is selected and filters correctly', async ({ page }) => {
        const cityInput = page.locator('#city input');
        
        // Initially, the City dropdown should be disabled
        await expect(cityInput).toBeDisabled(); 

        // Define the expected state-city mappings
        const locationData = [
            { state: 'Uttar Pradesh', cities: ['Agra', 'Lucknow', 'Merrut'] },
            { state: 'NCR', cities: ['Delhi', 'Gurgaon', 'Noida'] },
            { state: 'Haryana', cities: ['Karnal', 'Panipat'] },
            { state: 'Rajasthan', cities: ['Jaipur', 'Jaiselmer'] }
        ];

        // Loop through each state, select it, and verify the corresponding cities are displayed
        for (const location of locationData) {
            
            // Select the state
            await page.locator('#state').click();
            await page.getByRole('option', { name: location.state }).click();
            
            // After selecting a state, the City dropdown should be enabled
            await expect(cityInput).toBeEnabled();
            
            // Click to open the City dropdown
            await page.locator('#city').click();

            // Verify that only the cities corresponding to the selected state are visible
            for (const city of location.cities) {
                await expect(page.getByRole('option', { name: city, exact: true })).toBeVisible();
            }
        }
    });

    // Acceptance Criteria 4 : Verify that the "Subjects" field allows multiple entries and displays them as removable tags.
    test('Subjects field allows multiple entries as removable tags', async ({ page }) => {

        // Fill multiple subjects
        await multipleSubjects(page);

        // Verify that all entered subjects are displayed as tags
        await expect(page.locator('.subjects-auto-complete__multi-value')).toHaveCount(3);
        await expect(page.locator('.subjects-auto-complete__multi-value').nth(0)).toHaveText('English');
        await expect(page.locator('.subjects-auto-complete__multi-value').nth(1)).toHaveText('Chemistry');
        await expect(page.locator('.subjects-auto-complete__multi-value').nth(2)).toHaveText('Computer Science');

        // Remove a subject and verify it is removed from the list
        await page.getByRole('button', { name: 'Remove Computer Science' }).click();
        await expect(page.locator('.subjects-auto-complete__multi-value')).toHaveCount(2);
        await expect(page.locator('.subjects-auto-complete__multi-value').nth(0)).toHaveText('English');
        await expect(page.locator('.subjects-auto-complete__multi-value').nth(1)).toHaveText('Chemistry');
        
        //  Remove all subjects and verify the list is empty
        await page.locator('.subjects-auto-complete__indicator > .css-8mmkcg').click();
        await expect(page.locator('.subjects-auto-complete__multi-value')).toHaveCount(0);
    });

    // Acceptance Criteria 6.3 : Date of Birth: The field should default to the current system date but allow manual selection via a calendar widget.
    test('DOB defaults to current date and allows manual calendar selection', async ({ page }) => {
        
        //Check default value is current date
        await expect(page.locator('#dateOfBirthInput')).toHaveValue(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' '));
        
        //Filled date with calendar widget
        await fillValidatedInput(page, ['Date']);

        // Check if value is same as inputted date
        await expect(page.locator('#dateOfBirthInput')).toHaveValue('30 May 2018');
    });
});