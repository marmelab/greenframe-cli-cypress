describe('template spec', () => {
    // eslint-disable-next-line jest/expect-expect
    it('passes', () => {
        cy.visit('');
        cy.scrollTo('bottom', { duration: 2000, ensureScrollable: false });
    });
});
