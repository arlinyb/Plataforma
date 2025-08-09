import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {

    transform(value: number): any {
        if (value == 0) {
            return 0;
        }
        else {
            // hundreds
            if (value <= 999) {
                return value;
            }
            // thousands
            else if (value >= 1000 && value <= 999999) {
                return (Math.round((value / 1000) * 10) / 10) + 'K';
            }
            // millions
            else if (value >= 1000000 && value <= 999999999) {
                return (Math.round((value / 1000000) * 10) / 10) + 'M';
            }
            // billions
            else if (value >= 1000000000 && value <= 999999999999) {
                return (Math.round((value / 1000000000) * 10) / 10) + 'B';
            }
            else
                return value;
        }
    }

}
