describe('marmelab french scenario', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should display in french', () => {
        cy.visit('');
        const element = cy.contains('TRAVAILLONS ENSEMBLE SUR VOTRE PROCHAIN PROJET !');
        element.scrollIntoView();
    });
});
