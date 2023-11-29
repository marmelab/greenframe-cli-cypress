describe('marmelab english scenario', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should display in english', () => {
        cy.visit('');
        const element = cy.contains("LET'S WORK TOGETHER ON YOUR NEXT PROJECT!");
        element.scrollIntoView();
    });
});
