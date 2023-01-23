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
  filter,
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
  readonly order: FormControl = new FormControl();

  readonly filterProducts: FormGroup = new FormGroup({
    priceFrom: new FormControl(),
    priceTo: new FormControl(),
    ratingFrom: new FormControl(),
    ratingTo: new FormControl(),
    stores: new FormControl(),
    rating: new FormControl(),
    searchByStore: new FormControl(),
  });
  selectedStore: string[] = [];
  selectedRating: number[] = [];

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

  private _isActivePageSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(1);

  public isActivePage$: Observable<number> =
    this._isActivePageSubject.asObservable();

  private _isActiveLimitSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(5);
  public isActiveLimit$: Observable<number> =
    this._isActiveLimitSubject.asObservable();

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

  readonly productsFilteredByStoreOrRating$: Observable<ProductModel[]> =
    combineLatest([
      this.productsFilteredByPrice$,
      //@ts-ignore
      this.filterProducts.get('stores').valueChanges.pipe(startWith([])),
      //@ts-ignore
      this.filterProducts.get('rating').valueChanges.pipe(startWith([])),
    ]).pipe(
      map(([products]) => {
        return products.filter((product) => {
          //@ts-ignore
          if (
            this.selectedStore.length === 0 &&
            this.selectedRating.length === 0
          ) {
            return true;
          } else if (
            this.selectedStore.length !== 0 &&
            this.selectedRating.length !== 0
          ) {
            return (
              this.selectedStore.some((ai) => product.storeIds.includes(ai)) &&
              this.selectedRating.includes(
                this.roundNumber(product.ratingValue)
              )
            );
          } else if (this.selectedStore.length !== 0) {
            return this.selectedStore.some((ai) =>
              product.storeIds.includes(ai)
            );
          } else if (this.selectedRating.length != 0) {
            return this.selectedRating.includes(
              this.roundNumber(product.ratingValue)
            );
          } else {
            return true;
          }
        });
      })
    );

  readonly productsWithStores$: Observable<ProductModel[]> = combineLatest([
    this.productsFilteredByPrice$,
    this.stores$,
  ]).pipe(
    map(([products, stores]) => {
      const storeMap = stores.reduce(
        (a, c) => ({ ...a, [c.id]: c }),
        {}
      ) as Record<string, StoreModel>;

      return products.map((product) => ({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        ratingValue: product.ratingValue,
        ratingCount: product.ratingCount,
        imageUrl: product.imageUrl,
        featureValue: product.featureValue,
        storeIds: (product.storeIds ?? []).map((id) =>
          storeMap[id]?.name.toLowerCase()
        ),
        id: product.id,
      }));
    })
  );

  searchArrayForLetter(arr: string[], letter: string) {
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i];
      //@ts-ignore
      if (!el.toLowerCase().includes(letter)) {
        continue;
      } else {
        return true;
      }
    }
    return false;
  }

  readonly productsFilteredBySearchStore$: Observable<ProductModel[]> =
    combineLatest([
      this.productsWithStores$,
      this.filterProducts
        .get('searchByStore')
        ?.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([products]) => {
        let change = this.filterProducts.get('searchByStore')?.value;
        //@ts-ignore
        return products.filter((product) => {
          if (change === null) {
            return true;
          } else {
            return this.searchArrayForLetter(
              product.storeIds,
              change.toString().toLowerCase()
            );
          }
        });
      })
    );
  readonly productsWithStars$: Observable<ProductQueryModel[]> =
    this.productsFilteredBySearchStore$.pipe(
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

  //create array with pages
  public pages$: Observable<number[]> = combineLatest([
    this.productsFilteredByStoreOrRating$,
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
    this.productsFilteredByStoreOrRating$,
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

  roundNumber(num: number) {
    let t = num - Math.floor(num);
    let num1;
    if (t >= 0.3 && t <= 0.7) {
      return (num1 = Math.floor(num) + 0.5);
    } else if (t > 0.7) {
      return (num1 = Math.ceil(num));
    } else {
      return (num1 = Math.floor(num));
    }
  }

  changeNumToArray(num: number) {
    let num1 = this.roundNumber(num);
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

  onRatingFilterChange(event: Event, rating: number) {
    if (this.selectedRating.includes(rating)) {
      this.selectedRating = this.selectedRating
        .filter(function (item) {
          return item !== rating;
        })
        .sort();
    } else this.selectedRating.push(rating);
    this.selectedRating.sort();
  }
  onStoreFilterChange(event: Event, store: StoreModel) {
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
