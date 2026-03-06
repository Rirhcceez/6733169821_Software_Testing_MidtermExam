import { expect } from "@playwright/test";
import path from 'path';

export async function fillValidatedInput(page, labels) {
    for (const label of labels) {
        switch (label) {
            case 'First Name':
                await page.getByRole('textbox', { name: 'First Name' }).fill('John');
                break;
            case 'Last Name':
                await page.getByRole('textbox', { name: 'Last Name' }).fill('Doe');
                break;
            case 'Gender':
                await page.getByRole('radio', { name: 'Other' }).check();
                break;
            case 'Email':
                await page.getByRole('textbox', { name: 'name@example.com' }).fill('test@example.com');
                break;
            case 'Mobile':
                await page.getByRole('textbox', { name: 'Mobile Number' }).fill('0123456789');
                break;
            case 'Date':
                await page.locator('#dateOfBirthInput').click();
                await page.locator('.react-datepicker__year-select').selectOption('2018');
                await page.locator('.react-datepicker__month-select').selectOption('4');
                await page.getByRole('gridcell', { name: /May 30th, 2018/i }).click();
                break;
            case 'Subjects':
                await page.locator('#subjectsInput').fill('e');
                await page.getByRole('option', { name: 'English' }).click();
                break;
            case 'Hobbies':
                await page.locator('div').filter({ hasText: /^Music$/ }).click();
                break;
            case 'Picture':
                const imagePath = path.join(__dirname, '../test-data/test-image.jpg'); 
                await page.locator('#uploadPicture').setInputFiles(imagePath);
                break;
            case 'Address':
                await page.getByRole('textbox', { name: 'Current Address' }).fill('111');
                break;
            case 'State':
                await page.locator('#state').click();
                await page.getByRole('option', { name: 'Uttar Pradesh' }).click();
                break;
            case 'City':
                await page.locator('#city').click();
                await page.getByRole('option', { name: 'Lucknow' }).click();
                break;
        }
    }
}

export async function multipleSubjects(page) {
    await page.locator('#subjectsInput').fill('e');
    await page.getByRole('option', { name: 'English' }).click();
    await page.locator('#subjectsInput').fill('e');
    await page.getByRole('option', { name: 'Chemistry' }).click();
    await page.locator('#subjectsInput').fill('e');
    await page.getByRole('option', { name: 'Computer Science' }).click();
}

export async function checkInvalidation(page, fieldName) {
    await expect(page.getByRole('textbox', { name: fieldName })).toHaveJSProperty('validity.valid', false);
}

export async function checkValidation(page, fieldName) {
    await expect(page.getByRole('textbox', { name: fieldName })).toHaveJSProperty('validity.valid', true);
}