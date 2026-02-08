import { LightningElement, api, track } from 'lwc';

export default class DxProgressUtils extends LightningElement {
    @api customGrade = false;
    @api customProgress = false;
    @api customMeter = false;
    @api width = '85px';

    @api grade;
    @track progessPercentage = 0;
    @track progressStyle = '';
    @track activeGradeA = false;
    @track activeGradeB = false;
    @track activeGradeC = false;
    @track activeGradeD = false;

    //Meter params
    @api meterResult;
    @api meterProfile;
    @api meterQualityType;
    //Meter class and styles
    needleClasses = '';
    needleStyles = '';

    connectedCallback() {
        if (this.grade == 'A') {
            this.activeGradeA = true;
        }
        else if (this.grade == 'B') {
            this.activeGradeB = true;
        }
        else if (this.grade == 'C') {
            this.activeGradeC = true;
        }
        else if (this.grade = 'D') {
            this.activeGradeD = 'D'
        }
        //Progress style
        this.progressStyle = "width: " + this.percentage;
        this.needleClass();
    }
    get progressWidth() {
        return `width: ${this.width}`
    }
    get progressClass() {
        let classes = 'bg-gradient data-progress text-nowrap fw-bold';
        if (parseInt(this.percentage) < 60) {
            classes += ' bg-danger text-light';
        }
        else if (parseInt(this.percentage) >= 60 && parseInt(this.percentage) < 80) {
            classes += ' bg-orange-400 text-dark';
        }
        else if (parseInt(this.percentage) >= 80 && parseInt(this.percentage) < 90) {
            classes += ' bg-warning text-dark';
        }
        else if (parseInt(this.percentage) >= 90 && parseInt(this.percentage) <= 100) {
            classes += ' bg-success text-dark';
        }
        return classes;
    }

    @api get percentage() {
        return this.progessPercentage;
    }
    set percentage(value) {
        this.progessPercentage = value?.toString().substring(0, 2) + '%';
    }
    needleClass() {
        this.needleClasses = 'needle ';
        this.needleStyles = '';
        if (this.meterProfile === 'low') {
            this.needleClasses += 'needle1';
            this.needleStyles += 'transform: rotate(25deg)';
        }
        else if (this.meterProfile === 'medium') {
            this.needleClasses += 'needle2';
            this.needleStyles += 'transform: rotate(90deg)';
        }
        else if (this.meterProfile === 'medium') {
            this.needleClasses += 'needle3';
            this.needleStyles += 'transform: rotate(155deg)';
        }

    }

}