import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent implements OnInit {

  leaveRequests: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      this.loading = false;
      this.errorMessage = "No employee ID found in storage.";
      return;
    }

    this.fetchLeave(employeeId);
  }

  async fetchLeave(employeeId: string) {
    try {
      const response = await fetch(`http://localhost:5000/leave/${employeeId}`);
      const result = await response.json();

      this.loading = false;

      if (result.success && result.data.length > 0) {
        this.leaveRequests = result.data.map((item: any) => ({
          Empid: item.Empid,
          Sdate: this.formatDate(item.Sdate),
          Edate: this.formatDate(item.Edate),
          Category: item.Category,
          Descrip: item.Descrip || "N/A",
          Qtype: item.Qtype,
          Qtime: item.Qtime,
          Qstart: this.formatDate(item.Qstart),
          Qend: this.formatDate(item.Qend)
        }));
      } else {
        this.errorMessage = "No leave records found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }

  formatDate(dateStr: string) {
    if (!dateStr) return "N/A";
    return dateStr.split("T")[0]; // returns YYYY-MM-DD
  }

}
