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
  
    it('should check availability of a time slot', () => {
      cy.visit('/booking');
      cy.get('input[name=date]').type('2024-06-14');
      cy.get('input[name=startTime]').type('10:30');
      cy.get('input[name=endTime]').type('11:30');
      cy.get('button').contains('Check').click();
      cy.contains('Time slot is available').should('be.visible');
    });
  
    it('should create a new booking', () => {
      cy.visit('/booking');
      cy.get('input[name=title]').type('New Booking');
      cy.get('input[name=date]').type('2024-06-14');
      cy.get('input[name=startTime]').type('12:00');
      cy.get('input[name=endTime]').type('13:00');
      cy.get('textarea[name=description]').type('Test Description');
      cy.get('select[name=attendees]').select(['{"email":"attendee1@example.com"}', '{"email":"attendee2@example.com"}']);
      cy.get('button').contains('Save').click();
      cy.contains('Booking Successful').should('be.visible');
    });
  
    it('should fetch all bookings', () => {
      cy.visit('/dashboard');
      // Assuming there's a button to fetch bookings
      cy.get('button#fetch-bookings').click();
      cy.contains('New Booking').should('be.visible');
    });
  
    it('should delete a booking', () => {
      cy.visit('/dashboard');
      // Assuming bookings are listed and there's a delete button for each
      cy.get('button.delete-booking').first().click();
      cy.contains('Booking deleted successfully').should('be.visible');
    });
  });
  