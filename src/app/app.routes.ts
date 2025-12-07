import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LeaveRequestComponent } from './features/leave-request/leave-request.component';

import { PaySlipComponent } from './features/pay-slip/pay-slip.component';


import { AuthGuard } from './auth.guard';


export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],     // 🛑 Protect all inside
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'leave-request', component: LeaveRequestComponent },

      { path: 'pay-slip', component: PaySlipComponent },
      
      
    ]
  },

  { path: '**', redirectTo: 'login' }
];
