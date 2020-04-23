import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})
export class LoginComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder,
        private authService: AuthService,
        private router: Router) {

        this.form = this.fb.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onLoginClick() {
        const val = this.form.value;

        if (val.name && val.email && val.password) {
            this.authService.login(val.name, val.email, val.password)
                .subscribe(
                    () => {
                        console.log('User is logged in');
                        alert('User is logged in');
                        this.router.navigateByUrl('/');
                    },
                    (error) => {
                        console.log('Login error = ', error);
                        alert('Login error : ' + JSON.stringify(error));
                      }
                    );
        }
    }

    onLogoutClick() {
        this.authService.logout();
    }


    onRegisterClick() {
        const val = this.form.value;

        if (val.name && val.email && val.password) {
            this.authService.register(val.name, val.email, val.password)
                .subscribe(
                    () => {
                        console.log('User is registered');
                        alert('User is registered');
                        this.router.navigateByUrl('/');
                    },
                    (error) => {
                        console.log('Registration error = ', error);
                        alert('Registration error : ' + JSON.stringify(error));
                      }
                    );
        }
    }
}
