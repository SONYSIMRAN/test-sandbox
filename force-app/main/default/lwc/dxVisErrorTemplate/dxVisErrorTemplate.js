import { LightningElement } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import bootstrap from '@salesforce/resourceUrl/bootstrap';


export default class DxVisErrorTemplate extends LightningElement {
    renderedCallback() {
        Promise.all([
            loadStyle(this, bootstrap + '/bootstrap/bootstrap.css'),
        ]).then(() => {
            this.d3Initialized = true;
            console.log('CSS framework loaded.');
        })
            .catch(error => {
                console.log(error);
            });
    };
}