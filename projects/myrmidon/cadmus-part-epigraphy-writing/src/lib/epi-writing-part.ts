import { Part } from '@myrmidon/cadmus-core';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';

/**
 * The EpiWriting part model.
 */
export interface EpiWritingPart extends Part {
  system: string;
  type: string;
  technique?: string;
  tool?: string;
  frameType?: string;
  counts?: DecoratedCount[];
  figType?: string;
  figFeatures?: string[];
  scriptFeatures?: string[];
  languages: string[];
  hasPoetry?: boolean;
  metres?: string[];
}

/**
 * The type ID used to identify the EpiWritingPart type.
 */
export const EPI_WRITING_PART_TYPEID = 'it.vedph.gisarc.epi-writing';

/**
 * JSON schema for the EpiWriting part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const EPI_WRITING_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/gisarc/' + EPI_WRITING_PART_TYPEID + '.json',
  type: 'object',
  title: 'EpiWritingPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'system',
    'type',
    'languages',
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
    system: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    languages: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string',
          },
        ],
      },
    },
    counts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'value'],
        properties: {
          id: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
        },
      },
    },
    hasPoetry: {
      type: 'boolean',
    },
    technique: {
      type: 'string',
    },
    tool: {
      type: 'string',
    },
    figType: {
      type: 'string',
    },
    scriptFeatures: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string',
          },
        ],
      },
    },
    frameType: {
      type: 'string',
    },
  },
  metres: {
    type: 'array',
    items: {
      anyOf: [
        {
          type: 'string',
        },
      ],
    },
  },
};
