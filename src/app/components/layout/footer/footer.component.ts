import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryModel } from 'src/app/models/category.model';
import { StoreModel } from 'src/app/models/store.model';
import { CategoriesService } from 'src/app/services/categories.service';
import { StoresService } from 'src/app/services/stores.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  readonly stores$: Observable<StoreModel[]> =
    this._storesService.getAllStores();
  constructor(
    private _categoriesService: CategoriesService,
    private _storesService: StoresService
  ) {}
}
