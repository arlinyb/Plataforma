import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
    name: 'timeAgoTimestamp'
})
export class TimeAgoTimestampPipe implements PipeTransform {
    private timer: number;
    constructor() { }
    transform(value: string) {

        if (value != undefined) {


            let d = new Date(value.replace(/ /g, "T"));
            let utc = d.getTime() + (d.getTimezoneOffset() * -60000);//Timezone Offset
            d = new Date(utc);

            let now = new Date();
            let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));

            let minutes = Math.round(Math.abs(seconds / 60));
            let hours = Math.round(Math.abs(minutes / 60));
            let days = Math.round(Math.abs(hours / 24));

            if (seconds <= 45) {
                return 'hace pocos segundos';
            } else if (seconds <= 90) {
                return 'hace un minuto';
            } else if (minutes <= 45) {
                return 'hace ' + minutes + ' minutos ';
            } else if (minutes <= 90) {
                return 'hace una hora';
            } else if (hours <= 22) {
                return 'hace ' + hours + ' horas ';
            } else if (hours <= 36) {
                return 'hace un día';
            } else if (days <= 5) {
                return 'hace ' + days + ' días ';
            } else if (days <= 345) {
                let options = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                return d.toLocaleDateString("es-ES", options);
            } else {
                let options = { year: 'numeric', weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                return d.toLocaleDateString("es-ES", options);
            }

        }
    }
}