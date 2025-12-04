import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closable: boolean = true;
  @Input() showFooter: boolean = true;
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isOpen) {
      this.disableScroll();
    }
  }

  ngOnDestroy(): void {
    this.enableScroll();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.disableScroll();
    } else {
      this.enableScroll();
    }
  }

  onClose(): void {
    if (this.closable) {
      this.close.emit();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closable) {
      this.onClose();
    }
  }

  private disableScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private enableScroll(): void {
    document.body.style.overflow = '';
  }
}
