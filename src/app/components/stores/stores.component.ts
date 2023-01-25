import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-stores',
  styleUrls: ['./stores.component.scss'],
  templateUrl: './stores.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresComponent {
  readonly store$: Observable<StoreModel> = this._activatedRoute.params.pipe(
    switchMap((data) => this._storesService.getStore(data['storeId']))
  );

  readonly search: FormGroup = new FormGroup({ product: new FormControl() });
  private _startsWithSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public startsWith$: Observable<string> =
    this._startsWithSubject.asObservable();

  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAll(),
    this._activatedRoute.params,
  ]).pipe(
    map(([products, params]: [ProductModel[], Params]) => {
      return products.filter((product: ProductModel) =>
        product.storeIds.includes(params['storeId'].toString())
      );
    })
  );

  readonly productsSearch$: Observable<ProductModel[]> = combineLatest([
    this.products$,
    this.startsWith$,
  ]).pipe(
    map(([products, startsWith]) => {
      if (!startsWith) {
        return products;
      }
      return products.filter((product) =>
        product.name.toLowerCase().includes(startsWith.toLowerCase())
      );
    })
  );

  constructor(
    private _storesService: StoresService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) {}

  onSearchSubmitted(search: FormGroup): void {
    this._startsWithSubject.next(search.get('product')?.value);
  }
}
