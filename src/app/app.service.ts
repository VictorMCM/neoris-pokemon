import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AppService {

    private apiUrlBase: string = `https://bp-pokemons.herokuapp.com`;

    constructor(
        private _http: HttpClient
    ) { }

    public getAllPokemon(count?: number): any {
        return this._http.get(`${this.apiUrlBase}${count && count > 0 ? `/${count}` : ''}`, { params: { idAuthor: 1 } });
    }

    public getPokemon(id: number): any {
        return this._http.get(`${this.apiUrlBase}/${id}`);
    }

    public createPokemon(data: any): any {
        return this._http.post(`${this.apiUrlBase}`, data, { observe: 'response' });
    }

    public updatePokemon(id: number, data: any): any {
        return this._http.put(`${this.apiUrlBase}/${id}`, data, { observe: 'response' });
    }

    public deletePokemon(id: number): any {
        return this._http.delete(`${this.apiUrlBase}/${id}`, { observe: 'response' });
    }
}
