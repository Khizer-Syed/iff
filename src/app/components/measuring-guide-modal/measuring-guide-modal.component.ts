import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-measuring-guide-modal',
    templateUrl: 'measuring-guide-modal.component.html',
    styleUrls: ['measuring-guide-modal.component.scss']
})
export class MeasuringGuideModalComponent {
    @Output() dismiss = new EventEmitter();

    close(): void {
        this.dismiss.emit();
    }
}
