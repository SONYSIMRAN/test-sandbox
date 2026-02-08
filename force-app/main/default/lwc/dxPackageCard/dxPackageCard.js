import { LightningElement, api, track } from 'lwc';
import images from '@salesforce/resourceUrl/visualizer_images';
import { NavigationMixin } from 'lightning/navigation';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import DxVisPackageCompareModal from 'c/dxVisPackageCompareModal';
import DxVisInstalledPackageModal from 'c/dxVisInstalledPackageModal';



export default class DxPackageCard extends NavigationMixin(LightningElement) {
    //Header Config
    iconGearAnimated = images + '/gear-animated.svg';
    iconGearNormal = images + '/gear-normal.svg';
    iconDeltaUp = images + '/delta-up.svg';
    iconDeltaDown = images + '/delta-down.svg';
    iconDeltaSteady = images + '/delta-steady.svg';
    packageObject;
    @api get item() { return this.packageObject };
    set item(value) { this.packageObject = value };
    @track getCurrentID;
    selectedCard;
    //Details
    customGrade = true;
    customProgress = true;
    isLoading = true;
    //CQ Status
    progress = false;
    degrade = false;
    steady = false;
    loadingGear = false;
    @api selectCard = null;
    get activeCardClass() {
        let cardClass = 'card-box';
        if (this.selectCard === this.item.packageName) {
            cardClass += ' click-state';
        }
        return cardClass;
    }
    //card Colors
    colorMap = {
        'yes': 'background: #f1736b',
        'no': 'background: #65bf78',
        'na': 'background: #6c757d'
    };
    cardColor;
    //Infor page
    navigateToInfoPage(event) {
        console.log('Detail', 'sandbox= ', event.currentTarget.dataset.sandbox, 'packageName= ', event.currentTarget.dataset.package);
        let comInfo = {
            componentDef: "c:dxPackageInfo",
            attributes: {
                package: event.currentTarget.dataset.package,
                sandbox: event.currentTarget.dataset.sandbox,
                color: event.currentTarget.dataset.color,
                activeTab: event.currentTarget.dataset.tabname,
            }
        }
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            },
            state: {
                attributes: {
                    package: event.currentTarget.dataset.package,
                    sandbox: event.currentTarget.dataset.sandbox,
                    color: event.currentTarget.dataset.color,
                    activeTab: event.currentTarget.dataset.tabname,
                }
            }
        })
    }
    //Pckage click progress
    renderedCallback() {
        this.cardColor = this.colorMap[this.item.IsOrgDependent ? 'yes': 'no'];
    }

    packageCardClick(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('selectcard', { detail: event.currentTarget.dataset.package }));
        this.getCQProgress(event);
    }
    preventParentClick(event) {
        event.stopPropagation();
    }

    //Get CQ progress
    getCQProgress(event) {
        // console.log('get-cq-progress', 'sandbox= ', event.currentTarget.dataset.sandbox, 'packageName= ', event.currentTarget.dataset.package);
        this.loadingGear = true;
        apiService({
            request: 'GET',
            apiName: 'get-cq-progress',
            apiParams: serializeParams({
                sandbox: event.currentTarget.dataset.sandbox,
                packageName: event.currentTarget.dataset.package,
                cqName: 'summary_total'
            })
        }).then(response => {
            console.log("response", response);
            //Delta logic
            if (response.score === 'degrade') {
                this.degrade = true;
            }
            else if (response.score === 'progress') {
                this.progress = true;
            }
            else if (response.score === 'steady') {
                this.steady = true;
            }
            this.loadingGear = false;
        }).catch(error => {
            console.error(error);
            this.loadingGear = false;
        })
    }

    //handle package compare modal
    async handlePackageCompare(event) {
        const result = await DxVisPackageCompareModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: 'Package Compare',
            content: {
                sandbox: this.item.sandbox,
                packageName: this.item.packageName,
                color: this.cardColor,
                uname: this.item.uname,
            }
        });
    }
    async handleInstalledPackageDetails() {
            const result = await DxVisInstalledPackageModal.open({
                // `label` is not included here in this example.
                // it is set on lightning-modal-header instead
                size: 'large',
                description: this.item.packageName,
                content: {
                    packageName: this.item.packageName,
                    id: this.item.id
                }
            });
            // if modal closed with X button, promise returns result = 'undefined'
            // if modal closed with OK button, promise returns result = 'okay'
            console.log(result);
    }
}