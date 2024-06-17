describe('User Routes CRUD Operations', () => {
    beforeEach(() => {
      // Use the custom login command
      cy.login('2020e989admin@gmail.com', 'abc123'); // Use appropriate credentials
    });
  
    it('should create a new user', () => {
      cy.visit('/AddUser');
  
      // Fill in the add user form
      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#email').type('john.doe@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Verify user creation success
      cy.url().should('include', '/UserList');
      cy.contains('John Doe');
    });
  
    it('should view an existing user', () => {
      cy.visit('/UserList');
      cy.contains('John Doe').click();
  
      // Verify user details
      cy.url().should('include', '/ViewUser');
      cy.contains('John Doe');
      cy.contains('john.doe@example.com');
    });
  
    it('should edit an existing user', () => {
      cy.visit('/UserList');
      cy.contains('John Doe').click();
      cy.contains('Edit').click();
  
      // Edit user details
      cy.get('#firstName').clear().type('Johnny');
      cy.get('button[type="submit"]').click();
  
      // Verify user edit success
      cy.url().should('include', '/UserList');
      cy.contains('Johnny Doe');
    });
  
    it('should delete an existing user', () => {
      cy.visit('/UserList');
      cy.contains('Johnny Doe').click();
      cy.contains('Delete').click();
  
      // Confirm deletion
      cy.get('button').contains('Yes').click();
  
      // Verify user deletion success
      cy.url().should('include', '/UserList');
      cy.contains('Johnny Doe').should('not.exist');
    });
  });
  