import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../components/confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  constructor(private readonly dialog: MatDialog) {}

  confirm(data: ConfirmationDialogData): Observable<boolean | undefined> {
    return this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(
        ConfirmationDialogComponent,
        {
          data,
          width: 'min(420px, calc(100vw - 32px))',
          disableClose: true,
          autoFocus: false,
        },
      )
      .afterClosed();
  }
}
