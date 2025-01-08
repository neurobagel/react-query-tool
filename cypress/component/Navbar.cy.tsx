import Navbar from '../../src/components/Navbar';

const props = {
  isLoggedIn: true,
  onLogin: () => {},
  warnings: ['Warning 1', 'Warning 2', 'Warning n'],
};

describe('Navbar', () => {
  it('Displays a MUI Toolbar with logo, title, subtitle, documentation link, and GitHub link', () => {
    cy.mount(
      <Navbar
        isLoggedIn={props.isLoggedIn}
        onLogin={props.onLogin}
        notifications={props.warnings}
      />
    );
    cy.get("[data-cy='navbar']").should('be.visible');
    cy.get("[data-cy='navbar'] img").should('exist');
    cy.get("[data-cy='navbar'] h5").should('contain', 'Neurobagel Query');
    cy.get("[data-cy='navbar'] p").should(
      'contain',
      'Define and find cohorts at the subject level'
    );
    // Check for the documentation and GitHub icon and links
    cy.get("[data-cy='navbar'] a").eq(0).find('svg').should('be.visible');
    cy.get("[data-cy='navbar'] a")
      .eq(0)
      .should('have.attr', 'href', 'https://neurobagel.org/user_guide/query_tool/');
    cy.get("[data-cy='navbar'] a").eq(1).find('svg').should('be.visible');
    cy.get("[data-cy='navbar'] a")
      .eq(1)
      .should('have.attr', 'href', 'https://github.com/neurobagel/query-tool/');
    // Test for Notification Icon and Badge
    cy.get("[data-cy='navbar'] button").eq(1).find('svg').should('be.visible'); // Check if the notification icon exists
  });
});
