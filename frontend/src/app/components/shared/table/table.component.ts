import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  formatter?: (value: any) => string;
}

export interface TableData {
  data: any[];
  page: number;
  perPage: number;
  total: number;
}

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: TableData = { data: [], page: 1, perPage: 25, total: 0 };
  @Input() loading: boolean = false;
  @Input() selectable: boolean = false;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() rowSelect = new EventEmitter<any>();
  
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedRows: Set<any> = new Set();
  Math = Math; // Make Math available in template

  ngOnInit(): void {}

  get totalPages(): number {
    return Math.ceil(this.data.total / this.data.perPage);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.data.page;
    const delta = 2;
    
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // -1 represents dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.data.page) {
      this.pageChange.emit(page);
    }
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;
    
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    
    this.sortChange.emit({ column: column.key, direction: this.sortDirection });
  }

  onRowClick(row: any): void {
    if (this.selectable) {
      if (this.selectedRows.has(row)) {
        this.selectedRows.delete(row);
      } else {
        this.selectedRows.add(row);
      }
      this.rowSelect.emit(Array.from(this.selectedRows));
    }
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  getCellValue(row: any, column: TableColumn): string {
    const value = row[column.key];
    return column.formatter ? column.formatter(value) : value;
  }
}
