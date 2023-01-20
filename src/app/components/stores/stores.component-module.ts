import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StoresComponent } from './stores.component';
import { StoresService } from '../../services/stores.service';
import { HeaderComponentModule } from '../layout/header/header.component-module';
import { FooterComponentModule } from '../layout/footer/footer.component-module';

@NgModule({
  declarations: [StoresComponent],
  providers: [StoresService],
  exports: [StoresComponent],
  imports: [CommonModule, HeaderComponentModule, FooterComponentModule, ReactiveFormsModule],
})
export class StoresComponentModule { }
