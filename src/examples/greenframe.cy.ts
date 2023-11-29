describe('greenframe scenario', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should visit', () => {
        cy.visit('');
        const element = cy.contains('See a sample');
        element.scrollIntoView();
        element.click();
        cy.visit('');
    });
});
