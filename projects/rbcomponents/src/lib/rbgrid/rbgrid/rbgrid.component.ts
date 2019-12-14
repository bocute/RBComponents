import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrencyPipe, PercentPipe } from '@angular/common';

interface ColumnDefs {
    headerName: string;
    field: string;
    type: string;
    editable: boolean;
    order: number;
    pipe?: string;
}

interface Configs {
    fieldKey: string;
    editable: boolean;
    fieldParent?: string;
    fieldExpandable?: string;
    classIconExpand?: string;
    classIconCollapse?: string;
    classIconEdit?: string;
    classIconCancel?: string;
    classIconSave?: string;
}

@Component({
  selector: 'rb-grid',
  templateUrl: './rbgrid.component.html',
  styleUrls: ['./rbgrid.component.scss'],
  providers: [CurrencyPipe, PercentPipe]
})
export class RBGridComponent implements OnInit {

    @Input() columnDefs: ColumnDefs[] = [];
    @Input() dataSource: Observable<any>;
    @Input() configs: Configs = null;
    @Input() selectRow: Observable<any>;
    @Input() styleRow: any;
    @Output() clickedRow = new EventEmitter<any>();
    @Output() changedValue = new EventEmitter<any>();
    @Output() cancelEdit = new EventEmitter<any>();
    @Output() saveEdit = new EventEmitter<any>();

    items: any[] = [];
    dataSourceItems: any[] = [];
    dataSourceBkp: any[] = [];
    nivel = 1;
    order = 0;
    fieldParent: string = null;
    fieldKey: string = null;
    editable: boolean = false;
    fieldExpandable: string = null;

    constructor(private currencyPipe: CurrencyPipe,
        private percentPipe: PercentPipe) { }

    ngOnInit() {
    }


    ngOnChanges(changes): void {
        this.fieldParent = this.configs.fieldParent;
        this.fieldKey = this.configs.fieldKey;
        this.fieldExpandable = this.configs.fieldExpandable;
        if (!this.configs.classIconEdit || !this.configs.classIconSave || !this.configs.classIconCancel) {
            this.editable = false;
        } else {
            this.editable = this.configs.editable;
        }

        if (changes['dataSource'] && this.dataSource) {
            if (this.fieldParent !== null && this.fieldKey !== null) {
                if (this.dataSourceItems.length > 0) {
                    this.nivel = 1;
                }
                this.dataSourceItems = this.createHierarchy(changes['dataSource'].currentValue);
            } else {
                this.dataSourceItems = changes['dataSource'].currentValue;
            }
            if (this.fieldKey === null) {
                this.editable = false;
            }
        }

        if (changes['selectRow'] && this.selectRow) {
            let row = this.dataSourceItems.find(r => r[this.fieldKey] === changes['selectRow'].currentValue[this.fieldKey]);

            if (row) {
                this.clickRow(row, false);
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

     controlOptions(type: string, row: any, column: any): boolean {
        if (type === "E") {
            if (row.items && row.items.length > 0 && column.field == this.fieldExpandable && !row.nodeOpen) {
                return true;
            } else {
                return false;
            }
        } else if (type === "C") {
            if (row.items && row.items.length > 0 && column.field == this.fieldExpandable && row.nodeOpen) {
                return true;
            } else {
                return false;
            }
        } else if (type === "S") {
            if (row[this.fieldParent] !== undefined && column.field == this.fieldExpandable) {
                return true;
            } else {
                return false;
            }
        } else if (type === "U") {
            if (row.editable && column.editable) {
                return true;
            } else {
                return false;
            }
        } else if (type === "T") {
            if (!row.editable || !column.editable) {
                return true;
            } else {
                return false;
            }
        }
    }

     clickRow(row: any, emit: boolean) {
        if (!row.clicked && emit) {
            this.clickedRow.emit(row);
        }

        this.dataSourceItems.map(x => x.clicked = false);
        row.clicked = !row.clicked;
    }

     applyPipe(type: any, pipe: any, value: any) {
        if (type === "number") {
            if (pipe && pipe === "currency") {
                return this.currencyPipe.transform(value, "BRL", "R$",null,"pt-BR");
            } else if (pipe && pipe === "percent") {
                return this.percentPipe.transform(value / 100, "1.2-2", "pt-BR");
            }
        }
        
        return value;
    }

     editRow(row: any) {
        if (this.editable) {
            this.closeRow(this.dataSourceItemsOrder);
            row.editable = true;
            this.dataSourceBkp = JSON.parse(JSON.stringify(this.dataSourceItems));
        }
    }

    closeRow(dataSource: any) {
        dataSource.forEach(row => {
            if (row.editable == true){
                row.editable = false;
                this.cancelEditRow(row);
            } else if (row.items) {
                this.closeRow(row.items)
            }
        });
    }

     cancelEditRow(row: any) {
        if (this.editable) {
            let indexRow = this.dataSourceItems.indexOf(row);
            let indexBkp = this.dataSourceBkp.findIndex(x => x[this.fieldKey] === row[this.fieldKey]);

            row.editable = false;
            this.dataSourceBkp[indexBkp]['editable'] = false;

            Object.keys(this.dataSourceItems[indexRow]).forEach(x => {
                Object.keys(this.dataSourceBkp[indexBkp]).filter(z => z == x).forEach(w => {
                    this.dataSourceItems[indexRow][x] = this.dataSourceBkp[indexBkp][w];
                });
            });

            this.cancelEdit.emit(this.dataSourceBkp[indexBkp]);
        }
    }

     saveRow(row: any) {
        if (this.editable) {
            row.editable = false;

            this.saveEdit.emit(row);
        }
    }

     updateValue(row: any, columnField: any, value: any) {
        if (this.editable) {
            let indexUpdated = this.dataSourceItems.findIndex(x => x[this.fieldKey] === row[this.fieldKey]);
            Object.keys(this.dataSourceItems[indexUpdated]).filter(w => w === columnField).forEach(x => {
                this.dataSourceItems[indexUpdated][x] = value;
            });
        }
    }

     changeValue(row: any, columnField: any, value: any) {
        if (this.editable) {
            this.changedValue.emit(
                {
                    field: columnField,
                    oldValue: row[columnField],
                    newValue: value,
                    oldRow: row
                }
            );
        }
    }

     typeInput(columnType: any): string {
        if (columnType !== "text" && columnType !== "number") {
            return "text";
        } else {
            return columnType;
        }
    }

     hierachyStyle(row: any): any {
        let marginHierarchy: number = (20 * row.nivelHierarchy) - 20;
        return { 'margin-left': `${marginHierarchy}px` };
    }

    trackId(index, item) {
        if (!item) {
            return null;
        } else {
            return this.fieldKey;
        }
    }

    trackIdColumn(index, item) {
        if (!item) {
            return null;
        } else {
            return item.field;
        }
    }

    drag(e) {
        e.dataTransfer.setData("text", e.target.id);
    }

    allowDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    drop(e) {
        e.preventDefault();
        let data = e.dataTransfer.getData("text");
        let orderOrig = this.columnDefs.find(x => x.field === data).order;
        let orderDest = this.columnDefs.find(x => x.field === e.target.id).order;

        if (orderOrig > orderDest) {
            this.columnDefs.filter(x => x.order >= orderDest && x.field !== data).forEach(item => {
                item.order += 1;
            })
        } else {
            this.columnDefs.filter(x => x.order <= orderDest && x.field !== data).forEach(item => {
                item.order -= 1;
            })
        }

        this.columnDefs.find(x => x.field === data).order = orderDest;
    }

    get getColumnDefsOrder() {
        return this.columnDefs.sort((a, b) => {
            return a.order < b.order ? -1 : a.order > b.order ? 1 : 0;
        })
    }

     styleRowReturn(row: any) {
        if (this.styleRow && this.styleRow.row && row[this.fieldKey] === this.styleRow.row[this.fieldKey]) {
            return this.styleRow.style;
        }
        return null;
    }
}