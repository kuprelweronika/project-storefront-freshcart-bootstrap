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
import { NumberFormatStyle } from '@angular/common';

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

  readonly ratingByStar: FormGroup = new FormGroup({
    rating2: new FormControl(false),
    rating3: new FormControl(false),
    rating4: new FormControl(false),
    rating5: new FormControl(false),
  });

  selectedStore: string[] = [];

  createFormControl(stores: StoreModel[]) {
    stores.forEach((s) =>
      this.filterByStore.addControl(s.id, new FormControl(false))
    );
  }
  readonly filterByStore: FormGroup = new FormGroup({});

  readonly stores$: Observable<StoreModel[]> = this._storesService
    .getAllStores()
    .pipe(tap((stores) => this.createFormControl(stores)));

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

  status: boolean = true;

  //subject for active state of pagination button
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

  sortData(products: ProductModel[], order: SortQueryModel) {
    if (order.direction === 'asc') {
      //@ts-ignore
      return products.sort((a, b) => (a[order.ids] > b[order.ids] ? 1 : -1));
    } else {
      //@ts-ignore
      return products.sort((a, b) => (a[order.ids] > b[order.ids] ? -1 : 1));
    }
  }
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

  filterByStoreAndRating(
    products: ProductModel[],
    selectedStore: string[],
    selectedRating: number[]
  ) {
    return products.filter((product) => {
      if (
        selectedStore.every((ai) => ai === '0') &&
        selectedRating.every((ai) => ai === 0)
      ) {
        return true;
      } else if (
        selectedStore.some((ai) => ai !== '0') &&
        selectedRating.some((ai) => ai !== 0)
      ) {
        return (
          selectedStore.some((ai) => product.storeIds.includes(ai)) &&
          selectedRating.includes(this.roundNumber(product.ratingValue))
        );
      } else if (selectedStore.some((ai) => ai !== '0')) {
        return selectedStore.some((ai) => product.storeIds.includes(ai));
      } else if (selectedRating.some((ai) => ai !== 0)) {
        return selectedRating.includes(this.roundNumber(product.ratingValue));
      } else {
        return true;
      }
    });
  }

  filterByPrice(products: ProductModel[], priceFrom: number, priceTo: number) {
    if (priceFrom === null && priceTo === null) {
      return products;
    } else if (priceFrom > 1) {
      return products.filter(
        (product) => product.price > priceFrom && product.price < priceTo
      );
    } else {
      return products.filter(
        (product) => product.price > priceFrom && product.price < priceTo
      );
    }
  }
  //list of all products for special category from activatedRoute
  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAll(),
    this._activatedRoute.params,
  ]).pipe(
    map(([products, params]: [ProductModel[], Params]) => {
      return products.filter((product: ProductModel) =>
        product.categoryId.includes(params['categoryId'].toString())
      );
    }),
    shareReplay()
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

  readonly productsFiltered$: Observable<ProductModel[]> = combineLatest([
    this.stores$,
    this.productsSorted$,
    //@ts-ignore
    this.filterByStore.valueChanges.pipe(startWith([])),
    //@ts-ignore
    this.ratingByStar.valueChanges.pipe(startWith([])),
    //@ts-ignore
    this.filterProducts.get('priceFrom').valueChanges.pipe(startWith(1)),
    //@ts-ignore
    this.filterProducts.get('priceTo').valueChanges.pipe(startWith(2000)),
  ]).pipe(
    map(
      ([stores, products, changeStore, changeStar, priceFrom, priceTo]: [
        StoreModel[],
        ProductModel[],
        number,
        number,
        number,
        number
      ]) => {
        let selectedStore: string[] = [];
        stores.forEach((store: StoreModel) => {
          let name = this.filterByStore.get(store.id.toString())?.value
            ? store.id.toString()
            : '0';
          selectedStore.push(name);
        });

        let rating5 = this.ratingByStar.get('rating5')?.value ? 5 : 0;
        let rating4 = this.ratingByStar.get('rating4')?.value ? 4 : 0;
        let rating3 = this.ratingByStar.get('rating3')?.value ? 3 : 0;
        let rating2 = this.ratingByStar.get('rating2')?.value ? 2 : 0;

        let selectedRating = [rating2, rating3, rating4, rating5];

        products = this.filterByStoreAndRating(
          products,
          selectedStore,
          selectedRating
        );

        return this.filterByPrice(products, priceFrom, priceTo);
      }
    )
  );

  readonly productsWithStores$: Observable<ProductModel[]> = combineLatest([
    this.productsFiltered$,
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
        storeIds: (product.storeIds ?? []).map((id) => storeMap[id]?.name),
        id: product.id,
      }));
    })
  );

  readonly storesFilteredBySearch$: Observable<StoreModel[]> = combineLatest([
    this.stores$,
    this.filterProducts.get('searchByStore')?.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([stores]) => {
      let change = this.filterProducts.get('searchByStore')?.value;

      //@ts-ignore
      return stores.filter((store) => {
        if (change === null) {
          return true;
        } else {
          return store.name.toLowerCase().includes(change.toLowerCase());
        }
      });
    })
  );

  readonly productsWithStars$: Observable<ProductQueryModel[]> =
    this.productsWithStores$.pipe(
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
  readonly pages$: Observable<number[]> = combineLatest([
    this.productsWithStars$,
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
  readonly productsWithPage$: Observable<ProductQueryModel[]> = combineLatest([
    this.paginationState,
    this.productsWithStars$,
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
  isList(click: boolean) {
    this.status = click;
  }
}
