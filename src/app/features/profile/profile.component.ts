import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  employeeData: any = null;
  loading = true;
  errorMessage = '';

  employeeId: string | null = null;

  ngOnInit() {
    this.employeeId = localStorage.getItem("employeeId");

    if (!this.employeeId) {
      this.errorMessage = "No employee ID found in local storage.";
      this.loading = false;
      return;
    }

    this.fetchProfile(this.employeeId);
  }

  async fetchProfile(employeeId: string) {
    try {
      const response = await fetch(`http://localhost:5000/profile/${employeeId}`);
      const result = await response.json();

      this.loading = false;

      if (result.success) {
        const d = result.data;

        this.employeeData = {
          Pernr: d.Pernr,
          fullName: `${d.Fname} ${d.Lname}`,
          Fname: d.Fname || "N/A",
          Lname: d.Lname || "N/A",

          // Backend already sends Male/Female. If empty -> N/A
          Gender: d.Gender ? d.Gender : "N/A",

          Address: d.Address || "N/A",
          City: d.City || "N/A",
          State: d.State || "N/A",
          Country: d.Country || "N/A",
          Nationality: d.Nationality || "N/A",
          CompanyCode: d.CompanyCode || "N/A",
          CostCenter: d.CostCenter || "N/A",
          JobPosition: d.JobPosition || "N/A",
          Job: d.Job || "N/A"
        };
      } else {
        this.errorMessage = "Employee profile not found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to backend.";
      console.error(error);
    }
  }

}
