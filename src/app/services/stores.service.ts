import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoresModel } from '../models/stores.model';

@Injectable()
export class StoresService {
  constructor(private _httpClient: HttpClient) {
  }

  getAllStores(): Observable<StoresModel[]> {
    return this._httpClient.get<StoresModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores',);
  }
}
