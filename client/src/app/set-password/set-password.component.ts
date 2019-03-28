import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  
  id: string;
  isInvalidLink: boolean;
  matcher = new MyErrorStateMatcher();
  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, this.validatePassword]), 
    confirmPassword: new FormControl('')
  }, this.checkPasswords);
  errorMessage: string = null;

  constructor(private route: ActivatedRoute, private authService: LoginService, 
    private router: Router) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.authService.validateActivationLink(this.id)
    .then(res => this.isInvalidLink = !res)
    .catch(err => this.isInvalidLink = true);
  }

  checkPasswords(group: FormGroup) { 
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;
    return pass === confirmPass ? null : { notSame: true }; 
  } 

  validatePassword(password: FormControl) {
    if (password.value && password.value.length >= 8 && !(/\s/.test(password.value)) 
    && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
      return null; 
    }
    return { invalid: true }; 
  }

  enableSubmit(): boolean {
    if (this.passwordForm.hasError('notSame') ||
        this.passwordForm.controls.password.hasError('required') ||
        this.passwordForm.controls.password.hasError('invalid')) {
      return false;
    }
    return true;
  }

  setPassword(event) {
    event.preventDefault;
    this.authService.setNewPassword(this.id, this.passwordForm.controls.password.value)
    .then(() => {
      this.errorMessage = null;
      this.router.navigateByUrl('/login');
    })
    .catch(err => this.errorMessage = err.error);
  }

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
    return (invalidCtrl || invalidParent);
  }
}
