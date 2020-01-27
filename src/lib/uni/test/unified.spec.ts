/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UnifiedModule} from '@angular/flex-layout/uni';
import {Component} from '@angular/core';

@Component({
  template: `
    <div ngl flexAlign="start">
      <bp tag="xs" flexAlign="end"></bp>
      <bp tag="md" flexAlign="center"></bp>
    </div>
  `,
})
class TestComponent {
}

describe('unified', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      imports: [UnifiedModule.withDefaults()],
      declarations: [TestComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
  });

  it('should work', () => {
    fixture.detectChanges();
    console.log(fixture.debugElement.nativeElement);
  });
});
