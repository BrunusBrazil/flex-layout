/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  QueryList,
  SkipSelf,
} from '@angular/core';

import {GrandCentral} from './central';
import {BPS, Breakpoint, FALLBACK_BREAKPOINT, FALLBACK_BREAKPOINT_KEY} from './breakpoint';
import {TAGS} from './tags';
import {Builder} from './builder';

@Directive({selector: `bp`})
export class BreakpointDirective {

  @Input('tag') name: string = '';

  readonly element: HTMLElement;
  constructor(elementRef: ElementRef<HTMLElement>) {
    this.element = elementRef.nativeElement;
  }
}

@Directive({selector: `[ngl]`})
export class UnifiedDirective implements AfterContentInit, OnDestroy {

  readonly element: HTMLElement;
  readonly valueMap: Map<string, Map<string, string>> = new Map();

  @ContentChildren(BreakpointDirective) bpElements !: QueryList<BreakpointDirective>;

  private readonly rootObserver: MutationObserver | undefined;
  private readonly observerMap: Map<Element, MutationObserver> = new Map();
  private readonly tagNames: Array<string>;

  constructor(@Optional() @SkipSelf() readonly parent: UnifiedDirective,
              elementRef: ElementRef<HTMLElement>,
              @Inject(BPS) private readonly breakpoints: Breakpoint[],
              @Inject(TAGS) private readonly tags: Map<string, Builder>,
              private readonly grandCentral: GrandCentral) {
    breakpoints.forEach(bp => this.valueMap.set(bp.name, new Map()));
    this.element = elementRef.nativeElement;
    this.tagNames = Array.from(this.tags.keys());
    const callback = (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          this.processAttributeMutation(mutation, true);
        }
      });
    };
    this.tagNames.forEach(tagName => {
      const attr = this.element.getAttribute(tagName);
      if (attr) {
        this.valueMap.get(FALLBACK_BREAKPOINT_KEY)!.set(tagName, attr);
      }
    });
    this.grandCentral.addDirective(this, FALLBACK_BREAKPOINT);
    if (typeof MutationObserver !== 'undefined') {
      this.rootObserver = new MutationObserver(callback);
      this.rootObserver.observe(this.element, {
        attributes: true,
        attributeFilter: this.tagNames
      });
    }
  }

  ngAfterContentInit(): void {
    const childCallback = (mutations: MutationRecord[]) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          this.processAttributeMutation(mutation);
        }
      });
    };

    this.bpElements.forEach(ref => {
      const el = ref.element;
      const breakpoint = this.breakpoints.find(bp => bp.name === ref.name)!;
      this.tagNames.forEach(tagName => {
        const attr = el.getAttribute(tagName);
        if (attr) {
          this.valueMap.get(ref.name)!.set(tagName, attr);
        }
      });
      this.grandCentral.addDirective(this, breakpoint);
      if (typeof MutationObserver !== 'undefined') {
        const mo = new MutationObserver(childCallback);
        mo.observe(el, {
          attributes: true,
          attributeFilter: this.tagNames,
        });
        this.observerMap.set(el, mo);
      }
    });

    // const oldNodes = Array.from(mutation.removedNodes)
    //   .filter(n => isElement(n) && breakpointNames.indexOf(n.tagName) > -1) as Element[];
    // oldNodes.forEach(el => {
    //   const tagName = el.tagName.toLowerCase();
    //   const breakpoint = breakpoints.find(bp => bp.name === tagName)!;
    //   const observer = this.observerMap.get(el);
    //   if (observer) {
    //     grandCentral.removeDirectiveBp(this, breakpoint);
    //     observer.disconnect();
    //   }
    // });
  }

  ngOnDestroy(): void {
    if (this.rootObserver) {
      this.rootObserver.disconnect();
    }
    this.observerMap.forEach(observer => observer.disconnect());
    this.grandCentral.removeDirective(this);
  }

  private processAttributeMutation(mutation: MutationRecord, isParent: boolean = false) {
    if (mutation.attributeName) {
      const target = mutation.target as Element;
      const newValue = target.getAttribute(mutation.attributeName);
      const tagName = isParent ? FALLBACK_BREAKPOINT_KEY : target.tagName.toLowerCase();
      if (newValue) {
        this.valueMap.get(tagName)!.set(mutation.attributeName, newValue);
      } else {
        this.valueMap.get(tagName)!.delete(mutation.attributeName);
      }
      this.grandCentral.updateDirective(this);
    }
  }
}
