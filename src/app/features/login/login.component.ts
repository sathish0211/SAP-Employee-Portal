import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  employeeId = '';
  password = '';
  showPassword = false;

  errorMessage = '';
  loading = false;

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    // SAP Employee ID must be 8 digits → pad with zeros
    const paddedEmployeeId = this.employeeId.padStart(8, '0');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: paddedEmployeeId,
          password: this.password
        })
      });

      const result = await response.json();
      this.loading = false;

      if (result.success) {
        localStorage.setItem("token", "true");
        localStorage.setItem("employeeId", paddedEmployeeId);

        this.router.navigate(['/profile']);
      } else {
        this.errorMessage = result.message || "Invalid Login";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Unable to connect to server";
      console.error(error);
    }
  }
}
