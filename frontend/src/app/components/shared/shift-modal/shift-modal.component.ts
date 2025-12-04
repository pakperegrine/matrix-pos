import { Component, OnInit } from '@angular/core';
import { ShiftService } from '../../../services/shift.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-shift-modal',
  standalone: false,
  templateUrl: './shift-modal.component.html',
  styleUrls: ['./shift-modal.component.scss']
})
export class ShiftModalComponent implements OnInit {
  showModal = false;
  openingFloat = 100;
  notes = '';
  isLoading = false;

  constructor(
    private shiftService: ShiftService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to shift requirement
    this.shiftService.shiftRequired$.subscribe(required => {
      this.showModal = required;
    });
  }

  openShift(): void {
    if (this.openingFloat < 0) {
      this.toastService.error('Opening float must be a positive number');
      return;
    }

    this.isLoading = true;
    this.shiftService.openShift({
      openingFloat: this.openingFloat,
      notes: this.notes
    }).subscribe({
      next: (shift) => {
        this.toastService.success('Shift opened successfully');
        this.showModal = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error opening shift:', error);
        this.toastService.error(error.error?.message || 'Failed to open shift');
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    // Users who require shifts cannot cancel
    // They must open a shift to continue
    this.toastService.warning('You must open a shift to continue working');
  }
}
