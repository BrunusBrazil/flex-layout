/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Tag} from './tags';
import {ValuePriority} from './builder';


export const FLEX_ALIGN_TAG: Tag = {
  tag: 'flexAlign',
  builder: (input: string) => {
    input = input || 'stretch';
    const key = 'align-self';
    const styles: Map<string, ValuePriority> = new Map();

    // Cross-axis
    switch (input) {
      case 'start':
        styles.set(key, {value: 'flex-start', priority: 0});
        break;
      case 'end':
        styles.set(key, {value: 'flex-end', priority: 0});
        break;
      default:
        styles.set(key, {value: input, priority: 0});
        break;
    }

    return styles;
  }
};
