import { Part } from '@myrmidon/cadmus-core';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';

/**
 * A fragment of an epigraphic support.
 */
export interface EpiSupportFr {
  id: string;
  shelfmark?: string;
  isLost?: boolean;
  size?: PhysicalSize;
  row?: number;
  column?: number;
  rowSpan?: number;
  columnSpan?: number;
  headText?: string;
  headTextLoc?: string;
  tailText?: string;
  tailTextLoc?: string;
  note?: string;
}

/**
 * The EpiSupportFrr part model.
 */
export interface EpiSupportFrrPart extends Part {
  fragments: EpiSupportFr[];
}

/**
 * The type ID used to identify the EpiSupportFrrPart type.
 */
export const EPI_SUPPORT_FRR_PART_TYPEID = 'it.vedph.epigraphy.support-frr';

/**
 * JSON schema for the EpiSupportFrr part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const EpiSupportFrr_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/epigraphy/' +
    EPI_SUPPORT_FRR_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'EpiSupportFrrPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'fragments',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },

    fragments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
          },
          shelfmark: {
            type: 'string',
          },
          isLost: {
            type: 'boolean',
          },
          size: {
            type: 'object',
            required: ['w'],
            properties: {
              tag: {
                type: 'string',
              },
              w: {
                type: 'object',
                required: ['value', 'unit'],
                properties: {
                  tag: {
                    type: 'string',
                  },
                  value: {
                    type: 'number',
                  },
                  unit: {
                    type: 'string',
                  },
                },
              },
              h: {
                type: 'object',
                required: ['value', 'unit'],
                properties: {
                  tag: {
                    type: 'string',
                  },
                  value: {
                    type: 'number',
                  },
                  unit: {
                    type: 'string',
                  },
                },
              },
              d: {
                type: 'object',
                required: ['value', 'unit'],
                properties: {
                  tag: {
                    type: 'string',
                  },
                  value: {
                    type: 'number',
                  },
                  unit: {
                    type: 'string',
                  },
                },
              },
              note: {
                type: 'string',
              },
            },
          },
          row: {
            type: 'integer',
          },
          column: {
            type: 'integer',
          },
          rowSpan: {
            type: 'integer',
          },
          columnSpan: {
            type: 'integer',
          },
          headText: {
            type: 'string',
          },
          headTextLoc: {
            type: 'string',
          },
          tailText: {
            type: 'string',
          },
          tailTextLoc: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
        },
      },
    },
  },
};
