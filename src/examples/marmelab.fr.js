const { cy } = require('cypress');

cy.visit('');
const element = cy.get('TRAVAILLONS ENSEMBLE SUR VOTRE PROCHAIN PROJET !');
element.scrollTo('center');
