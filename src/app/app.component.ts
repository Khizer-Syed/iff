import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ContainerSize,
  ContainerType,
  DimensionalUnit,
  Prompt,
  ShippingMode,
  ShippingPoint,
  ShippingVolume,
  TermsOfSale,
  WeightUnit
} from './constants';
import { QuoteService } from './services/quote.service';
import { ModalService } from './services/modal.service';
import { nonZeroValidator } from './validators/non-zero.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentYear = new Date().getFullYear();
  customerQuote: FormGroup;
  shippingPoint = ShippingPoint;
  shippingMode = ShippingMode;
  shippingVolume = ShippingVolume;
  dimensionalUnit = DimensionalUnit;
  weightUnit = WeightUnit;
  containerType = ContainerType;
  containerSize = ContainerSize;
  prompt = Prompt;
  termsOfSale = TermsOfSale;
  get f(): any {
    return this.customerQuote.controls;
  }

  get c(): FormArray {
    return this.f.items as FormArray;
  }

  constructor(private fb: FormBuilder, private quoteService: QuoteService, private modalService: ModalService) {
    this.customerQuote = this.fb.group({
      name: ['', Validators.required],
      company: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      shippingInfo: this.fb.group({
        origin: this.fb.group({
          from: ['', [Validators.required]],
          pickupPoint: [ShippingPoint.Door, [Validators.required]]
        }),
        destination: this.fb.group({
          to: ['', [Validators.required]],
          deliveryPoint: [ShippingPoint.Door, [Validators.required]]
        }),
        shippingMode: [ShippingMode.Air, [Validators.required]],
      }),
      items: this.fb.array([], Validators.required),
      totalVolumeWeight: ['0.000 kg'],
      totalActualWeight: ['0.000 kg'],
      token: [null, [Validators.required]],
      hazardous: [Prompt.No, Validators.required],
      termsOfSale: [TermsOfSale.ExWorks]
    });
    this.addControl();
  }

  getArrayControls(): FormGroup[] {
    return this.c.controls as FormGroup[];
  }

  addControl(): void {
    this.c.push(this.fb.group({
      length: [0, [Validators.required, nonZeroValidator()]],
      width: [0, [Validators.required, nonZeroValidator()]],
      height: [0, [Validators.required, nonZeroValidator()]],
      dimensionalUnit: [DimensionalUnit.cm, [Validators.required]],
      weight: [0, [Validators.required, nonZeroValidator()]],
      weightUnit: [WeightUnit.kgs, [Validators.required]],
      qty: [1, [Validators.required]],
      volumeWeight: ['0.000 kg', [Validators.required]],
      actualWeight: ['0.000 kg', [Validators.required]]
    }));
  }


  removeControl(i: number): void {
    this.c.removeAt(i);
  }

  changeShippingMode(value: ShippingMode): void {
    const shippingInfo = this.customerQuote.get('shippingInfo') as FormGroup;
    if (value === ShippingMode.Ocean || value === ShippingMode.Land) {
      shippingInfo.addControl('shippingVolume', this.fb.control(ShippingVolume.LCL, [Validators.required]));
    } else {
      shippingInfo.removeControl('shippingVolume');
      shippingInfo.removeControl('containerType');
      shippingInfo.removeControl('containerSize');
    }
    this.customerQuote.setControl('items', this.fb.array([], Validators.required));
    this.customerQuote.setControl('totalVolumeWeight', this.fb.control('0.000 kg', Validators.required));
    this.customerQuote.setControl('totalActualWeight', this.fb.control('0.000 kg', Validators.required));
    this.addControl();
  }

  checkToAddItems(): boolean {
    const shippingInfo = this.customerQuote.get('shippingInfo') as FormGroup;
    const shippingMode = shippingInfo.get('shippingMode')?.value;
    if (shippingMode) {
      return shippingMode === ShippingMode.Air ||
        ((shippingMode === ShippingMode.Ocean || shippingMode === ShippingMode.Land)
          && shippingInfo.get('shippingVolume')?.value === ShippingVolume.LCL);
    }
    return false;
  }

  changeShippingVolume(value: ShippingVolume): void {
    const shippingInfo = this.customerQuote.get('shippingInfo') as FormGroup;
    if (value === ShippingVolume.FCL) {
      shippingInfo.addControl('containerType', this.fb.control(ContainerType.Dry, [Validators.required]));
      shippingInfo.addControl('containerSize', this.fb.control(ContainerSize['20ft'], [Validators.required]));
      this.customerQuote.removeControl('items');
      this.customerQuote.removeControl('totalVolumeWeight');
      this.customerQuote.removeControl('totalActualWeight');
    } else {
      shippingInfo.removeControl('containerType');
      shippingInfo.removeControl('containerSize');
      this.customerQuote.addControl('items', this.fb.array([], Validators.required));
      this.customerQuote.addControl('totalVolumeWeight', this.fb.control('0.000 kg', Validators.required));
      this.customerQuote.addControl('totalActualWeight', this.fb.control('0.000 kg', Validators.required));
      this.addControl();
    }
  }

  resetForm(): void {
    this.customerQuote.reset({
      name: '',
      company: '',
      email: '',
      phone: '',
      shippingInfo: {
        origin: {
          from: '',
          pickupPoint: ShippingPoint.Door
        },
        destination: {
          to: '',
          deliveryPoint: ShippingPoint.Door
        },
        shippingMode: ShippingMode.Air
      },
      token: null,
      items: [{
        length: 0,
        width: 0,
        height: 0,
        dimensionalUnit: DimensionalUnit.cm,
        weight: 0,
        weightUnit: WeightUnit.kgs,
        qty: 1,
        volumeWeight: '0.000 kg',
        actualWeight: '0.000 kg'
      }],
      totalVolumeWeight: '0.000 kg',
      totalActualWeight: '0.000 kg',
      hazardous: Prompt.No,
      termsOfSale: TermsOfSale.ExWorks
    });
  }

  requestQuote(): void {
    if (this.customerQuote.valid) {
      this.quoteService.addOne(this.customerQuote.value)
        .subscribe(() => {
          this.modalService.openDismissibleSuccessModal();
          this.resetForm();
        });
    }
  }

  calculateVolumeWeight(index: number): void {
    if (this.validateItem()) {
      const { length, width, height, dimensionalUnit, qty } = this.c.get([index])!.value;
      this.c.get([index, 'volumeWeight'])?.patchValue(
        Number(length * width * height * qty / 6000 * (dimensionalUnit === DimensionalUnit.cm ? 1 : 2.54 ** 3)).toFixed(3) + ' kg');
    } else {
      this.c.get([index, 'volumeWeight'])?.patchValue('0.000 kg');
    }
    this.calculateTotalVolumeWeight();
  }

  calculateWeight(index: number): void {
    if (this.validateItem()) {
      const { weight, weightUnit, qty } = this.c.get([index])!.value;
      this.c.get([index, 'actualWeight'])?.patchValue(
        (weightUnit === WeightUnit.kgs ? Number(weight * qty).toFixed(3) : Number(weight * qty / 2.20462).toFixed(3)) + ' kg'
      );
    } else {
      this.c.get([index, 'actualWeight'])?.patchValue('0.000 kg');
    }
    this.calculateTotalWeight();
  }

  validateItem(): boolean {
    const shippingInfo = (this.customerQuote.get('shippingInfo') as FormGroup)?.value;
    return (shippingInfo &&
      (shippingInfo.shippingMode === ShippingMode.Air ||
        ((shippingInfo.shippingMode === ShippingMode.Ocean || shippingInfo.shippingMode === ShippingMode.Land) &&
          shippingInfo.shippingVolume === ShippingVolume.LCL)));
  }

  calculateTotalWeight(): void {
    this.customerQuote.get('totalActualWeight')?.patchValue(Number(this.c.value.reduce((sum: number, elem: any) => {
      return sum + (elem.weightUnit === WeightUnit.kgs ? (elem.weight * elem.qty) : (elem.weight * elem.qty / 2.20462));
    }, 0)).toFixed(3) + ' kg');
  }

  calculateTotalVolumeWeight(): void {
    this.customerQuote.get('totalVolumeWeight')?.patchValue(Number(this.c.value.reduce((sum: number, elem: any) => {
      return sum + (elem.length * elem.width * elem.height * elem.qty / 6000 *
        (elem.dimensionalUnit === DimensionalUnit.cm ? 1 : 2.54 ** 3));
    }, 0)).toFixed(3) + ' kg');
  }

  updateQty(i: number): void {
    this.calculateVolumeWeight(i);
    this.calculateWeight(i);
  }

  openMeasuringGuide(): void {
    this.modalService.openMeasuringGuideModal();
  }

  changeHazardRating(val: Prompt): void {
    if (val === Prompt.Yes) {
      this.customerQuote.setControl('unNumber', this.fb.control('', Validators.required));
      this.customerQuote.setControl('pageNumber', this.fb.control(''));
      this.customerQuote.setControl('classNumber', this.fb.control(''));
      this.customerQuote.setControl('packingGroup', this.fb.control(''));
    } else {
      this.customerQuote.removeControl('unNumber');
      this.customerQuote.removeControl('pageNumber');
      this.customerQuote.removeControl('classNumber');
      this.customerQuote.removeControl('packingGroup');
    }
  }

  changeTermsOfSale(val: TermsOfSale): void {
    if (val === TermsOfSale.Other) {
      this.customerQuote.setControl('termsOfSaleOther', this.fb.control(''));
    } else {
      this.customerQuote.removeControl('termsOfSaleOther');
    }
  }
}
