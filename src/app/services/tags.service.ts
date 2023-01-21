import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoreTagsModel } from '../models/store-tags.model';

@Injectable({ providedIn: 'root' })
export class TagsService {
  constructor(private _httpClient: HttpClient) {}

  getTags(): Observable<StoreTagsModel[]> {
    return this._httpClient.get<StoreTagsModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-store-tags',
      undefined
    );
  }
}
