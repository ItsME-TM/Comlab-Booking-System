describe('Booking Routes E2E Tests', () => {
    before(() => {
      // Visit the sign-in page and log in
      cy.visit('/signin');
      cy.get('input[name=email]').type('test@example.com');
      cy.get('input[name=password]').type('password123');
      cy.get('button[type=submit]').click();
  
      // Assert successful login by checking redirection to the dashboard
      cy.url().should('include', '/Dashboard');
    });
  
    
      it('should check lab availability', () => {
        cy.visit('/booking');
    
        // Fill in the booking form
        cy.get('#date').type('2024-06-20');
        cy.get('#startTime').type('10:00');
        cy.get('#endTime').type('12:00');
        cy.get('.check-button').click();
    
        // Check the availability message
        cy.get('.availability-message').should('contain', 'Time slot is available');
      });
    
      it('should create a new booking', () => {
        cy.visit('/booking');
    
        // Fill in the booking form
        cy.get('#title').type('New Lab Session');
        cy.get('#date').type('2024-06-20');
        cy.get('#startTime').type('10:00');
        cy.get('#endTime').type('12:00');
        cy.get('#description').type('This is a test booking');
        cy.get('#attendees').select(['user1@example.com', 'user2@example.com']);
        cy.get('.check-button').click();
    
        // Check the availability message
        cy.get('.availability-message').should('contain', 'Time slot is available');
    
        // Save the booking
        cy.get('button[type="submit"]').click();
    
        // Verify the booking success
        cy.on('window:alert', (str) => {
          expect(str).to.equal('Booking Successful');
        });
      });
    });
    