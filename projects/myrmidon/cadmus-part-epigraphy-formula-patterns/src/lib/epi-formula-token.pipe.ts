import { Pipe, PipeTransform } from '@angular/core';

import { EpiFormulaToken } from './epi-formula-patterns-part';

@Pipe({
  name: 'epiFormulaToken',
})
export class EpiFormulaTokenPipe implements PipeTransform {
  transform(value: EpiFormulaToken | undefined | null): unknown {
    if (!value) {
      return null;
    }
    const sb: string[] = [];
    sb.push(value.isOptional ? '[' : '<');

    if (value.tags?.length) {
      sb.push(value.tags.join('.'));
      sb.push(' ');
    }

    if (value.isPlaceholder) {
      sb.push('$');
    }

    if (value.values?.length) {
      sb.push(value.values.join('/'));
    }

    if (value.note) {
      sb.push(` {${value.note}}`);
    }

    sb.push(value.isOptional ? ']' : '>');

    return sb.join('');
  }
}
