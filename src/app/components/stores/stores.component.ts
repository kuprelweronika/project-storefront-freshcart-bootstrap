import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-stores',
  styleUrls: ['./stores.component.scss'],
  templateUrl: './stores.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoresComponent {
}
