describe('greenframe scenario', () => {
    it('should visit', () => {
        cy.visit('');
        const element = cy.contains('See a sample');
        element.scrollIntoView();
        element.click();
        cy.visit('');
    });
});
