import { Fragment } from '@myrmidon/cadmus-core';

/**
 * The epigraphic ligatures layer fragment server model.
 */
export interface EpiLigaturesFragment extends Fragment {
  eid?: string;
  types: string[];
  groupId?: string;
  note?: string;
}

export const EPI_LIGATURES_FRAGMENT_TYPEID = 'fr.it.vedph.epigraphy.ligatures';

export const EPI_LIGATURES_FRAGMENT_SCHEMA = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/fragments/epigraphy/' +
    EPI_LIGATURES_FRAGMENT_TYPEID +
    '.json',
  type: 'object',
  title: 'EpiLigaturesFragment',
  required: ['location', 'types'],
  properties: {
    location: {
      $id: '#/properties/location',
      type: 'string',
    },
    baseText: {
      $id: '#/properties/baseText',
      type: 'string',
    },
    eid: {
      type: 'string',
    },
    types: {
      type: 'array',
      title: 'The types Schema',
      items: {
        type: 'string',
      },
    },
    groupId: {
      type: 'string',
    },
    note: {
      type: 'string',
    },
  },
};
