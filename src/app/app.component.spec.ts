import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { Pokemon } from './models/pokemon';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let appService: AppService;
  let formBuilder: FormBuilder;
  let pokemon: Pokemon = {
    id: 1,
    name: 'Unknown',
    attack: 100,
    defense: 100,
    hp: 255,
    type: 'Unknown',
    id_author: 1,
    image: 'aUrl'
  };

  beforeEach(async () => {
    TestBed?.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        BrowserDynamicTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture?.componentInstance;
    fixture?.detectChanges();

    appService = TestBed.inject(AppService);
    formBuilder = TestBed.inject(FormBuilder);

    const { required, maxLength, min, max } = Validators;
    component.pokeForm = formBuilder.group({
      name: [pokemon?.name, [required, maxLength(100)]],
      type: [pokemon?.type, [required, maxLength(100)]],
      image: [pokemon?.image, [required, maxLength(512)]],
      attack: [pokemon?.attack, [required, min(0), max(100)]],
      defense: [pokemon?.defense, [required, min(0), max(100)]],
      hp: [pokemon?.hp, [required, min(0), max(255)]],
      idAuthor: [pokemon?.id_author, [required]]
    });
    component.pokeForm.updateValueAndValidity();
  });

  it(`Should create the app component`, () => {
    expect(component).toBeTruthy();
    fixture?.destroy();
  });

  it(`Should get pokemon`, fakeAsync(() => {
    spyOn(appService, 'getAllPokemon')?.and?.callThrough();
    expect(component.pokemonList)?.toBeDefined();
    fixture?.destroy();
    flush();
  }));

  it(`Should select a pokemon`, fakeAsync(() => {
    spyOn(component, 'selectPokemon');
    component.selectPokemon(pokemon);
    expect(component.selectedPokemon).toBeDefined();
    fixture?.destroy();
    flush();
  }));

  it(`Should create a pokemon`, fakeAsync(() => {
    let spy = spyOn(appService, 'createPokemon')?.and?.returnValue(new BehaviorSubject<any>(pokemon)?.asObservable());
    component.createPokemon();
    expect(spy)?.toHaveBeenCalled();
    fixture?.destroy();
    flush();
  }));

  it(`Should update a pokemon`, fakeAsync(() => {
    component.selectedPokemon = pokemon;
    let spy = spyOn(appService, 'updatePokemon')?.and?.returnValue(new BehaviorSubject<any>(pokemon)?.asObservable());
    component.updatePokemon();
    expect(spy)?.toHaveBeenCalled();
    fixture?.destroy();
    flush();
  }));

  it(`Should delete a pokemon`, fakeAsync(() => {
    spyOn(window, 'confirm')?.and?.returnValue(true);
    let spy = spyOn(appService, 'deletePokemon')?.and?.returnValue(new BehaviorSubject<any>(pokemon)?.asObservable());
    component.deletePokemon(pokemon);
    expect(spy)?.toHaveBeenCalled();
    fixture?.destroy();
    flush();
  }));
});
