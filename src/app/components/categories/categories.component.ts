import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
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

@Component({
  selector: 'app-categories',
  styleUrls: ['./categories.component.scss'],
  templateUrl: './categories.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly order: FormControl = new FormControl('');

  //all categories for left-navbar
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  readonly limits$: Observable<number[]> = of([5, 10, 15]);

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
    this.productsSorted$,
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
    private _router: Router
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
}
