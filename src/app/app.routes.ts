import { Routes } from '@angular/router';
import { IfsBrowserComponent } from './ifs-browser/ifs-browser.component';

export const routes: Routes = [
    { path: '', redirectTo: '/files', pathMatch: 'full' },
    { path: 'files', component: IfsBrowserComponent },
    { path: '**', redirectTo: '/files' }
];
