import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog.component';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  const afterClosed = jest.fn();
  const open = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    afterClosed.mockReturnValue(of(true));
    open.mockReturnValue({ afterClosed });

    TestBed.configureTestingModule({
      providers: [
        ConfirmationService,
        {
          provide: MatDialog,
          useValue: { open },
        },
      ],
    });
  });

  it('opens the reusable Material dialog and returns its result', () => {
    const service = TestBed.inject(ConfirmationService);
    const data = {
      title: 'Eliminar mesa',
      message: '¿Desea eliminar esta mesa?',
    };
    const results: Array<boolean | undefined> = [];

    service.confirm(data).subscribe((result) => results.push(result));

    expect(open).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      expect.objectContaining({
        data,
        disableClose: true,
      }),
    );
    expect(afterClosed).toHaveBeenCalled();
    expect(results).toEqual([true]);
  });
});
