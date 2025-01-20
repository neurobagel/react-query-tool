import Navbar from '../../src/components/Navbar';
import { Notification } from '../../src/utils/types';

const mockNotifications: Notification[] = [
  { id: 1, type: 'info', message: 'This is an info notification.' },
  { id: 2, type: 'warning', message: 'This is a warning notification.' },
];

const props = {
  isLoggedIn: true,
  onLogin: () => {},
  notifications: mockNotifications,
  setNotifications: () => {},
};

describe('Navbar', () => {
  it('Displays a MUI Toolbar with logo, title, subtitle, documentation link, and GitHub link', () => {
    cy.mount(
      <Navbar
        isLoggedIn={props.isLoggedIn}
        onLogin={props.onLogin}
        notifications={props.notifications}
        setNotifications={props.setNotifications}
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
    // Verify the visibility and functionality of the Navbar notifications feature
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('.MuiBadge-badge')
      .should('contain', props.notifications.length);
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').click();
    cy.get('.MuiPopover-paper').should('be.visible');
    cy.get('.MuiList-root').within(() => {
      cy.get('.MuiListItem-root').should('have.length', props.notifications.length);
      props.notifications.forEach((notification, index) => {
        cy.get('.MuiListItem-root')
          .eq(index)
          .within(() => {
            cy.get('.MuiListItemText-primary').should('contain', notification.type.toUpperCase());
            cy.get('.MuiListItemText-secondary').should('contain', notification.message);
          });
      });
    });
    cy.get('.MuiPopover-paper').trigger('keydown', { key: 'Escape' });
    cy.get('.MuiPopover-paper').should('not.exist');
  });
});
