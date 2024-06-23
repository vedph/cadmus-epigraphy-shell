import { Part } from '@myrmidon/cadmus-core';
import { PhysicalMeasurement } from '@myrmidon/cadmus-mat-physical-size';

/**
 * An epigraphic graphical sign.
 */
export interface EpiSign {
  id: string;
  features?: string[];
  description?: string;
  measurements?: PhysicalMeasurement[];
}

/**
 * The epigraphic signs part model.
 */
export interface EpiSignsPart extends Part {
  signs: EpiSign[];
}

/**
 * The type ID used to identify the EpiSignsPart type.
 */
export const EPI_SIGNS_PART_TYPEID = 'it.vedph.epigraphy.signs';

/**
 * JSON schema for the EpiSigns part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const EpiSigns_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/epigraphy/' + EPI_SIGNS_PART_TYPEID + '.json',
  type: 'object',
  title: 'EpiSignsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'signs',
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
    signs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
          },
          features: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          description: {
            type: 'string',
          },
          measurements: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'value', 'unit'],
              properties: {
                name: {
                  type: 'string',
                },
                value: {
                  type: 'number',
                },
                unit: {
                  type: 'string',
                },
                tag: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};
