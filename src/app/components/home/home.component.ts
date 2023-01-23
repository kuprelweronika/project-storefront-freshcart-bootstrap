import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { StoresService } from '../../services/stores.service';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { TagsService } from 'src/app/services/tags.service';
import { StoreTagsModel } from 'src/app/models/store-tags.model';
import { userInfo } from 'os';

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

  //tags for stores
  readonly storesWithTags$: Observable<StoreModel[]> = combineLatest([
    this.stores$,
    this._tagsService.getTags(),
  ]).pipe(map(([stores, tags]) => this._mapToTags(stores, tags)));

  _mapToTags(stores: StoreModel[], tags: StoreTagsModel[]): StoreModel[] {
    const tagMap = tags.reduce((a, c) => ({ ...a, [c.id]: c }), {}) as Record<
      string,
      StoreTagsModel
    >;
    return stores.map((store) => ({
      name: store.name,
      logoUrl: store.logoUrl,
      distanceInMeters: store.distanceInMeters,
      tagIds: (store.tagIds ?? []).map((id) => tagMap[id]?.name),
      id: store.id,
    }));
  }

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
    private _productsService: ProductsService,
    private _tagsService: TagsService
  ) {}
}
