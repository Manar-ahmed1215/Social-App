import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { FeedComponent } from './features/feed/feed.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';
import { PostDetailsComponent } from './features/post-details/post-details.component';
import { ProfileUserComponent } from './features/profile-user/profile-user/profile-user.component';
import { SuggestionComponent } from './features/suggestion/suggestion.component';

export const routes: Routes = [
    {path:'' , redirectTo:'login' , pathMatch:'full'},
    {path: '' , component: AuthLayoutComponent , 
        canActivate:[guestGuard],
        children:[
        {path:'login' , component: LoginComponent , title:'Login Page'},
        {path:'register' , component: RegisterComponent , title:'Register Page'},
    ]},
    {path:'' , component: MainLayoutComponent , 
        canActivate:[authGuard],
        children:[
        {path: 'feed' , component: FeedComponent , title:'Feed Page' },
        {path:'profile' , component: ProfileComponent , title:'Profile Page'},
        {path: 'notification', component: NotificationsComponent , title:'Notifications Page'},
        {path: 'suggestions', component: SuggestionComponent , title:'Suggestions Friends Page'},
        {path: 'change' , component: ChangePasswordComponent , title:'Change Password Page'},
        {path: 'details/:id' , component: PostDetailsComponent , title:'Details Page'},
        {path: 'profile/:id' , component: ProfileUserComponent , title:'Profile User Page'}
    ]},
    {path:'**' , component:NotFoundComponent , title:'Not Found Page'}
];
