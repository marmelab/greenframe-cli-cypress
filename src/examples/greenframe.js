const { cy } = require('cypress');

cy.visit('');
const element = cy.get('Try it for free');
element.scrollTo('center');
element.click();
cy.visit('');
