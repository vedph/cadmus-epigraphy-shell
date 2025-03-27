import { Part } from '@myrmidon/cadmus-core';
import { PhysicalSize } from '@myrmidon/cadmus-mat-physical-size';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';

export interface EpiTextArea {
  eid?: string;
  type: string;
  layout?: string;
  size?: PhysicalSize;
  features?: string[];
  frameType?: string;
  frameDescription?: string;
  note?: string;
}

/**
 * The EpiSupportPart part model.
 */
export interface EpiSupportPart extends Part {
  material: string;
  originalFn?: string;
  currentFn?: string;
  originalType?: string;
  currentType?: string;
  objectType?: string;
  features?: string[];
  size?: PhysicalSize;
  textAreas?: EpiTextArea[];
  counts?: DecoratedCount[];
  note?: string;
}

/**
 * The type ID used to identify the EpiSupportPart type.
 */
export const EPI_SUPPORT_PART_TYPEID = 'it.vedph.epigraphy.support';

/**
 * JSON schema for the EpiSupportPart part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const EPI_SUPPORT_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/epigraphy/' + EPI_SUPPORT_PART_TYPEID + '.json',
  type: 'object',
  title: 'EpiSupportPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'material',
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
    material: {
      type: 'string',
    },
    originalFn: {
      type: 'string',
    },
    currentFn: {
      type: 'string',
    },
    originalType: {
      type: 'string',
    },
    currentType: {
      type: 'string',
    },
    objectType: {
      type: 'string',
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
    textAreas: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['type'],
            properties: {
              eid: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              layout: {
                type: 'string',
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
              features: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              frameType: {
                type: 'string',
              },
              frameDescription: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    counts: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['count'],
            properties: {
              count: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    features: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    note: {
      type: 'string',
    },
  },
};
