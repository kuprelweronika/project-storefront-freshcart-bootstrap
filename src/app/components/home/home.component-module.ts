import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { HeaderComponentModule } from '../layout/header/header.component-module';
import { FooterComponentModule } from '../layout/footer/footer.component-module';

@NgModule({
  declarations: [HomeComponent],
  providers: [],
  exports: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponentModule,
    FooterComponentModule,
  ],
})
export class HomeComponentModule {}
