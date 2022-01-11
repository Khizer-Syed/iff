import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';
import {MeasuringGuideModalComponent} from '../components/measuring-guide-modal/measuring-guide-modal.component';
import {SuccessModalComponent} from '../components/success-modal/success-modal.component';
import {ErrorModalComponent} from '../components/error-modal/error-modal.component';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    constructor(private ngbModal: NgbModal) {
    }
    openMeasuringGuideModal(): void {
        const modalRef = this.ngbModal.open(MeasuringGuideModalComponent, {centered: true, size: 'lg'});
        modalRef.componentInstance.dismiss.pipe(take(1)).subscribe(() => {
            modalRef.close();
        });
    }

    openDismissibleSuccessModal(seconds = 2000): void {
        const modalRef = this.ngbModal.open(SuccessModalComponent, {centered: true, size: 'lg', backdrop: 'static'});
        setTimeout(() => {
            modalRef.close();
        }, seconds);
    }

    openErrorModal(message: string = 'Unknown Error occurred') {
        const modalRef = this.ngbModal.open(ErrorModalComponent, {centered: true, size: 'lg'});
        modalRef.componentInstance.description = message;
        modalRef.componentInstance.cancel.pipe(take(1)).subscribe(() => {
            modalRef.close();
        });
    }
}
