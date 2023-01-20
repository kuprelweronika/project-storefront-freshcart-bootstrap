import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { StoresComponent } from './components/stores/stores.component';
import { HomeComponentModule } from './components/home/home.component-module';
import { CategoriesComponentModule } from './components/categories/categories.component-module';
import { StoresComponentModule } from './components/stores/stores.component-module';
import { FooterComponentModule } from './components/layout/footer/footer.component-module';
import { HeaderComponentModule } from './components/layout/header/header.component-module';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categories/:categoryId', component: CategoriesComponent },
  { path: 'stores/:storeId', component: StoresComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    HomeComponentModule,
    CategoriesComponentModule,
    StoresComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
