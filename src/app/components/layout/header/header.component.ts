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
  isCollapsed = false;
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  private _menuToggleSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public menuToggle$: Observable<boolean> =
    this._menuToggleSubject.asObservable();

  constructor(private _categoriesService: CategoriesService) {}

  toggleMenu() {
    this._menuToggleSubject.next(!this.menuToggle$);
  }
}
