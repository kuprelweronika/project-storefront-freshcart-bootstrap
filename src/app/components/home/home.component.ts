import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriesModel } from '../../models/categories.model';
import { StoresModel } from '../../models/stores.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly categories$: Observable<CategoriesModel[]> = this._categoriesService.getAllCategories();
  readonly stores$: Observable<StoresModel[]> = this._storesService.getAllStores();

  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService) {
  }
}
