import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import {CategoriesService} from "../../services/categories.service";

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [HomeComponent],
  providers: [CategoriesService],
  exports: [HomeComponent]
})
export class HomeComponentModule {
}
