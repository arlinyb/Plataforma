import { Injectable } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { Observable } from "rxjs";
import { Subject } from "rxjs/Subject";

@Injectable()
export class AlertService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private _router: Router) {
        // clear alert message on route change
        _router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next();
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: message });
        setTimeout(() => this.clear(), 5000);
    }

    error(message: any, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'danger', text: this.translateErrorCode(message)});
        setTimeout(() => this.clear(), 5000);

    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    
    clear() {
        // clear alerts
        this.subject.next();
    }

    translateErrorCode(err) {
        switch (err.code) {
            case "auth/user-disabled":
                return "Este usuario ha sido deshabilitado"
            case "auth/operation-not-allowed":
                return "Operación no permitida"
            case "auth/invalid-email":
                return "Correo electrónico no valido"
            case "auth/wrong-password":
                return "Contraseña incorrecta"
            case "auth/user-not-found":
                return "El usuario no ha sido registrado"
            case "auth/network-error":
                return "Promblema al intentar conectar al servidor"
            case "auth/weak-password":
                return "Contraseña muy debil o no válida"
            case "auth/missing-email":
                return "Hace falta registrar un correo electrónico"
            case "auth/internal-error":
                return "Error interno"
            case "auth/invalid-custom-token":
                return "Token personalizado invalido"
            case "auth/too-many-requests":
                return "Ya se han enviado muchas solicitudes al servidor"
            default:
                return err.message
        }

    }
}