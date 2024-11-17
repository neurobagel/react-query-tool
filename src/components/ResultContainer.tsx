import { useState, useEffect, useCallback } from 'react';
import { Button, FormControlLabel, Checkbox, Typography } from '@mui/material';
import ResultCard from './ResultCard';
import { QueryResponse, Pipelines, AttributeOption } from '../utils/types';
import DownloadResultButton from './DownloadResultButton';
import GetDataDialog from './GetDataDialog';
import { sexes, modalities } from '../utils/constants';

function ResultContainer({
  diagnosisOptions,
  assessmentOptions,
  response,
}: {
  diagnosisOptions: AttributeOption[];
  assessmentOptions: AttributeOption[];
  response: QueryResponse | null;
}) {
  const [download, setDownload] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const selectAll: boolean = response
    ? response.responses.length === download.length &&
      response.responses.every((r) => download.includes(r.dataset_uuid))
    : false;

  let numOfMatchedDatasets = 0;
  let numOfMatchedSubjects = 0;
  if (response) {
    response.responses.forEach((item) => {
      numOfMatchedDatasets += 1;
      numOfMatchedSubjects += item.num_matching_subjects;
    });
  }
  const summaryStats = `Summary stats: ${numOfMatchedDatasets} datasets, ${numOfMatchedSubjects} subjects`;

  /**
   * Updates the download array.
   *
   * @remarks
   * If the dataset uuid is not in the download array adds it, otherwise removes it.
   *
   * @param id - The uuid of the dataset to be added or removed from the download list
   * @returns void
   */
  const updateDownload = useCallback((id: string) => {
    setDownload((currDownload) => {
      const newDownload = !currDownload.includes(id)
        ? [...currDownload, id]
        : currDownload.filter((downloadID) => downloadID !== id);
      return newDownload;
    });
  }, []);

  function handleSelectAll(checked: boolean) {
    if (response) {
      const uuids = response.responses.map((item) => item.dataset_uuid);
      setDownload(checked ? uuids : []);
    }
  }

  useEffect(() => {
    if (response) {
      setDownload((currentDownload) =>
        currentDownload.filter((downloadID) =>
          response.responses.some((item) => item.dataset_uuid === downloadID)
        )
      );
    }
  }, [response]);

  function convertURIToLabel(
    type: string,
    uri: string | string[] | null
  ): string | string[] | null {
    // Handle array of URIs
    if (Array.isArray(uri)) {
      return uri.map((singleUri) => convertURIToLabel(type, singleUri)).join(', ');
    }

    if (!uri) {
      return uri;
    }

    switch (type) {
      case 'sex': {
        const entry = Object.entries(sexes).find(([, value]) => {
          const [, id] = value.split(':');
          return uri.includes(id);
        });
        return entry ? entry[0] : uri;
      }

      case 'sessionType':
        if (uri.includes('Imaging')) {
          return 'Imaging';
        }
        if (uri.includes('Phenotypic')) {
          return 'Phenotypic';
        }
        return uri;

      case 'diagnosis': {
        const diagnosis = diagnosisOptions.find((d) => {
          const [, id] = d.TermURL.split(':');
          return uri.includes(id);
        });
        return diagnosis ? diagnosis.Label : uri;
      }

      case 'assessment': {
        const assessment = assessmentOptions.find((a) => {
          const [, id] = a.TermURL.split(':');
          return uri.includes(id);
        });
        return assessment ? assessment.Label : uri;
      }

      case 'modality': {
        const modalityKey = Object.keys(modalities).find((key) => key === uri);
        return modalityKey ? modalities[modalityKey].label : uri;
      }

      case 'pipeline':
        return uri.slice(65);

      default:
        return uri;
    }
  }

  function parsePipelinesInfoToString(pipelines: Pipelines) {
    return pipelines
      ? Object.entries(pipelines)
          .flatMap(([name, versions]) =>
            (versions as string[]).map((version: string) => `${name} ${version}`)
          )
          .join(', ')
      : '';
  }

  function generateTSVString(buttonIdentifier: string) {
    if (response) {
      const tsvRows = [];
      const datasets = response.responses.filter((res) => download.includes(res.dataset_uuid));

      if (buttonIdentifier === 'cohort participant') {
        const headers = [
          'DatasetName',
          'PortalURI',
          'NumMatchingSubjects',
          'SubjectID',
          'SessionID',
          'SessionFilePath',
          'SessionType',
          'Age',
          'Sex',
          'Diagnosis',
          'Assessment',
          'NumMatchingPhenotypicSessions',
          'NumMatchingImagingSessions',
          'SessionImagingModalities',
          'SessionCompletedPipelines',
          'DatasetImagingModalities',
          'DatasetPipelines',
        ].join('\t');
        tsvRows.push(headers);

        datasets.forEach((res) => {
          if (res.records_protected) {
            tsvRows.push(
              [
                res.dataset_name.replace('\n', ' '),
                res.dataset_portal_uri,
                res.num_matching_subjects,
                'protected', // subject_id
                'protected', // session_id
                'protected', // session_file_path
                'protected', // session_type
                'protected', // age
                'protected', // sex
                'protected', // diagnosis
                'protected', // assessment
                'protected', // num_matching_phenotypic_sessions
                'protected', // num_matching_imaging_sessions
                'protected', // session_imaging_modality
                'protected', // session_completed_pipelines
                convertURIToLabel('modality', res.image_modals),
                convertURIToLabel(
                  'pipeline',
                  parsePipelinesInfoToString(res.available_pipelines).split(', ')
                ),
              ].join('\t')
            );
          } else {
            // @ts-expect-error: typescript doesn't know that subject_data is an array when records_protected is false.
            res.subject_data.forEach((subject) => {
              tsvRows.push(
                [
                  res.dataset_name.replace('\n', ' '),
                  res.dataset_portal_uri,
                  res.num_matching_subjects,
                  subject.sub_id,
                  subject.session_id,
                  subject.session_file_path,
                  convertURIToLabel('sessionType', subject.session_type),
                  subject.age,
                  convertURIToLabel('sex', subject.sex),
                  convertURIToLabel('diagnosis', subject.diagnosis),
                  convertURIToLabel('assessment', subject.assessment),
                  subject.num_matching_phenotypic_sessions,
                  subject.num_matching_imaging_sessions,
                  convertURIToLabel('modality', subject.image_modal),
                  convertURIToLabel(
                    'pipeline',
                    parsePipelinesInfoToString(subject.completed_pipelines).split(', ')
                  ),
                  convertURIToLabel('modality', res.image_modals),
                  convertURIToLabel(
                    'pipeline',
                    parsePipelinesInfoToString(res.available_pipelines).split(', ')
                  ),
                ].join('\t')
              );
            });
          }
        });
      } else {
        const headers = [
          'DatasetName',
          'PortalURI',
          'SubjectID',
          'SessionID',
          'SessionFilePath',
          'SessionType',
          'NumMatchingPhenotypicSessions',
          'NumMatchingImagingSessions',
          'SessionImagingModalities',
          'SessionCompletedPipelines',
          'DatasetImagingModalities',
          'DatasetPipelines',
        ].join('\t');
        tsvRows.push(headers);

        datasets.forEach((res) => {
          if (res.records_protected) {
            tsvRows.push(
              [
                res.dataset_name.replace('\n', ' '),
                res.dataset_portal_uri,
                'protected', // subject_id
                'protected', // session_id
                'protected', // session_file_path
                'protected', // session_type
                'protected', // num_matching_phenotypic_sessions
                'protected', // num_matching_imaging_sessions
                'protected', // session_imaging_modality
                'protected', // session_completed_pipelines
                res.image_modals?.join(', '),
                parsePipelinesInfoToString(res.available_pipelines),
              ].join('\t')
            );
          } else {
            // @ts-expect-error: typescript doesn't know that subject_data is an array when records_protected is false.
            res.subject_data.forEach((subject) => {
              tsvRows.push(
                [
                  res.dataset_name.replace('\n', ' '),
                  res.dataset_portal_uri,
                  subject.sub_id,
                  subject.session_id,
                  subject.session_file_path,
                  subject.session_type,
                  subject.num_matching_phenotypic_sessions,
                  subject.num_matching_imaging_sessions,
                  subject.image_modal?.join(', '),
                  parsePipelinesInfoToString(subject.completed_pipelines),
                  res.image_modals?.join(', '),
                  parsePipelinesInfoToString(res.available_pipelines),
                ].join('\t')
              );
            });
          }
        });
      }

      return tsvRows.join('\n');
    }

    return '';
  }

  function downloadResults(buttonIdentifier: string) {
    const element = document.createElement('a');
    const encodedTSV = encodeURIComponent(generateTSVString(buttonIdentifier));
    element.setAttribute('href', `data:text/tab-separated-values;charset=utf-8,${encodedTSV}`);
    element.setAttribute('download', `${buttonIdentifier} results.tsv`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  }

  function renderResults() {
    if (response === null) {
      return (
        <Typography variant="h5" data-cy="default-result-container-view" className="text-gray-500">
          Click &apos;Submit Query&apos; for results
        </Typography>
      );
    }

    if (response.nodes_response_status === 'fail') {
      return (
        <div data-cy="failed-result-container-view">
          <Typography variant="h5">Query failed - no nodes responded!</Typography>
          <Typography className="text-gray-500">
            This is not supposed to happen. Please try again, or open an issue.
          </Typography>
        </div>
      );
    }

    if (response.responses.length === 0) {
      return (
        <Typography variant="h5" data-cy="empty-result-container-view" className="text-gray-500">
          No results
        </Typography>
      );
    }

    return (
      <>
        <div className="flex flex-row items-baseline justify-between">
          <div>
            <FormControlLabel
              data-cy="select-all-checkbox"
              label="Select all datasets"
              control={
                <Checkbox
                  onChange={(event) => handleSelectAll(event.target.checked)}
                  checked={selectAll}
                />
              }
            />
          </div>
          <div>
            <Typography variant="body1" data-cy="summary-stats">
              {summaryStats}
            </Typography>
          </div>
        </div>
        <div className="h-[70vh] space-y-1 overflow-auto">
          {response.responses.map((item) => (
            <ResultCard
              key={item.dataset_uuid}
              nodeName={item.node_name}
              datasetUUID={item.dataset_uuid}
              datasetName={item.dataset_name}
              datasetTotalSubjects={item.dataset_total_subjects}
              numMatchingSubjects={item.num_matching_subjects}
              imageModals={item.image_modals}
              pipelines={item.available_pipelines}
              checked={download.includes(item.dataset_uuid)}
              onCheckboxChange={updateDownload}
            />
          ))}
        </div>
        <div className="mt-[2px] flex flex-row flex-wrap justify-between">
          <div>
            <Button
              variant="contained"
              data-cy="how-to-get-data-dialog-button"
              onClick={() => setOpenDialog(true)}
            >
              How to get data
            </Button>
            <GetDataDialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              disableDownloadResultsButton={download.length === 0}
              handleDownloadResultButtonClick={(identifier) => downloadResults(identifier)}
            />
          </div>
          <div className="space-x-1">
            <DownloadResultButton
              identifier="cohort participant"
              disabled={download.length === 0}
              handleClick={(identifier) => downloadResults(identifier)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col" data-cy="result-container">
      {renderResults()}
    </div>
  );
}

export default ResultContainer;
