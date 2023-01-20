import { NgModule } from '@angular/core';
import { StoresComponent } from './stores.component';
import { StoresService } from '../../services/stores.service';

@NgModule({
  imports: [],
  declarations: [StoresComponent],
  providers: [StoresService],
  exports: [StoresComponent],
})
export class StoresComponentModule {}
