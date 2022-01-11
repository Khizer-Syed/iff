import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {
    NgbModule,
    NgbRatingModule
} from '@ng-bootstrap/ng-bootstrap';
import {UpperCaseDirective} from './directives/uppercase-mask.directive';
import {MeasuringGuideModalComponent} from './components/measuring-guide-modal/measuring-guide-modal.component';
import {SuccessModalComponent} from './components/success-modal/success-modal.component';
import {RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings} from 'ng-recaptcha';
import {environment} from '../environments/environment';
import {HttpClientModule} from '@angular/common/http';
import {LoadingButtonComponent} from './components/loading-button/loading-button.component';
import {ErrorModalComponent} from './components/error-modal/error-modal.component';

@NgModule({
    declarations: [
        AppComponent,
        UpperCaseDirective,
        MeasuringGuideModalComponent,
        SuccessModalComponent,
        ErrorModalComponent,
        LoadingButtonComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        BrowserAnimationsModule,
        AppRoutingModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        NgbRatingModule,
        RecaptchaModule,
        RecaptchaFormsModule,
    ],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.recaptchaSiteKey
            } as RecaptchaSettings
        }
    ],
    bootstrap: [AppComponent],
    entryComponents: [SuccessModalComponent]
})
export class AppModule {
}
