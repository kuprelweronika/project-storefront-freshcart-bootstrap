import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { StoresService } from '../../services/stores.service';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  readonly stores$: Observable<StoreModel[]> =
    this._storesService.getAllStores();

  constructor(
    private _storesService: StoresService,
    private _categoriesService: CategoriesService
  ) {}
}
