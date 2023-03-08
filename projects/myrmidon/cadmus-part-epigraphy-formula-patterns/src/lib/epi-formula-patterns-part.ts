import { Part } from '@myrmidon/cadmus-core';

/**
 * A single token in an epigraphic formula pattern.
 */
export interface EpiFormulaToken {
  tags: string[];
  values: string[];
  isOptional?: boolean;
  isPlaceholder?: boolean;
  note?: string;
}

/**
 * An epigraphic formula pattern.
 */
export interface EpiFormulaPattern {
  eid?: string;
  language: string;
  tag?: string;
  tokens: EpiFormulaToken[];
}

/**
 * The epigraphic formula patterns part model.
 */
export interface EpiFormulaPatternsPart extends Part {
  patterns: EpiFormulaPattern[];
}

/**
 * The type ID used to identify the EpiFormulaPatternsPart type.
 */
export const EPI_FORMULA_PATTERNS_PART_TYPEID =
  'it.vedph.epigraphy.formula-patterns';

/**
 * JSON schema for the EpiFormulaPatterns part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const EPI_FORMULA_PATTERNS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/epigraphy/formula-patterns/' +
    EPI_FORMULA_PATTERNS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'EpiFormulaPatternsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'patterns',
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
    patterns: {
      type: 'array',
      items: {
        type: 'object',
        required: ['language', 'tokens'],
        properties: {
          eid: {
            type: 'string',
          },
          language: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
          tokens: {
            type: 'array',
            items: {
              type: 'object',
              required: ['tags', 'values'],
              properties: {
                tag: {
                  type: 'string',
                },
                values: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                isOptional: {
                  type: 'boolean',
                },
                isPlaceholder: {
                  type: 'boolean',
                },
                note: {
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
