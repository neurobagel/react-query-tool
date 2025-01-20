import GetDataDialog from '../../src/components/GetDataDialog';

const props = {
  open: true,
  onClose: () => {},
};

describe('GetDataDialog', () => {
  it('Displays a MUI Diaglog with content', () => {
    cy.mount(<GetDataDialog open={props.open} onClose={props.onClose} />);
    cy.get('[data-cy="get-data-dialog"]').should('be.visible');
    cy.get('[data-cy="get-data-dialog"] p').should(
      'contain',
      'The above command currently only gets data for DataLad datasets'
    );
  });
  it("Doesn't display the dialog when open prop is set to false", () => {
    cy.mount(<GetDataDialog open={false} onClose={props.onClose} />);
    cy.get('[data-cy="get-data-dialog"]').should('not.exist');
  });
  it('Fires onClose event handler when the close button is clicked', () => {
    const onCloseSpy = cy.spy().as('onCloseSpy');
    cy.mount(<GetDataDialog open={props.open} onClose={onCloseSpy} />);
    cy.get('[data-cy="get-data-dialog-close-button"]').click();
    cy.get('@onCloseSpy').should('have.been.called');
  });

  it('Switches between docker and singularity commands', () => {
    cy.mount(<GetDataDialog open={props.open} onClose={props.onClose} />);

    cy.get('button').contains('docker').should('exist');
    cy.get('button').contains('singularity').should('exist');

    cy.get('code').should('contain', 'docker run');

    cy.get('button').contains('singularity').click();
    cy.get('code').should('contain', 'singularity run');

    cy.get('button').contains('docker').click();
    cy.get('code').should('contain', 'docker run');
  });
});
