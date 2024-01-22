export interface FieldInputOption {
    label: string;
    id: string;
  }
  
  export interface AttributeOption {
    Label: string;
    TermURL: string;
  }
  
  export interface NodeOption {
    NodeName: string;
    ApiURL: string;
  }
  
  export interface RetrievedAttributeOption {
    [key: string]: AttributeOption[];
  }
  
  export interface Result {
    node_name: string;
    dataset_uuid: string;
    dataset_name: string;
    dataset_portal_uri: string;
    dataset_total_subjects: number;
    records_protected: boolean;
    num_matching_subjects: number;
    subject_data: object;
    image_modals: string[];
  }
  
  export interface CategoricalFieldProps {
    label: string;
    options: FieldInputOption[];
    onFieldChange: (fieldLabel: string, value: FieldInput) => void;
    multiple?: boolean;
    inputValue: FieldInput;
  }
  
  export type FieldInput = FieldInputOption | FieldInputOption[] | null;