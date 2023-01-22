import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  from,
  map,
  of,
  shareReplay,
  startWith,
  take,
  tap,
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { SortQueryModel } from '../../models/sort-query.model';
import { ProductModel } from '../../models/product.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { StoreModel } from 'src/app/models/store.model';
import { StoresService } from 'src/app/services/stores.service';
import { ProductQueryModel } from 'src/app/models/product-query.model';

@Component({
  selector: 'app-categories',
  styleUrls: ['./categories.component.scss'],
  templateUrl: './categories.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly order: FormControl = new FormControl('');

  readonly filterProducts: FormGroup = new FormGroup({
    priceFrom: new FormControl(),
    priceTo: new FormControl(),
    ratingFrom: new FormControl(),
    ratingTo: new FormControl(),
    stores: new FormControl(),
  });
  selectedStore: string[] = ['2'];

  readonly stores$: Observable<StoreModel[]> =
    this._storesService.getAllStores();
  //all categories for left-navbar
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  readonly limits$: Observable<number[]> = of([5, 10, 15]);

  readonly rating$: Observable<number[]> = of([2, 3, 4, 5]);

  readonly orders$: Observable<SortQueryModel[]> = of([
    { label: 'Featured', ids: 'featuredValue', direction: 'desc' },
    { label: 'Price: Low to High', ids: 'price', direction: 'asc' },
    { label: 'Price: High to Low', ids: 'price', direction: 'desc' },
    { label: 'Avg. Rating', ids: 'ratingValue', direction: 'desc' },
  ]);

  readonly category$: Observable<CategoryModel[]> = combineLatest([
    this.categories$,
    this._activatedRoute.params,
  ]).pipe(
    map(([categories, params]: [CategoryModel[], Params]) => {
      return categories.filter((category: CategoryModel) =>
        category.id.includes(params['categoryId'].toString())
      );
    })
  );
  //behaviorSubject for active button in pagination
  private _isActivePageSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(1);

  public isActivePage$: Observable<number> =
    this._isActivePageSubject.asObservable();

  private _isActiveLimitSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(5);
  public isActiveLimit$: Observable<number> =
    this._isActiveLimitSubject.asObservable();

  //actual pagination state
  readonly paginationState: Observable<{ limit: number; page: number }> =
    this._activatedRoute.queryParams.pipe(
      map((data) => {
        return {
          limit: data['limit'] === undefined ? 5 : data['limit'],
          page: data['page'] === undefined ? 1 : data['page'],
        };
      }),
      shareReplay(1)
    );

  //list of all products for special category from activatedRoute
  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAll(),
    this._activatedRoute.params,
  ]).pipe(
    map(([products, params]: [ProductModel[], Params]) => {
      return products.filter((product: ProductModel) =>
        product.categoryId.includes(params['categoryId'].toString())
      );
    })
  );

  sortData(products: ProductModel[], order: SortQueryModel) {
    if (order.direction === 'asc') {
      //@ts-ignore
      return products.sort((a, b) => (a[order.ids] > b[order.ids] ? 1 : -1));
    } else {
      //@ts-ignore
      return products.sort((a, b) => (a[order.ids] > b[order.ids] ? -1 : 1));
    }
  }

  readonly productsWithStars$: Observable<ProductQueryModel[]> =
    this.products$.pipe(
      map((products) => {
        return products.map((product) => ({
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          ratingValue: this.changeNumToArray(product.ratingValue),
          ratingValueNum: product.ratingValue,
          ratingCount: product.ratingCount,
          imageUrl: product.imageUrl,
          featureValue: product.featureValue,
          storeIds: product.storeIds,
          id: product.id,
        }));
      })
    );

  //list of products after  sorting
  readonly productsSorted$: Observable<ProductModel[]> = combineLatest([
    this.products$,
    this.order.valueChanges.pipe(
      startWith({
        label: 'Featured',
        id: 'featuredValue',
        direction: 'desc',
      })
    ),
  ]).pipe(
    map(([products, order]: [ProductModel[], SortQueryModel]) => {
      return this.sortData(products, order);
    })
  );

  //list of products after sorting and after filtering by Price
  readonly productsFilteredByPrice$: Observable<ProductModel[]> = combineLatest(
    [
      this.productsSorted$,
      //problem with null, think about it
      //@ts-ignore
      this.filterProducts.get('priceFrom').valueChanges.pipe(startWith(1)),
      //@ts-ignore
      this.filterProducts.get('priceTo').valueChanges.pipe(startWith(2000)),
    ]
  ).pipe(
    map(([products, priceFrom, priceTo]: [ProductModel[], number, number]) => {
      if (priceFrom > 1) {
        return products.filter(
          (product) => product.price > priceFrom && product.price < priceTo
        );
      } else {
        return products.filter(
          (product) => product.price > priceFrom && product.price < priceTo
        );
      }
    })
  );

  readonly productsFilteredByStore$: Observable<ProductModel[]> =
    this.productsFilteredByPrice$.pipe(
      map((products: ProductModel[]) => {
        return products.filter((product) =>
          product.storeIds.sort().includes(this.selectedStore.toString())
        );
      })
    );

  //create array with pages
  public pages$: Observable<number[]> = combineLatest([
    this.productsSorted$,
    this.paginationState,
  ]).pipe(
    map(([data, pagination]) => {
      return Array.from(
        { length: Math.floor(data.length / pagination.limit) + 1 },
        (_, i) => i + 1
      );
    })
  );
  //create 1 page list of products with page and limit
  readonly productsWithPage$: Observable<ProductModel[]> = combineLatest([
    this.paginationState,
    this.productsFilteredByStore$,
  ]).pipe(
    map(([pagination, products]) =>
      products.slice(
        (pagination.page - 1) * pagination.limit,
        pagination.limit * pagination.page
      )
    )
  );

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _router: Router,
    private _storesService: StoresService
  ) {}

  setPage(page: number) {
    this._isActivePageSubject.next(page);
    this.paginationState
      .pipe(
        take(1),
        tap((data) => {
          this._router.navigate([], {
            queryParams: {
              limit: data.limit,
              page: page,
            },
          });
        })
      )
      .subscribe();
  }
  setLimit(limit: number) {
    this._isActiveLimitSubject.next(limit);
    this.paginationState
      .pipe(
        take(1),
        tap((data) => {
          this._router.navigate([], {
            queryParams: {
              limit: limit,
              page: data.page,
            },
          });
        })
      )
      .subscribe();
  }

  changeNumToArray(num: number) {
    let t = num - Math.floor(num);
    let num1;
    if (t >= 0.3 && t <= 0.7) {
      num1 = Math.floor(num) + 0.5;
    } else if (t > 0.7) {
      num1 = Math.ceil(num);
    } else {
      num1 = Math.floor(num);
    }
    let testArray = [1, 1, 1, 1, 1];
    testArray.fill(0, num1);
    for (let i = 0.5; i < 5; i++) {
      if (i === num1) {
        testArray.fill(0.5, i - 0.5, i + 0.5);
      } else {
      }
    }
    return testArray;
  }

  onStoreChange(event: Event, store: StoreModel) {
    if (this.selectedStore.includes(store.id)) {
      this.selectedStore = this.selectedStore
        .filter(function (item) {
          return item !== store.id;
        })
        .sort();
    } else this.selectedStore.push(store.id);
    this.selectedStore.sort();
  }
}
