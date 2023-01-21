import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoryModel } from '../../../models/category.model';
import { CategoriesService } from '../../../services/categories.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  private _menuTogglerSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  public menuToggler$: Observable<boolean> =
    this._menuTogglerSubject.asObservable();

  toggleMenu() {
    this._menuTogglerSubject.next(!this._menuTogglerSubject.value);
  }

  constructor(private _categoriesService: CategoriesService) {}
}
