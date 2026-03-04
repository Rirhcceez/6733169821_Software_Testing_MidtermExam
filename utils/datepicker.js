// practiceForm.page.js
import { expect } from '@playwright/test';

export class PracticeFormPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        // Primary locators
        this.dateOfBirthInput = page.locator('#dateOfBirthInput');
        
        // Calendar internals (these only appear after opening the calendar)
        this.monthDropdown = page.locator('.react-datepicker__month-select');
        this.yearDropdown = page.locator('.react-datepicker__year-select');
    }

    /**
     * Navigates to the form
     */
    async goto() {
        await this.page.goto('https://demoqa.com/automation-practice-form');
    }

    /**
     * Completes the full date selection workflow dynamically
     * @param {string} day - The numerical day (e.g., '4')
     * @param {string} monthName - Full month name for the ARIA label (e.g., 'March')
     * @param {string} monthValue - The value attribute for the select (e.g., '2' for March)
     * @param {string} year - The 4-digit year (e.g., '2026')
     */
    async selectDateOfBirth(day, monthName, monthValue, year) {
        // 1. Open the calendar
        await this.dateOfBirthInput.click();
        
        // Explicit Wait: Ensure the calendar dropdowns are visible before interacting
        await expect(this.monthDropdown).toBeVisible();

        // 2. Select the Year and Month
        // Because these specific elements ARE native <select> tags, .selectOption() works perfectly here.
        await this.yearDropdown.selectOption(year);
        await this.monthDropdown.selectOption(monthValue);

        // 3. Handle the dynamically changing ARIA attributes for the day
        // The aria-label looks like: "Choose Wednesday, March 4th, 2026"
        // We use a Regular Expression to ignore the day of the week and match the dynamic suffix (st, nd, rd, th)
        const dynamicAriaRegex = new RegExp(`Choose .*, ${monthName} ${day}(st|nd|rd|th), ${year}`);
        
        // Locate the exact gridcell using the dynamic regex matching the aria-label
        const dayCell = this.page.getByRole('gridcell', { name: dynamicAriaRegex });
        
        // Click the div, do NOT use selectOption
        await dayCell.click();

        // Explicit Wait: Ensure the calendar closes successfully after selection
        await expect(this.monthDropdown).toBeHidden();
    }
}