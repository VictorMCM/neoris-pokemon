import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pokemon } from '@models';
import { lastValueFrom } from 'rxjs';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public pokeForm!: FormGroup;
  public currentAction: 'List' | 'Create' | 'Update' = 'List';
  public search: string = '';
  public count: number = null;
  public pokemonList: Pokemon[] = [];
  public selectedPokemon: Pokemon = null;

  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService
  ) {
    this.createForms();
    this.getAllPokemon();
  }

  /**
   * We're creating a form group with four form controls, each with their own validators
   */
  private createForms(): void {
    const { required, maxLength, min, max } = Validators;
    this.pokeForm = this._formBuilder.group({
      name: [null, [required, maxLength(100)]],
      type: [null, [required, maxLength(100)]],
      image: [null, [required, maxLength(512)]],
      attack: [0, [required, min(0), max(100)]],
      defense: [0, [required, min(0), max(100)]],
      hp: [0, [required, min(0), max(255)]],
      idAuthor: [1, [required]]
    });
  }

  /**
   * It resets the form and sets the attack and defense values to 0
   */
  public resetPokeForm(): void {
    this.pokeForm.reset();
    this.pokeForm.controls['attack'].setValue(0);
    this.pokeForm.controls['defense'].setValue(0);
    this.pokeForm.controls['hp'].setValue(0);
    this.pokeForm.controls['idAuthor'].setValue(1);
  }

  /**
   * We're using the `lastValueFrom` operator to get the last value from the observable returned by the
   * `getAllPokemon` function in the `AppService` service
   */
  public async getAllPokemon(): Promise<void> {
    try {
      const response: Pokemon[] = await lastValueFrom(this._appService.getAllPokemon(this.count || 0));
      if (response) {
        this.pokemonList = response;
      } else {
        alert('No se encontraron datos de pokémon');
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * It takes the search input, gets all the pokemon, filters the pokemon list by the search input, and
   * then sets the pokemon list to the filtered list
   */
  public async searchPokemon(): Promise<void> {
    try {
      if (this.search && this.search?.length > 0) {
        await this.getAllPokemon();
        const pokemonIdFounded: any = this.pokemonList.map((pokemon) => pokemon?.name?.toLowerCase()?.includes(this.search?.toLowerCase()) ? pokemon.id : '').filter(String);
        this.pokemonList = this.pokemonList.filter((x: any) => pokemonIdFounded?.includes(+x?.id));
      } else {
        this.getAllPokemon();
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * It sets the current action to Update, sets the selectedPokemon to the pokemon passed in, and sets
   * the form controls to the values of the selectedPokemon
   * @param {Pokemon} pokemon - The pokemon object that was selected from the list.
   */
  public selectPokemon(pokemon: Pokemon): void {
    try {
      if (pokemon) {
        this.currentAction = 'Update';
        this.selectedPokemon = pokemon;
        const controls = this.pokeForm.controls;
        controls['name'].setValue(this.selectedPokemon?.name || null);
        controls['image'].setValue(this.selectedPokemon?.image || null);
        controls['attack'].setValue(this.selectedPokemon?.attack || null);
        controls['defense'].setValue(this.selectedPokemon?.defense || null);
        controls['type'].setValue(this.selectedPokemon?.type || null);
        controls['hp'].setValue(this.selectedPokemon?.hp || null);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * It creates a new pokemon, if the form is valid, and if the response is successful, it resets the
   * form, gets all the pokemon and alerts the user
   * @returns A promise that resolves to a void.
   */
  public async createPokemon(): Promise<void> {
    try {
      if (!this.pokeForm?.valid) {
        alert('Faltan datos para completar el registro');
        return;
      }

      const response: any = await lastValueFrom(this._appService.createPokemon(this.pokeForm?.value));
      if (+response?.status >= 200 && +response?.status <= 204) {
        alert(`Se ha registrado el pokémon: ${response?.body?.name}, con el código: ${response?.body?.id}`);
        this.currentAction = 'List';
        this.resetPokeForm();
        await this.getAllPokemon();
      } else {
        alert('No fue posible registrar los datos');
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * It updates the selected pokemon with the data from the form
   * @returns a promise that resolves to void.
   */
  public async updatePokemon(): Promise<void> {
    try {
      if (this.selectedPokemon) {
        if (!this.pokeForm?.valid) {
          alert('Faltan datos para completar el registro');
          return;
        }

        let pokemon: any = this.pokeForm?.value;
        pokemon.id = Number(this.selectedPokemon?.id);

        const response: any = await lastValueFrom(this._appService.updatePokemon(Number(this.selectedPokemon.id), pokemon));
        if (+response?.status >= 200 && +response?.status <= 204) {
          this.currentAction = 'List';
          this.resetPokeForm();
          await this.getAllPokemon();
        } else {
          alert('No fue posible actualizar los datos');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * It deletes a pokemon from the database
   * @param {Pokemon} pokemon - The pokemon object that we want to delete.
   */
  public async deletePokemon(pokemon: Pokemon): Promise<void> {
    try {
      if (confirm(`¿Está completamente segur@ de borrar al pokémon ${pokemon?.name}?`) === true) {
        const response: any = await lastValueFrom(this._appService.deletePokemon(Number(pokemon?.id)));
        if (+response?.status >= 200 && +response?.status <= 204) {
          this.currentAction = 'List';
          this.resetPokeForm();
          await this.getAllPokemon();
        } else {
          alert('No fue posible borrar los datos');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
