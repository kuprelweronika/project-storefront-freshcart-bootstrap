import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import { CarouselCategoriesComponent } from './carousel-categories.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';

@NgModule({
  imports: [CommonModule, CarouselModule],
  declarations: [CarouselCategoriesComponent],
  providers: [],
  exports: [CarouselCategoriesComponent],
})
export class CarouselCategoriesComponentModule {}
