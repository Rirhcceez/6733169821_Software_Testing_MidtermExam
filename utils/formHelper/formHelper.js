import { expect } from "@playwright/test";

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
            case 'Address':
                await page.getByRole('textbox', { name: 'Current Address' }).fill('111');
                break;
            case 'State':
                await page.locator('#state > .css-13cymwt-control > .css-hlgwow > .css-19bb58m').click();
                await page.getByRole('option', { name: 'Uttar Pradesh' }).click();
                // await expect(page.locator('#state > .css-13cymwt-control > .css-hlgwow > .css-19bb58m')).toHaveText('Uttar Pradesh');
                break;
            case 'City':
                await page.locator('#city > .css-13cymwt-control > .css-hlgwow > .css-19bb58m').click();
                await page.getByRole('option', { name: 'Lucknow' }).click();
                break;
        }
    }
}