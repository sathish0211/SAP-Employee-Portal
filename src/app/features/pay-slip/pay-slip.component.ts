import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pay-slip',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pay-slip.component.html',
  styleUrls: ['./pay-slip.component.css']
})
export class PaySlipComponent implements OnInit {

  paySlips: any[] = [];
  loading = true;
  errorMessage = '';
  employeeId: string | null = null;

  // Email Field & status message
  emailToSend: string = "";
  emailMessage: string = "";

  ngOnInit() {
    this.employeeId = localStorage.getItem("employeeId");

    if (!this.employeeId) {
      this.loading = false;
      this.errorMessage = "No employee ID found.";
      return;
    }

    this.fetchPaySlip(this.employeeId);
  }

  async fetchPaySlip(employeeId: string) {
    try {
      const response = await fetch(`http://localhost:5000/payslip/${employeeId}`);
      const result = await response.json();

      this.loading = false;

      if (result.success && result.data.length > 0) {
        this.paySlips = result.data;
      } else {
        this.errorMessage = "No PaySlip records found.";
      }

    } catch (err) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(err);
    }
  }

  // --------------------------
  // VIEW PDF (NO DOWNLOAD)
  // --------------------------
  previewPDF() {
    if (!this.employeeId) return;
    const url = `http://localhost:5000/payslip-pdf/${this.employeeId}?mode=preview`;
    window.open(url, "_blank");
  }

  // --------------------------
  // DOWNLOAD PDF
  // --------------------------
  downloadPDF() {
    if (!this.employeeId) return;
    const url = `http://localhost:5000/payslip-pdf/${this.employeeId}?mode=download`;
    window.open(url, "_blank");
  }

  // --------------------------
  // SEND PAYSLIP TO EMAIL
  // --------------------------
  async sendEmail() {
    if (!this.employeeId) {
      this.emailMessage = "Employee ID missing!";
      return;
    }

    if (!this.emailToSend) {
      this.emailMessage = "Please enter an email.";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/send-payslip-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: this.employeeId,
          email: this.emailToSend
        })
      });

      const result = await res.json();

      if (result.success) {
        this.emailMessage = `✔ PaySlip sent to ${this.emailToSend}`;
      } else {
        this.emailMessage = "✖ Failed to send PaySlip.";
      }

    } catch (err) {
      this.emailMessage = "✖ Server error!";
      console.error(err);
    }
  }
}
