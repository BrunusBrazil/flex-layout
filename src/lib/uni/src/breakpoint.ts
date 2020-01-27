/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {inject, InjectionToken} from '@angular/core';


export interface Breakpoint {
  name: string;
  media: string;
  priority: number;
}

export const FALLBACK_BREAKPOINT_KEY: string = '__FALLBACK__';

export const FALLBACK_BREAKPOINT: Breakpoint = {
  name: FALLBACK_BREAKPOINT_KEY,
  media: 'all',
  priority: -1,
};

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  {
    name: 'xs',
    media: 'screen and (min-width: 0px) and (max-width: 599.9px)',
    priority: 1,
  },
  {
    name: 'md',
    media: 'screen and (min-width: 960px) and (max-width: 1279.9px)',
    priority: 1,
  }
];

export const BREAKPOINTS =
  new InjectionToken<Array<Array<Breakpoint>>>('Angular Layout Breakpoints');

export const BPS = new InjectionToken<Breakpoint[]>('Angular Layout Condensed Breakpoints', {
  providedIn: 'root',
  factory: () => {
    const providedBps = inject(BREAKPOINTS);
    const bpMap: Map<string, Breakpoint> = new Map();

    providedBps.forEach(bps => {
      bps.forEach(bp => {
        bpMap.set(bp.name, bp);
      });
    });

    return [...Array.from(bpMap.values()), FALLBACK_BREAKPOINT];
  }
});
