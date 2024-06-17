describe('Authentication Tests', () => {
    it('should sign up a new user', () => {
      cy.visit('/signup');
  
      // Fill in the signup form
      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#email').type('john.doe@eng.jfn.ac.lk');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Verify signup success
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome, John');
    });
  
    it('should sign in an existing user', () => {
      cy.visit('/signin');
  
      // Fill in the signin form
      cy.get('#email').type('john.doe@eng.jfn.ac.lk');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Verify signin success
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome, John');
    });
  
    it('should display error message for invalid credentials', () => {
      cy.visit('/signin');
  
      // Fill in the signin form with invalid credentials
      cy.get('#email').type('invalid@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
  
      // Verify error message
      cy.get('.error-message-login').should('contain', 'Incorrect password');
    });
  });
  