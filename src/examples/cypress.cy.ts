describe('greenframe scenario', () => {
    it('should visit', () => {
        cy.visit('');
        const element = cy.contains('location');
        element.scrollIntoView();
        element.click();
        cy.visit('');
    });
});
