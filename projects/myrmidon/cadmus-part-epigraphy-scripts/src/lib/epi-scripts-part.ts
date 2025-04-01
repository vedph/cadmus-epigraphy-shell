import { Part } from '@myrmidon/cadmus-core';

export interface EpiScript {
  system?: string;
  script: string;
  casing?: string;
  features?: string[];
  note?: string;
}

/**
 * The EpiScripts part model.
 */
export interface EpiScriptsPart extends Part {
  scripts: EpiScript[];
}

/**
 * The type ID used to identify the EpiScriptsPart type.
 */
export const EPI_SCRIPTS_PART_TYPEID = 'it.vedph.epigraphy.scripts';

/**
 * JSON schema for the EpiScripts part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const EPI_SCRIPTS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/epigraphy/' + EPI_SCRIPTS_PART_TYPEID + '.json',
  type: 'object',
  title: 'EpiScriptsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'script',
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
    scripts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['script'],
        properties: {
          system: {
            type: 'string',
          },
          script: {
            type: 'string',
          },
          casing: {
            type: 'string',
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
      },
    },
  },
};
