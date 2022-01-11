import { Component, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'app-modal',
    templateUrl: './error-modal.component.html',
    styles: [`
        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
    `]
})
export class ErrorModalComponent implements OnInit {
    description = '';
    @Output() cancel = new EventEmitter();
    ngOnInit(): void {
    }

    dismiss(): void {
        this.cancel.emit();
    }
}
