import { LightningElement, api } from 'lwc';

export default class PackageQualityScore extends LightningElement {
    @api percentage = 0;
    progressFixedValue = 0;
    @api size = 'default';
    @api profile = null;

    get getStyle() {
        if (this.profile) {
            return '--progress: 100%';
        } else {
            return '--progress: ' + this.percentage + '%';
        }
    }
    get progressClass() {
        let classes = '' + this.size === 'small' ? 'radial-progress-small' : 'radial-progress' + ' data-progress mt-1 position-relative text-white';
        if (this.profile) {
            // For Load Environment, show colors based on profile
            if (this.profile.toUpperCase() === 'HIGH') {
                classes += ' radial-pbsr-bg-red'; // High profile in red
                this.progressFixedValue = 'HIGH';
            } else if (this.profile.toUpperCase() === 'MEDIUM') {
                classes += ' radial-pbsr-bg-yellow'; // Medium profile in yellow
                this.progressFixedValue = 'MED';
            } else if (this.profile.toUpperCase() === 'LOW') {
                classes += ' radial-pbsr-bg-green'; // Low profile in green
                this.progressFixedValue = 'LOW';
            }
        } else {
            // For other environments, show colors based on percentage
            if (parseInt(this.percentage) < 60) {
                classes += ' radial-pbsr-bg-red';
            } else if (parseInt(this.percentage) >= 60 && parseInt(this.percentage) < 80) {
                classes += ' radial-pbsr-bg-orange';
            } else if (parseInt(this.percentage) >= 80 && parseInt(this.percentage) < 90) {
                classes += ' radial-pbsr-bg-yellow';
            } else if (parseInt(this.percentage) >= 90 && parseInt(this.percentage) <= 100) {
                classes += ' radial-pbsr-bg-green'; // Changed from < 100 to <= 100
            }
            this.progressFixedValue = this.percentage.toString().substring(0, 2) + '%';
        }

        return classes;
    }
}