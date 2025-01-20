import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { Alert, Grow, IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarKey, SnackbarProvider, closeSnackbar, enqueueSnackbar } from 'notistack';
import { useAuth0 } from '@auth0/auth0-react';
import { queryURL, baseAPIURL, nodesURL, enableAuth, enableChatbot } from './utils/constants';
import {
  RetrievedAttributeOption,
  AttributeOption,
  RetrievedPipelineVersions,
  NodeOption,
  FieldInput,
  FieldInputOption,
  Pipelines,
  NodeError,
  QueryResponse,
  Notification,
} from './utils/types';
import QueryForm from './components/QueryForm';
import ResultContainer from './components/ResultContainer';
import Navbar from './components/Navbar';
import AuthDialog from './components/AuthDialog';
import ChatbotFeature from './components/Chatbot';
import SmallScreenSizeDialog from './components/SmallScreenSizeDialog';
import './App.css';
import logo from './assets/logo.png';

function App() {
  // Screen is considered small if the width is less than 768px (according to tailwind docs)
  const [isScreenSizeSmall, setIsScreenSizeSmall] = useState<boolean>(
    useMediaQuery('(max-width: 767px)')
  );
  const [diagnosisOptions, setDiagnosisOptions] = useState<AttributeOption[]>([]);
  const [assessmentOptions, setAssessmentOptions] = useState<AttributeOption[]>([]);
  const [availableNodes, setAvailableNodes] = useState<NodeOption[]>([
    { NodeName: 'All', ApiURL: 'allNodes' },
  ]);
  const [pipelines, setPipelines] = useState<Pipelines>({});

  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [result, setResult] = useState<QueryResponse | null>(null);

  const [minAge, setMinAge] = useState<number | null>(null);
  const [maxAge, setMaxAge] = useState<number | null>(null);
  const [sex, setSex] = useState<FieldInput>(null);
  const [diagnosis, setDiagnosis] = useState<FieldInput>(null);
  const [isControl, setIsControl] = useState<boolean>(false);
  const [minNumImagingSessions, setMinNumSessions] = useState<number | null>(null);
  const [minNumPhenotypicSessions, setMinNumPhenotypicSessions] = useState<number | null>(null);
  const [assessmentTool, setAssessmentTool] = useState<FieldInput>(null);
  const [imagingModality, setImagingModality] = useState<FieldInput>(null);
  const [pipelineVersion, setPipelineVersion] = useState<FieldInput>(null);
  const [pipelineName, setPipelineName] = useState<FieldInput>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [IDToken, setIDToken] = useState<string | undefined>('');
  const { isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Extract the raw OIDC ID token from the Auth0 SDK
  useEffect(() => {
    if (enableAuth && !isLoading) {
      if (isAuthenticated) {
        (async () => {
          const tokenClaims = await getIdTokenClaims();
          // eslint-disable-next-line no-underscore-dangle
          setIDToken(tokenClaims?.__raw);
        })();
        setOpenAuthDialog(false);
      }
      if (!isAuthenticated) {
        setOpenAuthDialog(true);
      } else {
        setOpenAuthDialog(false);
      }
    }
  }, [isAuthenticated, isLoading, getIdTokenClaims]);

  const selectedNode: FieldInputOption[] = availableNodes
    .filter((option) => searchParams.getAll('node').includes(option.NodeName))
    .map((filteredOption) => ({ label: filteredOption.NodeName, id: filteredOption.ApiURL }));

  const sortedResults: QueryResponse | null = result
    ? {
        ...result,
        responses: result.responses.sort((a, b) => a.dataset_name.localeCompare(b.dataset_name)),
      }
    : null;

  const action = (snackbarId: SnackbarKey) => (
    <IconButton
      onClick={() => {
        closeSnackbar(snackbarId);
      }}
    >
      <CloseIcon className="text-white" />
    </IconButton>
  );

  useEffect(() => {
    async function getAttributes(NBResource: string, dataElementURI: string) {
      try {
        const response: AxiosResponse<RetrievedAttributeOption> = await axios.get(
          `${baseAPIURL}${NBResource}/`
        );
        if (response.data.nodes_response_status === 'fail') {
          enqueueSnackbar(`Failed to retrieve ${NBResource} options`, {
            variant: 'error',
            action,
          });
        } else {
          // If any errors occurred, report them
          response.data.errors.forEach((error) => {
            setNotifications((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: 'warning',
                message: `Failed to retrieve ${NBResource} options from ${error.node_name}`,
              },
            ]);
          });
          // If the results are empty, report that
          if (Object.keys(response.data.responses[dataElementURI]).length === 0) {
            setNotifications((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: 'info',
                message: `No ${NBResource} options were available`,
              },
            ]);
            // TODO: remove the second condition once pipeline labels are added
          } else if (
            response.data.responses[dataElementURI].some((item) => item.Label === null) &&
            NBResource !== 'pipelines'
          ) {
            setNotifications((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: 'warning',
                message: `Warning: Missing labels were removed for ${NBResource}`,
              },
            ]);
            response.data.responses[dataElementURI] = response.data.responses[
              dataElementURI
            ].filter((item) => item.Label !== null);
          }
        }
        return response.data.responses[dataElementURI];
      } catch {
        return null;
      }
    }

    getAttributes('diagnoses', 'nb:Diagnosis').then((diagnosisResponse) => {
      if (diagnosisResponse !== null && diagnosisResponse.length !== 0) {
        setDiagnosisOptions(diagnosisResponse);
      }
    });

    getAttributes('assessments', 'nb:Assessment').then((assessmentResponse) => {
      if (assessmentResponse !== null && assessmentResponse.length !== 0) {
        setAssessmentOptions(assessmentResponse);
      }
    });

    getAttributes('pipelines', 'nb:Pipeline').then((pipelineResponse) => {
      if (pipelineResponse !== null && pipelineResponse.length !== 0) {
        pipelineResponse.forEach((option) => {
          setPipelines((prevPipelines) => ({ ...prevPipelines, [option.TermURL]: [] }));
        });
      }
    });

    async function getNodeOptions(fetchURL: string) {
      try {
        const response: AxiosResponse<NodeOption[]> = await axios.get(fetchURL);
        return response.data;
      } catch {
        return null;
      }
    }

    getNodeOptions(nodesURL).then((nodeResponse) => {
      if (nodeResponse === null) {
        enqueueSnackbar('Failed to retrieve Node options', { variant: 'error', action });
      } else if (nodeResponse.length === 0) {
        setNotifications((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: 'info',
            message: 'No options found for Node',
          },
        ]);
      } else {
        setAvailableNodes([...nodeResponse, { NodeName: 'All', ApiURL: 'allNodes' }]);
      }
    });
  }, []);

  useEffect(() => {
    async function getPipelineVersions(pipelineURI: FieldInputOption) {
      try {
        const response: AxiosResponse<RetrievedPipelineVersions> = await axios.get(
          `${baseAPIURL}pipelines/${pipelineURI.id}/versions`
        );
        if (response.data.nodes_response_status === 'fail') {
          enqueueSnackbar(`Failed to retrieve ${pipelineURI.label} versions`, {
            variant: 'error',
            action,
          });
        } else {
          // If any errors occurred, report them
          response.data.errors.forEach((error) => {
            setNotifications((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: 'warning',
                message: `Failed to retrieve ${pipelineURI.label} versions from ${error.node_name}`,
              },
            ]);
          });
          // If the results are empty, report that
          if (Object.keys(response.data.responses[pipelineURI.id]).length === 0) {
            setNotifications((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: 'info',
                message: `No ${pipelineURI.label} versions were available`,
              },
            ]);
          }
        }
        return response.data.responses[pipelineURI.id];
      } catch {
        return [];
      }
    }
    // Get pipeline versions if
    // 1. A pipeline has been selected (this implementation only works for single value for pipeline name field)
    // 2. This is the first time its being selected (i.e., we haven't retrieved pipeline versions before)
    if (
      pipelineName !== null &&
      !Array.isArray(pipelineName) &&
      pipelines[pipelineName.id].length === 0
    ) {
      getPipelineVersions(pipelineName).then((pipelineVersionsRespnse) => {
        setPipelines((prevPipelines) => ({
          ...prevPipelines,
          [pipelineName.id]: pipelineVersionsRespnse,
        }));
      });
    }
  }, [pipelines, pipelineName]);

  useEffect(() => {
    if (availableNodes.length > 1) {
      const searchParamNodes: string[] = searchParams.getAll('node');

      if (searchParamNodes) {
        const matchedNodeNames: string[] = searchParamNodes.filter((nodeName) =>
          availableNodes.some((option) => option.NodeName === nodeName)
        );

        // If there is no node in the search params, set it to All
        if (matchedNodeNames.length === 0) setSearchParams({ node: ['All'] });
        // If there is any node besides All selected, remove All from the list
        else if (matchedNodeNames.length > 1 && matchedNodeNames.includes('All')) {
          const filteredNodeNames = matchedNodeNames.filter((nodeName) => nodeName !== 'All');
          setSearchParams({ node: filteredNodeNames });
        }
      }
    }
  }, [searchParams, setSearchParams, availableNodes]);

  function showAlert() {
    if (selectedNode && Array.isArray(selectedNode)) {
      const openNeuroIsAnOption = availableNodes.find((n) => n.NodeName === 'OpenNeuro');
      const isOpenNeuroSelected = selectedNode.find(
        (n) => n.label === 'OpenNeuro' || (n.label === 'All' && openNeuroIsAnOption)
      );
      return isOpenNeuroSelected && !alertDismissed;
    }
    return alertDismissed;
  }

  function updateCategoricalQueryParams(fieldLabel: string, value: FieldInput) {
    switch (fieldLabel) {
      case 'Neurobagel graph':
        if (Array.isArray(value)) {
          // If no option is selected default to All
          if (value.length === 0) {
            setSearchParams({ node: ['All'] });
            // If any option beside All is selected, remove All
          } else if (value.length > 1) {
            setSearchParams({ node: value.filter((n) => n.label !== 'All').map((n) => n.label) });
          } else {
            setSearchParams({ node: value.map((n) => n.label) });
          }
        }
        break;
      case 'Sex':
        setSex(value);
        break;
      case 'Diagnosis':
        setDiagnosis(value);
        break;
      case 'Assessment tool':
        setAssessmentTool(value);
        break;
      case 'Imaging modality':
        setImagingModality(value);
        break;
      case 'Pipeline version':
        setPipelineVersion(value);
        break;
      case 'Pipeline name':
        setPipelineName(value);
        break;
      default:
        break;
    }
  }

  function updateContinuousQueryParams(fieldLabel: string, value: number | null) {
    switch (fieldLabel) {
      case 'Minimum age':
        setMinAge(value);
        break;
      case 'Maximum age':
        setMaxAge(value);
        break;
      case 'Minimum number of imaging sessions':
        setMinNumSessions(value);
        break;
      case 'Minimum number of phenotypic sessions':
        setMinNumPhenotypicSessions(value);
        break;
      default:
        break;
    }
  }

  /**
   * Sets the value of a query parameter on the query parameter object.
   *
   * @remarks
   * This is a utility function to used to help construct the query URL using a URLSearchParams object.
   *
   * @param param - The name of the query parameter
   * @param value - The value of the query parameter
   * @param queryParamObject - The query parameter object which contains the query parameters
   * @returns void
   */
  function setQueryParam(param: string, value: FieldInput, queryParamObject: URLSearchParams) {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        queryParamObject.append(param, v.id);
      });
    } else {
      queryParamObject.set(param, value?.id ?? '');
    }
  }

  /**
   * Creates the query URL from user input using a URLSearchParams object.
   *
   * @remarks
   * This function utilizes the `setQueryParam` function to set categorical query parameters.
   *
   * @returns The query URL.
   */
  function constructQueryURL() {
    const queryParams = new URLSearchParams();

    setQueryParam('node_url', selectedNode, queryParams);
    queryParams.set('min_age', minAge ? minAge.toString() : '');
    queryParams.set('max_age', maxAge ? maxAge.toString() : '');
    setQueryParam('sex', sex, queryParams);
    setQueryParam('diagnosis', isControl ? null : diagnosis, queryParams);
    queryParams.set('is_control', isControl ? 'true' : '');
    queryParams.set(
      'min_num_imaging_sessions',
      minNumImagingSessions ? minNumImagingSessions.toString() : ''
    );
    queryParams.set(
      'min_num_phenotypic_sessions',
      minNumPhenotypicSessions ? minNumPhenotypicSessions.toString() : ''
    );
    setQueryParam('assessment', assessmentTool, queryParams);
    setQueryParam('image_modal', imagingModality, queryParams);
    setQueryParam('pipeline_version', pipelineVersion, queryParams);
    setQueryParam('pipeline_name', pipelineName, queryParams);

    // Remove keys with empty values
    const keysToDelete: string[] = [];

    queryParams.forEach((value, key) => {
      // if All option is selected for nodes field, delete all node_urls
      if (value === '' || value === 'allNodes') {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      queryParams.delete(key);
    });

    return `${queryURL}${queryParams.toString()}`;
  }

  async function submitQuery() {
    setLoading(true);
    const url: string = constructQueryURL();
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${IDToken}`,
          'Content-Type': 'application/json',
        },
      });
      setResult(response.data);
      switch (response.data.nodes_response_status) {
        case 'partial success': {
          response.data.errors.forEach((error: NodeError) => {
            setNotifications((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: 'warning',
                message: `${error.node_name} failed to respond`,
              },
            ]);
          });
          break;
        }
        case 'fail': {
          enqueueSnackbar('Error: All nodes failed to respond', { variant: 'error', action });
          break;
        }
        default: {
          break;
        }
      }
    } catch {
      enqueueSnackbar('Failed to retrieve results', { variant: 'error', action });
    }
    setLoading(false);
  }

  return (
    <>
      <AuthDialog open={openAuthDialog} onClose={() => setOpenAuthDialog(false)} />
      <SmallScreenSizeDialog open={isScreenSizeSmall} onClose={() => setIsScreenSizeSmall(false)} />
      <SnackbarProvider
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        maxSnack={7}
      />
      <Navbar
        isLoggedIn={isAuthenticated}
        onLogin={() => setOpenAuthDialog(true)}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      {showAlert() && (
        <>
          <Grow in={!alertDismissed}>
            <Alert
              data-cy="openneuro-alert"
              severity="info"
              onClose={() => {
                setAlertDismissed(true);
              }}
            >
              The OpenNeuro node is being actively annotated at the participant level and does not
              include all datasets yet. Check back soon to find more data. If you would like to
              contribute annotations for existing OpenNeuro datasets, please head over to&nbsp;
              <a href="https://upload-ui.neurobagel.org/" target="_blank" rel="noreferrer">
                Neurobagel&apos;s OpenNeuro utility service
              </a>
              &nbsp;which is designed to download and upload OpenNeuro datasets within Neurobagel
              ecosystem.
            </Alert>
          </Grow>
          <br />
        </>
      )}

      {enableChatbot && <ChatbotFeature setResult={setResult} />}

      <div className="flex flex-wrap gap-3">
        {/* 380px is currently the smallest width for the query form without dropdowns being affected */}
        <div className="min-w-[380px] max-w-sm flex-1">
          <QueryForm
            availableNodes={availableNodes}
            diagnosisOptions={diagnosisOptions}
            assessmentOptions={assessmentOptions}
            selectedNode={selectedNode}
            minAge={minAge}
            maxAge={maxAge}
            sex={sex}
            diagnosis={diagnosis}
            isControl={isControl}
            minNumImagingSessions={minNumImagingSessions}
            minNumPhenotypicSessions={minNumPhenotypicSessions}
            setIsControl={setIsControl}
            assessmentTool={assessmentTool}
            imagingModality={imagingModality}
            pipelineVersion={pipelineVersion}
            pipelineName={pipelineName}
            pipelines={pipelines}
            updateCategoricalQueryParams={(label, value) =>
              updateCategoricalQueryParams(label, value)
            }
            updateContinuousQueryParams={(label, value) =>
              updateContinuousQueryParams(label, value)
            }
            loading={loading}
            onSubmitQuery={() => submitQuery()}
          />
        </div>
        <div
          className={
            loading
              ? 'flex flex-1 animate-pulse items-center justify-center'
              : 'min-w-[600px] flex-1'
          }
        >
          {loading ? (
            <img src={logo} alt="Logo" className="max-h-20 animate-bounce" />
          ) : (
            <ResultContainer
              response={sortedResults || null}
              diagnosisOptions={diagnosisOptions}
              assessmentOptions={assessmentOptions}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
