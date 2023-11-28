describe('marmelab french scenario', () => {
    it('should display in french', () => {
        cy.visit('');
        const element = cy.contains('TRAVAILLONS ENSEMBLE SUR VOTRE PROCHAIN PROJET !');
        element.scrollIntoView();
    });
});
