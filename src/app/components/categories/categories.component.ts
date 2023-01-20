import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  from,
  map,
  of,
  startWith,
  tap,
} from 'rxjs';
import { ProductModel } from '../../models/product.model';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';

type NewType = ProductModel;

@Component({
  selector: 'app-categories',
  styleUrls: ['./categories.component.scss'],
  templateUrl: './categories.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  readonly paginationForm: FormGroup = new FormGroup({
    limit: new FormControl(3),
    page: new FormControl(1),
  });
  readonly limit: Observable<number[]> = of([5, 10, 15]);
  readonly orders$: Observable<string[]> = of([
    'Featured',
    'Price: Low to High',
    'Price: High to Low',
    'Avg. Rating',
  ]);

  private _orderSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    'Featured'
  );
  public order$: Observable<string> = this._orderSubject.asObservable();
  private _limitSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    5
  );
  public limit$: Observable<number> = this._limitSubject.asObservable();
  private _pageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    1
  );
  public page$: Observable<number> = this._pageSubject.asObservable();
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
  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAll(),
    this._activatedRoute.params,
  ]).pipe(
    map(([products, params]: [NewType[], Params]) => {
      return products.filter((product: ProductModel) =>
        product.categoryId.includes(params['categoryId'].toString())
      );
    })
  );

  switchSorting(products: ProductModel[], order: string) {
    switch (order) {
      case 'Price: Low to High':
        return products.sort((a, b) => {
          if (a.price > b.price) return order === 'Price: Low to High' ? 1 : -1;
          if (a.price < b.price) return order === 'Price: Low to High' ? -1 : 1;
          return 0;
        });
      case 'Price: High to Low':
        return products.sort((a, b) => {
          if (a.price < b.price) return order === 'Price: High to Low' ? 1 : -1;
          if (a.price > b.price) return order === 'Price: High to Low' ? -1 : 1;
          return 0;
        });
      case 'Featured':
        return products.sort((a, b) => {
          if (a.featureValue < b.featureValue)
            return order === 'Featured' ? 1 : -1;
          if (a.featureValue > b.featureValue)
            return order === 'Featured' ? -1 : 1;
          return 0;
        });
      case 'Avg. Rating':
        return products.sort((a, b) => {
          if (a.ratingValue < b.ratingValue)
            return order === 'Avg. Rating' ? 1 : -1;
          if (a.ratingValue > b.ratingValue)
            return order === 'Avg. Rating' ? -1 : 1;
          return 0;
        });
      default:
        return products;
    }
  }

  readonly productsSorted$: Observable<ProductModel[]> = combineLatest([
    this.products$,
    this.order$,
  ]).pipe(
    map(([products, order]: [ProductModel[], string]) => {
      return this.switchSorting(products, order);
    })
  );

  public pages$: Observable<number[]> = combineLatest([
    this.productsSorted$,
    this.limit$,
    this.page$,
  ]).pipe(
    map(([data, limit, page]) => {
      return Array.from({ length: data.length / limit }, (_, i) => i + 1);
    })
  );

  readonly productsWithPag$: Observable<ProductModel[]> = combineLatest([
    this.paginationForm.valueChanges.pipe(startWith({ limit: 5, page: 1 })),
    this.productsSorted$,
  ]).pipe(
    map(([form, products]) =>
      products.slice(form.page - 1 * form.limit, form.limit * form.page)
    )
  );

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) {}
  sort(order: string): void {
    this._orderSubject.next(order);
    console.log(order);
  }

  setPage(page: number): void {
    this._pageSubject.next(page);
  }
  setLimit(limit: number): void {
    this._limitSubject.next(limit);
  }

  onPaginationFormSubmitted(paginationForm: FormGroup): void {}
}
