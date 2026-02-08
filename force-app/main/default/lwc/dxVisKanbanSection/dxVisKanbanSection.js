import { LightningElement, api, track } from 'lwc';

export default class DxVisKanbanSection extends LightningElement {
    @api sectionHeader;
    @api sectionData;

        //Classes
        get sectionClass() {
            let className = 'kanban-col ';
            className += 'b-' + this.COL_MAP[this.sectionHeader];
            return className;
        }
        get cardHeader() {
            let className = 'kanban-header center-content ';
            className += this.COL_MAP[this.sectionHeader];
            return className;
        }
}