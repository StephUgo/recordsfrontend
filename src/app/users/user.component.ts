import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../sec/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from './user.model';
import { UserDialogComponent } from './user-dialog-modal.component';
import { ProfileDialogComponent } from './updateprofile-dialog.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent {

    private fromUser: User;
    private dialogRef: MatDialogRef<UserDialogComponent> | null = null;
    private profileDialogRef: MatDialogRef<ProfileDialogComponent> | null = null;

    constructor(public dialog: MatDialog, private authService: AuthService, private router: Router) {
        this.fromUser = new User('', '', '');
    }

    /**
     * Handler for click on the Login button.
     */
    onLoginClick() {
        if (this.dialogRef !== null) { return; }
        this.dialogRef = this.dialog.open(UserDialogComponent, {
            width: '400px',
            height: '400px',
            backdropClass: 'custom-dialog-backdrop-class',
            panelClass: 'custom-dialog-panel-class',
            disableClose: false,
            autoFocus: true,
            data: { isLogin: true, user: this.fromUser }
        });

        this.dialogRef.afterClosed().subscribe(result => {
            console.log('The User Login dialog was closed', result);
            // If the dialog send a result (i.e. a user) we post it to the backend
            if (result !== undefined) {
                this.fromUser = result;
                this.authService.login(this.fromUser).subscribe(
                    () => {
                        console.log('User is logged in');
                        alert('User is logged in');
                        this.router.navigateByUrl('/');
                    },
                    (errorResponse) => {
                        console.log('Login error = ', errorResponse);
                        alert('Login error : ' + errorResponse.error);
                    }
                );
            }
            this.dialogRef = null;
        });
    }

    /**
     * Handler for click on the Logout button.
     */
    onLogoutClick() {
        this.authService.logout();
        alert('User is logged out');
    }

    /**
     * Handler for click on the Register button.
     */
    onRegisterClick() {
        if (this.dialogRef !== null) { return; }
        this.dialogRef = this.dialog.open(UserDialogComponent, {
            width: '400px',
            height: '400px',
            backdropClass: 'custom-dialog-backdrop-class',
            panelClass: 'custom-dialog-panel-class',
            disableClose: false,
            autoFocus: true,
            data: { isLogin: false, user: this.fromUser }
        });

        this.dialogRef.afterClosed().subscribe(result => {
            console.log('The edit dialog was closed', result);
            // If the dialog send a result (i.e. a user) we post it to the backend
            if (result !== undefined) {
                this.fromUser = result;
                this.authService.register(this.fromUser).subscribe(
                    () => {
                        console.log('User is registered');
                        alert('User is registered');
                        this.router.navigateByUrl('/');
                    },
                    (errorResponse) => {
                        console.log('Registration error = ', errorResponse);
                        alert('Registration error : ' + errorResponse.error);
                    }
                );
            }
            this.dialogRef = null;
        });
    }

    /**
     * Handler for click on the Update button.
     */
    onUpdateClick() {
        if (this.profileDialogRef !== null) { return; }
        this.profileDialogRef = this.dialog.open(ProfileDialogComponent, {
            width: '400px',
            height: '400px',
            backdropClass: 'custom-dialog-backdrop-class',
            panelClass: 'custom-dialog-panel-class',
            disableClose: false,
            autoFocus: true,
            data: { user: this.fromUser }
        });

        this.profileDialogRef.afterClosed().subscribe(result => {
            // If the dialog send a result (i.e. a password) we post it to the backend (with the user)
            if (result !== undefined) {
                this.authService.updatepwd(this.fromUser, result).subscribe(
                    () => {
                        console.log('New password updated for user :' + this.fromUser.name);
                        alert('New password updated for user :' + this.fromUser.name);
                        this.fromUser.password = result;
                    },
                    (errorResponse) => {
                        console.log('New password update error = ', errorResponse);
                        alert('New password update error : ' + errorResponse.error);
                    }
                );
            }
            this.profileDialogRef = null;
        });
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    isLoggedOut(): boolean {
        return this.authService.isLoggedOut();
    }
}
