Cypress.Commands.add('login', (email, password) => {
  cy.visit('/signin');
  cy.get('#email').should('be.visible').type(email);
  cy.get('#password').should('be.visible').type(password);
  cy.get('button[type="submit"]').should('be.visible').click();
  cy.url().should('include', '/Dashboard'); // Adjust according to your redirect URL after login
});
