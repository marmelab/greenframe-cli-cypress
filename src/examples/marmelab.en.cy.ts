describe('marmelab english scenario', () => {
    it('should display in english', () => {
        cy.visit('');
        const element = cy.contains("LET'S WORK TOGETHER ON YOUR NEXT PROJECT!");
        element.scrollIntoView();
    });
});
