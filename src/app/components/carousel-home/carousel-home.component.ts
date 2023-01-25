import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-carousel-home',
  styleUrls: ['./carousel-home.component.scss'],
  templateUrl: './carousel-home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselHomeComponent {
}
