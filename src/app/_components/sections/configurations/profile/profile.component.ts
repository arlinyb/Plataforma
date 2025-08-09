import { Component, OnInit } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { UserService } from '../../../auth/core/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";

import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';


@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ['profile.component.css',"../../sections.component.css"],
})
export class ProfileComponent implements OnInit {

    user: any;
    profileForm: FormGroup;
    configForm: FormGroup;
    loading = false;

    constructor(
        private toastr: ToastrService,
        private _script: ScriptLoaderService,
        public userService: UserService,
        private fb: FormBuilder,
        private _router: Router,
    ) {

    }



    ngOnInit(): void {
        this._script.loadScripts('body', [
            'assets/vendors/base/vendors.bundle.js',
            'assets/template/base/scripts.bundle.js'], true).then(() => {
                Helpers.setLoading(false);
            });

        this.user = { "name": environment.user.name, "email": environment.user.email , "image":environment.user.image}
       // console.log(this.user);
        this.profileForm = this.user;
        this.createForm(this.user.name);
        this.profileForm.setValue({ name: this.user.name, email: this.user.email });
        this.configForm = this.fb.group({
            pass: ["", Validators.required],
            delete: ["", Validators.required]
        });



    }

    createForm(data) {
        this.profileForm = this.fb.group({
            name: [data.name, Validators.required],
            email: [data.email, Validators.required]
        });


    }


    /*Update Profile*/


    updateProfile(value) {

        this.loading = true;


        this.userService.updateCurrentUser(value)
            .then(res => {
                this.loading = false;
                setTimeout(function () { $("#header-menu-id").click(); }, 50);
                this.toastr.success('Los datos de usuario han sido actualizados', 'Información de Usuario');
                setTimeout(function () { location.reload(); }, 1000);

            }, err => {
                this.loading = false;
                setTimeout(function () { $("#header-menu-id").click() }, 50);
                this.toastr.error(this.translateErrorCodes(err), 'Error');
            })

    }


    updateUserPassword(value) {
        this.loading = true;

        if (value.length > 6) {
            this.userService.updateCurrentUserPassword(value)
                .then(res => {
                    setTimeout(function () { $("#header-menu-id").click(); }, 50);
                    this.toastr.success('La contraseña ha sido cambiada exitosamente', 'Cambio Constraseña');
                    this.loading = false;
                }, err => {
                    console.log(err);
                    setTimeout(function () { $("#header-menu-id").click(); }, 50);
                    this.toastr.error(this.translateErrorCodes(err), 'Error');
                    this.loading = false;
                })
        } else {
            setTimeout(function () { $("#header-menu-id").click(); }, 50);
            this.toastr.warning('La contraseña debe ser mayor a 6 caracteres', 'Cambio Constraseña');
            this.loading = false;
        }

    }




    /*Delete Profile*/


    deleteProfile(value) {

        this.loading = true;
        if (this.user.email == value) {
            this.userService.deleteCurrentUser()
                .then(res => {
                    this.loading = false;
                    setTimeout(function () { $("#header-menu-id").click(); }, 50);
                    this.toastr.success('La cuenta ha sido suspendida', 'Suspender Cuenta');
                    this._router.navigate(['/login']);
                    //console.log(res);
                }, err => {
                    this.loading = false;

                    setTimeout(function () { $("#header-menu-id").click(); }, 50);
                    this.toastr.error(this.translateErrorCodes(err), 'Error');
                    console.log(err)
                })

        } else {
            this.loading = false;

            setTimeout(function () { $("#header-menu-id").click(); }, 50);
            this.toastr.warning('El valor indicado no corresponde al de la cuenta', 'Suspender Cuenta');
        }


    }


    translateErrorCodes(err) {
        switch (err.code) {
            case "auth/requires-recent-login":
                return "Esta es una operación sensible y requiere que el usuario reinicie la sesión"
            case "auth/invalid-email":
                return "Correo electrónico no valido"
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
            default:
                return err.message
        }
    }




}
