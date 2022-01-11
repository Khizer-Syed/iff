import express, { Request, Response } from 'express';

const router = express.Router();
import { pick, get } from 'lodash';
import axios from 'axios';
import { sendEmail } from '../../lib/utils/email/send-email';

router.post('', async (req: Request, res: Response) => {
    try {
        const requestDetails = pick(req.body, ['name', 'email', 'company', 'phone', 'shippingInfo', 'items', 'token', 'totalVolumeWeight', 'totalActualWeight', 'hazardous', 'termsOfSale', 'termsOfSaleOther', 'unNumber', 'pageNumber', 'classNumber', 'packingGroup']);
        if (validateQuote(requestDetails, res)) {
            const params = new URLSearchParams();
            params.append('secret', process.env.G_CAPTCHA_SECRET);
            params.append('response', requestDetails.token);
            const {data} = await axios.post('https://www.google.com/recaptcha/api/siteverify', params);
            if (data.success) {
                sendEmail(process.env.SUPERVISOR_EMAIL, [], 'Quote Request', getQuoteRequestTemplate(requestDetails))
                    .then(() => {
                        res.send();
                    }).catch((e: Error) => {
                    res.status(400).send({errors: [{message: e}]});
                });
            } else {
                res.status(400).send({errors: [{message: data['error-codes'][0]}]});
            }
        }
    } catch (e) {
        console.error(e);
        res.status(400).send({errors: [{message: e}]});
    }
});

const validateQuote = (requestDetails: any, res: express.Response) => {
    const shippingInfo = pick(requestDetails.shippingInfo, ['origin', 'destination', 'shippingMode', 'shippingVolume', 'containerType', 'containerSize']);
    const origin = pick(shippingInfo.origin, ['from', 'pickupPoint']);
    const destination = pick(shippingInfo.destination, ['to', 'deliveryPoint']);

    const validateItems = (items: any) => validateArrayObject(items, ['length', 'width', 'height', 'weight', 'qty', 'dimensionalUnit', 'weightUnit', 'volumeWeight', 'actualWeight'], res);
    if (validateObject(requestDetails, ['name', 'email', 'phone', 'token'], res) &&
        validateEnumField('shippingMode', shippingInfo.shippingMode, ['Air', 'Ocean', 'Land'], res) &&
        validateObject(origin, ['from', 'pickupPoint'], res) &&
        validateObject(destination, ['to', 'deliveryPoint'], res) &&
        validateEnumField('hazardous', requestDetails.hazardous, ['Yes', 'No'], res)) {
        if ((shippingInfo.shippingMode === 'Ocean' || shippingInfo.shippingMode === 'Land') &&
            validateEnumField('shippingVolume', shippingInfo.shippingVolume, ['LCL', 'FCL'], res)) {
            return (shippingInfo.shippingVolume === 'LCL' && validateItems(requestDetails.items) && validateObject(requestDetails, ['totalVolumeWeight', 'totalActualWeight'], res)) ||
                (shippingInfo.shippingVolume === 'FCL' && validateEnumField('containerType', shippingInfo.containerType, ['Dry', 'Refrigerated'], res) &&
                    validateEnumField('containerSize',
                        shippingInfo.containerSize, ['20 ft.', '40 ft.', '40 ft. high-cube', '45 ft.'], res));
        } else {
            return shippingInfo.shippingMode === 'Air' && validateItems(requestDetails.items) && validateObject(requestDetails, ['totalVolumeWeight', 'totalActualWeight'], res);
        }
    }
    return false;
};

function validateArrayObject(objArray: any, arrProps: string[], res: express.Response, name = '') {
    let message = '';
    if (!objArray.length) {
        res.status(400).send({errors: [{message: `Missing parameters: ${[name].join(', ')}`}]});
        return false;
    }
    objArray.forEach((obj: any, index: number) => {
        const missing: string[] = [];
        arrProps.forEach((prop: string) => {
            const val = get(obj, prop);
            if (val === undefined || val === null || val === '') {
                missing.push(prop);
            }
        });
        if (missing.length) {
            message += `Missing parameters at ${name} position ${index + 1}: ${missing.join(', ')}.`;
        }
    });
    if (message) {
        res.status(400).send({errors: [{message: `Missing parameters: ${[name].join(', ')}`}]});
        return false;
    }
    return true;
}

function validateObject(obj: any, arrProps: string[], res: express.Response) {
    const missing: string[] = [];
    arrProps.forEach(prop => {
        const val = get(obj, prop);
        if (val === undefined || val === null || val === '') {
            missing.push(prop);
        }
    });
    if (missing.length) {
        res.status(400).send({errors: [{message: `Missing parameters: ${[missing].join(', ')}`}]});
        return false;
    }
    return true;
}


const validateEnumField = (fieldName: string, val: string, allowedValues: string[], res: express.Response) => {
    if (!allowedValues.includes(val)) {
        res.status(400).send({errors: [{message: `Invalid value (${val}) provided for field ${fieldName}`}]});
        return false;
    }
    return true;
};

function getQuoteRequestTemplate(requestDetails: any) {
    const {shippingInfo} = requestDetails;
    const tdWithCustomStyle = (val: string) => `<td style="border: 1px solid #eee; padding: 4px 8px;">${val}</td>`;
    const totalWeightRow = () => `
        <tr>
            ${tdWithCustomStyle('Total Volume Weight')}
            ${tdWithCustomStyle(requestDetails.totalVolumeWeight)}
        </tr>
        <tr>
            ${tdWithCustomStyle('Total Actual Weight')}
            ${tdWithCustomStyle(requestDetails.totalActualWeight)}
        </tr>
    `;
    return addDisclaimer(`
        <p>Hi,</p>
        <p>A new Quote request is submitted and needs your attention. Please find the details below</p>
        <h3>Customer Information</h3>
        <table style="border-collapse: collapse">
            <tr>
                ${tdWithCustomStyle('Name')}
                ${tdWithCustomStyle(requestDetails.name)}
            </tr>
            ${requestDetails.company ? `<tr>
                ${tdWithCustomStyle('Company')}
                ${tdWithCustomStyle(requestDetails.company)}
            </tr>` : ''}
            <tr>
                ${tdWithCustomStyle('Email')}
                ${tdWithCustomStyle(requestDetails.email)}
            </tr>
            <tr>
                ${tdWithCustomStyle('Phone')}
                ${tdWithCustomStyle(requestDetails.phone)}
            </tr>
        </table>
        <h3>Shipping Information</h3>
        <table style="border-collapse: collapse">
             <tr>
                ${tdWithCustomStyle('Shipping Mode')}
                ${tdWithCustomStyle(shippingInfo.shippingMode)}
            </tr>
            <tr>
                ${tdWithCustomStyle('Origin')}
                ${tdWithCustomStyle(`<p>${shippingInfo.origin.from}<br/>Pickup from: ${requestDetails.shippingInfo.origin.pickupPoint}</p>`)}
            </tr>
            <tr>
                ${tdWithCustomStyle('Destination')}
                ${tdWithCustomStyle(`<p>${shippingInfo.destination.to}<br/>Delivery at: ${requestDetails.shippingInfo.destination.deliveryPoint}</p>`)}
            </tr>
            ${shippingInfo.shippingMode === 'Ocean' || shippingInfo.shippingMode === 'Land' ? `
            <tr>
                ${tdWithCustomStyle('Shipping Volume')}
                ${tdWithCustomStyle(shippingInfo.shippingVolume)}
            </tr>
            ${shippingInfo.shippingVolume === 'FCL' ? `
            <tr>
                ${tdWithCustomStyle('Container Type')}
                ${tdWithCustomStyle(shippingInfo.containerType)}
            </tr>
            <tr>
                ${tdWithCustomStyle('Container Size')}
                ${tdWithCustomStyle(shippingInfo.containerSize)}
            </tr>
            ` : totalWeightRow()}
            ` : totalWeightRow()}
        </table>
        ${requestDetails.items && requestDetails.items.length ? `
        <h3>Item(s) Details</h3>
        <table style="border-collapse: collapse">
            <thead>
                <tr>
                    <th style="border: 1px solid #eee; padding: 4px 8px; text-align: start;">Dimensions</th>
                    <th style="border: 1px solid #eee; padding: 4px 8px; text-align: start;">Calc Vol. Weight</th>
                    <th style="border: 1px solid #eee; padding: 4px 8px; text-align: start;">Actual Weight</th>
                </tr>
            </thead>
            <tbody>
                ${requestDetails.items.map((item: any) => `
                <tr>
                    ${tdWithCustomStyle(`${item.length.toFixed(2)} ${item.dimensionalUnit} * ${item.width.toFixed(2)} ${item.dimensionalUnit} * ${item.height.toFixed(2)} ${item.dimensionalUnit}`)}
                    ${tdWithCustomStyle(item.volumeWeight)}
                    ${tdWithCustomStyle(item.actualWeight)}
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        <h3>Additional Information</h3>
        <table style="border-collapse: collapse">
            <tr>
                ${tdWithCustomStyle('Terms of Sale')}
                ${tdWithCustomStyle(requestDetails.termsOfSale === 'other' ? requestDetails.termsOfSaleOther : requestDetails.termsOfSale)}
            </tr>
            <tr>
                ${tdWithCustomStyle('Hazardous')}
                ${tdWithCustomStyle(`<p>${requestDetails.hazardous}</p>${requestDetails.hazardous === 'Yes' ? `
                <p>UN Number: ${requestDetails.unNumber}</p>
                ${requestDetails.pageNumber ? `<p>Page Number: ${requestDetails.pageNumber}</p>` : ''}
                ${requestDetails.classNumber ? `<p>Class Number: ${requestDetails.classNumber}</p>` : ''}
                ${requestDetails.packingGroup ? `<p>Packing Group: ${requestDetails.packingGroup}</p>` : ''}
                ` : ''}`)}
            </tr>
        </table>
    `);
}

function addDisclaimer(template: string) {
    return `
            <div style="background: #f3f3f3;">
                <div style="margin: 0 auto; max-width: 600px; padding: 16px; font-size: 16px; background: #ffffff;">
                    <div style="width: 100%;">
                        <div style="width: 175px; margin: 0 auto 24px auto;">
                            <img src="https://www.iffcargo.com/assets/img/logo.png" alt="IFF Cargo logo" width="175" height="68" style="aspect-ratio: auto 175 / 68;">
                        </div>
                    </div>
                    ${template}
                    <p>Thanks,</p>
                    <p>IFF Cargo Team</p><br />
                    <hr style="border-top: 1px solid #e6e6e6;">
                    <p style="font-family: Arial, sans-serif; color: rgb(128, 128, 128); font-size: x-small">The information contained in this e-mail message and/or attachments to it may contain confidential or privileged information. If you are not the intended recipient, any dissemination, use, review, distribution, printing or copying of the information contained in this e-mail message and/or attachments to it are strictly prohibited. If you have received this communication in error, please notify us by reply e-mail or telephone and immediately and permanently delete the message and any attachments. Thank you</p>
                </div>
            </div>`;
}

export { router as quotesRouter };
