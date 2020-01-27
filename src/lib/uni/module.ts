/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ModuleWithProviders, NgModule} from '@angular/core';

import {BreakpointDirective, UnifiedDirective} from './src/unified';
import {DEFAULT_TAGS, LAYOUT_TAGS} from './src/tags';
import {BREAKPOINTS, DEFAULT_BREAKPOINTS} from './src/breakpoint';


@NgModule({
  declarations: [UnifiedDirective, BreakpointDirective],
  exports: [UnifiedDirective, BreakpointDirective]
})
export class UnifiedModule {
  static withDefaults(): ModuleWithProviders<UnifiedModule> {
    return {
      ngModule: UnifiedModule,
      providers: [
        {
          provide: LAYOUT_TAGS,
          useValue: DEFAULT_TAGS,
          multi: true,
        },
        {
          provide: BREAKPOINTS,
          useValue: DEFAULT_BREAKPOINTS,
          multi: true,
        }
      ]
    };
  }
}
