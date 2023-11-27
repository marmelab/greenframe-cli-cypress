/* eslint-disable jest/expect-expect */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
describe('template spec', () => {
    it('passes', () => {
        cy.visit('');
        cy.scrollTo('bottom', { duration: 2000, ensureScrollable: false });
    });
});
