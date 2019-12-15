import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

interface Configs {
    fieldKey: string;
    fieldParent?: string;
    fieldExpandable?: string;
}

@Component({
  selector: 'rb-treeview',
  templateUrl: './rbtreeview.component.html',
  styleUrls: ['./rbtreeview.component.scss']
})

export class RBTreeviewComponent implements OnInit, OnChanges {
    @Input() dataSource: Observable<any>;
    @Input() configs: Configs = null;
    @Output() clickedRow = new EventEmitter<any>();

    dataSourceItems: any[] = [];
    fieldParent: string = null;
    fieldKey: string = null;
    fieldExpandable: string = null;
    nivel = 1;
    order = 0;

    constructor() { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.fieldParent = this.configs.fieldParent;
        this.fieldKey = this.configs.fieldKey;
        this.fieldExpandable = this.configs.fieldExpandable;

        if (changes['dataSource'] && this.dataSource) {
            if (this.fieldParent !== null && this.fieldKey !== null) {
                if (this.dataSourceItems.length > 0) {
                    this.nivel = 1;
                }
                this.dataSourceItems = this.createHierarchy(changes['dataSource'].currentValue);
            } else {
                this.dataSourceItems = changes['dataSource'].currentValue;
            }
        }
    }
    createHierarchy(dataSource: any[]): any[] {
        dataSource.forEach(row => {
            row.items = [];
            dataSource.filter(r => r[this.fieldParent] == row[this.fieldKey]).forEach(child => {
                row.items.push(child);
            });
        });

        this.setNivelHierarchy(dataSource.filter(r => r[this.fieldParent] === undefined || r[this.fieldParent] === null));
        this.setOrderHierarchy(dataSource.filter(r => r[this.fieldParent] === undefined || r[this.fieldParent] === null));
        return dataSource.filter(r => r.nivelHierarchy === 1);
    }

    setNivelHierarchy(dataSource: any[], itemParent?: any) {
        if (itemParent) {
            this.nivel = itemParent.nivelHierarchy + 1;
        }

        dataSource.forEach(row => {
            row.nivelHierarchy = this.nivel;
        });

        dataSource.forEach(row => {
            if (row.items.length > 0) {
                this.setNivelHierarchy(row.items, row);
            }
        });
    }

    setOrderHierarchy(dataSource: any[]) {
        dataSource.forEach(row => {
            this.order += 1;
            row.order = this.order;
            if (row.items.length > 0) {
                this.setOrderHierarchy(row.items);
            }
        });
    }

    expandItems(row: any) {
        row.nodeOpen = true;
        if (row.items.length > 0) {
            this.dataSourceItems.push(...row.items);
        }

    }

    collapseItems(row: any) {
        row.nodeOpen = false;
        row.items.forEach(i => {
            this.dataSourceItems.filter(x => x[this.fieldParent] == row[this.fieldKey]).forEach(
                i => {
                    this.dataSourceItems.splice(this.dataSourceItems.indexOf(i), 1);
                    if (i.items.length > 0) {
                        this.collapseItems(i);
                    }
                }
            )
        })
    }

    get dataSourceItemsOrder() {
        return this.dataSourceItems.sort((a, b) => {
            return a.order < b.order ? -1 : a.order > b.order ? 1 : 0;
        })
    }

    trackId(index, item) {
        if (!item) {
            return null;
        } else {
            return this.fieldKey;
        }
    }

    controlOptions(type: string, row: any): boolean {
        if (type === "E") {
            if (row.items && row.items.length > 0 && !row.nodeOpen) {
                return true;
            } else {
                return false;
            }
        } else if (type === "C") {
            if (row.items && row.items.length > 0 && row.nodeOpen) {
                return true;
            } else {
                return false;
            }
        } else if (type === "S") {
            if (row[this.fieldParent] !== undefined) {
                return true;
            } else {
                return false;
            }

        }
    }

    hierachyStyle(row: any): any {
        let marginHierarchy: number = (20 * row.nivelHierarchy) - 20;
        return { 'margin-left': `${marginHierarchy}px` };
    }

    clickRow(row: any, emit: boolean) {
        if (!row.clicked && emit) {
            this.clickedRow.emit(row);
        }

        this.dataSourceItems.map(x => x.clicked = false);
        row.clicked = !row.clicked;
    }
}