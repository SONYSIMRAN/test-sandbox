import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DxPackage extends NavigationMixin(LightningElement) {
    packageList;
    packageName;
    @track cardId;
    @track activeCard;
    @api sfUser = false;

    @api get packages() { return this.packageList }
    set packages(value) { this.packageList = value }


    renderedCallback() {
        // console.log('packages = ', this.packages, this.packageList);
        localStorage.setItem('activeIndex', false);
    }
    removeActiveCard = () => {
        this.activeCard = null;
    }
    connectedCallback() {
        console.log('sfuser=', this.sfUser);
        document.addEventListener('click', this.removeActiveCard, false);
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.removeActiveCard, false);
    }
    selectCard(event) {
        this.activeCard = event.detail;
    }
}