import {
  mixedResponse,
  partialSuccessMixedResponse,
  failedQueryResponse,
  nodeOptions,
  diagnosisOptions,
  emptyDiagnosisOptions,
  badDiagnosisOptions,
  partiallyFailedDiagnosisToolOptions,
  failedDiagnosisToolOptions,
  assessmentToolOptions,
  emptyAssessmentToolOptions,
  partiallyFailedAssessmentToolOptions,
  failedAssessmentToolOptions,
  pipelineOptions,
  emptyPipelineOPtions,
  partiallyFailedPipelineOptions,
  failedPipelineOptions,
  emptyPipelineVersionOptions,
  partiallyFailedPipelineVersionOptions,
  failedPipelineVersionOptions,
  pipelineVersionOptions,
} from '../fixtures/mocked-responses';

describe('Successful API attribute responses', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');
    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      diagnosisOptions
    ).as('getDiagnosisOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      assessmentToolOptions
    ).as('getAssessmentToolOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      pipelineOptions
    ).as('getPipelineOptions');
    cy.intercept(
      {
        method: 'GET',
        url: 'pipelines/np:fmriprep/versions',
      },
      pipelineVersionOptions
    ).as('getPipelineVersionsOptions');
    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
  });
  it('Loads correctly if all node responses are successful', () => {
    cy.get('.notistack-SnackbarContainer').should('not.exist');
  });
  it('Loads pipeline versions correctly if all node responses are successful', () => {
    cy.get('[data-cy="close-auth-dialog-button"]').click();
    cy.get('[data-cy="Pipeline name-categorical-field"]').type('fmri{downarrow}{enter}');
    cy.wait('@getPipelineVersionsOptions');
    cy.get('[data-cy="Pipeline version-categorical-field"]').type('23.1.3{downarrow}{enter}');
  });
  it('Empty diagnosis response makes info toast appear', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      emptyDiagnosisOptions
    ).as('getDiagnosisOptions');
    cy.visit('/');
    cy.wait('@getDiagnosisOptions');
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiListItem-root')
      .eq(0)
      .within(() => {
        cy.get('.MuiListItemText-primary').should('contain', 'INFO');
        cy.get('p').should('contain.text', 'No diagnoses options were available');
      });
  });
  it('Empty assessment response makes info toast appear', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      emptyAssessmentToolOptions
    ).as('getAssessmentToolOptions');
    cy.visit('/');
    cy.wait('@getAssessmentToolOptions');
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiListItem-root')
      .eq(0)
      .within(() => {
        cy.get('.MuiListItemText-primary').should('contain', 'INFO');
        cy.get('p').should('contain.text', 'No assessments options were available');
      });
  });
  it('Empty pipeline response makes info toast appear', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      emptyPipelineOPtions
    ).as('getPipelineOptions');
    cy.visit('/');
    cy.wait('@getPipelineOptions');
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiListItem-root')
      .eq(0)
      .within(() => {
        cy.get('.MuiListItemText-primary').should('contain', 'INFO');
        cy.get('p').should('contain.text', 'No pipelines options were available');
      });
  });
  it('Empty pipeline version response makes info toast appear', () => {
    cy.intercept(
      {
        method: 'GET',
        url: 'pipelines/np:fmriprep/versions',
      },
      emptyPipelineVersionOptions
    ).as('getPipelineVersionsOptions');
    cy.visit('/');
    cy.get('[data-cy="close-auth-dialog-button"]').click();
    cy.get('[data-cy="Pipeline name-categorical-field"]').type('fmri{downarrow}{enter}');
    cy.wait('@getPipelineVersionsOptions');
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiListItem-root')
      .eq(0)
      .within(() => {
        cy.get('.MuiListItemText-primary').should('contain', 'INFO');
        cy.get('p').should('contain.text', 'No fmriprep versions were available');
      });
  });
});

describe('Partially successful API attribute responses', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');
    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      partiallyFailedDiagnosisToolOptions
    ).as('getDiagnosisOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      partiallyFailedAssessmentToolOptions
    ).as('getAssessmentToolOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      partiallyFailedPipelineOptions
    ).as('getPipelineOptions');
    cy.intercept(
      {
        method: 'GET',
        url: 'pipelines/np:fmriprep/versions',
      },
      partiallyFailedPipelineVersionOptions
    ).as('getPipelineVersionsOptions');
    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
  });
  it('Shows warning for node that failed Assessment tool option request', () => {
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiList-root').should('contain', 'NoAssessmentNode');
  });
  it('Shows warning for node that failed Diagnosis option request', () => {
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiList-root').should('contain', 'NoDiagnosisNode');
  });
  it('Shows warning for node that failed Pipeline option request', () => {
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiList-root').should('contain', 'NoPipelineNode');
  });
  it('Shows warning for node that failed Pipeline version option request', () => {
    cy.get('[data-cy="close-auth-dialog-button"]').click();
    cy.get('[data-cy="Pipeline name-categorical-field"]').type('fmri{downarrow}{enter}');
    cy.wait('@getPipelineVersionsOptions');
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiList-root').should('contain', 'NoPipelineVersionNode');
  });
});

describe('Failed API attribute responses', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');
    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      failedDiagnosisToolOptions
    ).as('getDiagnosisOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      failedAssessmentToolOptions
    ).as('getAssessmentToolOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      failedPipelineOptions
    ).as('getPipelineOptions');
    cy.intercept(
      {
        method: 'GET',
        url: 'pipelines/np:fmriprep/versions',
      },
      failedPipelineVersionOptions
    ).as('getPipelineVersionsOptions');
    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
  });
  it('Shows error toast for failed Assessment tool options', () => {
    cy.get('.notistack-SnackbarContainer')
      .find('.notistack-MuiContent-error')
      .should('contain', 'assessments');
  });
  it('Shows error toast for failed Diagnosis options', () => {
    cy.get('.notistack-SnackbarContainer')
      .find('.notistack-MuiContent-error')
      .should('contain', 'diagnoses');
  });
  it('Shows error toast for failed Pipeline options', () => {
    cy.get('.notistack-SnackbarContainer')
      .find('.notistack-MuiContent-error')
      .should('contain', 'pipelines');
  });
});

// We need to do this separately for the pipeline versions as it requires selecting a pipeline (name)
describe('Failed API attribute responses continued', () => {
  it('Shows error toast for failed Pipeline version options', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');
    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      failedDiagnosisToolOptions
    ).as('getDiagnosisOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      failedAssessmentToolOptions
    ).as('getAssessmentToolOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      pipelineOptions
    ).as('getPipelineOptions');
    cy.intercept(
      {
        method: 'GET',
        url: 'pipelines/np:fmriprep/versions',
      },
      failedPipelineVersionOptions
    ).as('getPipelineVersionsOptions');
    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
    cy.get('[data-cy="close-auth-dialog-button"]').click();
    cy.get('[data-cy="Pipeline name-categorical-field"]').type('fmri{downarrow}{enter}');
    cy.wait('@getPipelineVersionsOptions');
    cy.get('.notistack-SnackbarContainer')
      .find('.notistack-MuiContent-error')
      .should('contain', 'versions');
  });
});

// TODO: maybe refactor query and attribute requests into separate files
describe('Successful API query requests', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: 'query?*',
      },
      mixedResponse
    ).as('call');

    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');

    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      diagnosisOptions
    ).as('getDiagnosisOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      assessmentToolOptions
    ).as('getAssessmentToolOptions');
    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      pipelineOptions
    ).as('getPipelineOptions');
    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
    // TODO: remove this
    // Bit of a hacky way to close the auth dialog
    // But we need to do it until we make auth an always-on feature
    // Because the auth dialog will overlap a lot of the UI and thus fail the tests
    cy.get('[data-cy="close-auth-dialog-button"]').click();
  });
  it('Intercepts the request sent to the API and asserts over the request url', () => {
    cy.get('[data-cy="Minimum age-continuous-field"]').type('10');
    cy.get('[data-cy="Maximum age-continuous-field"]').type('30');
    cy.get('[data-cy="Minimum number of imaging sessions-continuous-field"]').type('2');
    cy.get('[data-cy="Minimum number of phenotypic sessions-continuous-field"]').type('3');
    cy.get('[data-cy="submit-query-button"]').click();
    cy.wait('@call')
      .its('request.url')
      .should('contain', 'min_age=10')
      .and('contain', 'max_age=30')
      .and('contain', 'min_num_imaging_sessions=2')
      .and('contain', 'min_num_phenotypic_sessions=3');
  });
});

// Bad things that should no longer happen
describe('Regression Tests', () => {
  it('App can start if attributes have null values and filters out bad attributes', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');

    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      badDiagnosisOptions
    ).as('getDiagnosisOptions');

    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      assessmentToolOptions
    ).as('getAssessmentToolOptions');

    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      pipelineOptions
    ).as('getPipelineOptions');

    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
    // TODO: remove this
    // Bit of a hacky way to close the auth dialog
    // But we need to do it until we make auth an always-on feature
    // Because the auth dialog will overlap a lot of the UI and thus fail the tests
    cy.get('[data-cy="close-auth-dialog-button"]').click();

    cy.get('[data-cy="Diagnosis-categorical-field"]').type('parkin{downarrow}{enter}');
    cy.get('[data-cy="Diagnosis-categorical-field"] input').should(
      'have.value',
      "Parkinson's disease"
    );
  });
});

describe('Partially successful API query requests', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: 'query?*',
      },
      partialSuccessMixedResponse
    ).as('call');

    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');

    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      diagnosisOptions
    ).as('getDiagnosisOptions');

    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      assessmentToolOptions
    ).as('getAssessmentToolOptions');

    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      pipelineOptions
    ).as('getPipelineOptions');

    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
    // TODO: remove this
    // Bit of a hacky way to close the auth dialog
    // But we need to do it until we make auth an always-on feature
    // Because the auth dialog will overlap a lot of the UI and thus fail the tests
    cy.get('[data-cy="close-auth-dialog-button"]').click();
  });
  it('Shows a warning for nodes that failed to return any results', () => {
    cy.get('[data-cy="submit-query-button"]').click();
    cy.wait('@call');
    cy.get("[data-cy='navbar']").find('svg[data-testid="NotificationsIcon"]').should('exist');
    cy.get("[data-cy='navbar']")
      .find('svg[data-testid="NotificationsIcon"]')
      .click({ force: true });
    cy.get('.MuiList-root').should('contain', 'DidNotWorkNode');
  });
});

describe('Failed API query requests', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: 'query?*',
      },
      failedQueryResponse
    ).as('call');

    cy.intercept(
      {
        method: 'GET',
        url: '/nodes',
      },
      nodeOptions
    ).as('getNodes');

    cy.intercept(
      {
        method: 'GET',
        url: '/diagnoses',
      },
      diagnosisOptions
    ).as('getDiagnosisOptions');

    cy.intercept(
      {
        method: 'GET',
        url: '/assessments',
      },
      assessmentToolOptions
    ).as('getAssessmentToolOptions');

    cy.intercept(
      {
        method: 'GET',
        url: '/pipelines',
      },
      pipelineOptions
    ).as('getPipelineOptions');

    cy.visit('/');
    cy.wait([
      '@getNodes',
      '@getDiagnosisOptions',
      '@getAssessmentToolOptions',
      '@getPipelineOptions',
    ]);
    // TODO: remove this
    // Bit of a hacky way to close the auth dialog
    // But we need to do it until we make auth an always-on feature
    // Because the auth dialog will overlap a lot of the UI and thus fail the tests
    cy.get('[data-cy="close-auth-dialog-button"]').click();
  });
  it('Shows an error toast and does not display results for a completely failed ', () => {
    cy.get('[data-cy="submit-query-button"]').click();
    cy.wait('@call');
    cy.get('.notistack-SnackbarContainer')
      .find('.notistack-MuiContent-error')
      .should('contain', 'Error')
      .and('contain', 'All nodes');
    cy.get('[data-cy="result-container"]')
      .should('contain', 'Query failed')
      .and('contain', 'Please try again');
  });
});
