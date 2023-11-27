const { cy } = require('cypress');

cy.visit('');
const element = cy.get("LET'S WORK TOGETHER ON YOUR NEXT PROJECT!");
element.scrollTo('center');
