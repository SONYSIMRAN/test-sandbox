import { LightningElement } from 'lwc';
import images from '@salesforce/resourceUrl/visualizer_images';

export default class DxVisLoader extends LightningElement {

    sectionLoader = images + '/loading-v2.svg';
}