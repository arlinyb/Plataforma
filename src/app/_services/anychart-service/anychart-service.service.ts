/// <reference types="anychart" />
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import 'anychart';

@Injectable()
export class AnychartServiceService {

    /*
      Parent-children communicate via a service is used.
      https://angular.io/guide/component-interaction#parent-and-children-communicate-via-a-service
     */

    // Observable string stream
    private dataSetChangeSource = new Subject<string>();

    // Observable string stream
    dataSetChanged$ = this.dataSetChangeSource.asObservable();

    private data_: Array<Object> = [
        { customName: 'January', customValue1: 10000, customValue2: 9000, customValue3: 7000 },
        { customName: 'February', customValue1: 12000, customValue2: 12000, customValue3: 12070 },
        { customName: 'March', customValue1: 18000, customValue2: 18000, customValue3: 15000 },
        { customName: 'April', customValue1: 11000, customValue2: 12000, customValue3: 17000 },
        { customName: 'May', customValue1: 9000, customValue2: 10000, customValue3: 25000 }

    ];

    private dataSet_: anychart.data.Set = anychart.data.set(this.data_);

    private mappings_: { [key: string]: anychart.data.View } = {
        'data1': this.dataSet_.mapAs({ x: ['customName'], value: ['customValue1'] }),
        'data2': this.dataSet_.mapAs({ x: ['customName'], value: ['customValue2'] }),
        'data3': this.dataSet_.mapAs({ x: ['customName'], value: ['customValue3'] })
    };


    public getDataList() {
        let res: Array<string> = [];


        for (let key in this.mappings_) {

            res.push(key);
        }
        return res;
    }

    public getData(key: string = 'data1') {
        return this.mappings_[key];
    }


    public setCurrentDataSet(key: string = 'data1') {
        this.dataSetChangeSource.next(key);
    }

}
