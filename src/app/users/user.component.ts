import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../sec/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from './user.model';
import { UserDialogComponent } from './user-dialog-modal.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent {

    private fromUser: User;

    constructor(public dialog: MatDialog, private authService: AuthService, private router: Router) {
        this.fromUser = new User('', '', '');
    }

    /**
     * Handler for click on the Login button.
     */
    public onLoginClick() {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '400px',
            height: '400px',
            backdropClass: 'custom-dialog-backdrop-class',
            panelClass: 'custom-dialog-panel-class',
            disableClose: true,
            autoFocus: true,
            data: { isLogin: true, user: this.fromUser }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The User Login dialog was closed', result);
            // If the dialog send a result (i.e. a user) we post it to the backend
            if (typeof result !== 'undefined') {
                this.fromUser = result;
                this.authService.login(this.fromUser).subscribe(
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
        });
    }

    /**
     * Handler for click on the Logout button.
     */
    public onLogoutClick() {
        this.authService.logout();
        alert('User is logged out');
    }

    /**
     * Handler for click on the Register button.
     */
    public onRegisterClick() {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '400px',
            height: '400px',
            backdropClass: 'custom-dialog-backdrop-class',
            panelClass: 'custom-dialog-panel-class',
            disableClose: true,
            autoFocus: true,
            data: { isLogin: false, user: this.fromUser }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The edit dialog was closed', result);
            // If the dialog send a result (i.e. a user) we post it to the backend
            if (typeof result !== 'undefined') {
                this.fromUser = result;
                this.authService.register(this.fromUser).subscribe(
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
        });
    }

    public isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    public isLoggedOut(): boolean {
        return this.authService.isLoggedOut();
    }
}
