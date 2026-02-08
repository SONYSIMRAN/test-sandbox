import { LightningElement, api } from 'lwc';

export default class DxVisTextInfo extends LightningElement {

    @api textType;
    @api makeFalseGreen = false;

    get textPass() {
        return this.textType?.toString().toLowerCase() === 'pass' ? true : false
    };
    get textFail() {
        return this.textType?.toString().toLowerCase() === 'fail' ? true : false
    };
    get textTrue() {
        return this.textType?.toString().toLowerCase() === 'true' ? true : false
    };
    get textFalse() {
        return this.textType?.toString().toLowerCase() === 'false' ? true : false
    };
    get falseGreen() {
        return this.makeFalseGreen ? true : false;
    };
    get isTextTypeProvided() {
        return this.textPass || this.textFail || this.textTrue || this.textFalse;
    }
}