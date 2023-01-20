import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { StoresService } from '../../services/stores.service';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';

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

  readonly productsFruits$: Observable<ProductModel[]> = this._productsService
    .getAll()
    .pipe(
      map((product) => {
        return product
          .filter((product) => product.categoryId === '5')

          .sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            else {
              return 1;
            }
          })
          .slice(0, 5);
      })
    );

  readonly productsSnacks$: Observable<ProductModel[]> = this._productsService
    .getAll()
    .pipe(
      map((product) => {
        return product
          .filter((product) => product.categoryId === '2')
          .sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            else {
              return 1;
            }
          })
          .slice(0, 5);
      })
    );

  constructor(
    private _storesService: StoresService,
    private _categoriesService: CategoriesService,
    private _productsService: ProductsService
  ) {}
}
