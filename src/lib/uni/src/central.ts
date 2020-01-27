/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Inject, Injectable} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';

import {UnifiedDirective} from './unified';
import {BPS, Breakpoint} from './breakpoint';
import {TAGS} from './tags';
import {Builder, ValuePriority} from './builder';


@Injectable({providedIn: 'root'})
export class GrandCentral {
  private mediaQueries: Map<string, MediaQueryList> = new Map();
  private activations: Breakpoint[] = [];
  private activating: boolean = false;
  private elementsMap: Map<Breakpoint, Set<UnifiedDirective>> = new Map();
  private elementDataMap: Map<UnifiedDirective, Map<string, string>> = new Map();

  constructor(mediaMatcher: MediaMatcher,
              @Inject(BPS) private readonly bps: Breakpoint[],
              @Inject(TAGS) private readonly tags: Map<string, Builder>) {
    bps.forEach(bp => {
      this.elementsMap.set(bp, new Set());
      const mediaQueryList = mediaMatcher.matchMedia(bp.media);
      this.mediaQueries.set(bp.name, mediaQueryList);
      mediaQueryList.addListener(e => {
        const activate = e.matches && this.activations.indexOf(bp) === -1;
        const deactivate = !e.matches && this.activations.indexOf(bp) > -1;
        if (!this.activating && (activate || deactivate)) {
          this.computeStyles();
          this.activating = true;
        }
      });
    });
    this.computeActivations();
  }

  addDirective(dir: UnifiedDirective, bp: Breakpoint) {
    this.elementsMap.get(bp)!.add(dir);
    this.updateDirective(dir);
  }

  updateDirective(dir: UnifiedDirective) {
    this.computeDirective(dir);
    this.addStyles(dir);
  }

  removeDirectiveBp(dir: UnifiedDirective, bp: Breakpoint) {
    this.elementsMap.get(bp)!.delete(dir);
    this.updateDirective(dir);
  }

  removeDirective(dir: UnifiedDirective) {
    this.bps.forEach(bp => this.elementsMap.get(bp)!.delete(dir));
  }

  private computeActivations() {
    this.activations = this.bps
      .filter(bp => this.mediaQueries.get(bp.name)!.matches)
      .sort((a, b) => b.priority - a.priority);
  }

  private computeStyles() {
    this.computeActivations();
    this.activations.forEach(bp =>
      this.elementsMap.get(bp)!.forEach(this.computeDirective.bind(this)));
    Array.from(this.elementDataMap.keys()).forEach(this.addStyles.bind(this));
    this.activating = false;
  }

  private computeDirective(dir: UnifiedDirective) {
    const values: Map<string, string> = new Map();
    this.activations.forEach(bp => {
      const valueMap = dir.valueMap.get(bp.name);

      if (valueMap) {
        valueMap.forEach((value, key) => {
          if (!values.has(key)) {
            values.set(key, value);
          }
        });
      }
    });

    this.elementDataMap.set(dir, values);
  }

  private addStyles(dir: UnifiedDirective) {
    const element = dir.element;
    const parent = dir.parent;
    const values = this.elementDataMap.get(dir)!;
    const styles: Map<string, ValuePriority> = new Map();

    values.forEach((value, key) => {
      const builder = this.tags.get(key)!;
      const priorityMap = builder(value, parent);
      priorityMap.forEach((v, k) => {
        const style = styles.get(k);
        if (!style || style && style.priority < v.priority) {
          styles.set(k, v);
        }
      });
    });

    styles.forEach((value, key) => element.style.setProperty(key, value.value));
  }
}
