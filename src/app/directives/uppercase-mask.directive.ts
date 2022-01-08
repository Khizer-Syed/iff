import { Directive, OnInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[appUppercaseMask]'
})
export class UpperCaseDirective implements OnInit, OnDestroy {

    private sub?: Subscription;

    constructor(private _ngControl: NgControl) {
    }

    ngOnInit() {
        this.formatValue();
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    formatValue() {
        if (this._ngControl && this._ngControl.control) {
            this.sub = this._ngControl.control.valueChanges.subscribe(data => {
                this._ngControl!.control!.setValue(data.toUpperCase(), { emitEvent: false });
            });
        }
    }
}
