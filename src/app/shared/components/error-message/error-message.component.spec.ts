import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.componentInstance.message = 'Could not load item comments.';
  });

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  it('blames the missing connection when offline', () => {
    fixture.componentInstance.offline = true;
    fixture.detectChanges();

    expect(text()).toContain('offline');
    expect(text()).not.toContain('Something went wrong');
  });

  it('reports a load failure when online', () => {
    fixture.componentInstance.offline = false;
    fixture.detectChanges();

    expect(text()).toContain('Something went wrong');
    expect(text()).not.toContain('offline');
  });
});
