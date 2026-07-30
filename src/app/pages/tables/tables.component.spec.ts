import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Table } from '../../core/models/table.model';
import { TableService } from '../../core/services/table.service';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { TablesComponent } from './tables.component';

describe('TablesComponent', () => {
  const existingTable: Table = {
    id: 1,
    number: '10',
    capacity: 4,
    status: 'Disponible',
    isOccupied: false,
  };
  const getTables = jest.fn();
  const createTable = jest.fn();
  const updateTable = jest.fn();
  const deleteTable = jest.fn();
  const confirm = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    getTables.mockReturnValue(of([existingTable]));
    createTable.mockReturnValue(of(existingTable));
    updateTable.mockReturnValue(of(existingTable));
    deleteTable.mockReturnValue(of(undefined));
    confirm.mockReturnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [TablesComponent],
      providers: [
        {
          provide: TableService,
          useValue: { getTables, createTable, updateTable, deleteTable },
        },
        {
          provide: ConfirmationService,
          useValue: { confirm },
        },
      ],
    }).compileComponents();
  });

  it('lets the backend validate a duplicated table number', () => {
    const fixture = TestBed.createComponent(TablesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.tableForm.setValue({
      number: existingTable.number,
      capacity: existingTable.capacity,
      isOccupied: existingTable.isOccupied,
    });

    component.saveTable();

    expect(createTable).toHaveBeenCalledWith({
      number: '10',
      capacity: 4,
      isOccupied: false,
    });
  });

  it('does not delete when the Material dialog is cancelled', () => {
    const fixture = TestBed.createComponent(TablesComponent);
    const component = fixture.componentInstance;

    component.deleteTable(existingTable.id);

    expect(confirm).toHaveBeenCalledWith({
      title: 'Eliminar mesa',
      message: '¿Desea eliminar esta mesa?',
    });
    expect(deleteTable).not.toHaveBeenCalled();
  });
});
