/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {inject, InjectionToken} from '@angular/core';

import {Builder} from './builder';
import {FLEX_ALIGN_TAG} from './flex-align';


export interface Tag {
  tag: string;
  builder: Builder;
}

export const DEFAULT_TAGS = [FLEX_ALIGN_TAG];
export const LAYOUT_TAGS = new InjectionToken<Array<Array<Tag>>>('Angular Layout Tags');

export const TAGS = new InjectionToken<Map<string, Builder>>('Angular Layout Condensed Tags', {
  providedIn: 'root',
  factory: () => {
    const providedTags = inject(LAYOUT_TAGS);
    const tagsMap: Map<string, Builder> = new Map();

    providedTags.forEach(tags => {
      tags.forEach(tag => {
        tagsMap.set(tag.tag, tag.builder);
      });
    });

    return tagsMap;
  }
});
