import { track, api } from 'lwc';
import LightningModal from 'lightning/modal';
import getScoreDataList from '@salesforce/apex/ToolingAPIHelper.getScoreDataList';


export default class sfdxSandboxCodeSizeModal extends LightningModal {
   // @api content;

   // get modalHeader() {
   //    return `Sandbox Code Size for ${this.content.sandbox} Environment`;
    // }

    @track graphData = []; // To hold the fetched data
    @track isLoading = true; // To manage loading state

    connectedCallback() {
        this.fetchScoreData(); // Fetch data when the modal is opened
    }

    fetchScoreData() {
        getScoreDataList()
            .then((result) => {
                console.log('Result in sfdx:===', result);
                this.graphData = result; // Assign result to graphData
             
            })
            .catch((error) => {
                console.error('Error fetching Data:', error);
            })
    }

       
    get isDataAvailable() {
        return this.graphData && this.graphData.length > 0;
    }

    handleClose() {
        this.close('okay');
    }

}