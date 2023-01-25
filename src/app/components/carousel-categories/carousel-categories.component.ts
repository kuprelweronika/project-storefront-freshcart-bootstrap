import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-carousel-categories',
  styleUrls: ['./carousel-categories.component.scss'],
  templateUrl: './carousel-categories.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselCategoriesComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  constructor(private _categoriesService: CategoriesService) {}
}
