import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriesModel } from '../models/categories.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private _httpClient: HttpClient) {}

  getAllCategories(): Observable<CategoriesModel[]> {
    return this._httpClient.get<CategoriesModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-categories'
    );
  }
}
