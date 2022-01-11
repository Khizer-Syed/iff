import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-loading-button',
    templateUrl: 'loading-button.component.html',
    styleUrls: ['loading-button.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoadingButtonComponent {
    @Input() loading = false;
    @Output() submitted = new EventEmitter();

    submit() {
        this.submitted.emit();
    }
}
