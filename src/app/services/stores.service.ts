import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { StoreModel } from '../models/store.model';

@Injectable({ providedIn: 'root' })
export class StoresService {
  constructor(private _httpClient: HttpClient) {}

  getAllStores(): Observable<StoreModel[]> {
    return this._httpClient.get<StoreModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores'
    );
  }

  getStore(id: number): Observable<StoreModel> {
    return this._httpClient.get<StoreModel>(
      `https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores/${id}`
    );
  }
}
