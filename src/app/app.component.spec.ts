import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RecordsformComponent } from './recordsform/recordsform.component';
import { RecordslistComponent } from './recordslist/recordslist.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  it('Should have an array of record undefined by default and if the Api Service is undefined.',
    () => {
      const appComponent = new AppComponent(null);
      expect (appComponent.records).toBeUndefined();
      appComponent.ngOnInit();
      expect (appComponent.records).toBeUndefined();
    }
  );
});

describe('AppComponent 2', () => {
  let fixture, component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        RecordsformComponent,
        RecordslistComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule
      ],
    }).compileComponents();
  }
  ));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    component.title = 'Record Collection Search Engine';
    fixture.detectChanges();
  }
  );

  it('Title Check', () => {
    const titleElement = fixture.debugElement.query(By.css('#pagetitle'));
    expect(titleElement.nativeElement.textContent.trim()).toEqual('Welcome to our Record Collection Search Engine');
  });
});
